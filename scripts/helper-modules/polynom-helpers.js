export function isFactorable(convertedTemplate,convertedFTemplate) {
    const simplifiedFTemplate = convertedFTemplate.slice(1, -1);

    if (convertedTemplate === simplifiedFTemplate) return false;
    else return true;
} //Takes a trinomial (or binomial) and its factored form (both in math notation) and determines whether or not it was factorable. Outputs -> true or false

export function expandBinomials(factors) {
    // Initialize the coefficients array for the polynomial "1" (represents 1x^0)
    let coefficients = [1]; // This starts as 1

    // Iterate over each factor (x - ai)
    factors.forEach(factor => {
        // Create the current factor's coefficients, [1, -factor] for (x - factor)
        const currentFactor = [1, -factor];
        
        // Create a new coefficients array for the result of multiplying
        const newCoefficients = new Array(coefficients.length + 1).fill(0);

        // Multiply the current polynomial by the new factor
        for (let i = 0; i < coefficients.length; i++) {
            newCoefficients[i] += coefficients[i]; // Contribution from the "x^n" term
            newCoefficients[i + 1] += coefficients[i] * currentFactor[1]; // Contribution from the "-a" term
        }

        // Update coefficients to the result of this multiplication
        coefficients = newCoefficients;
    });

    return coefficients;
} // Takes binomial factors in an array and returns their polynomial expansion in decreasing powers of X

export function polyTemplateToMath(coefArray) {
    const Degree = (coefArray.length - 1); // Degree of the polynomial
    let polynom = '';

    for (let i = Degree; i >= 2; i--) {
        if (coefArray[Degree - i] === 0) {} 
        else if (coefArray[Degree - i] === -1) {
            polynom = polynom + '-x^{' + i + '}';
        }
        else if ((coefArray[Degree - i] === 1) && (polynom !== '')) {
            polynom = polynom + '+x^{' + i + '}';
        }
        else if (coefArray[Degree - i] === 1) {
            polynom = polynom + 'x^{' + i + '}';
        }
        else if ((coefArray[Degree - i] > 0) && (polynom !== '')) {
            polynom = polynom + '+' + coefArray[Degree - i] + 'x^{' + i + '}';
        }
        else {
            polynom = polynom + coefArray[Degree - i] + 'x^{' + i + '}';
        }
    } // Handles everything between the first term and x^2
    
    if (coefArray[coefArray.length - 2] === 0) {}
    else if (coefArray[coefArray.length - 2] === -1) {
        polynom = polynom + '-x';
    }
    else if ((coefArray[coefArray.length - 2] === 1) && (polynom !== '')) {
        polynom = polynom + '+x';
    }
    else if (coefArray[coefArray.length - 2] === 1) {
        polynom = polynom + 'x';
    }
    else if ((coefArray[coefArray.length - 2] > 0) && (polynom !== '')) {
        polynom = polynom + '+' + coefArray[coefArray.length - 2] + 'x';
    }
    else {
        polynom = polynom + coefArray[coefArray.length - 2] + 'x';
    } // x^1 case
    
    if (coefArray[coefArray.length - 1] === 0) {}
    else if ((coefArray[coefArray.length - 1] > 0) && (polynom !== '')) {
        polynom = polynom + '+' + coefArray[coefArray.length - 1];
    }
    else {
        polynom = polynom + coefArray[coefArray.length - 1];
    } // x^0 case


    if (coefArray.length === 1) {
        polynom = coefArray[0] + '';
    }

    return polynom;
} // Given the coefficients of a polynomial, put it in math notation: ax^n + bx^n-1 + ...

export function dividePolynomial(coefArray, factor) {
    const quotientArray = [coefArray[0]]; // Initialize with the first coefficient

    for (let i = 1; i < coefArray.length; i++) {
        quotientArray.push(quotientArray[i - 1] * factor + coefArray[i]);
    }

    return {
        quotient: quotientArray.slice(0, -1), // All except the last value
        remainder: quotientArray[quotientArray.length - 1], // The last value
    };
} // Divide a polynomial with the given coefficients by the given factor; return the coefficients of the quotient polynomial

export function multiplyArray(array, factor) {
    return array.map(num => num * factor);
} // Multiply each entry of the array by the given factor

export function GCF(a, b, c = null) {
    const gcdTwoNumbers = (x, y) => {
        while (y !== 0) {
            [x, y] = [y, x % y];
        }
        return x;
    };

    if (c === null) {
        // Only two arguments provided
        return gcdTwoNumbers(a, b);
    } else {
        // Three arguments: GCF(a, b, c) = GCF(GCF(a, b), c)
        return gcdTwoNumbers(gcdTwoNumbers(a, b), c);
    }
} //returns the gcf of the arguments, can take two or three

export function factorBinomial(...coefficients) {
    // Compute the GCF of all coefficients
    const G = coefficients.reduce((gcf, coeff) => GCF(gcf, Math.abs(coeff)), Math.abs(coefficients[0]));

    // Normalize coefficients by dividing by G or -G
    const normalizedCoefficients = coefficients.map(coeff => coeff / G);

    // Check the sign of the first coefficient and adjust G if negative
    if (normalizedCoefficients[0] < 0) {
        return [-G, ...normalizedCoefficients.map(coeff => -coeff)];
    }

    return [G, ...normalizedCoefficients];
}

export function factoredFormTemplate(template) {
    const a = (template[0] * template[2]);
    const b = (-1) * (template[0] * template[3] + template[1] * template[2]);
    const c = (template[1] * template[3]);
    let m = template[0];
    let n = template[1];
    let r = template[2];
    let t = template[3];
    let G,P,Q,R,T;

    if ((a !== 0) && (b !== 0) && (c !== 0)) {
        let factoredArrayLeft = factorBinomial(m,n);
        P = factoredArrayLeft[1];
        Q = ((-1) * factoredArrayLeft[2]);

        let factoredArrayRight = factorBinomial(r,t);
        R = factoredArrayRight[1];
        T = ((-1) * factoredArrayRight[2]);

        G = (factoredArrayLeft[0] * factoredArrayRight[0]);

        if ((P === R) && (Q === T)) return [G,P,Q,'A2'];
        else return [G,P,Q,R,T,'A1'];
    } // A1 = G(Px + Q)(Rx + T) or  A2 = G(Px + Q)^2
    else if((a === 0) && (b !== 0) && (c !== 0)) {
        let factoredArray = factorBinomial(r,(-1) * t);
        P = factoredArray[1];
        Q = factoredArray[2];

        G = ((-1) * n * factoredArray[0]);

        return [G,P,Q,'B'];
    } // B = G(Px + Q)
    else if ((a !== 0) && (b === 0) && (c !== 0)) {
        let factoredArray = factorBinomial((m * r),(n * t));
        P = factoredArray[1];
        Q = factoredArray[2];
        
        G = factoredArray[0];

        if (
            (Q < 0) &&
            (Math.sqrt(P) === Math.floor(Math.sqrt(P))) &&
            (Math.sqrt((-1) * Q) === Math.floor(Math.sqrt((-1) * Q)))
        ) {
            P = Math.sqrt(P);
            Q = Math.sqrt((-1) * Q);

            return [G,P,Q,'C2'];
        }
        else return [G,P,Q,'C1'];
    } // C1 = G(Px^2 + Q) or C2 = G(Px + Q)(Px - Q)
    else if ((a !== 0) && (b !== 0) && (c === 0)) {
        if (t === 0) {
            let factoredArray = factorBinomial(m,(-1) * n);
            P = factoredArray[1];
            Q = factoredArray[2];

            G = (r * factoredArray[0]);

            return [G,P,Q,'D'];
        }
        else if (n === 0) {
            let factoredArray = factorBinomial(r,(-1) * t);
            P = factoredArray[1];
            Q = factoredArray[2];

            G = (m * factoredArray[0]);

            return [G,P,Q,'D'];
        }
    } // D = Gx(Px + Q)
    else if ((a !== 0) && (b === 0) && (c === 0)) {
        return ['x^2'];
    } // NOTE: these are a hackfix for rational sum generation and WON'T work in general
    else if ((a === 0) && (b !== 0) && (c === 0)) {
        return ['x'];
    }
} // Built for facQuads and extended to ratEx but WON'T work in general

export function convertFactoredToMath(factoredTemplate) {
    let G = factoredTemplate[0] + '';
    let P = factoredTemplate[1] + 'x';
    let Q = factoredTemplate[2] + '';
    let R = factoredTemplate[3] + 'x';
    let T = factoredTemplate[4] + '';
    let form = factoredTemplate[factoredTemplate.length - 1];

    if (form === 'x^2') {
        return 'x^2';
    }
    else if (form === 'x') {
        return 'x';
    }

    if (G === '1') G = ''
    else if (G === '-1') G = '-'

    if (form === 'A1') {
        if (P === '1x') P = 'x'

        if (Q.charAt(0) !== '-') Q = '+' + Q

        if (R === '1x') R = 'x'

        if (T.charAt(0) !== '-') T = '+' + T

        return (G + '(' + P + Q + ')' + '(' + R + T + ')');
    }
    else if (form === 'A2') {
        if (P === '1x') P = 'x'

        if (Q.charAt(0) !== '-') Q = '+' + Q

        return (G + '(' + P + Q + ')^2');
    }
    else if (form === 'B') {
        if (P === '1x') P = 'x'

        if (Q.charAt(0) !== '-') Q = '+' + Q

        return (G + '(' + P + Q + ')');
    }
    else if (form === 'C1') {
        if (P === '1x') P = 'x^2'
        else P = factoredTemplate[1] + 'x^2'

        if (Q.charAt(0) !== '-') Q = '+' + Q

        return (G + '(' + P + Q + ')');
    }
    else if (form === 'C2') {
        if (P === '1x') P = 'x'

        return (G + '(' + P + '+' + Q + ')' + '(' + P + ((-1) * Q) + ')');
    }
    else if (form === 'D') {
        if (P === '1x') P = 'x'
        
        if (Q.charAt(0) !== '-') Q = '+' + Q

        return (G + 'x' + '(' + P + Q + ')');
    }
} //Takes a factored template and puts it in proper math notation (Built for facQuads and extended to ratEx but WON'T work in general)

export function simplifyFraction(numer, denom) {
    // Get the greatest common divisor (GCD) using the Euclidean algorithm
    function gcd(a, b) {
        return b === 0 ? Math.abs(a) : gcd(b, a % b);
    }

    // Calculate the GCD of the numerator and denominator
    const divisor = gcd(numer, denom);

    // Simplify the numerator and denominator
    let simplifiedNumer = numer / divisor;
    let simplifiedDenom = denom / divisor;

    // Ensure the denominator is positive
    if (simplifiedDenom < 0) {
        simplifiedNumer = -simplifiedNumer;
        simplifiedDenom = -simplifiedDenom;
    }

    return {
        numer: simplifiedNumer,
        denom: simplifiedDenom,
    };
}

export function remainderDivision(a, b) {
    let q = Math.floor(a / b);
    let r = a - b * q;
    if (r < 0) {
        q += 1;
        r = a - b * q;
    }
    return { quotient: q, remainder: r };
} // returns the quotient and remainder of a division of positive or negative integers

export function addPolynomials(p1, p2) {
    // Determine the lengths of the input arrays
    const maxLength = Math.max(p1.length, p2.length);
  
    // Pad the shorter array with zeros at the start
    const padZeros = (arr, numZeros) => Array(numZeros).fill(0).concat(arr);
    const p1Padded = padZeros(p1, maxLength - p1.length);
    const p2Padded = padZeros(p2, maxLength - p2.length);
  
    // Add the corresponding coefficients
    const result = [];
    for (let i = 0; i < maxLength; i++) {
      result.push(p1Padded[i] + p2Padded[i]);
    }
  
    // Remove leading zeros
    function removeLeadingZeros(arr) {
        let index = 0;
        while (index < arr.length - 1 && arr[index] === 0) {
          index++;
        }
        return arr.slice(index);
    }
    const trimmedResult = removeLeadingZeros(result);
  
    // Handle the case where all coefficients are zero
    return trimmedResult.length > 0 ? trimmedResult : [0];
}
  
export function multiplyPolynomials(p1, p2) {
    // The degree of the product polynomial
    const resultLength = p1.length + p2.length - 1;
    const result = Array(resultLength).fill(0);
  
    // Multiply and accumulate the products
    for (let i = 0; i < p1.length; i++) {
      for (let j = 0; j < p2.length; j++) {
        result[i + j] += p1[i] * p2[j];
      }
    }
  
    // Remove leading zeros
    function removeLeadingZeros(arr) {
        let index = 0;
        while (index < arr.length - 1 && arr[index] === 0) {
          index++;
        }
        return arr.slice(index);
    }
    const trimmedResult = removeLeadingZeros(result);
  
    // Handle the case where all coefficients are zero
    return trimmedResult.length > 0 ? trimmedResult : [0];
}

export function longDivision(p1, p2) {
    // Condition (b): Ensure degree of p2 <= degree of p1
    if (p2.length > p1.length) {
        console.error("Error: The degree of the divisor (p2) must be less than or equal to the degree of the dividend (p1).");
        return null;
    }

    // Condition (a): Ensure p1 is exactly divisible by p2 (no remainder)
    const deg1 = p1.length - 1;
    const deg2 = p2.length - 1;
    const quotient = Array(deg1 - deg2 + 1).fill(0);
    let remainder = [...p1];

    for (let i = 0; i <= deg1 - deg2; i++) {
        let coeff = remainder[i] / p2[0];
        quotient[i] = coeff;

        for (let j = 0; j <= deg2; j++) {
            remainder[i + j] -= coeff * p2[j];
        }
    }

    // Check if remainder is all zeros
    if (!remainder.slice(deg1 - deg2 + 1).every(coef => coef === 0)) {
        console.error("Error: The division does not result in a polynomial with no remainder.");
        return null;
    }

    return quotient;
}

export function evaluatePolynomial(p1, value) {
    let result = 0;
    let power = 1; // Tracks value^i

    for (let i = p1.length - 1; i >= 0; i--) {
        result += p1[i] * power;
        power *= value;
    }

    return result;
}

export function keepCoprimesFromList(number, array) {
    return array.filter(num => factorBinomial([number, num])[0] === 1);
} // if you picked one factor (a) in ax-b, this is used to ensure nothing factors out of ax-b (assuming a>0)

export function permutationsFromLists(array1, array2) {
    let permutationArray = [];
    // helper function
    function removeFromArray(elementsToRemove, array) {
        // Convert single number input to an array
        if (!Array.isArray(elementsToRemove)) {
            elementsToRemove = [elementsToRemove];
        }
    
        return array.filter(item => !elementsToRemove.includes(item));
    }


    // for an element in array1, pair it with every element in array2, then repeat for every element in array1
    for (let i = 0; i < array1.length; i++) {
        for (let j = 0; j < array2.length; j++) {
            permutationArray.push([array1[i], array2[j]]);
        }
    }

    // remove common elements between array1 and array2
    array1 = removeFromArray(array2, array1);

    // for an element in array2, pair it with every element in array1, then repeats for every element in array2
    for (let i = 0; i < array2.length; i++) {
        for (let j = 0; j < array1.length; j++) {
            permutationArray.push([array2[i], array1[j]]);
        }
    }

    return permutationArray;
}
