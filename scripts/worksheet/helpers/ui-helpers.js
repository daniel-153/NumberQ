import * as TB from '../../templates/topic-banners.js';
import * as UH from '../../helpers/ui-helpers.js';
import * as FH from '../../helpers/form-helpers.js';
import { worksheet_editor, worksheet } from '../worksheet.js';

export function focusCurrentItem() {
    const item_ID = worksheet_editor.focused_item_ID;

    // ensure the last item that was focused gets unfocused
    [...document.getElementById('outline-container').children].filter(element => element.classList.contains('outline-item')).forEach(element => {
        element.removeAttribute('data-currently-focused');
    });

    // find the specified item and add focus to it (and determine kind of outline item it was)
    let element_label, element_class, element_subtype;
    [...document.getElementById('outline-container').children].forEach(element => {
        if (element.getAttribute('data-item-ID') === item_ID) {
            element.setAttribute('data-currently-focused', 'true');
            element_label = [...element.querySelectorAll('.outline-label')][0].textContent;
            element_class = element.classList[1];
            element_subtype = element.getAttribute('data-outline-item-subtype');
        }
    });

    // put (a copy of) the item in the 'focus-indicator' box on the right panel
    document.getElementById('current-focused-item').innerHTML = `
        <div class="outline-item ${element_class} outline-item-indicator">
            ${element_label}
        </div>
    `;
}

export function openItemSettings() {
    const item_ID = worksheet_editor.focused_item_ID;


    if ('document') {
        // TODO
    }
    else if ('page') {
        // TODO
    }
    else if ('content') {
        // TODO
    }
}

export function updateOutline() {
    let current_item_ID = 'document';
    let item_is_focused = (current_item_ID === worksheet_editor.focused_item_ID)? "true" : '';
    
    let updated_html = `
        <div class="outline-item outline-document" data-item-ID="${current_item_ID}" data-currently-focused="${item_is_focused}">
            <div class="outline-label outline-document-label">Document</div>
            <div class="outline-nav-wrapper">
                <button 
                    class="outline-button outline-plus-button document-plus-button"
                >+</button>
            </div>
        </div>
    `;
    for (let i = 0; i < worksheet.pages.length; i++) {
        current_item_ID = `page-${i}`;
        item_is_focused = (current_item_ID === worksheet_editor.focused_item_ID)? "true" : '';
        
        updated_html += `
            <div class="outline-item outline-page" data-item-ID="${current_item_ID}" data-currently-focused="${item_is_focused}">
                <div class="outline-label outline-page-label">Page ${i + 1}</div>
                <div class="outline-nav-wrapper">
                    <button 
                        class="outline-button outline-delete-button"
                    >X</button>    
                    <button 
                        class="outline-button outline-plus-button page-plus-button"
                    >+</button>
                </div>
            </div>
        `;
        for (let j = 0; j < worksheet.pages[i].sects.length; j++) {
            current_item_ID = `sect-${i}.${j}`;
            item_is_focused = (current_item_ID === worksheet_editor.focused_item_ID)? "true" : '';
            
            updated_html += `
                <div class="outline-item outline-sect" data-item-ID="${current_item_ID}" 
                data-currently-focused="${item_is_focused}">
                    <div class="outline-label outline-sect-label">Section ${i + 1}.${j + 1}</div>
                    <div class="outline-nav-wrapper">
                        <button 
                            class="outline-button outline-delete-button"
                        >X</button>  
                        <button 
                            class="outline-button outline-plus-button sect-plus-button"
                        >+</button>   
                    </div>
                </div>
            `;
            for (let k = 0; k < worksheet.pages[i].sects[j].content.length; k++) {
                current_item_ID = `content-${i}.${j}.${k}`;
                item_is_focused = (current_item_ID === worksheet_editor.focused_item_ID)? "true" : '';

                const content_item = worksheet.pages[i].sects[j].content[k];
                const content_type_name  = content_item.settings.type_display_name;
                // line below is temporary (if the type is not a problem (maybe its a figure), you cant use getProblemNumber)
                const content_number = worksheet_editor.getProblemNumber(content_item);


                updated_html += `
                <div class="outline-item outline-content" data-item-ID="${current_item_ID}" 
                data-currently-focused="${item_is_focused}">
                    <div class="outline-label outline-content-label">${content_type_name} ${content_number}</div>
                    <div class="outline-nav-wrapper">
                        <button 
                            class="outline-button outline-delete-button"
                        >X</button>    
                    </div>
                </div>
                `;
            }
        }
    }
    document.getElementById('outline-container').innerHTML = updated_html;
}

// ********Need a seperate module for all things related to the problem creator/editor****************(the functions below)********
// ****************************************************************************************************************************************
// ****************************************************************************************************************************************
// ****************************************************************************************************************************************
// ****************************************************************************************************************************************


export function insertModeBanners(filter = []) {
    // TODO: add ability to filter which modes show up
    let output_html = '';
    TB.templates.forEach(banner_template => {
        let example_problem_class;
        if (banner_template.example_problem_class === undefined) example_problem_class = '';
        else example_problem_class = banner_template.example_problem_class;
             
        output_html += `
            <div class="generator ${banner_template.category_class_name} worksheet-generator">
                <div class="gen-title-container">
                    <h1 class="gen-title">${banner_template.display_name}</h1>
                    <h2 class="gen-topic">(${banner_template.display_category})</h2>
                </div>
                <div class="example-problem ${example_problem_class}">\\(${banner_template.example_problem}\\)</div>
                <button
                    class="gen-select-button"
                    data-gen-type="${banner_template.display_name}"
                    data-gen-func-name="${banner_template.function_name}"
                >
                    Select
                </button>
            </div>
        `;
    });

    document.getElementById('pe-mode-selector').innerHTML = output_html;

    // add the event listener to each start button to insert the settings for whichever mode it refers to when clicked
    [...document.getElementsByClassName('gen-select-button')].forEach(button_element => {
        button_element.addEventListener('click',() => {
            // insert correct mode settings
            _insertPGSettings(button_element.getAttribute('data-gen-func-name'));

            // initiate generator
            initiatePEGenerator(button_element.getAttribute('data-gen-type'),button_element.getAttribute('data-gen-func-name'));
        });
    });

    MathJax.typesetPromise(['#worksheet-mode-selector']);
}

async function _insertPGSettings(gen_func_name) {
    const current_gen_module = await import(`../../gen-modules/${gen_func_name}.js`);
    const pre_settings = current_gen_module.get_presets();

    FH.createSettingsFields(current_gen_module.settings_fields, await import('../../templates/gen-settings.js'), 'pe-settings-form').then(() => {
        FH.updateFormValues(pre_settings,'pe-settings-form')
    })

}

export async function initiatePEGenerator(display_name, func_name) {
    const currentModule = await import(`../../gen-modules/${func_name}.js`); 
    const currentGen = currentModule.default;
    const pre_settings = currentModule.get_presets();

    FH.createSettingsFields(currentModule.settings_fields, await import('../../templates/gen-settings.js'), 'pe-settings-form').then(() => {
        // This will run after all settings have been inserted
        FH.updateFormValues(pre_settings, 'pe-settings-form');
        // moved this into the .then because pre-sets might not actually match the first generation (due to a change in validation or as in sysEqs)
        switchPEToNewQuestion(currentGen(pre_settings));
    });

    UH.cleanedFromListeners(document.getElementById("pe-generate-button")).addEventListener("click", async () => {
        if (!document.getElementById('pe-randomize-all-checkbox').checked) {
            const currentSettings = FH.getFormObject('pe-settings-form');
            switchPEToNewQuestion(currentGen(currentSettings)); 
        } // randomize_all isn't checked -> use provided settings
        else {
            const currentSettings = currentModule.get_rand_settings();
            switchPEToNewQuestion(currentGen(currentSettings));
        } // randomize_all is checked -> use random (pre-set) settings
    });
}

export function switchPEToNewQuestion(question_obj) {
    const question = question_obj.question;
    const answer = question_obj.answer;

    UH.updateElementMath('pe-question',question,'3vw')
    UH.updateElementMath('pe-answer',answer,'2.5vw')

    MathJax.typesetPromise([document.getElementById('Q-A-container')]);

    // Change settings if needed here
    FH.updateFormValues(question_obj.settings, 'pe-settings-form');

    // flash any elements with errors here
    const error_locations = question_obj.error_locations;
    if (error_locations.length > 0) {
        FH.flashFormElements(error_locations, 'pe-settings-form');
    }
}

