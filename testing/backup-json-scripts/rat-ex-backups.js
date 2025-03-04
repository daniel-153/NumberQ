import * as G from '../scripts/modules_w-sets/genRatEx.js';

// Note: in order to use this code to generate the json, you need to pase the following right after the sol-search while-loop in genRatEx:
// return final_coef_arr;


// possible operation types for the add-sub forms (addition and subtraction)
const as_operation_types = [
    ['add'],
    ['subtract']
];

// possible operation type for the mul-div forms (multiplication and division)
const md_operation_types = [
    ['multiply'],
    ['divide']
];

// all the forms (add-sub and mul-div in one array)
const form_names = [
    'as_1','as_2','as_3','as_4','as_5','as_6','as_7','as_8','as_9','as_10','as_11','as_12','as_13','as_14','as_15',
    'md_1','md_2','md_3','md_4','md_5','md_6','md_7','md_8','md_9','md_10','md_11','md_12','md_13','md_14','md_15','md_16'
];

let final_json;
// package all the json generation in a function (all this code is valid outside the function)
function createBackUps() {
    final_json = '{'; // open the outermost json object
    
    // loop through each form 
    let current_form;
    let current_operations; // the array of [add,sub] or [mul,div] (not a single operation)
    let current_settings; // the current settings object to be sent to genRatEx
    let current_coef_arr;
    let number_of_backups = 10; // how many backups there are for each possible form + operation
    for (let i = 0; i < form_names.length; i++) {
        current_form = form_names[i];
    
        final_json += `"${current_form}": {`; // the forms are the first layer of keys (open each one here)
    
        if (current_form.charAt(0) === 'a') { // 'as' -> use add and subtract
            current_operations = as_operation_types;
        }
        else if (current_form.charAt(0) === 'm') { // 'md' -> use mul and divide
            current_operations = md_operation_types;
        }
    
        for (let j = 0; j < current_operations.length; j++) { // loop through each operation add, sub, mul, div
            final_json += `"${current_operations[j][0]}": [`; // start the array of templates with the operation as the next layer of keys
    
            current_settings = {
                ratex_add_sub_form: current_form.replace('md','as'), 
                ratex_mul_div_form: current_form.replace('as','md'), 
                general_operation_types: current_operations[j],
                numer_form: 'expanded',
                denom_form: 'expanded',
                give_excluded_values: 'no'
            }
    
            for (let k = 0; k < number_of_backups; k++) {
                current_coef_arr = G.default(current_settings); // get a coef array
    
                final_json += `[${current_coef_arr.join(',')}]`
    
                if (k !== number_of_backups - 1) {
                    final_json += ','; // add a comma for all but the last coef array
                }
            }
            final_json += ']'; // close the array of coef arrays for the current operation
    
            if (j !== current_operations.length - 1) {
                final_json += ','; // add a comma for all but the last operation key
            }
        }
        final_json += '}'; // close the object for the current form 'as_k/md_k'
    
        if (i !== form_names.length - 1) { // add a comma for all but the last form
            final_json += ',';
        }
    }
    final_json += '}'; // close the outer-most json

    console.log(final_json);
}

// un-comment this to generate the json when the page loads
createBackUps();


