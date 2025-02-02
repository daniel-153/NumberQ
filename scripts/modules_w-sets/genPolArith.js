import * as H from '../helper-modules/gen-helpers.js';
import * as PH from '../helper-modules/polynom-helpers.js';
import * as SH from '../helper-modules/settings-helpers.js';

function processSettings(formObj) {
    let { polynomial_A_degree, polynomial_B_degree, general_operation_types, coef_size, factor_size, division_result } = formObj;
    let error_locations = []; // stores a list of input fields where errors occured (same field can appear multiple times)

    // make sure coef range is an integer between 1 and 10
    coef_size = SH.val_restricted_integer(coef_size, error_locations, 1, 20, 'coef_size');

    // make sure factor size is an integer between 1 and 10
    factor_size = SH.val_restricted_integer(factor_size, error_locations, 1, 10, 'factor_size');

    // set the operation types if none were selected
    if (general_operation_types === undefined) general_operation_types = ['add','multiply','divide'];

    
    // validation for polynomial degrees (make sure they are between 1 and 10) | (validation for division happens in the gen function)
    polynomial_A_degree = SH.val_restricted_integer(polynomial_A_degree, error_locations, 1, 10, 'polynomial_A_degree');
    polynomial_B_degree = SH.val_restricted_integer(polynomial_B_degree, error_locations, 1, 10, 'polynomial_B_degree');

    

    return {
        polynomial_A_degree: polynomial_A_degree,
        polynomial_B_degree: polynomial_B_degree,
        general_operation_types: general_operation_types,
        coef_size: coef_size,
        factor_size: factor_size,
        division_result: division_result,
        error_locations: error_locations
    };
}

// in processing, if the operation is div, you must garuantee that B-degree < A-degree (but note the case where A-deg = 1)
// I think this means that (in division), polynomial A must have degree 2 or higher

export default function genPolArith(formObj) {
    const settings = processSettings(formObj);
    let {polynomial_A_degree, polynomial_B_degree, coef_size, factor_size, division_result} = settings;
    const operation_type = H.randFromList(settings.general_operation_types);
    console.log('operation type: ',operation_type)

    const coefArray = H.integerArray((-1)*coef_size, coef_size); // array of possible coefficients (for everything but div)
    const nz_coefArray = H.removeFromArray(0, coefArray);

    // If operation Isn't div -> pick the coefficients for polynomial A,B and ensure the first coef isn't 0 (to keep the proper degree)
    let templateA = H.arrayOfRandsFromList(coefArray, polynomial_A_degree); 
    templateA.unshift(H.randFromList(nz_coefArray));
    let templateB = H.arrayOfRandsFromList(coefArray, polynomial_B_degree); 
    templateB.unshift(H.randFromList(nz_coefArray));
    console.log('templateA: ',templateA)
    console.log('templateB: ',templateB)

    // Create template if the operation Is div
    if (operation_type === 'divide') {
        // start by validating the polynomial degrees
        if (polynomial_B_degree >= polynomial_A_degree) {
            polynomial_B_degree = polynomial_A_degree - 1;

            settings.polynomial_B_degree = polynomial_A_degree - 1;
        }
        if (polynomial_A_degree === 1 && polynomial_B_degree === 0) {
            polynomial_A_degree = 2;
            polynomial_B_degree = 1;

            settings.polynomial_A_degree = 2;
            settings. polynomial_B_degree = 1;
        }


        // pick random factors for templateA
        let factorArrayA = []; // the factors of polynomial A
        for (let i = 1; i <= polynomial_A_degree; i++) {
            factorArrayA.push(H.randInt((-1) * factor_size,factor_size));
        }
        templateA = PH.expandBinomials(factorArrayA); // create the coefs of polynomial A 

        // construct polynomial B (either to definetly divide evenly or definetly not divide evenly)
        let factorArrayB = [];
        if (division_result === 'divide_evenly') {
            factorArrayB = [...H.arrayOfRandsFromList(factorArrayA, polynomial_B_degree)];
        }
        else if (division_result === 'numerical_remainder' || division_result === 'quotient_plus_remainder') {
            let nonFactorArray = H.integerArray((-1)*factor_size, factor_size); // create an array to have *none* of A's factors
            nonFactorArray = H.removeFromArray(factorArrayA, nonFactorArray);

            // expand the non factor array if it's empty
            if (nonFactorArray.length === 0) nonFactorArray.push((-1)*factor_size - 1, factor_size + 1);

            // start by adding one *non*-factor to B
            factorArrayB.push(H.randFromList(nonFactorArray));

            let factorArrayA_copy = [...factorArrayA]; // create a copy of factorArrayA
            
            // for every degree B has beyond 1, add a factor of A to B's factor array (so B has the proper degree but still only has a linear remainder)
            for (let i = 1; i <= polynomial_B_degree - 1; i++) {
                factorArrayB.push(factorArrayA_copy.splice(H.randInt(0, factorArrayA_copy.length - 1), 1));
            }

            // randomize the order of factorArrayB
            factorArrayB = [...H.randomizeList(factorArrayB)];
        }

        templateB = PH.expandBinomials(factorArrayB); // create the coefs of polynomial B 
    }

    // create the math versions of the two polynomials
    const polynomial_A = PH.polyTemplateToMath(templateA);
    const polynomial_B = PH.polyTemplateToMath(templateB); 
    
    // the latex strings that will hold the prompt and result
    let promptPolynomial;
    let resultPolynomial;

    let resultTemplate; // temporary placeholder for the result of the operations

    // apply the operations
    if (operation_type === 'multiply') {
        promptPolynomial = '(' + polynomial_A + ')(' + polynomial_B + ')';
        
        resultTemplate = PH.multiplyPolynomials(templateA, templateB);
        resultPolynomial = PH.polyTemplateToMath(resultTemplate);
    }
    else if (operation_type === 'add') {
        promptPolynomial = '(' + polynomial_A + ')+(' + polynomial_B + ')'; 

        resultTemplate = PH.addPolynomials(templateA, templateB);
        resultPolynomial = PH.polyTemplateToMath(resultTemplate);
    }
    else if (operation_type === 'subtract') {
        promptPolynomial = '(' + polynomial_A + ')-(' + polynomial_B + ')'; 

        const negativePolyB = PH.multiplyArray(templateB, -1); // multiply B by (-1) -> for subtraction
        resultTemplate = PH.addPolynomials(templateA, negativePolyB);
        resultPolynomial = PH.polyTemplateToMath(resultTemplate);
    }
    else if (operation_type === 'divide') {
        promptPolynomial = '\\frac{' + polynomial_A + '}{' + polynomial_B + '}';
        if (division_result === 'divide_evenly') {
            resultTemplate = PH.longDivision(templateA, templateB);
            resultPolynomial = PH.polyTemplateToMath(resultTemplate);
        }
        else if (division_result === 'numerical_remainder') {
            const remainder = PH.numericalRemainder(templateA, templateB).numericalRemainder;

            resultPolynomial = 'R=' + remainder;
        }
        else if (division_result === 'quotient_plus_remainder') {
            const divisionResult = PH.numericalRemainder(templateA, templateB);
            
            resultPolynomial = PH.polyTemplateToMath(divisionResult.quotient) + '+' + '\\frac{' + divisionResult.numericalRemainder + '}{' + PH.polyTemplateToMath(divisionResult.finalDivisor) + '}';
        }
    }

    // hackfix to get error_locations back to main
    let error_locations = [];
    if (settings.error_locations.length > 0) {
        if (settings.error_locations.indexOf('polynomial_A_degree') !== -1) error_locations.push('polynomial_A_degree');
        if (settings.error_locations.indexOf('polynomial_B_degree') !== -1) error_locations.push('polynomial_B_degree');
        if (settings.error_locations.indexOf('coef_size') !== -1) error_locations.push('coef_size');
        if (settings.error_locations.indexOf('factor_size') !== -1) error_locations.push('factor_size');
    }

    return {
        question: promptPolynomial,
        answer: resultPolynomial,
        settings: settings,
        error_locations: error_locations
    };
}

export const settings_fields = [
    'polynomial_A_degree',
    'polynomial_B_degree',
    'general_operation_types',
    'coef_size',
    'factor_size',
    'division_result'
];

export function get_presets() {
    return {
        polynomial_A_degree: H.randInt(1,3),
        polynomial_B_degree: H.randInt(1,3),
        general_operation_types: ['add','multiply','divide'],
        coef_size: 9,
        factor_size: 5,
        division_result: 'divide_evenly'
    };
}



'add','multiply',














function _genPolArith() {
    const maxFRange = 6; // Controls how big the factors can get. If you set k here, 1st degrees will have numbers up to k, 2nd degrees will have numbers up to k-1, 3rd degrees will have numbers up to k-2, and so on
    // If you want to increase the degree of the polynomial beyond 6, you also need to increase this range, or there will be bugs
    const Degree = H.randInt(2,5); // What the degree of the polynomial will be
    const FRange = maxFRange - (Degree - 1); // Based on the degree, this is what the max value (magnitude) of the factors can be

    let factorArrayA = [];
    let coefArray = [];
    let quotArray = [];
    let divisor;
    let template; 

    for (let i = 1; i <= Degree; i++) {
        factorArrayA.push(H.randInt((-1) * FRange,FRange));
    }
    coefArray = PH.expandBinomials(factorArrayA);

    const switcher = H.randInt(0,5);

    if (switcher !== 5) {
        divisor = H.randFromList(factorArrayA);
        quotArray = PH.dividePolynomial(coefArray,divisor).quotient;

        template = {
            coefficients: coefArray,
            divisor: divisor,
            quotient: quotArray
        };
    } // The quotient divides evenly (0-8)
    else {
        let NonfactorArrayA = H.removeFromArray(0,H.integerArray((-1) * FRange,FRange)); // Remove 0 bc it's too obvious
        NonfactorArrayA = H.removeFromArray(factorArrayA,NonfactorArrayA); // remove all the factors from the non-factor array

        if (NonfactorArrayA.length !== 0) {
            divisor = H.randFromList(NonfactorArrayA);
        }
        else {
            divisor = H.randFromList([(-1)*(FRange + 1),(FRange + 1)]); // guarunteed to be a non-factor 
        }

        template = {
            coefficients: coefArray,
            divisor: divisor,
            quotient: 'R=' + PH.dividePolynomial(coefArray,divisor).remainder
        };
    } // The quotient DOES NOT divide evenly (9)

    // conversion to math

    coefArray = template.coefficients; // Raw numerical values of the coefficients
    divisor = template.divisor;
    const quotientArr = template.quotient;
    
    const polynom = PH.polyTemplateToMath(coefArray);
    const binom = PH.polyTemplateToMath([1,(-1)*divisor]);
    const quotient = Array.isArray(quotientArr) ? PH.polyTemplateToMath(quotientArr) : quotientArr;

    return {
        question: '\\frac{' + polynom + '}{' + binom + '}',
        answer: quotient
    };
}