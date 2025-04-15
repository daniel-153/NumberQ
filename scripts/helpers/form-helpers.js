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

        // Store the original styles
        const originalBorderColor = element.style.borderColor || '';
        const originalTextColor = element.style.color || '';

        // Apply flashing effect
        element.style.borderColor = 'red';
        element.style.color = 'red';

        setTimeout(() => {
            element.style.borderColor = originalBorderColor;
            element.style.color = originalTextColor;

            setTimeout(() => {
                element.style.borderColor = 'red';
                element.style.color = 'red';

                setTimeout(() => {
                    element.style.borderColor = originalBorderColor;
                    element.style.color = originalTextColor;
                }, 200); // End of second red flash
            }, 100); // Pause before second flash
        }, 200); // Hold the first red flash
    });
} // used to flash elements that had invalid inputs (and were changed)

export function updateFormValues(form_values_object, form_ID) {
    const form = document.getElementById(form_ID);

    for (const [setting_name, value] of Object.entries(form_values_object)) {
        const elements = form.elements[setting_name];

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
    Object.values(settings_objects).forEach(setting_obj => {
        combined_html = combined_html + createSettingHtml(setting_obj);
    });

    document.getElementById(form_ID).innerHTML = combined_html;
    MathJax.typesetPromise([`#${form_ID}`]);

    // function that generates the html for each settings field
    function createSettingHtml(setting_obj) {
        let output_html; // string that will hold the form element that is created

        // setting is a collection of radio buttons
        if (setting_obj.type === 'radio_buttons') { // setting is a collection of radio buttons
            let {code_name, display_name, radio_buttons, tooltip } = setting_obj;
            let current_class; // the special class of whichever radio button we are currently on (if provided)

            // Calculate the number of options and the appropriate margin-bottom value.
            const numberOfOptions = radio_buttons.length;
            let marginBottom;
            if (numberOfOptions <= 3) {
                marginBottom = '1.7vw';
            } 
            else if (numberOfOptions <= 9) {
                const computedMargin = 1.7 * (3 / numberOfOptions);
                marginBottom = `${computedMargin}vw`;
            }
            else {
                marginBottom = '0.57vw'
            }

            output_html = `
                <div class="setting-box">
                <h3 class="settings-label">${display_name}:</h3>
                <div class="outer-radio-button-wrapper">
            `;

            // create first through second-to-last radio buttons
            let current_label; // the visible label for the radio button
            for (let i = 0; i < radio_buttons.length - 1; i++) {
                current_label = radio_buttons[i][1] // pull out the label so we can modify it
                
                // add a special class to the radio button if specified (in the settings template)
                if (radio_buttons[i][2] !== undefined) current_class = radio_buttons[i][2];
                else current_class = '';
                if (current_class.includes('radio-math')) current_label = '\\(' + current_label + '\\)'; // make it renderable for MathJax
                
                output_html = output_html + `
                    <div class="inner-radio-button-wrapper" style="margin-bottom: ${marginBottom};">
                    <input
                        type="radio"
                        name="${code_name}"
                        value="${radio_buttons[i][0]}"
                        class="radio-buttons"
                        id="${code_name}-option-${i + 1}"
                    />
                    <label for="${code_name}-option-${i + 1}" class="radio-button-label ${current_class}"
                        >${current_label}</label
                    >
                    </div>
                `;
            }

            // create the last radio button
            current_label = radio_buttons[radio_buttons.length - 1][1];
            if (radio_buttons[radio_buttons.length - 1][2] !== undefined) current_class = radio_buttons[radio_buttons.length - 1][2];
            else current_class = '';
            if (current_class.includes('radio-math')) current_label = '\\(' + current_label + '\\)';

            output_html = output_html + `
                <div class="inner-radio-button-wrapper last-radio-option">
                <input
                    type="radio"
                    name="${code_name}"
                    value="${radio_buttons[radio_buttons.length - 1][0]}"
                    class="radio-buttons"
                    id="${code_name}-option-${radio_buttons.length}"
                />
                <label for="${code_name}-option-${radio_buttons.length}" class="radio-button-label ${current_class}"
                    >${current_label}</label
                >
                </div>
            </div>
            <div
                class="settings-info-button"
                data-tooltip="${tooltip}"
            >
                ?
            </div>
            </div>
            `;

            return output_html;
        } 
        else if (setting_obj.type === 'single_textbox') { // setting is a single textbox
            const {code_name, display_name, tooltip} = setting_obj;

            output_html = `
                <div class="setting-box">
                <label for="${code_name}-text-box" class="settings-label">${display_name}:</label>
                <input
                    type="text"
                    name="${code_name}"
                    class="settings-text-box"
                    id="${code_name}-text-box"
                />
                <div
                    class="settings-info-button"
                    data-tooltip="${tooltip}"
                >
                    ?
                </div>
                </div>
            `;

            return output_html;
        }
        else if (setting_obj.type === 'range_textboxes') { // setting is a range textbox (two textboxes)
            const {code_names, display_name, tooltip} = setting_obj;

            output_html = `
                <div class="setting-box">
                <h3 class="settings-label">${display_name}:</h3>
                <div id="number-range-wrapper">
                    from:&thinsp;<input
                    type="text"
                    name="${code_names[0]}"
                    class="settings-text-box number-range-box"
                    />&thinsp;to:&thinsp;<input
                    type="text"
                    name="${code_names[1]}"
                    class="settings-text-box number-range-box"
                    />
                </div>
                <div
                    class="settings-info-button"
                    data-tooltip="${tooltip}"
                >
                    ?
                </div>
                </div>
            `;

            return output_html;
        }
        else if (setting_obj.type === 'check_boxes') { // setting is a collection of checkboxes
            const {code_name, display_name, check_boxes, tooltip } = setting_obj;

            // Calculate the number of options and the appropriate margin-bottom value.
            const numberOfOptions = check_boxes.length;
            let marginBottom;
            if (numberOfOptions <= 3) {
                marginBottom = '1.7vw';
            } else {
                const computedMargin = 1.7 * (3 / numberOfOptions);
                marginBottom = `${computedMargin}vw`;
            }

            output_html = `
                <div class="setting-box">
                <h3 class="settings-label">${display_name}:</h3>
                <div class="outer-radio-button-wrapper">
            `;

            // create first through second-to-last checkboxes
            for (let i = 0; i < check_boxes.length - 1; i++) {
                output_html = output_html + `
                    <div class="inner-radio-button-wrapper" style="margin-bottom: ${marginBottom};">
                    <input
                        type="checkbox"
                        name="${code_name}"
                        value="${check_boxes[i][0]}"
                        class="radio-buttons"
                        id="${code_name}-option-${i + 1}"
                    />
                    <label for="${code_name}-option-${i + 1}" class="radio-button-label"
                        >${check_boxes[i][1]}</label
                    >
                    </div>
                `;
            }

            // create the last checkbox
            output_html = output_html + `
                <div class="inner-radio-button-wrapper last-radio-option">
                <input
                    type="checkbox"
                    name="${code_name}"
                    value="${check_boxes[check_boxes.length - 1][0]}"
                    class="radio-buttons"
                    id="${code_name}-option-${check_boxes.length}"
                />
                <label for="${code_name}-option-${check_boxes.length}" class="radio-button-label"
                    >${check_boxes[check_boxes.length - 1][1]}</label
                >
                </div>
            </div>
            <div
                class="settings-info-button"
                data-tooltip="${tooltip}"
            >
                ?
            </div>
            </div>
            `;

            return output_html;
        }
        else if (setting_obj.type === 'point_check_boxes') { // setting is a user-picked point (_,_) (with a radomize option)
            const {code_names, display_name, tooltip} = setting_obj;

            output_html = `
                <div class="setting-box">
                <h3 class="settings-label">${display_name}:</h3>
                <div id="solution-point-wrapper">
                    (<input
                    type="text"
                    name="${code_names[0]}"
                    class="settings-text-box number-range-box"
                    />,<input
                    type="text"
                    name="${code_names[1]}"
                    class="settings-text-box number-range-box"
                    />)
                </div>
                <div class="settings-checkbox-tab">
                    <input
                    type="checkbox"
                    name="${code_names[2]}"
                    value="is_checked"
                    class="single-settings-checkbox"
                    />Randomize
                </div>
                <div class="settings-info-button" data-tooltip="${tooltip}">?</div>
                </div>
            `;

            return output_html;
        }
    }
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