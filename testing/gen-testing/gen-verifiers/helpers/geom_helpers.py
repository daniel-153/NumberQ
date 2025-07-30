from shapely import box, Polygon, LineString, Point

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
    return {
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

def match_triangle_side_labels(triangle_info, labeling_commands, canvas_height): # match each determined label to a side (the side that a label corresponds to is assumed to be one that it is closest to)
    # only parse mjx_image(s) (not null_image(s) -- which are considered to be 'free' undetermined labels)
    determined_labels = [parse_contenful_label(label_cmd['args'], canvas_height) for label_cmd in labeling_commands if label_cmd['args'][0]['identifier_note'] == 'mjx_image']

    # ensure all determined side labels are outside of the triangle
    if not all(label["rectangle"].disjoint(triangle_info['polygon_obj']) for label in determined_labels):
        raise  Exception('One or more triangle side labels are not completely outside of the triangle.')
    
    side_label_strings = {'a': None, 'b': None, 'c': None}
    matched_sides = [] # sides that a label has been found for
    for label in determined_labels:
        side_distances = {'a': None, 'b': None, 'c': None}
        for side_name, side_segment in triangle_info['sides'].items():
            side_distances[side_name] = side_segment.distance(label['rectangle'])

        min_distance = min(list(side_distances.values()))
        sides_with_min_distance = [] # should only be one if valid
        for side_name, side_distance in side_distances.items():
            if side_distance == min_distance: sides_with_min_distance.append(side_name)

        if (len(sides_with_min_distance) != 1):
            raise  Exception(f"Side label could not be determined to be closest to a particular side: {label}.")
        else:
            side_label_strings[sides_with_min_distance[0]] = label['latex_content']
            matched_sides.append(sides_with_min_distance[0])

    if len(matched_sides) != len(set(matched_sides)):
        raise  Exception(f"Multiple labels correspond to a single side in the triangle.")

    return side_label_strings

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