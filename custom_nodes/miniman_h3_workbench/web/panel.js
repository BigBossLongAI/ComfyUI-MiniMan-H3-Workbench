export function createWorkbenchPanel(node, transport) {
    const widgets = new Map(node.widgets.map(widget => [widget.name, widget]));
    const root = document.createElement("div");
    root.className = "mmh3-panel";
    const style = document.createElement("style");
    style.textContent = `
        .mmh3-panel{color-scheme:dark;margin-left:48px;width:calc(100% - 92px);height:100%;box-sizing:border-box;overflow:hidden;border:1px solid #33464c;border-radius:14px;background:#121c21;color:#e6efef;font:13px/1.5 system-ui,"Microsoft YaHei",sans-serif;display:flex;flex-direction:column}
        .mmh3-panel *{box-sizing:border-box}.mmh3-panel button,.mmh3-panel input,.mmh3-panel select,.mmh3-panel textarea{font:inherit}
        .mmh3-panel button{cursor:pointer}.mmh3-head{display:flex;justify-content:space-between;align-items:center;padding:20px 24px;border-bottom:1px solid #2b3d43;background:#19282e}
        .mmh3-brand{font-size:24px;font-weight:700;letter-spacing:.5px}.mmh3-sub{color:#90a9af;font-size:12px;margin-top:3px}
        .mmh3-tabs{display:flex;gap:8px;padding:12px 24px;border-bottom:1px solid #2b3d43}.mmh3-tabs button,.mmh3-media-tabs button{border:0;border-radius:7px;background:transparent;color:#91a8ae;padding:8px 18px}.mmh3-tabs button.active,.mmh3-media-tabs button.active{background:#284b4d;color:#a7f0e3}
        .mmh3-body{display:grid;grid-template-columns:350px minmax(0,1fr);gap:20px;padding:20px;align-items:start;flex:1;min-height:0}.mmh3-media,.mmh3-editor{height:100%;min-height:0;overflow:auto;scrollbar-width:thin;scrollbar-color:#3d5a61 transparent}.mmh3-editor{overflow:hidden}
        .mmh3-media{padding:16px;background:#18252b;border:1px solid #2b3f46;border-radius:10px}.mmh3-section{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}.mmh3-section h3{font-size:14px;margin:0}.mmh3-section span{font-size:11px;color:#8da6ad}
        .mmh3-media-tabs{display:flex;gap:3px;margin-bottom:14px}.mmh3-media-tabs button{padding:7px 10px;font-size:12px;flex:1}.mmh3-gallery{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.mmh3-gallery.video,.mmh3-gallery.audio{grid-template-columns:1fr}
        .mmh3-card{position:relative;border:1px solid #365059;border-radius:9px;background:#111b20;overflow:hidden;min-width:0}.mmh3-thumb{height:94px;display:flex;align-items:center;justify-content:center;background:#152127;color:#718a93;cursor:pointer}.mmh3-thumb img{width:100%;height:100%;object-fit:contain}.mmh3-thumb video{width:100%;height:160px;object-fit:contain}.mmh3-card:has(video) .mmh3-thumb{height:160px}.mmh3-thumb audio{width:100%;height:36px}.mmh3-empty{font-size:26px;font-weight:300}.mmh3-card-info{padding:6px 8px;font-size:11px;color:#a7bec3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .mmh3-remove{position:absolute;right:4px;top:4px;border:0;background:#132025dd;color:#d7e8eb;border-radius:50%;width:22px;height:22px}.mmh3-media-actions{display:flex;gap:8px;margin-top:14px}.mmh3-action{background:#255556;color:#c1f4ea;border:1px solid #397d78;border-radius:7px;padding:8px 10px}.mmh3-help{color:#819aa3;font-size:11px;line-height:1.7;margin-top:12px}.mmh3-status{color:#e1b786;font-size:12px;min-height:22px;margin-top:10px;white-space:pre-wrap}
        .mmh3-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.mmh3-field{display:flex;flex-direction:column;gap:5px;min-width:0}.mmh3-field>span{color:#9eb6bd;font-size:12px}.mmh3-panel input,.mmh3-panel select,.mmh3-panel textarea{width:100%;min-width:0;background:#101b20;color:#e3eeee;border:1px solid #365059;border-radius:7px;padding:8px 10px;outline:none}.mmh3-panel input:focus,.mmh3-panel select:focus,.mmh3-panel textarea:focus{border-color:#6bbeb0}.mmh3-panel textarea{resize:vertical;min-height:160px;height:165px;line-height:1.65;scrollbar-width:thin}
        .mmh3-group{margin-bottom:20px}.mmh3-stages{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.mmh3-stage{padding:14px 12px;border:1px solid #365b59;border-radius:9px;background:#192b2d}.mmh3-stage.off{background:#182329;border-color:#2c3e46}.mmh3-stage.off .mmh3-field{opacity:.45}.mmh3-stage-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;font-weight:600}.mmh3-switch{display:flex;align-items:center;gap:7px;font-size:11px;color:#a5c9c4}.mmh3-switch input{width:auto;accent-color:#76c9b6}.mmh3-stage .mmh3-field{margin-top:8px}.mmh3-note{border-left:3px solid #548e87;padding:8px 10px;color:#9fb9be;font-size:12px;background:#19292d;margin-top:14px}.mmh3-lora{padding:14px;border:1px solid #2c434b;border-radius:9px;margin-bottom:10px}.mmh3-lora-grid{display:grid;grid-template-columns:minmax(0,1fr) 100px;gap:10px}
        .mmh3-panel [hidden]{display:none!important}.mmh3-footer{border-top:1px solid #2b3d43;padding:10px 24px;color:#7e9ca5;font-size:11px;display:flex;justify-content:space-between}.mmh3-file-dialog{border:1px solid #41626a;border-radius:12px;background:#18282e;color:#e2efef;width:600px;max-height:80vh;padding:20px}.mmh3-file-dialog::backdrop{background:#0009}.mmh3-file-list{max-height:50vh;overflow:auto;margin:12px 0;display:flex;flex-direction:column;gap:5px}.mmh3-file-list button{text-align:left;background:#22383f;color:#c9e2e4;border:1px solid #34535e;border-radius:5px;padding:9px;overflow-wrap:anywhere}
    `;
    style.textContent += `
        .mmh3-preview{border:1px solid #365059;border-radius:10px;background:#0e171c;overflow:hidden}.mmh3-preview-frame{height:420px;display:flex;align-items:center;justify-content:center;color:#7e9ca5}.mmh3-preview-frame img,.mmh3-preview-frame video{width:100%;height:100%;object-fit:contain}.mmh3-preview-info{padding:10px 12px;border-top:1px solid #293e46;display:flex;gap:12px;align-items:center}.mmh3-preview-info span{font-size:12px;color:#9fbbc1;white-space:nowrap}.mmh3-preview-info progress{width:100%;height:8px;accent-color:#76c9b6}.mmh3-preview-empty{text-align:center;line-height:1.8;font-size:12px}
    `;
    root.append(style);
    const element = (tag, className, text) => {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (text != null) el.textContent = text;
        return el;
    };
    const get = name => widgets.get(name)?.value;
    const set = (name, value) => {
        const widget = widgets.get(name);
        if (!widget) return;
        widget.value = value;
        widget.callback?.(value);
        node.graph?.change();
        updateSamplingControls();
    };
    const boundControls = [];
    function field(name, label) {
        const widget = widgets.get(name);
        const row = element("label", "mmh3-field");
        row.append(element("span", "", label));
        const choices = typeof widget.options?.values === "function" ? widget.options.values() : widget.options?.values;
        const control = element(choices ? "select" : name === "prompt" ? "textarea" : "input");
        if (choices) {
            for (const value of choices) control.append(new Option(String(value), String(value)));
        } else if (typeof widget.value === "boolean") {
            control.type = "checkbox";
        } else if (typeof widget.value === "number") {
            control.type = "number";
            control.step = name.includes("steps") || name === "seed" || name === "chunk_tokens" || name === "crf" ? "1" : "0.01";
            if (widget.options?.min != null) control.min = widget.options.min;
            if (widget.options?.max != null) control.max = widget.options.max;
        }
        const read = () => {
            if (control.type === "checkbox") control.checked = Boolean(widget.value);
            else control.value = String(widget.value ?? "");
        };
        read();
        control.addEventListener("input", () => {
            const value = control.type === "checkbox" ? control.checked : control.type === "number" ? Number(control.value) : control.value;
            if (control.type === "number" && (control.value === "" || !Number.isFinite(value))) return;
            set(name, value);
        });
        boundControls.push({control, read, widget, value: widget.value});
        row.append(control);
        return row;
    }
    const head = element("div", "mmh3-head");
    const brand = element("div");
    brand.append(element("div", "mmh3-brand", "MiniMan H3"));
    head.append(brand);
    root.append(head);
    const tabs = element("div", "mmh3-tabs");
    root.append(tabs);
    const body = element("div", "mmh3-body");
    const media = element("aside", "mmh3-media");
    const editor = element("div", "mmh3-editor");
    body.append(media, editor);
    root.append(body);
    const sectionTitle = (parent, title, subtitle) => {
        const heading = element("div", "mmh3-section");
        heading.append(element("h3", "", title), element("span", "", subtitle));
        parent.append(heading);
        return heading;
    };
    sectionTitle(media, "参考素材", "");
    const mediaTabs = element("div", "mmh3-media-tabs");
    const gallery = element("div", "mmh3-gallery");
    const mediaActions = element("div", "mmh3-media-actions");
    const upload = element("button", "mmh3-action", "上传素材");
    const choose = element("button", "mmh3-action", "选择已有文件");
    mediaActions.append(upload, choose);
    const status = element("div", "mmh3-status");
    media.append(mediaTabs, gallery, mediaActions, status);
    const counts = {images: 9, videos: 3, audios: 3};
    const captions = {images: "图片", videos: "视频", audios: "音频"};
    let activeMedia = "images";
    let files;
    const filename = item => typeof item === "string" ? item : item?.file;
    const saveFiles = () => set("reference_files", JSON.stringify(files));
    const mediaButtons = new Map();
    for (const group of Object.keys(counts)) {
        const button = element("button");
        button.addEventListener("click", () => { activeMedia = group; renderMedia(); });
        mediaTabs.append(button);
        mediaButtons.set(group, button);
    }
    const picker = element("input");
    picker.type = "file";
    picker.multiple = true;
    picker.hidden = true;
    root.append(picker);
    let targetSlot = null;
    function pickUpload(index = null) {
        targetSlot = index;
        picker.accept = activeMedia === "images" ? "image/*" : activeMedia === "videos" ? "video/*" : "audio/*";
        picker.value = "";
        picker.click();
    }
    function putFile(group, name, index = null) {
        const value = group === "videos" ? {file: name, use_audio: false} : name;
        if (index != null && index < files[group].length) files[group][index] = value;
        else files[group].push(value);
        saveFiles();
    }
    picker.addEventListener("change", async () => {
        const group = activeMedia;
        let slot = targetSlot;
        upload.disabled = true;
        try {
            for (const file of picker.files) {
                status.textContent = `正在上传 ${file.name}…`;
                const data = new FormData();
                data.append("image", file);
                data.append("type", "input");
                const response = await transport.fetch("/upload/image", {method: "POST", body: data});
                if (!response.ok) throw new Error(`上传失败（${response.status}）`);
                const result = await response.json();
                putFile(group, [result.subfolder, result.name].filter(Boolean).join("/"), slot);
                slot = null;
            }
            status.textContent = "素材已保存到本机输入目录";
        } catch (error) {
            status.textContent = error.message;
        } finally {
            upload.disabled = false;
            renderMedia();
        }
    });
    upload.addEventListener("click", () => pickUpload());
    choose.addEventListener("click", async () => {
        const group = activeMedia;
        const kind = group === "images" ? "LoadImage" : group === "videos" ? "VHS_LoadVideo" : "LoadAudio";
        const name = group === "images" ? "image" : group === "videos" ? "video" : "audio";
        try {
            const response = await transport.fetch(`/object_info/${kind}`);
            if (!response.ok) throw new Error(`无法读取文件列表（${response.status}）`);
            const info = await response.json();
            const definition = info[kind].input.required[name];
            const options = Array.isArray(definition[0]) ? definition[0] : definition[1].options;
            const dialog = element("dialog", "mmh3-file-dialog");
            dialog.append(element("strong", "", `选择已有${captions[group]}`));
            const search = element("input");
            search.placeholder = "搜索文件名";
            const list = element("div", "mmh3-file-list");
            const render = () => {
                list.replaceChildren();
                for (const file of options.filter(file => file.toLowerCase().includes(search.value.toLowerCase()))) {
                    const button = element("button", "", file);
                    button.addEventListener("click", () => { putFile(group, file); renderMedia(); dialog.close(); });
                    list.append(button);
                }
                if (!list.children.length) list.append(element("div", "mmh3-help", "没有匹配文件，请上传素材。"));
            };
            search.addEventListener("input", render);
            const close = element("button", "mmh3-action", "取消");
            close.addEventListener("click", () => dialog.close());
            dialog.addEventListener("close", () => dialog.remove());
            dialog.append(search, list, close);
            root.append(dialog);
            render();
            dialog.showModal();
        } catch (error) {
            status.textContent = error.message;
        }
    });
    function renderMedia() {
        gallery.replaceChildren();
        gallery.className = `mmh3-gallery ${activeMedia === "images" ? "" : activeMedia === "videos" ? "video" : "audio"}`;
        for (const [group, button] of mediaButtons) {
            button.textContent = `${captions[group]} ${files[group].length}/${counts[group]}`;
            button.classList.toggle("active", group === activeMedia);
        }
        const items = files[activeMedia];
        for (let index = 0; index < Math.max(counts[activeMedia], items.length); index++) {
            const item = items[index];
            const name = filename(item);
            const card = element("div", "mmh3-card");
            const thumb = element("div", "mmh3-thumb");
            if (name) {
                const view = element(activeMedia === "images" ? "img" : activeMedia === "videos" ? "video" : "audio");
                view.src = transport.view(name);
                if (activeMedia === "images") view.alt = `参考图 ${index + 1}`;
                else { view.controls = true; view.preload = "metadata"; }
                thumb.append(view);
                const remove = element("button", "mmh3-remove", "×");
                remove.title = "移除此参考";
                remove.addEventListener("click", () => { items.splice(index, 1); saveFiles(); renderMedia(); });
                card.append(remove);
            } else {
                thumb.append(element("span", "mmh3-empty", "+"));
                thumb.title = "上传参考素材";
                thumb.addEventListener("click", () => pickUpload(index));
            }
            card.append(thumb, element("div", "mmh3-card-info", name || `${captions[activeMedia]} ${index + 1} · 点击上传`));
            if (name && activeMedia === "videos") {
                const label = element("label", "mmh3-switch");
                label.style.padding = "5px 9px 10px";
                const toggle = element("input");
                toggle.type = "checkbox";
                toggle.checked = Boolean(item.use_audio);
                toggle.addEventListener("change", () => { item.use_audio = toggle.checked; saveFiles(); });
                label.append(toggle, document.createTextNode("同时参考视频原声"));
                card.append(label);
            }
            gallery.append(card);
        }
    }
    const pages = new Map();
    const tabButtons = new Map();
    for (const [id, label] of [["create", "创作"], ["sampling", "采样设置"], ["models", "模型"], ["loras", "LoRA"], ["advanced", "高级设置"]]) {
        const page = element("section");
        page.hidden = id !== "create";
        pages.set(id, page);
        editor.append(page);
        const button = element("button", id === "create" ? "active" : "", label);
        button.addEventListener("click", () => {
            for (const [key, page] of pages) page.hidden = key !== id;
            for (const [key, tab] of tabButtons) tab.classList.toggle("active", key === id);
            editor.style.overflowY = id === "create" ? "hidden" : "auto";
            editor.scrollTop = 0;
        });
        tabButtons.set(id, button);
        tabs.append(button);
    }
    const create = pages.get("create");
    sectionTitle(create, "提示词", "");
    const prompt = field("prompt", "");
    prompt.classList.add("mmh3-group");
    prompt.firstChild.remove();
    create.append(prompt);
    const basics = element("div", "mmh3-grid mmh3-group");
    for (const [name, label] of [["seconds", "生成时长 · 秒"], ["aspect_ratio", "画面比例"]]) {
        if (widgets.has(name)) basics.append(field(name, label));
    }
    create.append(basics);
    const sampling = pages.get("sampling");
    sectionTitle(sampling, "采样开关与步数", "仅计算已启用阶段的步数");
    const stages = element("div", "mmh3-stages");
    const stageCards = new Map();
    for (const [id, label, description] of [["first", "01 · 一采", "基础内容"], ["second", "02 · 二采", "放大细化"], ["third", "03 · 三采", "最终细化"]]) {
        const card = element("div", "mmh3-stage");
        stageCards.set(id, card);
        const heading = element("div", "mmh3-stage-header");
        heading.append(element("span", "", label));
        if (id !== "first") {
            const toggle = field(`${id}_pass`, "启用");
            toggle.className = "mmh3-switch";
            toggle.prepend(toggle.lastChild);
            heading.append(toggle);
        } else heading.append(element("span", "mmh3-sub", "始终启用"));
        card.append(heading, element("div", "mmh3-sub", description), field(`${id}_steps`, "采样步数"), field(`${id}_mp`, "目标分辨率 · MP"));
        stages.append(card);
    }
    sampling.append(stages, element("div", "mmh3-note", "关闭二采时，三采直接接一采结果。关闭的阶段不会执行放大和采样。"));
    const previewHeading = sectionTitle(create, "采样预览", "ComfyUI 原生实时预览");
    const preview = element("div", "mmh3-preview");
    const previewFrame = element("div", "mmh3-preview-frame");
    const previewEmpty = element("div", "mmh3-preview-empty", "等待采样画面");
    previewEmpty.style.whiteSpace = "pre-line";
    const previewImage = element("img");
    previewImage.alt = "H3 实时采样预览";
    previewImage.hidden = true;
    const finalVideo = element("video");
    finalVideo.controls = true;
    finalVideo.autoplay = false;
    finalVideo.playsInline = true;
    finalVideo.preload = "metadata";
    finalVideo.hidden = true;
    previewFrame.append(previewEmpty, previewImage, finalVideo);
    const previewInfo = element("div", "mmh3-preview-info");
    const previewStatus = element("span", "", "尚未开始");
    const previewProgress = element("progress");
    previewProgress.max = 1;
    previewProgress.value = 0;
    previewInfo.append(previewStatus, previewProgress);
    preview.append(previewFrame, previewInfo);
    create.append(preview);
    const output = element("div", "mmh3-group");
    output.style.marginTop = "20px";
    output.append(field("filename_prefix", "成片保存前缀"));
    pages.get("advanced").append(output);
    sectionTitle(pages.get("models"), "模型与编码器", "沿用原三采工作流");
    for (const [name, label] of [["first_model", "一、二采 · FastH3 主模型"], ["third_model", "三采 · 独立 H3 主模型"], ["clip_name", "文本编码器"], ["video_vae", "视频 VAE"], ["audio_vae", "音频 VAE"], ["upscale_model", "潜空间放大模型"]]) {
        const row = field(name, label);
        row.classList.add("mmh3-group");
        pages.get("models").append(row);
    }
    sectionTitle(pages.get("loras"), "三采 LoRA", "选择 None 或强度 0 可禁用");
    for (const [name, label] of [["combat", "动作与战斗"], ["hybrid", "混合加速 · Bypass"], ["eros", "Turbo 加速"], ["motion", "动作修复"], ["lms", "LMS"], ["cinema", "电影质感"]]) {
        const card = element("div", "mmh3-lora");
        sectionTitle(card, label, "");
        const grid = element("div", "mmh3-lora-grid");
        grid.append(field(`lora_${name}`, "模型文件"), field(`strength_${name}`, "强度"));
        card.append(grid);
        pages.get("loras").append(card);
    }
    sectionTitle(pages.get("advanced"), "采样与性能", "更小的 FFN 分块通常更省显存");
    const advanced = element("div", "mmh3-grid");
    for (const [name, label] of [["seed", "随机种子"], ["control_after_generate", "运行后种子"], ["sampler_name", "采样算法"], ["scheduler", "调度算法"], ["attention", "注意力后端"], ["sparse_attention", "启用 VSA 稀疏注意力"], ["keep_percent", "VSA 保留比例"], ["chunk_tokens", "FFN 分块 Token"], ["shift_video", "视频 Sigma Shift"], ["shift_audio", "音频 Sigma Shift"], ["upscale_device", "放大设备"], ["upscale_precision", "放大精度"], ["audio_rate", "音频速度"], ["crf", "视频 CRF"]]) advanced.append(field(name, label));
    pages.get("advanced").append(advanced);
    function updateSamplingControls() {
        for (const id of ["second", "third"]) {
            const card = stageCards?.get(id);
            if (!card) continue;
            const enabled = Boolean(get(`${id}_pass`));
            card.classList.toggle("off", !enabled);
            for (const control of card.querySelectorAll('input[type="number"]')) control.disabled = !enabled;
        }
    }
    function sync() {
        files = JSON.parse(get("reference_files") || '{"images":[],"videos":[],"audios":[]}');
        for (const group of Object.keys(counts)) files[group] ||= [];
        for (const {control, read} of boundControls) if (document.activeElement !== control) read();
        renderMedia();
        updateSamplingControls();
    }
    function refresh() {
        let changed = false;
        for (const item of boundControls) {
            if (item.value === item.widget.value || document.activeElement === item.control) continue;
            item.read();
            item.value = item.widget.value;
            changed = true;
        }
        if (changed) updateSamplingControls();
    }
    let previewUrl;
    function showPreview(blob, stage) {
        previewHeading.firstChild.textContent = "采样预览";
        previewHeading.lastChild.textContent = "ComfyUI 原生实时预览";
        finalVideo.pause();
        finalVideo.hidden = true;
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        previewUrl = URL.createObjectURL(blob);
        previewImage.src = previewUrl;
        previewImage.hidden = false;
        previewEmpty.hidden = true;

    }
    function resetStageProgress() {
        previewProgress.max = 1;
        previewProgress.value = 0;
        previewStatus.textContent = "尚未开始";
    }
    function setStageProgress(value, max, stage, state = "running") {
        const status = {running: "采样中", finished: "完成", error: "失败"}[state] || "等待";
        previewProgress.max = max;
        previewProgress.value = value;
        previewStatus.textContent = `${stage} · ${value}/${max} 步 · ${status}`;
    }
    function setPreviewProgress(value, max, stage) {
        setStageProgress(value, max, stage);
    }
    function setPreviewStatus(text) {
        previewStatus.textContent = text;
    }
    function showVideo(src) {
        previewHeading.firstChild.textContent = "生成成片";
        previewHeading.lastChild.textContent = "";
        if (previewUrl) { URL.revokeObjectURL(previewUrl); previewUrl = null; }
        previewImage.hidden = true;
        previewEmpty.hidden = true;
        finalVideo.pause();
        finalVideo.src = src;
        finalVideo.hidden = false;
        previewStatus.textContent = "生成完成";
        previewProgress.value = previewProgress.max;
    }
    function destroy() {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        finalVideo.pause();
        finalVideo.removeAttribute("src");
        finalVideo.load();
    }
    for (const event of ["pointerdown", "keydown", "wheel"]) root.addEventListener(event, e => e.stopPropagation());
    sync();
    return {element: root, sync, refresh, showPreview, showVideo, setPreviewProgress, setStageProgress, resetStageProgress, setPreviewStatus, destroy};
}




