import { createSettingsFields, preValidateSettings } from '../../scripts/helpers/form-helpers.js';
import { randInt, integerArray, removeFromArray } from '../../scripts/math-gens/helpers/gen-helpers.js'; 
import * as settings_templates_module from '../../scripts/templates/gen-settings.js';

// quick-start template: const gen_testing = await import('http://127.0.0.1:5500/testing/gen-testing/gen-testing.js'); gen_testing.testGenerator('genAddSub', {starting_test_number: 1, max_number_of_tests: 1000, stop_on_failed_test: false, settings_progression: 'permutations'});

function _getValidValuesLog(gen_module) {
    // placeholder form required to use createSettingsFields
    let placeholder_form_el = document.getElementById('placeholder-form');
    if (placeholder_form_el === null) { // form still needs to be created
        placeholder_form_el = document.createElement('form');
        placeholder_form_el.id = 'placeholder-form';
        placeholder_form_el.style.display = 'none'
        document.body.appendChild(placeholder_form_el);
    }
    else { // form already exists (clear it)
        placeholder_form_el.innerHTML = '';
    }

    return createSettingsFields(gen_module.settings_fields, settings_templates_module, 'placeholder-form')
}

async function getSettingsPermutator(gen_module) {
    // go from raw_valid_values (which has implied ranges and excluded values) to a permutator with exhuastive lists of valid values
    const raw_valid_values = await _getValidValuesLog(gen_module);
    const settings_permutator = {
        advanceToNextSettings: function() { // advance by one unit and rollover+carry (from right to left) if necessary (like an odometer)
            let carry_to_next = true; // starts off true (imagine there is another dial before the first one that carried over and started the current cycle below)
            for (let setting_obj_index = this.setting_objs.length - 1; (setting_obj_index >= 0) && (carry_to_next); setting_obj_index--) {
                carry_to_next = this.setting_objs[setting_obj_index].advanceToNextValue(); // carry if rolled over
            }
        },
        getCurrentSettings: function() {
            const extracted_settings = {};
            for (let settings_obj_index = 0; settings_obj_index < this.setting_objs.length; settings_obj_index++) {
                const current_settings_name = this.setting_objs[settings_obj_index].setting_name;
                const current_settings_value = this.setting_objs[settings_obj_index].getCurrentValue();
                extracted_settings[current_settings_name] = current_settings_value;
            }

            return extracted_settings;
        },
        getRandomSettings: function() {
            const extracted_settings = {};
            for (let settings_obj_index = 0; settings_obj_index < this.setting_objs.length; settings_obj_index++) {
                const current_settings_name = this.setting_objs[settings_obj_index].setting_name;
                const possible_values = this.setting_objs[settings_obj_index].possible_values;
                const current_settings_value = possible_values[randInt(0, possible_values.length - 1)];
                extracted_settings[current_settings_name] = current_settings_value;
            }

            return extracted_settings;
        },
        setting_objs: []
    };

    for (const [setting_name, log_entry] of Object.entries(raw_valid_values)) {
        const valid_values = log_entry.valid_values;
        
        // resolve valid values into an exhuastive array
        let all_possible_values;
        if (valid_values[1] === '--') { // implied numerical range
            all_possible_values = integerArray(valid_values[0], valid_values[2]);
        }
        else if (Array.isArray(valid_values[0]) && valid_values[0][0] === '__empty__') { // multi-select but NOT required checkbox group
            throw new Error(`Could not create settings testing obj for ${setting_name}: no handling exists yet for non-required checkbox groups.`);  
        }
        else if (Array.isArray(valid_values[0])) { // required multi-select checkbox group
            all_possible_values = [...valid_values];
        }
        else if (valid_values[0] === '__regex__') { // text input being validated by a regex
            throw new Error(`Could not create settings testing obj for ${setting_name}: no handling exists yet for regex-validated text inputs.`);  
        }
        else if (typeof(valid_values[0]) === 'string') { // radio button group
            all_possible_values = [...valid_values];
        }

        // remove any excluded values
        if (
            log_entry.excluded_values !== undefined && 
            Array.isArray(log_entry.excluded_values) && 
            log_entry.excluded_values.length >= 1
        ) {
            all_possible_values = removeFromArray(log_entry.excluded_values, all_possible_values);
        }

        // create the settings testing object
        settings_permutator.setting_objs.push(
            {
                setting_name: setting_name,
                current_index: 0,
                possible_values: all_possible_values,
                getCurrentValue: function() {
                    return this.possible_values[this.current_index];
                },
                advanceToNextValue: function() {
                    this.current_index++;
                    
                    let rolled_over = false;
                    if (this.current_index === this.possible_values.length) { // need to roll over (went past the last index)
                        this.current_index = 0;
                        rolled_over = true;
                    }

                    return rolled_over;
                }
            }
        );
    }

    // (bubble) sort the settings objs by their number of possible values descending -> [most_possibilities, ..., least_possibilities]
    for (let last_comparison_index = settings_permutator.setting_objs.length - 1; last_comparison_index >= 1; last_comparison_index--) {
        for (let arr_index = 0; arr_index < last_comparison_index; arr_index++) {
            let value_i_0 = settings_permutator.setting_objs[arr_index].possible_values.length;
            let value_i_1 = settings_permutator.setting_objs[arr_index + 1].possible_values.length;

            if (value_i_0 < value_i_1) {
                let temp = settings_permutator.setting_objs[arr_index];
                settings_permutator.setting_objs[arr_index] = settings_permutator.setting_objs[arr_index + 1];
                settings_permutator.setting_objs[arr_index + 1] = temp;
            }
        }
    }

    return settings_permutator;
}

export async function logSettingsStats(gen_func_name) {
    const gen_module = await import(`../../scripts/math-gens/gens/${gen_func_name}.js`);
    const settings_permutator = await getSettingsPermutator(gen_module);

    // get the total number of possible settings permuations for the current permutator
    let total_permutations = 1;
    settings_permutator.setting_objs.forEach(settings_testing_obj => {
        total_permutations *= settings_testing_obj.possible_values.length;
    });

    const permutation_propotions = [];
    let running_permutations = total_permutations;
    settings_permutator.setting_objs.forEach(settings_testing_obj => {
        const current_stats = {};
        current_stats['setting_name'] = settings_testing_obj.setting_name;
        current_stats['possible_values'] = settings_testing_obj.possible_values.length;
        current_stats['percent_of_total_testing'] = ((Math.log(settings_testing_obj.possible_values.length) / Math.log(total_permutations))*100).toFixed(4) + '%';
        current_stats['running_permutations'] = running_permutations;
        permutation_propotions.push(current_stats);

        running_permutations /= settings_testing_obj.possible_values.length;
    });

    console.log('Settings stats for: ',gen_func_name);
    console.log('Total Permuations: ',total_permutations);
    console.log('Permutation Breakdown:')
    console.table(permutation_propotions);
}

async function _getBundledGenFunc(gen_module) { // prevalidate + validate + generate & resolve different output types
    const valid_values_log = await _getValidValuesLog(gen_module);
    
    return async function(settings) {
        const error_locations = new Set(); // a placeholder (only necessary to use functions below)
        preValidateSettings(settings, valid_values_log, error_locations);
        gen_module.validateSettings(settings, error_locations);
        const gen_output = await gen_module.default(settings);

        // use the TeX question and answer instead of question and answer for canvas (non-latex-string) output gens
        const question = (typeof(gen_output.question) === 'object')? gen_output.TeXquestion : gen_output.question;
        const answer = (typeof(gen_output.answer) === 'object')? gen_output.TeXanswer : gen_output.answer;

        return { // String()s (never numbers) are required for sympy.parsing.parse_latex + presence of line breaks interferes with python string handling (so they are removed here) 
            question: String(question).replace(/[\r\n]+/g, ''),
            answer: String(answer).replace(/[\r\n]+/g, '')
        };
    }
}

function _stringifyUndefinedValues(settings_obj) { // "key": undefined -> "key": "undefined" (but only on the first level -- built for settings objs)
    const cleaned_settings_obj = {}; // copy to avoid mutation 
    
    for (const [key, value] of Object.entries(settings_obj)) { // copy over first level values into cleaned_settings_obj, but change undefined to 'undefined'
        if (value === undefined) {
            cleaned_settings_obj[key] = 'undefined'
        }
        else cleaned_settings_obj[key] = value;
    }

    return cleaned_settings_obj;
}

export async function testGenerator(
    gen_func_name, 
    config = {
        starting_test_number: 1,
        max_number_of_tests: 100_000,
        stop_on_failed_test: false,
        settings_progression: 'permutations' // 'permutations' or 'random'
    }
) {
    const gen_module = await import(`../../scripts/math-gens/gens/${gen_func_name}.js`);
    const genFunc = await _getBundledGenFunc(gen_module); // simplified to just take a settings object and return a question and answer object (intermediate validiation bundled)
    const settings_permutator = await getSettingsPermutator(gen_module);
    
    // need to "fast foward" (not starting on the first test)
    if (config.starting_test_number > 1) {
        for (let i = 0; i < (config.starting_test_number - 1); i++) {
            settings_permutator.advanceToNextSettings();
        }
    }

    let stop_reason;
    let completed_tests = 0;
    try {
        while (completed_tests < config.max_number_of_tests) {
            let current_settings;
            if (config.settings_progression === 'permutations') current_settings = settings_permutator.getCurrentSettings();
            else if (config.settings_progression === 'random') current_settings = settings_permutator.getRandomSettings();
            const gen_output_obj = await genFunc(current_settings);
 
            const response_obj = await (await fetch('http://127.0.0.1:5000/dispatch_test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: gen_output_obj.question,
                    answer: gen_output_obj.answer,
                    settings: _stringifyUndefinedValues(current_settings),
                    gen_name: gen_func_name
                })  
            })).json();

            if (response_obj.test_result === 'not_performable') { // always stop on tests with errors
                stop_reason = 'error in test server';
                throw new Error(`test could not be performed, test-server encountered an error: ${response_obj.error}`);
            }
            else if (response_obj.test_result === 'failed' && config.stop_on_failed_test) { // check for + handle a failed test
                stop_reason = 'stopped on a math discrepency';
                break;
            }

            completed_tests++;
            settings_permutator.advanceToNextSettings();
        }
    } catch (error) {
        console.error('Testing failed: ', error);
    }

    if (completed_tests === config.max_number_of_tests && stop_reason === undefined) {
        stop_reason = 'max number of tests reached';
    }

    return {result: stop_reason};
}