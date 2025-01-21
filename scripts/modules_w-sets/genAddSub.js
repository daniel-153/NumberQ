import * as H from '../helper-modules/gen-helpers.js';

function setAddSub(numOfTerms, operation, termRange) {
    return {
        numOfTerms: numOfTerms,
        operation: operation,
        termRange: termRange 
    };
} // termRange should be a two-number array like [-5,4]

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


let settings = setAddSub(H.randInt(2,6),'both',[1,10]);
console.log(genAddSub(settings));