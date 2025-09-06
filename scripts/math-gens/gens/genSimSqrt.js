import * as H from '../helpers/gen-helpers.js';
import * as PH from '../helpers/polynom-helpers.js';

export function validateSettings(form_obj, error_locations) {}

const SRH = {
    pm: (sign) => (sign === -1)? '-' : '+',
    squareFreeIntList: function(limit) {
        const result = [];
        for (let i = 2; i <= limit; i++) {
            let isSquareFree = true;
            for (let j = 2; j * j <= i; j++) {
            if (i % (j * j) === 0) {
                isSquareFree = false;
                break;
            }
            }
            if (isSquareFree) result.push(i);
        }

        return result;
    },
    squareFreeRand: function(limit) {
        return H.randFromList(SRH.squareFreeIntList(limit));
    },
    forms: {
        basic: {
            basic_1: {
                select: (allow_negatives) => {
                    let irred_radic, square_part;
                    if (H.randInt(1, 13) === 13) {
                        irred_radic = 1;
                        square_part = H.randInt(1, 12)**2;
                    }
                    else {
                        if (H.randInt(0, 1)) {
                            irred_radic = SRH.squareFreeRand(11);

                            if (irred_radic === 11) square_part = H.randInt(2, 3)**2;
                            else if (irred_radic === 6 || irred_radic === 7) square_part = H.randInt(2, 5)**2;
                            else square_part = H.randInt(2, 6)**2;
                        }
                        else {
                            square_part = H.randInt(2, 6)**2;

                            if (square_part === 36) {
                                irred_radic = H.randFromList([2,3,5,10]);
                            }
                            else if (square_part === 16 || square_part === 25) {
                                irred_radic = SRH.squareFreeRand(10);
                            }
                            else irred_radic = SRH.squareFreeRand(11);
                        }
                    }

                    return {
                        a: square_part*irred_radic
                    };
                },
                create: (a) => ({
                    prompt_str: `\\sqrt{${a}}`,
                    ans_num_int: 0,
                    ans_num_radics: [[1, a]],
                    ans_den: 1
                })
            },
            basic_2: {
                select: (allow_negatives) => {
                    let front_number = H.randInt(2, 5);
                    if (allow_negatives) front_number *= (-1)**H.randInt(0, 1);

                    let irred_radic, square_part;
                    if (H.randInt(1, 13) === 13) {
                        irred_radic = 1;
                        square_part = H.randInt(1, 12)**2;
                    }
                    else {
                        if (H.randInt(0, 1)) {
                            irred_radic = SRH.squareFreeRand(11);

                            if (irred_radic === 11) square_part = H.randInt(2, 3)**2;
                            else if (irred_radic === 6 || irred_radic === 7) square_part = H.randInt(2, 5)**2;
                            else square_part = H.randInt(2, 6)**2;
                        }
                        else {
                            square_part = H.randInt(2, 6)**2;

                            if (square_part === 36) {
                                irred_radic = H.randFromList([2,3,5,10]);
                            }
                            else if (square_part === 16 || square_part === 25) {
                                irred_radic = SRH.squareFreeRand(10);
                            }
                            else irred_radic = SRH.squareFreeRand(11);
                        }
                    }

                    return {
                        a: front_number,
                        b: square_part*irred_radic
                    }
                },
                create: (a,b) => ({
                    prompt_str: `${a}\\sqrt{${b}}`,
                    ans_num_int: 0,
                    ans_num_radics: [[a, b]],
                    ans_den: 1
                })
            },
            basic_3: {
                select: (allow_negatives) => {
                    let a_base, b_base;
                    const non_square_list = SRH.squareFreeIntList(7);
                    if (H.randInt(0, 1)) {
                        a_base = H.randFromList(non_square_list);
                        non_square_list.splice(non_square_list.indexOf(a_base), 1);
                        
                        b_base = H.randFromList(non_square_list);
                    }
                    else {
                        b_base = H.randFromList(non_square_list);
                        non_square_list.splice(non_square_list.indexOf(b_base), 1);
                        
                        a_base = H.randFromList(non_square_list);
                    }

                    if (H.randInt(1, 5) === 5) b_base = a_base;


                    if (H.randInt(0, 1)) {
                        const potential_factors = [];            
                        H.integerArray(2, 6).map(val => val**2).forEach(square => {
                            if (a_base * b_base * square <= 100) {
                                potential_factors.push(square);
                            }
                        });

                        if (potential_factors.length >= 1) {
                            const chosen_square_factor = H.randFromList(potential_factors);

                            const switcher = H.randInt(0, 2);
                            if (switcher === 0) { // a_base recieves factor
                                a_base *= chosen_square_factor;
                            }
                            else if (switcher === 1) { // b_base recieves factor
                                b_base *= chosen_square_factor;
                            }
                            else { // factor is split between a_base and b_base
                                const root = Math.sqrt(chosen_square_factor);
                                a_base *= root;
                                b_base *= root;
                            }
                        } 
                    }

                    return {
                        a: a_base,
                        b: b_base
                    }
                },
                create: (a,b) => ({
                    prompt_str: `\\sqrt{${a}} \\cdot \\sqrt{${b}}`,
                    ans_num_int: 0,
                    ans_num_radics: [[1, a*b]],
                    ans_den: 1
                })
            },
            basic_4: {
                select: (allow_negatives) => {
                    let pm0 = 1;
                    if (allow_negatives) pm0 *= (-1)**H.randInt(0, 1);

                    const radicand = SRH.squareFreeRand(10);
                    const possible_squares = H.integerArray(1, 5).map(val => val**2);
                    let a_square, b_square;
                    if (H.randInt(0, 1)) {
                        a_square = H.randFromList(possible_squares);
                        possible_squares.splice(possible_squares.indexOf(a_square), 1);
                        b_square = H.randFromList(possible_squares);
                    }
                    else {
                        b_square = H.randFromList(possible_squares);
                        possible_squares.splice(possible_squares.indexOf(b_square), 1);
                        a_square = H.randFromList(possible_squares);
                    }

                    return {
                        a: a_square * radicand,
                        b: b_square * radicand,
                        pm0: pm0
                    }
                },
                create: (a,b, ...pm) => ({
                    prompt_str: `\\sqrt{${a}} ${SRH.pm(pm[0])} \\sqrt{${b}}`,
                    ans_num_int: 0,
                    ans_num_radics: [[1, a], [pm[0], b]],
                    ans_den: 1
                })
            }
        },
        begin: {
            begin_1: {
                select: (allow_negatives) => {
                    let numer = H.randInt(2, 5);
                    if (allow_negatives) numer *= (-1)**H.randInt(0, 1);

                    let den_radic;
                    if (H.randInt(0, 1)) {
                        const square_free = [2,3,5,6];
                        const int_squares = [4,9,16,25];

                        let idx_square_free, idx_int_squares;
                        if (H.randInt(0, 1)) {
                            idx_square_free = H.randInt(0, 3);
                            idx_int_squares = 3 - idx_square_free;
                        }
                        else {
                            idx_int_squares = H.randInt(0, 3);
                            idx_square_free = 3 - idx_int_squares;
                        }

                        den_radic = square_free[idx_square_free] * int_squares[idx_int_squares];
                    }
                    else {
                        den_radic = SRH.squareFreeRand(13);
                    }

                    return {
                        a: numer,
                        b: den_radic
                    }
                },
                create: (a,b) => ({
                    prompt_str: `\\frac{${a}}{\\sqrt{${b}}}`,
                    ans_num_int: 0,
                    ans_num_radics: [[a, b]],
                    ans_den: b
                })
            },
            begin_2: {
                select: (allow_negatives) => {
                    let a_base, b_base;
                    const non_square_list = SRH.squareFreeIntList(7);
                    if (H.randInt(0, 1)) {
                        a_base = H.randFromList(non_square_list);
                        non_square_list.splice(non_square_list.indexOf(a_base), 1);
                        
                        b_base = H.randFromList(non_square_list);
                    }
                    else {
                        b_base = H.randFromList(non_square_list);
                        non_square_list.splice(non_square_list.indexOf(b_base), 1);
                        
                        a_base = H.randFromList(non_square_list);
                    }

                    if (H.randInt(1, 10) === 10) b_base = a_base;


                    if (H.randInt(0, 1)) {
                        const potential_factors = [];            
                        H.integerArray(2, 6).map(val => val**2).forEach(square => {
                            if (a_base * b_base * square <= 100) {
                                potential_factors.push(square);
                            }
                        });

                        if (potential_factors.length >= 1) {
                            const chosen_square_factor = H.randFromList(potential_factors);

                            const switcher = H.randInt(0, 2);
                            if (switcher === 0) { // a_base recieves factor
                                a_base *= chosen_square_factor;
                            }
                            else if (switcher === 1) { // b_base recieves factor
                                b_base *= chosen_square_factor;
                            }
                            else { // factor is split between a_base and b_base
                                const root = Math.sqrt(chosen_square_factor);
                                a_base *= root;
                                b_base *= root;
                            }
                        } 
                    }

                    return {
                        a: a_base,
                        b: b_base
                    }
                },
                create: (a,b) => ({
                    prompt_str: `\\frac{\\sqrt{${a}}}{\\sqrt{${b}}}`,
                    ans_num_int: 0,
                    ans_num_radics: [[1, a*b]],
                    ans_den: b
                })
            },
            begin_3: {
                select: (allow_negatives) => {
                    const pm = [];
                    for (let i = 0; i < 2; i++) {
                        pm.push((allow_negatives? (-1)**H.randInt(0, 1) : 1));
                    }
                    
                    const common_radicand = SRH.squareFreeRand(10);
                    const possible_squares = H.integerArray(1, 5).map(val => val**2);
                    const a = common_radicand * H.randFromList(possible_squares);
                    let b = common_radicand * H.randFromList(possible_squares);
                    let c = common_radicand * H.randFromList(possible_squares);
                    
                    if (pm[0] === -1 && b === a) pm[0] = 1;
                    if (pm[1] === -1 && c === a) pm[1] = 1;
                    if (c === b && pm[0]*pm[1] === -1) pm[H.randInt(0, 1)] *= (-1); 


                    return {
                        a: a,
                        b: b,
                        c: c,
                        pm0: pm[0],
                        pm1: pm[1]   
                    }
                },
                create: (a,b,c, ...pm) => ({
                    prompt_str: `\\sqrt{${a}} ${SRH.pm(pm[0])} \\sqrt{${b}} ${SRH.pm(pm[1])} \\sqrt{${c}}`,
                    ans_num_int: 0,
                    ans_num_radics: [[1, a], [pm[0], b], [pm[1], c]],
                    ans_den: 1
                })
            },
            begin_4: {
                select: (allow_negatives) => {
                    let num_int = H.randInt(2, 5);
                    if (allow_negatives) num_int *= (-1)**H.randInt(0, 1);

                    let b_base, c_base;
                    const non_square_list = SRH.squareFreeIntList(6);
                    if (H.randInt(0, 1)) {
                        b_base = H.randFromList(non_square_list);
                        non_square_list.splice(non_square_list.indexOf(b_base), 1);
                        
                        c_base = H.randFromList(non_square_list);
                    }
                    else {
                        c_base = H.randFromList(non_square_list);
                        non_square_list.splice(non_square_list.indexOf(c_base), 1);
                        
                        b_base = H.randFromList(non_square_list);
                    }

                    if (H.randInt(1, 10) === 10) b_base = c_base;

                    if (Math.random() > 0.25) {
                        const square_lims = {'6': 1, '5': 2, '3': 3, '2': 4};

                        if (H.randInt(0, 1)) {
                            b_base *= square_lims[String(b_base)]**2;
                        }   
                        else {
                            c_base *= square_lims[String(c_base)]**2;
                        }   
                    }

                    return {
                        a: num_int,
                        b: b_base,
                        c: c_base
                    }
                },
                create: (a,b,c) => ({
                    prompt_str: `\\frac{${a}\\sqrt{${b}}}{\\sqrt{${c}}}`,
                    ans_num_int: 0,
                    ans_num_radics: [[a, b*c]],
                    ans_den: c
                })
            },
            begin_5: {
                select: (allow_negatives) => {
                    const abc = new Array(3).fill(null).map(val => {
                        val = SRH.squareFreeRand(10);
                        
                        if (val === 7) {
                            if (H.randInt(0, 1)) val = 6;
                            else val = 10;
                        }

                        return val;
                    });

                    const no_repeat_abc = Array.from(new Set(abc));

                    if (no_repeat_abc.length === 2 && Math.random() > 0.2) {
                        let repeat_idx, other_idx;
                        if (abc.filter(v => v === no_repeat_abc[0]).length === 2) {
                            repeat_idx = abc.indexOf(no_repeat_abc[0]);
                            other_idx = abc.indexOf(no_repeat_abc[1]);
                        }
                        else {
                            repeat_idx = abc.indexOf(no_repeat_abc[1]);
                            other_idx = abc.indexOf(no_repeat_abc[0]);
                        }

                        abc[repeat_idx] = H.randFromList(H.removeFromArray([7, abc[repeat_idx], abc[other_idx]], SRH.squareFreeIntList(10)));
                    }
                    
                    H.randomizeList(abc);

                    if (H.randInt(0, 1)) {
                        const idx_2_or_3 = [];

                        abc.forEach((v, i) => {
                            if (v === 2 || v === 3) idx_2_or_3.push(i);
                        });

                        if (idx_2_or_3.length >= 1) {
                            abc[H.randFromList(idx_2_or_3)] *= H.randInt(2, 3)**2;
                        }
                    }

                    return {
                        a: abc[0],
                        b: abc[1],
                        c: abc[2]
                    }
                },
                create: (a,b,c) => ({
                    prompt_str: `\\sqrt{${a}}\\cdot\\sqrt{${b}}\\cdot\\sqrt{${c}}`,
                    ans_num_int: 0,
                    ans_num_radics: [[1, a*b*c]],
                    ans_den: 1
                })
            },
            begin_6: {
                select: (allow_negatives) => {
                    const pm = [];
                    for (let i = 0; i < 3; i++) {
                        pm.push((allow_negatives? (-1)**H.randInt(0, 1) : 1));
                    }

                    let a = H.randInt(1, 10);
                    if (allow_negatives) a *= (-1)**H.randInt(0, 1);
                    
                    let c = H.randInt(1, 10);
                    if (allow_negatives) c *= (-1)**H.randInt(0, 1);

                    const common_radicand = H.randFromList(H.removeFromArray(7, SRH.squareFreeIntList(10)));
                    const possible_squares = H.integerArray(2, 4).map(val => val**2);

                    let b_square = 1;
                    if (H.randInt(0, 4) === 4) {
                        b_square = H.randFromList(possible_squares);
                    }

                    let d_square = 1;
                    if (H.randInt(0, 4) === 4) {
                        d_square = H.randFromList(possible_squares);
                    }

                    let b = b_square*common_radicand;
                    let d = d_square*common_radicand;

                    return {
                        a: a,
                        b: b,
                        c: c,
                        d: d,
                        pm0: pm[0],
                        pm1: pm[1],
                        pm2: pm[2]
                    }
                },
                create: (a,b,c,d, ...pm) => ({
                    prompt_str: `(%${a} ${SRH.pm(pm[0])} \\sqrt{${b}}%) ${SRH.pm(pm[1])} (%${c} ${SRH.pm(pm[2])} \\sqrt{${d}}%)`,
                    ans_num_int: a + pm[1]*c,
                    ans_num_radics: [[pm[0], b], [pm[1]*pm[2], d]],
                    ans_den: 1,
                })
            },
            begin_7: {
                select: (allow_negatives) => {
                    let a_base, b_base;
                    const non_square_list = SRH.squareFreeIntList(7);
                    if (H.randInt(0, 1)) {
                        a_base = H.randFromList(non_square_list);
                        non_square_list.splice(non_square_list.indexOf(a_base), 1);
                        
                        b_base = H.randFromList(non_square_list);
                    }
                    else {
                        b_base = H.randFromList(non_square_list);
                        non_square_list.splice(non_square_list.indexOf(b_base), 1);
                        
                        a_base = H.randFromList(non_square_list);
                    }

                    if (H.randInt(1, 10) === 10) b_base = a_base;


                    if (H.randInt(0, 1)) {
                        const potential_factors = [];            
                        H.integerArray(2, 6).map(val => val**2).forEach(square => {
                            if (a_base * b_base * square <= 100) {
                                potential_factors.push(square);
                            }
                        });

                        if (potential_factors.length >= 1) {
                            const chosen_square_factor = H.randFromList(potential_factors);

                            const switcher = H.randInt(0, 2);
                            if (switcher === 0) { // a_base recieves factor
                                a_base *= chosen_square_factor;
                            }
                            else if (switcher === 1) { // b_base recieves factor
                                b_base *= chosen_square_factor;
                            }
                            else { // factor is split between a_base and b_base
                                const root = Math.sqrt(chosen_square_factor);
                                a_base *= root;
                                b_base *= root;
                            }
                        } 
                    }

                    if (H.randInt(1, 8) === 8) {
                        a_base = 1;

                        if (H.randInt(0, 1) && b_base <= 12) {
                            b_base = b_base**2;
                        }
                    }

                    return {
                        a: a_base,
                        b: b_base
                    }
                },
                create: (a,b) => ({
                    prompt_str: `\\sqrt{\\frac{${a}}{${b}}}`,
                    ans_num_int: 0,
                    ans_num_radics: [[1, a*b]],
                    ans_den: b
                })
            },
            begin_8: {
                select: (allow_negatives) => {
                    let a = H.randInt(2, 5);
                    let c = H.randInt(2, 5);

                    if (allow_negatives && H.randInt(1, 4) === 4) a *= (-1)**H.randInt(0, 1);

                    const possible_radics = SRH.squareFreeIntList(7);

                    let b, d;
                    if (H.randInt(0, 1)) {
                        b = H.randFromList(possible_radics);
                        d = H.randFromList(H.removeFromArray(b, possible_radics));

                        if (Math.random() > 0.6) {
                            const possible_squares = [];
                            H.integerArray(1, 6).map(val => val**2).forEach(square => {
                                if (b * square <= 35) possible_squares.push(square);
                            });

                            b *= H.randFromList(possible_squares);
                        }
                    }
                    else {
                        d = H.randFromList(possible_radics);
                        b = H.randFromList(H.removeFromArray(d, possible_radics));

                        if (Math.random() > 0.6) {
                            const possible_squares = [];
                            H.integerArray(1, 6).map(val => val**2).forEach(square => {
                                if (d * square <= 35) possible_squares.push(square);
                            });

                            d *= H.randFromList(possible_squares);
                        }
                    }

                    return {
                        a: a,
                        b: b,
                        c: c,
                        d: d
                    }
                },
                create: (a,b,c,d) => ({
                    prompt_str: `${a}\\sqrt{${b}}\\cdot ${c}\\sqrt{${d}}`,
                    ans_num_int: 0,
                    ans_num_radics: [[a*c, b*d]],
                    ans_den: 1
                })
            },
            begin_9: {
                select: (allow_negatives) => {
                    let a = H.randInt(2, 5);
                    let c = H.randInt(2, 5);

                    if (allow_negatives) {
                        a *= (-1)**H.randInt(0, 1);
                        c *= (-1)**H.randInt(0, 1);
                    }

                    const common_radicand = SRH.squareFreeRand(10);
                    let b = common_radicand;
                    let d = common_radicand;

                    let possible_squares;
                    if (common_radicand <= 5) {
                        possible_squares = H.integerArray(2, 5).map(val => val**2);
                    }
                    else {
                        possible_squares = H.integerArray(2, 3).map(val => val**2);
                    }

                    if (Math.random() > 0.4) {
                        if (H.randInt(0, 1)) {
                            const b_factor = H.randFromList(possible_squares);
                            b *= b_factor

                            if (H.randInt(1, 3) === 3) {
                                d *= H.randFromList(H.removeFromArray(b_factor, possible_squares));
                            }
                        }
                        else {
                            const d_factor = H.randFromList(possible_squares);
                            d *= d_factor

                            if (H.randInt(1, 3) === 3) {
                                b *= H.randFromList(H.removeFromArray(d_factor, possible_squares));
                            }
                        }
                    }

                    if (b === d && a + c === 0) {
                        (H.randInt(0, 1))? (a *= (-1)) : (c *= (-1)); 
                    }

                    return {
                        a: a,
                        b: b,
                        c: c,
                        d: d
                    }
                },
                create: (a,b,c,d) => ({
                    prompt_str: `${a}\\sqrt{${b}} ${SRH.pm(Math.sign(c))} ${Math.abs(c)}\\sqrt{${d}}`,
                    ans_num_int: 0,
                    ans_num_radics: [[a, b], [c, d]],
                    ans_den: 1
                })
            },
            begin_10: {
                select: (allow_negatives) => {
                    let pm0 = 1;

                    let a, b;
                    if (H.randInt(0, 1)) {
                        a = H.randInt(2, 10);
                        b = H.randInt(1, 5);
                    }
                    else {
                        a = H.randInt(2, 5);
                        b = H.randInt(1, 10);
                    }

                    if (allow_negatives) {
                        pm0 *= (-1)**H.randInt(0, 1);
                        a *= (-1)**H.randInt(0, 1);
                        b *= (-1)**H.randInt(0, 1);
                    }

                    let c = SRH.squareFreeRand(13);

                    return {
                        a: a,
                        b: b,
                        c: c,
                        pm0: pm0
                    }
                },
                create: (a,b,c, ...pm) => ({
                    prompt_str: `${a}(%${b} ${SRH.pm(pm[0])} \\sqrt{${c}}%)`,
                    ans_num_int: a*b,
                    ans_num_radics: [[pm[0]*a, c]],
                    ans_den: 1
                })
            },
            begin_11: {
                select: (allow_negatives) => {
                    let pm0 = 1;
                    let b = H.randInt(2, 6);

                    if (allow_negatives) {
                        pm0 *= (-1)**H.randInt(0, 1);
                        b *= (-1) **H.randInt(0, 1);
                    }

                    const common_radicand = SRH.squareFreeRand(7);

                    let a = common_radicand;
                    let c = common_radicand;
                    if (H.randInt(0, 1)) {
                        const factor_limit = {'2': 5, '3': 4, '5': 3, '6': 2, '7': 2}[String(common_radicand)];

                        const chosen_square_factor = H.randFromList(H.integerArray(2, factor_limit).map(val => val**2));
                        if (H.randInt(1, 3) === 3) {
                            a *= chosen_square_factor;
                        }
                        else if (H.randInt(0, 1)) {
                            c *= chosen_square_factor;
                        }
                        else {
                            const factor_sqrt = Math.sqrt(chosen_square_factor);
                            a *= factor_sqrt;
                            c *= factor_sqrt;
                        }
                    }

                    return {
                        a: a,
                        b: b,
                        c: c,
                        pm0: pm0
                    }
                },
                create: (a,b,c, ...pm) => ({
                    prompt_str: `\\sqrt{${a}}(%${b} ${SRH.pm(pm[0])} \\sqrt{${c}}%)`,
                    ans_num_int: pm[0] * Math.sqrt(a*c),
                    ans_num_radics: [[b, a]],
                    ans_den: 1
                })
            },
        },
        inter: {
            inter_1: {
                select: (allow_negatives) => {
                    let pm0 = 1;
                    let a = H.randInt(1, 6);

                    if (allow_negatives) {
                        pm0 *= (-1)**H.randInt(0, 1);
                        a *= (-1)**H.randInt(0, 1);
                    }

                    let b = SRH.squareFreeRand(11);

                    return {
                        a: a,
                        b: b,
                        pm0: pm0
                    }
                },
                create: (a,b, ...pm) => ({
                    prompt_str: `(%${a} ${SRH.pm(pm[0])} \\sqrt{${b}}%)^{2}`,
                    ans_num_int: a**2 + b,
                    ans_num_radics: [[2*pm[0]*a, b]],
                    ans_den: 1
                })
            },
            inter_2: {
                select: (allow_negatives) => {
                    const possible_abc = [];
                    const square_free_limit = 7;
                    SRH.squareFreeIntList(square_free_limit).forEach(a => {
                        SRH.squareFreeIntList(square_free_limit).forEach(b => {
                            SRH.squareFreeIntList(square_free_limit).forEach(c => {
                                if (a*b*c <= 75 && c !== a && c !== b) {
                                    possible_abc.push([a,b,c]);
                                }
                            });
                        });
                    });

                    let [a, b, c] = H.randFromList(possible_abc);

                    if (H.randInt(1, 4) === 4) {
                        if (H.randInt(1, 3) === 3) {
                            a = a**2;
                        }
                        else if (H.randInt(0, 1)) {
                            b = b**2;
                        }
                        else {
                            c = c**2;
                        }
                    }
                    
                    return {
                        a: a,
                        b: b,
                        c: c
                    }
                },
                create: (a,b,c) => ({
                    prompt_str: `\\frac{\\sqrt{${a}}\\cdot\\sqrt{${b}}}{\\sqrt{${c}}}`,
                    ans_num_int: 0,
                    ans_num_radics: [[1, a*b*c]],
                    ans_den: c,
                })
            },
            inter_3: {
                select: (allow_negatives) => {
                    let pm0 = 1;
                    let a = H.randInt(1, 5);
                    let b = H.randInt(1, 5);

                    if (allow_negatives) {
                        pm0 *= (-1)**H.randInt(0, 1);
                        a *= (-1)**H.randInt(0, 1);
                        b *= (-1)**H.randInt(0, 1);
                    }

                    let c = SRH.squareFreeRand(11);

                    return {
                        a: a,
                        b: b,
                        c: c,
                        pm0: pm0
                    }
                },
                create: (a,b,c, ...pm) => ({
                    prompt_str: `\\frac{${a}}{%${b} ${SRH.pm(pm[0])} \\sqrt{${c}}%}`,
                    ans_num_int: a*b,
                    ans_num_radics: [[-pm[0]*a, c]],
                    ans_den: b**2 - c
                })
            },
            inter_4: {
                select: (allow_negatives) => {
                    let pm0 = 1;
                    let pm1 = 1;
                    let a = H.randInt(1, 5);
                    let c = H.randInt(1, 5);

                    if (allow_negatives) {
                        pm0 *= (-1)**H.randInt(0, 1);
                        pm1 *= (-1)**H.randInt(0, 1);
                        a *= (-1)**H.randInt(0, 1);
                        c *= (-1)**H.randInt(0, 1);
                    }

                    const common_radicand = SRH.squareFreeRand(11);
                    let b = common_radicand;
                    let d = common_radicand;

                    return {
                        a: a,
                        b: b,
                        c: c,
                        d: d,
                        pm0: pm0,
                        pm1: pm1
                    }
                },
                create: (a,b,c,d, ...pm) => ({
                    prompt_str: `\\frac{%${a} ${SRH.pm(pm[0])} \\sqrt{${b}}%}{%${c} ${SRH.pm(pm[1])} \\sqrt{${d}}%}`,
                    ans_num_int: a*c - pm[0]*pm[1]*Math.sqrt(b*d),
                    ans_num_radics: [[-pm[1]*a, d], [pm[0]*c, b]],
                    ans_den: c**2 - d
                })
            },
            inter_5: {
                select: (allow_negatives) => {
                    let pm0 = 1;
                    let pm1 = 1;
                    let a = H.randInt(1, 5);
                    let c = H.randInt(1, 5);

                    if (allow_negatives) {
                        pm0 *= (-1)**H.randInt(0, 1);
                        pm1 *= (-1)**H.randInt(0, 1);
                        a *= (-1)**H.randInt(0, 1);
                        c *= (-1)**H.randInt(0, 1);
                    }

                    const common_radicand = SRH.squareFreeRand(11);
                    let b = common_radicand;
                    let d = common_radicand;

                    return {
                        a: a,
                        b: b,
                        c: c,
                        d: d,
                        pm0: pm0,
                        pm1: pm1
                    }
                },
                create: (a,b,c,d, ...pm) => ({
                    prompt_str: `(%${a} ${SRH.pm(pm[0])} \\sqrt{${b}}%)(%${c} ${SRH.pm(pm[1])} \\sqrt{${d}}%)`,
                    ans_num_int: a*c + pm[0]*pm[1]*Math.sqrt(b*d),
                    ans_num_radics: [[pm[1]*a, d], [pm[0]*c, b]],
                    ans_den: 1
                })
            },
            inter_6: {
                select: (allow_negatives) => {
                    const pm = [];
                    for (let i = 0; i < 3; i++) {
                        pm.push((allow_negatives? (-1)**H.randInt(0, 1) : 1));
                    }

                    pm[-1] = 1;
                    const common_radicand = SRH.squareFreeRand(10);
                    const possible_squares = H.integerArray(1, 5).map(val => val**2);
                    const abcd = [];
                    for (let i = 0; i < 4; i++) {
                        abcd.push(common_radicand * H.randFromList(possible_squares));

                        for (let j = i - 1; j >= 0; j--) {
                            if (pm[j - 1] * abcd[j] + pm[i - 1] * abcd[i] === 0) {
                                pm[i - 1] *= (-1);
                            }
                        }
                    }

                    return {
                        a: abcd[0],
                        b: abcd[1],
                        c: abcd[2],
                        d: abcd[3],
                        pm0: pm[0],
                        pm1: pm[1] ,
                        pm2: pm[2]  
                    }
                },
                create: (a,b,c,d, ...pm) => ({
                    prompt_str: `\\sqrt{${a}} ${SRH.pm(pm[0])} \\sqrt{${b}} ${SRH.pm(pm[1])} \\sqrt{${c}} ${SRH.pm(pm[2])} \\sqrt{${d}}`,
                    ans_num_int: 0,
                    ans_num_radics: [[1, a], [pm[0], b], [pm[1], c], [pm[2], d]],
                    ans_den: 1
                })
            },
            inter_7: {
                select: (allow_negatives) => {
                    let a = H.randInt(1, 10);
                    let b = H.randInt(2, 6);
                    
                    if (allow_negatives) {
                        a *= (-1)**H.randInt(0, 1);
                        b *= (-1)**H.randInt(0, 1);
                    }

                    let c = SRH.squareFreeRand(11);

                    return {
                        a: a,
                        b: b,
                        c: c
                    }
                },
                create: (a,b,c) => ({
                    prompt_str: `\\frac{${a}}{${b}\\sqrt{${c}}}`,
                    ans_num_int: 0,
                    ans_num_radics: [[a, c]],
                    ans_den: b*c
                })
            },
            inter_8: {
                select: (allow_negatives) => {
                    let a = H.randInt(2, 10);
                    let c = H.randInt(2, 6);

                    if (allow_negatives) {
                        a *= (-1)**H.randInt(0, 1);
                        c *= (-1)**H.randInt(0, 1);
                    }

                    let b, d;
                    if (H.randInt(0, 1)) {
                        b = SRH.squareFreeRand(10);
                        d = H.randFromList(H.removeFromArray(b, SRH.squareFreeIntList(10)));
                    }
                    else {
                        d = SRH.squareFreeRand(10);
                        b = H.randFromList(H.removeFromArray(d, SRH.squareFreeIntList(10)));
                    }

                    return {
                        a: a,
                        b: b,
                        c: c,
                        d: d
                    }
                },
                create: (a,b,c,d) => ({
                    prompt_str: `\\frac{${a}\\sqrt{${b}}}{${c}\\sqrt{${d}}}`,
                    ans_num_int: 0,
                    ans_num_radics: [[a, b*d]],
                    ans_den: c*d
                })
            },
            inter_9: {
                select: (allow_negatives) => {
                    let pm0 = 1;
                    let a = H.randInt(1, 10);

                    if (allow_negatives) {
                        pm0 *= (-1)**H.randInt(0, 1);
                        a *= (-1)**H.randInt(0, 1);
                    }

                    const common_radicand = SRH.squareFreeRand(7);
                    let possible_squares;
                    if (common_radicand <= 3) {
                        possible_squares = [4, 9, 16];
                    }
                    else {
                        possible_squares = [4, 9];
                    }


                    let b = common_radicand;
                    let c = common_radicand;
                    if (H.randInt(0, 1)) {
                        b *= H.randFromList(possible_squares);

                        if (H.randInt(1, 6) === 6) b = c;
                    }
                    else {
                        c *= H.randFromList(possible_squares);

                        if (H.randInt(1, 6) === 6) c = b;
                    }

                    return {
                        a: a,
                        b: b,
                        c: c,
                        pm0: pm0
                    }
                },
                create: (a,b,c, ...pm) => ({
                    prompt_str: `\\frac{%${a} ${SRH.pm(pm[0])} \\sqrt{${b}}%}{\\sqrt{${c}}}`,
                    ans_num_int: pm[0]*Math.sqrt(b*c),
                    ans_num_radics: [[a, c]],
                    ans_den: c
                })
            },
            inter_10: {
                select: (allow_negatives) => {
                    let pm0 = 1;
                    let b = H.randInt(1, 7);

                    if (allow_negatives) {
                        pm0 *= (-1)**H.randInt(0, 1);
                        b *= (-1)**H.randInt(0, 1);
                    }

                    const common_radicand = SRH.squareFreeRand(11);
                    let a = common_radicand;
                    let c = common_radicand;

                    return {
                        a: a,
                        b: b,
                        c: c,
                        pm0: pm0
                    }
                },
                create: (a,b,c, ...pm) => ({
                    prompt_str: `\\frac{\\sqrt{${a}}}{%${b} ${SRH.pm(pm[0])} \\sqrt{${c}}%}`,
                    ans_num_int: -pm[0]*Math.sqrt(a*c),
                    ans_num_radics: [[b, a]],
                    ans_den: b**2 - c
                })
            },
            inter_11: {
                select: (allow_negatives) => {
                    const ace = [];
                    for (let i = 0; i < 3; i++) {
                        ace.push((allow_negatives? (-1)**H.randInt(0, 1) * H.randInt(2, 5) : H.randInt(2, 5)));
                    }

                    let [a, c, e] = ace;

                    const common_radicand = SRH.squareFreeRand(10);

                    let possible_squares;
                    if (common_radicand <= 5) {
                        possible_squares = H.integerArray(2, 5).map(val => val**2);
                    }
                    else {
                        possible_squares = H.integerArray(2, 3).map(val => val**2);
                    }

                    const det = new Array(3).fill(null).map(_ => H.randInt(0, 2));
                    const bdf = new Array(3).fill(null).map(_ => common_radicand);
                    for (let i = 0; i < 3; i++) {
                        if (det[i] === 0) {
                            bdf[i] *= H.randFromList(possible_squares);
                        }
                        else if (det[i] === 1) {
                            bdf[i] *= H.randFromList(possible_squares.slice(0, Math.floor(possible_squares.length / 2)))
                        }
                    }

                    let [b, d, f] = bdf;

                    if (b === d && a + c === 0) {
                        (H.randInt(0, 1))? (a *= -1) : (c *= -1);
                    }
                    if (b === f && a + e === 0) {
                        (H.randInt(0, 1))? (a *= -1) : (e *= -1);
                    }
                    if (d === f && c + e === 0) {
                        (H.randInt(0, 1))? (c *= -1) : (e *= -1);
                    }

                    return {
                        a: a,
                        b: b,
                        c: c,
                        d: d,
                        e: e,
                        f: f
                    }
                },
                create: (a,b,c,d,e,f) => ({
                    prompt_str: `${a}\\sqrt{${b}} ${SRH.pm(Math.sign(c))} ${Math.abs(c)}\\sqrt{${d}} ${SRH.pm(Math.sign(e))} ${Math.abs(e)}\\sqrt{${f}}`,
                    ans_num_int: 0,
                    ans_num_radics: [[a, b], [c, d], [e, f]],
                    ans_den: 1
                })
            },
            inter_12: {
                select: (allow_negatives) => {
                    let pm0 = 1;
                    let a = H.randInt(1, 7);

                    if (allow_negatives) {
                        pm0 *= (-1)**H.randInt(0, 1);
                        a *= (-1)**H.randInt(0, 1);
                    }

                    const common_radicand = SRH.squareFreeRand(7);
                    let b = common_radicand;
                    let c = common_radicand;
                    if (H.randInt(0, 1)) {
                        const square_lim = (common_radicand <= 5)? 4 : 3;
                        const possible_squares = H.integerArray(2, square_lim).map(val => val**2);

                        if (H.randInt(0, 1)) {
                            b *= H.randFromList(possible_squares);
                        }
                        else {
                            c *= H.randFromList(possible_squares);
                        }
                    }
                    else {
                        if (H.randInt(0, 1)) {
                            b = H.randFromList(H.integerArray(2, 7).map(val => val**2));
                        }
                        else {
                            c = H.randFromList(H.integerArray(2, 7).map(val => val**2)); 
                        }
                    }

                    return {
                        a: a,
                        b: b,
                        c: c,
                        pm0: pm0
                    }
                },
                create: (a,b,c, ...pm) => ({
                    prompt_str: `\\frac{${a}}{\\sqrt{${b}} ${SRH.pm(pm[0])} \\sqrt{${c}}}`,
                    ans_num_int: 0,
                    ans_num_radics: [[-pm[0]*a, c], [a, b]],
                    ans_den: b - c
                })
            },
            inter_13: {
                select: (allow_negatives) => {
                    let pm0 = 1;
                    let a = H.randInt(1, 4);

                    if (allow_negatives) {
                        pm0 *= (-1)**H.randInt(0, 1);
                        a *= (-1)**H.randInt(0, 1);
                    }

                    let c = H.randInt(1, 4);

                    const common_radicand = SRH.squareFreeRand(7);
                    let b = common_radicand;
                    let d = common_radicand;
                    if (H.randInt(0, 1)) {
                        if (H.randInt(0, 1)) {
                            b = H.randFromList(H.integerArray(2, 7).map(val => val**2));
                        }
                        else {
                            d = H.randFromList(H.integerArray(2, 7).map(val => val**2)); 
                        }
                    }
                    
                    if (b === d && a + pm0*c === 0) {
                        (H.randInt(0, 1))? (a *= (-1)) : (pm0 *= (-1));
                    }

                    return {
                        a: a,
                        b: b,
                        c: c,
                        d: d,
                        pm0: pm0
                    }
                },
                create: (a,b,c,d, ...pm) => ({
                    prompt_str: `\\frac{${a}}{\\sqrt{${b}}} ${SRH.pm(pm[0])} \\frac{${c}}{\\sqrt{${d}}}`,
                    ans_num_int: 0,
                    ans_num_radics: [[a*d, b], [pm[0]*b*c, d]],
                    ans_den: b*d
                })
            },
            inter_14: {
                select: (allow_negatives) => {
                    let pm0 = (allow_negatives? (-1)**H.randInt(0, 1) : 1);

                    let a, b, c;
                    const square_free_lim = 7;
                    if (H.randInt(1, 3) === 3) {
                        const common_radicand = SRH.squareFreeRand(square_free_lim);
                        a = common_radicand;

                        if (H.randInt(0, 1)) { 
                            b = common_radicand;
                            c = H.randFromList(H.removeFromArray(common_radicand, SRH.squareFreeIntList(square_free_lim)));
                        }
                        else {
                            c = common_radicand;
                            b = H.randFromList(H.removeFromArray(common_radicand, SRH.squareFreeIntList(square_free_lim)));
                        }
                    }
                    else if (H.randInt(0, 1)) {
                        const common_radicand = SRH.squareFreeRand(square_free_lim);
                        a = b = c = common_radicand;
                        const possible_squares = H.integerArray(2, ((common_radicand <= 5)? 5 : 3)).map(val => val**2);

                        if (H.randInt(1, 3) === 3) {
                            a *= H.randFromList(possible_squares);

                            if (H.randInt(1, 3) === 3) {
                                (H.randInt(0, 1))? b *= H.randFromList(possible_squares) : c *= H.randFromList(possible_squares);;
                            }
                        }
                        else if (H.randInt(0, 1)) {
                            b *= H.randFromList(possible_squares);

                            if (H.randInt(1, 3) === 3) {
                                (H.randInt(0, 1))? a *= H.randFromList(possible_squares) : c *= H.randFromList(possible_squares);;
                            }
                        }
                        else {
                            c *= H.randFromList(possible_squares);

                            if (H.randInt(1, 3) === 3) {
                                (H.randInt(0, 1))? a *= H.randFromList(possible_squares) : b *= H.randFromList(possible_squares);;
                            }
                        }

                        if (pm0 === -1 && b === c) pm0 = 1;
                    }
                    else {
                        const common_radicand = SRH.squareFreeRand(square_free_lim);
                        a = common_radicand;

                        if (H.randInt(0, 1)) {
                            b = common_radicand;
                            c = H.randInt(2, 7)**2;
                        }
                        else {
                            c = common_radicand;
                            b = H.randInt(2, 7)**2;
                        }
                    }

                    return {
                        a: a,
                        b: b,
                        c: c,
                        pm0: pm0
                    }
                },
                create: (a,b,c, ...pm) => ({
                    prompt_str: `\\frac{\\sqrt{${a}}}{\\sqrt{${b}} ${SRH.pm(pm[0])} \\sqrt{${c}}}`,
                    ans_num_int: 0,
                    ans_num_radics: (b === c && pm[0] === 1)? [[1, a*b], [1, a*c]] : [[1, a*b], [-pm[0], a*c]],
                    ans_den: (b === c && pm[0] === 1)? (4*b) : (b - c)
                })
            },
            inter_15: {
                select: (allow_negatives) => {
                    let a = H.randInt(1, 4);
                    let b = H.randInt(2, 4);
                    let d = H.randInt(2, 4);

                    if (allow_negatives) {
                        a *= (-1)**H.randInt(0, 1);
                        b *= (-1)**H.randInt(0, 1);
                        d *= (-1)**H.randInt(0, 1);
                    }

                    let c, e;
                    const common_radicand = SRH.squareFreeRand(6);
                    if (H.randInt(0, 1)) {
                        c = e = common_radicand;
                    }
                    else {
                        c = e = common_radicand;
                        const possible_squares = H.integerArray(2, ((common_radicand <= 5)? 4 : 3)).map(val => val**2);

                        if (H.randInt(0, 1)) {
                            c *= H.randFromList(possible_squares);
                        }
                        else {
                            e *= H.randFromList(possible_squares);
                        }
                    }

                    const c_extracted = PH.simplifySQRT(c);
                    let b1 = b * c_extracted.numberInFront;
                    let c1 = c_extracted.numberUnderRoot;

                    const e_extracted = PH.simplifySQRT(e);
                    let d1 = d * e_extracted.numberInFront;
                    let e1 = e_extracted.numberUnderRoot;

                    if (c1 === e1 && b1 + d1 === 0) {
                        if (H.randInt(0, 1)) {
                            b *= (-1);
                            b1 *= (-1);
                        }
                        else {
                            d *= (-1);
                            d1 *= (-1);
                        }
                    }

                    return {
                        a: a,
                        b: b,
                        c: c,
                        d: d,
                        e: e,
                        f: {b1, c1, d1, e1}
                    }
                },
                create: (a,b,c,d,e,f) => ({
                    prompt_str: `\\frac{${a}}{${b}\\sqrt{${c}} ${SRH.pm(Math.sign(d))} ${Math.abs(d)}\\sqrt{${e}}}`,
                    ans_num_int: 0,
                    ans_num_radics: (f.c1 === f.e1 && f.b1 === f.d1)? [[a, c]] : [[-a*d, e], [a*b, c]],
                    ans_den: (f.c1 === f.e1 && f.b1 === f.d1)? (2*b*c) : (b**2 * c - d**2 * e)
                })
            },
        }
    }
};
export default function genSimSqrt(settings) {
    // resolve the form
    let form_template;
    if (settings.sim_sqrt_form.includes('all_')) { // randomly resolve an all_level to a particular form
        const form_level = settings.sim_sqrt_form.split('_')[1];
        form_template = SRH.forms[form_level][`${form_level}_${H.randInt(1, Object.values(SRH.forms[form_level]).length)}`];
    }
    else {
        const form_level = settings.sim_sqrt_form.split('_')[0];
        form_template = SRH.forms[form_level][settings.sim_sqrt_form];
    }

    const coef_values = form_template.select(settings.sim_sqrt_allow_negatives === 'yes');
    const ordered_coef_values = [];

    // extract letter coefs and pm coefs in order
    let ascii_index = 96;
    while (Object.prototype.hasOwnProperty.call(coef_values, String.fromCharCode(ascii_index + 1))) {
        ordered_coef_values.push(coef_values[String.fromCharCode(ascii_index + 1)]);
        ascii_index++;
    }

    let pm_index = -1;
    while (Object.prototype.hasOwnProperty.call(coef_values, `pm${pm_index + 1}`)) {
        ordered_coef_values.push(coef_values[`pm${pm_index + 1}`]);
        pm_index++;
    }

    const new_prompt_obj = form_template.create(...ordered_coef_values);
    
    // handle term order setting
    const term_order = settings.sim_sqrt_term_order;
    let prompt_str = new_prompt_obj.prompt_str;
    const prompt_sections = prompt_str.split('%');
    for (let i = 1; i < prompt_sections.length; i += 2) {
        const wrapped_section = prompt_sections[i];

        // extract the int and root parts
        let int_part, root_part, operator;
        for (let char_idx = wrapped_section.length - 1; char_idx > 0; char_idx--) {
            const wrapped_section_char = wrapped_section.charAt(char_idx);

            if (wrapped_section_char === '+' || wrapped_section_char === '-') {
                int_part = wrapped_section.slice(0, char_idx);
                root_part = wrapped_section.slice(char_idx + 1);
                operator = wrapped_section_char;
                break;
            }
        }

        const resolved_order = (term_order === 'random')? H.randFromList(['a_plus_root_b', 'root_b_plus_a']) : term_order;
        if (resolved_order === 'root_b_plus_a') { // order swap required
            if (operator === '-') root_part = '-' + root_part;

            let replacement_section;
            if (int_part.charAt(0) === '-') {
                replacement_section = root_part + int_part;
            }
            else {
                replacement_section = root_part + '+' + int_part;
            }

            prompt_sections[i] = replacement_section;
        }
    }
    prompt_str = prompt_sections.join('');

    // resolve the answer components to a simplified tex str
    let radic_sum_components = new_prompt_obj.ans_num_radics;
    const removed_idxs = [];
    radic_sum_components.forEach((radic_expr, idx) => {
        const simplified_root = PH.simplifySQRT(radic_expr[1]); // fully extract/reduce each root
        radic_expr[0] *= simplified_root.numberInFront;
        radic_expr[1] = simplified_root.numberUnderRoot;

        // if the root reduced competely, remove it from the radicand sum and add it to the integer part
        if (simplified_root.numberUnderRoot === 0 || simplified_root.numberUnderRoot === 1) {
            if (simplified_root.numberUnderRoot === 1) {
                new_prompt_obj.ans_num_int += radic_expr[0];
            }

            removed_idxs.push(idx);
        }
    });
    radic_sum_components = radic_sum_components.filter((_, idx) => !removed_idxs.includes(idx));

    const common_radicand = radic_sum_components?.[0]?.[1];
    if (!radic_sum_components.every(radic_expr => radic_expr[1] === common_radicand)) {
        throw new Error('Cannot reduce radic sum because radics are not united by a common radicand.');
    }

    // combine all the radic terms
    let in_front_sum = 0;
    radic_sum_components.forEach(radic_expr => {
        in_front_sum += radic_expr[0];
    });    
    
    // determine if the final radic expression exists (and what it is)
    const final_radic_expr = [];
    let ans_num_int = new_prompt_obj.ans_num_int;
    if (common_radicand === 1 || common_radicand === 0 || common_radicand === undefined) {
        ans_num_int += in_front_sum;
        
        final_radic_expr[0] = 0;
        final_radic_expr[1] = 0;
    }
    else {        
        final_radic_expr[0] = in_front_sum;
        final_radic_expr[1] = common_radicand;
    }

    let answer_str;
    let num_int = ans_num_int;
    let num_root_front = final_radic_expr[0];
    let num_root_under = final_radic_expr[1];
    let den = new_prompt_obj.ans_den;
    if (num_int !== 0 && num_root_front === 0) { // ans has int part but no radic part
        answer_str = PH.simplifiedFracString(num_int, den, 'in_front');
    }
    else if (num_int === 0 && num_root_front !== 0) { // ans has radic part but no int part
        const reduced_frac_part = PH.simplifyFraction(num_root_front, den);
        num_root_front = reduced_frac_part.numer;
        den = reduced_frac_part.denom;
        
        let front_sign;
        if (num_root_front < 0) {
            front_sign = '-';
            num_root_front *= -1;
        }
        else {
            front_sign = '';
        }

        const final_root_expr = PH.simplifiedSqrtString(num_root_front**2 * num_root_under);
        if (den === 1) {
            answer_str = front_sign + final_root_expr;
        }
        else {
            answer_str = `${front_sign}\\frac{${final_root_expr}}{${den}}`;
        }
    }
    else if (num_int === 0 && num_root_front === 0) { // ans has neither an int nor a radic part
        answer_str = '0';
    }
    else if (num_int !== 0 && num_root_front !== 0) { // ans has both an int and radic part
        const den_sign = Math.sign(den);
        const expr_signed_gcf = PH.GCF(Math.abs(num_int), Math.abs(num_root_front), Math.abs(den)) * den_sign;
        den /= expr_signed_gcf;
        num_int /= expr_signed_gcf;
        num_root_front /= expr_signed_gcf;

        let combined_numer_str; // numer part of the answer str if settings require a combined answer
        const root_str = String(Math.sign(num_root_front)).replace('1', '') + PH.simplifiedSqrtString(num_root_front**2 * num_root_under);
        if (
            settings.sim_sqrt_term_order === 'a_plus_root_b' ||
            settings.sim_sqrt_term_order === 'random'
        ) {
            if (root_str.charAt(0) === '-') {
                combined_numer_str = `${num_int}${root_str}`;
            }
            else {
                combined_numer_str = `${num_int}+${root_str}`;
            }
        }
        else if (settings.sim_sqrt_term_order === 'root_b_plus_a') {
            if (String(num_int).charAt(0) === '-') {
                combined_numer_str = `${root_str}${num_int}`;
            }
            else {
                combined_numer_str = `${root_str}+${num_int}`;
            }
        }

        if (den === 1) {
            answer_str = combined_numer_str
        }
        else if (settings.sim_sqrt_frac_rule === 'together') {
            answer_str = `\\frac{${combined_numer_str}}{${den}}`;
        }
        else if (settings.sim_sqrt_frac_rule === 'separate') {
            let int_part_num = num_int;
            let int_part_den = den;

            const sim_int_part_frac = PH.simplifyFraction(int_part_num, int_part_den);
            int_part_num = sim_int_part_frac.numer;
            int_part_den = sim_int_part_frac.denom;

            let root_part_num = num_root_front;
            let root_part_den = den;

            const sim_root_part_frac = PH.simplifyFraction(root_part_num, root_part_den);
            root_part_num = sim_root_part_frac.numer;
            root_part_den = sim_root_part_frac.denom;

            const int_part_str = PH.simplifiedFracString(int_part_num, int_part_den, 'in_front');

            let front_root_sign;
            if (root_part_num < 0) {
                front_root_sign = '-';
                root_part_num *= -1;
            }
            else {
                front_root_sign = '';
            }

            const final_root_expr = PH.simplifiedSqrtString(root_part_num**2 * num_root_under);

            let root_part_str;
            if (root_part_den === 1) {
                root_part_str = front_root_sign + final_root_expr;
            }
            else {
                root_part_str = `${front_root_sign}\\frac{${final_root_expr}}{${root_part_den}}`;
            }
            
            if (
                settings.sim_sqrt_term_order === 'a_plus_root_b' ||
                settings.sim_sqrt_term_order === 'random'
            ) {
                if (root_part_str.charAt(0) === '-') {
                    answer_str = `${int_part_str}${root_part_str}`;
                }
                else {
                    answer_str = `${int_part_str}+${root_part_str}`;
                }
            }
            else if (settings.sim_sqrt_term_order === 'root_b_plus_a') {
                if (int_part_str.charAt(0) === '-') {
                    answer_str = `${root_part_str}${int_part_str}`;
                }
                else {
                    answer_str = `${root_part_str}+${int_part_str}`;
                }
            }
        }
    }

    return {
        question: prompt_str,
        answer: answer_str
    };
}

export const settings_fields = [
    'sim_sqrt_term_order',
    'sim_sqrt_form',
    'sim_sqrt_allow_negatives',
    'sim_sqrt_frac_rule'
];

export const presets = {
    default: function() {
        return {
            sim_sqrt_term_order: 'random',
            sim_sqrt_form: 'all_begin',
            sim_sqrt_allow_negatives: 'yes',
            sim_sqrt_frac_rule: 'together'
        };
    },
    random: function() {
        return {
            sim_sqrt_term_order: '__random__',
            sim_sqrt_form: '__random__',
            sim_sqrt_allow_negatives: '__random__'
        };
    }
};

export const size_adjustments = {
    height: 1.3,
    q_font_size: 1.1,
    a_font_size: 1.1
};