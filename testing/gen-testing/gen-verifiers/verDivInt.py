from sympy import sympify

def verify(tex_question, tex_answer):
    if '\\enclose{longdiv}' in tex_question: # longdiv notation (example: 4\enclose{longdiv}{56})
        operand_2 = sympify(tex_question.split('\\enclose{longdiv}{')[0])
        operand_1 = sympify(tex_question.split('\\enclose{longdiv}{')[1][0:-1])
    else: # all other notations
        div_expr = tex_question.split('=')[0]
        operand_1, operand_2 = [sympify(operand) for operand in div_expr.split('\\div')]

    if 'R' in tex_answer: # (quotient R remainder) answer form (example: 40\;\,\,\mathrm{R}\,1)
        if operand_1 >= 0 and operand_2 > 0: # operand_1 must be non-negative and operand_2 must be positive for remainder answer form
            calced_quotient, calced_remainder = divmod(operand_1, operand_2)

            if calced_remainder == 0:
                return "invalid remainder form: remainder answer form was used with a remaider of 0"
            else:
                provided_quotient, provided_remainder = [sympify(extracted_num) for extracted_num in tex_answer.split('\\;\\,\\,\\mathrm{R}\\,')]

                provided_eq_calced = ((provided_quotient.equals(calced_quotient) is True) and (provided_remainder.equals(calced_remainder) is True))
        else: # one or more operands is negative (invalid to use remainder answer form)
            return "tex_answer is in remainder form, but the operands (a,b) fail a>=0, b>0"
    else: # integer quotient answer form
        if tex_answer == '\\mathrm{undefined}':
            provided_eq_calced = (operand_2.equals(0) is True)
        else:
            provided_quotient = sympify(tex_answer)
            calced_quotient = operand_1 / operand_2

            provided_eq_calced = (provided_quotient.equals(calced_quotient) is True)
        
    if provided_eq_calced is True:
        return None
    else:
        return str(operand_1 / operand_2)