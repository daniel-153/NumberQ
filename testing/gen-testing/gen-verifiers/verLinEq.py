from sympy import simplify, symbols, solve
from sympy.parsing.latex import parse_latex

def verify(tex_question, tex_answer):
    # get the variable letter and the solution
    variable_letter, solution = tex_answer.split('=') # 'k=5' -> 'k' , '5'
    solution = parse_latex(solution)

    # 'solutions': should always be one element, but errors like IMS or no sol need to be handled by checking this
    solutions = solve( parse_latex(tex_question), symbols(variable_letter) )
    if (len(solutions) == 1):
        calculated_solution = solutions[0]
    else:
        recieved_equation = parse_latex(tex_question)

        if (recieved_equation == True):
            return 'IMS'
        elif (recieved_equation == False):
            return 'no sol'
        elif (simplify(recieved_equation.rhs - recieved_equation.lhs) == 0):
            return 'IMS'
        else:
            return 'no sol'

    if (simplify(solution - calculated_solution) == 0):
        return True
    else:
        return variable_letter + '=' + str(calculated_solution)