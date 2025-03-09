from sympy import simplify, solve, symbols, sympify, cancel
from sympy.parsing.latex import parse_latex

def verify(tex_question, tex_answer):
    if ('R' in tex_answer): # operation is div with an 'R=' and the expressions CANNOT be just be compared for algebriac equality
        final_numer, denom_fact = map(sympify, str(cancel(parse_latex(tex_question))).split('/')) # get the final numer and the x-a in the denom that didn't divide out

        # ensure the numer and denom are recognized as polynomials
        final_numer = final_numer.as_poly(symbols('x'))
        denom_fact = denom_fact.as_poly(symbols('x'))

        # if the denom isn't linear or the numer isn't linear or higher, return the discrepency (after this point, we must be dealing with an R=)
        if (denom_fact.degree(symbols('x')) != 1 or final_numer.degree(symbols('x')) < 1): return simplify(parse_latex(tex_question)) 

        denom_zero = solve(denom_fact, symbols('x'))[0] # get the zero in the denom

        calculated_rem = final_numer.subs(symbols('x'), denom_zero) # evaluate the numer at the denom zero

        provided_rem = parse_latex(tex_answer.split('=')[1]) # 'R=5' -> 5

        if (simplify(calculated_rem - provided_rem) == 0):
            return None
        else:
            return 'R=' + str(calculated_rem)
    else: # the expressions can be compared for algebriac equality
        calculated_answer = simplify(parse_latex(tex_question))

        if (simplify(calculated_answer - parse_latex(tex_answer)) == 0):
            return None
        else:
            return calculated_answer