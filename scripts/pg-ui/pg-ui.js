import * as PH from './helpers/gen-sequence.js';
import * as FH from '../helpers/form-helpers.js';
import * as UH from '../helpers/ui-helpers.js';

const pg_ui_state = {
    current_module: null,
    current_gen_func: null,
    func_name: null,
    display_name: null,
    current_settings: null,
    possible_settings_log: null,
    question_obj: {
        question: null,
        answer: null,
        TeXquestion: null,
        TeXanswer: null,
    },
    error_locations: null,
    randomize_all: false,
    first_pg_ui_open: true, // very first time any 'generate' button on a mode banner is clicked (first time the pg-ui pops up in a session)
    first_with_current_gen: false // first generation with the current module
};

export async function generate(func_name, display_name = '') {
    if (pg_ui_state.first_pg_ui_open) { // first generation with any mode
        UH.addTextAutofitter(document.getElementById('un-rendered-Q'), '1.2vw');
        UH.addTextAutofitter(document.getElementById('un-rendered-A'), '1.2vw');
    }

    if (pg_ui_state.first_pg_ui_open || func_name !== pg_ui_state.func_name) { // first generation with any mode Or switched to a new gen
        await PH.switchGenInfo(pg_ui_state, func_name, display_name); // switch all the info to the new or current gen-module
        PH.insertGenTitle(display_name, "generator-name");
        PH.adjustOutputBoxSizing(func_name);
        pg_ui_state.possible_settings_log = await FH.createSettingsFields(pg_ui_state.current_module.settings_fields, await import('../templates/gen-settings.js'), 'settings-form');
        PH.prelockSettings('settings-form', pg_ui_state.current_module); // lock any pre-locked settings if specified
    }
    
    PH.updateRandomizeAll(pg_ui_state, 'randomize-all-checkbox'); // update randomize all to true if it was checked (false if not)

    PH.getCurrentSettings(pg_ui_state, 'settings-form'); // get current form values, get_presets, or get_rand_settings into current_settings

    PH.getGenOutput(pg_ui_state, pg_ui_state.current_gen_func(pg_ui_state.current_settings)); // get a new question_obj into the ui state

    PH.updatePGQABoxes(pg_ui_state.question_obj);

    FH.updateFormValues(pg_ui_state.current_settings, 'settings-form'); 

    FH.flashFormElements(Array.from(pg_ui_state.error_locations), 'settings-form');

    pg_ui_state.first_pg_ui_open = false; // no longer the first generation
    pg_ui_state.first_with_current_gen = false; // no longer first with current gen (but this could get flipped above - near the start)
}