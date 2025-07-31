from .helpers.cmd_helpers import CmdPath, number, pos_number, image, build_cmd_history_validator
from .helpers.geom_helpers import triangle_info_from_points, match_triangle_side_labels, match_right_symbol_to_vertex
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

answer_cmds_validator = question_cmds_validator

def answer_form_callback(settings):
    if settings["py_theo_answer_form"] == "decimal_answers": return 'rounded'
    else: return "exact"

def verify(question_cmds, answer_cmds, settings):
    # gather info for the question (prompt) triangle
    try:
        q_triangle_info = triangle_info_from_points(*[Point(command['args'][0], command['args'][1]) for command in question_cmds[11:13 + 1]])
        q_side_labels = match_triangle_side_labels(q_triangle_info, question_cmds[29:31 + 1], question_cmds[1]['new_value']) # triangle_info, labeling_cmds, canvas_height
        q_right_vertex = match_right_symbol_to_vertex(q_triangle_info, question_cmds[24:26 + 1])
    except Exception as e:
        raise Exception(f"Failed to gather info for Question triangle: {e}")

    # ensure only one side is unknown in the question triangle
    q_triangle_unknowns = []
    for side_name, side_label in q_side_labels.items():
        if side_label in ['?', 'x', 'b', 'c', None]: q_triangle_unknowns.append(side_name)
    if len(q_triangle_unknowns) != 1: return f"Question triangle has too few or too many unknowns: [unknowns: {len(q_triangle_unknowns)}]"

    # gather info for the answer triangle
    try:
        a_triangle_info = triangle_info_from_points(*[Point(command['args'][0], command['args'][1]) for command in answer_cmds[11:13 + 1]])
        a_side_labels = match_triangle_side_labels(a_triangle_info, answer_cmds[29:31 + 1], answer_cmds[1]['new_value']) # triangle_info, labeling_cmds, canvas_height
        a_right_vertex = match_right_symbol_to_vertex(a_triangle_info, answer_cmds[24:26 + 1])
    except Exception as e:
        raise Exception(f"Failed to gather info for Answer triangle: {e}")
    
    # (q) and (a) triangle are not drawn identically, but they must only differ by two properties: a scaling and a translation (strategy below compares the two right corners to determine this)
    if q_right_vertex != a_right_vertex: 
        return f"Orientation Mismatch between question and answer triangles: vertex with the right angle in the question and answer triangle are not the same: [question right vertex: {q_right_vertex}], [answer right vertex: {a_right_vertex}]."

    # calling the right vertex 'A' for convenience below
    right_vertex_letter = q_right_vertex
    other_vertices = [vertex_letter for vertex_letter in ['A','B','C'] if vertex_letter != right_vertex_letter]
    q_AC = Matrix([q_triangle_info['vertices'][other_vertices[0]].x - q_triangle_info['vertices'][right_vertex_letter].x, q_triangle_info['vertices'][other_vertices[0]].y - q_triangle_info['vertices'][right_vertex_letter].y])
    q_AB = Matrix([q_triangle_info['vertices'][other_vertices[1]].x - q_triangle_info['vertices'][right_vertex_letter].x, q_triangle_info['vertices'][other_vertices[1]].y - q_triangle_info['vertices'][right_vertex_letter].y])
    a_AC = Matrix([a_triangle_info['vertices'][other_vertices[0]].x - a_triangle_info['vertices'][right_vertex_letter].x, a_triangle_info['vertices'][other_vertices[0]].y - a_triangle_info['vertices'][right_vertex_letter].y])
    a_AB = Matrix([a_triangle_info['vertices'][other_vertices[1]].x - a_triangle_info['vertices'][right_vertex_letter].x, a_triangle_info['vertices'][other_vertices[1]].y - a_triangle_info['vertices'][right_vertex_letter].y])
    diff_threshold = 0.01 # difference of 0.01 or below is considered to be arbitrary for canvas drawing purposes

    # ensure the corners underwent a uniform scaling and no rotation 
    if abs((q_AC.norm() / a_AC.norm()) - (q_AB.norm() / a_AB.norm())) > diff_threshold: # detectable scaling mismatch between AC, AB and AC', AB'
        return f"Orientation Mismatch between question and answer triangles: detectable scaling mismatch between AC, AB and AC', AB' -> [AC/AC': {(q_AC.norm() / a_AC.norm())}, AB/AB': {(q_AB.norm() / a_AB.norm())}]"
    if abs( q_AC.dot(a_AC) / (q_AC.norm()*a_AC.norm()) - 1) > diff_threshold: # detectable rotation between AC and AC'
        return f"Orientation Mismatch between question and answer triangles: detectable rotation between AC and AC' -> [angle acos arg: {q_AC.dot(a_AC) / (q_AC.norm()*a_AC.norm())}]"
    if abs( q_AB.dot(a_AB) / (q_AB.norm()*a_AB.norm()) - 1) > diff_threshold: # detectable rotation between AB and AB'
        return f"Orientation Mismatch between question and answer triangles: detectable rotation between AB and AB' -> [angle acos arg: {q_AB.dot(a_AC) / (q_AB.norm()*a_AB.norm())}]"
    
    # last check for correct orientation is that the known labels are in exactly the same place in the question and answer (it follows that all labels are in exactly the same place)
    triangle_knowns = [letter for letter in ['a','b','c'] if (not letter in q_triangle_unknowns)]
    if (
        q_side_labels[triangle_knowns[0]] != a_side_labels[triangle_knowns[0]] or
        q_side_labels[triangle_knowns[1]] != a_side_labels[triangle_knowns[1]]
    ): return "Orientation Mismatch between question and answer triangles: known side labels are not in the same location in the question and answer triangles."

    # now that proper orientation and non-degenerate labeling have been established, the answer can be verified computationally (as in latex verifiers)
    known_side_1 = q_side_labels[triangle_knowns[0]]
    known_side_2 = q_side_labels[triangle_knowns[1]]
    answer_for_unknown_side = a_side_labels[q_triangle_unknowns[0]]

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

    if (settings['py_theo_answer_form'] == 'exact_answers' or (not '\\approx' in answer_for_unknown_side)): # answers to be compared exactly
        provided_side_3 = parse_latex(answer_for_unknown_side) if not '.' in answer_for_unknown_side else parse_latex(exact_decimal_to_frac(answer_for_unknown_side))

        if provided_side_3.equals(calculated_side_3) is not True:
            return calculated_side_3
    elif settings['py_theo_answer_form'] == 'decimal_answers':
        if (not '\\approx' in answer_for_unknown_side):
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
        return None
    else:
        return 'Sides in answer triangle do not satisfy the triangle inequalities (they do not form a possible triangle).'