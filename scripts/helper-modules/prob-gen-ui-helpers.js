import * as UH from './ui-helpers.js';
import * as FH from './form-helpers.js';
import * as TB from '../templates/topic-banners.js';

export async function initiateGenerator(type, funcName) {
    document.getElementById("generator-name").innerHTML = type;
    document.querySelectorAll(".output-box").forEach(element => {
        element.setAttribute("data-special-styles", funcName);
    });

    const currentModule = await import(`../gen-modules/${funcName}.js`); 
    const currentGen = currentModule.default;
    const pre_settings = currentModule.get_presets();

    FH.createSettingsFields(currentModule.settings_fields, await import('../templates/gen-settings.js'), 'settings-form').then(() => {
        // This will run after all settings have been inserted
        FH.updateFormValues(pre_settings, 'settings-form');
        // moved this into the .then because pre-sets might not actually match the first generation (due to a change in validation or as in sysEqs)
        switchToNewQuestion(currentGen(pre_settings));
    });
    
    UH.cleanedFromListeners(document.getElementById("generate-button")).addEventListener("click", async () => {
        if (!document.getElementById('randomize-all-checkbox').checked) {
            const currentSettings = FH.getFormObject('settings-form');
            switchToNewQuestion(currentGen(currentSettings)); 
        } // randomize_all isn't checked -> use provided settings
        else {
            const currentSettings = currentModule.get_rand_settings();
            switchToNewQuestion(currentGen(currentSettings));
        } // randomize_all is checked -> use random (pre-set) settings
    });

    // change sizing of Q and A boxes in fullscreen mode (if needed)
    document.getElementById('fullscreen-question').setAttribute("data-special-styles", funcName);
    document.getElementById('fullscreen-answer').setAttribute("data-special-styles", funcName);
}

export function switchToNewQuestion(newQuestion) {
    const question = newQuestion.question;
    const answer = newQuestion.answer;
    const TeXquestion = (newQuestion.TeXquestion === undefined) ? newQuestion.question : newQuestion.TeXquestion;
    const TeXanswer = (newQuestion.TeXanswer === undefined) ? newQuestion.answer : newQuestion.TeXanswer;
    
    UH.updateElementMath('rendered-Q',question,'3vw')
    document.getElementById('un-rendered-Q').innerHTML = TeXquestion;
    UH.updateElementMath('rendered-A',answer,'2.5vw')
    document.getElementById('un-rendered-A').innerHTML = TeXanswer;

    MathJax.typesetPromise([document.getElementById('Q-A-container')]);

    // Change settings if needed here
    FH.updateFormValues(newQuestion.settings, 'settings-form');

    // flash any elements with errors here
    const error_locations = newQuestion.error_locations;
    if (error_locations.length > 0) {
        FH.flashFormElements(error_locations, 'settings-form');
    }

    // Presentation mode updates
    UH.updateElementMath('fullscreen-question', question, '3.75vw');
    UH.updateElementMath('fullscreen-answer', answer, '3.3vw');

    MathJax.typesetPromise([document.getElementById('fullscreen-Q-A-wrapper')]);
} 

export function setupCopyButton(button_id, text_element_id) {
    const button = document.getElementById(button_id);
    button.addEventListener('click', () => {
        navigator.clipboard.writeText(document.getElementById(text_element_id).textContent);
        button.innerHTML = 'Copied!';
        button.setAttribute('data-status', 'text-was-copied');
        
        if (button._timeoutId) {
            clearTimeout(button._timeoutId);
        }
    
        button._timeoutId = setTimeout(() => {
            button.innerHTML = 'Copy';
            button.removeAttribute('data-status');
            button._timeoutId = null; 
        }, 2000);
    });
}

export function toggleFullScreenAns(method = 'toggle') {
    if (method === 'toggle') {
        if (document.getElementById('show-hide-button').getAttribute('data-status') === 'show') method = 'show';
        else if (document.getElementById('show-hide-button').getAttribute('data-status') === 'hide') method = 'hide';
        else method = 'show';
    }

    if (method === 'show') {
        document.getElementById('fullscreen-answer').style.background = 'whitesmoke';
        document.getElementById('fullscreen-answer').style.color = 'rgb(11, 5, 5)';
        document.getElementById('show-hide-button').innerHTML = 'Hide';
        document.getElementById('show-hide-button').setAttribute('data-status','hide');
        document.getElementById('fullscreen-answer').style.overflowX = 'auto';
    }
    else if (method === 'hide') {
        document.getElementById('fullscreen-answer').style.background = '';
        document.getElementById('fullscreen-answer').style.color = '';
        document.getElementById('show-hide-button').innerHTML = 'Show';
        document.getElementById('show-hide-button').removeAttribute('data-status');
        document.getElementById('show-hide-button').setAttribute('data-status','show');
        document.getElementById('fullscreen-answer').style.overflowX = 'hidden';
    }
} // method => 'show', 'hide', or 'toggle' the fullscreen answer 

export function insertModeBanners() {
    let output_html = '';
    TB.templates.forEach(banner_template => {
        let example_problem_class;
        if (banner_template.example_problem_class === undefined) example_problem_class = '';
        else example_problem_class = banner_template.example_problem_class;
             
        output_html += `
            <div class="generator ${banner_template.category_class_name}">
            <div class="gen-title-container">
                <h1 class="gen-title">${banner_template.display_name}</h1>
                <h2 class="gen-topic">(${banner_template.display_category})</h2>
            </div>
            <div class="example-problem ${example_problem_class}">\\(${banner_template.example_problem}\\)</div>
            <button
                class="start-button"
                data-gen-type="${banner_template.display_name}"
                data-gen-func-name="${banner_template.function_name}"
            >
                Generate
            </button>
            </div>
        `;
    })

    document.getElementById('generator-list').insertAdjacentHTML('afterbegin',output_html);
    MathJax.typesetPromise(['#generator-list']);
}