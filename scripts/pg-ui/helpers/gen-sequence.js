import * as UH from '../../helpers/ui-helpers.js';
import * as FH from '../../helpers/form-helpers.js';
import * as UAH from './ui-actions.js'; 

export function insertGenTitle(gen_title, element_id) {
    document.getElementById(element_id).innerHTML = gen_title;
}

export function adjustOutputBoxSizing(funcName) {
    document.querySelectorAll(".output-box").forEach(element => {
        element.setAttribute("data-special-styles", funcName);
    });

    document.getElementById('fullscreen-question').setAttribute("data-special-styles", funcName);
    document.getElementById('fullscreen-answer').setAttribute("data-special-styles", funcName);
}

export function getGenOutput(pg_ui_state, question_obj) {
    const question = question_obj.question;
    const answer = question_obj.answer;
    const TeXquestion = (question_obj.TeXquestion === undefined) ? question_obj.question : question_obj.TeXquestion;
    const TeXanswer = (question_obj.TeXanswer === undefined) ? question_obj.answer : question_obj.TeXanswer;

    pg_ui_state.question_obj.question = question;
    pg_ui_state.question_obj.answer = answer;
    pg_ui_state.question_obj.TeXquestion = TeXquestion;
    pg_ui_state.question_obj.TeXanswer = TeXanswer;
}

export async function switchGenInfo(pg_ui_state, func_name, display_name) {
    if (func_name !== pg_ui_state.func_name) pg_ui_state.first_with_current_gen = true;
    
    pg_ui_state.func_name = func_name;
    pg_ui_state.display_name = display_name;
    pg_ui_state.current_module = await import(`../../math-gens/gens/${func_name}.js`);
    pg_ui_state.current_gen_func = async function(form_obj) {
        pg_ui_state.error_locations = new Set(); // create a new *Set* of error locations each generation (instead of an array to avoid repeats)
        FH.preValidateSettings(form_obj, pg_ui_state.valid_settings_log, pg_ui_state.error_locations);
        pg_ui_state.current_module.validateSettings(form_obj, pg_ui_state.error_locations); // fill in with appropriate values yielded from processing settings
        return pg_ui_state.current_module.default(form_obj); // a processed form_obj (which we created above) is now a valid settings object
    }
}

export function getCurrentSettings(pg_ui_state, form_ID) {
    if (pg_ui_state.first_pg_ui_open || pg_ui_state.first_with_current_gen) { 
        pg_ui_state.current_settings = FH.resolveRandSettings(pg_ui_state.current_module.get_presets(), pg_ui_state.valid_settings_log);
    }
    else { 
        if (pg_ui_state.randomize_all) {
            const current_form_values = FH.getFormObject(form_ID);
            const rand_form_values = FH.resolveRandSettings(pg_ui_state.current_module.get_rand_settings(), pg_ui_state.valid_settings_log);
            const form_field_statuses = FH.getFormFieldStatuses(form_ID);
            pg_ui_state.current_settings = {}; // need to turn into an object because we are assigning properties one-by-one

            for (const [key, value] of Object.entries(form_field_statuses)) {
                if (value) { // the current setting is locked => use value in the form ('value' is either true or false)
                    pg_ui_state.current_settings[key] = current_form_values[key]
                }
                else { // current settings is unlocked => use the random value from get_rand_settings()
                    pg_ui_state.current_settings[key] = rand_form_values[key];
                }
            }    
        }
        else {
            pg_ui_state.current_settings = FH.getFormObject(form_ID);  
        }
    }
}

export function updateRandomizeAll(pg_ui_state, checkbox_ID) {
    if (document.getElementById(checkbox_ID).checked) {
        pg_ui_state.randomize_all = true;
    }
    else {
        pg_ui_state.randomize_all = false;
    }
}   

export function updatePGQABoxes(question_obj) {
    // main UI (2 rendered boxes and 2 tex boxes)
    UH.updateElementMath('rendered-Q',question_obj.question,'3vw');
    document.getElementById('un-rendered-Q').innerHTML = question_obj.TeXquestion;
    UH.updateElementMath('rendered-A',question_obj.answer,'2.5vw');
    document.getElementById('un-rendered-A').innerHTML = question_obj.TeXanswer;

    // presentation mode (2 rendered boxes)
    UH.updateElementMath('fullscreen-question', question_obj.question, '3.75vw');
    UH.updateElementMath('fullscreen-answer', question_obj.answer, '3.3vw');
}

export function prelockSettings(form_ID, gen_module) {
    if (gen_module['prelocked_settings'] !== undefined) {
        const lock_element_array = Array.from(document.getElementById(form_ID).querySelectorAll('.settings-lock'));

        lock_element_array.forEach(lock_element => {
            // (if any prelocked setting is found on the current lock, lock it)
            if (gen_module['prelocked_settings'].some(element => lock_element.getAttribute('data-values-to-lock').split(',').includes(element))) {
                UAH.toggleSettingsLock(lock_element, 'lock');
            }
        });
    }
}
