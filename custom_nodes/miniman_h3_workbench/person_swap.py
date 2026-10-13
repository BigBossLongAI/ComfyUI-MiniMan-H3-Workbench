import json

import folder_paths
from comfy_execution.graph_utils import GraphBuilder

from .graph import DEFAULTS, THIRD_LORAS


SWAP_DEFAULTS = DEFAULTS | {
    "first_model": "minimax_h3_ref2va_bf16.safetensors",
    "third_model": DEFAULTS["third_model"],
    "clip_name": "qwen3vl_32b_minimax_h3_bf16.safetensors",
    "video_vae": "minimax_h3_video_vae_fp16.safetensors",
    "first_steps": 8, "second_steps": 4, "third_steps": 3, "first_mp": 0.4, "second_mp": 1.0, "third_mp": 2.0,
    "seed": 9876543210,
    "sam_model": "sam3.1_multiplex_fp16.safetensors",
    "lora_swap": "minimax_h3_ref2v_turbo_4step_v0.1_comfyui_bf16.safetensors",
    "strength_swap": 1.0, "filename_prefix": "video/FastH3_simple_swap",
}


def build_person_swap_graph(display_id=None, **settings):
    p = SWAP_DEFAULTS | settings
    files = json.loads(p["reference_files"]) if isinstance(p["reference_files"], str) else p["reference_files"]
    pictures = [name for name in files.get("images", []) if name]
    videos = [item for item in files.get("videos", []) if item and item["file"]]
    if not pictures or not videos:
        raise ValueError("请上传参考视频和一张人物参考图")
    image_name, video_name = pictures[0], videos[0]["file"]
    folder_paths.get_annotated_filepath(image_name)
    folder_paths.get_annotated_filepath(video_name)
    graph = GraphBuilder()

    def node(kind, name, **inputs):
        result = graph.node(kind, name, **inputs)
        if display_id is not None:
            result.set_override_display_id(display_id)
        return result

    source = node("VHS_LoadVideo", "source_video", video=video_name, force_rate=24.0,
                  custom_width=0, custom_height=0, frame_load_cap=0,
                  skip_first_frames=0, select_every_nth=1, format="None")
    picture = node("LoadImage", "reference_image", image=image_name).out(0)
    sam = node("CheckpointLoaderSimple", "sam", ckpt_name=p["sam_model"])
    person = node("CLIPTextEncode", "person", clip=sam.out(1), text="person").out(0)
    mask = node("SAM3_Detect", "person_mask", model=sam.out(0), image=source.out(0),
                conditioning=person, threshold=0.5, refine_iterations=2, individual_masks=False).out(0)
    inverted = node("ImageInvert", "invert", image=source.out(0)).out(0)
    masked = node("ImageCompositeMasked", "masked_video", destination=source.out(0),
                  source=inverted, mask=mask, x=0, y=0, resize_source=False).out(0)
    reference = node("ImageScaleToTotalPixels", "reference_size", image=masked,
                     upscale_method="area", megapixels=p["first_mp"], resolution_steps=32).out(0)
    vae = node("VAELoader", "video_vae", vae_name=p["video_vae"]).out(0)
    audio_vae = node("VAELoader", "audio_vae", vae_name=p["audio_vae"]).out(0)
    clip = node("CLIPLoader", "clip", clip_name=p["clip_name"], type="minimax", device="default").out(0)
    size = node("GetImageSize", "resolution", image=reference)
    encode = node("MiniManH3ReferenceEncode", "encode", clip=clip, vae=vae, audio_vae=audio_vae,
                  prompt=p["prompt"], width=size.out(0), height=size.out(1), length=source.out(1),
                  ref_image_size="match", **{"ref_images.ref_image_0": picture, "ref_videos.ref_video_0": reference})
    def load_model(stage):
        model_name = p["third_model"] if stage == "third" else p["first_model"]
        model = node("UNETLoader", f"{stage}_model", unet_name=model_name, weight_dtype="default").out(0)
        loras = THIRD_LORAS if stage == "third" else [("swap", p["lora_swap"], p["strength_swap"])]
        for name, filename, strength in loras:
            filename = p.get(f"lora_{name}", filename)
            strength = p.get(f"strength_{name}", strength)
            if filename == "None" or strength == 0:
                continue
            loader = "LoraLoaderBypassModelOnly" if name == "hybrid" else "LoraLoaderModelOnly"
            model = node(loader, f"{stage}_lora_{name}", model=model, lora_name=filename, strength_model=strength).out(0)
        model = node("MiniMaxH3FFNChunkTokens", f"{stage}_chunk", model=model, chunk_tokens=p["chunk_tokens"]).out(0)
        model = node("MiniMaxH3SigmaShift", f"{stage}_shift", model=model, shift_video=p["shift_video"], shift_audio=p["shift_audio"]).out(0)
        model = node("ModelAttentionBackend", f"{stage}_attention", model=model, attention=p["attention"]).out(0)
        if p["sparse_attention"]:
            model = node("BlockSparseAttention", f"{stage}_sparse", model=model, selection="vsa",
                         **{"selection.keep_percent": p["keep_percent"]}, start_percent=0.2, end_percent=1.0,
                         dense_blocks="", min_tokens=12288, extra_tokens=256,
                         sink_conditioning="exact_kv_and_rows", verbose=False).out(0)
        return model

    model = load_model("first")
    stages = ["first"] + (["second"] if p["second_pass"] else []) + (["third"] if p["third_pass"] else [])
    steps = sum(p[f"{stage}_steps"] for stage in stages)
    remaining = node("BasicScheduler", "schedule", model=model, scheduler=p["scheduler"], steps=steps, denoise=1.0).out(0)
    sigmas = {}
    for stage in stages[:-1]:
        split = node("SplitSigmas", f"{stage}_split", sigmas=remaining, step=p[f"{stage}_steps"])
        sigmas[stage], remaining = split.out(0), split.out(1)
    sigmas[stages[-1]] = remaining
    noise = node("RandomNoise", "noise", noise_seed=p["seed"]).out(0)
    sampler = node("KSamplerSelect", "sampler", sampler_name=p["sampler_name"]).out(0)
    guider = node("BasicGuider", "guider", model=model, conditioning=encode.out(0)).out(0)
    latent = encode.out(1)
    for stage in stages:
        if stage != "first":
            parts = node("LTXVSeparateAVLatent", f"{stage}_separate", av_latent=latent)
            upscale = node("MinimaxH3LatentUpscaler3D", f"{stage}_upscale", latent=parts.out(0), model_name=p["upscale_model"],
                           mode="megapixels", **{"mode.megapixels": p[f"{stage}_mp"]}, align=32,
                           enable_temporal_chunking=True, force_unload=True, device=p["upscale_device"], precision=p["upscale_precision"]).out(0)
            latent = node("LTXVConcatAVLatent", f"{stage}_concat", video_latent=upscale, audio_latent=parts.out(1)).out(0)
        if stage == "third":
            third_model = load_model("third")
            stage_guider = node("BasicGuider", "third_guider", model=third_model, conditioning=encode.out(0)).out(0)
        else:
            stage_guider = guider
        latent = node("SamplerCustomAdvanced", f"{stage}_sample", noise=noise, guider=stage_guider,
                      sampler=sampler, sigmas=sigmas[stage], latent_image=latent).out(1)
    images = node("VAEDecode", "decode_video", samples=latent, vae=vae).out(0)
    images = node("ImageFromBatch", "trim", image=images, batch_index=0, length=source.out(1)).out(0)
    video = node("CreateVideo", "video", images=images, audio=source.out(2), fps=24.0,
                 bit_depth="auto", color_space="sRGB", codec="none").out(0)
    saved = node("SaveVideo", "save", video=video, filename_prefix=p["filename_prefix"], format="mp4",
                 **{"format.codec": "h264", "format.codec.encoding": "re-encode", "format.codec.encoding.crf": p["crf"]}, codec="auto").out(0)
    result = node("VRAMCleanup", "cleanup", anything=saved, offload_model=True, offload_cache=True).out(0)
    return graph.finalize(), (result,)
