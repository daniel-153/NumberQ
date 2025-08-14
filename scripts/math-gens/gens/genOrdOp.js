import * as H from '../helpers/gen-helpers.js';
import * as SH from '../helpers/settings-helpers.js';

export function validateSettings(form_obj, error_locations) {
    // using this to iterate over the '_count' settings without repeated code
    let all_zero = true;
    let num_operators = 0; // excludes exponent operators
    let num_exponents = 0; 
    for (const [key, value] of Object.entries(form_obj)) {
        if (key.includes('_count')) {
            form_obj[key] = SH.val_restricted_integer(value, error_locations, 0, 3, key); // ensure each operation count is valid (0 to 3)
            if (value > 0) all_zero = false; 
            if (key.includes('exponent')) num_exponents += form_obj[key];
            else num_operators += form_obj[key];
        }
    }

    // ensure that the operation counts aren't ALL zero 
    if (all_zero) form_obj.add_count = 1; // fallback is one addition => a+b

    // ensure there isn't a disproportionate number of exponents (like 3 exponentiations and 0 of any other operation (forcing a power tower))
    if (num_exponents > num_operators + 1 && !(num_exponents === 1 && num_operators === 0)) {
        // this is how many more 'flat' operands we need
        const additional_operators = num_exponents - (num_operators + 1);

        // make these additional operations 'additions' (the simplest way to add more on)
        form_obj.add_count += additional_operators;
    }
}

let backup_json = null;

const OOH = { // genOrdOp helpers
    conversion_table: {
        "a": '+',
        "s": '-',
        "m": null,
        "d": '\\div',
        "e": '^'
    },
    js_conversion_table: {
        "a": (x, y) => x + y,
        "s": (x, y) => x - y,
        "m": (x, y) => x * y,
        "d": (x, y) => x / y,
        "e": (x, y) => x**y
    },
    getNumExponents: function(settings) {
        for (const [key, value] of Object.entries(settings)) { // add all the operations **except for exponents**
            if (key === 'exponent_count') return value;
        }
    },
    getReferenceCopy: function(expression_template) { // create a unique copy of the expression_template, but with the same sub-object references
        const reference_copy = [];

        for (let i = 0; i < expression_template.length; i++) {
            if (Array.isArray(expression_template[i])) { // recurse for sub-expressions
                reference_copy[i] = OOH.getReferenceCopy(expression_template[i]);
            }
            else reference_copy[i] = expression_template[i];
        }

        return reference_copy;
    },
    findExpressionValue: function(AST) {
        let operand_1 = AST[0];
        const operator = AST[1];
        let operand_2 = AST[2];

        if (Array.isArray(operand_1)) operand_1 = OOH.findExpressionValue(operand_1);
        if (Array.isArray(operand_2)) operand_2 = OOH.findExpressionValue(operand_2);

        return {value: OOH.js_conversion_table[operator](operand_1.value, operand_2.value)};
    },
    clearOperandValues: function(operand_list) {
        operand_list.forEach(operand_obj => {
            operand_obj.value = null;
        });
    },
    buildNewOperationsList: function(settings) { // list of operations indicated by letter [a,a,m,d,...]
        let opreation_list = [];
        for (const [key, value] of Object.entries(settings)) { // add all the operations **except for exponents**
            if (key.includes('_count') && !key.includes('exponent')) {
                for (let i  = 0; i < value; i++) {
                    opreation_list.push(key.charAt(0));
                }
            }
        }
        H.randomizeList(opreation_list);
        return opreation_list;
    }, // make operation_list indicate which operations to apply, how many times, and in what order (except for exponents)
    buildExpressionTemplate: function(operation_list, num_exponents) {
        // list to store references to all the operands (so we can access and clear them later without searching the expression)
        const operand_list = []; 
        
        // first, handle the edge case of the single exponential a^b (and nothing else)
        if (operation_list.length === 0 && num_exponents === 1) {
            const operand_1 = {value: null};
            const operand_2 = {value: null};

            operand_list.push(operand_1, operand_2);
            return {expression_template: [operand_1, 'e', operand_2], operand_list}; // return expression template here (nothing else is to be added)
        }
        
        // now we fill [a,a,m,d,...] with numbers => [_,a,_,a,_,m,_,d,_,...]
        const number_of_operands = operation_list.length + 1; // number of underscores (above) (exlcudes exponent operations)

        // randomly select the locations for exponent expressions (if there are any)
        let available_location_list = H.integerArray(1, number_of_operands);
        let exponent_locations = [];
        for (let i = 0; i < num_exponents; i++) {
            const rand_index = H.randInt(0, available_location_list.length - 1);
            exponent_locations.push(available_location_list[rand_index]);
            available_location_list.splice(rand_index, 1);
        }

        const expression_template = []; // operations list but with numbers (or exponent operations) between the operations ([_,a,_,a,_,m,_,d,_,...])
       
        for (let i  = 1; i <= number_of_operands; i++) {
            if (exponent_locations.includes(i)) { // current operand is an exponent expression
                const operand_1 = {value: null};
                const operand_2 = {value: null};
                
                expression_template.push([operand_1, 'e', operand_2]);
                operand_list.push(operand_1, operand_2);
            }
            else { // current operand is a number
                const operand = {value: null};

                expression_template.push(operand);
                operand_list.push(operand);
            }

            // as long as this isn't the very last operand ([_,a,_,a,_,m,_,d,_,...]), insert the next operation letter after it
            if (i !== number_of_operands) {
                expression_template.push(operation_list[i - 1]);
            }
        }

        return {expression_template, operand_list};
    },
    getNumOperators: function(expression_template) { // number of base-level operators in a template (like 3 in [_,a,_,a,_,m,_] a, a, and m)
        return ((expression_template.length - 1) / 2);
    },
    getMaxParens: function(expression_template) {
        return ((expression_template.length - 1) / 2) - 1;
    },
    getValidParenIndices: function(expression_map) {
        const valid_paren_indices = [];
        for (let i = 0; i < expression_map.length; i++) {
            if (expression_map[i] === 'O-V') valid_paren_indices.push(i);
        }
        return valid_paren_indices;
    },
    applyParens: function(start_index, end_index, expression_template) {
        // if the goal is [_,a,[_,a,_,m,_,d,_],d,_a,_]
        const start_arr = []; // => [_,a]
        const parens_arr = []; // => [_,a,_,m,_,d,_]
        const end_arr = []; // => [d,_a,_]

        for (let i = 0; i < start_index; i++) {start_arr.push(expression_template[i]);}
        for (let i = start_index; i <= end_index; i++) {parens_arr.push(expression_template[i]);}
        for (let i = end_index + 1; i < expression_template.length; i++) {end_arr.push(expression_template[i]);}

        return [...start_arr, parens_arr, ...end_arr];
    },
    getExpressionMap: function(expression_template, settings) {
        const expression_map = [];
        for (let i = 0; i < expression_template.length; i++) {
            if (typeof(expression_template[i]) === 'string') { // current element is an operator
                expression_map[i] = 'O'; // 'O' for operator
            }
            else { // current element is an operand
                const operand = expression_template[i];

                if (
                    (typeof(operand) === 'object' && operand.value === null) || // operand is (will be) a number
                    (operand.length === 3 && operand[1] === 'e') // operand is a single exponenetial a^b (so we treat it like a number)
                ) expression_map[i] = 'N'; // 'N' for number
                else expression_map[i] = 'E'; // 'E' for expression
            }
        }

        for (let i = 1; i < expression_map.length - 1; i += 2) {
            if (expression_map[i - 1] === 'N' && expression_map[i + 1] === 'N' && expression_map.length > 3) {
                expression_map[i] += '-V'; // '-V' for valid => valid operator to place parens on
            }
            else {
                if (settings.allow_nesting === 'no' || expression_map.length === 3) expression_map[i] += '-I'; // '-I' for invalid (when nesting isn't allowed)
                else if (settings.allow_nesting === 'yes') expression_map[i] += '-V'; // only valid if nesting expressions is allowed
            }
        }

        return expression_map;
    },
    insertParentheses: function(expression_template, settings) {
        // exit early if parentheses aren't applicable
        if (OOH.getMaxParens(expression_template) === 0 || settings.allow_parentheses === 'no') return expression_template;

        // randomly (but with a strong minimizing bias) determine how many parens to use
        let distribution_seed = 2 * (1 - 80 / 100); // 80% chance we use just 1 paren, 20% chance of 2+ (if 2+ is possible after 1)
        do {
            let expression_map = OOH.getExpressionMap(expression_template, settings);
            const initial_index = H.randFromList(OOH.getValidParenIndices(expression_map));

            let distribution_seed_2 = 2 * (1 - 87.5 / 100); // 85% chance the paren includes just one operator, 15% of 2+ (if possible)
            let lower_paren_bound = initial_index - 1;
            let upper_paren_bound = initial_index + 1;
            while ( // we neither have a+(b+c) NOR (b+c)+a 
                !(lower_paren_bound === 0 && upper_paren_bound === expression_map.length - 3) &&
                !(lower_paren_bound === 2 && upper_paren_bound === expression_map.length - 1) && 
                Math.random() < (distribution_seed_2 *= 0.5)
            ) {
                let expansion_direction;
                let can_expand_backward = false;
                let can_expand_foward = false;

                if (
                    upper_paren_bound !== expression_map.length - 1 && // this isn't the last possible location for a right paren
                    expression_map[upper_paren_bound + 1] === 'O-V' // the next operator is valid to enclose with parens
                ) can_expand_foward = true;

                if (
                    lower_paren_bound !== 0 && // the isn't the first possible location for a left paren
                    expression_map[lower_paren_bound - 1] === 'O-V' // the previous operator is valid to enclose with parens
                ) can_expand_backward = true;

                if (can_expand_backward && can_expand_foward) {
                    expansion_direction = H.randFromList(['-','+']); // either direction is valid (randomly choose one of them)
                }
                else if (can_expand_backward) expansion_direction = '-'; // can only expand backward
                else if (can_expand_foward) expansion_direction = '+'; // can only expand foward
                else break; // can't expand in any direction (break out of the loop - no expansion happens)

                if (expansion_direction === '+') upper_paren_bound += 2;
                else if (expansion_direction === '-') lower_paren_bound -= 2;
            }

            expression_template = OOH.applyParens(lower_paren_bound, upper_paren_bound, expression_template);
        } while (
            OOH.getValidParenIndices(OOH.getExpressionMap(expression_template, settings)).length > 0 
            && Math.random() < (distribution_seed *= 0.5)
        );

        return expression_template;
    },
    groupOperations: function(expression_template, precendence) {
        let operator1, operator2;

        if (precendence === 'md') {
            operator1 = 'm';
            operator2 = 'd';
        }
        else if (precendence === 'as') {
            operator1 = 'a';
            operator2 = 's';
        }

        let expr = expression_template;
        let final_operand_reached = false;

        while (expr.length !== 3 && !final_operand_reached) {
            const orig_expr_len = expr.length;
            let changed = false;

            for (let i = 1; i < orig_expr_len - 1; i += 2) {
                if (expr[i] === operator1 || expr[i] === operator2) {
                    expr = OOH.applyParens(i - 1, i + 1, expr);
                    if (i + 1 === expr.length - 1) final_operand_reached = true;
                    changed = true;
                    break;
                }
            }

            if (!changed) break; // Avoid infinite loop if no changes made
        }

        return expr;
    },
    convertToAST: function(expression_template) {
        // for each level, start by simplifying to ensure there are three elements [[...], O, [...]]
        if (expression_template.length > 3) {
            expression_template = OOH.groupOperations(expression_template, 'md'); // group mul and div
            expression_template = OOH.groupOperations(expression_template, 'as'); // group add and sub
        } // now the length must be 3
        
        // If both operands are null at this point (not arrays) the current e.t. is completely simplified
        if (expression_template[0].value === null && expression_template[2].value === null) return expression_template;
        else { // otherwise, one or both need to be ran through the grouping algo
            if (Array.isArray(expression_template[0])) expression_template[0] = OOH.convertToAST(expression_template[0]);
            if (Array.isArray(expression_template[2])) expression_template[2] = OOH.convertToAST(expression_template[2]);
        }

        return expression_template;
    },
    buildValidRandFunc: function(max_term_size, settings) {
        max_term_size = Math.floor(max_term_size); // ensure ints
        
        let getValidRand;
        if (settings.allow_negatives === 'yes') {
            if (settings.allow_zero === 'yes') {
                getValidRand = function(restiction) {
                    if (restiction === 'non-zero') return H.randIntExcept((-1)*max_term_size, max_term_size, 0);
                    else if (restiction === 'non-negative') return (H.randInt(1,50) === 1)? (0) : (H.randInt(1, max_term_size));
                    return (H.randInt(1,50) === 1)? (0) : (H.randIntExcept((-1)*max_term_size, max_term_size, 0)); // always 2% chance of 0
                }
            }
            else if (settings.allow_zero === 'no') {
                getValidRand = function(restiction) { 
                    if (restiction === 'non-negative') H.randInt(1, max_term_size);
                    return H.randIntExcept((-1)*max_term_size, max_term_size, 0);
                }
            }
        }
        else if (settings.allow_negatives === 'no') {
            if (settings.allow_zero === 'yes') {
                getValidRand = function(restiction) {
                    if (restiction === 'non-zero') return H.randInt(1, max_term_size);
                    return (H.randInt(1,50) === 1)? (0) : (H.randInt(1, max_term_size)); // always 2% chance of 0 
                }
            }
            else if (settings.allow_zero === 'no') {
                getValidRand = function(restiction) { 
                    return H.randInt(1, max_term_size);
                }
            }
        }

        return getValidRand;
    },
    APH: { // assignAndPerform helpers
        settings: null,
        max_term_size: null,
        value: null, // will later become an object of methods to get random values
        exponentiation: function(operand_1, operand_2) { // by design, both operands will always be null ("unassigned") here
            operand_2.value = this.value.exponent(); // exponent() => 0, 2, or 3 (exlcludes 0 if not allowed)
            if (operand_2.value <= 2 && operand_2 !== 0) {
                operand_1.value = this.value.halfSizeRand('non-negative');
            }
            else if (operand_2 === 0) {
                operand_1.value = Math.abs(this.value.halfSizeRand('non-zero'));
            }
            else operand_1.value = this.value.zeroOneOrTwo('non-negative');
            
            return operand_1.value**operand_2.value;
        },
        multiplication: function(operand_1, operand_2) {
            if (H.randInt(0, 1) === 0) {
                if (operand_1.value === null) operand_1.value = this.value.halfSizeRand('non-zero');
                if (operand_2.value === null) operand_2.value = this.value.halfSizeRand();
            }
            else {
                if (operand_1.value === null) operand_1.value = this.value.halfSizeRand();
                if (operand_2.value === null) operand_2.value = this.value.halfSizeRand('non-zero');
            }

            // reduce the likelyhood of 1's
            (operand_1.value === 1 && H.randInt(1, 10) < 9)? (operand_1.value++) : (null); // 80% chance 1 gets flipped to 2
            (operand_2.value === 1 && H.randInt(1, 10) < 9)? (operand_2.value++) : (null);

            return operand_1.value * operand_2.value;
        },
        division: function(operand_1, operand_2) {
            // if both unassigned, randomly assign one
            if (operand_1.value === null && operand_2.value === null) {
                if (H.randInt(0, 1) === 0) { 
                    operand_2.value = this.value.halfSizeRand('non-zero');
                }   
                else { 
                    operand_1.value = this.value.generalRand();
                } 
            }

            // then attempt to assign the other
            if (operand_1.value === null) {
                operand_1.value = this.value.multipleOf(operand_2.value);
            }
            else if (operand_2.value === null) { // where NaN is most likely to arise
                operand_2.value = this.value.divisorOf(operand_1.value);
            }

            const division_result = operand_1.value / operand_2.value;

            if (Number.isSafeInteger(division_result)) return division_result;
            else return NaN;
        },
        addition: function(operand_1, operand_2) {
            if (H.randInt(0, 1) === 0) {
                if (operand_1.value === null) operand_1.value = this.value.generalRand('non-zero');
                if (operand_2.value === null) operand_2.value = this.value.generalRand();
            }
            else {
                if (operand_1.value === null) operand_1.value = this.value.generalRand();
                if (operand_2.value === null) operand_2.value = this.value.generalRand('non-zero');
            }

            return operand_1.value + operand_2.value;
        },
        subtraction: function(operand_1, operand_2) {
            // if both unassigned, randomly assign one
            if (operand_1.value === null && operand_2.value === null) {
                if (H.randInt(0, 1) === 0) {
                    operand_1.value = this.value.generalRand();
                }
                else {
                    if (this.settings.allow_negatives === 'yes') {
                        operand_2.value = this.value.generalRand();
                    }
                    else if (this.settings.allow_negatives === 'no') {
                        operand_2.value = this.value.halfSizeRand();
                    }
                }
            }

            // then attempt to assign the other
            if (operand_1.value === null) {
                if (this.settings.allow_negatives === 'yes') {
                    if (operand_2.value === 0) operand_1.value = this.value.generalRand('non-zero');
                    else operand_1.value = this.value.generalRand();
                }
                else if (this.settings.allow_negatives === 'no') {
                    if (operand_2.value === 0) operand_1.value = this.value.greaterOrEqualTo(operand_2.value, 'non-zero');
                    else operand_1.value = this.value.greaterOrEqualTo(operand_2.value);
                }
            }
            else if (operand_2.value === null) { 
                if (this.settings.allow_negatives === 'yes') {
                    if (operand_1.value === 0) operand_2.value = this.value.generalRand('non-zero');
                    else operand_2.value = this.value.generalRand();
                }
                else if (this.settings.allow_negatives === 'no') {
                    if (operand_1.value === 0) operand_2.value = this.value.lesserOrEqualTo(operand_1.value, 'non-zero');
                    else operand_2.value = this.value.lesserOrEqualTo(operand_1.value);
                }
            }

            const subtraction_result = operand_1.value - operand_2.value;

            if (this.settings.allow_negatives === 'no' && subtraction_result < 0) return NaN;
            else return subtraction_result;
        }
    },
    assignAndPerform: function(operand_1, operand_2, operator) {        
        let result;
        if (operator === 'e') {
            result = OOH.APH.exponentiation(operand_1, operand_2);
        }
        else if (operator === 'm') {
            result = OOH.APH.multiplication(operand_1, operand_2);
        }
        else if (operator === 'd') {
            result = OOH.APH.division(operand_1, operand_2);
        }
        else if (operator === 'a') {
            result = OOH.APH.addition(operand_1, operand_2);
        }
        else if (operator === 's') {
            result = OOH.APH.subtraction(operand_1, operand_2);
        }

        return {value: result};
    },
    evaluateExpression: function(final_AST) {
        // we know the final AST looks like [[...], O, [...]] at every level
        let first_operand = final_AST[0];
        let second_operand = final_AST[2];

        // evaluate the operands if they are expressions
        if (Array.isArray(first_operand)) first_operand = OOH.evaluateExpression(first_operand);
        if (Array.isArray(second_operand)) second_operand = OOH.evaluateExpression(second_operand);

        // past this point, neither operand is an expression, both are either Numbers or null objects => {value: null}
        return OOH.assignAndPerform(first_operand, second_operand, final_AST[1]);
    },
    templateToMath: function(expression_template) {
        for (let i = 0; i < expression_template.length; i++) {
            const current_entry = expression_template[i];

            if (typeof(current_entry) === 'string') continue; // do nothing for strings => they are either operators or already parsed expressions/values
            else if (Array.isArray(current_entry)) { // current entry is an expression
                expression_template[i] = OOH.templateToMath(current_entry); // recurse
            }
            else if (typeof(current_entry) === 'object') { // current entry is a {value: N} object
                expression_template[i] = Number(current_entry.value) + ''; // overrite it with its value as a string
            }
        }

        // now the expression template (at the current level) must be an array of math strings seperated by operators ('a', 'm', etc) 
        // first join it together as such
        let accum_string = '';
        expression_template.forEach(string_entry => {
            if (OOH.conversion_table[string_entry] === undefined) { // operand
                if (string_entry.charAt(0) === '-') accum_string += ('(' + string_entry + ')'); // negative number
                else accum_string += string_entry; // positive number or an expression
            }
            else accum_string += OOH.conversion_table[string_entry]; // operator 
        });

        // then add parens around and return (as long as it isn't a single exponential)
        if (expression_template.length === 3 && expression_template[1] === 'e') return accum_string;
        else return '(' + accum_string + ')';
    },
    validateExprTexString: function( 
        expression_tex_str, 
        allow_negatives = false, // determines whether negatives can appear at *any level* of evaluating the expression 
        allow_decimals = false // determines whether decimals can appear at *any level* of evaluating the expression 
    ) {
        const slice = (str, start_index, end_index) => str.slice(start_index, end_index + 1); 
        
        // precheck: if decimals aren't allowed and the expression contains any decimal points, it is invalid (no further checks)
        if (!allow_decimals && expression_tex_str.includes('.')) return {value: NaN, is_valid: false};

        // scan the first level for sub expressions 1-3+(....) <-  (evaluate all parens so that the expression is 'flat')
        for (let expr_idx = 0; expr_idx < expression_tex_str.length; expr_idx++) {
            if (expression_tex_str[expr_idx] === '(') { // subexpression found -> find the closing ')'
                const sub_expr_start_idx = expr_idx; // includes opening paren
                let paren_nesting_level = 1;

                let sub_expr_end_idx; // includes closing paren
                for (expr_idx = expr_idx + 1; expr_idx < expression_tex_str.length; expr_idx++) {
                    if (expression_tex_str[expr_idx] === ')' && paren_nesting_level === 1) {
                        sub_expr_end_idx = expr_idx;
                        break;
                    }
                    else if (expression_tex_str[expr_idx] === ')') paren_nesting_level--;
                    else if (expression_tex_str[expr_idx] === '(') paren_nesting_level++;
                }
                
                const sub_expr_validation_result = OOH.validateExprTexString(
                    slice(expression_tex_str, sub_expr_start_idx + 1, sub_expr_end_idx - 1),
                    allow_negatives, allow_decimals
                );

                if (sub_expr_validation_result.is_valid) {
                    // replace the nested paren expression with its value, then continue looking for paren expressions in the expression_tex_str (if needed)
                    expression_tex_str = slice(expression_tex_str, 0, sub_expr_start_idx - 1) + sub_expr_validation_result.value + slice(expression_tex_str, sub_expr_end_idx + 1, expression_tex_str.length - 1);
                    expr_idx = (slice(expression_tex_str, 0, sub_expr_start_idx - 1) + sub_expr_validation_result.value).length;
                }
                else {
                    return {value: NaN, is_valid: false}; // subexpression was not valid
                }
            }
        }
        
        // convert the traditional operators to single characters (tokenize)
        expression_tex_str = expression_tex_str.replace(/\\times/g, 'm');
        expression_tex_str = expression_tex_str.replace(/\\cdot/g, 'm');
        expression_tex_str = expression_tex_str.replace(/\\div/g, 'd');
        expression_tex_str = expression_tex_str.replace(/\^/g, 'e');
        expression_tex_str = expression_tex_str.replace(/\+/g, 'a');
        expression_tex_str = expression_tex_str.replace(/-/g, 's');

        // the expr tex str is now 'flat' (only numbers and operands, no parens) at the current level
        if (!allow_negatives) { // check if the expression already contains negatives when it shouldn't (before evaluation)
            for (let expr_idx = expression_tex_str.length - 1; expr_idx >= 0; expr_idx--) { 
                // negatives are always found in two forms: [operator, 's', number] or [undefined, 's', number] (second is the very start of the expr)
                const i_0 = expression_tex_str[expr_idx];
                const i_minus_1 = expression_tex_str[expr_idx - 1];
                const i_minus_2 = expression_tex_str[expr_idx - 2];

                if (
                    (!Number.isNaN(Number(i_0)) && i_minus_1 === 's') &&
                    (i_minus_2 === undefined || i_minus_2 === 'a' || i_minus_2 === 's' || i_minus_2 === 'd' || i_minus_2 === 'e' || i_minus_2 === 'm')
                ) {
                    return {value: NaN, is_valid: false}; // negative found
                }
            }
        }

        // now the expression needs to be sectioned off by its '+'s and '-'s (to conduct EMD in PEMDAS)
        const expression_sections = [{operator: null, index: -1}];
        for (let expr_idx = 0; expr_idx < expression_tex_str.length; expr_idx++) {
            if (
                expression_tex_str[expr_idx] === 'a' || // plus operator or
                (
                    expression_tex_str[expr_idx] === 's' && // negative operator preceeded by a number (A-B to avoid catching A+-B, A--B, etc)
                    !Number.isNaN(Number(expression_tex_str[expr_idx - 1]))
                )
            ) {
                expression_sections.push(
                    slice(expression_tex_str, expression_sections[expression_sections.length - 1].index + 1, expr_idx - 1)
                );

                expression_sections.push({
                    operator: expression_tex_str[expr_idx],
                    index: expr_idx
                });
            }
        }
        expression_sections.shift(); // remove the first placeholder operand

        // if the last entry is an operator, there is still a final operand section that needs to be extracted
        if (
            typeof(expression_sections[expression_sections.length - 1]) === 'object' &&
            expression_sections[expression_sections.length - 1] !== null
        ) {
            expression_sections.push(slice(
                expression_tex_str,
                expression_sections[expression_sections.length - 1].index + 1, expression_tex_str.length - 1
            ));
        }

        if (expression_sections.length === 0) { // handle the case of one expression block of EMD with no AS
            expression_sections.push(expression_tex_str);
        }

        // evaluate every even index of the expression sections and check conditions
        for (let section_idx = 0; section_idx < expression_sections.length; section_idx += 2) {
            let curr_sub_expr = expression_sections[section_idx];
            curr_sub_expr = curr_sub_expr.replace(/s/g, '-'); // remaining negatives are negative numbers (if they were allowed) - no longer minus operators

            // start by evaluating all of the exponents (if there are any)
            while (curr_sub_expr.includes('e')) {
                for (let sub_expr_idx = 0; sub_expr_idx < curr_sub_expr.length; sub_expr_idx++) {
                    if (curr_sub_expr[sub_expr_idx] === 'e') {
                        // walk back until another operator (besides '-') is found (extract the base)
                        let back_step_index = sub_expr_idx;
                        while (
                            !Number.isNaN(Number(slice(curr_sub_expr, back_step_index - 1, sub_expr_idx - 1))) &&
                            back_step_index > 0
                        ) {
                            back_step_index--;
                        }
                        const base = Number(slice(curr_sub_expr, back_step_index, sub_expr_idx - 1));

                        // walk foward until another operator (besides '-') is found (extract the exponent)
                        let foward_step_index = sub_expr_idx;
                        while (
                            (
                                !Number.isNaN(Number(slice(curr_sub_expr, sub_expr_idx + 1, foward_step_index + 1))) || 
                                slice(curr_sub_expr, sub_expr_idx + 1, foward_step_index + 1) === '-'
                            ) &&
                            foward_step_index < curr_sub_expr.length - 1
                        ) {
                            foward_step_index++;
                        }
                        const exponent = Number(slice(curr_sub_expr, sub_expr_idx + 1, foward_step_index));

                        const result = base**exponent;

                        if ((result % 1 !== 0) && !allow_decimals) {
                            return {value: NaN, is_valid: false}; // decimal found
                        }
                        else {
                            curr_sub_expr = slice(curr_sub_expr, 0, back_step_index - 1) + result + slice(curr_sub_expr, foward_step_index + 1, curr_sub_expr.length - 1);
                            break;
                        }
                    }
                }
            }

            // at this point, the current sub expression has only multiplication and division (no exponents) --- or no operations at all
            while (curr_sub_expr.includes('m') || curr_sub_expr.includes('d')) {
                for (let sub_expr_idx = 0; sub_expr_idx < curr_sub_expr.length; sub_expr_idx++) {
                    if (curr_sub_expr[sub_expr_idx] === 'm' || curr_sub_expr[sub_expr_idx] === 'd') {
                        // extract the two operands -> walk foward until another operator (besides '-') is found (extract the second operator)
                        const operand_1 = Number(slice(curr_sub_expr, 0, sub_expr_idx - 1));
                        
                        let foward_step_index = sub_expr_idx;
                        while (
                            (
                                !Number.isNaN(Number(slice(curr_sub_expr, sub_expr_idx + 1, foward_step_index + 1))) || 
                                slice(curr_sub_expr, sub_expr_idx + 1, foward_step_index + 1) === '-'
                            ) &&
                            foward_step_index < curr_sub_expr.length - 1
                        ) {
                            foward_step_index++;
                        }
                        const operand_2 = Number(slice(curr_sub_expr, sub_expr_idx + 1, foward_step_index));

                        let result;
                        if (curr_sub_expr[sub_expr_idx] === 'm') result = operand_1 * operand_2;
                        else if (curr_sub_expr[sub_expr_idx] === 'd') result = operand_1 / operand_2;

                        // check if conditions are still met
                        if (
                            ((result < 0) && !allow_negatives) ||
                            ((result % 1 !== 0) && !allow_decimals)
                        ) {
                            return {value: NaN, is_valid: false}; // invalid intermediate value found
                        }
                        else { // valid result -> replace in the sub expression
                            curr_sub_expr = result + slice(curr_sub_expr, foward_step_index + 1, curr_sub_expr.length - 1);
                            break;
                        }
                    }
                }
            }
            
            // the current sub expression is now a single number -> update its value in the array of sub expressions
            expression_sections[section_idx] = curr_sub_expr;
        }

        // now every expression in the expression_sections is a single number (separated by + and - operators)
        let acc = Number(expression_sections[0]);
        for (let section_idx = 2; section_idx < expression_sections.length; section_idx += 2) {
            const current_operator = expression_sections[section_idx - 1].operator;
            const operand = Number(expression_sections[section_idx]);

            if (current_operator === 'a') acc += operand;
            else if (current_operator === 's') acc -= operand;

            // check that conditions are still met
            if (acc < 0 && !allow_negatives) {
                return {value: NaN, is_valid: false}; // negative intermediate value
            }
        }

        //  if this point was reached, the expression is valid and acc is the final value
        return {value: acc, is_valid: true};
    }
}
export default async function genOrdOp(settings) {
    const max_term_size = 10; // max size of any single number in the expression 
    const max_expression_value = 100; // max size (+/- value) of the final expression (when simplified)
    OOH.conversion_table["m"] = (settings.multiply_symbol === ' \\cdot ')? '\\cdot' : '\\times'; // resolve this at the start

    const getNewExpression = function() {
        const raw_template_obj = OOH.buildExpressionTemplate(OOH.buildNewOperationsList(settings), OOH.getNumExponents(settings))
        
        return {
            expression_template: OOH.insertParentheses(raw_template_obj.expression_template, settings),
            operand_list: raw_template_obj.operand_list
        }
    }

    OOH.APH.settings = settings;
    OOH.APH.max_term_size = max_term_size;
    
    // next step is to create all the value assigning functions in APH (based on the settings)
    let value_funcs = {};
    value_funcs.generalRand = OOH.buildValidRandFunc(max_term_size, settings);
    value_funcs.halfSizeRand = OOH.buildValidRandFunc(max_term_size / 2, settings);

    // these are the functions that need to be manually build below (to condense them as much as possible based on settings)
    let exponent, multipleOf, divisorOf, greaterOrEqualTo, lesserOrEqualTo, zeroOneOrTwo; 
    
    // assignment to exponent, greaterOrEqualTo, and lesserOrEqualTo => 2 different implementations
    if (settings.allow_zero === 'yes') {
        exponent = function() {
            const switcher = H.randInt(1, 20);
            if (switcher === 20) return 1; // 5% chance of 1
            else if (switcher === 19) return 0; // 5% chance of 0
            else return H.randFromList([2, 3]); // 90% chance of 2 or 3
        }

        greaterOrEqualTo = function(num, restriction) { // we know this is only called when negatives aren't allowed
            if (num === 0 && restriction === 'non-zero') return H.randInt(1, 5);
            else return num + H.randInt(0, 5)
        }

        lesserOrEqualTo = function(num, restriction) { // we know this is only called when negatives aren't allowed
            if (restriction === 'non-zero' || H.randInt(1, 50) < 49) { 
                if (num >= 1) return H.randFromList(H.integerArray(1, num));
                else return NaN;
            }
            else return 0; // 4% chance of 0 (assuming it's allowed)
        }

        zeroOneOrTwo = function() {
            const switcher = H.randInt(1, 20);
            if (switcher === 20) return 0; // 5%
            else if (switcher === 19) return 1; // 5%
            else return 2; // 90%
        }
    }
    else if (settings.allow_zero === 'no') { // zero NOT allowed by settings
        exponent = function() {
            if (H.randInt(1, 20) === 20) return 1; // 5% chance of 1
            else return H.randFromList([2, 3]); // 95% chance of 2 or 3
        }

        greaterOrEqualTo = function(num, restriction) { // we know this is only called when negatives aren't allowed
            if (num === 0) return H.randInt(1, 5);
            else return num + H.randInt(0, 5)
        }

        lesserOrEqualTo = function(num, restriction) { // we know this is only called when negatives aren't allowed
            if (num >= 1) return H.randFromList(H.integerArray(1, num));
            else return NaN;
        }

        zeroOneOrTwo = function() {
            if (H.randInt(1, 20) === 20) return 1; // 5% one
            else return 2; // 95% 2 
        }
    }

    // assignment to multipleOf => 4 different implementations
    if (settings.allow_negatives === 'yes' && settings.allow_zero === 'yes') {
        multipleOf = function(num) {
            const switcher = H.randInt(1, 50);
            if (switcher === 50) return 0; // 2% chance of 0
            else if (switcher >= 47) return (-1)**H.randInt(0, 1) * num; // 6% chance of +/- num
            else { // 92% chance +/- n*num where 2<= n <=max_term
                const result = (-1)**H.randInt(0, 1) * H.randInt(2, max_term_size) * num;
                return (result <= 100 && result >= -100)? result : NaN; 
            }
        }
    }
    else if (settings.allow_negatives === 'yes' && settings.allow_zero === 'no') {
        multipleOf = function(num) {
            if (H.randInt(1, 50) >= 48) return (-1)**H.randInt(0, 1) * num; // 6% chance of +/- num
            else { // 94% chance +/- n*num where 2<= n <=max_term
                const result = (-1)**H.randInt(0, 1) * H.randInt(2, max_term_size) * num;
                return (result <= 100 && result >= -100)? result : NaN;  
            }
        }
    }
    else if (settings.allow_negatives === 'no' && settings.allow_zero === 'yes') {
        multipleOf = function(num) {
            const switcher = H.randInt(1, 50);
            if (switcher === 50) return 0; // 2% chance of 0
            else if (switcher >= 47) return num; // 6% chance of num
            else { // 92% chance n*num where 2<= n <=max_term
                const result = H.randInt(2, max_term_size) * num;
                return (result <= 100 && result >= -100)? result : NaN;  
            }
        }
    }
    else if (settings.allow_negatives === 'no' && settings.allow_zero === 'no') {
        multipleOf = function(num) {
            if (H.randInt(1, 50) >= 48) num; // 6% chance of num
            else { // 94% chance n*num where 2<= n <=max_term
                const result = H.randInt(2, max_term_size) * num;
                return (result <= 100 && result >= -100)? result : NaN;  
            }
        }
    }

    // assignment to divisorOf => 2 different implementations
    if (settings.allow_negatives === 'yes') {
        divisorOf = function(num) {
            const factor_array = []; // *doesn't include 1, on purpose
            for (let i = Math.abs(num); i > 1; i--) {
                const quotient = num / i;
                if (quotient | 0 === quotient) factor_array.push(i);
            }

            if (H.randInt(1, 20) === 20) return (-1)**H.randInt(0, 1) * 1; // 5% chance of +/- 1
            else {
                if(factor_array.length === 0) return NaN; // no non-1 factors
                return (-1)**H.randInt(0, 1) * H.randFromList(factor_array) // if non-1 factors 95% +/- one of them
            }
        }


    }
    else if (settings.allow_negatives === 'no') {
        divisorOf = function(num) {
            const factor_array = []; // *doesn't include 1, on purpose
            for (let i = Math.abs(num); i > 1; i--) {
                const quotient = num / i;
                if (quotient | 0 === quotient) factor_array.push(i);
            }

            if (H.randInt(1, 20) === 20) return 1; // 5% chance of +/- 1
            else {
                if(factor_array.length === 0) return NaN; // no non-1 factors
                return H.randFromList(factor_array) // if non-1 factors 95% +/- one of them
            }
        }
    }

    // collect the funcs we just assigned into value_funcs, then put them on APH.value
    value_funcs.exponent = exponent;
    value_funcs.multipleOf = multipleOf;
    value_funcs.divisorOf = divisorOf;
    value_funcs.greaterOrEqualTo = greaterOrEqualTo;
    value_funcs.lesserOrEqualTo = lesserOrEqualTo;
    value_funcs.zeroOneOrTwo = zeroOneOrTwo;
    OOH.APH.value = value_funcs;

    // function to check the size of the final expression based on settings
    let validExpressionSize;
    if (settings.allow_negatives === 'yes') {
        validExpressionSize = function(value) {
            return (
                value <= max_expression_value &&
                value >= (-1)*max_expression_value
            );
        }
    }
    else if (settings.allow_negatives === 'no') {
        validExpressionSize = function(value) {
            return (
                value <= max_expression_value &&
                value >= 0 
            );
        }
    }

    // patch to filter expressions that still contain 0 when settings.allow_zero === 'no'
    let followsAllowZeroRule;
    if (settings.allow_zero === 'yes') {
        followsAllowZeroRule = () => true;
    }
    else if (settings.allow_zero === 'no') {
        const mul0 = settings.multiply_symbol.slice(1, -1) + '0';
        followsAllowZeroRule = function(expr_tex_str) {
            if (expr_tex_str.charAt(0) === '0') return false;
            else return ( // try to match '+0', '-0', '[mul_sym]0', or '(0'
                !expr_tex_str.includes('-0') &&
                !expr_tex_str.includes(mul0) &&
                !expr_tex_str.includes('+0') &&
                !expr_tex_str.includes('(0')
            );
        }
    }
    
    // Next step is the solution search
    const attempts_per_template = 100;
    const max_templates = 250;
    const allow_negatives = (settings.allow_negatives === 'yes');
    let sol_found = false;
    let final_template; 
    let final_value = Infinity;
    let total_attempts = 0;
    for (let i = 0; i < max_templates && !sol_found; i++) {
        const raw_expression_obj = getNewExpression();
        const expression_template = raw_expression_obj.expression_template;
        const operand_list = raw_expression_obj.operand_list;
        const AST = OOH.convertToAST(OOH.getReferenceCopy(expression_template));

        for (let j = 0; j < attempts_per_template && !sol_found; j++) {
            total_attempts++;
            OOH.evaluateExpression(AST);
            const expression_tex_string = OOH.templateToMath(JSON.parse(JSON.stringify(expression_template)));
            const validation_result = OOH.validateExprTexString(expression_tex_string, allow_negatives);
            let expression_value = validation_result.value; // integer or NaN
            
            if (validation_result.is_valid && followsAllowZeroRule(expression_tex_string)) {
                if (validExpressionSize(expression_value) && Number.isSafeInteger(expression_value)) { // a completely valid solution was found
                    sol_found = true;
                    final_value = expression_value;
                    final_template = expression_template;
                    break;
                }
                else if (!Number.isNaN(expression_value) && expression_value < final_value && Number.isSafeInteger(expression_value)) { // expression at least has a numerical value that is less than anything we've seen so far
                    final_value = expression_value;
                    final_template = JSON.parse(JSON.stringify(expression_template)); // deep copy of the template when it has all its values filled in
                }
            }

            OOH.clearOperandValues(operand_list); // reset all of the coef's values to null
        }
    }
    // **Extremely** unlikely but theoretically possible if s or d is involved: not a single *integer* was found in the 25,000 trial search
    if (final_template === undefined) {
        if (backup_json === null) backup_json = (await import(`../backup-jsons/bkpOrdOp.js`)).default;
        final_template = JSON.parse(JSON.stringify(backup_json[`${settings.add_count}${settings.subtract_count}${settings.multiply_count}${settings.divide_count}${settings.exponent_count}`]));
        final_value = OOH.validateExprTexString(OOH.templateToMath(JSON.parse(JSON.stringify(final_template)))).value;
    }

    // break off the parens around the base expression if they exist (only case when they wouldn't is a single exponential)
    let final_prompt = OOH.templateToMath(JSON.parse(JSON.stringify(final_template)));
    if (final_prompt.charAt(0) === '(' && final_prompt.charAt(final_prompt.length - 1) === ')') final_prompt = final_prompt.slice(1, -1);

    return {
        question: final_prompt,
        answer: final_value
    }
}

export const settings_fields = [
    'allow_negatives',
    'operation_counts',
    'allow_parentheses',
    'allow_nesting',    
    'allow_zero',
    'multiply_symbol'
];

export const prelocked_settings = [
    'allow_negatives',
    'multiply_symbol',
    'allow_nesting'
];

export function get_presets() {
    return {
        allow_negatives: 'no',
        add_count: 1,
        subtract_count: 1,
        multiply_count: 1,
        divide_count: 1,
        exponent_count: 1,
        allow_parentheses: 'yes',
        allow_nesting: 'no',
        allow_zero: 'no',
        multiply_symbol: ' \\times ' 
    };
}

export function get_rand_settings() {
    const counts = [1,1,1,1,1]; // all counts are 1 to start
    const two_count_index = H.randInt(0, 4); // pick a count to bump to 2
    const zero_count_index = H.randIntExcept(0, 4, two_count_index); // pick a different count to bump to 0
    counts[two_count_index]++;
    counts[zero_count_index]--;
    
    return {
        add_count: counts[0],
        subtract_count: counts[1],
        multiply_count: counts[2],
        divide_count: counts[3],
        exponent_count: counts[4],
        allow_negatives: '__random__',
        allow_parentheses: '__random__',
        allow_nesting: '__random__',
        allow_zero: '__random__',
        multiply_symbol: '__random__' 
    };
}

export const size_adjustments = {
    width: 1.12
};