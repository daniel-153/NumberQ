import * as var_iso_module from '../../../../scripts/math-gens/gens/genVarIso.js';
// note: VIH (genVarIso helpers) in the var iso module needs to be exported for this test to be used

function getNumberOfVars(eq_form) { // assumes vars is [a,z]
    let num_vars;

    for (let ascii_int = 122; ascii_int >= 97; ascii_int--) {
        if (eq_form[String.fromCharCode(ascii_int)] === undefined) continue;
        else {
            num_vars = (ascii_int - 97) + 1;
            break;
        }
    }

    return num_vars;
}

function getVarArray(num_vars) {
    const var_array = [];

    for (let i = 0; i < num_vars; i++) {
        var_array.push(String.fromCharCode(97 + i));
    }

    return var_array;
}

function getRandArray(number_of_rands, integer_limit) { // all forced to be != to 0
    const rand = () => Math.floor(Math.random() * (integer_limit)) + 1;

    const rand_array = [];

    for (let i = 0; i < number_of_rands; i++) {
        rand_array.push(rand() * (-1)**(Math.floor(Math.random() * ((1) - (0) + 1)) + (0)));
    }

    return rand_array;
}

// pure_var_random_forms, numerical_random_forms, algebra_forms, geometry_forms, physics_forms, chemistry_forms

export const test = (function*() {
    // pure rand forms
    const current_forms = 'chemistry_forms';
    if (current_forms === 'numerical_random_forms') { // numerical random forms (need special handling)
        for (let i = 0; i < var_iso_module.VIH[current_forms].length; i++) {
            const eq_form = var_iso_module.VIH[current_forms][i];
            
            // first determine how many vars are needed
            const num_vars = getNumberOfVars(eq_form);
            const var_array = getVarArray(num_vars);

            // determine how many rand constants (like A,B in a:(b,c,d,A,B)) need to be supplied
            const a_var_func = eq_form['a'];
            const num_required_rands = (a_var_func.length + 1) - num_vars;
            
            // randomly generated coefs will be in (+/-)[1, rand_coef_size]
            const rand_coef_size = 3;
            let rand_array = getRandArray(num_required_rands, rand_coef_size);
            const conditions_met = (eq_form.conditions_met !== undefined)? eq_form.conditions_met : () => true;

            while (!conditions_met(...rand_array)) {
                rand_array = getRandArray(num_required_rands, rand_coef_size);
            }

            const current_eq_array = [];

            var_array.forEach(var_letter => {
                const eq_with_other_letters = eq_form[var_letter](
                    ...var_array.filter(letter => letter !== var_letter),
                    ...rand_array
                )

                current_eq_array.push(`${var_letter}=${eq_with_other_letters}`)
            });


            let has_base_form = false;
            if (eq_form.base_form !== undefined && typeof(eq_form.base_form) === 'function') {
                has_base_form = true;
                current_eq_array.push(eq_form.base_form(...var_array, ...rand_array));
            }

            console.log(JSON.stringify(current_eq_array))

            yield {
                current_forms: current_forms,
                form_index: i,
                eq_array: current_eq_array,
                number_of_vars: num_vars,
                number_of_coefs: num_required_rands,
                has_base_form: has_base_form
            };
        }
    }
    else {
        for (let i = 0; i < var_iso_module.VIH[current_forms].length; i++) {
            const eq_form = var_iso_module.VIH[current_forms][i];
            
            // first determine how many vars are needed
            const num_vars = getNumberOfVars(eq_form);
            const var_array = getVarArray(num_vars);

            const current_eq_array = [];

            // push all the other forms
            var_array.forEach(var_letter => {
                if (eq_form[var_letter] !== undefined) { 
                    current_eq_array.push(`${var_letter}=${eq_form[var_letter](...var_array.filter(letter => letter !== var_letter))}`);
                }
                else { // the current letter has not been solved for on the form (forms with 'non-simple-solvable' vars)
                    current_eq_array.push(`${var_letter}=${var_letter}`);
                }
                
            });

            // if there is a base form, append it at the end and take note that it is there
            let has_base_form = false;
            if (eq_form.base_form !== undefined && typeof(eq_form.base_form) === 'function') {
                has_base_form = true;
                current_eq_array.push(eq_form.base_form(...var_array));
            }

            yield {
                current_forms: current_forms,
                form_index: i,
                eq_array: current_eq_array,
                number_of_vars: num_vars,
                has_base_form: has_base_form
            };
        }
    }
})();