import * as H from '../helper-modules/gen-helpers.js';

function processAddSubSettings(formObj) {
    // An internal function to process the formObject and return 'settings' as its used below
    //
    // This will be called inside of the genAddSub function like settings = processAddSubSettings(formObj);
    //
    // Also, this is likely the proper place to validate the settings and figure out which error message should be displayed in which case
    // (so if there's an error in processing, the genAddSub function can return an error/something that indicates an error)    
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

    return {
        question: sumString,
        answer: valueOfSum
    };
}

export function get_presets() {
    return {
        number_of_terms: 2,
        term_range_min: H.randInt(-50, -1),
        term_range_max: H.randInt(1, 50),
        operation_type: H.randFromList(['add','subtract'])
    };
}


