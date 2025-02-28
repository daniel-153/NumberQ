import * as H from '../helper-modules/gen-helpers.js';
import * as PH from"../helper-modules/polynom-helpers.js";
import * as SH from '../helper-modules/settings-helpers.js';

function processSettings(formObj) {
    let { term_range_min, term_range_max, general_operation_types, randomize_order, force_ints_in_div} = formObj;
    let error_locations = []; // stores a list of input fields where errors occures (same field can appear multiple times)

    // validate the term range and keep track of error locations
    let validatedMinMax = SH.val_min_max_range(term_range_min, term_range_max, error_locations);
    term_range_min = validatedMinMax.term_range_min;
    term_range_max = validatedMinMax.term_range_max;

    // validate operation types (assign it if it's empty)
    if (general_operation_types === undefined) general_operation_types = ['multiply','divide'];

    return {
        term_range_min: term_range_min,
        term_range_max: term_range_max,
        general_operation_types: general_operation_types,
        randomize_order: randomize_order,
        force_ints_in_div: force_ints_in_div,
        error_locations: error_locations
    };
}

export default function genComArith(formObj) {
    const settings = processSettings(formObj);
    const { term_range_min, term_range_max, randomize_order, force_ints_in_div} = settings;
    const operation_type = H.randFromList(settings.general_operation_types); // pick a single operation from operation_types array

    const realCoefRange = H.integerArray(term_range_min, term_range_max); // range for (a) in (a) + (b)i
    const complexCoefRange = H.removeFromArray(0, realCoefRange); // range for (b) in (a) + (b)i -> *Excludes 0*

    const templateB = [H.randFromList(realCoefRange), H.randFromList(complexCoefRange)]; // second complex number
    let templateA = [H.randFromList(realCoefRange), H.randFromList(complexCoefRange)]; // first complex number
    if (force_ints_in_div === 'yes' && operation_type === 'divide') { // change templateA to force ints in div if necessary
        const R = templateB[0];
        const T = templateB[1];
        const P = H.randFromList(realCoefRange);
        const Q = H.randFromList(H.removeFromArray( ((-1)*P*R)/T, realCoefRange ));

        templateA = [Q*R - P*T, Q*T + P*R];
    } // note: now, both complex coefs are non-zero and the numer forces ints in div if needed


    let complexNum_A, complexNum_B; // complex numbers A and B *in math*

    // split the templates into their components
    let a = templateA[0] + '';
    let b = templateA[1] + 'i';
    let c = templateB[0] + '';
    let d = templateB[1] + 'i';

    // randomize the order of the terms if needed
    let numA_switch, numB_switch;
    if (randomize_order === 'yes') {
        numA_switch = H.randInt(0,1); // Switch the order of terms in numA: 0 -> a+bi | 1 -> bi+a
        numB_switch = H.randInt(0,1); // Switch the order of terms in numB
    }
    else if (randomize_order === 'no') {
        numA_switch = 0;
        numB_switch = 0;
    }
    
    // convert each complex number to math
    if (a === '0') a = ''
    if (c === '0') c = ''

    if ((a === '') && (b === '0i')) b = '0'
    else if (b === '0i') b = ''
    else if (b === '-1i') b = '-i'
    else if ((a !== '') && (b === '1i')) b = '+i'
    else if ((a === '') && (b === '1i')) b = 'i'
    else if ((a !== '') && (b.charAt(0) !== '-')) b = '+' + b

    if ((c === '') && (d === '0i')) d = '0'
    else if (d === '0i') d = ''
    else if (d === '-1i') d = '-i'
    else if ((c !== '') && (d === '1i')) d = '+i'
    else if ((c === '') && (d === '1i')) d = 'i'
    else if ((c !== '') && (d.charAt(0) !== '-')) d = '+' + d

    if ((numA_switch === 0) && (numB_switch === 0)) {
        complexNum_A = a + b;
        complexNum_B = c + d;
    }
    else if ((numA_switch === 0) && (numB_switch === 1)) {
        if ((c === '') || (d === '')) {
            complexNum_A = a + b;
            complexNum_B = c + d;
        }
        else if ((d.charAt(0) === '+') && (c.charAt(0) !== '-')) {
            d = d.slice(1);
            complexNum_A = a + b;
            complexNum_B = d + '+' + c;
        }
        else if ((d.charAt(0) === '+') && (c.charAt(0) === '-')) {
            d = d.slice(1);
            complexNum_A = a + b;
            complexNum_B = d + c;
        }
        else if ((d.charAt(0) === '-') && (c.charAt(0) !== '-')) {
            complexNum_A = a + b;
            complexNum_B = d + '+' + c;
        }
        else if ((d.charAt(0) === '-') && (c.charAt(0) === '-')) {
            complexNum_A = a + b;
            complexNum_B = d + c;
        }
    }
    else if ((numA_switch === 1) && (numB_switch === 0)) {
        if ((a === '') || (b === '')) {
            complexNum_A = a + b;
            complexNum_B = c + d;
        }
        else if ((b.charAt(0) === '+') && (a.charAt(0) !== '-')) {
            b = b.slice(1);
            complexNum_A = b + '+' + a;
            complexNum_B = c + d;
        }
        else if ((b.charAt(0) === '+') && (a.charAt(0) === '-')) {
            b = b.slice(1);
            complexNum_A = b + a;
            complexNum_B = c + d;
        }
        else if ((b.charAt(0) === '-') && (a.charAt(0) !== '-')) {
            complexNum_A = b + '+' + a;
            complexNum_B = c + d;
        }
        else if ((b.charAt(0) === '-') && (a.charAt(0) === '-')) {
            complexNum_A = b + a;
            complexNum_B = c + d;
        }
    }
    else if ((numA_switch === 1) && (numB_switch === 1)) {
        if ((a === '') || (b === '')) {
            complexNum_A = a + b;
        }
        else if ((b.charAt(0) === '+') && (a.charAt(0) !== '-')) {
            b = b.slice(1);
            complexNum_A =  b + '+' + a;
        }
        else if ((b.charAt(0) === '+') && (a.charAt(0) === '-')) {
            b = b.slice(1);
            complexNum_A = b + a;
        }
        else if ((b.charAt(0) === '-') && (a.charAt(0) !== '-')) {
            complexNum_A = b + '+' + a;
        }
        else if ((b.charAt(0) === '-') && (a.charAt(0) === '-')) {
            complexNum_A = b + a;
        }

        if ((c === '') || (d === '')) {
            complexNum_B = c + d;
        }
        else if ((d.charAt(0) === '+') && (c.charAt(0) !== '-')) {
            d = d.slice(1);
            complexNum_B = d + '+' + c;
        }
        else if ((d.charAt(0) === '+') && (c.charAt(0) === '-')) {
            d = d.slice(1);
            complexNum_B = d + c;
        }
        else if ((d.charAt(0) === '-') && (c.charAt(0) !== '-')) {
            complexNum_B = d + '+' + c;
        }
        else if ((d.charAt(0) === '-') && (c.charAt(0) === '-')) {
            complexNum_B = d + c;
        } 
    }


    let templateResult; // complex number template of the result (of whichever operation)
    let complexNum_prompt; // the prompt *in math*

    // extract the components of both complex numbers again
    a = templateA[0];
    b = templateA[1];
    c = templateB[0];
    d = templateB[1];

    // find the result and prompt based on the operation
    if (operation_type === 'multiply') {
        complexNum_prompt = '(' + complexNum_A + ')(' + complexNum_B + ')';
        templateResult = [a*c - b*d, a*d + b*c];
    }
    else if (operation_type === 'add') {
        complexNum_prompt = '(' + complexNum_A + ')+(' + complexNum_B + ')';
        templateResult = [a + c, b + d];
    }
    else if (operation_type === 'subtract') {
        complexNum_prompt = '(' + complexNum_A + ')-(' + complexNum_B + ')';
        templateResult = [a - c, b - d];
    }
    else if (operation_type === 'divide') {
        complexNum_prompt = '\\frac{' + complexNum_A + '}{' + complexNum_B + '}';
        templateResult = [  (a*c + b*d),(c**2 + d**2)  ,  (b*c - a*d),(c**2 + d**2)  ]; // the ones together are the ones being divided
    }

    // convert the result template to math
    let complexNum_result; // the result (answer) *in math*
    if (operation_type !== 'divide') { 
        // extract components of the result template
        a = templateResult[0] + '';
        b = templateResult[1] + 'i';

        // conversion to math
        if (a === '0') a = ''
        if ((a === '') && (b === '0i')) b = '0'
        else if (b === '0i') b = ''
        else if (b === '-1i') b = '-i'
        else if ((a !== '') && (b === '1i')) b = '+i'
        else if ((a === '') && (b === '1i')) b = 'i'
        else if ((a !== '') && (b.charAt(0) !== '-')) b = '+' + b

        complexNum_result = a + b;
    }
    else { // conversion when the operation was division (need to format/reduce/eliminate the fractions)
        // extract components of the result template -> (a/b) + (c/d)i
        a = templateResult[0];
        b = templateResult[1];
        c = templateResult[2];
        d = templateResult[3];
        
        // reduce a, b, c, and d
        const simplifiedFrac_A = PH.simplifyFraction(a, b);
        const simplifiedFrac_B = PH.simplifyFraction(c, d);
        a = simplifiedFrac_A.numer;
        b = simplifiedFrac_A.denom;
        c = simplifiedFrac_B.numer;
        d = simplifiedFrac_B.denom;
        
        let frac_A, frac_B; // (a) and (b)i (could turn into whole numbers below)

        // first fraction
        if (b === 1) frac_A = a + '';
        else if (a < 0) {
            frac_A = '-\\frac{' + (-1)*a + '}{' + b + '}';
        }
        else {
            frac_A = '\\frac{' + a + '}{' + b + '}';
        }

        // second fraction
        if (d === 1) frac_B = c + '';
        else if (c < 0) {
            frac_B = '-\\frac{' + (-1)*c + '}{' + d + '}';
        }
        else {
            frac_B = '\\frac{' + c + '}{' + d + '}';
        }

        // combine properly
        frac_B = frac_B + 'i';
        if (frac_A === '0') frac_A = ''
        if ((frac_A === '') && (frac_B === '0i')) frac_B = '0'
        else if (frac_B === '0i') frac_B = ''
        else if (frac_B === '-1i') frac_B = '-i'
        else if ((frac_A !== '') && (frac_B === '1i')) frac_B = '+i'
        else if ((frac_A === '') && (frac_B === '1i')) frac_B = 'i'
        else if ((frac_A !== '') && (frac_B.charAt(0) !== '-')) frac_B = '+' + frac_B
        
        complexNum_result = frac_A + frac_B;
    }


    // hackfix to get error_locations back to main
    let error_locations = [];
    if (settings.error_locations.length > 0) {
        if (settings.error_locations.indexOf('number_of_terms') !== -1) error_locations.push('number_of_terms');
    }

    return {
        question: complexNum_prompt,
        answer: complexNum_result,
        settings: settings,
        error_locations: error_locations
    };
}

export const settings_fields = [
    'term_range',
    'general_operation_types',
    'randomize_order',
    'force_ints_in_div'
];

export function get_presets() {
    return {
        term_range_min: H.randInt(-5, -1),
        term_range_max: H.randInt(1, 5),
        general_operation_types: ['multiply','divide'],
        randomize_order: 'yes',
        force_ints_in_div: 'yes'
    };
}

export function get_rand_settings() {
    return {
        term_range_min: H.randInt(-9, -1),
        term_range_max: H.randInt(1, 9),
        general_operation_types: H.randFromList([['add'],['subtract'],['multiply'],['divide']]),
        randomize_order: H.randFromList(['yes','no']),
        force_ints_in_div: H.randFromList(['yes','no'])
    }; 
}


