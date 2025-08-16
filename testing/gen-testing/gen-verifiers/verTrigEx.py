from sympy import simplify, sympify
from sympy.parsing.latex import parse_latex

def verify(tex_question, tex_answer):        
    if (tex_answer == '\\text{undefined}'): # handle the undefined case
        answer = simplify('zoo')
    else:
        answer = parse_latex(tex_answer)
    
    if ('^\\circ' in tex_question): # trig value is in degrees
        trig_function, degree_value = tex_question.split('^\\circ')[0].split('\\left(') # \cos(30^\circ) -> \cos , 30
        trig_function = trig_function.replace('\\','') # \cos -> cos

        # evaluate the trig function in degrees
        calculated_value = sympify(trig_function + '(' + degree_value + '* pi / 180)')

        if (simplify(calculated_value - answer) == 0 or calculated_value == answer): # calculated_value == answer handles the 'zoo' (undefined) case
            return True
        else:
            return calculated_value
    else: # trig value is in radians
        calculated_value = simplify(str(parse_latex(tex_question)))

        if (simplify(calculated_value - answer) == 0 or calculated_value == answer):
            return True
        else:
            return calculated_value
