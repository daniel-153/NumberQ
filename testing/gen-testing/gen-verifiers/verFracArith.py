from sympy.parsing.latex import parse_latex

def verify(tex_question, tex_answer):
    question = parse_latex(tex_question.replace('=', '', 1))

    # determine if the answer is in fraction, integer, or mixed number form
    answer = None
    if tex_answer.startswith('\\frac'): # is a fraction
        answer = parse_latex(tex_answer)
    elif '\\frac' in tex_answer: # contains a fraction but not at the start (mixed number)
        just_before_frac = tex_answer.index('\\')
        parsed_mixed_number = tex_answer[:just_before_frac] + '+' + tex_answer[just_before_frac:] # 3\frac{2}{5} -> 3 + \frac{2}{5}
        answer = parse_latex(parsed_mixed_number)
    else: # doesn't contain a fraction (just an integer)
        answer = parse_latex(tex_answer)

    calculated_answer = question.doit()

    if answer.doit() == calculated_answer:
        return True
    else:
        return calculated_answer