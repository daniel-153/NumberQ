from .helpers.cmd_helpers import CmdPath, number, pos_number, image, build_cmd_history_validator
from .helpers.geom_helpers import triangle_info_from_points, match_side_angle_vertex_labels, match_right_symbol_to_vertex
from shapely import Point
from sympy import pi, sin
from sympy.parsing.latex import parse_latex

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
    {'action': 'method_call', 'method_name': 'drawImage', 'args': [image, number, number, number, number]}, # 31
    {'action': 'method_call', 'method_name': 'drawImage', 'args': [image, number, number, number, number]}, # 32
    {'action': 'method_call', 'method_name': 'drawImage', 'args': [image, number, number, number, number]} # 33
])

def verify(question_cmds, tex_answer):
    # gather info for the question (prompt) triangle
    try:
        q_triangle_info = triangle_info_from_points(*[Point(command['args'][0], command['args'][1]) for command in question_cmds[11:13 + 1]])
        q_triangle_labels = match_side_angle_vertex_labels( # side and angle labels
            q_triangle_info, question_cmds[29:33 + 1], 
            question_cmds[1]['new_value'], vertex_labels_allowed=False
        )
        q_right_vertex = match_right_symbol_to_vertex(q_triangle_info, question_cmds[24:26 + 1])
    except Exception as e:
        raise Exception(f"Failed to gather info for Question triangle: {e}")
    
    # in genSpTri, there must always be 3 side labels and 1 or 2 angle labels
    num_determined_side_labels = sum([1 for label_value in q_triangle_labels['sides'].values() if label_value is not None])
    if num_determined_side_labels != 3:
        return f"Incorrect number of side labels matched in question triangle; expected 3, matched [{num_determined_side_labels}]."
    num_determined_angle_labels = sum([1 for label_value in q_triangle_labels['angles'].values() if label_value is not None])
    if not (num_determined_angle_labels == 1 or num_determined_angle_labels == 2):
        return f"Incorrect number of angle labels matched in question triangle; expected 1 or 2, matched [{num_determined_angle_labels}]."

    # make sure the right vertex is different from the two other angle-labeled vertices (the right vertex isn't the same as one of the 30-60 or 45-45 vertices)
    free_angle_label_vertices = []
    occupied_angle_label_vertices = []
    for vertex_name, angle_label in q_triangle_labels['angles'].items():
        if angle_label is None:
            free_angle_label_vertices.append(vertex_name)
        else:
            occupied_angle_label_vertices.append(vertex_name)
    
    if not (q_right_vertex in free_angle_label_vertices):
        return f"Right angle vertex ({q_right_vertex}) occupies the same space as another vetex (labeled vertices: {q_triangle_labels['angles']})."
    
    # resolve the numerical angle measures (in degrees) for all the vertices
    angle_tex_to_num_map = {'30^\\circ': 30, '45^\\circ': 45, '60^\\circ': 60}
    numerical_angle_values = {'A': None, 'B': None, 'C': None}
    if len(occupied_angle_label_vertices) == 1: # one explicitly labeled vertex like (45deg) + the right square labeled vertex
        # provided angle
        provided_angle_label = q_triangle_labels['angles'][occupied_angle_label_vertices[0]]

        if not (provided_angle_label in angle_tex_to_num_map):
            return f"Could not resolve angle label on vertex '{occupied_angle_label_vertices[0]}': '{provided_angle_label}' could not be mapped to 30, 45, or 60."
        
        numerical_angle_values[occupied_angle_label_vertices[0]] = angle_tex_to_num_map[provided_angle_label]

        # right angle
        numerical_angle_values[q_right_vertex] = 90 # insert the 90deg angle measure (garunteed to be in a previously unoccupied spot by verification above)

        # value for the third (implied but not provided angle) -- calculated using A+B+C=180
        other_angle_letter = [vertex_letter for vertex_letter in ['A','B','C'] if vertex_letter not in [occupied_angle_label_vertices[0], q_right_vertex]][0]
        numerical_angle_values[other_angle_letter] = 180 - numerical_angle_values[occupied_angle_label_vertices[0]] - numerical_angle_values[q_right_vertex]
    elif len(occupied_angle_label_vertices) == 2: # two explicitly labeled vertices (like 30deg & 60 deg) + the right square labeled vertex
        # provided angle #1
        provided_angle_label_1 = q_triangle_labels['angles'][occupied_angle_label_vertices[0]]

        if not (provided_angle_label_1 in angle_tex_to_num_map):
            return f"Could not resolve angle label on vertex '{occupied_angle_label_vertices[0]}': '{provided_angle_label_1}' could not be mapped to 30, 45, or 60."
        
        numerical_angle_values[occupied_angle_label_vertices[0]] = angle_tex_to_num_map[provided_angle_label_1]

        # provided angle #2
        provided_angle_label_2 = q_triangle_labels['angles'][occupied_angle_label_vertices[1]]

        if not (provided_angle_label_2 in angle_tex_to_num_map):
            return f"Could not resolve angle label on vertex '{occupied_angle_label_vertices[1]}': '{provided_angle_label_2}' could not be mapped to 30, 45, or 60."
        
        numerical_angle_values[occupied_angle_label_vertices[1]] = angle_tex_to_num_map[provided_angle_label_2]

        # right angle
        numerical_angle_values[q_right_vertex] = 90 # insert the 90deg angle measure (garunteed to be in a previously unoccupied spot by verification above)

    # make sure the angles add to 180 (they are actually possible triangle angles labels)
    angle_sum = sum(list(numerical_angle_values.values()))
    if angle_sum != 180:
        return f"Provided angles do not form a valid triangle; their sum ({angle_sum}) is not equal to 180."
    
    # the angle labels are now resolved; next step is to resolve the side labels (knowns sides can only be numerical values; unknown sides can be two distict lowercase letters -- like x & y, p & q, etc)
    known_side_labels = []
    unknown_side_labels = []
    for side_name, side_label_tex_str in q_triangle_labels['sides'].items():
        if not isinstance(side_label_tex_str, str): return f"Invalid side label: '{side_label_tex_str}' (type of '{type(side_label_tex_str)}')"

        parsed_side_label = parse_latex(side_label_tex_str) # throws if not parse-able

        if len(parsed_side_label.free_symbols) == 0: # purely numeric label (the known side)
            known_side_labels.append({side_name: parsed_side_label})
        elif len(side_label_tex_str) == 1 and side_label_tex_str.isalpha() and side_label_tex_str.islower(): # lowercase alphabet letter (an unknown side)
            unknown_side_labels.append({side_name: side_label_tex_str})
        else: # could not be determined/incorrect format
            return f"Side label could not be resolved as known or unknown or was in incorrect format: '{side_label_tex_str}'"
    
    # there must be 2 unknown labels and 1 known label
    if len(known_side_labels) != 1 or len(unknown_side_labels) != 2:
        return f"Incorrect number of known and unkown side labels; [# known labels: {len(known_side_labels)}, # unknown labels: {len(unknown_side_labels)}, labels: {q_triangle_labels['sides']}]."

    # the unknown labels now must be lowercase alphabet letters, but it still need to be checked if they are distinct (not the same letter)
    unknown_side_marker_1 = list(unknown_side_labels[0].values())[0]
    unknown_side_marker_2 = list(unknown_side_labels[1].values())[0]
    if unknown_side_marker_1 == unknown_side_marker_2:
        return f"Incorrect label format: labels for the two unknown sides are the same [labels: {q_triangle_labels['sides']}]."
    
    # use the law of sines to calculate what the values for the two unknown sides should be
    calculated_side_values = {} # (calculated values for the unknowns -- like x: 3, y: sqrt(2))
    abc_to_ABC = {'a': 'A', 'b': 'B', 'c': 'C'}
    known_side_letter = list(known_side_labels[0].keys())[0]
    known_side_opposite_angle = abc_to_ABC[known_side_letter]
    known_side_length = known_side_labels[0][known_side_letter]
    for unknown_label_dict in unknown_side_labels: # unknown_label_dict looks like {'a': 'x'} or {'b': y}, etc
        unknown_side_letter = list(unknown_label_dict.keys())[0]
        unknown_side_opposite_angle = abc_to_ABC[unknown_side_letter]
        calced_side_length = sin( numerical_angle_values[unknown_side_opposite_angle] * (pi / 180) ) * ( known_side_length / sin( numerical_angle_values[known_side_opposite_angle] * (pi / 180) ))

        calculated_side_values[unknown_label_dict[unknown_side_letter]] = calced_side_length # example: {'x': sqrt(2)}

    # final step is to compare these calculated side lengths to the ones provided in the tex_answer (which looks like 'x=1,\:y=\frac{2\sqrt{3}}{3}')
    # unpack the tex answer
    first_var_equals_expr, second_var_equals_expr = tex_answer.split(',\\:') # throws if unpacking doesn't make sense
    first_var, first_var_expr = first_var_equals_expr.split('=') # throws if unpacking doesn't make sense
    second_var, second_var_expr = second_var_equals_expr.split('=') # throws if unpacking doesn't make sense

    # ensure that both first_var and second_var are one of the labels (extracted above), and that first_var and second_var are not the same
    if not (
        first_var in [unknown_side_marker_1, unknown_side_marker_2] and
        second_var in [unknown_side_marker_1, unknown_side_marker_2] and
        first_var != second_var
    ):
        return f"tex_answer does not match unknown labels extracted from the triangle; [extracted unknown labels: {[unknown_side_marker_1, unknown_side_marker_2]}, tex_answer: {tex_answer}]."
    
    # compare the provided and calculated values
    provided_first_var_value = parse_latex(first_var_expr)
    provided_second_var_value = parse_latex(second_var_expr)
    if (
        (provided_first_var_value.equals(calculated_side_values[first_var]) is True) and
        (provided_second_var_value.equals(calculated_side_values[second_var]) is True)
    ):
        return None
    else:
        return f"{first_var} = {calculated_side_values[first_var]} | {second_var} = {calculated_side_values[second_var]}"