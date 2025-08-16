from sympy import simplify, symbols, solve, factor, I, sympify
from sympy.parsing.latex import parse_latex

def verify(tex_question, tex_answer):    
    # start by determining the prompt and answer type
    if ('=' in tex_answer): # prompt is solving the equation
        # get the variable letter (always 'x' atm but could be different later)
        variable_letter = tex_answer.split('=')[0]
        
        # change 'i' to 'I' (since sympy uses 'I')
        tex_answer = str(tex_answer).replace("i","I")
        
        if (',' in tex_answer): # x=a,b case
            sol_1, sol_2 = map(parse_latex, tex_answer.split('=')[1].split(','))
        elif ('\\pm' in tex_answer): # x=±a case
            sol_1 = parse_latex(tex_answer.replace(variable_letter+ '=','').replace('\\pm','+'))
            sol_2 = parse_latex(tex_answer.replace(variable_letter+ '=','').replace('\\pm','-'))
        else: # x=a case
            sol_1 = parse_latex(tex_answer.replace(variable_letter+ '=',''))
            sol_2 = sol_1

        calculated_sol_set = solve(parse_latex(tex_question), symbols(variable_letter))
        if (len(calculated_sol_set) == 2):
            calculated_sol_1, calculated_sol_2 = calculated_sol_set
        elif (len(calculated_sol_set) == 1):
            calculated_sol_1 = calculated_sol_set[0]
            calculated_sol_2 = calculated_sol_1

        # hackfix to make sure expressions like sqrt(2)*(I - I) are recognized as 0
        if ('I' in str(sol_1)):
            sol_1 = sympify(str(sol_1))
        if ('I' in str(sol_2)):
            sol_2 = sympify(str(sol_2))

        # if the first sols match, the seconds sols must match; is the first and seconds sols match, the seconds and first sols must match
        if (simplify(sol_1 - calculated_sol_1) == 0):
            if (simplify(sol_2 - calculated_sol_2) == 0):
                return True
                
        elif (simplify(sol_1 - calculated_sol_2) == 0):
            if (simplify(sol_2 - calculated_sol_1) == 0):
                return True

        # if we made it past the if-else above (didn't return), the solution sets don't match (so we return the sympy answer)
        return variable_letter + '=' + str(calculated_sol_1) + ',' + str(calculated_sol_2)
    else: # prompt is factoring
        answer = parse_latex(tex_answer.replace('x(','x*(')) # replacement is needed because parse latex would interpret x(x+a) as a function
        calculated_answer = factor(parse_latex(tex_question))

        if (simplify(answer - calculated_answer) == 0):
            return True
        else:
            return calculated_answer