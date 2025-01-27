import * as H from '../helper-modules/gen-helpers.js';
import * as PH from"../helper-modules/polynom-helpers.js";

const example_settings = {
    number_of_terms: 2,
    term_range_min: -10,
    term_range_max: 10,
    operation_type: ['multiply','divide'], // ['multiply'], ['divide'], both -> ['multiply','divide']
    number_type: ['integers','fractions'], // ['integers'], ['fractions'], both -> ['integers','fractions'] 
    multiply_symbol: H.randFromList([' \\times ',' \\cdot ']), // cross (x) or dot (*)
    answer_form: H.randFromList(['factions & integers', 'whole part + remainder']) // factions & integers, whole part + remainder
};

// testing only:
window.onload = function() {
    const newQuestion = genMulDiv(example_settings);
    const question = newQuestion.question;
    const answer = newQuestion.answer;

    document.getElementById('math_output').innerHTML = '\\(' + question + '\\)';
    document.getElementById('math_answer').innerHTML = '\\(' + answer + '\\)';

    MathJax.typeset();
};

function genMulDiv(settings) {

    const termArray = H.removeFromArray(0,H.integerArray(settings.term_range_min,settings.term_range_max));


    let productElements = [];
    let productElements_inMath = [];
    for (let i = 0; i < settings.number_of_terms; i++) {
        let number_type = H.randFromList(settings.number_type);
        let currentElement;

        if (number_type === 'integers') {
            currentElement = H.randFromList(termArray)
            productElements.push(currentElement);
            
            if (currentElement < 0) currentElement = '(' + currentElement + ')';
            productElements_inMath.push(currentElement);
        }
        else if (number_type === 'fractions') {
            currentElement = [H.randFromList(termArray),H.randFromList(termArray)]
            productElements.push(currentElement);

            if ((currentElement[0] < 0 && currentElement[1] < 0) || (currentElement[1] < 0 && currentElement[0] > 0)) {
                currentElement[0] = (-1) * currentElement[0];
                currentElement[1] = (-1) * currentElement[1];
            }
            
            let fraction = '\\frac{' + Math.abs(currentElement[0]) + '}{' + currentElement[1] + '}';

            if (currentElement[0] > 0) productElements_inMath.push(fraction);
            else productElements_inMath.push('\\left(' + '-' + fraction + '\\right)');
        }
    }


    const multiply_symbol = settings.multiply_symbol;
    let numer = 1;
    let denom = 1;
    let productString = productElements_inMath[0];
    if (typeof(productElements[0]) === 'number') {
        numer = numer * productElements[0];
    } // the current element is an integer
    else {
        numer = numer * productElements[0][0];
        denom = denom * productElements[0][1];
    } // the current element is a fraction

    console.log('initial numer: ',numer)
    console.log('initial denom: ',denom)

    for (let i = 1; i < settings.number_of_terms; i++) {
        let operation_type = H.randFromList(settings.operation_type);

        if (operation_type === 'multiply') {
            productString = productString + multiply_symbol + productElements_inMath[i];

            if (typeof(productElements[i]) === 'number') {
                numer = numer * productElements[i];
            } // the current element is an integer
            else {
                numer = numer * productElements[i][0];
                denom = denom * productElements[i][1];
            } // the current element is a fraction
        }
        else if (operation_type === 'divide') {
            productString = productString + ' \\div ' + productElements_inMath[i];

            if (typeof(productElements[i]) === 'number') {
                denom = denom * productElements[i];
            } // the current element is an integer
            else {
                numer = numer * productElements[i][1];
                denom = denom * productElements[i][0];
            } // the current element is a fraction
        }
    }

    console.log('semi-final numer: ',numer)
    console.log('semi-final denom: ',denom)

    // simplify the numer and denom
    const simplifiedFraction = PH.simplifyFraction(numer, denom);
    numer = simplifiedFraction.numer;
    denom = simplifiedFraction.denom;

    console.log('final numer: ',numer)
    console.log('final denom: ',denom)

    let answer = '';
    if (settings.answer_form === 'factions & integers') {
        answer = '\\frac{' + Math.abs(numer) + '}{' + denom + '}';

        if (numer < 0) answer = '-' + answer;
        if (denom === 1) answer = numer; 
    }
    else if (settings.answer_form === 'whole part + remainder') {
        const whole_part = Math.floor(numer / denom);
        const remainder = Math.abs(numer % denom);
        
        answer = whole_part + '\\;\\,R' + remainder;
    }

    return {
        question: productString,
        answer: answer
    };
}   
