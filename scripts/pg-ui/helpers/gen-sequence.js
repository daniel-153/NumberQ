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
    ['question','answer'].forEach(Q_or_A => {
        // rendered q or a is just the .question or .answer given by the gen
        pg_ui_state.question_obj[Q_or_A] = question_obj[Q_or_A];

        // un-rendered boxes have special rules
        if (question_obj[`TeX${Q_or_A}`] !== undefined) {
            pg_ui_state.question_obj[`TeX${Q_or_A}`] = question_obj[`TeX${Q_or_A}`];
        }
        else if (pg_ui_state[`${Q_or_A}_type`] === 'canvas') {
            pg_ui_state.question_obj[`TeX${Q_or_A}`] = 'image';
        }
        else pg_ui_state.question_obj[`TeX${Q_or_A}`] = question_obj[Q_or_A];
    });
}

export async function switchGenInfo(pg_ui_state, func_name, display_name) {
    if (func_name !== pg_ui_state.func_name) pg_ui_state.first_with_current_gen = true;
    
    pg_ui_state.func_name = func_name;
    pg_ui_state.display_name = display_name;
    pg_ui_state.current_module = await import(`../../math-gens/gens/${func_name}.js`);
    pg_ui_state.gen_type = (pg_ui_state.current_module.gen_type !== undefined)? pg_ui_state.current_module.gen_type : 'latex-Q|latex-A'; 
    pg_ui_state.question_type = pg_ui_state.gen_type.split('|')[0].split('-')[0];
    pg_ui_state.answer_type = pg_ui_state.gen_type.split('|')[1].split('-')[0];
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
                if (
                    value || // the current setting is locked => use value in the form ('value' is either true or false)
                    rand_form_values[key] === undefined // Or: get_rand_settings didn't include this setting (it shouldn't be randomized)
                ) { 
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

export function updatePGQABoxes(question_obj, sizes_obj, question_type, answer_type) {
    ['Q', 'A'].forEach(Q_or_A => {
        const box_type = (Q_or_A === 'Q')? 'question' : 'answer';
        const output_type = (Q_or_A === 'Q')? question_type : answer_type;
        
        // un-rendered box content is always just the TeX(q/a)
        document.getElementById(`un-rendered-${Q_or_A}`).innerHTML = question_obj[`TeX${box_type}`];
        
        // rendered box requires handling with size adjustments and output types
        if (output_type === 'latex') {
            UH.updateElementMath(`rendered-${Q_or_A}`, question_obj[box_type], sizes_obj[`${Q_or_A.toLowerCase()}_font_size`]);
        }
        else if (output_type === 'canvas') {
            const output_box_size = document.getElementById(`rendered-${Q_or_A}`).style.width;

            const output_canvas = question_obj[box_type];

            output_canvas.style.width = output_box_size;
            output_canvas.style.height = output_box_size;

            document.getElementById(`rendered-${Q_or_A}`).innerHTML = '';
            document.getElementById(`rendered-${Q_or_A}`).appendChild(output_canvas);
        }
    });
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

const SAH = { // resolveSizeAdjustments helpers
    default_sizes: null,
    getDefaultSizes: function () {
        const view_width_px = document.documentElement.clientWidth;

        // clear previously applied inline styles
        const rendered_Q = document.getElementById('rendered-Q');
        const rendered_A = document.getElementById('rendered-A');
        document.getElementById('rendered-Q').removeAttribute('style');
        document.getElementById('rendered-A').removeAttribute('style');

        // get the necessary information
        SAH.default_sizes = {};
        SAH.default_sizes.width = rendered_Q.clientWidth / view_width_px * 100 + 'vw';
        SAH.default_sizes.height = rendered_Q.clientHeight / view_width_px * 100 + 'vw';
        SAH.default_sizes.q_font_size = parseFloat(getComputedStyle(rendered_Q).fontSize) / view_width_px * 100 + 'vw';
        SAH.default_sizes.a_font_size = parseFloat(getComputedStyle(rendered_A).fontSize) / view_width_px * 100 + 'vw';
    },
    setFinalSize: function(size_name, scale_factor, pg_ui_state) {
        pg_ui_state.sizes[size_name] = Number(SAH.default_sizes[size_name].slice(0, -2)) * scale_factor + 'vw';
    },
    getMaxWidth: function(pg_ui_box_type) {
        const vw = document.documentElement.clientWidth;
        const pg_ui_banner_width = document.getElementById('generation-container').clientWidth;

        // need to handle the layout change on mobile
        let max_single_box_width; // in px to start
        if (vw > 900) { // not mobile
            const flex_gap = parseFloat(getComputedStyle(document.getElementById('Q-A-container')).gap);

            max_single_box_width = (pg_ui_banner_width - flex_gap) / 2 - 0.01 * vw; // 1vw away from the edge of pg-ui banner
        }
        else { // mobile
            max_single_box_width = pg_ui_banner_width - 0.06 * vw; // 6vw less than the pg-ui banner width
        }
        
        if (pg_ui_box_type === 'rendered') {
            return ((max_single_box_width / 1.04) / vw) * 100 + 'vw';
        }
        else if (pg_ui_box_type === 'un-rendered') {
            return (max_single_box_width / vw) * 100 + 'vw';
        }
    },
    applyFinalSizes: function(sizes_obj) {
        // Only the width and height need to be manually applied here (font changes are applied each time math is inserted)
        const mathoutput_border = Number(sizes_obj.width.slice(0, -2)) * 0.02 + 'vw';
        const total_gencol_width = Number(sizes_obj.width.slice(0, -2)) + 2 * Number(mathoutput_border.slice(0, -2)) + 'vw';
        
        ['rendered-Q','rendered-A'].forEach(element_id => {
            const element = document.getElementById(element_id);
            element.style.width = sizes_obj.width;
            element.style.height = sizes_obj.height;
            element.style.borderWidth = mathoutput_border;
            element.style.maxWidth = SAH.getMaxWidth('rendered');
        });

        ['un-rendered-Q', 'un-rendered-A'].forEach(element_id => {
            const element = document.getElementById(element_id);
            element.style.width = total_gencol_width;
            element.style.maxWidth = SAH.getMaxWidth('un-rendered');
        })
    }
};
export function resolveSizeAdjustments(gen_module, pg_ui_state) {
    SAH.getDefaultSizes();

    if (gen_module.size_adjustments !== undefined) { // there is at least one size adjustment in the gen module
        ['width', 'height', 'q_font_size', 'a_font_size'].forEach(size_name => {
            if (gen_module.size_adjustments[size_name] !== undefined) { // non-1 scale factor provided
                SAH.setFinalSize(size_name, gen_module.size_adjustments[size_name], pg_ui_state);
            }
            else { // no scale factor provided (1 ==> use the default size)
                SAH.setFinalSize(size_name, 1, pg_ui_state);
            }
        });

        if (gen_module.size_adjustments.force_square !== undefined) {
            if (
                gen_module.size_adjustments.width !== undefined &&
                gen_module.size_adjustments.height === undefined
            ) { // (only width provided) => force height to match width
                pg_ui_state.sizes.height = pg_ui_state.sizes.width;
            }
            else if (
                gen_module.size_adjustments.height !== undefined &&
                gen_module.size_adjustments.width === undefined
            ) { // (only height provided) => force width to match height
                pg_ui_state.sizes.width = pg_ui_state.sizes.height;
            }
            else console.error('Cannot force square with unspecified width and height or if both a width and height were provided.');
        }
    }
    else { // no size adjustments (use all defaults)
        pg_ui_state.sizes = SAH.default_sizes;
    }

    SAH.applyFinalSizes(pg_ui_state.sizes);
}

export function insertCanvases(question_obj) {
    const output_box_size = document.getElementById('rendered-Q').style.width;

    const prompt_canvas = question_obj.question;
    const answer_canvas = question_obj.answer;

    prompt_canvas.style.width = output_box_size;
    prompt_canvas.style.height = output_box_size;
    answer_canvas.style.width = output_box_size;
    answer_canvas.style.height = output_box_size;

    document.getElementById('rendered-Q').innerHTML = '';
    document.getElementById('rendered-Q').appendChild(prompt_canvas);
    document.getElementById('rendered-A').innerHTML = '';
    document.getElementById('rendered-A').appendChild(answer_canvas);

    document.getElementById('un-rendered-Q').innerHTML = (question_obj.TeXquestion !== undefined)? question_obj.TeXquestion : 'image';
    document.getElementById('un-rendered-A').innerHTML = (question_obj.TeXanswer !== undefined)? question_obj.TeXanswer : 'image';
}

export function insertCopySaveButtons() {
    const createButtonsHtml = function(Q_or_A) {
        return `<div class="export-buttons-wrapper">
                    <div id="r-${Q_or_A}-copy-image-wrapper" class="export-image-wrapper copy-image-wrapper" data-status="default">
                        <img
                            class="export-button-image copy-button-image"
                            src="images/copy.png"
                            alt="copy"
                        />
                    </div>
                    <div id="${Q_or_A}-save-image-wrapper" class="export-image-wrapper save-image-wrapper">
                        <img
                            class="export-button-image save-button-image"
                            src="images/save.png"
                            alt="save"
                        />
                    </div>
                </div>
        `;
    }

    // insert the base html for the buttons
    document.getElementById('Q-column').querySelector('.rendered-box-wrapper').insertAdjacentHTML('afterbegin', createButtonsHtml('Q'));
    document.getElementById('A-column').querySelector('.rendered-box-wrapper').insertAdjacentHTML('afterbegin', createButtonsHtml('A'));

    // add additional styles
    document.getElementById('Q-A-container').insertAdjacentHTML('beforeend',` 
        <style>
            .copy-image-wrapper::before {
                content: 'Copy';
            }

            .copy-image-wrapper[data-status="copy-cooldown"]::before {
                content: 'Copied!';
                opacity: 1;
            }

            .copy-image-wrapper[data-status="copy-cooldown"]::after {
                opacity: 1;
            }

            .save-image-wrapper::before {
                content: 'Save';
            }
        </style>
    `);

    const createSingleCopyButton = function(Q_or_A) {
        return `
            <div
                id="u-${Q_or_A}-copy-image-wrapper"
                class="export-image-wrapper copy-image-wrapper un-rendered-copy-image-wrapper"
                data-status="default"
            >
                <img
                class="export-button-image copy-button-image un-rendered-copy-button"
                src="images/copy.png"
                alt="copy"
                />
            </div>
        `;
    }

    document.getElementById('Q-column').querySelector('.un-rendered-box-wrapper').insertAdjacentHTML('afterbegin', createSingleCopyButton('Q'));
    document.getElementById('A-column').querySelector('.un-rendered-box-wrapper').insertAdjacentHTML('afterbegin', createSingleCopyButton('A'));
}