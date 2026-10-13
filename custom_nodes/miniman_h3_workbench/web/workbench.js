import {app} from "../../scripts/app.js";
import {api} from "../../scripts/api.js";
import {createWorkbenchPanel} from "./panel.js";

const dispatchPreviewEvent = api.dispatchCustomEvent;
api.dispatchCustomEvent = function (type, detail) {
    if (type === "b_preview") dispatchPreviewEvent.call(this, "miniman_h3_preview", detail);
    return dispatchPreviewEvent.call(this, type, detail);
};

app.registerExtension({
    name: "MiniMan.H3.Workbench",
    beforeRegisterNodeDef(nodeType, nodeData) {
        if (!["MiniManH3Workbench", "MiniManH3PersonSwapWorkbench"].includes(nodeData.name)) return;
        const created = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
            const result = created?.apply(this, arguments);
            const panel = createWorkbenchPanel(this, {
                fetch: (path, options) => api.fetchApi(path, options),
                view: name => {
                    const index = name.lastIndexOf("/");
                    const params = new URLSearchParams({filename: name.slice(index + 1), subfolder: index < 0 ? "" : name.slice(0, index), type: "input"});
                    return api.apiURL(`/view?${params}`);
                },
            });
            const removeVideoAudioInputs = () => {
                for (let index = (this.inputs?.length || 0) - 1; index >= 0; index--) {
                    const name = this.inputs[index].name;
                    const removedSwapInput = nodeData.name === "MiniManH3PersonSwapWorkbench"
                        && ["seconds", "aspect_ratio"].includes(name) && !nodeData.input.required[name];
                    if (name.startsWith("ref_video_audios.") || removedSwapInput) this.removeInput(index);
                }
            };
            removeVideoAudioInputs();
            const layoutReferenceInputs = () => {
                const labels = {ref_images: "图片", ref_videos: "视频", ref_audios: "音频"};
                let row = 0;
                for (const input of this.inputs || []) {
                    const [group, name] = input.name.split(".");
                    if (!labels[group]) continue;
                    input.pos = [10, 210 + row++ * 28];
                    input.label = `${labels[group]} ${Number(name.match(/\d+$/)?.[0] || 0) + 1}`;
                }
                for (const [index, output] of (this.outputs || []).entries()) {
                    output.pos = [this.size[0] - 10, 210 + index * 28];
                    output.label = `成片 ${index + 1}`;
                }
                this.widgets_start_y = 10;
            };
            let workbenchHeight = 1088.5574520335479;
            const hideWidgets = () => {
                let addedPreview = false;
                layoutReferenceInputs();
                for (const widget of this.widgets) {
                    if (widget.name === "miniman_panel") continue;
                    const preview = ["videopreview", "vhslatentpreview", "$$canvas-image-preview"].includes(widget.name);
                    if (!nodeData.input.required[widget.name] && widget.name !== "control_after_generate" && !preview) continue;
                    if (preview && !widget.hidden) addedPreview = true;
                    if (preview && widget.options) {
                        widget.options.getMinHeight = () => 0;
                        widget.options.getMaxHeight = () => 0;
                    }
                    widget.type = "hidden";
                    widget.hidden = true;
                    widget.computeSize = () => [0, -4];
                    const el = widget.element || widget.inputEl;
                    if (el) {
                        el.style.display = "none";
                        const host = el.closest(".dom-widget");
                        if (host) { host.style.display = "none"; host.style.height = "0px"; }
                    }
                }
                if (addedPreview && this.size[1] !== workbenchHeight) this.setSize([this.size[0], workbenchHeight]);
            };
            hideWidgets();
            const widget = this.addDOMWidget("miniman_panel", "div", panel.element, {
                serialize: false, hideOnZoom: false, getMinHeight: () => 1040, getMaxHeight: () => 1040,
            });
            widget.computeSize = width => [width, 1040];
            this.size = [1158.8319307215074, 1088.5574520335479];
            layoutReferenceInputs();
            let running = false;
            let stage = "采样";
            let lastBlob;
            let previewEpoch = 0;
            let previewFrames = [];
            let previewTimer;
            let displayIndex = 0;
            const stopAnimation = () => {
                if (previewTimer != null) clearInterval(previewTimer);
                previewTimer = null;
                previewFrames = [];
                displayIndex = 0;
            };
            const activeGraph = () => this.graph === app.graph;
            const matches = id => activeGraph() && id != null && (String(id) === String(this.id) || String(id).startsWith(`${this.id}.`));
            let ownsRun = false;
            const executionStart = () => { ownsRun = activeGraph(); };
            const stageLabel = id => {
                const name = String(id || "");
                if (name.endsWith("first_sample")) return "一采";
                if (name.endsWith("second_sample")) return "二采";
                if (name.endsWith("third_sample")) return "三采";
                return stage;
            };
            const animatePreview = event => {
                const data = event.detail;
                if (!matches(data.id)) return;
                stopAnimation();
                previewEpoch++;
                running = true;
                previewFrames = new Array(data.length);
                previewTimer = setInterval(() => {
                    for (let offset = 0; offset < previewFrames.length; offset++) {
                        const index = (displayIndex + offset) % previewFrames.length;
                        if (!previewFrames[index]) continue;
                        panel.showPreview(previewFrames[index], stage);
                        displayIndex = (index + 1) % previewFrames.length;
                        break;
                    }
                }, 1000 / data.rate);
            };
            const executing = event => {
                const active = matches(event.detail);
                if (String(event.detail) === String(this.id) && !running) panel.resetStageProgress();
                if (!active) stopAnimation();
                if (running && event.detail == null) panel.setPreviewStatus("本次运行结束");
                if (active && !running) { previewEpoch++; panel.setPreviewStatus("准备采样…"); }
                running = active;
            };
            const metadataPreview = event => {
                const data = event.detail;
                if (![data.nodeId, data.displayNodeId, data.parentNodeId].some(matches)) return;
                stage = stageLabel(data.nodeId);
                lastBlob = data.blob;
                panel.showPreview(data.blob, stage);
            };
            const binaryPreview = async event => {
                if (!running || event.detail === lastBlob) return;
                lastBlob = event.detail;
                const epoch = previewEpoch;
                let frame = event.detail;
                const bytes = await frame.slice(0, 26).arrayBuffer();
                const header = new DataView(bytes);
                if (bytes.byteLength === 26 && header.getUint32(0) === 1 && header.getUint16(24) === 0xffd8) {
                    const length = header.getUint8(8);
                    const id = new TextDecoder().decode(new Uint8Array(bytes, 9, Math.min(length, 15)));
                    if (!matches(id)) return;
                    frame = frame.slice(24, frame.size, "image/jpeg");
                    if (running && epoch === previewEpoch && previewTimer != null) {
                        previewFrames[header.getUint32(4)] = frame;
                        return;
                    }
                }
                if (running && epoch === previewEpoch) panel.showPreview(frame, stage);
            };
            const progress = event => {
                const data = event.detail;
                if (!matches(data.node) && !(data.node == null && running)) return;
                stage = stageLabel(data.node);
                panel.setPreviewProgress(data.value, data.max, stage);
            };
            const progressState = event => {
                for (const [id, state] of Object.entries(event.detail.nodes || {})) {
                    if (!matches(id) || !/(first|second|third)_sample$/.test(id)) continue;
                    panel.setStageProgress(state.value, state.max, stageLabel(id), state.state);
                    if (state.state !== "running") continue;
                    if (!running) { running = true; previewEpoch++; }
                    stage = stageLabel(id);
                    panel.setPreviewProgress(state.value, state.max, stage);
                }
            };
            const showOutput = output => {
                const file = output?.images?.find(item => /\.(mp4|webm|mkv|mov)$/i.test(item.filename));
                if (!file) return false;
                stopAnimation();
                previewEpoch++;
                this.properties ||= {};
                this.properties.minimanFinalVideo = file;
                const params = new URLSearchParams({filename: file.filename, subfolder: file.subfolder || "", type: file.type || "output"});
                panel.showVideo(api.apiURL(`/view?${params}`));
                this.imgs = null;
                const cachedOutput = app.nodeOutputs?.[this.id];
                if (cachedOutput) cachedOutput.images = [];
                hideWidgets();
                return true;
            };
            const onExecuted = this.onExecuted;
            this.onExecuted = function (output) {
                if (!activeGraph() || !ownsRun) return;
                if (showOutput(output)) return;
                return onExecuted?.apply(this, arguments);
            };
            const executed = event => {
                const data = event.detail;
                if (!ownsRun || (!matches(data.node) && !matches(data.display_node))) return;
                showOutput(data.output);
            };
            api.addEventListener("executing", executing);
            api.addEventListener("execution_start", executionStart);
            api.addEventListener("b_preview_with_metadata", metadataPreview);
            api.addEventListener("miniman_h3_preview", binaryPreview);
            api.addEventListener("VHS_latentpreview", animatePreview);
            api.addEventListener("progress", progress);
            api.addEventListener("progress_state", progressState);
            api.addEventListener("executed", executed);
            const removed = this.onRemoved;
            this.onRemoved = function () {
                api.removeEventListener("executing", executing);
                api.removeEventListener("execution_start", executionStart);
                api.removeEventListener("b_preview_with_metadata", metadataPreview);
                api.removeEventListener("miniman_h3_preview", binaryPreview);
                api.removeEventListener("VHS_latentpreview", animatePreview);
                api.removeEventListener("progress", progress);
                api.removeEventListener("progress_state", progressState);
                api.removeEventListener("executed", executed);
                lastBlob = null;
                stopAnimation();
                previewEpoch++;
                panel.destroy();
                return removed?.apply(this, arguments);
            };
            const configure = this.onConfigure;
            this.onConfigure = function () {
                const value = configure?.apply(this, arguments);
                const settings = arguments[0]?.widgets_values_named;
                if (settings) for (const widget of this.widgets) {
                    if (Object.hasOwn(settings, widget.name)) widget.value = settings[widget.name];
                }
                for (const widget of this.widgets) {
                    const definition = nodeData.input.required[widget.name];
                    if (definition && ["FLOAT", "INT"].includes(definition[0]) && (widget.value === "" || widget.value == null)) {
                        widget.value = definition[1].default;
                    }
                }
                workbenchHeight = this.size[1];
                removeVideoAudioInputs();
                hideWidgets();
                panel.sync();
                if (this.properties?.minimanFinalVideo) showOutput({images: [this.properties.minimanFinalVideo]});
                return value;
            };
            const serialize = this.onSerialize;
            this.onSerialize = function (data) {
                const value = serialize?.apply(this, arguments);
                data.properties ||= {};
                delete data.properties.minimanSettings;
                data.widgets_values_named = Object.fromEntries(this.widgets
                    .filter(widget => nodeData.input.required[widget.name] || widget.name === "control_after_generate")
                    .map(widget => [widget.name, widget.value]));
                return value;
            };
            const resize = this.onResize;
            this.onResize = function () {
                const value = resize?.apply(this, arguments);
                hideWidgets();
                return value;
            };
            const draw = this.onDrawForeground;
            this.onDrawForeground = function () {
                layoutReferenceInputs();
                this.imgs = null;
                const value = draw?.apply(this, arguments);
                hideWidgets();
                this.imgs = null;
                panel.refresh();
                return value;
            };
            return result;
        };
    },
});
