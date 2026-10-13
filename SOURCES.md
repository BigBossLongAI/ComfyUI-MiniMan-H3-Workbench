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
