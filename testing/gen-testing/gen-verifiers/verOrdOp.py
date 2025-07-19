from sympy.parsing.latex import parse_latex

def verify(tex_question, tex_answer):
    question = parse_latex(tex_question)
    answer = parse_latex(tex_answer)

    calculated_answer = question.doit()

    if answer == calculated_answer:
        return None # indicate success (no wrong answer to log)
    else:
        return calculated_answer # answer that didn't match