import * as H from '../helpers/gen-helpers.js';
import * as PH from"../helpers/polynom-helpers.js";
import * as SH from '../helpers/settings-helpers.js';

export function validateSettings(form_obj, error_locations) {
    // make sure coef range is an integer between 1 and 10
    form_obj.coef_size = SH.val_restricted_integer(form_obj.coef_size, error_locations, 1, 20, 'coef_size');

    // make sure factor size is an integer between 1 and 10
    form_obj.factor_size = SH.val_restricted_integer(form_obj.factor_size, error_locations, 1, 10, 'factor_size');

    // set the operation types if none were selected
    if (form_obj.general_operation_types === undefined) form_obj.general_operation_types = ['add','multiply','divide'];

    // validation for polynomial degrees (make sure they are between 1 and 10) | (validation for division happens in the gen function)
    form_obj.polynomial_A_degree = SH.val_restricted_integer(form_obj.polynomial_A_degree, error_locations, 1, 10, 'polynomial_A_degree');
    form_obj.polynomial_B_degree = SH.val_restricted_integer(form_obj.polynomial_B_degree, error_locations, 1, 10, 'polynomial_B_degree');
}

export default function genPolArith(settings) {
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

        // generator is not built to handle higher order remainders (only the case where P(x)/(x-a) has a remainder not P(x)/Q(x) where deg(Q(x)) >= 2)
        if (polynomial_B_degree >= 2) {
            settings.division_result = division_result = 'divide_evenly';
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

    return {
        question: promptPolynomial,
        answer: resultPolynomial
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

export const prelocked_settings = [
    'division_result'
];

export const presets = {
    default: function() {
        return {
            polynomial_A_degree: H.randInt(1,3),
            polynomial_B_degree: H.randInt(1,3),
            general_operation_types: ['add','multiply','divide'],
            coef_size: 9,
            factor_size: 5,
            division_result: 'divide_evenly'
        };
    },
    random: function() {
        return {
            polynomial_A_degree: H.randInt(1,3),
            polynomial_B_degree: H.randInt(1,3),
            general_operation_types: '__random__',
            coef_size: H.randInt(5,10),
            factor_size: H.randInt(2,7),
            division_result: '__random__'
        };
    },
    topic_presets: [
        {
            title: 'Add And Subtract (linear)',
            example_problem: '(5x+2)+(x+9)',
            description: 'Add and subtract two linear polynomials.',
            get_settings: function() {    
                return {
                    polynomial_A_degree: 1,
                    polynomial_B_degree: 1,
                    general_operation_types: ['add','subtract'],
                    coef_size: 9
                };
            }
        },
        {
            title: 'Multiply (linear)',
            example_problem: '(x+3)(7x+9)',
            description: 'Multiply two linear polynomials.',
            get_settings: function() {    
                return {
                    polynomial_A_degree: 1,
                    polynomial_B_degree: 1,
                    general_operation_types: ['multiply'],
                    coef_size: 7
                };
            }
        },
        {
            title: 'Add And Subtract (linear and quadratic)',
            example_problem: '(x-3)-(x^{2}+3x+9)',
            description: 'Add and subtract with a linear and a quadratic polynomial.',
            get_settings: function() {    
                const degree_AB = [1, 1];
                degree_AB[H.randInt(0, 1)]++;
                
                return {
                    polynomial_A_degree: degree_AB[0],
                    polynomial_B_degree: degree_AB[1],
                    general_operation_types: ['add','subtract'],
                    coef_size: 9
                };
            }
        },
        {
            title: 'Multiply (linear and quadratic)',
            example_problem: '(2x+6)(x^{2}+5x+4)',
            description: 'Multiply with a linear and a quadratic polynomial.',
            get_settings: function() {    
                const degree_AB = [1, 1];
                degree_AB[H.randInt(0, 1)]++;
                
                return {
                    polynomial_A_degree: degree_AB[0],
                    polynomial_B_degree: degree_AB[1],
                    general_operation_types: ['multiply'],
                    coef_size: 7
                };
            }
        },
        {
            title: 'Add And Subtract (quadratic)',
            example_problem: '(ax^{2}+...)\\pm(bx^{2}+...)',
            description: 'Add and subtract two quadratic polynomials.',
            get_settings: function() {    
                return {
                    polynomial_A_degree: 2,
                    polynomial_B_degree: 2,
                    general_operation_types: ['add','subtract'],
                    coef_size: 9
                };
            }
        },
        {
            title: 'Multiply (quadratic)',
            example_problem: '(ax^{2}+...)(bx^{2}+...)',
            description: 'Multiply two quadratic polynomials.',
            get_settings: function() {    
                return {
                    polynomial_A_degree: 2,
                    polynomial_B_degree: 2,
                    general_operation_types: ['multiply'],
                    coef_size: 5
                };
            }
        },
        {
            title: 'Multiply (linear and cubic)',
            example_problem: '(ax^{3}+...)(bx+c)',
            description: 'Multiply a linear polynomial and a cubic polynomial.',
            get_settings: function() {    
                const degree_AB = [1, 1];
                degree_AB[H.randInt(0, 1)] = 3;
                
                return {
                    polynomial_A_degree: degree_AB[0],
                    polynomial_B_degree: degree_AB[1],
                    general_operation_types: ['multiply'],
                    coef_size: 5
                };
            }
        },
        {
            title: 'Add And Subtract (mixed degrees)',
            example_problem: '(ax^{p}+...)\\pm(bx^{q}+...)',
            description: 'Add and subtract two polynomials of random degrees.',
            get_settings: function() {
                const degree_AB = [H.randInt(1, 3), H.randInt(1, 3)];

                while (degree_AB[0] + degree_AB[1] > 4) {
                    let decrease_idx = H.randInt(0, 1);
                    degree_AB[decrease_idx]--;
                }
                
                return {
                    polynomial_A_degree: degree_AB[0],
                    polynomial_B_degree: degree_AB[1],
                    general_operation_types: ['add','subtract'],
                    coef_size: 9
                };
            }
        },
        {
            title: 'Multiply (mixed degrees)',
            example_problem: '(ax^{p}+...)(bx^{q}+...)',
            description: 'Multiply two polynomials of random degrees.',
            get_settings: function() {
                const degree_AB = [H.randInt(1, 3), H.randInt(1, 3)];

                while (degree_AB[0] + degree_AB[1] > 4) {
                    let decrease_idx = H.randInt(0, 1);
                    degree_AB[decrease_idx]--;
                }
                
                return {
                    polynomial_A_degree: degree_AB[0],
                    polynomial_B_degree: degree_AB[1],
                    general_operation_types: ['multiply'],
                    coef_size: 5
                };
            }
        },
        {
            title: 'Divide (quadratic by linear, no remainder)',
            example_problem: '\\frac{x^{2}+5x-14}{x+7}',
            description: 'Divide a quadratic by one of its linear factors.',
            get_settings: function() {                
                return {
                    polynomial_A_degree: 2,
                    polynomial_B_degree: 1,
                    general_operation_types: ['divide'],
                    factor_size: 9,
                    division_result: 'divide_evenly'
                };
            }
        },
        {
            title: 'Divide (by linear, no remainder)',
            example_problem: '\\frac{P(x)}{x-a}=Q(x)',
            description: 'Divide a polynomial by a linear factor (no remainder).',
            get_settings: function() {                
                return {
                    polynomial_A_degree: H.randInt(2, 4),
                    polynomial_B_degree: 1,
                    general_operation_types: ['divide'],
                    factor_size: 5,
                    division_result: 'divide_evenly'
                };
            }
        },
        {
            title: 'Divide (by linear, numerical remainder)',
            example_problem: '\\frac{P(x)}{x-a} \\rightarrow R=P(a)',
            description: 'Divide a polynomial by a linear factor (remainder represented numerically).',
            get_settings: function() {                
                return {
                    polynomial_A_degree: H.randInt(2, 4),
                    polynomial_B_degree: 1,
                    general_operation_types: ['divide'],
                    factor_size: 5,
                    division_result: 'numerical_remainder'
                };
            }
        },
        {
            title: 'Divide (by linear, algebraic remainder)',
            example_problem: '\\frac{P(x)}{x-a}=Q(x)+\\frac{R}{x-a}',
            description: 'Divide a polynomial by a linear factor (remainder represented algebraically).',
            get_settings: function() {                
                return {
                    polynomial_A_degree: H.randInt(2, 4),
                    polynomial_B_degree: 1,
                    general_operation_types: ['divide'],
                    factor_size: 5,
                    division_result: 'quotient_plus_remainder'
                };
            }
        },
        {
            title: 'Divide (by linear, remainders and no remainders)',
            example_problem: '\\frac{P(x)}{x-a}=Q(x)+(\\frac{R}{x-a}?)',
            description: 'Divide a polynomial by a linear factor (result may or may not have a remainder).',
            get_settings: function() {                
                return {
                    polynomial_A_degree: H.randInt(2, 4),
                    polynomial_B_degree: 1,
                    general_operation_types: ['divide'],
                    factor_size: 5,
                    division_result: H.randFromList(['divide_evenly', 'quotient_plus_remainder'])
                };
            }
        },
        {
            title: 'Divide (higher order divisors, no remainder)',
            example_problem: '\\frac{P(x)}{(x^2+...)}=Q(x)',
            description: 'Divide by quadratic and cubic polynomials (no remainder).',
            get_settings: function() {                
                const num_degree = H.randInt(3, 4);
                const den_degree = H.randInt(2, num_degree - 1);
                
                return {
                    polynomial_A_degree: num_degree,
                    polynomial_B_degree: den_degree,
                    general_operation_types: ['divide'],
                    factor_size: 5,
                    division_result: 'divide_evenly'
                };
            }
        }
    ]
};

export const size_adjustments = {
    width: 1.15,
};