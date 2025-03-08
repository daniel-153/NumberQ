from sympy import simplify, solve, symbols
from sympy.parsing.latex import parse_latex

def verify(tex_question, tex_answer):
    tex_question = tex_question.replace('\\div','/') # use the regular division symbol ('\\div' isn't recognized by sympy)

    # split the question into the two original expressions so we can find the undefined values    
    expression_1, expression_2 = tex_question.replace('}\\cdot\\f','}#\\f').replace('}/\\f','}#\\f').replace('}+\\f','}#\\f').replace('}-\\f','}#\\f').split('#')
    
    denom_1 = parse_latex(expression_1.split('}{')[1][:-1])
    denom_2 = parse_latex(expression_2.split('}{')[1][:-1])

    denom_1_zeros = solve(denom_1, symbols('x'))
    denom_2_zeros = solve(denom_2, symbols('x'))

    # set of denom zeros for the entire prompt (excluded values that we calculated)
    all_denom_zeros = set(denom_1_zeros) | set(denom_2_zeros)

    # extract the necessary information from the incomming question and answer
    calculated_answer = simplify(parse_latex(tex_question))
    excluded_values = None
    if ('{\\script' in tex_answer): # the answer provides excluded values (and we need to verify them)
        # tex_answer looks like \frac{-2(x+6)}{(x-2)(x+2)}{\scriptscriptstyle ;\;x \neq 2,-2}
        answer, excluded_values = tex_answer.split('{\\script')
        
        excluded_values = excluded_values.split('neq')[1][:-1] # looks like '1,2,3,\\frac{3,4}' here
    else: # the answer does NOT provide excluded values
        # tex_answer looks like \frac{-2(x+6)}{(x-2)(x+2)}
        answer = tex_answer

    answer = parse_latex(answer.replace('x(','x*('))

    # convert excluded values from the string we extracted to a set if it exists
    parsed_set = set()
    if (excluded_values is not None):
        for item in excluded_values.split(','): 
            parsed_value = parse_latex(item)  
            parsed_set.add(parsed_value)
    else: # if we don't need to check excluded values, set them equal to all_denom_zeros so future checks evaluate to true
        parsed_set = all_denom_zeros

    # convert all elements of these sets to strings (since comparisons of sets of sympy objects don't always work as expected)
    parsed_set = {str(expr) for expr in parsed_set}
    all_denom_zeros = {str(expr) for expr in all_denom_zeros}

    if (simplify(answer - calculated_answer) == 0 and parsed_set == all_denom_zeros):
        return None
    else:
        if ('{\\script' in tex_answer):
            return str(calculated_answer) + '  , x!=' + str(all_denom_zeros)
        else:
            return calculated_answer



    