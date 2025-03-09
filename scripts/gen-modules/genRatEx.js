import * as H from '../helper-modules/gen-helpers.js';
import * as PH from '../helper-modules/polynom-helpers.js';
import * as MH from '../helper-modules/math-string-helpers.js';

function processSettings(formObj) {
    let { ratex_add_sub_form, ratex_mul_div_form, general_operation_types, numer_form, denom_form, give_excluded_values } = formObj;
    let error_locations = [];

    // set the operation types if none were selected
    if (general_operation_types === undefined) general_operation_types = ['add','multiply','divide'];

    return {
        ratex_add_sub_form,
        ratex_mul_div_form,
        general_operation_types,
        numer_form,
        denom_form,
        give_excluded_values,
        error_locations
    }
}

export default function genRatEx(formObj) {
    const settings = processSettings(formObj);
    let {ratex_add_sub_form, ratex_mul_div_form, numer_form, denom_form, give_excluded_values} = settings;
    let operation_type = H.randFromList(settings.general_operation_types);

    // deal with 'all' from add-sub or mul-div
    if (ratex_add_sub_form === 'all_add_sub') {
        ratex_add_sub_form = H.randFromList(['as_1','as_2','as_3','as_4','as_5','as_6','as_7','as_8','as_9','as_10','as_11','as_12','as_13','as_14','as_15']);
    }
    if (ratex_mul_div_form === 'all_mul_div') {
        ratex_mul_div_form = H.randFromList(['md_1','md_2','md_3','md_4','md_5','md_6','md_7','md_8','md_9','md_10','md_11','md_12','md_13','md_14','md_15','md_16']);
    }


    const max_fact_size = 7; // (+ or -), defined globally instead of using a dynamic setting for ease of use
    const nz_arr = H.removeFromArray(0, H.integerArray((-1)*max_fact_size, max_fact_size));

    const add_sub = {
        as_1: {
            global_reqs(a,b) {
                return (
                    a > 0 &&
                    b > 0
                );
            },
            add_reqs(a,b) {
                return (
                    a !== (-b)
                );
            },
            sub_reqs(a,b) {
                return (
                    a !== b
                );
            },
            structure(a, b) {
                return {
                    num_A: [1],
                    den_A: [a, 0],
                    num_B: [1],
                    den_B: [b, 0]
                }
            },
            number_of_coefs: 2
        },
        as_2: {
            global_reqs(a,b) {
                return (
                    true
                );
            },
            add_reqs(a,b) {
                return (
                    true
                );
            },
            sub_reqs(a,b) {
                return (
                    a !== b
                );
            },
            structure(a, b) {
                return {
                    num_A: [1],
                    den_A: [1, a],
                    num_B: [1],
                    den_B: [1, b]
                }
            },
            number_of_coefs: 2
        },
        as_3: {
            global_reqs(a,b,c,d) {
                return (
                    true
                );
            },
            add_reqs(a,b,c,d) {
                return (
                    (a !== (-c) || (a*d) !== ((-1)*b*c))
                );
            },
            sub_reqs(a,b,c,d) {
                return (
                    (a !== c || (a*d) !== (b*c))
                );
            },
            structure(a,b,c,d) {
                return {
                    num_A: [a],
                    den_A: [1, b],
                    num_B: [c],
                    den_B: [1, d]
                }
            },
            number_of_coefs: 4
        },
        as_4: {
            global_reqs(a,b,c,d,e) {
                return (
                    b > 0 &&
                    e > 0
                );
            },
            add_reqs(a,b,c,d,e) {
                return (
                    true
                );
            },
            sub_reqs(a,b,c,d,e) {
                return (
                    true
                );
            },
            structure(a,b,c,d,e) {
                return {
                    num_A: [a],
                    den_A: [b, c],
                    num_B: [d],
                    den_B: [e, 0]
                }
            },
            number_of_coefs: 5
        },
        as_5: {
            global_reqs(a,b,c,d,e,f) {
                return (
                    b > 0 &&
                    e > 0
                );
            },
            add_reqs(a,b,c,d,e,f) {
                return (
                    ((a*e) !== ((-1)*b*d) || (a*f) !== ((-1)*c*d))
                );
            },
            sub_reqs(a,b,c,d,e,f) {
                return (
                    ((a*e) !== (b*d) || (a*f) !== (c*d))
                );
            },
            structure(a,b,c,d,e,f) {
                return {
                    num_A: [a],
                    den_A: [b, c],
                    num_B: [d],
                    den_B: [e, f]
                }
            },
            number_of_coefs: 6
        },
        as_6: {
            global_reqs(a,b,c,d,e,f,g,h) {
                return (
                    c > 0 &&
                    g > 0
                );
            },
            add_reqs(a,b,c,d,e,f,g,h) {
                return (
                    ((a*g) !== ((-1)*c*e) || (a*h + b*g + c*f + d*e !== 0) || (b*h) !== ((-1)*d*f))
                );
            },
            sub_reqs(a,b,c,d,e,f,g,h) {
                return (
                    ((a*g) !== (c*e) || (a*h + b*g) !== (c*f + d*e) || (b*h) !== (d*f))
                );
            },
            structure(a,b,c,d,e,f,g,h) {
                return {
                    num_A: [a, b],
                    den_A: [c, d],
                    num_B: [e, f],
                    den_B: [g, h]
                }
            },
            number_of_coefs: 8
        },
        as_7: {
            global_reqs(a,b,c,d,e,f) {
                return (
                    c > 0 &&
                    f > 0 &&
                    f !== 1
                );
            },
            add_reqs(a,b,c,d,e,f) {
                return (
                    ((a*f) !== ((-1)*c*e) || (b*f) !== ((-1)*d*e))
                );
            },
            sub_reqs(a,b,c,d,e,f) {
                return (
                    ((a*f) !== (c*e) || (b*f) !== (d*e))
                );
            },
            structure(a,b,c,d,e,f) {
                return {
                    num_A: [a, b],
                    den_A: [c, d],
                    num_B: [e],
                    den_B: [f]
                }
            },
            number_of_coefs: 6
        },
        as_8: {
            global_reqs(a,d,e,f,A) {
                return (
                    true
                );
            },
            add_reqs(a,d,e,f,A) {
                return (
                    true
                );
            },
            sub_reqs(a,d,e,f,A) {
                return (
                    true
                );
            },
            structure(a,d,e,f,A) {
                return {
                    num_A: [a],
                    den_A: [1, e + A, e*A],
                    num_B: [d],
                    den_B: [1, e]
                }
            },
            number_of_coefs: 5,
            transformed_coefs: ['b','c']
        },
        as_9: {
            global_reqs(a,b,c,d) {
                return (
                    b > 0
                );
            },
            add_reqs(a,b,c,d) {
                return (
                    true
                );
            },
            sub_reqs(a,b,c,d) {
                return (
                    true
                );
            },
            structure(a,b,c,d) {
                return {
                    num_A: [1, a],
                    den_A: [b, c, 0],
                    num_B: [d],
                    den_B: [b, c]
                }
            },
            number_of_coefs: 4
        },
        as_10: {
            global_reqs(a,b,c,d,e) {
                return (
                    b > 0 &&
                    e > 0
                );
            },
            add_reqs(a,b,c,d,e) {
                return (
                    true
                );
            },
            sub_reqs(a,b,c,d,e) {
                return (
                    true
                );
            },
            structure(a,b,c,d,e) {
                return {
                    num_A: [a],
                    den_A: [b, c, 0],
                    num_B: [d],
                    den_B: [e, 0]
                }
            },
            number_of_coefs: 5
        },
        as_11: {
            global_reqs(a,d,e,A) {
                return (
                    true
                );
            },
            add_reqs(a,d,e,A) {
                return (
                    true
                );
            },
            sub_reqs(a,d,e,A) {
                return (
                    true
                );
            },
            structure(a,d,e,A) {
                return {
                    num_A: [1, a],
                    den_A: [1, e + A, e*A],
                    num_B: [1, d],
                    den_B: [1, e]
                }
            },
            number_of_coefs: 4,
            transformed_coefs: ['b','c']
        },
        as_12: {
            global_reqs(a,d,e,A,B) {
                return (
                    e > 0 &&
                    e !== 1
                );
            },
            add_reqs(a,d,e,A,B) {
                return (
                    true
                );
            },
            sub_reqs(a,d,e,A,B) {
                return (
                    true
                );
            },
            structure(a,d,e,A,B) {
                return {
                    num_A: [1, a],
                    den_A: [1, A + B, A*B],
                    num_B: [d],
                    den_B: [e]
                }
            },
            number_of_coefs: 5,
            transformed_coefs: ['b','c']
        },
        as_13: {
            global_reqs(a,b,c,d) {
                return (
                    b > 0 &&
                    d > 0
                );
            },
            add_reqs(a,b,c,d) {
                return (
                    true
                );
            },
            sub_reqs(a,b,c,d) {
                return (
                    true
                );
            },
            structure(a,b,c,d) {
                return {
                    num_A: [a],
                    den_A: [b, 0, 0],
                    num_B: [c],
                    den_B: [d, 0]
                }
            },
            number_of_coefs: 4
        },
        as_14: {
            global_reqs(a,b,c) {
                return (
                    true
                );
            },
            add_reqs(a,b,c) {
                return (
                    true
                );
            },
            sub_reqs(a,b,c) {
                return (
                    true
                );
            },
            structure(a,b,c) {
                return {
                    num_A: [a],
                    den_A: [1, b],
                    num_B: [c],
                    den_B: [1, -b]
                }
            },
            number_of_coefs: 3
        },
        as_15: {
            global_reqs(a,b,c) {
                return (
                    true
                );
            },
            add_reqs(a,b,c) {
                return (
                    true
                );
            },
            sub_reqs(a,b,c) {
                return (
                    true
                );
            },
            structure(a,b,c) {
                return {
                    num_A: [1, a],
                    den_A: [1, 0, (-1)*b**2],
                    num_B: [1, c],
                    den_B: [1, b]
                }
            },
            number_of_coefs: 3
        },
    };

    const mul_div = {
        md_1: {
            global_reqs(a,b,c,d) {
                return (
                    d > 0 &&
                    d !== 1
                );
            },
            mul_reqs(a,b,c,d) {
                return (
                    true
                );
            },
            div_reqs(a,b,c,d) {
                return (
                    true
                );
            },
            structure(a,b,c,d) {
                return {
                    num_A: [a],
                    den_A: [1, b],
                    num_B: [1, c],
                    den_B: [d]
                }
            },
            number_of_coefs: 4
        },
        md_2: {
            global_reqs(a,b,c,d) {
                return (
                    true
                );
            },
            mul_reqs(a,b,c,d) {
                return (
                    true
                );
            },
            div_reqs(a,b,c,d) {
                return (
                    true
                );
            },
            structure(a,b,c,d) {
                return {
                    num_A: [a],
                    den_A: [1, b],
                    num_B: [c],
                    den_B: [1, d]
                }
            },
            number_of_coefs: 4
        },
        md_3: {
            global_reqs(a,b,c,d) {
                return (
                    b > 0 &&
                    b !== 1
                );
            },
            mul_reqs(a,b,c,d) {
                return (
                    d !== a &&
                    d !== c
                );
            },
            div_reqs(a,b,c,d) {
                return (
                    c !== a &&
                    c !== d
                );
            },
            structure(a,b,c,d) {
                return {
                    num_A: [1, a],
                    den_A: [b],
                    num_B: [1, c],
                    den_B: [1, d]
                }
            },
            number_of_coefs: 4
        },
        md_4: {
            global_reqs(a,b,c,d) {
                return (
                    d > 0 &&
                    d !== 1
                );
            },
            mul_reqs(a,b,c,d) {
                return (
                    b !== a &&
                    b !== c
                );
            },
            div_reqs(a,b,c,d) {
                return (
                    true
                );
            },
            structure(a,b,c,d) {
                return {
                    num_A: [1, a],
                    den_A: [1, b],
                    num_B: [1, c],
                    den_B: [d]
                }
            },
            number_of_coefs: 4
        },
        md_5: {
            global_reqs(a,b,c,d) {
                return (
                    true
                );
            },
            mul_reqs(a,b,c,d) {
                return (
                    true
                );
            },
            div_reqs(a,b,c,d) {
                return (
                    true
                );
            },
            structure(a,b,c,d) {
                return {
                    num_A: [1, a],
                    den_A: [1, b],
                    num_B: [1, c],
                    den_B: [1, d]
                }
            },
            number_of_coefs: 4
        },
        md_6: {
            global_reqs(a,b,c,d) {
                return (
                    b > 0 &&
                    d > 0 &&
                    b !== 1
                );
            },
            mul_reqs(a,b,c,d) {
                return (
                    true
                );
            },
            div_reqs(a,b,c,d) {
                return (
                    true
                );
            },
            structure(a,b,c,d) {
                return {
                    num_A: [a, 0],
                    den_A: [b],
                    num_B: [c],
                    den_B: [d, 0]
                }
            },
            number_of_coefs: 4
        },
        md_7: {
            global_reqs(a,b,c,d) {
                return (
                    b > 0 &&
                    d > 0
                );
            },
            mul_reqs(a,b,c,d) {
                return (
                    true
                );
            },
            div_reqs(a,b,c,d) {
                return (
                    true
                );
            },
            structure(a,b,c,d) {
                return {
                    num_A: [a],
                    den_A: [b, 0],
                    num_B: [c],
                    den_B: [d, 0]
                }
            },
            number_of_coefs: 4
        },
        md_8: {
            global_reqs(a,d,e,A,B) {
                return (
                    true
                );
            },
            mul_reqs(a,d,e,A,B) {
                return (
                    A === d
                );
            },
            div_reqs(a,d,e,A,B) {
                return (
                    A === e
                );
            },
            structure(a,d,e,A,B) {
                return {
                    num_A: [a],
                    den_A: [1, e + A, e*A],
                    num_B: [1, d],
                    den_B: [1, e]
                }
            },
            number_of_coefs: 5,
            transformed_coefs: ['b','c']
        },
        md_9: {
            global_reqs(a,d,e,A,B) {
                return (
                    e > 0 &&
                    e !== 1
                );
            },
            mul_reqs(a,d,e,A,B) {
                return (
                    true
                );
            },
            div_reqs(a,d,e,A,B) {
                return (
                    A === a
                );
            },
            structure(a,d,e,A,B) {
                return {
                    num_A: [1, a],
                    den_A: [1, e + A, e*A],
                    num_B: [1, d],
                    den_B: [e]
                }
            },
            number_of_coefs: 5,
            transformed_coefs: ['b','c']
        },
        md_10: {
            global_reqs(a,d,e,A,B) {
                return (
                    true
                );
            },
            mul_reqs(a,d,e,A,B) {
                return (
                    (A === a || A === d)
                );
            },
            div_reqs(a,d,e,A,B) {
                return (
                    (A === a || A === e)
                );
            },
            structure(a,d,e,A,B) {
                return {
                    num_A: [1, a],
                    den_A: [1, e + A, e*A],
                    num_B: [1, d],
                    den_B: [1, e]
                }
            },
            number_of_coefs: 5,
            transformed_coefs: ['b','c']
        },
        md_11: {
            global_reqs(a,f,A,B,C,D) {
                return (
                    true
                );
            },
            mul_reqs(a,f,A,B,C,D) {
                return (
                    (A === C || A === a || C === f)
                );
            },
            div_reqs(a,f,A,B,C,D) {
                return (
                    ((A === a && C === f) || (C === a && A === f))
                );
            },
            structure(a,f,A,B,C,D) {
                return {
                    num_A: [1, a],
                    den_A: [1, A + B, A*B],
                    num_B: [1, C + D, C*D],
                    den_B: [1, f]
                }
            },
            number_of_coefs: 6,
            transformed_coefs: ['b','c','d','e']
        },
        md_12: {
            global_reqs(a,d,A,B,C,D) {
                return (
                    true
                );
            },
            mul_reqs(a,d,A,B,C,D) {
                return (
                    ((A === a && C === d) || (C === a && A === d))
                );
            },
            div_reqs(a,d,A,B,C,D) {
                return (
                    (A === C || A === a || C === d)
                );
            },
            structure(a,d,A,B,C,D) {
                return {
                    num_A: [1, a],
                    den_A: [1, A + B, A*B],
                    num_B: [1, d],
                    den_B: [1, C + D, C*D]
                }
            },
            number_of_coefs: 6,
            transformed_coefs: ['b','c','e','f']
        },
        md_13: {
            global_reqs(c,A,B,C,D,E,F) {
                return (
                    true
                );
            },
            mul_reqs(c,A,B,C,D,E,F) {
                let switcher = H.randInt(0,2);
    
                if (switcher === 0) return (C === c && A === E && F !== D && F !== B);
                else if (switcher === 1) return (C === E && A === F && c !== B && c !== D);
                else return (A === F && C === c && E !== B && E !== D);
            },
            div_reqs(c,A,B,C,D,E,F) {
                let switcher = H.randInt(0,2);
    
                if (switcher === 0) return (A === c && B === C && D !== E && D !== F);
                else if (switcher === 1) return (E === c && A === D && C !== B && C !== F);
                else return (E === C && A === D && c !== B && c !== F);
            },
            structure(c,A,B,C,D,E,F) {
                return {
                    num_A: [1, A + B, A*B],
                    den_A: [1, c],
                    num_B: [1, C + D, C*D],
                    den_B: [1, E + F, E*F]
                }
            },
            number_of_coefs: 7,
            transformed_coefs: ['a','b','d','e','f','g']
        },
        md_14: {
            global_reqs(A,B,C,D,E,F,G,H) {
                return (
                    true
                );
            },
            mul_reqs(A,B,C,D,E,F,G,H) {
                let switcher = Math.floor(Math.random() * (3 - 0 + 1)) + 0;
    
                if (switcher === 0) return (A == C && E === G);
                else if (switcher === 1) return (A === C && B === G);
                else if (switcher === 2) return (F === C && E === G);
                else return (E === C && A === G);
            },
            div_reqs(A,B,C,D,E,F,G,H) {
                let switcher = Math.floor(Math.random() * (3 - 0 + 1)) + 0;
    
                if (switcher === 0) return (A === C && G === E);
                else if (switcher === 1) return (A === C && B === E);
                else if (switcher === 2) return (H === C && G === E);
                else return (H === C && B === E);
            },
            structure(A,B,C,D,E,F,G,H) {
                return {
                    num_A: [1, A + B, A*B],
                    den_A: [1, C + D, C*D],
                    num_B: [1, E + F, E*F],
                    den_B: [1, G + H, G*H]
                }
            },
            number_of_coefs: 8,
            transformed_coefs: ['a','b','c','d','e','f','g','h']
        },
        md_15: {
            global_reqs(a,b,c,d,e) {
                return (
                    b > 0
                );
            },
            mul_reqs(a,b,c,d,e) {
                return (
                    true
                );
            },
            div_reqs(a,b,c,d,e) {
                return (
                    true
                );
            },
            structure(a,b,c,d,e) {
                return {
                    num_A: [a, 0],
                    den_A: [b, c, 0],
                    num_B: [1, d],
                    den_B: [1, e]
                }
            },
            number_of_coefs: 5
        },
        md_16: {
            global_reqs(a,b,c,d,e,f) {
                return (
                    c > 0
                );
            },
            mul_reqs(a,b,c,d,e,f) {
                return (
                    true
                );
            },
            div_reqs(a,b,c,d,e,f) {
                return (
                    true
                );
            },
            structure(a,b,c,d,e,f) {
                return {
                    num_A: [a, b, 0],
                    den_A: [c, d, 0],
                    num_B: [1, e],
                    den_B: [1, f]
                }
            },
            number_of_coefs: 6
        }
    };

    // backup coef arrays in case generation takes too long 
    const backups = {
        "as_1": {"add": [[6,6],[1,7],[5,3],[5,6],[7,4],[6,7],[5,7],[7,5],[2,1],[2,4]],"subtract": [[4,1],[2,3],[6,3],[5,7],[7,2],[3,6],[4,7],[1,3],[7,3],[2,6]]},"as_2": {"add": [[7,-7],[-1,5],[-3,2],[4,3],[1,5],[-2,-1],[-3,4],[2,3],[-5,2],[3,3]],"subtract": [[7,-5],[5,-6],[4,-1],[-3,1],[2,-7],[1,-3],[-2,-7],[1,-4],[4,5],[-2,-3]]},"as_3": {"add": [[-4,-3,2,1],[-7,4,2,6],[-2,5,7,3],[1,-1,-3,-2],[3,7,-2,7],[-2,7,-1,-6],[2,-6,2,-7],[4,6,1,-1],[2,-4,6,3],[-3,-4,-7,-2]],"subtract": [[5,3,1,4],[2,1,-1,-6],[-4,6,2,-3],[-4,1,-2,-7],[-5,-3,-5,6],[-4,5,-6,7],[-2,-7,-4,2],[4,1,-5,4],[7,4,1,3],[-4,2,1,1]]},"as_4": {"add": [[1,2,4,-3,2],[7,3,-4,-5,7],[-2,7,-1,-2,1],[-5,2,3,-1,6],[6,6,-4,7,4],[-5,1,6,4,4],[-2,2,-2,5,7],[6,6,4,-5,5],[-3,6,4,-4,2],[-6,6,2,-3,7]],"subtract": [[7,3,-1,-4,1],[-5,4,-1,-4,7],[-3,2,-6,1,7],[-1,6,-7,-4,6],[4,2,6,5,2],[-1,1,-5,-3,5],[-3,7,6,6,1],[-3,7,5,-1,7],[5,5,-5,-5,1],[-4,3,5,3,3]]},"as_5": {"add": [[2,1,-3,1,4,7],[-4,3,-3,2,5,2],[6,6,7,-1,7,-1],[2,1,-1,-6,2,5],[1,1,6,3,1,6],[3,5,-5,4,1,-2],[4,6,-6,-4,3,3],[5,3,-6,1,6,4],[4,4,-2,-5,3,-4],[-5,6,-7,-4,5,-5]],"subtract": [[4,1,5,-5,6,-2],[-7,2,2,6,7,-1],[3,2,-7,4,4,-4],[2,7,-3,2,6,1],[-2,2,7,-1,6,-4],[-2,5,-2,-4,5,3],[3,4,7,3,5,2],[7,4,5,5,2,-2],[-2,3,-2,-7,3,5],[-6,1,4,-4,1,1]]},"as_6": {"add": [[-5,-5,4,-4,1,1,3,-3],[6,3,2,7,-1,7,4,6],[-7,-1,2,-6,6,-5,4,-3],[-7,1,4,3,7,-1,1,-5],[-7,-5,3,-5,5,6,7,-4],[1,-2,5,5,6,7,7,-4],[4,5,6,2,-7,-1,5,-4],[3,-1,3,1,-1,1,3,-5],[-3,-5,5,-4,-1,4,5,4],[-7,-5,7,1,-5,-2,3,7]],"subtract": [[-5,3,1,1,4,-5,3,-3],[4,1,5,-2,2,1,5,-1],[-4,6,4,-5,5,-3,3,-3],[1,-4,4,7,7,7,7,-6],[1,-4,3,1,2,2,3,3],[5,-6,5,3,7,-1,4,2],[-2,-5,1,-5,7,-3,2,-3],[6,-4,2,-6,7,2,4,4],[3,-4,7,-6,-7,-3,4,-1],[7,2,7,6,7,6,7,2]]},"as_7": {"add": [[4,6,4,-7,-6,4],[-1,-3,5,-4,-1,6],[4,7,2,-7,3,3],[-4,2,1,1,-4,6],[2,5,3,3,-5,7],[2,-7,5,2,1,4],[1,-5,5,-6,4,3],[-7,6,5,2,-4,5],[3,7,3,2,7,6],[-3,-7,4,3,-1,3]],"subtract": [[-7,1,3,-7,6,5],[-2,-2,7,4,-1,5],[6,-7,3,1,-5,6],[-4,7,4,-5,-1,5],[-1,6,2,-7,-4,4],[-2,1,3,-5,-6,4],[-2,7,1,1,-1,4],[-5,1,5,2,1,5],[5,-7,3,-6,-5,2],[-7,4,1,1,4,5]]},"as_8": {"add": [[-2,-3,3,-5,-6],[-4,7,1,-5,6],[-3,-3,4,2,2],[1,3,-1,-2,6],[-5,-6,7,-5,-6],[-3,2,1,6,7],[-6,-4,-4,2,-2],[6,1,1,3,3],[-4,-6,-6,-5,-4],[4,5,7,7,-1]],"subtract": [[7,-5,4,1,4],[4,7,7,1,-5],[4,-1,3,7,5],[-4,3,1,-3,-5],[-2,3,4,-2,4],[-1,3,-1,-4,2],[-3,-1,-7,1,6],[-7,-5,-1,-7,3],[1,-4,-3,1,-3],[-4,7,-6,-4,1]]},"as_9": {"add": [[6,2,-7,-2],[-5,2,-1,6],[-2,4,7,4],[1,4,4,-5],[-5,1,3,-4],[6,2,3,7],[-3,3,-7,6],[-6,4,-6,-3],[1,4,-1,7],[-7,5,-2,6]],"subtract": [[6,6,5,-5],[-2,1,-6,-1],[-6,7,1,-6],[7,1,6,-3],[-6,3,2,2],[1,5,2,3],[-6,7,6,6],[2,3,-1,-2],[-6,7,2,5],[-4,3,-1,-3]]},"as_10": {"add": [[-7,6,-4,-2,4],[-1,3,3,-3,3],[5,3,2,7,6],[-3,2,3,3,7],[7,2,-6,1,2],[-1,1,5,5,7],[3,7,-5,6,3],[7,7,7,-6,5],[-7,3,-6,7,3],[1,7,1,-6,2]],"subtract": [[5,6,7,-5,1],[-3,6,1,6,1],[-3,1,-3,-6,3],[4,4,4,4,6],[-2,3,3,3,1],[4,3,2,-5,6],[-3,5,-7,-5,3],[-6,3,-3,5,2],[-3,5,1,-3,2],[-3,1,1,-2,5]]},"as_11": {"add": [[2,3,3,-5],[-2,-4,-5,1],[-6,3,-4,4],[-4,2,-4,-3],[-4,-5,5,4],[-1,7,7,5],[7,-5,-2,-5],[7,-6,3,4],[2,-6,-6,3],[1,-6,-2,2]],"subtract": [[1,-4,7,-3],[2,5,3,4],[-7,2,-1,-6],[7,-1,-5,3],[1,3,1,7],[7,-4,2,-7],[2,6,5,3],[2,-2,6,-2],[1,-7,2,6],[-2,-7,6,-7]]},"as_12": {"add": [[1,-1,2,2,-6],[-2,1,3,-1,3],[-5,5,4,4,-5],[-5,-2,3,-7,6],[-5,-5,3,-7,-2],[2,5,5,-7,-6],[-1,-1,4,-6,-1],[5,2,2,-1,6],[-4,2,3,6,3],[-1,-5,5,1,4]],"subtract": [[3,-3,2,-1,-4],[3,1,4,7,3],[-3,2,6,-3,5],[-3,6,4,-5,-4],[4,-2,4,4,-6],[-1,5,3,3,4],[-7,-7,3,-5,-7],[6,-5,5,-7,-5],[6,7,6,7,6],[3,-4,4,1,5]]},"as_13": {"add": [[3,7,-7,7],[7,1,-7,4],[-2,4,2,7],[-7,4,-2,6],[-4,4,-4,5],[1,4,-1,6],[5,3,-2,1],[-3,6,6,1],[-3,6,4,4],[5,5,4,1]],"subtract": [[-1,4,-5,6],[1,2,1,6],[-5,4,-6,7],[6,4,-1,6],[-5,1,-1,5],[2,5,3,7],[1,2,7,4],[-5,3,3,4],[-2,2,-3,1],[4,2,-4,1]]},"as_14": {"add": [[-3,-5,-2],[5,-2,-4],[-5,-7,6],[-5,-6,-2],[-4,3,1],[3,-6,-4],[-7,1,-2],[2,4,-1],[3,-1,-4],[-6,-7,-6]],"subtract": [[-5,-5,3],[5,-6,-6],[-6,-5,-6],[-6,5,2],[-6,7,5],[-1,-6,-6],[-6,7,3],[6,1,4],[4,-1,6],[-1,4,3]]},"as_15": {"add": [[6,-1,7],[-1,1,4],[2,7,-1],[2,7,-5],[4,-5,-5],[-5,5,-2],[4,-5,-2],[-7,1,-3],[-6,6,1],[3,-4,-3]],"subtract": [[-1,-5,5],[-1,3,4],[-7,1,-5],[-2,7,-4],[-4,-1,-5],[-6,7,7],[7,-6,6],[-2,-7,6],[-5,-5,7],[-3,-7,-4]]},"md_1": {"multiply": [[1,-5,7,3],[6,1,-7,4],[-6,2,1,4],[2,5,6,7],[6,-4,1,5],[7,7,3,2],[-2,-4,-4,3],[-1,-3,3,5],[6,-6,4,4],[2,-5,4,2]],"divide": [[3,-4,2,7],[-1,-3,-5,4],[-6,-4,-2,7],[-1,-3,2,7],[-1,-4,3,4],[-2,-4,-7,4],[-1,4,2,6],[5,-3,-7,4],[6,5,-3,5],[7,6,-3,5]]},"md_2": {"multiply": [[-1,3,1,-1],[-1,5,6,-1],[-5,-3,3,-6],[-6,-7,7,-4],[-7,2,-3,-6],[-7,-3,3,2],[3,5,-4,-5],[-4,-4,7,-3],[-1,-7,4,-2],[4,7,7,-7]],"divide": [[3,1,6,-5],[-2,7,7,-5],[-7,-3,-1,4],[-2,3,-2,-6],[6,-1,7,-1],[-3,1,2,-1],[-1,-3,-2,-7],[4,-3,5,2],[6,-7,1,1],[-1,-7,-7,7]]},"md_3": {"multiply": [[-1,5,-6,-2],[-4,4,-2,1],[-4,7,-6,4],[-4,7,3,-5],[-6,5,3,4],[-2,6,2,-6],[-6,3,3,6],[5,4,-5,-2],[6,6,4,-6],[-7,5,-4,7]],"divide": [[-5,6,4,1],[-2,3,4,-5],[5,3,-6,6],[-7,5,-4,2],[7,4,-7,-4],[-2,3,-6,-3],[-4,6,7,-3],[7,7,-3,-5],[-1,7,-4,1],[5,3,-5,4]]},"md_4": {"multiply": [[-7,2,-6,7],[-3,-5,2,2],[-2,-7,-1,2],[-2,4,1,2],[-3,1,-4,4],[6,5,-3,5],[4,-3,-5,7],[2,-3,2,3],[-3,4,3,4],[1,4,-2,7]],"divide": [[1,7,7,6],[-7,6,3,7],[7,4,-1,5],[1,6,1,6],[-1,-3,-6,2],[2,6,6,4],[-6,7,-4,3],[4,-1,-3,2],[4,-2,7,6],[-3,2,7,3]]},"md_5": {"multiply": [[-5,2,3,-1],[1,4,5,1],[7,-5,3,-3],[-5,-5,1,-1],[-6,-7,2,-1],[-6,-7,-6,-6],[-2,-2,-2,-7],[2,-5,-7,-3],[5,1,-3,2],[-6,4,7,4]],"divide": [[7,3,3,1],[-4,1,-1,-4],[4,7,3,-6],[-5,-1,-2,2],[4,6,-4,-5],[2,-6,6,5],[4,-6,3,-4],[-5,-1,-3,-6],[-4,-3,1,3],[-4,-7,7,3]]},"md_6": {"multiply": [[-1,3,2,4],[3,7,3,2],[-5,6,-1,7],[-5,2,3,5],[-5,4,-5,3],[1,3,6,7],[-2,6,6,3],[1,7,-6,6],[-7,2,-6,7],[-2,2,-1,5]],"divide": [[4,3,1,3],[2,4,4,7],[-5,5,-3,5],[-4,6,2,6],[-7,6,1,2],[-4,5,-1,7],[-2,3,-7,2],[7,5,4,7],[-4,7,2,4],[-2,2,6,6]]},"md_7": {"multiply": [[-4,1,4,7],[-4,2,-5,4],[-6,2,-1,1],[3,4,2,2],[-5,4,7,6],[2,4,2,1],[7,3,-2,6],[1,3,-3,6],[-7,7,-6,6],[-3,4,-5,3]],"divide": [[-2,1,-3,1],[-5,4,5,4],[3,2,-5,7],[-1,3,4,1],[-2,2,3,3],[-5,5,4,4],[-5,5,2,2],[2,7,4,5],[1,6,-6,2],[2,6,2,2]]},"md_8": {"multiply": [[-1,2,5,2,1],[-7,3,7,3,-1],[-5,-4,-4,-4,7],[4,2,4,2,-5],[-6,7,2,7,4],[1,-5,3,-5,7],[7,6,6,6,-2],[-5,7,-4,7,-1],[6,-7,-5,-7,1],[-6,-2,-4,-2,7]],"divide": [[-6,-5,-4,-4,2],[2,2,5,5,-2],[-4,-3,3,3,-7],[-3,-6,-5,-5,-3],[-1,7,2,2,3],[-6,3,2,2,-1],[3,2,-6,-6,-2],[-5,4,-3,-3,-2],[-1,-2,2,2,-2],[7,-2,4,4,-1]]},"md_9": {"multiply": [[7,-6,5,2,-5],[6,4,5,3,6],[4,-2,3,2,6],[-3,-3,7,-6,2],[3,2,2,1,6],[-2,-6,7,-6,-4],[-3,-5,3,-4,-2],[6,-3,4,5,-4],[3,7,4,5,3],[7,-3,7,-6,-1]],"divide": [[4,3,4,4,-3],[7,2,6,7,7],[5,7,5,5,-6],[-1,5,5,-1,-4],[-6,1,7,-6,-2],[-7,-1,7,-7,7],[-2,2,6,-2,-7],[6,-3,4,6,6],[1,-6,4,1,-5],[7,4,5,7,4]]},"md_10": {"multiply": [[5,7,-2,7,5],[-3,-7,-2,-3,4],[-2,7,-1,7,-7],[3,-7,4,3,-4],[1,-3,-3,-3,6],[1,-6,-3,1,-6],[7,-2,-1,7,6],[4,-1,4,4,-2],[1,-4,3,1,-1],[-4,6,5,6,-6]],"divide": [[3,5,-7,-7,2],[-3,2,-7,-7,-2],[-6,5,4,4,2],[-2,-7,-3,-3,-7],[7,-3,4,7,5],[4,3,-3,4,4],[2,4,-6,-6,-1],[4,-6,3,4,-7],[3,-3,7,3,1],[5,5,-1,5,-7]]},"md_11": {"multiply": [[-7,3,-7,6,7,1],[-5,-3,-5,-7,-7,-3],[1,-5,-4,4,-4,6],[3,-3,-3,-4,-3,2],[-2,-3,-2,-3,2,7],[-1,7,-1,2,-3,3],[-5,4,-7,-6,4,1],[-4,-4,-4,-2,-4,5],[7,-5,7,-7,6,7],[1,6,-7,3,6,-7]],"divide": [[6,3,3,4,6,-5],[6,-2,-2,6,6,-7],[-4,-7,-7,2,-4,4],[-7,4,-7,7,4,-1],[-5,5,5,-3,-5,-3],[-6,5,5,7,-6,-4],[4,-4,-4,4,4,-5],[-5,6,6,3,-5,6],[5,1,5,1,1,-7],[2,1,2,5,1,5]]},"md_12": {"multiply": [[-5,-4,-4,-5,-5,2],[1,-5,-5,-6,1,-1],[1,-5,-5,1,1,1],[2,-6,-6,-4,2,7],[-5,-3,-5,-6,-3,-3],[-5,-2,-5,-2,-2,-2],[4,2,4,-2,2,2],[-1,-4,-4,7,-1,1],[-4,4,-4,3,4,2],[3,7,7,-2,3,1]],"divide": [[-4,1,-4,-4,-2,-5],[4,-2,4,7,3,-5],[2,1,2,-3,2,-7],[2,-6,2,4,-4,6],[-2,3,-2,-7,5,-2],[3,-6,-6,-6,-6,-7],[-7,2,-2,1,-2,4],[-2,-6,4,1,4,-4],[5,-2,4,-1,4,-4],[-2,-2,6,4,-2,5]]},"md_13": {"multiply": [[-2,-1,2,-2,1,-1,-5],[2,-1,-7,2,-3,-1,-1],[7,-6,-7,7,-5,-6,-6],[-6,7,-2,7,2,7,7],[6,-3,-3,6,7,-6,-3],[5,-2,1,5,-4,-2,3],[-3,7,4,2,3,2,7],[-5,-4,2,-4,-6,-4,-4],[-7,-5,1,5,-1,5,-5],[-3,-4,3,-3,-2,-4,6]],"divide": [[2,2,1,1,7,4,3],[-6,-1,-7,6,-1,-6,-3],[6,4,-7,-1,4,-1,5],[2,4,-3,-1,4,-1,6],[-1,-1,2,6,-1,-1,5],[6,6,2,2,6,-4,-5],[-5,-5,1,1,1,2,5],[-1,-2,-3,-7,-2,-1,-6],[-7,-7,-6,3,-7,-7,-1],[-4,-4,-6,-5,-4,-4,2]]},"md_14": {"multiply": [[3,6,6,-6,6,-4,3,-7],[-6,-4,-6,5,1,-1,1,1],[1,4,1,-2,7,1,4,-2],[7,-2,7,-5,-3,1,-3,2],[1,-2,1,-1,-2,5,-2,-1],[1,3,1,2,-2,-1,3,-4],[-7,-5,-7,-5,-4,1,-4,-7],[-1,-7,-1,5,-5,3,-5,7],[5,2,2,1,4,2,4,2],[3,6,-1,6,-1,7,3,-7]],"divide": [[5,5,5,-7,-7,3,-7,5],[6,2,6,6,2,-6,-6,-7],[7,-3,7,-1,-7,6,-7,1],[-7,4,-7,2,4,-6,-2,-2],[-6,-5,-6,-3,-5,-3,6,5],[2,-4,2,-1,-4,4,6,-6],[-2,-2,-2,-3,-3,7,-3,-2],[2,6,2,6,-5,-5,-5,-7],[-4,-2,3,3,-2,-2,-6,3],[-2,-2,-5,7,-2,6,-1,-5]]},"md_15": {"multiply": [[-2,6,-6,1,5],[-2,5,-4,-7,-7],[-1,5,-4,-2,3],[-2,3,3,-7,2],[4,7,4,3,5],[-7,6,2,1,-7],[-3,3,4,5,3],[-2,1,-1,-4,7],[1,7,1,7,6],[-2,3,5,-7,-4]],"divide": [[5,4,-5,-4,1],[-7,3,-2,2,-3],[-2,6,-5,-4,4],[3,2,1,-6,1],[-1,7,-5,-7,6],[-1,6,3,-6,-1],[3,3,5,-5,2],[-5,6,-3,-1,1],[-5,2,-1,6,7],[1,2,-3,-3,5]]},"md_16": {"multiply": [[-5,-4,1,5,4,-3],[3,2,3,5,-5,-4],[-4,1,3,1,-3,-3],[6,-2,2,-1,7,1],[-2,-2,5,-5,3,2],[2,2,4,5,-7,-7],[-7,7,3,3,3,5],[4,-1,2,2,5,-3],[-6,-2,6,1,-3,5],[-4,-5,7,-2,-3,-3]],"divide": [[-2,5,1,4,6,4],[3,-4,3,5,1,2],[3,6,3,-3,2,5],[-6,3,6,-7,-1,1],[1,-4,4,-6,-7,4],[6,4,5,1,-7,7],[-6,-2,7,3,-6,2],[-7,-2,5,-2,2,7],[-2,1,1,-7,6,-7],[-3,5,2,4,1,-6]]}
    }

    // pull out the object for the prompt that is being used and the apropriate check function
    let current_Q_obj; // current question object ('as_1: {}', 'md_5: {}', etc)
    let operation_reqs; // check the reqs specific to the operation (whether add, sub, mul, or div)
    let current_form_name; // the string version of the name of whichever form is being used ('as_4', 'md_5', etc)
    let operation_symbol;
    if (operation_type === 'add') {
        current_Q_obj = add_sub[ratex_add_sub_form];
        operation_reqs = current_Q_obj.add_reqs;
        operation_symbol = '+';
        current_form_name = ratex_add_sub_form;
    }
    else if (operation_type === 'subtract') {
        current_Q_obj = add_sub[ratex_add_sub_form];
        operation_reqs = current_Q_obj.sub_reqs;
        operation_symbol = '-';
        current_form_name = ratex_add_sub_form;
    }
    else if (operation_type === 'multiply') {
        current_Q_obj = mul_div[ratex_mul_div_form];
        operation_reqs = current_Q_obj.mul_reqs;
        operation_symbol = '\\cdot';
        current_form_name = ratex_mul_div_form;
    }
    else if (operation_type === 'divide') {
        current_Q_obj = mul_div[ratex_mul_div_form];
        operation_reqs = current_Q_obj.div_reqs;
        operation_symbol = '\\div';
        current_form_name = ratex_mul_div_form;
    }
    let global_reqs = current_Q_obj.global_reqs; // check the reqs for the prompt (which are needed regaurdless of the operation)

    
    // first, we need to find a set of coefs that is valid for the given template and operation
    const number_of_coefs = current_Q_obj.number_of_coefs; 
    let sol_is_found = false;
    let current_coef_arr; // the coef array of the current iteration
    let final_coef_arr; // the first valid coef array we can find
    const max_runs = 12000; // maximum number of times the solution search loop is allowed to run
    let current_runs = 0;
    while (!sol_is_found && current_runs < max_runs) { 
        current_coef_arr = [];

        for (let i = 0; i < number_of_coefs; i++) {
            current_coef_arr[i] = H.randFromList(nz_arr);
        }
        
        if (operation_reqs(...current_coef_arr) && global_reqs(...current_coef_arr)) {
            final_coef_arr = [...current_coef_arr];
            sol_is_found = true;
        }

        current_runs++;
    }

    // loop that should only ever run once or twice (if the original sol string has NaN, Infinity etc)
    let final_prompt, final_answer, TeX_answer; 
    const max_regens = 20; // still set a max number (so we don't get stuck in the while loop)
    let current_regens = 0;
    while (++current_regens <= max_regens) {
        if (!sol_is_found) { // use a backup template if a sol wasn't found in time OR if we jumped back here after finding NaN, Infinity, etc
            final_coef_arr = H.randFromList(backups[current_form_name][operation_type]);
        }

        // Next, we can use the valid coefs we got to get a prompt in math and calculate a template for the answer
        let prompt_template = current_Q_obj.structure(...final_coef_arr);
        let num_A = prompt_template.num_A;
        let den_A = prompt_template.den_A;
        let num_B = prompt_template.num_B;
        let den_B = prompt_template.den_B;
        final_prompt = MH.fraction(PH.polyTemplateToMath(num_A), PH.polyTemplateToMath(den_A)) + operation_symbol + MH.fraction(PH.polyTemplateToMath(num_B), PH.polyTemplateToMath(den_B));

        // helper function for this specific use case (degree 0 through 2) {not generalizable}
        function getPolynomZeros(poly_template) { 
            if (poly_template.length === 3) { // quadratic (use QF)
                let [a, b, c] = poly_template;

                if (poly_template[poly_template.length - 1] === 0) { // in our case, one type of quad (ax^2+b) might give fractional sols and we need to handle that here
                    let poly_template_copy = poly_template.slice(0, -1);

                    let [a, b] = poly_template_copy;

                    if (Number.isInteger((-b)/a)) return [0, (-b)/a];
                    else {
                        let frac = PH.simplifyFraction((-b) , a);
                        if (frac.numer > 0) return [0, '\\frac{' + frac.numer + '}{' + frac.denom + '}'];
                        else if (frac.numer < 0) return [0, '-\\frac{' + (-1)*frac.numer + '}{' + frac.denom + '}'];
                    }
                }

                return [(-b + Math.sqrt(b**2 - 4*a*c))/(2*a), (-b - Math.sqrt(b**2 - 4*a*c))/(2*a)];
            }
            else if (poly_template.length === 2) { // binomial (solve equation)
                let [a, b] = poly_template;

                if (Number.isInteger((-b)/a)) return [(-b)/a];
                else {
                    let frac = PH.simplifyFraction((-b) , a);
                    if (frac.numer > 0) return ['\\frac{' + frac.numer + '}{' + frac.denom + '}'];
                    else if (frac.numer < 0) return ['-\\frac{' + (-1)*frac.numer + '}{' + frac.denom + '}'];
                }  
            }
            else if (poly_template.length === 1) { // constant (not possible to have zeros (besides y=0, but that's not possible here))
                return [];
            }
            else return null;
        }

        // find the excluded values and avoid repeats
        let den_A_zeros = getPolynomZeros(den_A);
        let den_B_zeros = getPolynomZeros(den_B);
        const excluded_values = [...new Set(den_A_zeros.concat(den_B_zeros))];

        // do the actual operation on the two rational expressions (creating a raw answer in inter_numer and inter_denom)
        let inter_numer, inter_denom; // the final num and denom WITHOUT any common factors removed
        if (operation_type === 'add') {
            inter_numer = PH.addPolynomials(PH.multiplyPolynomials(num_A, den_B),PH.multiplyPolynomials(den_A, num_B));
            inter_denom = PH.multiplyPolynomials(den_A, den_B);
        }
        else if (operation_type === 'subtract') {
            inter_numer = PH.addPolynomials(PH.multiplyPolynomials(num_A, den_B),PH.multiplyArray(PH.multiplyPolynomials(den_A, num_B), (-1)));
            inter_denom = PH.multiplyPolynomials(den_A, den_B);
        }
        else if (operation_type === 'multiply') {
            inter_numer = PH.multiplyPolynomials(num_A, num_B);
            inter_denom = PH.multiplyPolynomials(den_A, den_B);
        }
        else if (operation_type === 'divide') {
            inter_numer = PH.multiplyPolynomials(num_A, den_B);
            inter_denom = PH.multiplyPolynomials(den_A, num_B);
        }

        // extract the signed GCFs from the intermediate numer and denom
        let num_gcf_sign, den_gcf_sign; // the sign (+ or -) of the gcf in the numer and denom
        let num_GCF, den_GCF; // the signed (positive or negative) GCFs of the numer and denom
        if (inter_numer[0] > 0) num_gcf_sign = 1;
        else if (inter_numer[0] < 0) num_gcf_sign = -1;
        num_GCF = PH.gcfOfArray(inter_numer) * num_gcf_sign;
        inter_numer = PH.divideArray(inter_numer, num_GCF);

        if (inter_denom[0] > 0) den_gcf_sign = 1;
        else if (inter_denom[0] < 0) den_gcf_sign = -1;
        den_GCF = PH.gcfOfArray(inter_denom) * den_gcf_sign;
        inter_denom = PH.divideArray(inter_denom, den_GCF);

        let gcf_fraction = PH.simplifyFraction(num_GCF, den_GCF); // num_GCF over den_GCF
        num_GCF = gcf_fraction.numer;
        den_GCF = gcf_fraction.denom;

        // create math-string version of the two GCFs above (for the case when we put them directly in front of a '(' or an 'x'))
        let num_GCF_string, den_GCF_string;
        if (num_GCF === 1) num_GCF_string = '';
        else if (num_GCF === -1) num_GCF_string = '-';
        else num_GCF_string = num_GCF + '';
        if (den_GCF === 1) den_GCF_string = '';
        else if (den_GCF === -1) den_GCF_string = '-';
        else den_GCF_string = den_GCF + '';
        
        // now we need to remove any common factors between the numer and denom
        let denom_factors = PH.factorPolynomial(inter_denom);
        let final_denom_factors = [[1]]; // the factors of the denom that DID NOT divide out (we add [1] here to make sure this list isn't empty when all the denom factors divide out)
        for (let i = 0; i < denom_factors.length; i++) {
            if (PH.longDivision(inter_numer, denom_factors[i]) !== null) { // factor divides out
                inter_numer = PH.longDivision(inter_numer, denom_factors[i]);
            }
            else { // factor does NOT divide out
                final_denom_factors.push(denom_factors[i]);
            }
        }
        inter_denom = PH.expandPolyFactors(final_denom_factors); // re-expand the denom

        // the next step is to put the numer and denom in math and decide whether they are factored or not
        let final_numer; // currently the numer is an unfactored template
        if (numer_form === 'factored') {
            if (inter_numer.length >= 3) { // quadratic or higher 
                if (Number.isInteger(Math.sqrt(inter_numer[1]**2 - 4*inter_numer[0]*inter_numer[2]))) { // it factors
                    final_numer = num_GCF_string + PH.factorListToMath(PH.factorPolynomial(inter_numer));
                }
                else { // it does NOT factor (we still pull out a GCF if possible)
                    if (num_GCF_string !== '') { // make sure the gcf isn't =to 1 (in which case we wouldn't factor it out)
                        final_numer = num_GCF_string + '(' + PH.polyTemplateToMath(inter_numer) + ')';
                    }
                    else final_numer = PH.polyTemplateToMath(inter_numer);
                }
            }
            else if (inter_numer.length === 2) { // binomial (linear)
                if (num_GCF_string !== '') { // make sure the gcf isn't =to 1 (in which case we wouldn't factor it out)
                    if (inter_numer[0] !== 1 || !inter_numer.slice(1).every(num => num === 0)) { // normal numer -> C(ax^n+bx^n-1+...)
                        final_numer = num_GCF_string + '(' + PH.polyTemplateToMath(inter_numer) + ')';
                    }
                    else { // special case where there is only one term x^n term -> ax^n (no parenthesis needed)
                        final_numer = num_GCF_string + PH.polyTemplateToMath(inter_numer);
                    }
                }
                else final_numer = PH.polyTemplateToMath(inter_numer);
            }
            else if (inter_numer.length === 1) { // just a number (constant)
                final_numer = inter_numer[0] * num_GCF;
            }
        }
        else if (numer_form === 'expanded') {
            if (inter_numer.length >= 3) { // quadratic or higher 
                final_numer = PH.polyTemplateToMath(PH.multiplyArray(inter_numer, num_GCF));
            }
            else if (inter_numer.length === 2) { // binomial (linear)
                final_numer = PH.polyTemplateToMath(PH.multiplyArray(inter_numer, num_GCF));
            }
            else if (inter_numer.length === 1) { // just a number (constant)
                final_numer = inter_numer[0] * num_GCF;
            }
        }

        let final_denom; // currently the denom is also an unfactored template (like the numer)
        if (denom_form === 'factored') {
            if (inter_denom.length >= 3) { // quadratic or higher 
                if (Number.isInteger(Math.sqrt(inter_denom[1]**2 - 4*inter_denom[0]*inter_denom[2]))) { // it factors
                    final_denom = den_GCF_string + PH.factorListToMath(PH.factorPolynomial(inter_denom));
                }
                else { // it does NOT factor (we still pull out a GCF if possible)
                    if (den_GCF_string !== '') { // make sure the gcf isn't =to 1 (in which case we wouldn't factor it out)
                        final_denom = den_GCF_string + '(' + PH.polyTemplateToMath(inter_denom) + ')';
                    }
                    else final_denom = PH.polyTemplateToMath(inter_denom);
                }
            }
            else if (inter_denom.length === 2) { // binomial (linear)
                if (den_GCF_string !== '') { // make sure the gcf isn't =to 1 (in which case we wouldn't factor it out)
                    if (inter_denom[0] !== 1 || !inter_denom.slice(1).every(num => num === 0)) { // normal numer -> C(ax^n+bx^n-1+...)
                        final_denom = den_GCF_string + '(' + PH.polyTemplateToMath(inter_denom) + ')';
                    }
                    else { // special case where there is only one term x^n term -> ax^n (no parenthesis needed)
                        final_denom = den_GCF_string + PH.polyTemplateToMath(inter_denom);
                    }
                }
                else final_denom = PH.polyTemplateToMath(inter_denom);
            }
            else if (inter_denom.length === 1) { // just a number (constant)
                final_denom = inter_denom[0] * den_GCF;
            }
        }
        else if (denom_form === 'expanded') {
            if (inter_denom.length >= 3) { // quadratic or higher 
                final_denom = PH.polyTemplateToMath(PH.multiplyArray(inter_denom, den_GCF));
            }
            else if (inter_denom.length === 2) { // binomial (linear)
                final_denom = PH.polyTemplateToMath(PH.multiplyArray(inter_denom, den_GCF));
            }
            else if (inter_denom.length === 1) { // just a number (constant)
                final_denom = inter_denom[0] * den_GCF;
            }
        }
        
        // here we check if there are two indentical factors (a perfect square), in which case we 'collapse' it (x+a)(x+a) -> (x+a)^2
        if ((final_numer + '').includes(')(')) { // for the numer
            let num_fact_1 = (final_numer + '').substring(0, (final_numer + '').indexOf(')') + 1); // everything up to the first ')'
            num_fact_1 = num_fact_1.substring(num_fact_1.indexOf('(')); // everything after the first '('
            let num_fact_2 = (final_numer + '').substring((final_numer + '').lastIndexOf('('));

            if (num_fact_1 === num_fact_2) {
                final_numer = final_numer.replace(num_fact_1 + num_fact_2, num_fact_1 + '^2');
            }
        }
        if ((final_denom + '').includes(')(')) { // for the denom
            let den_fact_1 = (final_denom + '').substring(0, (final_denom + '').indexOf(')') + 1); // everything up to the first ')'
            den_fact_1 = den_fact_1.substring(den_fact_1.indexOf('(')); // everything after the first '('
            let den_fact_2 = (final_denom + '').substring((final_denom + '').lastIndexOf('('));
        
            if (den_fact_1 === den_fact_2) {
                final_denom = final_denom.replace(den_fact_1 + den_fact_2, den_fact_1 + '^2');
            }
        }
        
        // combine the final numer and denom into the fraction
        final_answer = MH.fraction(final_numer, final_denom);

        if ((final_denom + '') === '1') final_answer = final_numer; // case when numer is 1
        
        // there's a small chance that both the numer and denom are numbers; in this case, we need to check if the expression reduces to a whole number
        let numerical_numer = Number(final_numer);
        let numerical_denom = Number(final_denom);
        if (!Number.isNaN(numerical_numer) && !Number.isNaN(Number(numerical_denom))) {
            let num_over_den = PH.simplifyFraction(numerical_numer, numerical_denom);

            if (num_over_den.denom === 1) final_answer = num_over_den.numer;
        }

        // give the excluded values if specified (and there actually are any)
        let excluded_value_string = '';
        let TeX_excluded_value = '';
        if (give_excluded_values === 'yes' && excluded_values.length !== 0) {
            excluded_value_string = '{\\scriptscriptstyle ' + ';\\;x \\neq ' + excluded_values.join(',') + '}';
            TeX_excluded_value = ';\\;x \\neq ' + excluded_values.join(',');
        }
        TeX_answer = final_answer + TeX_excluded_value;
        final_answer += excluded_value_string; // the string will be empty if we don't give excluded values 

        // check if the answer includes any of the below (use a backup template if it does, move on if it doesn't)
        if (
            !final_answer.includes('NaN') && 
            !final_answer.includes('Infinity') && 
            !final_answer.includes('e') &&
            !final_answer.includes('999999') &&
            !final_answer.includes('000000')
        ) break; 
        else sol_is_found = false; // solution wasn't valid (so we use a backup (which we know was generated to never include the above))
    }

    // don't need to actually get any error locations because no 'free response' fields
    let error_locations = []; // but still ensure it's not undefined

    return {
        question: final_prompt,
        answer: final_answer,
        TeXanswer: TeX_answer,
        settings: settings,
        error_locations: error_locations
    };
}

export const settings_fields = [
    'ratex_add_sub_form',
    'ratex_mul_div_form',
    'general_operation_types',
    'numer_form',
    'denom_form',
    'give_excluded_values'
];

export function get_presets() {
    return {
        ratex_add_sub_form: 'all_add_sub', 
        ratex_mul_div_form: 'all_mul_div', 
        general_operation_types: ['add','multiply'],
        numer_form: 'factored',
        denom_form: 'factored',
        give_excluded_values: 'no'
    };
}

export function get_rand_settings() {
    return {
        ratex_add_sub_form: H.randFromList(['all_add_sub','as_1','as_2','as_3','as_4','as_5','as_6','as_7','as_8','as_9','as_10','as_11','as_12','as_13','as_14','as_15']), 
        ratex_mul_div_form: H.randFromList(['all_mul_div','md_1','md_2','md_3','md_4','md_5','md_6','md_7','md_8','md_9','md_10','md_11','md_12','md_13','md_14','md_15','md_16']), 
        general_operation_types: H.randFromList([['add'],['subtract'],['multiply'],['divide']]),
        numer_form: 'factored',
        denom_form: 'factored',
        give_excluded_values: 'no'
    }; 
}