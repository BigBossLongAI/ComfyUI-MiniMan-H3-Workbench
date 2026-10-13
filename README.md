# MiniMan H3 三采工作台

基于用户提供的 `(AAA)MiniManH3（三采）` 工作流制作的独立 ComfyUI 工作台。默认大小沿用最后保存的 **1158.83 × 1088.56**。

## 下载与安装

1. 下载并解压 [源码与插件包](MiniMan-H3-source-release.zip)。插件源代码、原始许可证和工作流均在压缩包内。
2. 将包内 `custom_nodes/miniman_h3_workbench` 和 `custom_nodes/h3-memory-guard` 复制到 ComfyUI 的 `custom_nodes` 目录。
3. 将 `third_party` 下的 VideoHelperSuite、Latent Upscaler、Audio Separation Nodes 各目录复制到 `custom_nodes`，按各插件说明安装依赖。
4. 另外安装 [Memory Cleanup](https://github.com/LAOGOU-666/Comfyui-Memory_Cleanup)。该插件没有核实到分发许可证，因此此包只提供来源链接。
5. 根据 [模型清单](MODELS.json) 安装模型和 LoRA，然后重启 ComfyUI，打开 [工作台工作流](MiniMan-H3-Workbench.json)。压缩包中另有 `workflows/MiniMan-H3-Workbench.json`。

## 功能

- 二采、三采独立开关；三个阶段独立设置步数和分辨率。
- 默认 9 个图片位、3 个视频位、3 个音频位；没有素材的空位不参与生成。
- 可外接图片、视频帧和音频；输入以中文加数字标识，成片输出位于右侧。
- 预览区显示当前阶段、当前步数和状态，支持 VHS 动态采样预览。
- 生成后在工作台内显示成片，需点击播放；不会自动播放。
- 模型、LoRA、高级设置在内部滚动，切换标签保持工作台大小。

## 来源与分发范围

详见 [来源说明](SOURCES.md) 和 [模型清单](MODELS.json)。原工作流作者尚未核实；工作台 UI 和图展开适配由用户与 Codex 协作完成。第三方插件保留各自原始许可证。

发布工作流已去掉私人参考素材、原提示词和生成成片记录。本机工作流及素材不被此包修改或删除。

**当前发布不包含模型或 LoRA 权重。** 本地选用的 12 个文件合计 58.19 GB。MiniMax H3 社区许可包含地区分发限制；部分转换 LoRA 来源和授权仍需核实，不能把这些权重统一标记为无限制开源文件。已确认来源的模型提供原始发布链接；未知来源明确留空。

本包的工作台单元测试（13 项）和前端事件测试通过；未替用户重新运行完整视频生成。

## LoRA 下载来源

本工作流使用的 **Dasiwa Hybrid 和 10Eros curveproj1025 转换版由 T8（t8star）提供下载**：

- [T8 / Dasiwa REF2VA Hybrid 转换版](https://huggingface.co/t8star/minimax_h3_turbo_v4_step600_ema_DasiwaREF2VAHybridV1_0_curveproj1025_compat_v001)
- [T8 / 10Eros 四步加速转换版](https://huggingface.co/t8star/minimax_h3_turbo_4step_10ErosMax_test4_pruned_curveproj1025_T8)
- [JOKER141 / Combat V2](https://huggingface.co/JOKER141/MiniMax-H3-Combat-Base-V2)
- [JOKER141 / Motion Repair](https://huggingface.co/JOKER141/MiniMax-H3-General-Motion-Continuity-Repair)

模型、编码器、VAE 及放大模型的提供方和放置目录见 [MODELS.json](MODELS.json)，插件来源见 [SOURCES.md](SOURCES.md)。LMS 和电影质感通用版的准确来源待核实。
