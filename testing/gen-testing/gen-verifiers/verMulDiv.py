from sympy import simplify
from sympy.parsing.latex import parse_latex

def verify(tex_question, tex_answer):
    tex_question = tex_question.replace('\\div','/')
    question = parse_latex(tex_question)
    tex_answer = str(tex_answer) # make sure tex_answer is a string

    if 'R' in tex_answer: # we are dealing with a remainder answer (this means the question MUST have been in the form: a \div b)
        # extract the provided quotient and remainder
        quotient, remainder = tex_answer.split('R') # '1\;\,R4' -> '1\;\,' '4'
        quotient = int(quotient.split('\\')[0]) # '1\;\,' -> '1'
        remainder = int(remainder)

        question = str(question)
        
        # handle the fraction case and the whole number case
        caculated_quotient = None
        caculated_remainder = None
        if ('/' in question): # reduced to a fraction a/b
            numer, denom = question.split('/')
            numer = int(numer.strip('()')) # remove parenthesis around negative numbers
            denom = int(denom.strip('()'))
            caculated_quotient, caculated_remainder = divmod(numer, denom) # do a remainder division
        else: # reduced to a whole number
            caculated_quotient = int(question)
            caculated_remainder = 0

        if (quotient == caculated_quotient and remainder == caculated_remainder):
            return None
        else:
            return str(caculated_quotient) + ' R' + str(caculated_remainder)
    else: # we are dealing with a fractional or whole number answer
        answer = parse_latex(tex_answer)

        calculated_answer = simplify(question)

        if (simplify(answer - calculated_answer) == 0):
            return None
        else:
            return calculated_answer