import * as TB from '../templates/topic-banners.js';
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

    document.getElementById('worksheet-mode-selector').innerHTML = output_html;
    MathJax.typesetPromise(['#worksheet-mode-selector']);
}

export async function insertModeSettings(gen_func_name) {
    const current_gen_module = await import(`../gen-modules/${gen_func_name}.js`);
    const pre_settings = current_gen_module.get_presets();

    FH.createSettingsFields(current_gen_module.settings_fields, await import('../templates/gen-settings.js'), 'worksheet-mode-settings').then(() => {
        FH.updateFormValues(pre_settings,'worksheet-mode-settings')
    })

}