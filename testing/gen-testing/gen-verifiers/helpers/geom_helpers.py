from shapely import box, Polygon, LineString, Point
from numpy import sign, True_

def parse_contenful_label(five_arg_list, canvas_height):
    image_metadata, x0, y0, d_width, d_height = five_arg_list
    
    bbox = { 
        "x1": x0, # top-left x-cord (no handling)
        "y1": canvas_height - y0, # top-left y-cord (cartesian_y = canvas_height - canvas_y)
        "x2": x0 + d_width, # x rightward expansion (no handling)
        "y2": (canvas_height - y0) - d_height, # y downward expansion (subtract dh instead of adding it (since, in canvas cords, dh is a downward y movement))
    }

    # swap bounding cords to match x1<=x2, y1<=y2 convention if needed
    if bbox["x1"] > bbox["x2"]: bbox["x1"], bbox["x2"] = [bbox["x2"], bbox["x1"]]
    if bbox["y1"] > bbox["y2"]: bbox["y1"], bbox["y2"] = [bbox["y2"], bbox["y1"]]

    return {
        "rectangle": box(bbox["x1"], bbox["y1"], bbox["x2"], bbox["y2"]),
        "latex_content": image_metadata["data"]["latex_code"]
    }

def triangle_info_from_points(point_A, point_B, point_C): # organize useful triangle info from shapely points
    triangle_info = {
        "vertices": {
            "A": point_A,
            "B": point_B,
            "C": point_C
        },
        "sides": {
            "a": LineString([(point.x, point.y) for point in [point_B, point_C]]),
            "b": LineString([(point.x, point.y) for point in [point_C, point_A]]),
            "c": LineString([(point.x, point.y) for point in [point_A, point_B]]),
        },
        "polygon_obj": Polygon([(point.x, point.y) for point in [point_A, point_B, point_C]])
    }

    # ensure the points actually do form a triangle by checking the triangle inequalities
    a = triangle_info["sides"]["a"].length
    b = triangle_info["sides"]["b"].length
    c = triangle_info["sides"]["c"].length

    if (a + b > c) and (a + c > b) and (b + c > a):
        return triangle_info
    else:
        raise Exception(f"The three provided points do not form a valid triangle: [point_A: {point_A}, point_B: {point_B}, point_C: {point_C}]")

def match_triangle_side_labels(triangle_info, parsed_deter_label_list): # match each determined label to a side (the side that a label corresponds to is assumed to be one it's midpoint is closest to)   
    side_label_strings = {'a': None, 'b': None, 'c': None}
    matched_sides = [] # sides that a label has been found for
    for label in parsed_deter_label_list:
        side_distances = {'a': None, 'b': None, 'c': None}
        for side_name, side_segment in triangle_info['sides'].items():
            side_distances[side_name] = side_segment.distance(label['rectangle'].centroid)

        min_distance = min(list(side_distances.values()))
        sides_with_min_distance = [] # should only be one if valid
        for side_name, side_distance in side_distances.items():
            if side_distance == min_distance: sides_with_min_distance.append(side_name)

        if (len(sides_with_min_distance) != 1):
            raise  Exception(f"Side label could not be determined to be closest to a particular side: [label rect: {label['rectangle']}], [triangle: {triangle_info['polygon_obj']}].")
        else:
            side_label_strings[sides_with_min_distance[0]] = label['latex_content']
            matched_sides.append(sides_with_min_distance[0])

    if len(matched_sides) != len(set(matched_sides)):
        raise Exception(f"Multiple labels correspond to a single side in the triangle.")

    return side_label_strings

def match_triangle_vertex_labels(triangle_info, parsed_deter_label_list): # match each label to an vertex (the matching vertex is assumed to be the one the rect centroid is closest to)
    vertex_label_strings = {'A': None, 'B': None, 'C': None}
    matched_vertices = [] # vertices that a label has been found for
    for label in parsed_deter_label_list:
        vertex_distances = {'A': None, 'B': None, 'C': None}
        for vertex_name, vertex_point in triangle_info['vertices'].items():
            vertex_distances[vertex_name] = vertex_point.distance(label['rectangle'].centroid)

        min_distance = min(list(vertex_distances.values()))
        vertices_with_min_distance = [] # should only be one if valid
        for vertex_name, vertex_distance in vertex_distances.items():
            if vertex_distance == min_distance: vertices_with_min_distance.append(vertex_name)
        
        if (len(vertices_with_min_distance) != 1):
            raise  Exception(f"Vertex label could not be determined to be closest to a particular vertex: [label rect: {label['rectangle']}], [triangle: {triangle_info['polygon_obj']}].")
        else:
            vertex_label_strings[vertices_with_min_distance[0]] = label['latex_content']
            matched_vertices.append(vertices_with_min_distance[0])

    if len(matched_vertices) != len(set(matched_vertices)):
        raise Exception(f"Multiple labels correspond to a single vertex in the triangle.")

    return vertex_label_strings

def match_triangle_angle_labels(triangle_info, parsed_deter_label_list): # process is indentical to matching vertex labels (comparing distances to vertices + validation)
    return match_triangle_vertex_labels(triangle_info, parsed_deter_label_list)

def match_right_symbol_to_vertex(triangle_info, right_symbol_cmds): # match the right angle label to a side (the side it corresponds to is assumed to be the one it's closest to)
    # model the right symbol "corner" as a full rectangle (point_A is an endpoint, point_B is the corner point, and point_C is another endpoint)
    point_A, point_B, point_C = [Point(cmd['args'][0], cmd['args'][1]) for cmd in right_symbol_cmds]
    point_D = Point(point_A.x + point_C.x - point_B.x, point_A.y + point_C.y - point_B.y) # the other corner needed to complete the rectangle
    right_symbol_rect = Polygon([(point.x, point.y) for point in [point_A, point_B, point_C, point_D]])

    vertex_distances = {'A': None, 'B': None, 'C': None}
    for vertex_name, vertex_point in triangle_info['vertices'].items():
        vertex_distances[vertex_name] = vertex_point.distance(right_symbol_rect)
    
    min_distance = min(list(vertex_distances.values()))
    vertex_with_min_distance = [] # should only be one if valid
    for vertex_name, vertex_distance in vertex_distances.items():
        if vertex_distance == min_distance: vertex_with_min_distance.append(vertex_name)

    if (len(vertex_with_min_distance) != 1):
        raise  Exception(f"Right angle label could not be determined to be closest to a particular vertex: {right_symbol_cmds}.")

    return vertex_with_min_distance[0]

# for a label set of 9 or fewer labels, try to match the labels to triangle sides, vertices, & angles
def match_side_angle_vertex_labels(
        triangle_info, labeling_commands, canvas_height, 
        side_labels_allowed = True, angle_labels_allowed = True, vertex_labels_allowed = True
):     
    # set up linear equalities to model the triangle's sides to sort the points
    point_in_triangle = triangle_info['polygon_obj'].representative_point() # cheaply computed point that is guaranteed to be within the triangle
    side_inequalities = []
    for line_string in triangle_info['sides'].values():
        x0, y0 = line_string.coords[0]
        x1, y1 = line_string.coords[1]

        det_sign = lambda test_point_x, test_point_y, x_0 = x0, x_1 = x1, y_0 = y0, y_1 = y1: sign( (x_1 - x_0)*(test_point_y - y_0) - (y_1 - y_0)*(test_point_x - x_0) )
        sign_of_triangle_inpoint = det_sign(point_in_triangle.x, point_in_triangle.y)

        side_inequalities.append(lambda test_point_x, test_point_y, point_tester = det_sign, inpoint_sign = sign_of_triangle_inpoint: ( point_tester(test_point_x, test_point_y) == inpoint_sign ))

    # a given point in the xy plane must satisfy 3 (inside the triangle), 2 (in a side zone), or 1 (in a vertex zone) of the inequalities (together, they cover the entire plane)
    angle_labels = [] # inside the triangle (max of 3) | 3 in-eqs satisfied
    side_labels = [] # outside the triangle (max of 3) | 2 in-eqs satisfied
    vertex_labels = [] # outside the triangle (max of 3) | 1 in-eq satisfied
    # only parse mjx_image(s) (not null_image(s) -- which are considered to be 'free' undetermined labels)
    determined_labels = [parse_contenful_label(label_cmd['args'], canvas_height) for label_cmd in labeling_commands if label_cmd['args'][0]['identifier_note'] == 'mjx_image']
    for label in determined_labels:
        label_centroid = label['rectangle'].centroid
        satisfied_ineq_count = sum([1 for inequality in side_inequalities if inequality(label_centroid.x, label_centroid.y) is True_])

        if satisfied_ineq_count == 3 and label['rectangle'].within(triangle_info['polygon_obj']): angle_labels.append(label)
        elif satisfied_ineq_count == 2 and label['rectangle'].disjoint(triangle_info['polygon_obj']): side_labels.append(label)
        elif satisfied_ineq_count == 1 and label['rectangle'].disjoint(triangle_info['polygon_obj']): vertex_labels.append(label)
        else: raise Exception(f"Label could not be classified as a side, angle, or vertex label (it is likely overlapping the triangle); [triangle_info: {triangle_info}, label: {label}].")

    # check the general label number restrictions (never more than 3 of a kind)
    exception_info = f"[triangle_info: {triangle_info}, labeling_cmds: {labeling_commands}]"
    if len(side_labels) > 3: raise Exception(f"Triangle has too many ({len(side_labels)}) side (side region) labels; {exception_info}.")
    if len(angle_labels) > 3: raise Exception(f"Triangle has too many ({len(angle_labels)}) angle (inside) labels; {exception_info}.")
    if len(vertex_labels) > 3: raise Exception(f"Triangle has too many ({len(vertex_labels)}) vertex (vertex region) labels; {exception_info}.")

    # check the config label number restrictions (whether certain labels types are not even allowed on the current triangle but were still found)
    if (side_labels_allowed is not True) and len(side_labels) != 0:
        raise Exception(f"Triangle labels were matched to sides, but side labels were not allowed; {exception_info}.")
    if (angle_labels_allowed is not True) and len(angle_labels) != 0:
        raise Exception(f"Triangle labels were matched to angles, but angle labels were not allowed; {exception_info}.")
    if (vertex_labels_allowed is not True) and len(vertex_labels) != 0:
        raise Exception(f"Triangle labels were matched to vertices, but vertex labels were not allowed; {exception_info}.")

    # delegate to side, angle, and vertex matchers, combine into one dict, and return (delegater functions throw by themselves on matching issues)
    return {
        "sides": match_triangle_side_labels(triangle_info, side_labels),
        "angles": match_triangle_angle_labels(triangle_info, angle_labels),
        "vertices": match_triangle_vertex_labels(triangle_info, vertex_labels)
    }