export function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randFromList(array) {
    return array[Math.floor(Math.random() * array.length)];
}

export function integerArray(min, max) {
    let result = [];
    for (let i = min; i <= max; i++) {
        result.push(i);
    }
    return result;
}

export function removeFromArray(elementsToRemove, array) {
    // Convert single number input to an array
    if (!Array.isArray(elementsToRemove)) {
        elementsToRemove = [elementsToRemove];
    }

    return array.filter(item => !elementsToRemove.includes(item));
}

export function arrayOfRandsFromList(array, length) {
    let result = [];
    for (let i = 0; i < length; i++) {
        result.push(array[Math.floor(Math.random() * array.length)]);
    }
    return result;
}

export function randomizeList(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function nonPerfectSquares(integerLimit) {
    if (integerLimit < 1 || !Number.isInteger(integerLimit)) {
        throw new Error("Input must be a positive integer.");
    }

    const result = [];
    const perfectSquares = new Set();

    for (let i = 1; i * i <= integerLimit; i++) {
        perfectSquares.add(i * i);
    }

    for (let num = 1; num <= integerLimit; num++) {
        if (!perfectSquares.has(num)) {
            result.push(num);
        }
    }

    return result;
}

export function randIntExcept(min, max, excluded_value) {
    const rand = function(min, max) {return Math.floor(Math.random() * (max - min + 1)) + min;}

    const initial_rand = rand(min, max);

    if (initial_rand !== excluded_value) return initial_rand;
    else {
        if (min === max) {
            return excluded_value; // *fail silently* (is actually preferrable for the gens, because we don't want an error, and this is checked elsewhere)
        }

        return ((initial_rand - min + rand(1, max - min)) % (max - min + 1)) + min;
    }
}

export function buildNewRounder(places, keep_rounded_zeros) {
    let remove_trailing_zeros;
    if (keep_rounded_zeros === undefined) remove_trailing_zeros = true;
    else remove_trailing_zeros = !keep_rounded_zeros;
    
    return function round(number) {
        const is_negative = String(number).charAt(0) === '-';
        if (is_negative && typeof(number) === 'number') number = -number;
        else if (is_negative && typeof(number) === 'string') number = number.slice(1);
        
        let number_as_string = number.toString();
        if (!number_as_string.includes('.')) return number; // no decimal places at all
        else if (places === 0) return Math.round(number); // no need for extra logic

        let [before_decimal, after_decimal] = number_as_string.split('.');

        // get an array representing the number
        const decimal_place_array = Array.from(after_decimal).map(numerical_char => Number(numerical_char)).slice(0, places);
        const integer_place_array = Array.from(before_decimal).map(numerical_char => Number(numerical_char));
        const number_as_array = [...integer_place_array, '.', ...decimal_place_array];

        // rounding step (if needed)
        let first_cut_place = Number(after_decimal.charAt(places)); // the first number outside the provided limit (like 4 in 1.234 rounded to 2 places)
        let carry_a_one = (first_cut_place >= 5); // number we are carrying back to the previous place 

        for (let i = number_as_array.length - 1; i >= 0; i--) {
            if (!carry_a_one) break;
            if (number_as_array[i] === '.') continue;
            number_as_array[i]++;
            carry_a_one = false;

            if (number_as_array[i] === 10) {
                carry_a_one = true;
                number_as_array[i] = 0;
            }
        }
        if (carry_a_one) { // the very first integer place got bumped up to a 10 -> 0 (need to add a 1 up front)
            number_as_array.unshift(1);
        }

        const rounded_result = ((is_negative)? '-' : '') + number_as_array.join('');

        if (remove_trailing_zeros) return Number(rounded_result); // Number() removes trailing zeros
        else return rounded_result;
    }
}