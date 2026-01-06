from .helpers.gen_helpers import remove_whitespace, get_diffed_var, parse_init_expr
from sympy.parsing.latex import parse_latex
from sympy import symbols, simplify, E, diff

def verify(tex_question, tex_answer, settings):    
    # pre-processing and extraction
    var1, var2 = [
        (f'{var}(t)' if settings['func_notation'] == 'explicit' else var) 
        for var in {'x_y': ['x', 'y'], 'x1_x2': ['x_{1}', 'x_{2}'], 'y1_y2': ['y_{1}', 'y_{2}']}[settings['sys_diff_vars']] 
    ]
    diff_var1, diff_var2 = [get_diffed_var(var, settings['diff_notation']) for var in [var1, var2]]
     
    tex_question, tex_answer = [
        remove_whitespace(tex.split('\\begin{aligned}')[1].split('\\end{aligned}')[0]).replace('&=', '=') 
        for tex in [tex_question, tex_answer]
    ]
    tex_question = tex_question.replace(diff_var1, f'\\frac{{d}}{{dt}}({var1})').replace(diff_var2, f'\\frac{{d}}{{dt}}({var2})')
    var1, var2 = [var.replace('(t)', '') for var in [var1, var2]]
    tex_question, tex_answer = [eq.replace(f'{var1}(t)', var1).replace(f'{var2}(t)', var2) for eq in [tex_question, tex_answer]]
    
    answer_eq1, answer_eq2 = [(parse_latex(eq.replace('(', '[').replace(')', ']')).subs(symbols('e'), E)) for eq in tex_answer.split('\\\\')]
    question_line1, question_line2 = tex_question.split('\\\\')
    var1, var2 = [parse_latex(var) for var in [var1, var2]]

    if (
        (answer_eq1.lhs is var1 and not (answer_eq1.rhs.has(var1))) and
        (answer_eq2.lhs is var2 and not (answer_eq2.rhs.has(var2)))
    ):
        sol_eq_subs = {var1: answer_eq1.rhs, var2: answer_eq2.rhs}
    else:
        return 'Answer equations not properly isolated for appropriate variables.'
    
    # substitution and verification
    if settings['sys_diff_initcond'] == 'yes':
        question_eq1, question_init1 = question_line1.split('&')
        question_eq2, question_init2 = question_line2.split('&')

        init_var1, init_t1, init_val1 = parse_init_expr(question_init1)
        init_var2, init_t2, init_val2 = parse_init_expr(question_init2)
        question_eq1, question_eq2 = [parse_latex(eq) for eq in [question_eq1, question_eq2]]

        init_val1_sub = {init_var1: init_val1, symbols('t'): init_t1}
        init_val2_sub = {init_var2: init_val2, symbols('t'): init_t2}

        question_eq1_test = simplify(question_eq1.lhs.subs(sol_eq_subs) - question_eq1.rhs.subs(sol_eq_subs)).equals(0)
        question_eq2_test = simplify(question_eq2.lhs.subs(sol_eq_subs) - question_eq2.rhs.subs(sol_eq_subs)).equals(0)
        initial_cond1_test =  simplify(answer_eq1.lhs.subs(init_val1_sub) - answer_eq1.rhs.subs(init_val1_sub)).equals(0)
        initial_cond2_test = simplify(answer_eq2.lhs.subs(init_val2_sub) - answer_eq2.rhs.subs(init_val2_sub)).equals(0)
        
        if (question_eq1_test and question_eq2_test and initial_cond1_test and initial_cond2_test):
            return True
        elif ((not (question_eq1_test and question_eq2_test)) and (not (initial_cond1_test and initial_cond2_test))):
            return 'Incorrect solution equations and initial conditions not met.'
        elif (not (question_eq1_test and question_eq2_test)):
            return "Incorrect solution equations."
        elif (not (initial_cond1_test and initial_cond2_test)):
            return "Initial conditions not met."
    elif settings['sys_diff_initcond'] == 'no':
        question_eq1, question_eq2 = [parse_latex(line) for line in [question_line1, question_line2]]
        expected_constants = symbols('C_{1}, C_{2}')
        det_J = (
            diff(sol_eq_subs[var1], expected_constants[0])*diff(sol_eq_subs[var2], expected_constants[1]) - 
            diff(sol_eq_subs[var2], expected_constants[0])*diff(sol_eq_subs[var1], expected_constants[1])
        )

        question_eq1_test = simplify(question_eq1.lhs.subs(sol_eq_subs) - question_eq1.rhs.subs(sol_eq_subs)).equals(0)
        question_eq2_test = simplify(question_eq2.lhs.subs(sol_eq_subs) - question_eq2.rhs.subs(sol_eq_subs)).equals(0)
        generality_test = (det_J.equals(0) is False)

        if (question_eq1_test and question_eq2_test and generality_test):
            return True
        elif (not (question_eq1_test and question_eq2_test)):
            return 'Incorrect solution equations.'
        elif (not generality_test):
            return 'Solutions are not sufficiently general.'