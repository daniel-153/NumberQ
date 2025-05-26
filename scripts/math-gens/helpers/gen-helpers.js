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