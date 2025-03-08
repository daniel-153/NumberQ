from sympy import simplify, symbols, solve
from sympy.parsing.latex import parse_latex

def verify(tex_question, tex_answer):
    # get the variable letter and the solution
    variable_letter, solution = tex_answer.split('=') # 'k=5' -> 'k' , '5'
    solution = parse_latex(solution)

    calculated_solution = solve( parse_latex(tex_question), symbols(variable_letter) )[0]

    if (simplify(solution - calculated_solution) == 0):
        return None
    else:
        return variable_letter + '=' + str(calculated_solution)