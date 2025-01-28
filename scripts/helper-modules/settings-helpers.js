export function val_term_number(number_of_terms,error_locations) {
    if (number_of_terms === '') {
        number_of_terms = 2;
        error_locations.push('number_of_terms');
    } // Number of terms has no input value
    else number_of_terms = Number(number_of_terms);

    if (Number.isNaN(number_of_terms)) {
        number_of_terms = 2;
        error_locations.push('number_of_terms');
    } // number of terms is not a number (can't be converted to a number)
    else if (number_of_terms > 10) {
        number_of_terms = 10;
        error_locations.push('number_of_terms');
    } // Number of terms exceeds the max of the range
    else if (number_of_terms < 2) {
        number_of_terms = 2;
        error_locations.push('number_of_terms');
    } // Number of terms is below the mix of the range
    else if (number_of_terms >= 2 && number_of_terms <= 10) {
        if (!Number.isInteger(number_of_terms)) {
            number_of_terms = Math.floor(Math.abs(number_of_terms));
            error_locations.push('number_of_terms');
        }
    } // number of terms is in the correct range but isn't an integer

    return number_of_terms;
}

export function val_min_max_range(term_range_min,term_range_max,error_locations) {
    term_range_min = Number(term_range_min);
    term_range_max = Number(term_range_max);
    if (Number.isNaN(term_range_min) && Number.isNaN(term_range_max)) { // After this, term range min and max must be numbers
        term_range_min = -10;
        term_range_max = 10;
        error_locations.push('term_range_min','term_range_max');
    }
    else if (Number.isNaN(term_range_min)) {
        term_range_min  = -10;
        error_locations.push('term_range_min');
    }
    else if (Number.isNaN(term_range_max)) {
        term_range_max = 10;
        error_locations.push('term_range_max');
    }

    if (!Number.isInteger(term_range_min)) { // After this, term range min and max must be integers
        term_range_min = Math.floor(term_range_min);
        error_locations.push('term_range_min');
    }
    if (!Number.isInteger(term_range_max)) {
        term_range_max = Math.floor(term_range_max);
        error_locations.push('term_range_max');
    }

    if (term_range_min < -999) { // After this |term range max/min| <= 999 (as stated in the tooltip requirement)
        term_range_min = -999;
        error_locations.push('term_range_min');
    }
    else if (term_range_min > 999) {
        term_range_min = 999;
        error_locations.push('term_range_min');
    }
    if (term_range_max > 999) {
        term_range_max = 999;
        error_locations.push('term_range_max');
    }
    else if (term_range_max < -999) {
        term_range_max = -999;
        error_locations.push('term_range_max');
    }

    if (term_range_min > term_range_max) { // After this, (term range min) <= (term range max)
        let temp = term_range_min;
        term_range_min = term_range_max;
        term_range_max = temp;
        error_locations.push('term_range_min','term_range_max');
    }
    if (term_range_min === 0 && term_range_max ===0) {
        term_range_min = -10;
        term_range_max = 10;
        error_locations.push('term_range_min','term_range_max');
    }

    return {
        term_range_min: term_range_min,
        term_range_max: term_range_max
    };
}