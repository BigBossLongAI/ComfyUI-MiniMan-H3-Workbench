import json
import os

import folder_paths
from comfy_execution.graph_utils import GraphBuilder


DEFAULTS = {
    "prompt": "", "seconds": 15.0, "seed": 1,
    "aspect_ratio": "16:9 (Widescreen)", "first_mp": 0.7,
    "second_pass": True, "third_pass": True,
    "first_steps": 4, "second_steps": 3, "third_steps": 3,
    "second_mp": 1.0, "third_mp": 2.0,
    "first_model": "fastvideo_fasth3_8step_v2_pruned_nvfp4.safetensors",
    "third_model": "minimax_h3_ref2va_pruned_int8_convrot.safetensors",
    "clip_name": "qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors",
    "video_vae": "minimax_h3_video_vae_int8_convrot.safetensors",
    "audio_vae": "minimax_h3_audio_vae_fp32.safetensors",
    "upscale_model": "minimax_h3_latent_upscaler_3d_conv_v1_fp16.safetensors",
    "upscale_device": "cuda", "upscale_precision": "fp16",
    "sampler_name": "euler", "scheduler": "beta",
    "shift_video": 10.0, "shift_audio": 3.0,
    "attention": "comfy kitchen attention", "sparse_attention": True,
    "keep_percent": 10.0, "chunk_tokens": 1025,
    "audio_rate": 1.0, "filename_prefix": "Junkun_H3_Final", "crf": 19,
    "reference_files": '{"images":[],"videos":[],"audios":[]}',
}

THIRD_LORAS = [
    ("combat", "H3_Combat_V2.safetensors", 0.49),
    ("hybrid", "minimax_h3_turbo_v4_step600_ema_DasiwaREF2VAHybridV1_0_curveproj1025_compat_v001.safetensors", 0.5),
    ("eros", "minimax_h3_turbo_4step_10ErosMax_test4_pruned_curveproj1025_exp_v001-T8.safetensors", 0.7),
    ("motion", "Motion_Repair.safetensors", 0.25),
    ("lms", "minimax_h3_lms_v1.0_r64_r.safetensors", 0.2),
    ("cinema", "Minimax H3真实电影质感V0.1_ComfyUI通用版.safetensors", 0.2),
]


def reference_fingerprint(reference_files):
    files = json.loads(reference_files) if isinstance(reference_files, str) else reference_files
    filenames = [name for group in ("images", "audios") for name in files.get(group, []) if name]
    filenames.extend(item["file"] for item in files.get("videos", []) if item and item["file"])
    result = []
    for name in filenames:
        stat = os.stat(folder_paths.get_annotated_filepath(name))
        result.append((name, stat.st_mtime_ns, stat.st_size))
    return tuple(result)


def build_graph(display_id=None, **settings):
    p = DEFAULTS | settings
    graph = GraphBuilder()

    def node(kind, name, **inputs):
        n = graph.node(kind, name, **inputs)
        if display_id is not None:
            n.set_override_display_id(display_id)
        return n

    def model(stage):
        m = node("UNETLoader", f"{stage}_model", unet_name=p[f"{stage}_model"], weight_dtype="default").out(0)
        if stage == "third":
            for index, (name, filename, strength) in enumerate(THIRD_LORAS):
                filename = p.get(f"lora_{name}", filename)
                strength = p.get(f"strength_{name}", strength)
                if filename == "None" or strength == 0:
                    continue
                kind = "LoraLoaderBypassModelOnly" if name == "hybrid" else "LoraLoaderModelOnly"
                m = node(kind, f"third_lora_{index}", model=m, lora_name=filename, strength_model=strength).out(0)
        m = node("MiniMaxH3FFNChunkTokens", f"{stage}_chunk", model=m, chunk_tokens=p["chunk_tokens"]).out(0)
        m = node("MiniMaxH3SigmaShift", f"{stage}_shift", model=m, shift_video=p["shift_video"], shift_audio=p["shift_audio"]).out(0)
        m = node("ModelAttentionBackend", f"{stage}_attention", model=m, attention=p["attention"]).out(0)
        if p["sparse_attention"]:
            m = node("BlockSparseAttention", f"{stage}_sparse", model=m, selection="vsa",
                     **{"selection.keep_percent": p["keep_percent"]}, start_percent=0.2, end_percent=1.0,
                     dense_blocks="", min_tokens=12288, extra_tokens=256, sink_conditioning="exact_kv_and_rows", verbose=False).out(0)
        return m

    video_vae = node("VAELoader", "video_vae", vae_name=p["video_vae"]).out(0)
    audio_vae = node("VAELoader", "audio_vae", vae_name=p["audio_vae"]).out(0)
    clip = node("CLIPLoader", "clip", clip_name=p["clip_name"], type="minimax", device="default").out(0)
    resolution = node("ResolutionSelector", "resolution", aspect_ratio=p["aspect_ratio"], megapixels=p["first_mp"], multiple=32)
    length = max(5, round(p["seconds"] * 24))
    length += (5 - length % 17) % 17
    files = p["reference_files"]
    if isinstance(files, str):
        files = json.loads(files)
    references = {}
    for group in ("ref_images", "ref_videos", "ref_audios", "ref_video_audios"):
        for key, value in (p.get(group) or {}).items():
            references[f"{group}.{key}"] = value
    for index, filename in enumerate(files.get("images", [])):
        if not filename or f"ref_images.ref_image_{index}" in references:
            continue
        folder_paths.get_annotated_filepath(filename)
        references[f"ref_images.ref_image_{index}"] = node("LoadImage", f"image_{index}", image=filename).out(0)
    for index, item in enumerate(files.get("videos", [])):
        if not item or not item["file"] or f"ref_videos.ref_video_{index}" in references:
            continue
        folder_paths.get_annotated_filepath(item["file"])
        video = node("VHS_LoadVideo", f"reference_video_{index}", video=item["file"], force_rate=24.0,
                     custom_width=0, custom_height=0, frame_load_cap=0, skip_first_frames=0,
                     select_every_nth=1, format="None")
        references[f"ref_videos.ref_video_{index}"] = video.out(0)
        if item.get("use_audio", False) and f"ref_video_audios.ref_video_audio_{index}" not in references:
            references[f"ref_video_audios.ref_video_audio_{index}"] = video.out(2)
    for index, filename in enumerate(files.get("audios", [])):
        if not filename or f"ref_audios.ref_audio_{index}" in references:
            continue
        folder_paths.get_annotated_filepath(filename)
        references[f"ref_audios.ref_audio_{index}"] = node("LoadAudio", f"reference_audio_{index}", audio=filename).out(0)
    encode = node("MiniManH3ReferenceEncode", "encode", clip=clip, vae=video_vae, audio_vae=audio_vae,
                  prompt=p["prompt"], width=resolution.out(0), height=resolution.out(1), length=length,
                  ref_image_size="max", **references)
    first_model = model("first")
    total_steps = p["first_steps"] + (p["second_steps"] if p["second_pass"] else 0) + (p["third_steps"] if p["third_pass"] else 0)
    remaining = node("BasicScheduler", "schedule", model=first_model, scheduler=p["scheduler"], steps=total_steps, denoise=1.0).out(0)
    sigmas = {}
    if p["second_pass"]:
        split = node("SplitSigmas", "first_split", sigmas=remaining, step=p["first_steps"])
        sigmas["first"], remaining = split.out(0), split.out(1)
    if p["third_pass"]:
        split = node("SplitSigmas", "third_split", sigmas=remaining, step=p["second_steps"] if p["second_pass"] else p["first_steps"])
        sigmas["second" if p["second_pass"] else "first"] = split.out(0)
        remaining = split.out(1)
    sigmas["third" if p["third_pass"] else "second" if p["second_pass"] else "first"] = remaining
    noise = node("RandomNoise", "noise", noise_seed=p["seed"]).out(0)
    sampler = node("KSamplerSelect", "sampler", sampler_name=p["sampler_name"]).out(0)
    latent = encode.out(1)
    stages = ["first"] + (["second"] if p["second_pass"] else []) + (["third"] if p["third_pass"] else [])
    for stage in stages:
        if stage != "first":
            separate = node("LTXVSeparateAVLatent", f"{stage}_separate", av_latent=latent)
            upscale = node("MinimaxH3LatentUpscaler3D", f"{stage}_upscale", latent=separate.out(0),
                           model_name=p["upscale_model"], mode="megapixels", **{"mode.megapixels": p[f"{stage}_mp"]},
                           align=32, enable_temporal_chunking=True, force_unload=True,
                           device=p["upscale_device"], precision=p["upscale_precision"])
            latent = node("LTXVConcatAVLatent", f"{stage}_concat", video_latent=upscale.out(0), audio_latent=separate.out(1)).out(0)
        if stage == "third":
            latent = node("VRAMCleanup", "third_cleanup", anything=latent, offload_model=True, offload_cache=True).out(0)
        guider = node("BasicGuider", f"{stage}_guider", model=model("third") if stage == "third" else first_model, conditioning=encode.out(0)).out(0)
        latent = node("SamplerCustomAdvanced", f"{stage}_sample", noise=noise, guider=guider, sampler=sampler,
                      sigmas=sigmas[stage], latent_image=latent).out(1)
    images = node("VAEDecode", "decode_video", samples=latent, vae=video_vae).out(0)
    audio = node("VAEDecodeAudio", "decode_audio", samples=latent, vae=audio_vae).out(0)
    audio = node("AudioSpeedShift", "audio_speed", audio=audio, rate=p["audio_rate"]).out(0)
    video = node("CreateVideo", "video", images=images, audio=audio, fps=24.0, bit_depth="auto", color_space="sRGB", codec="none").out(0)
    saved = node("SaveVideo", "save", video=video, filename_prefix=p["filename_prefix"], format="mp4",
                 **{"format.codec": "h264", "format.codec.encoding": "re-encode", "format.codec.encoding.crf": p["crf"]}, codec="auto").out(0)
    result = node("VRAMCleanup", "cleanup", anything=saved, offload_model=True, offload_cache=True).out(0)
    return graph.finalize(), (result,)
