import * as H from '../helper-modules/gen-helpers.js';

function processAddSubSettings(formObj) {
    // An internal function to process the formObject and return 'settings' as its used below
    //
    // This will be called inside of the genAddSub function like settings = processAddSubSettings(formObj);
    //
    // Also, this is likely the proper place to validate the settings and figure out which error message should be displayed in which case
    // (so if there's an error in processing, the genAddSub function can return an error/something that indicates an error)    
}   

function genAddSub(settings) {
    const termArray = H.removeFromArray(0,H.integerArray(settings.termRange[0],settings.termRange[1])); // Array of possible values for the terms
    const sumLength = settings.numOfTerms; // How many terms the sum will have

    let sumString = '';
    const sumElements = H.arrayOfRandsFromList(termArray, sumLength);
    let sumElements_inMath = [...sumElements];
    for (let i = 0; i < sumElements_inMath.length; i++) {
        if (sumElements_inMath[i] < 0) sumElements_inMath[i] = '(' + sumElements_inMath[i] + ')';
    } // Add parentheses to negative terms in the sum

    
    // creating the sum string and calculating the value of the sum
    sumString = sumString + sumElements_inMath[0];
    let valueOfSum = sumElements[0];
    if (settings.operation === 'add') {
        for (let i = 1; i < sumElements.length; i++) {
            sumString = sumString + '+' + sumElements_inMath[i];
            valueOfSum = valueOfSum + sumElements[i];
        }
    }
    else if (settings.operation === 'subtract') {
        for (let i = 1; i < sumElements.length; i++) {
            sumString = sumString + '-' + sumElements_inMath[i];
            valueOfSum = valueOfSum - sumElements[i];
        }
    }
    else if (settings.operation === 'both') {
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

export function get_addSubPresets() {
    return {
        numOfTerms: 2,
        termRange: [H.randInt(-99, -1),H.randInt(1, 99)],
        operation: H.randFromList('add','subtract')
    };
}


const myObj = {
    "my-key": value
}

console.log(myObj['my-key'])