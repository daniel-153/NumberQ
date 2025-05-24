export function val_term_number(number_of_terms, error_locations, max_number_of_terms = 10, input_name = 'number_of_terms') {
    if (number_of_terms === '') {
        number_of_terms = 2;
        error_locations.add(input_name);
    } // Number of terms has no input value
    else number_of_terms = Number(number_of_terms);

    if (Number.isNaN(number_of_terms)) {
        number_of_terms = 2;
        error_locations.add(input_name);
    } // number of terms is not a number (can't be converted to a number)
    else if (number_of_terms > max_number_of_terms) {
        number_of_terms = max_number_of_terms;
        error_locations.add(input_name);
    } // Number of terms exceeds the max of the range
    else if (number_of_terms < 2) {
        number_of_terms = 2;
        error_locations.add(input_name);
    } // Number of terms is below the min of the range
    else if (number_of_terms >= 2 && number_of_terms <= max_number_of_terms) {
        if (!Number.isInteger(number_of_terms)) {
            number_of_terms = Math.floor(Math.abs(number_of_terms));
            error_locations.add(input_name);
        }
    } // number of terms is in the correct range but isn't an integer

    return number_of_terms;
} // built for validating number_of_terms, but can be used to val any text input looking for a positive int if you specify last two params

export function val_min_max_range(
    term_range_min,
    term_range_max,
    error_locations,
    min_input_name = 'term_range_min', 
    max_input_name = 'term_range_max') {

    term_range_min = Number(term_range_min);
    term_range_max = Number(term_range_max);
    if (Number.isNaN(term_range_min) && Number.isNaN(term_range_max)) { // After this, term range min and max must be numbers
        term_range_min = -10;
        term_range_max = 10;
        error_locations.add(min_input_name).add(max_input_name);
    }
    else if (Number.isNaN(term_range_min)) {
        term_range_min  = -10;
        error_locations.add(min_input_name);
    }
    else if (Number.isNaN(term_range_max)) {
        term_range_max = 10;
        error_locations.add(max_input_name);
    }

    if (!Number.isInteger(term_range_min)) { // After this, term range min and max must be integers
        term_range_min = Math.floor(term_range_min);
        error_locations.add(min_input_name);
    }
    if (!Number.isInteger(term_range_max)) {
        term_range_max = Math.floor(term_range_max);
        error_locations.add(max_input_name);
    }

    if (term_range_min < -999) { // After this |term range max/min| <= 999 (as stated in the tooltip requirement)
        term_range_min = -999;
        error_locations.add(min_input_name);
    }
    else if (term_range_min > 999) {
        term_range_min = 999;
        error_locations.add(min_input_name);
    }
    if (term_range_max > 999) {
        term_range_max = 999;
        error_locations.add(max_input_name);
    }
    else if (term_range_max < -999) {
        term_range_max = -999;
        error_locations.add(max_input_name);
    }

    if (term_range_min > term_range_max) { // After this, (term range min) <= (term range max)
        let temp = term_range_min;
        term_range_min = term_range_max;
        term_range_max = temp;
        error_locations.add(min_input_name).add(max_input_name);
    }
    if (term_range_min === 0 && term_range_max ===0) {
        term_range_min = -10;
        term_range_max = 10;
        error_locations.add(min_input_name).add(max_input_name);
    }

    return {
        term_range_min: term_range_min,
        term_range_max: term_range_max
    };
}

export function val_root_number(root_number, error_locations) {
    root_number = val_term_number(root_number, error_locations, 10, 'root_number'); // after this, root_number must be a positive integer

    if (Math.sqrt(root_number) === Math.floor(Math.sqrt(root_number))) { // after this, root_number must NOT be a perfect square
        root_number = root_number + 1;
        error_locations.add('root_number');
    }

    return root_number;
}

export function val_restricted_integer(input_value, error_locations, min_value, max_value, input_field_name) {
    if (input_value === '') {
        input_value = min_value;
        error_locations.add(input_field_name);
    } // Number of terms has no input value
    else input_value = Number(input_value);

    if (Number.isNaN(input_value)) {
        input_value = min_value;
        error_locations.add(input_field_name);
    } // number of terms is not a number (can't be converted to a number)
    else if (input_value > max_value) {
        input_value = max_value;
        error_locations.add(input_field_name);
    } // Number of terms exceeds the max of the range
    else if (input_value < min_value) {
        input_value = min_value;
        error_locations.add(input_field_name);
    } // Number of terms is below the min of the range
    else if (input_value >= min_value && input_value <= max_value) {
        if (!Number.isInteger(input_value)) {
            input_value = Math.floor(Math.abs(input_value));
            error_locations.add(input_field_name);
        }
    } // number of terms is in the correct range but isn't an integer

    return input_value;
} // generalized version of val_term_number (can validate any single textbox looking for an integer within a specified range)

export function val_variable_letter(input_value, error_locations) {
    if (typeof input_value !== 'string' || input_value.length !== 1 || !/^[a-zA-Z]$/.test(input_value)) {
        error_locations.add('variable_letter');
        return 'x'; // Return 'x' if input is invalid
    }
    return input_value; // Return the valid letter
} // validate an input that is suppose to be a capital or lowercase alphabet letter

export function val_restricted_range(
    input_min, 
    input_max, 
    min_allowed_value, 
    max_allowed_value, 
    error_locations,
    min_input_name = 'range_min', 
    max_input_name = 'range_max') {
    
    // after this, input_min must be a valid integer between min and max (inclusive)
    input_min = val_restricted_integer(input_min, error_locations, min_allowed_value, max_allowed_value, min_input_name);

    // after this, input_max must be a valid integer betwen min and max (inclusive)
    input_max = val_restricted_integer(input_max, error_locations, min_allowed_value, max_allowed_value, max_input_name);

    // now the only issue could be that min > max
    if (input_min > input_max) { // if so, swap them
        error_locations.add(min_input_name).add(max_input_name);

        let temp = input_min;
        input_min = input_max;
        input_max = temp;
    }

    return {input_min, input_max};
}