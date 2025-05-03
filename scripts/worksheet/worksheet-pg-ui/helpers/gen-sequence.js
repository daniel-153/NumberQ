import * as UH from '../../../helpers/ui-helpers.js';
import * as FH from '../../../helpers/form-helpers.js';
import * as TB from '../../../templates/topic-banners.js';

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

    MathJax.typesetPromise(['#pe-mode-selector']);
}

export function updatePGQABoxes(question_obj) {
    // main UI (just 2 rendered boxes)
    UH.updateElementMath('pe-question',question_obj.question,'3vw');
    UH.updateElementMath('pe-answer',question_obj.answer,'2.5vw');
}

export function adjustOutputBoxSizing(func_name) {

}