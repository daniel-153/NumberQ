import * as H from '../helper-modules/gen-helpers.js';
import * as PH from"../helper-modules/polynom-helpers.js";
import * as SH from '../helper-modules/settings-helpers.js';

function processSettings(formObj) {
    let { number_of_terms, term_range_min, term_range_max, muldiv_operation_type, number_type, multiply_symbol, answer_form } = formObj;
    let error_locations = []; // stores a list of input fields where errors occures (same field can appear multiple times)
    
    // validate number_of_terms and keep track of error locations
    number_of_terms = SH.val_term_number(number_of_terms, error_locations);
    

    // validate the term range and keep track of error locations
    let validatedMinMax = SH.val_min_max_range(term_range_min, term_range_max, error_locations);
    term_range_min = validatedMinMax.term_range_min;
    term_range_max = validatedMinMax.term_range_max;

    // only allow the Quotient + Rem form where it makes sense (a division of 2 integers)
    if (number_of_terms !== 2 || number_type !== 'integers' || muldiv_operation_type !== 'divide') {
        answer_form = 'factions & integers';
    }

    return {
        number_of_terms: number_of_terms,
        term_range_min: term_range_min,
        term_range_max: term_range_max,
        muldiv_operation_type: muldiv_operation_type,
        number_type: number_type,
        multiply_symbol: multiply_symbol,
        answer_form: answer_form,
        error_locations: error_locations
    };
}

export default function genMulDiv(formObj) {
    const settings = processSettings(formObj);

    const termArray = H.removeFromArray(0,H.integerArray(settings.term_range_min,settings.term_range_max));

    // extra pre-processing to make loops simpler
    let possible_operation_types;
    if (settings.muldiv_operation_type === 'multiply') possible_operation_types = ['multiply'];
    else if (settings.muldiv_operation_type === 'divide') possible_operation_types = ['divide'];
    else if (settings.muldiv_operation_type === 'both') possible_operation_types = ['multiply', 'divide'];

    let possible_number_types;
    if (settings.number_type === 'integers') possible_number_types = ['integers'];
    else if (settings.number_type === 'fractions') possible_number_types = ['fractions'];
    else if (settings.number_type === 'both') possible_number_types = ['integers', 'fractions'];


    let productElements = [];
    let productElements_inMath = [];
    for (let i = 0; i < settings.number_of_terms; i++) {
        let number_type = H.randFromList(possible_number_types);
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


    for (let i = 1; i < settings.number_of_terms; i++) {
        let operation_type = H.randFromList(possible_operation_types);

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

    
    let answer = '';
    if (settings.answer_form === 'factions & integers') {
        // simplify the numer and denom
        const simplifiedFraction = PH.simplifyFraction(numer, denom);
        numer = simplifiedFraction.numer;
        denom = simplifiedFraction.denom;
        
        answer = '\\frac{' + Math.abs(numer) + '}{' + denom + '}';

        if (numer < 0) answer = '-' + answer;
        if (denom === 1) answer = numer; 
    }
    else if (settings.answer_form === 'whole part + remainder') {
        const divisionResult = PH.remainderDivision(numer, denom);
        const whole_part = divisionResult.quotient;
        const remainder = divisionResult.remainder;
        
        answer = whole_part + '\\;\\,R' + remainder;
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
        question: productString,
        answer: answer,
        settings: settings,
        error_locations: error_locations
    };
}   


export const settings_fields = [
    'number_of_terms',
    'term_range',
    'muldiv_operation_type',
    'number_type',
    'multiply_symbol',
    'answer_form'
];

export function get_presets() {
    const operation_type = H.randFromList(['multiply','divide']);
    const answer_form = (operation_type === 'multiply') ? 'factions & integers' : 'whole part + remainder';
    const term_range_min = (operation_type === 'multiply') ? H.randInt(-20, -2) : 2; 

    return {
        number_of_terms: 2,
        term_range_min: term_range_min,
        term_range_max: H.randInt(3, 20),
        muldiv_operation_type: operation_type,
        number_type: 'integers',
        multiply_symbol: ' \\times ',
        answer_form: answer_form
    };
}

export function get_rand_settings() {
    const operation_type = H.randFromList(['multiply','divide','both']);
    const answer_form = (operation_type === 'multiply' || operation_type === 'both') ? 'factions & integers' : 'whole part + remainder';

    return {
        number_of_terms: H.randInt(2,4),
        term_range_min: H.randInt(-20, -1),
        term_range_max: H.randInt(1, 20),
        muldiv_operation_type: operation_type,
        number_type: H.randFromList(['integers','fractions','both']),
        multiply_symbol: H.randFromList([' \\cdot ', ' \\times ']),
        answer_form: answer_form
    }; 
}