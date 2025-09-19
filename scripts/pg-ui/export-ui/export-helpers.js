import { CH } from "../../helpers/canvas-helpers.js";
import { templates } from "../../templates/topic-banners.js";

export function insertExportUiHtml() {
    // additional safety check (make sure the dom doesn't already have the export content)
    if (document.getElementById('export-content') !== null) return;

    document.getElementById('generation-content').insertAdjacentHTML('beforeend', `
        <div id="export-content" class="dark-overlay hidden-content">
        <div class="pop-up-banner">
          <div class="main-pop-up-content">
            <div id="export-preview-wrapper" class="export-preview-wrapper checkerboard"></div>
            <div class="export-form-wrapper">
              <h3 class="export-form-header">File Type:</h3>
              <form id="export-form" class="export-form">
                <div
                  class="outer-radio-button-wrapper auto-spaced-radio-buttons"
                >
                  <div class="inner-radio-button-wrapper">
                    <div class="radio-circle-wrapper">
                      <input
                        type="radio"
                        name="export-file-type"
                        value="png"
                        class="radio-buttons export-radio-buttons"
                        id="file-type-png"
                      />
                    </div>
                    <label for="file-type-png" class="radio-button-label export-radio-label"
                      ><span class="file-type-name">PNG</span>
                      (recommended)</label
                    >
                  </div>
                  <div class="inner-radio-button-wrapper">
                    <div class="radio-circle-wrapper">
                      <input
                        type="radio"
                        name="export-file-type"
                        value="jpeg"
                        class="radio-buttons export-radio-buttons"
                        id="file-type-jpeg"
                      />
                    </div>
                    <label for="file-type-jpeg" class="radio-button-label export-radio-label"
                      ><span class="file-type-name">JPEG</span> (smaller
                      file)</label
                    >
                  </div>
                  <div class="inner-radio-button-wrapper">
                    <div class="radio-circle-wrapper">
                      <input
                        type="radio"
                        name="export-file-type"
                        value="webp"
                        class="radio-buttons export-radio-buttons"
                        id="file-type-webp"
                      />
                    </div>
                    <label for="file-type-webp" class="radio-button-label export-radio-label"
                      ><span class="file-type-name">WebP</span> (small &
                      sharp)</label
                    >
                  </div>
                  <div class="inner-radio-button-wrapper">
                    <div class="radio-circle-wrapper">
                      <input
                        type="radio"
                        name="export-file-type"
                        value="svg"
                        class="radio-buttons export-radio-buttons"
                        id="file-type-svg"
                      />
                    </div>
                    <label for="file-type-svg" class="radio-button-label export-radio-label"
                      ><span class="file-type-name">SVG</span> (editable)</label
                    >
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div class="pop-up-base">
            <button id="download-button" class="download-button">
              Download
            </button>
          </div>
          <button id="export-exit-button" class="export-exit-button">
            &#x2715;
          </button>
        </div>
      </div>
    `);
}

export function addExportUiListeners() {
    document.getElementById('download-button').addEventListener('click', () => {

    });

    document.getElementById('export-exit-button').addEventListener('click', () => {

    });
}

export function determineExportType(Q_or_A) {
    const content_container = document.getElementById(`rendered-${Q_or_A}`).firstElementChild;

    if (content_container.tagName === 'CANVAS') {
        return 'canvas';
    }
    else return 'latex';
}

export function tweakExportSettings(export_type) {
    // ensure the svg option is only available for latex exports
    const svg_radio_option = document.getElementById('file-type-svg').closest('.inner-radio-button-wrapper');
    if (export_type === 'canvas') svg_radio_option.style.display = 'none';
    else if (export_type === 'latex') svg_radio_option.style.display = 'flex';
}

export function presetExportForm(export_ui_state) {
    // select the png option by default
    document.getElementById('export-form').querySelector('input[name="export-file-type"][value="png"]').checked = true;
}

export function revealExportUi() {
    document.getElementById('export-content').classList.remove('hidden-content');
}

export async function getPreExportContent(export_ui_state) {
    if (export_ui_state.export_type === 'latex') {
        const latex_string = document.getElementById(`rendered-${export_ui_state.export_target}`).getAttribute('data-latexcode');

        export_ui_state.pre_export_element = (await mjx_loader.texToSvg([[latex_string, 15]]))[0];
    }
    else if (export_ui_state.export_type === 'canvas') {
        export_ui_state.pre_export_element = document.getElementById(`rendered-${export_ui_state.export_target}`).firstElementChild;
    }
}

export function displayExportPreview(export_ui_state) {
    if (export_ui_state.export_type === 'latex') export_ui_state.export_preview_copy = export_ui_state.pre_export_element.cloneNode(true);
    else if (export_ui_state.export_type === 'canvas') export_ui_state.export_preview_copy = CH.getCanvasClone(export_ui_state.pre_export_element);
    export_ui_state.export_preview_copy.classList.add('export-preview-image');

    const preview_wrapper = document.getElementById('export-preview-wrapper');
    preview_wrapper.innerHTML = '';
    preview_wrapper.appendChild(export_ui_state.export_preview_copy);
}

export function setPreviewScale(export_ui_state, scale_value) {
    export_ui_state.preview_image_scale = scale_value;

    const preview_wrapper = document.getElementById('export-preview-wrapper');

    const wrapper_width = preview_wrapper.clientWidth;
    const wrapper_height = preview_wrapper.clientHeight;

    let original_width, original_height;
    if (export_ui_state.export_preview_copy.tagName === 'CANVAS') {
        original_width = export_ui_state.export_preview_copy.clientWidth;
        original_height = export_ui_state.export_preview_copy.clientHeight;
    }
    else if (export_ui_state.export_preview_copy.tagName === 'svg') {
        const bbox = export_ui_state.export_preview_copy.getBBox();
        original_width = bbox.width;
        original_height = bbox.height;
    }

    const width_ratio = original_width / wrapper_width;
    const height_ratio = original_height / wrapper_height;

    // Scale uniformly so that the largest dimension matches the scale
    const max_ratio = Math.max(width_ratio, height_ratio);
    const scale_factor = scale_value / max_ratio;

    const new_width_px = original_width * scale_factor;
    const new_height_px = original_height * scale_factor;

    const vw = document.documentElement.clientWidth;
    export_ui_state.export_preview_copy.style.width = (new_width_px / vw) * 100 + 'vw';
    export_ui_state.export_preview_copy.style.height = (new_height_px / vw) * 100 + 'vw';

    export_ui_state.export_preview_copy.style.width = new_width_px;
    export_ui_state.export_preview_copy.style.height = new_height_px;
}

export function getSelectedFileFormat(export_ui_state) {
    export_ui_state.export_file_format = document.getElementById('export-form').querySelector('input[name="export-file-type"]:checked').value;
}

export function exportCanvasAsBlob(canvas_el, file_format) {
    const mimeType = {
        png: 'image/png',
        jpeg: 'image/jpeg',
        webp: 'image/webp'
    }[file_format];

    if (!mimeType) throw new Error("Unsupported canvas export format: " + file_format);

    const exported_canvas = (file_format === 'jpeg')
        ? (() => {
            // fill in a white background for jpegs (which don't support no-bg images)
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas_el.width;
            tempCanvas.height = canvas_el.height;

            const ctx = tempCanvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            ctx.drawImage(canvas_el, 0, 0);
            return tempCanvas;
        })()
    : canvas_el;

    return new Promise((resolve) => {
        exported_canvas.toBlob(blob => {
            if (!blob) throw new Error("Canvas toBlob failed");
            resolve(blob);
        }, mimeType);
    });
}

export function exportSvgAsBlob(svg_el, file_format) {
    if (file_format === 'svg') {
        const svgString = new XMLSerializer().serializeToString(svg_el);
        return new Blob([svgString], { type: 'image/svg+xml' });
    }

    if (file_format === 'png' || file_format === 'jpeg' || file_format === 'webp') {
        const svgString = new XMLSerializer().serializeToString(svg_el);
        const encoded = encodeURIComponent(svgString);
        const dataUri = "data:image/svg+xml;charset=utf-8," + encoded;

        const img = new Image();

        return new Promise((resolve, reject) => {
            img.onload = async () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.naturalWidth || 800;
                    canvas.height = img.naturalHeight || 600;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    const blob = await exportCanvasAsBlob(canvas, file_format);
                    resolve(blob);
                } catch (err) {
                    reject(err);
                }
            };
            img.onerror = () => reject(new Error("Failed to load SVG image for conversion."));
            img.src = dataUri;
        });
    }

    throw new Error("Unsupported SVG export format: " + file_format);
}

export function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

export function getGenShortName(export_ui_state) {
    const current_gen_func_name = document.getElementById('generate-button').getAttribute('data-gen-func-name');

    let short_name;
    for (let i = 0; i < templates.length; i++) {
        const current_template = templates[i];
        if (current_template.function_name === current_gen_func_name) {
            short_name = current_template.short_name;
            break;
        }
    }

    if (short_name === undefined) short_name = 'generated'; // just in case the gen name couldn't be found or no short name specified

    export_ui_state.gen_short_name = short_name;
}

export function getFileName(export_ui_state) {
    const prefix = export_ui_state.gen_short_name;

    let suffix;
    if (export_ui_state.export_target === 'Q') suffix = 'question';
    else if (export_ui_state.export_target === 'A') suffix = 'answer';

    return `${prefix}-${suffix}`;
}