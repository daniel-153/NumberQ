import * as UH from '../../helpers/ui-helpers.js';
import * as FH from '../../helpers/form-helpers.js';

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
    pg_ui_state.question_obj.error_locations = question_obj.error_locations;
    pg_ui_state.question_obj.output_settings = question_obj.settings;
}

export async function switchGenInfo(pg_ui_state, func_name, display_name) {
    if (pg_ui_state.func_name === null || pg_ui_state.func_name !== func_name) {
        pg_ui_state.func_name = func_name;
        pg_ui_state.display_name = display_name;
        pg_ui_state.first_generation = true;
        pg_ui_state.current_module = await import(`../../math-gens/gens/${func_name}.js`);
        pg_ui_state.current_gen_func = pg_ui_state.current_module.default;
    }
}

export function getCurrentSettings(pg_ui_state, form_ID) {
    if (pg_ui_state.first_generation) { 
        pg_ui_state.input_settings = pg_ui_state.current_module.get_presets();
    }
    else { 
        if (pg_ui_state.randomize_all) { 
            pg_ui_state.input_settings = pg_ui_state.current_module.get_rand_settings();
        }
        else {
            pg_ui_state.input_settings = FH.getFormObject(form_ID)
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

export function updateFirstGenStatus(pg_ui_state) {
    pg_ui_state.first_generation = false;
}