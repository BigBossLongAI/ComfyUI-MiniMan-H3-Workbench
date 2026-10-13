# 模型与 LoRA 下载清单

12 个文件均已核实发布页面和文件列表；6 个 LoRA 的本机 SHA-256 与所列上游文件完全一致。下载后请按「本机名称」命名，放到对应目录。链接指向提供方，不代表本仓库重新分发权重。

| 本机名称 | 下载提供方 | 下载 | 放置目录 | 核实方式 |
|---|---|---|---|---|
| `fastvideo_fasth3_8step_v2_pruned_nvfp4.safetensors` | FastVideo | [下载文件](https://huggingface.co/FastVideo/FastVideo-FastH3-8-Step-V2-NVFP4-Comfy/resolve/main/diffusion_models/fastvideo_fasth3_8step_v2_pruned_nvfp4.safetensors) / [发布页](https://huggingface.co/FastVideo/FastVideo-FastH3-8-Step-V2-NVFP4-Comfy) | `models/diffusion_models` | 上游文件列表 |
| `minimax_h3_ref2va_pruned_int8_convrot.safetensors` | Comfy-Org (repackaging); MiniMaxAI (base model) | [下载文件](https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/diffusion_models/minimax_h3_ref2va_pruned_int8_convrot.safetensors) / [发布页](https://huggingface.co/Comfy-Org/MiniMax-H3) | `models/diffusion_models` | 上游文件列表 |
| `qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors` | FastVideo | [下载文件](https://huggingface.co/FastVideo/FastVideo-FastH3-8-Step-V2-NVFP4-Comfy/resolve/main/text_encoders/qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors) / [发布页](https://huggingface.co/FastVideo/FastVideo-FastH3-8-Step-V2-NVFP4-Comfy) | `models/text_encoders` | 上游文件列表 |
| `minimax_h3_video_vae_int8_convrot.safetensors` | FastVideo | [下载文件](https://huggingface.co/FastVideo/FastVideo-FastH3-8-Step-V2-NVFP4-Comfy/resolve/main/vae/minimax_h3_video_vae_int8_convrot.safetensors) / [发布页](https://huggingface.co/FastVideo/FastVideo-FastH3-8-Step-V2-NVFP4-Comfy) | `models/vae` | 上游文件列表 |
| `minimax_h3_audio_vae_fp32.safetensors` | Comfy-Org (repackaging); MiniMaxAI (base model) | [下载文件](https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/vae/minimax_h3_audio_vae_fp32.safetensors) / [发布页](https://huggingface.co/Comfy-Org/MiniMax-H3) | `models/vae` | 上游文件列表 |
| `minimax_h3_latent_upscaler_3d_conv_v1_fp16.safetensors` | LBH-123-AI | [下载文件](https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler/resolve/main/minimax_h3_latent_upscaler_3d_conv_v1/minimax_h3_latent_upscaler_3d_conv_v1_fp16.safetensors) / [发布页](https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler) | `models/latent_upscale_models` | 上游文件列表 |
| `H3_Combat_V2.safetensors` | JOKER141 | [下载文件](https://huggingface.co/JOKER141/MiniMax-H3-Combat-Base-V2/resolve/main/H3_Combat_V2.safetensors) / [发布页](https://huggingface.co/JOKER141/MiniMax-H3-Combat-Base-V2) | `models/loras` | SHA-256 一致 |
| `minimax_h3_turbo_v4_step600_ema_DasiwaREF2VAHybridV1_0_curveproj1025_compat_v001.safetensors` | T8 / t8star | [下载文件](https://huggingface.co/t8star/minimax_h3_turbo_v4_step600_ema_DasiwaREF2VAHybridV1_0_curveproj1025_compat_v001/resolve/main/minimax_h3_turbo_v4_step600_ema_DasiwaREF2VAHybridV1_0_curveproj1025_compat_v001.safetensors) / [发布页](https://huggingface.co/t8star/minimax_h3_turbo_v4_step600_ema_DasiwaREF2VAHybridV1_0_curveproj1025_compat_v001) | `models/loras` | SHA-256 一致 |
| `minimax_h3_turbo_4step_10ErosMax_test4_pruned_curveproj1025_exp_v001-T8.safetensors` | T8 / t8star | [下载文件](https://huggingface.co/t8star/minimax_h3_turbo_4step_10ErosMax_test4_pruned_curveproj1025_T8/resolve/main/minimax_h3_turbo_4step_10ErosMax_test4_pruned_curveproj1025_exp_v001-T8.safetensors) / [发布页](https://huggingface.co/t8star/minimax_h3_turbo_4step_10ErosMax_test4_pruned_curveproj1025_T8) | `models/loras` | SHA-256 一致 |
| `Motion_Repair.safetensors` | JOKER141 | [下载文件](https://huggingface.co/JOKER141/MiniMax-H3-General-Motion-Continuity-Repair/resolve/main/Motion_Repair.safetensors) / [发布页](https://huggingface.co/JOKER141/MiniMax-H3-General-Motion-Continuity-Repair) | `models/loras` | SHA-256 一致 |
| `minimax_h3_lms_v1.0_r64_r.safetensors` | Alissonerdx（文件发布方）；RunningHubAI/T8star-Aix 提供同系列镜像 | [下载文件](https://huggingface.co/Alissonerdx/Minimax-H3-ComfyUI/resolve/main/loras/minimax_h3_lms_v1.0_r64.safetensors) / [发布页](https://huggingface.co/Alissonerdx/Minimax-H3-ComfyUI) | `models/loras` | SHA-256 一致 |
| `Minimax H3真实电影质感V0.1_ComfyUI通用版.safetensors` | orangesouth（下载提供方；原训练作者未核实） | [下载文件](https://huggingface.co/orangesouth/MinimaxH3CinematicRealism/resolve/main/Minimax%20H3%E7%9C%9F%E5%AE%9E%E7%94%B5%E5%BD%B1%E8%B4%A8%E6%84%9FV0.1.safetensors) / [发布页](https://huggingface.co/orangesouth/MinimaxH3CinematicRealism) | `models/loras` | SHA-256 一致 |

## 名称差异

- LMS 上游文件名为 `minimax_h3_lms_v1.0_r64.safetensors`，本工作流需要命名为 `minimax_h3_lms_v1.0_r64_r.safetensors`。RunningHubAI 的同系列 `_r` 文件目前哈希不同，不混用为本机文件的精确来源。
- 电影质感版上游文件名为 `Minimax H3真实电影质感V0.1.safetensors`，下载后按表中通用版名称命名。orangesouth 是下载提供方，原训练作者尚未核实。
- T8 的 Eros 转换版下载后按本机文件名增加 `-T8` 后缀；实际文件 SHA-256 一致。

## 分发范围

工作台仓库不上传这些权重。MiniMax H3 及相关衍生模型遵循其社区许可；电影质感下载仓库未查到明确再分发许可。潜空间放大器标注 Apache-2.0。许可原文均应从原发布方核对。
