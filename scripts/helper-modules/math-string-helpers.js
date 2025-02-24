export function middle_const(a) { // a constant term in the middle of an expression
    if (a > 0) a = '+' + a;

    return a + '';
}

export function start_frac(a, b) { // assumes the fraction is non-zero, non-undefined, and reduced
    if (a < 0) return '-\\frac{' + (-1)*a + '}{' + b + '}';
    return '\\frac{' + a + '}{' + b + '}';
}

export function middle_frac(a, b) {
    if (a < 0) return '-\\frac{' + (-1)*a + '}{' + b + '}';
    return '+\\frac{' + a + '}{' + b + '}';
}

export function start_var(a) { // a variable term at the start of an expression
    if (a === 1) a = '';
    else if (a === -1) a = '-';

    return a + ''; 
}

export function middle_var(a) { // a variable term in the middle of an expression
    if (a === 1) a = '+';
    else if (a === -1) a  = '-';
    else if (a > 0) a = '+' + a;

    return a + '';
}

export function start_denom(a, numer_expression) { // an expression with a numerical denom like x/a or sin(x)/a
    let k = ''; // this is what will be in front of the frac (like k(x/a))
    if (a < 0) { 
        a = (-1)*a;
        k = '-'
    }

    return k + '\\frac{' + numer_expression + '}{' + a + '}';
}

export function middle_denom(a, numer_expression) {
    let k; // this is what will be in front of the frac (like k(x/a))
    if (a < 0) { 
        a = (-1)*a;
        k = '-'
    }
    else k = '+';

    return k + '\\frac{' + numer_expression + '}{' + a + '}';
}

export function fraction(numer_expression, denom_expression) { // general function to create a fraction when the numer and den are already cleaned
    return '\\frac{' + numer_expression + '}{' + denom_expression + '}';
}