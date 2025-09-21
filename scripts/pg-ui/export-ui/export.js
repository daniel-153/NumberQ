import * as EH from './export-helpers.js';

const export_ui_state = {
    first_export_ui_open: true,
    export_target: null, // 'Q' or 'A'
    export_type: null, // 'latex' or 'canvas'
    preview_image_scale: null, // max of the ratio of preview image dimensions to preview wrapper dimensions
    pre_export_element: null, // an svg el or html canvas el
    export_preview_copy: null, // the copy of the canvas or svg that will be used as a preview,
    export_file_format: null,
    gen_short_name: null
};

export async function buildNewExportUi(Q_or_A) {
    if (export_ui_state.first_export_ui_open) {
        EH.insertExportUiHtml();
        export_ui_state.first_export_ui_open = false;
    }
    
    export_ui_state.export_target = Q_or_A;
    export_ui_state.export_type = EH.determineExportType(Q_or_A);
    EH.tweakExportSettings(export_ui_state.export_type);

    EH.presetExportForm(export_ui_state);

    await EH.getPreExportContent(export_ui_state);
    EH.displayExportPreview(export_ui_state);
    if (export_ui_state.export_type === 'latex') EH.setPreviewScale(export_ui_state, 0.6);
    else if (export_ui_state.export_type === 'canvas') EH.setPreviewScale(export_ui_state, 0.85);
}

export async function exportMath() { 
    EH.getSelectedFileFormat(export_ui_state);

    let export_blob;
    if (export_ui_state.export_type === 'latex') {
        export_blob = await EH.exportSvgAsBlob(export_ui_state.pre_export_element, export_ui_state.export_file_format);
    }
    else if (export_ui_state.export_type === 'canvas') {
        export_blob = await EH.exportCanvasAsBlob(export_ui_state.pre_export_element, export_ui_state.export_file_format);
    }

    EH.getGenShortName(export_ui_state);
    EH.downloadBlob(export_blob, `${EH.getFileName(export_ui_state)}.${export_ui_state.export_file_format}`);
}
