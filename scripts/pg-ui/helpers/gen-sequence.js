import * as UH from '../../helpers/ui-helpers.js';
import * as FH from '../../helpers/form-helpers.js';
import * as UAH from './ui-actions.js'; 
import { CH } from "../../helpers/canvas-helpers.js";

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

export function getCurrentSettings(pg_ui_state, form_id) {
    const new_form_obj = FH.getFormObject(form_id);
    
    if (pg_ui_state.preset_is_applied) { // some preset function is to be used
        const preset_name = pg_ui_state.focused_preset;
        const preset_func = pg_ui_state.preset_funcs[preset_name];
        pg_ui_state.current_settings = {}; // reset/initialize

        if (preset_name === 'random') { // 'Randomize All' preset -> need to account for Locking
            const form_field_statuses = FH.getFormFieldStatuses(form_id);
            const new_rand_settings = FH.resolvePresetFuncSettings(preset_func(), pg_ui_state.valid_settings_log);

            for (const [setting_name, is_locked] of Object.entries(form_field_statuses)) {
                if (
                    is_locked || // the current setting is locked => use value in the form ('value' is either true or false)
                    new_rand_settings[setting_name] === undefined // Or: get_rand_settings didn't include this setting (it shouldn't be randomized)
                ) { 
                    pg_ui_state.current_settings[setting_name] = new_form_obj[setting_name];
                }
                else { // current settings is unlocked And a random value was provided => use the random value
                    pg_ui_state.current_settings[setting_name] = new_rand_settings[setting_name];
                }
            }
        }
        else { // all other presets -> Locking can be ignored
            const preset_settings = FH.resolvePresetFuncSettings(preset_func(), pg_ui_state.valid_settings_log);

            for (const [setting_name, setting_form_value] of Object.entries(new_form_obj)) {
                const setting_preset_value = preset_settings[setting_name];

                if (setting_preset_value !== undefined) { // preset func specificed a value for the current setting -> use it
                    pg_ui_state.current_settings[setting_name] = setting_preset_value;
                }
                else { // no value for the current settings is found in the preset -> use the value in the form
                    pg_ui_state.current_settings[setting_name] = setting_form_value;
                }
            }
        }
    }
    else { // entered form values are to be used
        pg_ui_state.current_settings = new_form_obj;
    }
}

export function _getCurrentSettings(pg_ui_state, form_ID) {
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
            let starting_font_size;
            if (document.documentElement.clientWidth <= 900) { // mobile
                starting_font_size = sizes_obj.mobile[`${Q_or_A.toLowerCase()}_font_size`] + 'vw';
            }
            else { // all sizes larger than mobile
                starting_font_size = sizes_obj.desktop[`${Q_or_A.toLowerCase()}_font_size`] + 'vw';
            }

            UH.updateElementMath(`rendered-${Q_or_A}`, question_obj[box_type], starting_font_size);
        }
        else if (output_type === 'canvas') {
            const output_canvas = question_obj[box_type];

            output_canvas.style.width = '100%';
            output_canvas.style.height = '';
            output_canvas.style.aspectRatio = '1';

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
    default_sizes_vw: {
        desktop: {
            width: 30.6,
            height: 6.05, 
            q_font_size: 3,
            a_font_size: 3,
            __preset__: {
                rendered_box_border: 0.61,
                rendered_box_wrap_border: 0.13
            }
        },
        mobile: {
            width: 73.2,
            height: 14.4, 
            q_font_size: 7,
            a_font_size: 7,
            __preset__: {
                rendered_box_border: 1.46,
                rendered_box_wrap_border: 0.31
            }
        }
    },
    getMaxRenderedBoxWidthsVw: function() { // max width for a gen-col on both desktop and mobile
        const output_widths = {};
        const vw = document.documentElement.clientWidth;
        const pg_ui_banner_width = document.getElementById('generation-container').clientWidth;
        let max_gen_col_width; // max width of a gen column (which is sized to fit the rendered box width + its padding + the outer border)
        
        // max width for a single column on desktop (gap between needs to be accounted for)
        const flex_gap = parseFloat(getComputedStyle(document.getElementById('Q-A-container')).gap);
        max_gen_col_width = ( (pg_ui_banner_width - flex_gap) / 2 - 0.01 * vw ) / vw * 100; // 1vw away from the edge of pg-ui banner
        output_widths['desktop'] = max_gen_col_width - 2*this.default_sizes_vw.desktop.__preset__.rendered_box_border - 2*this.default_sizes_vw.desktop.__preset__.rendered_box_wrap_border;
        
        // max width for a single column on mobile (layout switches to vertically stacking gen-cols)
        max_gen_col_width = ( pg_ui_banner_width - 0.06 * vw ) / vw * 100; // 6vw less than the pg-ui banner width
        output_widths['mobile'] = max_gen_col_width - 2*this.default_sizes_vw.mobile.__preset__.rendered_box_border - 2*this.default_sizes_vw.mobile.__preset__.rendered_box_wrap_border;
        
        return output_widths;
    },
    applyFinalSizes: function(final_sizes_vw) {
        let adjusted_pgui_styles = document.getElementById('adjusted-pgui-styles');
        if (adjusted_pgui_styles === null) {
            adjusted_pgui_styles = document.createElement('style');
            adjusted_pgui_styles.id = 'adjusted-pgui-styles';
            document.getElementById('Q-A-container').appendChild(adjusted_pgui_styles);
        }

        const max_rendered_box_widths = SAH.getMaxRenderedBoxWidthsVw();
        const gencol_width_desktop = ( Math.min(final_sizes_vw.desktop.width, max_rendered_box_widths.desktop)
            + 2*final_sizes_vw.desktop.__preset__.rendered_box_border + 2*final_sizes_vw.desktop.__preset__.rendered_box_wrap_border
        );
        const gencol_width_mobile = ( Math.min(final_sizes_vw.mobile.width, max_rendered_box_widths.mobile)
            + 2*final_sizes_vw.mobile.__preset__.rendered_box_border + 2*final_sizes_vw.mobile.__preset__.rendered_box_wrap_border
        );
        const pad_ratio = 0.1;
        const latex_box_pad_desktop = pad_ratio * gencol_width_desktop;
        const latex_box_pad_mobile = pad_ratio * gencol_width_mobile;

        adjusted_pgui_styles.innerHTML = `
            .math-output-wrapper {
                border-width: ${final_sizes_vw.desktop.__preset__.rendered_box_wrap_border}vw;
            }
        
            .rendered-box {
                width: ${final_sizes_vw.desktop.width}vw;
                max-width: ${max_rendered_box_widths.desktop}vw;
                height: ${final_sizes_vw.desktop.height}vw;
                border-width: ${final_sizes_vw.desktop.__preset__.rendered_box_border}vw;
            }

            .latex-box {
                width: ${gencol_width_desktop}vw;
                padding: 0 ${latex_box_pad_desktop}vw 0 ${latex_box_pad_desktop}vw;
            }

            #rendered-Q {
                font-size: ${final_sizes_vw.desktop.q_font_size}vw;
            }

            #rendered-A {
                font-size: ${final_sizes_vw.desktop.a_font_size}vw;
            }

            @media (max-width: 900px) {
                .math-output-wrapper {
                    border-width: ${final_sizes_vw.mobile.__preset__.rendered_box_wrap_border}vw;
                }
            
                .rendered-box {
                    width: ${final_sizes_vw.mobile.width}vw;
                    max-width: ${max_rendered_box_widths.mobile}vw;
                    height: ${final_sizes_vw.mobile.height}vw;
                    border-width: ${final_sizes_vw.mobile.__preset__.rendered_box_border}vw;
                }

                .latex-box {
                    width: ${gencol_width_mobile}vw;
                    padding: 0 ${latex_box_pad_mobile}vw 0 ${latex_box_pad_mobile}vw;
                }

                #rendered-Q {
                    font-size: ${final_sizes_vw.mobile.q_font_size}vw;
                }

                #rendered-A {
                    font-size: ${final_sizes_vw.mobile.a_font_size}vw;
                }
            }
        `;
    }
};
export function resolveSizeAdjustments(gen_module, pg_ui_state) {
    const scaled_sizes_vw = {
        desktop: {},
        mobile: {}
    }

    if (gen_module.size_adjustments !== undefined) { // there is at least one size adjustment in the gen module
        ['width', 'height', 'q_font_size', 'a_font_size'].forEach(size_name => {
            if (gen_module.size_adjustments[size_name] !== undefined) { // non-1 scale factor provided
                scaled_sizes_vw.desktop[size_name] = SAH.default_sizes_vw.desktop[size_name] * gen_module.size_adjustments[size_name];
                scaled_sizes_vw.mobile[size_name] = SAH.default_sizes_vw.mobile[size_name] * gen_module.size_adjustments[size_name];
            }
            else { // no scale factor provided ==> use the default size
                scaled_sizes_vw.desktop[size_name] = SAH.default_sizes_vw.desktop[size_name];
                scaled_sizes_vw.mobile[size_name] = SAH.default_sizes_vw.mobile[size_name];
            }
        });

        if (gen_module.size_adjustments.force_square !== undefined) {
            if (
                gen_module.size_adjustments.width !== undefined &&
                gen_module.size_adjustments.height === undefined
            ) { // (only width provided) => force height to match width
                scaled_sizes_vw.desktop.height = scaled_sizes_vw.desktop.width;
                scaled_sizes_vw.mobile.height = scaled_sizes_vw.mobile.width;
            }
            else if (
                gen_module.size_adjustments.height !== undefined &&
                gen_module.size_adjustments.width === undefined
            ) { // (only height provided) => force width to match height
                scaled_sizes_vw.desktop.width = scaled_sizes_vw.desktop.height;
                scaled_sizes_vw.mobile.width = scaled_sizes_vw.mobile.height;
            }
            else console.error('Cannot force square with unspecified width and height or if both a width and height were provided.');
        }

        scaled_sizes_vw.desktop['__preset__'] = JSON.parse(JSON.stringify(SAH.default_sizes_vw.desktop.__preset__));
        scaled_sizes_vw.mobile['__preset__'] = JSON.parse(JSON.stringify(SAH.default_sizes_vw.mobile.__preset__));
    }
    else { // no size adjustments (use all defaults)
        scaled_sizes_vw.desktop = JSON.parse(JSON.stringify(SAH.default_sizes_vw.desktop));
        scaled_sizes_vw.mobile = JSON.parse(JSON.stringify(SAH.default_sizes_vw.mobile));
    }

    SAH.applyFinalSizes(scaled_sizes_vw);

    // update the values in the pg-ui-state
    pg_ui_state.sizes['desktop'] = JSON.parse(JSON.stringify(scaled_sizes_vw.desktop));
    pg_ui_state.sizes['mobile'] = JSON.parse(JSON.stringify(scaled_sizes_vw.mobile));
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

export function endGeneration(pg_ui_state) {
    pg_ui_state.first_pg_ui_open = false; // no longer the first generation
    pg_ui_state.first_with_current_gen = false; // no longer first with current gen (but this could get flipped above - near the start)
    pg_ui_state.is_currently_generating = false;
}

export async function loadMjxExtensions(gen_module, pg_ui_state) {
    pg_ui_state.required_mjx_extensions.length = 0; // clear previous extensions

    if (gen_module.required_mjx_extensions === undefined) return; // gen module doesn't specify any extensions to load
    else {
        // load the extensions for the MathJax instance in the main window
        pg_ui_state.required_mjx_extensions = [...gen_module.required_mjx_extensions];
        try {
            await MathJax.loader.load(...pg_ui_state.required_mjx_extensions);
        } catch (error) { // failure (log but don't throw to avoid putting the gen-sequence/pg-ui in a bad state)
            console.error(`Failed to load mjx-components '${pg_ui_state.required_mjx_extensions}': ${error}`);
            return;
        }
        
        // load the extensions for the MathJax instance in the mjx-svg-loader iframe window
        let iframe_el;
        if ((await CH.MIH.getIframeStatus()) === null) {
            iframe_el = await CH.MIH.initIframe();
        }
        else {
            iframe_el = document.getElementById('mjx-svg-loader');
        }

        await new Promise((resolve) => {
            CH.MIH.awaitIframeResponse(iframe_el, (response_data) => { // sets an event listener on the window that waits for the iframe response, calls the handler, then disposes the listener
                if (response_data !== 'done') { // failure (log but don't throw to avoid putting the gen-sequence/pg-ui in a bad state)
                    console.error(`Failed to load mjx-components '${pg_ui_state.required_mjx_extensions}' in mjx-svg-loader: ${response_data}.`)
                }
                
                resolve();
            });

            iframe_el.contentWindow.postMessage({
                message_type: 'load_mjx_components', 
                component_paths: pg_ui_state.required_mjx_extensions
            }, window.location.origin);
        });
    }
}

const CPH = { // createSettingsPresets helpers
    createPresetHtml: function(preset_obj, preset_class = 'topic_preset') {
        let display_title, example_problem, description, name;
        if (preset_class === 'topic_preset') { // custom presets specific to the current gen module
            ({ display_title, example_problem, description, name } = preset_obj);
        }
        else if (preset_class === 'default_preset') { // the single default preset in every module
            display_title = 'Use Defaults';
            example_problem = '[\\mathrm{Default}]';
            description = 'Use the default settings for this generator.';
            name = 'default';
        }
        else if (preset_class === 'random_preset') { // the single random preset in every module
            display_title = 'Randomize All';
            example_problem = '[\\mathrm{Random}]';
            description = 'Randomize each setting. Note that "Locked" settings are not affected by randomization.';
            name = 'random';
        }

        return `
            <div class="preset-option-wrapper">
                <div class="preset-option-inner-wrapper">
                    <input type="radio" name="settings-preset" id="settings-preset-option-${name}" value="${name}" class="settings-preset-radio-btn"/>
                    <label for="settings-preset-option-${name}" class="preset-option-label">${display_title}</label>
                </div>
                <div class="preset-example-btn-wrapper">
                    <div class="settings-info-button settings-preset-example-btn">?</div>
                    <div class="preset-tooltip-wrapper">
                        <div class="preset-tooltip-content">
                            <h3 class="preset-descriptor preset-tooltip-title">${display_title}:</h3>
                            <div class="preset-descriptor preset-tooltip-math">\\( ${example_problem} \\)</div>
                            <p class="preset-descriptor preset-tooltip-description">${description}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};
export async function createSettingsPresets(gen_module, pg_ui_state) {
    pg_ui_state.preset_funcs = {}; // clear previous
    
    // ensure that at least a presents obj and the default preset are present (otherwise, generation is impossible)
    if (!(typeof(gen_module.presets) === 'object' && gen_module.presets !== null)) {
        throw new Error('Current gen module does not contain a [presets object].');
    }
    else if (typeof(gen_module.presets.default) !== 'function') {
        throw new Error('Gen module presets object does not specify [default] preset function.');
    }
    
    // default preset
    let output_html = '<div id="settings-presets-list">';
    pg_ui_state.preset_funcs.default = gen_module.presets.default;
    output_html += CPH.createPresetHtml({}, 'default_preset');

    // random preset (must be present, but generation is still possible if it isn't)
    if (typeof(gen_module.presets.random) === 'function') {
        pg_ui_state.preset_funcs.random = gen_module.presets.random;
        output_html += CPH.createPresetHtml({}, 'random_preset');
    }
    else {
        console.error('Gen module presets object does not specify [random] preset function.');
    }

    // all the other module specific presets
    if (Array.isArray(gen_module.presets.topic_presets)) {
        gen_module.presets.topic_presets.forEach(preset_obj => {
            pg_ui_state.preset_funcs[preset_obj.name] = preset_obj.get_settings;
            output_html += CPH.createPresetHtml(preset_obj);
        });;
    }

    // insert and typeset any mjx
    output_html += '</div>';
    const preset_container = document.getElementById('preset-list-wrapper');
    preset_container.innerHTML = output_html;

    await MathJax.typesetPromise([preset_container]);
}

export function updatePresetStatus(preset_name, apply_preset, pg_ui_state) {
    pg_ui_state.focused_preset = preset_name;
    UAH.focusPresetOption(document.getElementById(`settings-preset-option-${preset_name}`));

    pg_ui_state.preset_is_applied = apply_preset;
    document.getElementById('settings-preset-checkbox').checked = apply_preset;
}

export function getPresetStatus(pg_ui_state) {
    pg_ui_state.focused_preset = document.getElementById('settings-presets-tab').getAttribute('data-focused-preset');
    pg_ui_state.preset_is_applied = document.getElementById('settings-preset-checkbox').checked;
}