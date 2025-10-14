import * as PH from './present-helpers.js';
import * as UH from '../../helpers/ui-helpers.js';

const ui_state = {
    first_present_ui_open: true,
    problem_img: null,
    answer_img: null,
    canvas_png_blob: null,
    current_gen_func: null,
    size_adjustments: {},
    stylesheets: ['presentation-styles']
};

export async function buildNewPresentUi() {
    if (ui_state.first_present_ui_open) {
        PH.insertPresentUiHtml();
        await UH.loadStyleSheets(ui_state.stylesheets);
        ui_state.first_present_ui_open = false;
    }

    PH.clearPreviousProblem(ui_state);

    PH.resolveSizeAdjustments(ui_state);

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