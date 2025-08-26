import * as H from '../helpers/gen-helpers.js';
import * as SH from '../helpers/settings-helpers.js';

export function validateSettings(form_obj, error_locations) {
    // validate number_of_terms and keep track of error locations
    form_obj.number_of_terms = SH.val_term_number(form_obj.number_of_terms, error_locations);
    
    // validate coef_number_size 
    form_obj.coef_number_size = SH.val_term_number(form_obj.coef_number_size, error_locations, 20, 'coef_number_size');

    // validate root_number (make sure it isn't a perfect square)
    form_obj.root_number = SH.val_root_number(form_obj.root_number, error_locations);
}

export default function genSimRad(settings) {
    const numberOfTerms = settings.number_of_terms;
    const nRange = Math.floor(Math.sqrt(settings.coef_number_size)); // How big (a) and (b) can be (the numbers that reduce); the biggest coefficient that can be in front of the root is this^squared
    const c = settings.root_number; // c, which can't be a perfect square
    let stringAccum, sumAccum; // accumulators
    let rootValue = (H.randInt(1,nRange))**2 * (H.randInt(1,nRange))**2;
    let question,answer; 

    // determine which operations are possible (addition, subtraction, or both)
    let rootSwitches = [];
    if (settings.addsub_operation_type === 'add') rootSwitches = [0];
    else if (settings.addsub_operation_type === 'subtract') rootSwitches = [1];
    else if (settings.addsub_operation_type === 'both') rootSwitches = [0, 1];

    let rootSwitch = H.randFromList(rootSwitches); // assign rootSwitch based on which operations are possible

    stringAccum = ((rootSwitch === 0) ? '' : '-') + '\\sqrt{' + rootValue * c + '}'
    sumAccum = ((rootSwitch === 0) ? 1 : -1) * Math.sqrt(rootValue);
    for(let i = 1; i < numberOfTerms; i++) {
        rootValue = (H.randInt(1,nRange))**2 * (H.randInt(1,nRange))**2;
        rootSwitch = H.randFromList(rootSwitches);

        stringAccum = stringAccum + ((rootSwitch === 0) ? '+' : '-') + '\\sqrt{' + rootValue * c + '}'
        sumAccum = sumAccum + ((rootSwitch === 0) ? 1 : -1) * Math.sqrt(rootValue);
    }
    question = stringAccum;

    if(sumAccum === 1) {
        answer = '\\sqrt{' + c + '}'; 
    }
    else if (sumAccum === -1) {
        answer = '-\\sqrt{' + c + '}';
    }
    else if (sumAccum === 0) {
        answer = '0';
    }
    else {
        answer = sumAccum + '\\sqrt{' + c + '}';
    }

    return {
        question: question,
        answer: answer
    };
}

export const settings_fields = [
    'number_of_terms',
    'addsub_operation_type',
    'root_number',
    'coef_number_size'
];

export const presets = {
    default: function() {
        return {
            number_of_terms: 3,
            root_number: H.randFromList(H.nonPerfectSquares(6)),
            coef_number_size: 9,
            addsub_operation_type: 'both'
        };
    },
    random: function() {
        return {
            number_of_terms: H.randInt(2,4),
            root_number: H.randFromList(H.nonPerfectSquares(6)),
            coef_number_size: H.randInt(9,15),
            addsub_operation_type: '__random__'
        };
    }
};