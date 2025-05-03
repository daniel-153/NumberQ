import * as worksheet_gen_seq from './helpers/gen-sequence.js';
import * as reg_gen_seq from '../../pg-ui/helpers/gen-sequence.js';
import * as FH from '../../helpers/form-helpers.js';

const pg_ui_state = {
    current_module: null,
    current_gen_func: null,
    func_name: null,
    display_name: null,
    input_settings: null,
    question_obj: {
        question: null,
        answer: null,
        TeXquestion: null,
        TeXanswer: null,
        error_locations: null,
        output_settings: null
    },
    first_generation: true,
    randomize_all: false
};

export async function generate(func_name = pg_ui_state.func_name, display_name = '') {
    await reg_gen_seq.switchGenInfo(pg_ui_state, func_name, display_name); // update the aspects of the ui if needed

    if (pg_ui_state.first_generation) { // switches to the new title, adjusts output box sizing, inserts new settings fields, gets pre-settings
        reg_gen_seq.insertGenTitle(display_name, "ws-gen-title");
        worksheet_gen_seq.adjustOutputBoxSizing(func_name); // does nothing currently
        worksheet_gen_seq.insertModeBanners();
        await FH.createSettingsFields(pg_ui_state.current_module.settings_fields, await import('../../templates/gen-settings.js'), 'pe-settings-form');
    }

    reg_gen_seq.updateRandomizeAll(pg_ui_state, 'pe-randomize-all-checkbox'); // update randomize all to true if it was checked (false if not)
    
    reg_gen_seq.getCurrentSettings(pg_ui_state, 'pe-settings-form'); // get current form values, get_presets, or get_rand_settings into input_settings

    reg_gen_seq.getGenOutput(pg_ui_state, pg_ui_state.current_gen_func(pg_ui_state.input_settings)); // get a new question_obj into the ui state

    worksheet_gen_seq.updatePGQABoxes(pg_ui_state.question_obj);

    FH.updateFormValues(pg_ui_state.question_obj.output_settings, 'pe-settings-form'); 

    reg_gen_seq.updateFirstGenStatus(pg_ui_state);
}