import * as PH from './present-helpers.js';

const ui_state = {
    first_present_ui_open: true,
    problem_img: null,
    answer_img: null,
    canvas_png_blob: null,
    current_gen_func: null
};

export async function buildNewPresentUi() {
    if (ui_state.first_present_ui_open) {
        PH.insertPresentUiHtml();
        ui_state.first_present_ui_open = false;
    }

    PH.clearPreviousProblem(ui_state);

    await PH.insertCurrentProblem(ui_state);

    await PH.createExportBlob(ui_state);
}

export async function updateProblem() {
    PH.clearPreviousProblem(ui_state);

    await PH.insertCurrentProblem(ui_state);

    await PH.createExportBlob(ui_state);
}

export function downloadCanvas() {
    PH.downloadCanvas(ui_state);
}

export function copyCanvas() {
    PH.copyCanvas(ui_state);

    PH.setCopyCoolDown();
}