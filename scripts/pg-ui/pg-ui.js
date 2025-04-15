import * as PH from './helpers/gen-sequence.js';
import * as FH from '../helpers/form-helpers.js';

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

export async function generate(func_name, display_name = '') {
    await PH.switchGenInfo(pg_ui_state, func_name, display_name); // switches the gen info if needed (does nothing if gen is same)

    if (pg_ui_state.first_generation) { // switches to the new title, adjusts output box sizing, inserts new settings fields, gets pre-settings
        PH.insertGenTitle(display_name);
        PH.adjustOutputBoxSizing(func_name);
        await FH.createSettingsFields(pg_ui_state.current_module.settings_fields, await import('../templates/gen-settings.js'), 'settings-form');
    }
    
    PH.updateRandomizeAll(pg_ui_state, 'randomize-all-checkbox'); // update randomize all to true if it was checked (false if not)

    PH.getCurrentSettings(pg_ui_state, 'settings-form'); // get current form values, get_presets, or get_rand_settings into input_settings

    PH.getGenOutput(pg_ui_state, pg_ui_state.current_gen_func(pg_ui_state.input_settings)); // get a new question_obj into the ui state

    PH.updatePGQABoxes(pg_ui_state.question_obj);

    FH.updateFormValues(pg_ui_state.question_obj.output_settings, 'settings-form'); 

    PH.updateFirstGenStatus(pg_ui_state);
}