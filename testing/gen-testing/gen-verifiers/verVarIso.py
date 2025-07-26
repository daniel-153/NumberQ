from sympy import simplify, solve
from sympy.parsing.latex import parse_latex
from .helpers.gen_helpers import var_from_prompt, get_adjusted_tex_str, test_det_expr

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