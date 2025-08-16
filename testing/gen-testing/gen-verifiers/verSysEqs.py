from sympy import simplify, symbols, solve
from sympy.parsing.latex import parse_latex

def verify(tex_question, tex_answer):
    # remove all the extra latex formatting from the tex_question
    tex_question = tex_question.replace('\\begin{array}{c}','').replace('\\end{array}','').replace('\\begin{aligned}','').replace('\\end{aligned}','').replace('&','')

    equation_1, equation_2 = map(parse_latex, tex_question.split('\\\\'))

    x, y = symbols('x y')

    calculated_sols = solve(( equation_1 , equation_2 ) , ( x , y ))

    # extract the provided x and y sol from the order pair (x,y)
    x_sol = parse_latex(tex_answer.split(',')[0].replace('(',''))
    y_sol = parse_latex(tex_answer.split(',')[1].replace(')',''))

    if (simplify(x_sol - calculated_sols[x]) == 0 and simplify(y_sol - calculated_sols[y]) == 0):
        return True
    else:
        return '(' + str(calculated_sols[x]) + ', ' + str(calculated_sols[y]) + ')'

