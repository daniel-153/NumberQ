from sympy import simplify
from sympy.parsing.latex import parse_latex

def verify(tex_question, tex_answer):
    calculated_answer = simplify(parse_latex(tex_question))

    if (simplify(parse_latex(tex_answer) - calculated_answer) == 0):
        return None
    else:
        return calculated_answer