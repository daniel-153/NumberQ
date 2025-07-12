import * as var_iso_module from '../../../../scripts/math-gens/gens/genVarIso.js';
// note: VIH (genVarIso helpers) in the var iso module needs to be exported for this test to be used

function getNumberOfVars(eq_form) { // assumes vars is [a,z]
    let current_var_value = eq_form[String.fromCharCode(97)];
    let num_vars = 0;

    while (current_var_value !== undefined) {
        num_vars++;
        current_var_value = eq_form[String.fromCharCode(97 + num_vars)];
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

export const test = (function*() {
    // pure rand forms
    for (let i = 0; i < var_iso_module.VIH.pure_var_random_forms.length; i++) {
        const eq_form = var_iso_module.VIH.pure_var_random_forms[i];
        
        // first determine how many vars are needed
        const num_vars = getNumberOfVars(eq_form);
        const var_array = getVarArray(num_vars);

        const current_eq_array = [];

        // push all the other forms
        var_array.forEach(var_letter => {
            current_eq_array.push(`${var_letter}=${eq_form[var_letter](...var_array.filter(letter => letter !== var_letter))}`);
        });

        // if there is a base form, append it at the end and take note that it is there
        let has_base_form = false;
        if (eq_form.base_form !== undefined && typeof(eq_form.base_form) === 'function') {
            has_base_form = true;
            current_eq_array.push(eq_form.base_form(...var_array));
        }

        yield {
            current_forms: 'pure_var_random_forms',
            form_index: i,
            eq_array: current_eq_array,
            number_of_vars: num_vars,
            has_base_form: has_base_form
        };
    }
})();