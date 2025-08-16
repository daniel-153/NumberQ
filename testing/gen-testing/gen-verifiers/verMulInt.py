from sympy import sympify

def verify(tex_question, tex_answer):
    provided_answer = sympify(tex_answer)

    copy_tex_question = tex_question.replace(' ', '')
    if copy_tex_question.startswith('\\begin{array}'): # stacked notation (example: \begin{array}{@{}r@{}} 5\\[-0.4em] \underline{\smash[b]{+~5}} \end{array})
        copy_tex_question = copy_tex_question.replace('\\begin{array}{@{}r@{}}', '').replace('\\end{array}', '') # 5\\[-0.4em]\underline{\smash[b]{+~6}}

        operand_1 = sympify(copy_tex_question.split('\\\\')[0])

        copy_tex_question = copy_tex_question.split('\\smash[b]{')[1][0:-2] # +~6

        _, lower_stacked_value = copy_tex_question.split('~')
        if 'phantom' in lower_stacked_value:
            _, operand_2 = lower_stacked_value.split('}')
            operand_2 = sympify(operand_2)
        else:
            operand_2 = sympify(lower_stacked_value)

        calculated_answer = operand_1 * operand_2
    else: # all other notations
        calculated_answer = sympify(copy_tex_question.split('=')[0].replace('\\times', '*'))

    if provided_answer.equals(calculated_answer) is True:
        return True
    else:
        return calculated_answer