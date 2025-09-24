import { CH } from "../../helpers/canvas-helpers.js";
import * as EH from "../export-ui/export-helpers.js";

export function insertPresentUiHtml() {
    if (document.getElementById('present-content') !== null) return;

    document.getElementById('generation-content').insertAdjacentHTML('beforeend', `
        <div id="present-content" class="dark-overlay top-stacking-overlay">
            <div class="large-pop-up-banner">
                <div class="present-side-bar" id="present-side-bar">
                <div class="present-exit-wrap">
                    <button class="present-button present-exit-button tooltip-base tooltip-right present-tooltip" id="present-exit-button" data-tooltip="Exit">&#x2715;</button>
                </div>
                <div class="present-options-wrap">
                    <button id="present-generate-btn" class="present-button present-generate-btn tooltip-base tooltip-right present-tooltip" data-tooltip="Generate">&#x21bb;</button>
                    <button id="present-answer-btn" class="present-button present-answer-btn">
                        <span>A</span>
                        <div class="present-ans-tooltip-wrap">
                            <div class="preset-tooltip-content">
                                <h3 class="preset-descriptor preset-tooltip-title present-ans-title">Answer:</h3>
                                <div class="preset-descriptor preset-tooltip-math" id="present-answer-wrap"></div>
                            </div>
                        </div>
                    </button>
                    <button id="present-copy-btn" class="present-button present-copy-btn tooltip-base tooltip-right present-tooltip" data-tooltip="Copy">
                    <img class="present-btn-img" src="images/copy.png" alt="copy" />
                    </button>
                    <button id="present-save-btn" class="present-button present-save-btn tooltip-base tooltip-right present-tooltip" data-tooltip="Save">
                    <img class="present-btn-img" src="images/save.png" alt="save" />
                    </button>
                </div>
                </div>
                <div class="present-canvas-wrap" id="present-canvas-wrap"></div>
            </div>
        </div>
    `);
}

export function clearPreviousProblem(ui_state) {
    document.getElementById('present-canvas-wrap').innerHTML = '';
    delete ui_state.problem_img;

    document.getElementById('present-answer-wrap').innerHTML = '';
    delete ui_state.answer_img;
}

export async function insertCurrentProblem(ui_state) {
    const rendered_Q = document.getElementById('rendered-Q');
    
    let problem_img;    
    if (rendered_Q.firstElementChild.tagName === 'CANVAS') {
        const canvas_data_url = rendered_Q.firstElementChild.toDataURL('image/png');

        problem_img = document.createElement('img');

        const img_load = new Promise((resolve) => {
            problem_img.onload = resolve;
        });

        problem_img.src = canvas_data_url;
        await img_load;
    }
    else {
        const problem_tex = rendered_Q.getAttribute('data-latexcode');

        problem_img = (await mjx_loader.texToImg([[problem_tex, 6]]))[0];
    }

    document.getElementById('present-canvas-wrap').appendChild(problem_img);
    ui_state.problem_img = problem_img;

    const rendered_A = document.getElementById('rendered-A');

    let answer_img;
    if (rendered_A.firstElementChild.tagName === 'CANVAS') {
        answer_img = CH.getCanvasClone(rendered_A.firstElementChild);

        const canvas_data_url = answer_img.toDataURL('image/png');

        answer_img = document.createElement('img');

        const img_load = new Promise((resolve) => {
            answer_img.onload = resolve;
        });

        answer_img.src = canvas_data_url;
        await img_load;
    }
    else {
        const answer_tex = rendered_A.getAttribute('data-latexcode');

        answer_img = (await mjx_loader.texToImg([[answer_tex, 2]]))[0];
    }

    answer_img.classList.add('present-ans-math');
    document.getElementById('present-answer-wrap').appendChild(answer_img);
    ui_state.answer_img = answer_img;
}

export async function createExportBlob(ui_state) {
    const export_canvas = document.createElement('canvas');
    const ctx_export_canvas = export_canvas.getContext('2d')
    const canvas_width = 1920;
    const canvas_height = 1080;
    export_canvas.width = canvas_width;
    export_canvas.height = canvas_height;

    ctx_export_canvas.fillStyle = 'rgb(255, 255, 255)';
    ctx_export_canvas.fillRect(0, 0, canvas_width, canvas_height);
    
    CH.setCurrentCanvas(export_canvas, ctx_export_canvas);
    export_canvas["__draw_width__"] = canvas_width;
    export_canvas["__draw_height__"] = canvas_height;

    // dimensions related to the problem size
    const top_offset = 0.05;
    const max_height = 0.15;
    const max_width = 0.75; 
    const natural_width = ui_state.problem_img.naturalWidth;
    const natural_height = ui_state.problem_img.naturalHeight;

    const x_overflow_factor = natural_width / (max_width * canvas_width);
    const y_overflow_factor = natural_height / (max_height * canvas_height);

    const has_overflow = (x_overflow_factor > 1 || y_overflow_factor > 1);
    const direction_max_overflow = (x_overflow_factor > y_overflow_factor)? 'x' : 'y';

    let final_width, final_height;
    if (has_overflow && direction_max_overflow === 'x') { 
        final_width = max_width * canvas_width;
        final_height = natural_height * (final_width / natural_width);
    }
    else if (has_overflow && direction_max_overflow === 'y') {
        final_height = max_height * canvas_height;
        final_width = natural_width * (final_height / natural_height);
    }
    else { // problem fits at its natural size
        final_width = natural_width;
        final_height = natural_height;
    }

    const problem_b_rect = {
        x1: (canvas_width / 2) - (final_width / 2), 
        y1: (1 - top_offset) * canvas_height - final_height, 
        x2: (canvas_width / 2) + (final_width / 2), 
        y2: (1 - top_offset) * canvas_height
    };

    CH.drawImage(ui_state.problem_img, problem_b_rect);

    ui_state.canvas_png_blob = await EH.exportCanvasAsBlob(export_canvas, 'png');
}

export function downloadCanvas(ui_state) {
    EH.downloadBlob(ui_state.canvas_png_blob, 'board-problem');
}

export function copyCanvas(ui_state) {
    EH.copyPngToClipboard(ui_state.canvas_png_blob);
}

export function setCopyCoolDown() {
    const copy_button_el = document.getElementById('present-copy-btn');
    
    copy_button_el.setAttribute('data-status', 'copy-cooldown');

    if (copy_button_el._timeoutId) {
        clearTimeout(copy_button_el._timeoutId);
    }

    copy_button_el._timeoutId = setTimeout(() => {
        copy_button_el.setAttribute('data-status', 'default');
        copy_button_el._timeoutId = null; 
    }, 2000);
}