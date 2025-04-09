import * as TB from '../templates/topic-banners.js';
import * as UH from '../helper-modules/ui-helpers.js';
import * as FH from './form-helpers.js';

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
    const current_gen_module = await import(`../gen-modules/${gen_func_name}.js`);
    const pre_settings = current_gen_module.get_presets();

    FH.createSettingsFields(current_gen_module.settings_fields, await import('../templates/gen-settings.js'), 'pe-settings-form').then(() => {
        FH.updateFormValues(pre_settings,'pe-settings-form')
    })

}

export function focusItemAt(item_ID) {
    const [ item_type, item_number ] = item_ID.split('-');

    // ensure the last item that was focused gets unfocused
    [...document.getElementById('outline-container').children].filter(element => element.classList.contains('outline-item')).forEach(element => {
        element.removeAttribute('data-currently-focused');
    });

    // add focus to the specified item
    [...document.getElementById('outline-container').children].forEach(element => {
        if (element.getAttribute('data-item-ID') === item_ID) {
            element.setAttribute('data-currently-focused', 'true');
        }
    });

    let item_dispay_name, background_color;
    if (item_type === 'document') {
        item_dispay_name = 'Document';
        background_color = 'blue';
    }
    else if (item_type === 'page') {
        item_dispay_name = 'Page ' + (Number(item_number) + 1);
        background_color = 'green';
    }
    else if (item_type === 'content') {
        const [ page_index, content_index ] = item_number.split('.');

        item_dispay_name = 'Content ' + (Number(page_index) + 1) + '.' + (Number(content_index) + 1);
        background_color = 'red';
    }

    document.getElementById('current-focused-item').textContent = item_dispay_name;
    document.getElementById('current-focused-item').style.backgroundColor = background_color;

    _openItemSettings(item_ID);
}

function _openItemSettings(item_ID, settings_obj) {
    const [ item_type, item_number ] = item_ID.split('-');

    // temp (need some way to clear settings that were already there from the last item)
    // document.getElementById('worksheet-mode-selector').innerHTML = '';
    // document.getElementById('worksheet-mode-settings').innerHTML = '';
    // temp

    if (item_type === 'document') {
        // TODO
    }
    else if (item_type === 'page') {
        // TODO
    }
    else if (item_type === 'content') {
        // TODO
        insertModeBanners();
    }
}

export async function initiatePEGenerator(display_name, func_name) {
    const currentModule = await import(`../gen-modules/${func_name}.js`); 
    const currentGen = currentModule.default;
    const pre_settings = currentModule.get_presets();

    FH.createSettingsFields(currentModule.settings_fields, await import('../templates/gen-settings.js'), 'pe-settings-form').then(() => {
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