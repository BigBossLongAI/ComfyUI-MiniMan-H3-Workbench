import folder_paths
from comfy_api.latest import ComfyExtension, io
from comfy.samplers import KSampler
from comfy_extras.nodes_resolution import ASPECT_RATIOS
from comfy_extras.nodes_minimax_h3 import MiniMaxH3ReferenceToVideo

from .graph import DEFAULTS, THIRD_LORAS, build_graph, reference_fingerprint
from .person_swap import SWAP_DEFAULTS, build_person_swap_graph

WEB_DIRECTORY = "./web"

class MiniManH3ReferenceEncode(io.ComfyNode):
    @classmethod
    def define_schema(cls):
        schema = MiniMaxH3ReferenceToVideo.define_schema()
        schema.node_id = "MiniManH3ReferenceEncode"
        schema.is_dev_only = True
        schema.accept_all_inputs = True
        return schema

    @classmethod
    def execute(cls, **inputs):
        for name in list(inputs):
            group, separator, key = name.partition(".")
            if separator and group in ("ref_images", "ref_videos", "ref_audios", "ref_video_audios"):
                inputs.setdefault(group, {})[key] = inputs.pop(name)
        return MiniMaxH3ReferenceToVideo.execute(**inputs)


class MiniManH3Workbench(io.ComfyNode):
    @classmethod
    def define_schema(cls):
        p = DEFAULTS
        inputs = [
            io.String.Input("prompt", display_name="提示词", multiline=True, dynamic_prompts=True),
            io.Float.Input("seconds", display_name="时长（秒）", default=p["seconds"], min=0.1, max=3600, step=0.1),
            io.Int.Input("seed", display_name="随机种子", default=p["seed"], min=0, max=0xffffffffffffffff, control_after_generate=True),
            io.Combo.Input("aspect_ratio", display_name="画面比例", options=list(ASPECT_RATIOS), default=p["aspect_ratio"]),
            io.Float.Input("first_mp", display_name="一采分辨率（MP）", default=p["first_mp"], min=0.1, max=16, step=0.1),
            io.Int.Input("first_steps", display_name="一采步数", default=p["first_steps"], min=1, max=10000),
            io.Boolean.Input("second_pass", display_name="启用二采", default=True),
            io.Int.Input("second_steps", display_name="二采步数", default=p["second_steps"], min=1, max=10000),
            io.Float.Input("second_mp", display_name="二采分辨率（MP）", default=p["second_mp"], min=0.1, max=16, step=0.1),
            io.Boolean.Input("third_pass", display_name="启用三采", default=True),
            io.Int.Input("third_steps", display_name="三采步数", default=p["third_steps"], min=1, max=10000),
            io.Float.Input("third_mp", display_name="三采分辨率（MP）", default=p["third_mp"], min=0.1, max=16, step=0.1),
            io.String.Input("filename_prefix", display_name="保存文件前缀", default=p["filename_prefix"]),
            io.String.Input("reference_files", default=p["reference_files"], multiline=True, advanced=True),
        ]
        for name, folder, label in [
            ("first_model", "diffusion_models", "一、二采模型"), ("third_model", "diffusion_models", "三采模型"),
            ("clip_name", "text_encoders", "文本编码器"), ("video_vae", "vae", "视频 VAE"),
            ("audio_vae", "vae", "音频 VAE"), ("upscale_model", "latent_upscale_models", "潜空间放大模型"),
        ]:
            inputs.append(io.Combo.Input(name, display_name=label, options=folder_paths.get_filename_list(folder), default=p[name], advanced=True))
        for name, filename, strength in THIRD_LORAS:
            inputs.extend([
                io.Combo.Input(f"lora_{name}", display_name=f"三采 LoRA · {name}", options=["None", *folder_paths.get_filename_list("loras")], default=filename, advanced=True),
                io.Float.Input(f"strength_{name}", display_name=f"LoRA 强度 · {name}", default=strength, min=-100, max=100, step=0.01, advanced=True),
            ])
        for name, options in [("sampler_name", KSampler.SAMPLERS), ("scheduler", KSampler.SCHEDULERS),
                              ("attention", ["pytorch attention", "comfy kitchen attention"]),
                              ("upscale_device", ["cuda", "rocm", "cpu"]), ("upscale_precision", ["fp32", "fp16", "bf16"])]:
            inputs.append(io.Combo.Input(name, options=options, default=p[name], advanced=True))
        inputs.extend([
            io.Boolean.Input("sparse_attention", display_name="VSA 稀疏注意力", default=True, advanced=True),
            io.Float.Input("keep_percent", display_name="VSA 保留比例", default=p["keep_percent"], min=0.5, max=95, step=0.5, advanced=True),
            io.Float.Input("shift_video", display_name="视频 Sigma Shift", default=p["shift_video"], min=0.01, max=100, advanced=True),
            io.Float.Input("shift_audio", display_name="音频 Sigma Shift", default=p["shift_audio"], min=0.01, max=100, advanced=True),
            io.Int.Input("chunk_tokens", display_name="FFN 分块 Token", default=p["chunk_tokens"], min=1, max=2147483647, advanced=True),
            io.Float.Input("audio_rate", display_name="音频速度", default=p["audio_rate"], min=0.1, max=10, step=0.1, advanced=True),
            io.Int.Input("crf", display_name="视频 CRF", default=p["crf"], min=0, max=51, advanced=True),
        ])
        for group, prefix, kind, label in [
            ("ref_images", "ref_image_", io.Image, "参考图片"),
            ("ref_videos", "ref_video_", io.Image, "参考视频帧（24 fps）"),
            ("ref_audios", "ref_audio_", io.Audio, "参考音频"),
        ]:
            inputs.append(io.Autogrow.Input(group, optional=True,
                template=io.Autogrow.TemplatePrefix(input=kind.Input(prefix.rstrip("_"), display_name=label),
                                                   prefix=prefix, min=0)))
        return io.Schema(node_id="MiniManH3Workbench", display_name="MiniMan H3 三采工作台",
                         category="MiniMan/H3", inputs=inputs, outputs=[io.Video.Output(display_name="成片")],
                         hidden=[io.Hidden.unique_id], is_output_node=True, enable_expand=True,
                         description="基于 (AAA)MiniManH3（三采）。二、三采独立开关，关闭阶段不加载或采样。自动保存带音频 MP4。")

    @classmethod
    def execute(cls, **settings):
        graph, result = build_graph(display_id=cls.hidden.unique_id, **settings)
        return io.NodeOutput(*result, expand=graph)

    @classmethod
    def fingerprint_inputs(cls, reference_files=DEFAULTS["reference_files"], **kwargs):
        return reference_fingerprint(reference_files)


class MiniManH3PersonSwapWorkbench(io.ComfyNode):
    @classmethod
    def define_schema(cls):
        schema = MiniManH3Workbench.define_schema()
        names = {"prompt", "seed", "first_mp", "first_steps", "second_pass",
                 "second_steps", "second_mp", "third_pass", "third_steps", "third_mp", "filename_prefix", "reference_files", "first_model", "third_model", "clip_name",
                 "video_vae", "audio_vae", "upscale_model", "sampler_name", "scheduler", "attention",
                 "upscale_device", "upscale_precision", "sparse_attention", "keep_percent", "chunk_tokens", "shift_video", "shift_audio", "crf"}
        names.update(f"{prefix}_{name}" for name, _, _ in THIRD_LORAS for prefix in ("lora", "strength"))
        schema.inputs = [item for item in schema.inputs if item.id in names]
        for item in schema.inputs:
            if item.id in SWAP_DEFAULTS and hasattr(item, "default"):
                item.default = SWAP_DEFAULTS[item.id]
        schema.inputs.extend([
            io.Combo.Input("sam_model", display_name="人物分割模型", options=folder_paths.get_filename_list("checkpoints"), default=SWAP_DEFAULTS["sam_model"], advanced=True),
            io.Combo.Input("lora_swap", display_name="人物替换 LoRA", options=["None", *folder_paths.get_filename_list("loras")], default=SWAP_DEFAULTS["lora_swap"], advanced=True),
            io.Float.Input("strength_swap", display_name="LoRA 强度", default=1.0, min=-100, max=100, step=0.01, advanced=True),
        ])
        schema.node_id = "MiniManH3PersonSwapWorkbench"
        schema.display_name = "H3 极简人物替换三采工作台"
        schema.description = "视频、一张人物参考图和提示词；保留原视频声音，支持三阶段采样。"
        return schema

    @classmethod
    def execute(cls, **settings):
        graph, result = build_person_swap_graph(display_id=cls.hidden.unique_id, **settings)
        return io.NodeOutput(*result, expand=graph)

    @classmethod
    def fingerprint_inputs(cls, reference_files=DEFAULTS["reference_files"], **kwargs):
        return reference_fingerprint(reference_files)


class MiniManH3Extension(ComfyExtension):
    async def get_node_list(self):
        return [MiniManH3Workbench, MiniManH3PersonSwapWorkbench, MiniManH3ReferenceEncode]


async def comfy_entrypoint():
    return MiniManH3Extension()
