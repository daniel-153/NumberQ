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


    const coefArray = H.integerArray((-1)*coef_size, coef_size); // array of possible coefficients (for everything but div)
    const nz_coefArray = H.removeFromArray(0, coefArray);

    // If operation Isn't div -> pick the coefficients for polynomial A,B and ensure the first coef isn't 0 (to keep the proper degree)
    let templateA = H.arrayOfRandsFromList(coefArray, polynomial_A_degree); 
    templateA.unshift(H.randFromList(nz_coefArray));
    let templateB = H.arrayOfRandsFromList(coefArray, polynomial_B_degree); 
    templateB.unshift(H.randFromList(nz_coefArray));

    // these are to keep track of B in division
    let B_factors_from_A = []; // the factors we took from A and put in B
    let B_nonfactor; // the one factor we chose for B that definetly isn't a factor of A


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
            let factorArrayA_copy = [...factorArrayA];

            // this loop is needed so that we remove the factors after we pick them (to make sure everything divides out)
            for (let i = 1; i <= polynomial_B_degree; i++) {
                let currentFactor = factorArrayA_copy.splice(H.randInt(0, factorArrayA_copy.length - 1), 1)
                
                // put a factor of A in B and remove it^ from the copy of A's factor array (to avoid repeats)
                factorArrayB.push(currentFactor);
            }
        }
        else if (division_result === 'numerical_remainder' || division_result === 'quotient_plus_remainder') {
            let nonFactorArray = H.integerArray((-1)*factor_size, factor_size); // create an array to have *none* of A's factors
            nonFactorArray = H.removeFromArray(factorArrayA, nonFactorArray);

            // expand the non factor array if it's empty
            if (nonFactorArray.length === 0) nonFactorArray.push((-1)*factor_size - 1, factor_size + 1);

            // start by adding one *non*-factor to B (and keep track of it in B_nonfactor)
            B_nonfactor = H.randFromList(nonFactorArray);
            factorArrayB.push(B_nonfactor);

            let factorArrayA_copy = [...factorArrayA]; // create a copy of factorArrayA
            
            // for every degree B has beyond 1, add a factor of A to B's factor array (so B has the proper degree but still only has a linear remainder)
            for (let i = 1; i <= polynomial_B_degree - 1; i++) {
                let currentFactor = factorArrayA_copy.splice(H.randInt(0, factorArrayA_copy.length - 1), 1)
                
                // put a factor of A in B and remove it from the copy of A's factor array (to avoid repeats)
                factorArrayB.push(currentFactor);

                // keep track of the factors of A that we put in B
                B_factors_from_A.push(currentFactor);
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
            // dividing A by factors we know it has -> (this must reduce to a polynomial with no remainder)
            const firstQuotient = PH.longDivision(templateA, PH.expandBinomials(B_factors_from_A)); 

            // find the final remainder and quotient
            const finalRemainder = PH.dividePolynomial(firstQuotient, B_nonfactor).remainder;

            resultPolynomial = 'R=' + finalRemainder;
        }
        else if (division_result === 'quotient_plus_remainder') {
            // dividing A by factors we know it has -> (this must reduce to a polynomial with no remainder)
            const firstQuotient = PH.longDivision(templateA, PH.expandBinomials(B_factors_from_A)); 

            // find the final remainder and quotient
            const finalQuotientAndRem = PH.dividePolynomial(firstQuotient, B_nonfactor);

            const finalQuotient = PH.polyTemplateToMath(finalQuotientAndRem.quotient);
            const finalRemainder = finalQuotientAndRem.remainder;
            const finalLinearFactor = PH.polyTemplateToMath([1, (-1)*B_nonfactor]);
            
            resultPolynomial = finalQuotient + '+' + '\\frac{' + finalRemainder + '}{' + finalLinearFactor + '}';
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

export function get_rand_settings() {
    return {
        polynomial_A_degree: H.randInt(1,3),
        polynomial_B_degree: H.randInt(1,3),
        general_operation_types: H.randFromList([['add'],['subtract'],['multiply'],['divide']]),
        coef_size: H.randInt(5,10),
        factor_size: H.randInt(2,7),
        division_result: H.randFromList(['divide_evenly','numerical_remainder','quotient_plus_remainder'])
    }; 
}