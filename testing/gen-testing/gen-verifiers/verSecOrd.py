from .helpers.gen_helpers import get_diffed_var, remove_whitespace
from sympy import symbols, diff, E
from sympy.parsing.latex import parse_latex

def verify(tex_question, tex_answer, settings):
    # pre-processing and extraction
    dep_var, ind_var = settings["diff_eq_vars"].split("_")
    unk_func = f"{dep_var}({ind_var})" if settings["func_notation"] == "explicit" else dep_var
    d_unk_func = get_diffed_var(unk_func, settings["diff_notation"], order=1, time_var=ind_var)
    dd_unk_func = get_diffed_var(unk_func, settings["diff_notation"], order=2, time_var=ind_var)

    if settings["diff_initcond"] == "yes":
        prompt_eq_str, init_conds = tex_question.replace("\\begin{array}{c}", "", 1).replace("\\end{array}", "", 1).split("\\\\")
        func_at_0_str = f"{dep_var}(0)"
        diff_at_0_str = d_unk_func.replace(f"({ind_var})", "(0)", 1) if f"({ind_var})" in d_unk_func else f"{d_unk_func}(0)"
        func_init, diff_init = remove_whitespace(init_conds).split(",~")
        func_at_0, diff_at_0 = [parse_latex(init.replace(f"{at_0}=", "", 1)) for init, at_0 in [[func_init, func_at_0_str], [diff_init, diff_at_0_str]]]
    else:
        prompt_eq_str = tex_question
 
    prompt_eq, answer_eq = [
        parse_latex(tex_str.replace(unk_func, dep_var).
        replace(dd_unk_func, f"\\frac{{d}}{{d{ind_var}}}[\\frac{{d}}{{d{ind_var}}}[{dep_var}]]").
        replace(d_unk_func, f"\\frac{{d}}{{d{ind_var}}}[{dep_var}]").
        replace("(", "[").replace(")", "]")).
        subs(symbols('e'), E) for tex_str in [prompt_eq_str, tex_answer]
    ]
    unknown, time_var = [symbols(var) for var in [dep_var, ind_var]]

    if (answer_eq.lhs is not unknown) or answer_eq.rhs.has(unknown):
        return "Answer equation not properly isolated for the unknown function" 

    # substitution and verification
    if settings["diff_initcond"] == "yes":
        diff_eq_satisfied = (prompt_eq.lhs - prompt_eq.rhs).subs({unknown: answer_eq.rhs}).doit().equals(0) is True
        f_init_satisfied = answer_eq.rhs.subs({time_var: 0}).equals(func_at_0) is True
        diff_init_satisfied = diff(answer_eq.rhs, time_var).subs({time_var: 0}).equals(diff_at_0) is True

        if diff_eq_satisfied and f_init_satisfied and diff_init_satisfied:
            return True
        elif not diff_eq_satisfied and not (f_init_satisfied and diff_init_satisfied):
            return "Incorrect solution equation and initial conditions not met"
        elif not diff_eq_satisfied:
            return "Incorrect solution equation"
        elif not (f_init_satisfied and diff_init_satisfied):
            return "Initial conditions not met"
    else:
        diff_eq_satisfied = (prompt_eq.lhs - prompt_eq.rhs).subs({unknown: answer_eq.rhs}).doit().equals(0) is True

        expected_constants = symbols('C_{1}, C_{2}')
        sol, sol_diff = (answer_eq.rhs, diff(answer_eq.rhs, time_var))
        det_J = (
            diff(sol, expected_constants[0])*diff(sol_diff, expected_constants[1]) - 
            diff(sol, expected_constants[1])*diff(sol_diff, expected_constants[0])
        )
        generality_satisfied = det_J.equals(0) is False

        if diff_eq_satisfied and generality_satisfied:
            return True
        elif not diff_eq_satisfied:
            return "Incorrect solution equation"
        elif not generality_satisfied:
            return "Solution is not sufficiently general"