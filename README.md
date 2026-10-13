# MiniMan H3 三采工作台

基于用户提供的 `(AAA)MiniManH3（三采）` 工作流制作的独立 ComfyUI 工作台。默认大小沿用最后保存的 **1158.83 × 1088.56**。

## 仓库目录

```text
custom_nodes/
  miniman_h3_workbench/        工作台节点与前端
  h3-memory-guard/             FFN 分块节点
third_party/                  三个依赖插件的源码与原许可证
workflows/                    工作台示例工作流
DOWNLOADS.md                  模型和 LoRA 下载来源
MODELS.json                   文件名、大小、哈希与下载链接
SOURCES.md                    来源与作者标注
```

源码已展开，可直接在线查看、克隆或提交修改。独立插件 ZIP 和完整安装包位于 [Releases 下载区](https://github.com/BigBossLongAI/ComfyUI-MiniMan-H3-Workbench/releases/latest)。

## 下载与安装

1. 使用 Git 克隆此仓库，或在仓库的 Code 菜单选择 Download ZIP。
2. 将 `custom_nodes/miniman_h3_workbench` 和 `custom_nodes/h3-memory-guard` 两个目录复制到你的 `ComfyUI/custom_nodes`。
3. 将 `third_party` 下的 VideoHelperSuite、Latent Upscaler、Audio Separation Nodes 各目录复制到 `ComfyUI/custom_nodes`，按插件 README 安装依赖。已有这些插件时使用已有安装，避免重复注册。
4. 另外安装 [LAOGOU-666 / Memory Cleanup](https://github.com/LAOGOU-666/Comfyui-Memory_Cleanup)。其分发许可证未核实，因此此仓库保留来源链接。
5. 按 [DOWNLOADS.md](DOWNLOADS.md) 下载并放置模型与 LoRA。重启 ComfyUI，打开 [workflows/MiniMan-H3-Workbench.json](workflows/MiniMan-H3-Workbench.json)。

模型权重单独遵循原发布方许可，不包含在源码仓库或安装包内。

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

**当前发布不包含模型或 LoRA 权重。** 本地选用的 12 个文件合计 58.19 GB。MiniMax H3 社区许可包含地区分发限制；部分权重再分发授权仍需核实，不能把这些权重统一标记为无限制开源文件。已确认来源的模型提供原始发布链接；未知来源明确留空。

本包的工作台单元测试（13 项）和前端事件测试通过；未替用户重新运行完整视频生成。

## LoRA 下载来源

本工作流使用的 **Dasiwa Hybrid 和 10Eros curveproj1025 转换版由 T8（t8star）提供下载**：

- [T8 / Dasiwa REF2VA Hybrid 转换版](https://huggingface.co/t8star/minimax_h3_turbo_v4_step600_ema_DasiwaREF2VAHybridV1_0_curveproj1025_compat_v001)
- [T8 / 10Eros 四步加速转换版](https://huggingface.co/t8star/minimax_h3_turbo_4step_10ErosMax_test4_pruned_curveproj1025_T8)
- [JOKER141 / Combat V2](https://huggingface.co/JOKER141/MiniMax-H3-Combat-Base-V2)
- [JOKER141 / Motion Repair](https://huggingface.co/JOKER141/MiniMax-H3-General-Motion-Continuity-Repair)

模型、编码器、VAE 及放大模型的提供方和放置目录见 [MODELS.json](MODELS.json)，插件来源见 [SOURCES.md](SOURCES.md)。LMS 和电影质感通用版已通过 SHA-256 核实，分别由 Alissonerdx 和 orangesouth 提供对应文件下载。

完整的 12 个模型与 LoRA 下载直链、提供方、文件重命名说明及安装目录见 [DOWNLOADS.md](DOWNLOADS.md)。6 个 LoRA 已逐一通过 SHA-256 与上游对照；无需把来源不明的其他版本当作同一文件。
