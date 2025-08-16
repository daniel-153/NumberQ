from .helpers.cmd_helpers import CmdPath, number, pos_number, image, build_cmd_history_validator
from .helpers.geom_helpers import triangle_info_from_points, match_side_angle_vertex_labels, match_right_symbol_to_vertex
from .helpers.gen_helpers import build_new_answer_comparer, exact_decimal_to_frac
from shapely import Point
from sympy import Matrix, sqrt
from sympy.parsing.latex import parse_latex
import re

question_cmds_validator = build_cmd_history_validator([
    {'action': 'canvas_modification', 'property_name': 'width', 'new_value': pos_number}, # 0
    {'action': 'canvas_modification', 'property_name': 'height', 'new_value': CmdPath(-1)}, # 1
    {'action': 'method_call', 'method_name': 'scale', 'args': [pos_number, pos_number]}, # 2
    {'action': 'property_set', 'property_name': 'lineWidth', 'new_value': 5.5}, # 3
    {'action': 'method_call', 'method_name': 'save', 'args': []}, # 4
    {'action': 'method_call', 'method_name': 'translate', 'args': [0, CmdPath(-5)]}, # 5
    {'action': 'method_call', 'method_name': 'scale', 'args': [1, -1]}, # 6
    {'action': 'method_call', 'method_name': 'save', 'args': []}, # 7
    {'action': 'property_set', 'property_name': 'lineCap', 'new_value': 'square'}, # 8
    {'action': 'method_call', 'method_name': 'beginPath', 'args': []}, # 9
    {'action': 'method_call', 'method_name': 'moveTo', 'args': [number, number]}, # 10
    {'action': 'method_call', 'method_name': 'lineTo', 'args': [CmdPath(-1, 0), CmdPath(-1,1)]}, # 11
    {'action': 'method_call', 'method_name': 'lineTo', 'args': [number, number]}, # 12
    {'action': 'method_call', 'method_name': 'lineTo', 'args': [number, number]}, # 13
    {'action': 'method_call', 'method_name': 'lineTo', 'args': [CmdPath(-4, 0), CmdPath(-4, 1)]}, # 14
    {'action': 'method_call', 'method_name': 'stroke', 'args': []}, # 15
    {'action': 'method_call', 'method_name': 'restore', 'args': []}, # 16
    {'action': 'method_call', 'method_name': 'restore', 'args': []}, # 17
    {'action': 'property_set', 'property_name': 'lineWidth', 'new_value': 3}, # 18
    {'action': 'method_call', 'method_name': 'save', 'args': []}, # 19
    {'action': 'method_call', 'method_name': 'translate', 'args': [0, CmdPath(-20)]}, # 20
    {'action': 'method_call', 'method_name': 'scale', 'args': [1, -1]}, # 21
    {'action': 'method_call', 'method_name': 'beginPath', 'args': []}, # 22
    {'action': 'method_call', 'method_name': 'moveTo', 'args': [number, number]}, # 23
    {'action': 'method_call', 'method_name': 'lineTo', 'args': [CmdPath(-1, 0), CmdPath(-1, 1)]}, # 24
    {'action': 'method_call', 'method_name': 'lineTo', 'args': [number, number]}, # 25
    {'action': 'method_call', 'method_name': 'lineTo', 'args': [number, number]}, # 26
    {'action': 'method_call', 'method_name': 'stroke', 'args': []}, # 27
    {'action': 'method_call', 'method_name': 'restore', 'args': []}, # 28
    {'action': 'method_call', 'method_name': 'drawImage', 'args': [image, number, number, number, number]}, # 29
    {'action': 'method_call', 'method_name': 'drawImage', 'args': [image, number, number, number, number]}, # 30
    {'action': 'method_call', 'method_name': 'drawImage', 'args': [image, number, number, number, number]} # 31
])

def answer_form_callback(settings):
    if settings["py_theo_answer_form"] == "decimal_answers": return 'rounded'
    else: return "exact"

def verify(question_cmds, tex_answer, settings):
    # gather info for the question (prompt) triangle
    try:
        q_triangle_info = triangle_info_from_points(*[Point(command['args'][0], command['args'][1]) for command in question_cmds[11:13 + 1]])
        q_side_labels = match_side_angle_vertex_labels(
            q_triangle_info, question_cmds[29:31 + 1], 
            question_cmds[1]['new_value'], angle_labels_allowed=False, vertex_labels_allowed=False
        )["sides"]
        q_right_vertex = match_right_symbol_to_vertex(q_triangle_info, question_cmds[24:26 + 1])
    except Exception as e:
        raise Exception(f"Failed to gather info for Question triangle: {e}")

    # ensure only one side is unknown in the question triangle
    q_triangle_unknowns = []
    for side_name, side_label in q_side_labels.items():
        if side_label in ['?', 'x', 'b', 'c', None]: q_triangle_unknowns.append(side_name)
    if len(q_triangle_unknowns) != 1: return f"Question triangle has too few or too many unknowns: [unknowns: {len(q_triangle_unknowns)}]"

    # now that proper orientation and non-degenerate labeling have been established, the answer can be verified computationally (as in latex verifiers)
    triangle_knowns = [letter for letter in ['a','b','c'] if (not letter in q_triangle_unknowns)]
    known_side_1 = q_side_labels[triangle_knowns[0]]
    known_side_2 = q_side_labels[triangle_knowns[1]]

    # try to extract (parse) the unknown side length out of the tex_answer
    if ( # an x=, b=, c= answer type
        q_side_labels[q_triangle_unknowns[0]] is not None and
        (tex_answer.startswith(q_side_labels[q_triangle_unknowns[0]] + '=') or 
        tex_answer.startswith(q_side_labels[q_triangle_unknowns[0]] + '\\approx'))
    ):         
        answer_for_unknown_side = tex_answer[1:] # break off the x, b, c...
    elif ( # an unknown (unlabeled) side answer type
        (q_side_labels[q_triangle_unknowns[0]] is None or q_side_labels[q_triangle_unknowns[0]] == '?') and
        tex_answer.startswith('{\\scriptstyle \\mathrm{Unknown~Side}}')
    ): 
        answer_for_unknown_side = tex_answer.replace('{\\scriptstyle \\mathrm{Unknown~Side}}', '') # break off the 'Unknown Side' label
    else:
        return f"Could not parse tex answer or match it to the unknown side: {tex_answer}"

    # handle side lengths with units
    unit_matches = re.findall(r'(?:~\\mathrm\{[a-z]{1,2}\})', known_side_1)
    num_unit_matches = len(unit_matches)
    if num_unit_matches == 1: # sides appear to contain units (using known side 1 as a test case for the other sides)
        unit_expression = unit_matches[0]

        if ( # ensure the other two sides contain the same unit and do so exact once
            known_side_2.count(unit_expression) != 1 or 
            answer_for_unknown_side.count(unit_expression) != 1
        ): return 'Triangles contain malformed units.'

        # now that correct unit usage is verified, the units can be dropped from the side lengths (for the following processing)
        known_side_1 = known_side_1.replace(unit_expression, '')
        known_side_2 = known_side_2.replace(unit_expression, '')
        answer_for_unknown_side = answer_for_unknown_side.replace(unit_expression, '')
    elif num_unit_matches > 1:
        return 'Triangles contain malformed units.'
    
    # determine whether the pythagorean theorem or its converse need to be applied
    if q_triangle_unknowns[0] == q_right_vertex.lower(): # side to solve is opposite the right vertex (it is the hypotenuse)
        get_third_side = lambda known_side_1, known_side_2: sqrt(known_side_1**2 + known_side_2**2)
    else: # side to solve for is a leg
        if triangle_knowns[0] == q_right_vertex.lower(): # known side 1 is the hypotenuse
            get_third_side = lambda known_side_1, known_side_2: sqrt(known_side_1**2 - known_side_2**2)
        elif triangle_knowns[1] == q_right_vertex.lower(): # known side 2 is the hypotenuse
            get_third_side = lambda known_side_1, known_side_2: sqrt(known_side_2**2 - known_side_1**2)

    # get the third side as a sympy obj
    provided_side_1 = parse_latex(known_side_1) if not '.' in known_side_1 else parse_latex(exact_decimal_to_frac(known_side_1))
    provided_side_2 = parse_latex(known_side_2) if not '.' in known_side_2 else parse_latex(exact_decimal_to_frac(known_side_2))
    calculated_side_3 = get_third_side(provided_side_1, provided_side_2)

    if (settings['py_theo_answer_form'] == 'exact_answers' or (answer_for_unknown_side.startswith('='))): # answers to be compared exactly
        answer_for_unknown_side = answer_for_unknown_side.replace('=', '')
        provided_side_3 = parse_latex(answer_for_unknown_side) if not '.' in answer_for_unknown_side else parse_latex(exact_decimal_to_frac(answer_for_unknown_side))

        if provided_side_3.equals(calculated_side_3) is not True:
            return str(calculated_side_3)
    elif settings['py_theo_answer_form'] == 'decimal_answers':
        if (not answer_for_unknown_side.startswith('\\approx')):
            return 'Approximate symbol not present in an inexact answer.'
        
        if build_new_answer_comparer(settings, answer_form_callback)(answer_for_unknown_side.replace('\\approx', ''), calculated_side_3) is not True:
            return f"[sympy: {calculated_side_3}] does not round to [gens: {answer_for_unknown_side}] with [places: {settings["decimal_places"]}, keep_rounded_zeros: {settings["keep_rounded_zeros"]}]."
    else:
        return 'Answer comparison method (exact or by correct rounding) could not be resolved from settings and side lengths.'

    # sides now must satisfy the pythagorean theorem, final check is that they also satisfy the triangle inequalities
    # get provided side 3 in a manner that is safe for both the exact and inexact cases
    provided_side_3 = parse_latex(answer_for_unknown_side.replace('\\approx', '')) if not '.' in answer_for_unknown_side else parse_latex(exact_decimal_to_frac(answer_for_unknown_side.replace('\\approx', '')))

    if any(side <= 0 for side in [provided_side_1, provided_side_2, provided_side_3]):
        return 'One or more side lengths in answer and/or question triangle are negative.'

    if (
        provided_side_1 + provided_side_2 > provided_side_3 and
        provided_side_1 + provided_side_3 > provided_side_2 and
        provided_side_2 + provided_side_3 > provided_side_1
    ):
        return True
    else:
        return 'Sides in answer triangle do not satisfy the triangle inequalities (they do not form a possible triangle).'