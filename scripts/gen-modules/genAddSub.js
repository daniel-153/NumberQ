import * as H from '../helper-modules/gen-helpers.js';
import * as SH from '../helper-modules/settings-helpers.js';

function processSettings(formObj) {
    let { number_of_terms, term_range_min, term_range_max, addsub_operation_type } = formObj;
    let error_locations = []; // stores a list of input fields where errors occures (same field can appear multiple times)

    // validate number_of_terms and keep track of error locations
    number_of_terms = SH.val_term_number(number_of_terms, error_locations);
    

    // validate the term range and keep track of error locations
    let validatedMinMax = SH.val_min_max_range(term_range_min, term_range_max, error_locations);
    term_range_min = validatedMinMax.term_range_min;
    term_range_max = validatedMinMax.term_range_max;

    return {
        number_of_terms: number_of_terms,
        term_range_min: term_range_min,
        term_range_max: term_range_max,
        addsub_operation_type: addsub_operation_type,
        error_locations: error_locations
    };
} 


export default function genAddSub(formObj) {
    const settings = processSettings(formObj);
    
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

    // This seems to violate seperation of concerns but so does dealing with processSettings() here, and would there even be any obvious way
    // to avoid this?...
    let error_locations = [];
    if (settings.error_locations.length > 0) {
        if (settings.error_locations.indexOf('number_of_terms') !== -1) error_locations.push('number_of_terms');
        if (settings.error_locations.indexOf('term_range_min') !== -1) error_locations.push('term_range_min');
        if (settings.error_locations.indexOf('term_range_max') !== -1) error_locations.push('term_range_max');
    }

    return {
        question: sumString,
        answer: valueOfSum,
        settings: settings,
        error_locations: error_locations
    };
}

// defines which settings are to be fetched for this gen and in which order they should appear
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
        addsub_operation_type: H.randFromList(['add','subtract','both'])
    }; 
}

