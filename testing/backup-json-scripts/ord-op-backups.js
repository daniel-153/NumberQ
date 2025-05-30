import * as G from '../../scripts/math-gens/gens/genOrdOp.js';

const validateSettings = function(settings_obj) { // technically a function of form_obj, and the error_locations set, but need to simplify here
    G.processFormObj(settings_obj, new Set());
    return settings_obj;
}

const genOrdOp = G.default;

// Note: past this before the return statement in genOrdOp for this to work: "return '[' + final_template + ']';""
// and remove the "i < max_templates && " in the outer sol search for-loop (for (let i = 0; i < max_templates && !sol_found; i++) {...})
// (so that the sol-search runs until a solution is found - reguardless of attempts)

// Note: the key simplification here is that every 'Allow _____' setting is assumed to be disallowed here (because allow != force)
// (and this significantly decreases the number of permutations - since we're only permutating the operation counts)

// http://127.0.0.1:5500/testing/gen-testing.html (make sure this <-- html file is loading THIS script)

const premutationGenerator = (function*() { // generator function to iterate over operation count permutations without pre-storing
    const max_operators = 3; // each operation is capped at 3 (max 3 additions, max 3 subtractions, ...)
    
    for (let e = 0; e < max_operators + 1; e++) {
        for (let m = 0; m < max_operators + 1; m++) {
            for (let d = 0; d < max_operators + 1; d++) {
                for (let a = 0; a < max_operators + 1; a++) {
                    for (let s = 0; s < max_operators + 1; s++) {
                        yield {e, m, d, a, s};
                    }
                }
            }
        }
    }
})();

function settingsAreSame(pre_validated_sets, post_validated_sets) {
    let settings_are_same = true;
    for (const [key, value] of Object.entries(pre_validated_sets)) {
        if (value !== post_validated_sets[key]) settings_are_same = false;
    }
    return settings_are_same;
}

function createBackUps() {
    const templates_per_backup = 2;
    const total_permutations = 1024; // each of a,s,m,d, and e can be in [0,3], so 4*4*4*4*4 = 4^5 = 1024
    let final_json = '{'; 
    
    for (let backup_num = 1; backup_num <= total_permutations; backup_num++) {
        const emdas = premutationGenerator.next().value;
        
        const current_settings = {
            allow_negatives: 'no', // Not allowing any of the "allow" settings
            allow_parentheses: 'no',
            allow_nesting: 'no',
            allow_zero: 'no',
            multiply_symbol: ' \\times ', // irrelevant to the template (which is what's being retrieved and stored in the json)
            add_count: emdas.a,
            subtract_count: emdas.s,
            multiply_count: emdas.m,
            divide_count: emdas.d,
            exponent_count: emdas.e,
        };

        // only create a backup entry if the current settings are possible (valid) && there is subtraction and/or division present
        if (
            (emdas.s === 0 && emdas.d === 0) || 
            !settingsAreSame(JSON.parse(JSON.stringify(current_settings)), validateSettings(current_settings))
        ) {
            continue; // skip if there is neither subtraction nor division Or the settings aren't valid
        }


        final_json += `"${emdas.a}${emdas.s}${emdas.m}${emdas.d}${emdas.e}":`; // property key

        // Use this (commented code below) for multiple backups per permutation
        // final_json += '[' // backup array
        // for (let template = 1; template <= templates_per_backup; template++) {
        //     final_json += genOrdOp(current_settings);
            
        //     if (template !== templates_per_backup) final_json += ',';
        // }
        // final_json += ']';

        // use this if you just want one backup per permutation (to avoid using an array)
        final_json += genOrdOp(current_settings); 

        if (backup_num !== total_permutations) final_json += ',';

        if (backup_num % 128 === 0) console.log(`${(backup_num / total_permutations) * 100}% of backups created.`);
    }
    final_json += '}';

    console.log(final_json);
}

createBackUps();