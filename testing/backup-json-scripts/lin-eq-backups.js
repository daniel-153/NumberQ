import * as ST from '../../settings/setting_templates.js';
import * as G from '../../scripts/gen-modules/genLinEq.js';

// Note: you need to paste this code just before the back-up selection block in the genLinEq function for all this to work
// (since we need to get either a coef array or an error from genLinEq, not a prompt object):
//
// if (!sol_is_found) return "Error: no sol found";
// else return coef_arr;
//
// Also you need to remove the if-else's in the 'final checks' section at the beginning of genLinEq (to catch cases with no sols)

// The three settings fields that create the 8 possible forms for each equation (2*2*2)
// the first and second entry are the code names of the radio buttons in the actual settings form (so we can prompt genLinEq below)
const sol_size_options = [
    ST.solution_size_range.radio_buttons[0][0],
    ST.solution_size_range.radio_buttons[1][0]
];

const sol_form_options = [
    ST.solution_form.radio_buttons[0][0],
    ST.solution_form.radio_buttons[1][0]
];

const coef_sign_options = [
    ST.force_positive_coefs.radio_buttons[0][0],
    ST.force_positive_coefs.radio_buttons[1][0]
];

// settings fields that don't change (have no effect on the sol)
const variable_letter = 'x';
const flip_equation = 'no';

// The equation forms. Keep in mind this array looks like [['begin_1','begin_1'],['begin_2','begin_2']...], so you need to do [k][0]
const equation_templates = [
    ...ST.lin_eq_equation_form.radio_buttons
];


// All of the different ways we can arrage the three main settings above^ -> [sol_size, sol_form, coef_sign]
const setting_permuations = [[0,0,0],[0,0,1],[0,1,0],[0,1,1],[1,0,0],[1,0,1],[1,1,0],[1,1,1]];

// loop through all of the equation forms and try to create the backups if possible
let current_EQ; // the name of the template we are currently on (like 'inter_5')
let current_coef_arr;
let current_settings; // the permuation of the settings we are currently using (an 'official' settings object for genLinEq)
let number_of_backups = 20; // how many backups we'll store for each form
let max_attempts = 1000; // How many times to try a form before we assume it's impossible (if we get a single success in 15 attempts, we try until we have 10 forms, otherwise move on)
let final_json; 
// package all the json generation in a function (all this code is valid outside the function)
function createBackUps() {
    final_json = '{';
    for (let i = 0; i < equation_templates.length; i++) {
        current_EQ = equation_templates[i][0];
        
        // start with the equation key ("inter_1","begin_2",etc)
        final_json += `"${current_EQ}": {`
    
        // loop through each permuation of the settings for each equation template
        for (let j = 0; j < setting_permuations.length; j++) {
            current_settings = {
                solution_size_range: sol_size_options[setting_permuations[j][0]], 
                lin_eq_equation_form: current_EQ, 
                solution_form: sol_form_options[setting_permuations[j][1]], 
                variable_letter: variable_letter,
                flip_equation: flip_equation,
                force_positive_coefs: coef_sign_options[setting_permuations[j][2]]
            };
    
            // add the current permuation of the settings as the next set of keys after the equation (which looks like "001","010",etc) & start the arr of coef arrs for that perm
            final_json += `"${setting_permuations[j][0]}${setting_permuations[j][1]}${setting_permuations[j][2]}": [`
    
            // this loop just tests if we can get a single solution in 'max attempts' (making sure its not impossible)
            let sol_is_found = false;
            let attempts = 0;
            while (!sol_is_found && attempts < max_attempts) {
                current_coef_arr = G.default(current_settings);
    
                if (Array.isArray(current_coef_arr) && current_coef_arr.length > 0) { // generation yielded a valid equation
                    sol_is_found = true;
                }
                else { // generation did NOT yield a valid equation
                    attempts++
                }
            }
    
    
            // now we can run a loop until we find 10 valid sols or give an empty array to indicate this form is not possible
            if (sol_is_found) { // sols are possible and we need to generate until we get 10 of them
                let successes = 0; // how many valid sols we've found so far
    
                while (successes < number_of_backups) {
                    current_coef_arr = G.default(current_settings);
    
                    if (Array.isArray(current_coef_arr) && current_coef_arr.length > 0) { // generation yielded a valid equation
                        final_json += `[${current_coef_arr}]`; // add the coef array to the json
                        successes++;
    
                        if (successes !== number_of_backups) final_json += `,` // add a comma for all but the last entry
                    }
                }
            }
            else { // indicate no sols are possible for the form by putting null in the arr of coef arrs
                final_json += `null`
            }
            final_json += `]`; // close the current array of arrays 
    
            if (j !== setting_permuations.length - 1) final_json += `,`; // add a comma for all but the last permuation of settings
        }
        final_json += `}`; // close the current equation object ("advan_1: {"001": [...], "010": [...], ...} )
    
        if (i !== equation_templates.length - 1) final_json += `,` // add a comma for all but the last equation object
    }
    final_json += '}'; // close the outer json
    
    console.log(final_json);
}

// un-comment this to generate the json when the page loads
// createBackUps();