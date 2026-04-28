from .helpers.gen_helpers import get_diffed_var, remove_whitespace, norm_base_logs, diff_expr_normed
from sympy import symbols, E, latex, simplify, expand, trigsimp, powdenest
from sympy.parsing.latex import parse_latex

def verify(tex_question, tex_answer, settings):
    tex_question, tex_answer = [
        (tex_str.replace("\\displaystyle{", "", 1)[:-1] if tex_str.startswith("\\displaystyle{") else tex_str)
        for tex_str in [remove_whitespace(tex_str) for tex_str in [tex_question, tex_answer]]
    ]
    dep_var, ind_var = settings["diff_eq_vars"].split("_")
    if settings["expr_diff_notation"] in ["func", "implicit"]:
        func_symbol = dep_var if settings["expr_diff_notation"] == "implicit" else f"{dep_var}({ind_var})"
        diff_symbol = get_diffed_var(*({"func": [func_symbol, "prime"], "implicit": [dep_var, "frac"]}[settings["expr_diff_notation"]]), order=1, time_var=ind_var)
        func_symbol, diff_symbol = [(sym.replace("(", "\\left(").replace(")", "\\right)") + "=") for sym in [func_symbol, diff_symbol]]
        func_def, _ = tex_question.split(",~~")
        if func_def.count(func_symbol) == 1 and func_def.startswith(func_symbol): q_expr_str = func_def.replace(func_symbol, "")
        else: return "Invalid function definition formatting in question."
        if tex_answer.count(diff_symbol) == 1 and tex_answer.startswith(diff_symbol): a_expr_str = tex_answer.replace(diff_symbol, "")
        else:
            print('hit')
            return "Invalid derivative equality formatting in answer."
    else:
        diff_op = f"\\dfrac{{d}}{{d{ind_var}}}"
        if tex_question.count(diff_op) == 1 and tex_question.startswith(diff_op): q_expr_str = tex_question.replace(diff_op, "")
        else: return "Invalid derivative operation formatting in question."
        a_expr_str = tex_answer

    prompt_expr, nq_diff_expr = [
        norm_base_logs(parse_latex(tex_str.replace("(", "[").replace(")", "]").replace("\\left", "").replace("\\right", "")
        .replace(f"{ind_var}\\ln", f"{ind_var}\\cdot\\ln").replace(f"{ind_var}\\log", f"{ind_var}\\cdot\\log"), strict=True)
        ).xreplace({symbols('e'): E}) for tex_str in [q_expr_str, a_expr_str]
    ]
    target_var = symbols(ind_var)
    smp_diff_expr = diff_expr_normed(prompt_expr, target_var)
    
    if simplify(expand(trigsimp(powdenest((smp_diff_expr - nq_diff_expr).doit(), force=True)))).equals(0) is True: return True  
    else: return latex(smp_diff_expr)