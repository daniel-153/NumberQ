from sympy import sympify

def verify(tex_question, tex_answer):
    provided_answer = sympify(tex_answer)
    try:
        calculated_answer = eval(tex_question.replace('\\times', '*').replace('\\cdot', '*').replace('\\div', '/').replace('^', '**'))
    except Exception as e:
        return f"Failed to evaluate tex_question: '{tex_question}', error: '{e}'"

    if provided_answer.equals(calculated_answer) is True:
        return None
    else:
        return calculated_answer