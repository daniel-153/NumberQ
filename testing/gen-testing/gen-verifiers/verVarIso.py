import re
import random
from sympy import simplify, zoo, nan, solve
from sympy.parsing.latex import parse_latex

def get_adjusted_tex_str(tex_str): # helper
   tex_str = re.sub(r'(?<=[a-zA-Z0-9])\(', r'\\cdot(', tex_str) # a(b+c) -> a\cdot(b+c) (parsed as a function by default)
   tex_str = re.sub(r'\\[a-zA-Z]+', lambda m: '`'.join(m.group(0)), tex_str) # mark latex commands so they don't get replaced/modified in the following
   tex_str = re.sub(r'(?<!`)d', r'{d}', tex_str) # d -> {d} as long as not in latex command (marked by `)
   tex_str = tex_str.replace('`', '') # remove marking backticks

   return tex_str

def var_from_prompt(solve_for_statement):
    var_to_solve_str = solve_for_statement.split('~')[1].split('}\\text{:}')[0]
    if '\\geq 0' in var_to_solve_str: var_to_solve_str = var_to_solve_str.replace('\\geq 0', '') # remove the >= 0 if present

    return var_to_solve_str

def get_rand_int_dict(range_min, range_max, symbols_list): # helper
    int_dict = {}

    for var_obj in symbols_list:
        int_dict[var_obj] = random.randint(range_min, range_max)

    return int_dict

def test_det_expr(det_expr, test_values_sign, num_tests): # helper
    expr_vars_list = list(det_expr.free_symbols)

    range_min = range_max = None
    if test_values_sign == 'non-negative':
        range_min = 0
        range_max = 1000
    elif test_values_sign == 'non-positive':
        range_min = -1000
        range_max = 0
    elif test_values_sign == 'either':
        range_min = -1000
        range_max = 1000
    
    all_tests_passed = True # no non-zero (but still defined) values found
    no_defined_values = True # not one single input was defined (test result un-interpretable)
    for i in range(0, num_tests):
        subs_dict = get_rand_int_dict(range_min, range_max, expr_vars_list)
        current_det_value = det_expr.subs(subs_dict)
        
        if (current_det_value == zoo) or (current_det_value == nan): # inputs outside of domain
            continue
        else: # inputs yielded a number
            no_defined_values = False

            if (current_det_value != 0): # but that value wasn't equal to zero (test failed)
                all_tests_passed = False
                break

    if no_defined_values:
        raise Exception('Equation is untestable: no defined values could be found for det_func.')
    
    return all_tests_passed

def verify(tex_question, tex_answer):
    # remove \\small(s) because they aren't parsed properly
    tex_question = tex_question.replace('\\small', '')
    tex_answer = tex_answer.replace('\\small', '')
    
    # tex question starts off looking like "{\small \text{Solve for}~p}\text{:}~~q=\frac{p-f-5c}{7}"
    solve_for_statement, prompt_eq_str = tex_question.split('~~') # "{ \text{Solve for}~p}\text{:}" | "q=\frac{p-f-5c}{7}"
    var_to_solve_str = var_from_prompt(solve_for_statement)
    var_to_solve_obj = parse_latex(var_to_solve_str)

    prompt_eq_str = get_adjusted_tex_str(prompt_eq_str)
    answer_eq_str = get_adjusted_tex_str(tex_answer)
    prompt_eq = parse_latex(prompt_eq_str)
    answer_eq = parse_latex(answer_eq_str)

    # first ensure that the prompt eq actually contains the var to solve for + the answer eq is in form [var to solve]=f(other vars not including [var to solve])
    if (not prompt_eq.lhs.has(var_to_solve_obj)) and (not prompt_eq.rhs.has(var_to_solve_obj)): # neither the prompt.lhs nor the prompt.rhs contains the var to solve for
        return 'variable to solve for not found in prompt equation'
    elif (var_to_solve_str != tex_answer.split('=')[0]) or (answer_eq.rhs.has(var_to_solve_obj)): # the answer eq is not in the form [var to solve]=f(other vars not including [var to solve])
        return 'answer equation is not or not completely isolated for the variable to solve'
    
    # if the following expr is 0 for all values in its domain, the equation rearrangement is correct
    determinant_expr = prompt_eq.lhs.subs(var_to_solve_obj, answer_eq.rhs) - prompt_eq.rhs.subs(var_to_solve_obj, answer_eq.rhs)

    # check if it can already be simplified to 0
    if simplify(determinant_expr).is_zero is True: # will work for almost all equations
        return None
    else: # last chance to be correct is if the determinant expression (as a function of all its vars) is zero for every non-negative value it's defined for
        # test with random non-negative values (to catch cases where only the positive rearrangement was found like A=s^2 -> s=sqrt(A) -> s - sqrt(s^2) =? 0 -> only for s >= 0)
        test_passed = test_det_expr(determinant_expr, 'non-negative', 100)

        if test_passed: return None
    
    # if this point was reached (haven't returned yet, the rearrangement was incorrect)
    return solve(prompt_eq, var_to_solve_obj) # sympy's answer/answers