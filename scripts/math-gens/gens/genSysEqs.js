import * as H from '../helpers/gen-helpers.js';
import * as PH from"../helpers/polynom-helpers.js";
import * as SH from '../helpers/settings-helpers.js';

export function validateSettings(form_obj, error_locations) {
    // make sure coefficient size is an integer from -20 to 20
    form_obj.sys_eqs_coef_size = SH.val_restricted_integer(form_obj.sys_eqs_coef_size, error_locations, 1, 20, 'sys_eqs_coef_size');

    if (form_obj.randomize_solutions === 'is_checked') { // randomize the sol if specified
        form_obj.sys_eqs_x_solution = H.randInt(-7, 7);
        form_obj.sys_eqs_y_solution = H.randInt(-7, 7);
    }

    // validate the (x,y) solution
    form_obj.sys_eqs_x_solution = SH.val_restricted_integer(form_obj.sys_eqs_x_solution, error_locations, -20, 20, 'sys_eqs_x_solution');
    form_obj.sys_eqs_y_solution = SH.val_restricted_integer(form_obj.sys_eqs_y_solution, error_locations, -20, 20, 'sys_eqs_y_solution');

    // validate term number (make sure its 2_2 if the form is slope-int)
    if (form_obj.linear_equation_form === 'slope_intercept') form_obj.sys_eqs_term_number = '2_x_2_y';
}

export default function genSysEqs(settings) {
    let { sys_eqs_coef_size, linear_equation_form, sys_eqs_term_number} = settings;

    // unpack these sperately for shorter names
    const x_sol = settings.sys_eqs_x_solution;
    const y_sol = settings.sys_eqs_y_solution;

    // determine how many Xs and Ys there should be (first entry is num of Xs, second is num of Ys)
    let term_numbers = [Number(sys_eqs_term_number.charAt(0)), Number(sys_eqs_term_number.charAt(4))];

    // non-zero coef array (but some coefs might be re-assigned to 0 later)
    const nz_coef_array = H.removeFromArray(0, H.integerArray((-1)*sys_eqs_coef_size, sys_eqs_coef_size));

    // these are the numbers outside of the factors in Ym1(y-y0)=Xm1(x-x0), Ym2(y-y0)=Xm2(x-x0)
    let y_multiplier_1 = H.randFromList(nz_coef_array); 
    let x_multiplier_2 = H.randFromList(nz_coef_array);
    let x_multiplier_1, y_multiplier_2;

    // zero out multipliers if needed (the case isn't 2_2)
    if (term_numbers[0] === 1) x_multiplier_2 = 0; // only one x-term
    if (term_numbers[1] === 1) y_multiplier_1 = 0; // only one y-term

    // avoid the IMS case by making sure one EQ isn't a multiple of the other one
    let switcher = H.randInt(0, 1);
    if (switcher === 0) { // create Xm1 first
        x_multiplier_1 = H.randFromList(nz_coef_array);
        y_multiplier_2 = H.randFromList(H.removeFromArray((y_multiplier_1*x_multiplier_2)/x_multiplier_1, nz_coef_array));
    }
    else if (switcher === 1) { // create Ym2 first
        y_multiplier_2 = H.randFromList(nz_coef_array);
        x_multiplier_1 = H.randFromList(H.removeFromArray((y_multiplier_1*x_multiplier_2)/y_multiplier_2, nz_coef_array));
    } 


    // Create the coefficients
    let eq1_side_L = PH.multiplyArray([1, (-1)*y_sol], y_multiplier_1); // Ym1(y - y0)
    let eq1_side_R = PH.multiplyArray([1, (-1)*x_sol], x_multiplier_1); // Xm1(x - x0)
    let eq2_side_L = PH.multiplyArray([1, (-1)*y_sol], y_multiplier_2); // Ym2(y - y0)
    let eq2_side_R = PH.multiplyArray([1, (-1)*x_sol], x_multiplier_2); // Xm2(x - x0)
    // now what you have is Ym1*y - Ym1*y0 = Xm1*x - Xm1*x0 | Ym2*y - Ym2*y0 = Xm2*x - Xm2*x0


    // create the different forms
    let final_eq_1, final_eq_2;
    if (linear_equation_form === 'standard' || linear_equation_form === 'equal_to_zero') { // combine these two cases since they're so similar
        // find the x and y coefs
        let eq1_y_coef = eq1_side_L[0];
        let eq1_x_coef = (-1) * eq1_side_R[0];
        let eq2_y_coef = eq2_side_L[0];
        let eq2_x_coef = (-1) * eq2_side_R[0];


        // conversion to math (NOTE: we are dealing in terms, not coefficients -> A1+B1=C1 | Ax+By=C)
        let A1,B1,C1,A2,B2,C2;
        // first x term
        if (eq1_x_coef === 1) A1 = 'x';
        else if (eq1_x_coef === -1) A1 = '-x';
        else if (eq1_x_coef === 0) A1 = '';
        else A1 = eq1_x_coef + 'x';

        // second x term
        if (eq2_x_coef === 1) A2 = 'x';
        else if (eq2_x_coef === -1) A2 = '-x';
        else if (eq2_x_coef === 0) A2 = '';
        else A2 = eq2_x_coef + 'x';

        // first y term
        if (eq1_y_coef === 1 && A1 === '') B1 = 'y';
        else if (eq1_y_coef === 1) B1 = '+y';
        else if (eq1_y_coef === -1) B1 = '-y';
        else if (eq1_y_coef === 0) B1 = '';
        else if (eq1_y_coef > 0 && A1 === '') B1 = eq1_y_coef + 'y';
        else if (eq1_y_coef > 0) B1 = '+' + eq1_y_coef + 'y';
        else if (eq1_y_coef < 0) B1 = eq1_y_coef + 'y';

        // second y term
        if (eq2_y_coef === 1 && A2 === '') B2 = 'y';
        else if (eq2_y_coef === 1) B2 = '+y';
        else if (eq2_y_coef === -1) B2 = '-y';
        else if (eq2_y_coef === 0) B2 = '';
        else if (eq2_y_coef > 0 && A2 === '') B2 = eq2_y_coef + 'y';
        else if (eq2_y_coef > 0) B2 = '+' + eq2_y_coef + 'y'; 
        else if (eq2_y_coef < 0) B2 = eq2_y_coef + 'y';

        // NOTE: in the case, there is guaranteed to be at least one variable term (X or Y) on the left side, so you never need to worry about the left side zeroing out
        if (linear_equation_form === 'standard') {
            // find the constant term (C) in Ax+By=C (conversion to math is 'built-in' here)
            C1 = (eq1_side_R[1] - eq1_side_L[1]) + '';
            C2 = (eq2_side_R[1] - eq2_side_L[1]) + '';

            final_eq_1 = A1 + B1 + '=' + C1;
            final_eq_2 = A2 + B2 + '=' + C2;
        }
        else if (linear_equation_form === 'equal_to_zero') {
            // find the constant term (C) in Ax+By-C=0 
            C1 = (-1) * (eq1_side_R[1] - eq1_side_L[1]);
            C2 = (-1) * (eq2_side_R[1] - eq2_side_L[1]);  

            // conversion to math
            if (C1 > 0) C1 = '+' + C1;
            else if (C1 === 0) C1 = '';

            if (C2 > 0) C2 = '+' + C2;
            else if (C2 === 0) C2 = '';

            final_eq_1 = A1 + B1 + C1 + '=0';
            final_eq_2 = A2 + B2 + C2 + '=0';
        }
    }
    else if (linear_equation_form === 'slope_intercept') {
        // based on previous conditions, we don't need to worry about dividing by 0 here (ycoef won't be 0 in either EQ)
        let m_frac_1 = PH.simplifyFraction(eq1_side_R[0], eq1_side_L[0]); // (m) in y=mx+b
        let b_frac_1 = PH.simplifyFraction((eq1_side_R[1] - eq1_side_L[1]), eq1_side_L[0]); // (b) in y=mx+b
        let m_frac_2 = PH.simplifyFraction(eq2_side_R[0], eq2_side_L[0]); // (m) in y=mx+b
        let b_frac_2 = PH.simplifyFraction((eq2_side_R[1] - eq2_side_L[1]), eq2_side_L[0]); // (b) in y=mx+b

        // conversion to math | based on previous conditions we know that (m) (the xcoef) can't be 0
        let M1, B1; // EQ1 | keep in mind these are terms, not coefficients
        if (m_frac_1.denom !== 1) { // (m) is a fraction
            if (m_frac_1.numer > 0) M1 = '\\frac{' + m_frac_1.numer + '}{' + m_frac_1.denom + '}x';
            else if (m_frac_1.numer < 0) M1 = '-\\frac{' + (-1)*m_frac_1.numer + '}{' + m_frac_1.denom + '}x';
        }
        else if (m_frac_1.denom === 1) { // (m) is an integer
            if (m_frac_1.numer === 1) M1 = 'x';
            else if (m_frac_1.numer === -1) M1 = '-x';
            else M1 = m_frac_1.numer + 'x';
        }

        if (b_frac_1.denom !== 1) {
            if (b_frac_1.numer > 0) B1 = '+\\frac{' + b_frac_1.numer + '}{' + b_frac_1.denom + '}';
            else if (b_frac_1.numer < 0) B1 = '-\\frac{' + (-1)*b_frac_1.numer + '}{' + b_frac_1.denom + '}';
        }
        else if (b_frac_1.denom === 1) {
            if (b_frac_1.numer > 0) B1 = '+' + b_frac_1.numer;
            else if (b_frac_1.numer < 0) B1 = b_frac_1.numer;
            else if (b_frac_1.numer === 0) B1 = '';
        }


        let M2, B2; // EQ2 | keep in mind these are terms, not coefficients
        if (m_frac_2.denom !== 1) { // (m) is a fraction
            if (m_frac_2.numer > 0) M2 = '\\frac{' + m_frac_2.numer + '}{' + m_frac_2.denom + '}x';
            else if (m_frac_2.numer < 0) M2 = '-\\frac{' + (-1)*m_frac_2.numer + '}{' + m_frac_2.denom + '}x';
        }
        else if (m_frac_2.denom === 1) { // (m) is an integer
            if (m_frac_2.numer === 1) M2 = 'x';
            else if (m_frac_2.numer === -1) M2 = '-x';
            else M2 = m_frac_2.numer + 'x';
        }

        if (b_frac_2.denom !== 1) {
            if (b_frac_2.numer > 0) B2 = '+\\frac{' + b_frac_2.numer + '}{' + b_frac_2.denom + '}';
            else if (b_frac_2.numer < 0) B2 = '-\\frac{' + (-1)*b_frac_2.numer + '}{' + b_frac_2.denom + '}';
        }
        else if (b_frac_2.denom === 1) {
            if (b_frac_2.numer > 0) B2 = '+' + b_frac_2.numer;
            else if (b_frac_2.numer < 0) B2 = b_frac_2.numer;
            else if (b_frac_2.numer === 0) B2 = '';
        }

        final_eq_1 = 'y=' + M1 + B1;
        final_eq_2 = 'y=' + M2 + B2;
    }
    else if (linear_equation_form === 'randomized') {
        // first determine what the coefficents and sides of all the terms will be 
        // arrays to keep track of what ends up and what side (keep in mind these are NOT in math -> 'X', 'Y', and 'C' are markers/flags)
        let eq1_SL = [], eq1_SR = [], eq2_SL = [], eq2_SR = [];

        // EQ1 | create the coefficents based on the side
        let eq1_x_coef;
        let side_switcher = H.randInt(0, 1); // 0->left | 1->right
        if (side_switcher === 0) {
            eq1_x_coef = (-1)*eq1_side_R[0];
            if (eq1_x_coef !== 0) eq1_SL.push('X' + eq1_x_coef);
        }
        else if (side_switcher === 1) {
            eq1_x_coef = eq1_side_R[0];
            if (eq1_x_coef !== 0) eq1_SR.push('X' + eq1_x_coef);
        }

        let eq1_y_coef;
        side_switcher = H.randInt(0, 1);
        if (side_switcher === 0) {
            eq1_y_coef = eq1_side_L[0];
            if (eq1_y_coef !== 0) eq1_SL.push('Y' + eq1_y_coef);
        }
        else if (side_switcher === 1) {
            eq1_y_coef = (-1)*eq1_side_L[0];
            if (eq1_y_coef !== 0) eq1_SR.push('Y' + eq1_y_coef);
        }

        let eq1_const;
        side_switcher = H.randInt(0, 1);
        if (side_switcher === 0) {
            eq1_const = eq1_side_L[1] - eq1_side_R[1];
            if (eq1_const !== 0) eq1_SL.push('C' + eq1_const);
        }
        else if (side_switcher === 1) {
            eq1_const = eq1_side_R[1] - eq1_side_L[1];
            if (eq1_const !== 0) eq1_SR.push('C' + eq1_const);
        }

        // EQ2 | create the coefficents based on the side
        let eq2_x_coef;
        side_switcher = H.randInt(0, 1); // 0->left | 1->right
        if (side_switcher === 0) {
            eq2_x_coef = (-1)*eq2_side_R[0];
            if (eq2_x_coef !== 0) eq2_SL.push('X' + eq2_x_coef);
        }
        else if (side_switcher === 1) {
            eq2_x_coef = eq2_side_R[0];
            if (eq2_x_coef !== 0) eq2_SR.push('X' + eq2_x_coef);
        }

        let eq2_y_coef;
        side_switcher = H.randInt(0, 1);
        if (side_switcher === 0) {
            eq2_y_coef = eq2_side_L[0];
            if (eq2_y_coef !== 0) eq2_SL.push('Y' + eq2_y_coef);
        }
        else if (side_switcher === 1) {
            eq2_y_coef = (-1)*eq2_side_L[0];
            if (eq2_y_coef !== 0) eq2_SR.push('Y' + eq2_y_coef);
        }

        let eq2_const;
        side_switcher = H.randInt(0, 1);
        if (side_switcher === 0) {
            eq2_const = eq2_side_L[1] - eq2_side_R[1];
            if (eq2_const !== 0) eq2_SL.push('C' + eq2_const);
        }
        else if (side_switcher === 1) {
            eq2_const = eq2_side_R[1] - eq2_side_L[1];
            if (eq2_const !== 0) eq2_SR.push('C' + eq2_const);
        }

        // randomize the order of the coefficients on each side of each equation
        eq1_SL = H.randomizeList(eq1_SL);
        eq1_SR = H.randomizeList(eq1_SR);
        eq2_SL = H.randomizeList(eq2_SL);
        eq2_SR = H.randomizeList(eq2_SR);

        // conversion to math
        let eq1_SL_string = '', eq1_SR_string = '', eq2_SL_string = '', eq2_SR_string = ''; 
        let equation_side_list = [eq1_SL, eq1_SR, eq2_SL, eq2_SR]; // organize all the sides into one array for the following loop
        let equation_string_list = [eq1_SL_string, eq1_SR_string, eq2_SL_string, eq2_SR_string]; // organize all the string into one array
        let arr_entry, term_type, coef_value;
        let T; // the cleaned/processed term that will be put in the equation string

        // convert the numbers on each side of each equation to math
        let i = 0;
        equation_side_list.forEach(equation_side => {
            if (equation_side.length >= 1) {
                // handle the first element
                arr_entry = equation_side[0];
                term_type = arr_entry.charAt(0);
                coef_value = Number(arr_entry.slice(1));
                if (term_type === 'X') {
                    if (coef_value === 1) T = 'x';
                    else if (coef_value === -1) T = '-x';
                    else T = coef_value + 'x';
                }   
                else if (term_type === 'Y') {
                    if (coef_value === 1) T = 'y';
                    else if (coef_value === -1) T = '-y';
                    else T = coef_value + 'y';
                } 
                else if (term_type === 'C') {
                    T = coef_value;
                }
                
                equation_string_list[i] += T;
                
                // handle any elements beyond the first one (if there are any)
                for (let j = 1; j < equation_side.length; j++) {
                    arr_entry = equation_side[j];
                    term_type = arr_entry.charAt(0);
                    coef_value = Number(arr_entry.slice(1));
                    if (term_type === 'X') {
                        if (coef_value === 1) T = '+x';
                        else if (coef_value === -1) T = '-x';
                        else if (coef_value > 0) T = '+' + coef_value + 'x';
                        else if (coef_value < 0) T = coef_value + 'x';
                    }   
                    else if (term_type === 'Y') {
                        if (coef_value === 1) T = '+y';
                        else if (coef_value === -1) T = '-y';
                        else if (coef_value > 0) T = '+' + coef_value + 'y';
                        else if (coef_value < 0) T = coef_value + 'y';
                    } 
                    else if (term_type === 'C') {
                        if (coef_value > 0) T = '+' + coef_value;
                        else if (coef_value < 0) T = coef_value;
                    }
                    equation_string_list[i] += T;
                }
            }
            else { // if there isn't a single term on the current side, make sure the side is set = to 0 (instead of being blank)
                equation_string_list[i] = '0';
            }
            i++;
        });

        final_eq_1 = equation_string_list[0] + '=' + equation_string_list[1];
        final_eq_2 = equation_string_list[2] + '=' + equation_string_list[3];
    } // end of case handling and assignment


    switcher = H.randInt(0, 1); // randomly swap the equations
    if (switcher === 1) {
        let temp = final_eq_1;
        final_eq_1 = final_eq_2;
        final_eq_2 = temp;
    }

    let final_prompt, prompt_in_TeX, final_answer;
    if (linear_equation_form !== 'randomized') { // align the equations at the '=' for every form except for 'randomized'
        final_prompt = `
            \\begin{aligned}
                ${final_eq_1.replace("=", "&=")} \\\\
                ${final_eq_2.replace("=", "&=")}
            \\end{aligned}
        `;
    }
    else { // don't align the equations if the form is 'randomized'
        final_prompt = '\\begin{array}{c} ' + final_eq_1 + ' \\\\ ' + final_eq_2 + ' \\end{array}'
    }
    prompt_in_TeX = final_eq_1 + ' \\\\\\\\ ' + final_eq_2;
    final_answer = '(' + x_sol + ', ' + y_sol + ')';

    return {
        question: final_prompt,
        answer: final_answer,
        TeXquestion: prompt_in_TeX
    };
}

export const settings_fields = [
    'sys_eqs_coef_size',
    'linear_equation_form',
    'solution_point',
    'sys_eqs_term_number' 
];

export const presets = {
    default: function() {
        return {
            sys_eqs_coef_size: 8,
            linear_equation_form: 'randomized',
            sys_eqs_x_solution: 1,
            sys_eqs_y_solution: 1,
            randomize_solutions: 'is_checked',
            sys_eqs_term_number: '2_x_2_y'
        };
    },
    random: function() {
        let sys_eqs_term_number;
        const term_number_picker = H.randInt(1, 100);
        if (term_number_picker <= 85) sys_eqs_term_number = '2_x_2_y';
        else sys_eqs_term_number = H.randFromList(['1_x_2_y','2_x_1_y','1_x_1_y']);
        
        return {
            sys_eqs_coef_size: H.randInt(1,10),
            linear_equation_form: '__random__',
            sys_eqs_x_solution: 1,
            sys_eqs_y_solution: 1,
            randomize_solutions: 'is_checked',
            sys_eqs_term_number: sys_eqs_term_number
        }; 
    },
    topic_presets: [
        {
            title: 'Standard Form (small coefficients)',
            example_problem: `
                \\begin{aligned}
                -3x+2y&=-5 \\\\
                2x+3y&=12
                \\end{aligned}
            `,
            description: 'Equations in standard form with smaller coefficients.',
            get_settings: function() {
                return {
                    sys_eqs_coef_size: 3,
                    linear_equation_form: 'standard',
                    sys_eqs_x_solution: H.randInt(-7, 7),
                    sys_eqs_y_solution: H.randInt(-7, 7),
                    randomize_solutions: undefined,
                    sys_eqs_term_number: '2_x_2_y'
                };
            }
        },
        {
            title: 'Standard Form (general)',
            example_problem: `
                \\begin{aligned}
                -6x+3y&=18 \\\\
                -x+7y&=29
                \\end{aligned}
            `,
            description: 'Equations in standard form.',
            get_settings: function() {
                return {
                    sys_eqs_coef_size: 7,
                    linear_equation_form: 'standard',
                    sys_eqs_x_solution: H.randInt(-5, 5),
                    sys_eqs_y_solution: H.randInt(-5, 5),
                    randomize_solutions: undefined,
                    sys_eqs_term_number: '2_x_2_y'
                };
            }
        },
        {
            title: 'Equal To Zero Form (small coefficients)',
            example_problem: `
                \\begin{aligned}
                2x-3y+13&=0 \\\\
                -3x-3y+18&=0
                \\end{aligned}
            `,
            description: 'Equations with all the terms on one side and smaller coefficients.',
            get_settings: function() {
                return {
                    sys_eqs_coef_size: 3,
                    linear_equation_form: 'equal_to_zero',
                    sys_eqs_x_solution: H.randInt(-7, 7),
                    sys_eqs_y_solution: H.randInt(-7, 7),
                    randomize_solutions: undefined,
                    sys_eqs_term_number: '2_x_2_y'
                };
            }
        },
        {
            title: 'Equal To Zero Form (general)',
            example_problem: `
                \\begin{aligned}
                3x-6y+39&=0 \\\\
                7x-5y+55&=0
                \\end{aligned}
            `,
            description: 'Equations with all the terms on one side.',
            get_settings: function() {
                return {
                    sys_eqs_coef_size: 7,
                    linear_equation_form: 'equal_to_zero',
                    sys_eqs_x_solution: H.randInt(-5, 5),
                    sys_eqs_y_solution: H.randInt(-5, 5),
                    randomize_solutions: undefined,
                    sys_eqs_term_number: '2_x_2_y'
                };
            }
        },
        {
            title: 'Slope Intercept Form (small coefficients)',
            example_problem: `
                \\begin{aligned}
                y&=x+10 \\\\
                y&=\\frac{2}{3}x+9
                \\end{aligned}
            `,
            description: 'Equations in slope intercept form with smaller coefficients.',
            get_settings: function() {
                return {
                    sys_eqs_coef_size: 3,
                    linear_equation_form: 'slope_intercept',
                    sys_eqs_x_solution: H.randInt(-7, 7),
                    sys_eqs_y_solution: H.randInt(-7, 7),
                    randomize_solutions: undefined,
                    sys_eqs_term_number: '2_x_2_y'
                };
            }
        },
        {
            title: 'Slope Intercept Form (general)',
            example_problem: `
                \\begin{aligned}
                y&=5x+15 \\\\
                y&=-6x-29
                \\end{aligned}
            `,
            description: 'Equations in slope intercept form.',
            get_settings: function() {
                return {
                    sys_eqs_coef_size: 7,
                    linear_equation_form: 'slope_intercept',
                    sys_eqs_x_solution: H.randInt(-5, 5),
                    sys_eqs_y_solution: H.randInt(-5, 5),
                    randomize_solutions: undefined,
                    sys_eqs_term_number: '2_x_2_y'
                };
            }
        },
        {
            title: 'Shuffled Terms (small coefficients)',
            example_problem: `
                \\begin{array}{c} 
                3x=-12+y \\\\ 
                -4=2y+x 
                \\end{array}
            `,
            description: 'Equations with terms in a randomized order and smaller coeffficients.',
            get_settings: function() {
                return {
                    sys_eqs_coef_size: 3,
                    linear_equation_form: 'randomized',
                    sys_eqs_x_solution: H.randInt(-7, 7),
                    sys_eqs_y_solution: H.randInt(-7, 7),
                    randomize_solutions: undefined,
                    sys_eqs_term_number: '2_x_2_y'
                };
            }
        },
        {
            title: 'Shuffled Terms (general)',
            example_problem: `
                \\begin{array}{c} 
                6x=-7y+44 \\\\ 
                4y-33=-5x 
                \\end{array}
            `,
            description: 'Equations with terms in a randomized order.',
            get_settings: function() {
                return {
                    sys_eqs_coef_size: 7,
                    linear_equation_form: 'randomized',
                    sys_eqs_x_solution: H.randInt(-5, 5),
                    sys_eqs_y_solution: H.randInt(-5, 5),
                    randomize_solutions: undefined,
                    sys_eqs_term_number: '2_x_2_y'
                };
            }
        },
        {
            title: 'All Forms',
            example_problem: `
                \\begin{array}{c} 
                ax+by=c \\\\
                y=mx+b \\\\
                ax+by+c=0 \\\\
                \\operatorname{L}(x,y)=\\operatorname{R}(x,y) 
                \\end{array}
            `,
            description: 'Equations in standard, slope intercept, equal to zero, or shuffled form.',
            get_settings: function() {
                return {
                    sys_eqs_coef_size: 5,
                    linear_equation_form: H.randFromList(['standard', 'equal_to_zero', 'slope_intercept', 'randomized']),
                    sys_eqs_x_solution: H.randInt(-5, 5),
                    sys_eqs_y_solution: H.randInt(-5, 5),
                    randomize_solutions: undefined,
                    sys_eqs_term_number: '2_x_2_y'
                };
            }
        },
        {
            title: 'x-y Equation And An x-only Equation',
            example_problem: `
                \\begin{aligned}
                4x&=-8 \\\\
                3x+y&=-4
                \\end{aligned}
            `,
            description: 'A system where one of the equations has no y term.',
            get_settings: function() {
                return {
                    sys_eqs_coef_size: 5,
                    linear_equation_form: H.randFromList(['standard', 'equal_to_zero', 'randomized']),
                    sys_eqs_x_solution: H.randInt(-5, 5),
                    sys_eqs_y_solution: H.randInt(-5, 5),
                    randomize_solutions: undefined,
                    sys_eqs_term_number: '2_x_1_y'
                };
            }
        },
        {
            title: 'x-y Equation And An y-only Equation',
            example_problem: `
                \\begin{aligned}
                5y&=25 \\\\
                3x+3y&=27
                \\end{aligned}
            `,
            description: 'A system where one of the equations has no x term.',
            get_settings: function() {
                return {
                    sys_eqs_coef_size: 5,
                    linear_equation_form: H.randFromList(['standard', 'equal_to_zero', 'randomized']),
                    sys_eqs_x_solution: H.randInt(-5, 5),
                    sys_eqs_y_solution: H.randInt(-5, 5),
                    randomize_solutions: undefined,
                    sys_eqs_term_number: '1_x_2_y'
                };
            }
        },
        {
            title: 'x-only Equation And y-only Equation',
            example_problem: `
                \\begin{aligned}
                5x&=-15 \\\\
                -2y&=10
                \\end{aligned}
            `,
            description: 'A system where both equations have only one variable (an x-term or a y-term).',
            get_settings: function() {
                return {
                    sys_eqs_coef_size: 5,
                    linear_equation_form: H.randFromList(['standard', 'equal_to_zero', 'randomized']),
                    sys_eqs_x_solution: H.randInt(-5, 5),
                    sys_eqs_y_solution: H.randInt(-5, 5),
                    randomize_solutions: undefined,
                    sys_eqs_term_number: '1_x_1_y'
                };
            }
        },
        {
            title: 'Lines That Intersect At (0,0)',
            example_problem: `
                \\begin{aligned}
                -6x+6y&=0 \\\\
                7x+5y&=0
                \\end{aligned}
            `,
            description: 'A system where the lines intersect at the origin.',
            get_settings: function() {
                return {
                    sys_eqs_coef_size: 10,
                    linear_equation_form: H.randFromList(['standard', 'slope_intercept', 'equal_to_zero', 'randomized']),
                    sys_eqs_x_solution: 0,
                    sys_eqs_y_solution: 0,
                    randomize_solutions: undefined,
                    sys_eqs_term_number: '2_x_2_y'
                };
            }
        },
        {
            title: 'Solutions Where y=x',
            example_problem: `
                \\begin{aligned}
                -2x+4y&=-10 \\\\
                x-y&=0
                \\end{aligned}
            `,
            description: 'A system where the solution for y is equal to the solution for x.',
            get_settings: function() {
                const sol = H.randInt(-5, 5);
                
                return {
                    sys_eqs_coef_size: 5,
                    linear_equation_form: H.randFromList(['standard', 'slope_intercept', 'equal_to_zero', 'randomized']),
                    sys_eqs_x_solution: sol,
                    sys_eqs_y_solution: sol,
                    randomize_solutions: undefined,
                    sys_eqs_term_number: '2_x_2_y'
                };
            }
        },
        {
            title: 'Solutions Where y=-x',
            example_problem: `
                \\begin{array}{c} 
                5y=-5x \\\\ 
                3y-2x=15 
                \\end{array}
            `,
            description: 'A system where the solution for y is equal to the negative of the solution for x.',
            get_settings: function() {
                const sol = H.randIntExcept(-5, 5, 0);
                
                return {
                    sys_eqs_coef_size: 5,
                    linear_equation_form: H.randFromList(['standard', 'slope_intercept', 'equal_to_zero', 'randomized']),
                    sys_eqs_x_solution: sol,
                    sys_eqs_y_solution: -sol,
                    randomize_solutions: undefined,
                    sys_eqs_term_number: '2_x_2_y'
                };
            }
        },
        {
            title: 'Full Size Coefficients And Solutions',
            example_problem: `
                \\begin{aligned}
                -6x+9y&=183 \\\\
                -16x+20y&=420
                \\end{aligned}
            `,
            description: 'Equations with larger numbers (calculator may be required).',
            get_settings: function() {
                return {
                    sys_eqs_coef_size: 20,
                    linear_equation_form: H.randFromList(['standard', 'slope_intercept', 'equal_to_zero', 'randomized']),
                    sys_eqs_x_solution: H.randInt(-20, 20),
                    sys_eqs_y_solution: H.randInt(-20, 20),
                    randomize_solutions: undefined,
                    sys_eqs_term_number: '2_x_2_y'
                };
            }
        }
    ]
};

export const size_adjustments = {
    height: 1.3,
};