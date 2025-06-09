import * as H from '../helpers/gen-helpers.js';
import * as SH from '../helpers/settings-helpers.js';

export function validateSettings(form_obj, error_locations) {
    // validate number_of_terms and keep track of error locations
    form_obj.number_of_terms = SH.val_term_number(form_obj.number_of_terms, error_locations);

    // validate the term range and keep track of error locations
    let validated_min_max = SH.val_min_max_range(form_obj.term_range_min, form_obj.term_range_max, error_locations);
    form_obj.term_range_min = validated_min_max.term_range_min;
    form_obj.term_range_max = validated_min_max.term_range_max;
}

export default function genAddSub(settings) {    
    const termArray = H.removeFromArray(0,H.integerArray(settings.term_range_min,settings.term_range_max)); // Array of possible values for the terms
    const sumLength = settings.number_of_terms; // How many terms the sum will have

    let sumString = '';
    const sumElements = H.arrayOfRandsFromList(termArray, sumLength);
    let sumElements_inMath = [...sumElements];
    for (let i = 0; i < sumElements_inMath.length; i++) {
        if (sumElements_inMath[i] < 0) sumElements_inMath[i] = '(' + sumElements_inMath[i] + ')';
    } // Add parentheses to negative terms in the sum

    
    // creating the sum string and calculating the value of the sum
    sumString = sumString + sumElements_inMath[0];
    let valueOfSum = sumElements[0];
    if (settings.addsub_operation_type === 'add') {
        for (let i = 1; i < sumElements.length; i++) {
            sumString = sumString + '+' + sumElements_inMath[i];
            valueOfSum = valueOfSum + sumElements[i];
        }
    }
    else if (settings.addsub_operation_type === 'subtract') {
        for (let i = 1; i < sumElements.length; i++) {
            sumString = sumString + '-' + sumElements_inMath[i];
            valueOfSum = valueOfSum - sumElements[i];
        }
    }
    else if (settings.addsub_operation_type === 'both') {
        for (let i = 1; i < sumElements.length; i++) {
            let switcher = H.randInt(0,1);

            if (switcher === 0) {
                sumString = sumString + '+' + sumElements_inMath[i];
                valueOfSum = valueOfSum + sumElements[i];
            }
            else {
                sumString = sumString + '-' + sumElements_inMath[i]; 
                valueOfSum = valueOfSum - sumElements[i]; 
            } 
        } 
    }

    return {
        question: sumString,
        answer: valueOfSum
    };
}

export const settings_fields = [
    'number_of_terms',
    'term_range',
    'addsub_operation_type'
];

export function get_presets() {
    return {
        number_of_terms: 2,
        term_range_min: H.randInt(-20, -1),
        term_range_max: H.randInt(1, 20),
        addsub_operation_type: 'both'
    };
}

export function get_rand_settings() {
    return {
        number_of_terms: H.randInt(2,4),
        term_range_min: H.randInt(-20, -1),
        term_range_max: H.randInt(1, 20),
        addsub_operation_type: '__random__'
    }; 
}