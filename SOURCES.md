# Sources and attribution

Workflow adapted from the user-supplied `(AAA)MiniManH3（三采）`. Original workflow author is unverified. Workbench UI and graph adapter were developed with Codex assistance.

## Dependencies

- ComfyUI: https://github.com/Comfy-Org/ComfyUI — Core H3 and sampling nodes
- VideoHelperSuite: https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite — VHS_LoadVideo and animated previews
- Latent Upscaler: https://github.com/LBH-123-AI/Comfyui_Minimax_h3_latent_Upscaler — MinimaxH3LatentUpscaler3D
- Audio nodes: https://github.com/christian-byrne/audio-separation-nodes-comfyui — AudioSpeedShift
- comfyui_memory_cleanup: https://github.com/LAOGOU-666/Comfyui-Memory_Cleanup — VRAMCleanup; license not yet verified
- h3-memory-guard: Bundled local implementation — MiniMaxH3FFNChunkTokens

## Models and LoRAs

See MODELS.json for the exact selected filenames, byte sizes, source URLs and license status. Converted LoRAs retain their conversion metadata; they are not attributed as newly trained models. Missing source URLs are unresolved, not inferred authorship.

Model weights remain subject to their own licenses. MiniMax H3 weights are not unrestricted open-source assets; consult the original community license before redistribution.

## Bundled third-party source snapshots

VideoHelperSuite (GPL-3.0), Latent Upscaler (MIT), and Audio Separation Nodes (MIT) source snapshots are under third_party with their original license files. Copy each package into custom_nodes and install its documented requirements. Memory Cleanup is linked separately because the local snapshot has no license file.

## LoRA 下载提供方

| 文件 / 用途 | 下载提供方 | 发布页面 |
|---|---|---|
| Dasiwa REF2VA Hybrid curveproj1025 转换版 | T8（t8star） | https://huggingface.co/t8star/minimax_h3_turbo_v4_step600_ema_DasiwaREF2VAHybridV1_0_curveproj1025_compat_v001 |
| 10Eros 四步 curveproj1025 EXP v001 转换版 | T8（t8star） | https://huggingface.co/t8star/minimax_h3_turbo_4step_10ErosMax_test4_pruned_curveproj1025_T8 |
| H3_Combat_V2 | JOKER141 | https://huggingface.co/JOKER141/MiniMax-H3-Combat-Base-V2 |
| Motion_Repair | JOKER141 | https://huggingface.co/JOKER141/MiniMax-H3-General-Motion-Continuity-Repair |
| LMS r64_r | 尚未核实 | 待补充原发布页面 |
| 电影质感 ComfyUI 通用版 | 尚未核实 | 待补充与本地文件对应的原发布页面 |

T8 在此标注为转换版本的下载提供方，不能据此认定全部原始训练权重均由 T8 制作。10Eros 模型卡将加速权重上游指向 larryvrh/MiniMax-H3-Turbo-Lora：https://huggingface.co/larryvrh/MiniMax-H3-Turbo-Lora 。提供下载页面不等于取得再分发授权，权重仍遵循各自及底模许可。
