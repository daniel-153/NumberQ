import * as H from '../helper-modules/gen-helpers.js';

function processSettings(formObj) {
    let number_of_terms = formObj.number_of_terms;
    let term_range_min = formObj.term_range_min;
    let term_range_max = formObj.term_range_max;
    let operation_type = formObj.operation_type;
    let error_locations = []; // stores a list of input fields where errors occures (same field can appear multiple times)

    // validate number_of_terms (can be extracted to an external function)
    if (number_of_terms === '') {
        number_of_terms = 2;
        error_locations.push('number_of_terms');
    } // Number of terms has no input value
    else number_of_terms = Number(number_of_terms);

    if (Number.isNaN(number_of_terms)) {
        number_of_terms = 2;
        error_locations.push('number_of_terms');
    } // number of terms is not a number (can't be converted to a number)
    else if (number_of_terms > 10) {
        number_of_terms = 10;
        error_locations.push('number_of_terms');
    } // Number of terms exceeds the max of the range
    else if (number_of_terms < 2) {
        number_of_terms = 2;
        error_locations.push('number_of_terms');
    } // Number of terms is below the mix of the range
    else if (number_of_terms >= 2 && number_of_terms <= 10) {
        if (!Number.isInteger(number_of_terms)) {
            number_of_terms = Math.floor(Math.abs(number_of_terms));
            error_locations.push('number_of_terms');
        }
    } // number of terms is in the correct range but isn't an integer
    

    // validate term range (can be extracted to an external function)
    term_range_min = Number(term_range_min);
    term_range_max = Number(term_range_max);
    if (Number.isNaN(term_range_min) && Number.isNaN(term_range_max)) { // After this, term range min and max must be numbers
        term_range_min = -10;
        term_range_max = 10;
        error_locations.push('term_range_min','term_range_max');
    }
    else if (Number.isNaN(term_range_min)) {
        term_range_min  = -10;
        error_locations.push('term_range_min');
    }
    else if (Number.isNaN(term_range_max)) {
        term_range_max = 10;
        error_locations.push('term_range_max');
    }

    if (!Number.isInteger(term_range_min)) { // After this, term range min and max must be integers
        term_range_min = Math.floor(term_range_min);
        error_locations.push('term_range_min');
    }
    if (!Number.isInteger(term_range_max)) {
        term_range_max = Math.floor(term_range_max);
        error_locations.push('term_range_max');
    }

    if (term_range_min < -999) { // After this |term range max/min| <= 999 (as stated in the tooltip requirement)
        term_range_min = -999;
        error_locations.push('term_range_min');
    }
    else if (term_range_min > 999) {
        term_range_min = 999;
        error_locations.push('term_range_min');
    }
    if (term_range_max > 999) {
        term_range_max = 999;
        error_locations.push('term_range_max');
    }
    else if (term_range_max < -999) {
        term_range_max = -999;
        error_locations.push('term_range_max');
    }

    if (term_range_min > term_range_max) { // After this, (term range min) <= (term range max)
        let temp = term_range_min;
        term_range_min = term_range_max;
        term_range_max = temp;
        error_locations.push('term_range_min','term_range_max');
    }
    if (term_range_min === 0 && term_range_max ===0) {
        term_range_min = -10;
        term_range_max = 10;
        error_locations.push('term_range_min','term_range_max');
    }

    return {
        number_of_terms: number_of_terms,
        term_range_min: term_range_min,
        term_range_max: term_range_max,
        operation_type: operation_type,
        error_locations: error_locations
    };
} // Note: later on, you likely want to have reusable functions for validation like val_minMaxRange(min,max), or val_termNumber
  // also, you should create a module of 'validation helper functions' for this


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
    if (settings.operation_type === 'add') {
        for (let i = 1; i < sumElements.length; i++) {
            sumString = sumString + '+' + sumElements_inMath[i];
            valueOfSum = valueOfSum + sumElements[i];
        }
    }
    else if (settings.operation_type === 'subtract') {
        for (let i = 1; i < sumElements.length; i++) {
            sumString = sumString + '-' + sumElements_inMath[i];
            valueOfSum = valueOfSum - sumElements[i];
        }
    }
    else if (settings.operation_type === 'both') {
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

export function get_presets() {
    return {
        number_of_terms: 2,
        term_range_min: H.randInt(-20, -1),
        term_range_max: H.randInt(1, 20),
        operation_type: 'both'
    };
}

export function get_rand_settings() {
    return {
        number_of_terms: H.randInt(2,4),
        term_range_min: H.randInt(-20, -1),
        term_range_max: H.randInt(1, 20),
        operation_type: H.randFromList(['add','subtract','both'])
    }; 
}

