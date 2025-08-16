from sympy import simplify, symbols, I
from sympy.parsing.latex import parse_latex

def verify(tex_question, tex_answer):
    start_expression = parse_latex(tex_question).subs(symbols('i'), I)
    final_expression = parse_latex(tex_answer).subs(symbols('i'), I)
    
    # the extra steps below are to make sure all I's are recognized as sympy's imaginary unit
    if (simplify(start_expression - final_expression) == 0):
        return True
    else:
        return simplify(start_expression)