export function flashFormElements(element_name_array, form_ID) {
    const form = document.getElementById(form_ID);
    if (!form) {
        console.error(`Form with ID '${form_ID}' not found.`);
        return;
    }

    element_name_array.forEach(name => {
        const element = form.elements[name];
        if (!element) {
            console.warn(`No form element found with the name '${name}'.`);
            return;
        }

        // Cancel any ongoing animation by forcing a reflow
        element.classList.remove('flash-red');
        void element.offsetWidth; // trigger reflow (force styles to be applied/re-rendered)

        // Re-apply animation class
        element.classList.add('flash-red');
    });
}

export function updateFormValues(form_values_object, form_ID) {
    const form = document.getElementById(form_ID);

    for (const [setting_name, value] of Object.entries(form_values_object)) {
        const elements = form.elements[setting_name];

        // prevent these two fields from being randomized (as long as they aren't listed in get_rand_settings())
        if ((setting_name === 'decimal_places' || setting_name === 'keep_rounded_zeros') && value === undefined) continue;

        // if the element isn't found, don't try to update its value
        if (!elements) {
            continue;
        }

        // Handle collections of checkboxes
        if (elements.length && elements[0].type === 'checkbox') {
            for (const checkbox of elements) {
                checkbox.checked = Array.isArray(value) && value.includes(checkbox.value);
            }
        } 
        // Handle single checkboxes
        else if (elements.type === 'checkbox') {
            elements.checked = Boolean(value);
        } 
        // Handle radio buttons
        else if (elements.type === 'radio') {
            const radio = form.querySelector(`input[name="${setting_name}"][value="${value}"]`);
            if (radio) {
                radio.checked = true;
            }
        } 
        // Handle multi-select dropdowns
        else if (elements.type === 'select-multiple') {
            for (const option of elements.options) {
                option.selected = Array.isArray(value) && value.includes(option.value);
            }
        } 
        // Default case: set value for text inputs, number inputs, select-one, etc.
        else {
            elements.value = value;
        }
    }
} // used to manually set/preset (autofill) a form; form_values_object is just the names of the form elements and their desired values in an obj

const CSH = { // createSettingsFields helpers
    getMarginB(number_of_elements) {
        let margin_bottom;
        if (number_of_elements <= 3) {
            margin_bottom = '1.75vw';
        } 
        else if (number_of_elements <= 9) {
            margin_bottom = `${1.7 * (3 / number_of_elements)}vw`;
        }
        else {
            margin_bottom = '0.57vw'
        }

        return function(current_element_index) {
            if (current_element_index !== number_of_elements - 1) return margin_bottom;
            else return '0';
        }
    },
    setting_builders: {
        radio_buttons: function(settings) {
            let output_html = '<div class="outer-radio-button-wrapper">';
            const margin_bottom = CSH.getMarginB(settings.radio_buttons.length);
            for (let i = 0; i < settings.radio_buttons.length; i++) {
                let current_label = settings.radio_buttons[i][1] // pull out the label so we can modify it
                
                // add a special class to the radio button if specified (in the settings template)
                let current_class; // class of the radio button label (like radio_math, radio_math_big, etc)
                if (settings.radio_buttons[i][2] !== undefined) current_class = settings.radio_buttons[i][2];
                else current_class = '';
                if (current_class.includes('radio-math')) current_label = '\\(' + current_label + '\\)'; // make it renderable for MathJax
                
                output_html += `
                    <div class="inner-radio-button-wrapper" style="margin-bottom: ${margin_bottom(i)};">
                    <div class="radio-circle-wrapper">
                        <input
                            type="radio"
                            name="${settings.code_names[0]}"
                            value="${settings.radio_buttons[i][0]}"
                            class="radio-buttons"
                            id="${settings.code_names[0]}-option-${i + 1}"
                        />
                    </div>
                    <label for="${settings.code_names[0]}-option-${i + 1}" class="radio-button-label ${current_class}"
                        >${current_label}</label
                    >
                    </div>
                `;
            }
            output_html += '</div>';

            return output_html;
        },
        check_boxes: function(settings) {
            let output_html = '<div class="outer-radio-button-wrapper">';
            const margin_bottom = CSH.getMarginB(settings.check_boxes.length);
            for (let i = 0; i < settings.check_boxes.length; i++) {
                output_html += `
                    <div class="inner-radio-button-wrapper" style="margin-bottom: ${margin_bottom(i)};">
                    <div class="radio-circle-wrapper">
                        <input
                            type="checkbox"
                            name="${settings.code_names[0]}"
                            value="${settings.check_boxes[i][0]}"
                            class="radio-buttons"
                            id="${settings.code_names[0]}-option-${i + 1}"
                        />
                    </div>
                    <label for="${settings.code_names[0]}-option-${i + 1}" class="radio-button-label"
                        >${settings.check_boxes[i][1]}</label
                    >
                    </div>
                `;
            }
            output_html += '</div>';

            return output_html;
        },
        single_textbox: function(settings) {
            return `
                <input
                    type="text"
                    name="${settings.code_names[0]}"
                    class="settings-text-box ${(settings.textbox_class !== undefined)? settings.textbox_class : ''}"
                    id="${settings.code_names[0]}-text-box"
                />
            `;
        },
        range_textboxes: function(settings) {
            return `
                <div class="number-range-wrapper">
                    from:&thinsp;<input
                    type="text"
                    name="${settings.code_names[0]}"
                    class="settings-text-box number-range-box"
                    />&thinsp;to:&thinsp;<input
                    type="text"
                    name="${settings.code_names[1]}"
                    class="settings-text-box number-range-box"
                    />
                </div>
            `;
        },
        dimension_textboxes: function(settings) {
            return `
                <div class="number-range-wrapper">
                    <input
                        type="text"
                        name="${settings.code_names[0]}"
                        class="settings-text-box number-range-box"
                    />&thinsp;<span class="dimension-textbox-x">x</span>&thinsp;<input
                    type="text"
                    name="${settings.code_names[1]}"
                    class="settings-text-box number-range-box"
                    />
                </div>
            `;
        },
        point_check_boxes: function(settings) {
            return `
                <div class="solution-point-wrapper">
                    (<input
                    type="text"
                    name="${settings.code_names[0]}"
                    class="settings-text-box number-range-box"
                    />,<input
                    type="text"
                    name="${settings.code_names[1]}"
                    class="settings-text-box number-range-box"
                    />)
                </div>
                <div class="settings-checkbox-tab">
                    <input
                    type="checkbox"
                    name="${settings.code_names[2]}"
                    value="is_checked"
                    class="single-settings-checkbox"
                    />Randomize
                </div>
            `;
        },
        textbox_table: function(settings) {
            let output_html = '<div class="outer-radio-button-wrapper textbox-table-wrapper">';
            for (let i = 0; i < settings.code_names.length; i++) {
                output_html += `
                <div class="textbox-table-entry">
                    <input
                        type="text"
                        name="${settings.code_names[i]}"
                        class="settings-text-box table-textbox"
                        id="${settings.code_names[i]}-table-textbox"
                    />
                    <label 
                        for="${settings.code_names[i]}-table-textbox"
                        class="table-textbox-label"
                    >
                        ${settings.display_names[i]}
                    </label>
                </div>
                `;
            }
            output_html += '</div>';

            return output_html;
        },
        textbox_w_checkbox: function(settings) {
            return `
                <div class="textbox-w-checkbox-wrapper" data-input-name="${settings.display_names[0]}:">
                    <input
                        type="text"
                        name="${settings.code_names[0]}"
                        class="settings-text-box textbox-w-checkbox ${(settings.textbox_class !== undefined)? settings.textbox_class : ''}"
                        id="${settings.code_names[0]}-text-input"
                    />
                </div>
                <div class="settings-checkbox-tab textbox-checkbox-tab">
                    <input
                    type="checkbox"
                    name="${settings.code_names[1]}"
                    value="is_checked"
                    class="single-settings-checkbox"
                    />${settings.display_names[1]}
                </div>
            `;
        }
    },
    resolveValidValues: function(setting_obj, code_name) {
        let valid_values_array = [];
        if (setting_obj.type === 'radio_buttons') {
            setting_obj[setting_obj.type].forEach(code_display_arr => valid_values_array.push( code_display_arr[0] ));
        }
        else if (setting_obj.type === 'check_boxes') {
            setting_obj[setting_obj.type].forEach(code_display_arr => valid_values_array.push( [code_display_arr[0]] ));

            if (setting_obj.required !== undefined && !setting_obj.required) {
                valid_values_array.unshift(['__empty__']);
            }
        }
        else if (Array.isArray(setting_obj.valid_values)) { // single setting
            valid_values_array = setting_obj.valid_values;   
        }
        else if (typeof(setting_obj.valid_values) === 'object') { // multi setting
            valid_values_array = setting_obj.valid_values[code_name];
        }
        else { // A mistake was likely made (no valid values provided)
            console.error('Valid values could no be resolved for the following setting: ',setting_obj);
            return null;
        }

        return valid_values_array;
    },
    resolveDefaultValue: function(setting_obj, code_name) {
        if (setting_obj.code_names.length > 1) { // multi setting (default values always provided)
            return setting_obj.default_value[code_name];
        }
        else if (setting_obj.code_names.length === 1) { // single setting (default values may or may not be provided)
            if (setting_obj.default_value !== undefined) { // default value was provided
                return setting_obj.default_value;
            }
            else if (setting_obj.type === 'radio_buttons' ) { // radio buttons (default value is assumed to be the first option)
                return setting_obj[setting_obj.type][0][0]; // first radio option
            }
            else if (setting_obj.type === 'check_boxes') { // check boxes (default value is the first option, but wrapped in an array)
                return [setting_obj[setting_obj.type][0][0]]; // first check option wrapped in an array
            }  
            else { // a mistake was likely made (no default provided)
                console.error('A default value could be resolved for the following setting: ', setting_obj);
                return null;
            }
        }
    },
    resolveExcludedValues: function(setting_obj, code_name) {
        if (setting_obj.excluded_values !== undefined) { // there are excluded values on the setting
            if (setting_obj.code_names.length > 1) { // multi setting -> excluded values is an object of arrays
                return setting_obj.excluded_values[code_name];
            }
            else if (setting_obj.code_names.length === 1) { // single setting -> excluded values is an array
                return setting_obj.excluded_values;
            }
        }
        else return undefined;
    },
    buildControlButtons: function(setting_obj) {
        const lock_status = (setting_obj.prelocked)? 'lock' : 'unlock';

        return `
            <div class="setting-control-buttons">
                <div class="settings-info-button settings-lock" data-status="${lock_status}ed" data-values-to-lock="${setting_obj.code_names.join(',')}">
                    <img src="images/${lock_status}.png" class="settings-lock-image"/>
                </div>
               <div class="settings-info-button" data-tooltip="${setting_obj.tooltip}">?</div>  
            </div>
        `;
    },
    buildSettingBox: function(setting_obj) {
        // create the visible settings box (which includes the title, form elements (buttons, text, checkbox, etc), and control/tooltip buttons)
        const output_html = `
            <div class="setting-box">
                <h3 class="settings-label">${setting_obj.display_name}:</h3>
                <div class="inner-settings-wrapper">${CSH.setting_builders[setting_obj.type](setting_obj)}</div>
                ${CSH.buildControlButtons(setting_obj)}
            </div>
        `;

        // For the new box, create a "table" with all the new setting code name(s) and its/their possible values
        const valid_values_log = {}; // this will later be a segment of the valid_values_log for the entire settings form
        for (let i = 0; i < setting_obj.code_names.length; i++) {
            valid_values_log[setting_obj.code_names[i]] = {};
            valid_values_log[setting_obj.code_names[i]].valid_values = CSH.resolveValidValues(setting_obj, setting_obj.code_names[i]);
            valid_values_log[setting_obj.code_names[i]].default_value = CSH.resolveDefaultValue(setting_obj, setting_obj.code_names[i]);
            valid_values_log[setting_obj.code_names[i]].excluded_values = CSH.resolveExcludedValues(setting_obj, setting_obj.code_names[i]);
        }

        return {
            output_html,
            valid_values_log
        };
    }
}
export async function createSettingsFields(settings_field_names, settings_templates_module, form_ID) {
    const settings_objects = {}; // this is an object of objects instead of an array of objects

    settings_field_names.forEach((setting_name) => {        
        if (settings_templates_module[setting_name]) {
          settings_objects[setting_name] = settings_templates_module[setting_name]; // find the settings object and put it in setting_objects {...}
        }
        else {
            console.error(`No setting with name '${setting_name}' was found in the provided module`);
        }
    });

    let combined_html = '';
    const valid_values_log = {}; // catalog of valid values for all settings fields 
    for (let [setting_name, setting_obj] of Object.entries(settings_objects)) {
        if (setting_obj.code_names === undefined) { // single setting (no code_names array provided => implied to be the name of the setting)
            setting_obj.code_names = [setting_name]; // code name => name of the setting
        }

        const new_setting_box = CSH.buildSettingBox(setting_obj);
        const output_html = new_setting_box.output_html;
        const log_entry = new_setting_box.valid_values_log;

        // append the html for the settings box to the form
        combined_html += output_html;

        // store the valid values and default value for each setting that is involved in the box
        for (const [code_name, log_info] of Object.entries(log_entry)) {
            valid_values_log[code_name] = {};
            valid_values_log[code_name].valid_values = log_info.valid_values;
            valid_values_log[code_name].default_value = log_info.default_value;
            valid_values_log[code_name].excluded_values = log_info.excluded_values;
        }
    }

    document.getElementById(form_ID).innerHTML = combined_html;
    MathJax.typesetPromise([`#${form_ID}`]);

    return valid_values_log;
} // create and insert the settings fields with names in settings_field_names, from settings_templates_module, into form with ID of form_ID

export function getFormObject(form_ID) {
    const form = document.getElementById(form_ID);
    const formData = new FormData(form);
    const formObject = {};

    for (const [key, value] of formData.entries()) {
        const inputElements = form.elements[key];

        // Check if the input type is a collection of checkboxes
        const isCheckboxGroup = inputElements && inputElements[0]?.type === "checkbox";

        if (formObject.hasOwnProperty(key)) {
            // Only enforce an array for checkboxes
            if (isCheckboxGroup) {
                formObject[key] = [].concat(formObject[key], value);
            } else {
                formObject[key] = value; // Ensure radios remain a single value
            }
        } else {
            formObject[key] = isCheckboxGroup ? [value] : value;
        }
    }

    return formObject;
} // get the {field name: value} object for the form with the provided ID

export function getFormFieldStatuses(form_ID) {
    const lock_element_array = Array.from(document.getElementById(form_ID).querySelectorAll('.settings-lock'));
    const form_field_statuses = {}; // all the field names and their status (true => locked, false => unlocked)

    lock_element_array.forEach(lock_element => {
        lock_element.getAttribute('data-values-to-lock').split(',').forEach(locked_field_name => {
            form_field_statuses[locked_field_name] = (lock_element.getAttribute('data-status') === 'locked');
        });
    });

    return form_field_statuses;
} // status of each field in the form => locked or unlocked

export function resolveRandSettings(rand_settings_obj, valid_values_log) {
    const resolved_settings = {};
    
    for (const [code_name, value] of Object.entries(rand_settings_obj)) {
        // if '__random__' was the value for the setting in get_rand_settings, use a random valid value for the setting
        if (value === '__random__') { // ('value' is whatever was returned from get_rand_settings in the current gen module)
            if (valid_values_log[code_name].valid_values[1] === '--') { // rand (Int) from an implied range [Number, '--', Number]
                resolved_settings[code_name] = Math.floor(Math.random() * (valid_values_log[code_name].valid_values[2] - valid_values_log[code_name].valid_values[0] + 1) + valid_values_log[code_name].valid_values[0]);
            }
            else { // rand from an exhuastive list
                resolved_settings[code_name] = valid_values_log[code_name].valid_values[Math.floor(Math.random() * valid_values_log[code_name].valid_values.length)]
            }
        }
        else { // (not random => value was provided)
            resolved_settings[code_name] = value;
        }
    }

    return resolved_settings;
}

export function preValidateSettings(form_obj, valid_values_log, error_locations) {
    for (let [setting_name, setting_value] of Object.entries(form_obj)) {
        // get the first entry in the valid values log (to determine the correct type for the setting)
        const first_valid_value = valid_values_log[setting_name].valid_values[0];
        
        if (first_valid_value === '__char_slots__') { // text input being validated by char slots            
            const max_valid_chars = Math.max(...Object.keys(valid_values_log[setting_name].valid_values[1]).map(int_str => Number(int_str))) + 1;
            let is_valid_input = true;

            if (setting_value.length > max_valid_chars) is_valid_input = false; // inputted string too long
            else { // check each character of inputted string (to ensure it is included in the valid characters for that index)
                for (let char_index = 0; char_index < max_valid_chars; char_index++) {
                    const current_input_char = setting_value.charAt(char_index);

                    if (!valid_values_log[setting_name].valid_values[1][String(char_index)].includes(current_input_char)) { // char is not valid for the current index
                        is_valid_input = false;
                        break;
                    }
                }
            }

            if (!is_valid_input) { // inputted value does NOT conform to the char slots
                error_locations.add(setting_name);
                setting_value = valid_values_log[setting_name].default_value;
            }
        }
        else if (typeof(first_valid_value) === 'number') { // numerical text input
            // text input was left empty
            if (setting_value === '') error_locations.add(setting_name);
            
            setting_value = Number(setting_value); // text input is a string by default => force it to be a number

            if (
                ( // check with explicit valid values (exhuastive list)
                    valid_values_log[setting_name].valid_values[1] !== '--' && // no sign of implied range
                    ( // And: 
                        !valid_values_log[setting_name].valid_values.includes(setting_value) || // exhuative list doesn't include the entered value
                        ( // Or: there is an excluded values array in the log entry && it included the current value
                            valid_values_log[setting_name].excluded_values !== undefined &&
                            valid_values_log[setting_name].excluded_values.includes(setting_value)
                        )
                    )
                ) ||
                ( // check with implicit valid values (an implied range)
                    valid_values_log[setting_name].valid_values[1] === '--' && // dealing with an implied range
                    ( // And:
                        !Number.isSafeInteger(setting_value) || // provided value isn't an integer
                        setting_value < valid_values_log[setting_name].valid_values[0] || // Or: it's less than the min
                        setting_value > valid_values_log[setting_name].valid_values[2] || // Or: it's greater than the max
                        ( // Or: there is an excluded values array in the log entry && it included the current value
                            valid_values_log[setting_name].excluded_values !== undefined &&
                            valid_values_log[setting_name].excluded_values.includes(setting_value)
                        ) 
                    )
                )
            ) { // provided value is NOT included in the valid values
                error_locations.add(setting_name);

                if (setting_value < valid_values_log[setting_name].valid_values[0]) { // less than the min
                    setting_value = valid_values_log[setting_name].valid_values[0]; // use the min
                }
                else if ( // greater than the max
                    setting_value > valid_values_log[setting_name].
                    valid_values[valid_values_log[setting_name].
                    valid_values.length - 1]
                ) {
                    setting_value = valid_values_log[setting_name].valid_values[valid_values_log[setting_name].valid_values.length - 1]; // use the max
                }
                else { // NaN or not the correct type of number (like a decimal where an integer was needed)
                    setting_value = valid_values_log[setting_name].default_value;
                }
            }
        }
        else if (typeof(first_valid_value) === 'string') { // radio buttons + string text input + single checkbox (if checked => 'is_checked')
            // In practice, it's only really possible for string text inputs to be invalid here, but the following works in general
            if (!valid_values_log[setting_name].valid_values.includes(setting_value)) { // provided value is NOT in the valid values array
                error_locations.add(setting_name);

                setting_value = valid_values_log[setting_name].default_value; // use the default
            }
        }
        else if (Array.isArray(first_valid_value)) { // checkbox groups (multiselect)
            // the only way to be invalid here is to leave the entire multiselect blank *when it's a required one - which is almost all of them*
            if (
                (setting_value === undefined || setting_value.length === 0) && 
                valid_values_log[setting_name].valid_values[0][0] !== '__empty__'
            ) { // not allowed to be empty
                error_locations.add(setting_name);

                setting_value = valid_values_log[setting_name].default_value; // use the default
            }
        }
        
        // overwrite/clean the value in the form_obj (to turn form_obj => settings_obj)
        form_obj[setting_name] = setting_value;
    } 
} // clean the raw entered values to be => within the setting's valid values

export function correctSettingOverflow(form_ID) {
    [...document.getElementById(form_ID).querySelectorAll('.inner-settings-wrapper')].forEach(inner_settings_wrapper => {
        if (inner_settings_wrapper.scrollHeight > inner_settings_wrapper.clientHeight) {     
            inner_settings_wrapper.firstChild.style.height = '100%';
        }
    })
}

export function getAllSetSubsets(set, include_empty_set = true, include_set_itself = false) { // uses bitmasking -> {'a','b'} -> 00, 01, 10, 11 -> {}, {'a'}, {'b'}, {'a','b'}
    const arr = Array.from(set);
    const n = arr.length;
    const subsets = [];

    for (let mask = 0; mask < (1 << n); mask++) {
        const subset = new Set();
        for (let i = 0; i < n; i++) {
            if (mask & (1 << i)) subset.add(arr[i]);
        }

        if ((!include_empty_set && subset.size === 0) ||
            (!include_set_itself && subset.size === n)) continue;

        subsets.push(subset);
    }

    return subsets;
} // used for settings permutations

export function getAllCombinedPermutations(...sets) { // uses "odometer rollover" method
    sets = sets.map(set => Array.from(set)); // convert sets to arrays for easier usage
    const all_permutations = [];
    const num_permutations = sets.reduce((prod, curr_arr) => prod * curr_arr.length, 1);

    const current_indices = new Array(sets.length).fill(0);; // current "odometer state" (starts as [0,0,0,...])
    for (let i = 0; i < num_permutations; i++) {
        all_permutations.push(sets.map((set, set_index) => set[current_indices[set_index]]));
        
        let rolled_over = true;
        for (let j = 0; j < sets.length && rolled_over; j++) {
            current_indices[j]++;
            rolled_over = false;

            if (current_indices[j] > sets[j].length - 1) { // rolled over
                current_indices[j] = 0;
                rolled_over = true;
            }
        }
    }

    return all_permutations;
} // used for settings permutations