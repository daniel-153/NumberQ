import * as H from '../helper-modules/gen-helpers.js';

function setAddSub(numOfTerms, operation, termRange) {
    return {
        numOfTerms: numOfTerms,
        operation: operation,
        termRange: termRange 
    };
}


function genAddSub(settings) {
    const range = settings.termRange; // The maximum magnitude of a number in the sum (numbers can be from -range to range excluding 0)
    const sumLength = settings.numOfTerms; // How many numbers the sum will have
    let constArray; // array to hold all the terms of the sum
    
    // Decide whether there should be addition, subtraction, or both
    if (settings.operation === 'add') {
        constArray = H.integerArray(1,range);
    }
    else if (settings.operation === 'subtract') {
        constArray = H.integerArray((-1)*range,-1);
    }
    else if (settings.operation === 'both') {
        constArray = H.removeFromArray(0,H.integerArray((-1) * range, range)); 
    }


    const sumTemplate = H.arrayOfRandsFromList(constArray,sumLength);
    let sum = 0;

    for (let i = 0; i < sumTemplate.length; i++) {
        sum += sumTemplate[i]; // Add each element of the array to the sum
    }


    // conversion to math

    let result = ""; 
    for (let i = 0; i < sumTemplate.length; i++) {
        let numStr = sumTemplate[i].toString(); 
        if (numStr.charAt(0) !== '-' && i !== 0) {
            numStr = '+' + numStr; 
        }
        result += numStr; 
    }
    
    return {
        question: result,
        answer: sum
    };
} 

let settings = setAddSub(2,'subtract',10);
console.log(genAddSub(settings));