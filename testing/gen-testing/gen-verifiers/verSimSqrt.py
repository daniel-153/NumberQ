from sympy import factorint, simplify
from sympy.parsing.latex import parse_latex

def verify(tex_question, tex_answer):
    if tex_question == tex_answer:
        return "No simplification occurred between the question and answer (simplification either wasn't possible or wasn't performed)."

    ans_sqrt_count = tex_answer.count('\\sqrt')
    if ans_sqrt_count > 1:
        return "Answer contains multiple square root expressions."
    elif ans_sqrt_count == 1: # ensure the root in the answer is fully reduced
        int_under_root = int(tex_answer.split('\\sqrt{')[1].split('}')[0])
        prime_factors = factorint(int_under_root)

        if not all(exp == 1 for exp in prime_factors.values()):
            return "Answer contains a square root that is not fully reduced."

    parsed_question = parse_latex(tex_question)
    parsed_answer = parse_latex(tex_answer)

    if parsed_answer.equals(parsed_question) is True:
        return True
    else:
        return simplify(parsed_question)