export function buildPointSet(...points) {
    const point_set = {};

    let i = 0;
    points.forEach(point => {
        point_set[_getPointKey(i)] = point;
        i++;
    });

    return point_set;
}

export function convertAngle(theta, to_unit) {
    if (to_unit === 'to_rad') {
        return theta * (Math.PI / 180);
    }
    else if (to_unit === 'to_deg') {
        return theta * (180 / Math.PI);
    }
}

export const build_triangle = {
    ASA: function(angle_1, side, angle_2) {
        return {
            A: {
                x: 0,
                y: 0
            },
            B: {
                x: side * Math.cos(angle_1),
                y: side * Math.sin(angle_1)
            },
            C: {
                x: side * (Math.sin(angle_2) / Math.sin(angle_1 + angle_2)),
                y: 0
            }
        };
    },
    SAS: function(side_1, angle, side_2) {
        return {
            A: {
                x: 0,
                y: 0
            },
            B: {
                x: side_1,
                y: 0
            },
            C: {
                x: side_1 - side_2 * Math.cos(angle),
                y: side_2 * Math.sin(angle)
            }
        };
    },
    SSS: function(side_1, side_2, side_3) {
        return {
            A: {
                x: 0,
                y: 0
            },
            B: {
                x: side_1,
                y: 0
            },
            C: {
                x: (side_1**2 - side_2**2 + side_3**2) / 2*side_1,
                y: side_2 * Math.sin(Math.acos((side_1**2 + side_2**2 - side_3**2) / (2*side_1*side_2)))
            }
        };
    },
    AAS: function(angle_1, angle_2, side) {
        return {
            A: {
                x: 0,
                y: 0
            },
            B: {
                x: side,
                y: 0
            },
            C: {
                x: side * (Math.sin(angle_1 + angle_2) / Math.sin(angle_1)) * Math.cos(angle_2),
                y: side * (Math.sin(angle_1 + angle_2) / Math.sin(angle_1)) * Math.sin(angle_2)
            }
        };
    }
}

export const transformations = {
    translate: function(translating_point, translation) {
        translating_point.x = translating_point.x + translation.x;
        translating_point.y = translating_point.y + translation.y;
    },
    rotate: function(rotating_point, fixed_point, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const dx = rotating_point.x - fixed_point.x;
        const dy = rotating_point.y - fixed_point.y;

        const rotatedX = dx * cos - dy * sin;
        const rotatedY = dx * sin + dy * cos;

        rotating_point.x = rotatedX + fixed_point.x;
        rotating_point.y = rotatedY + fixed_point.y;
    },
    reflect: function(reflecting_point, line_point, line_slope) {
        if (line_slope === Infinity || line_slope === -Infinity) { // vertical line
            reflecting_point.x = 2*line_point.x - reflecting_point.x;
            // no change to the y-cord
        }
        else {
            const temp = reflecting_point.x;
            reflecting_point.x = (2*line_point.x*line_slope**2 - reflecting_point.x*line_slope**2 - 2*line_slope*line_point.y + reflecting_point.x + 2*reflecting_point.y*line_slope) / (1 + line_slope**2);
            reflecting_point.y = (reflecting_point.y*line_slope**2 + 2*temp*line_slope - 2*line_point.x*line_slope + 2*line_point.y - reflecting_point.y) / (1 + line_slope**2);
        }
    },
    dilate: function(dilating, fixed_point, scale_factor) {
        dilating.x = scale_factor*dilating.x + fixed_point.x*(1 - scale_factor);
        dilating.y = scale_factor*dilating.y + fixed_point.y*(1 - scale_factor);
    },
    transformPointSet: function(point_set, transformation, ...args) {
        for (const [_, point] of Object.entries(point_set)) {
            this[transformation](point, ...args);
        }
    }
}

export function getBoundingRect(point_set) {
    let leftmost_x_cord = Infinity;
    let rightmost_x_cord = -Infinity;
    let bottommost_y_cord = Infinity;
    let topmost_y_cord = -Infinity;
    
    for (const [_, point] of Object.entries(point_set)) {
        if (point.x < leftmost_x_cord) leftmost_x_cord = point.x;
        if (point.x > rightmost_x_cord) rightmost_x_cord = point.x;
        if (point.y < bottommost_y_cord) bottommost_y_cord = point.y;
        if (point.y > topmost_y_cord) topmost_y_cord = point.y;
    }

    return {
        x1: leftmost_x_cord, x2: rightmost_x_cord, 
        y1: bottommost_y_cord, y2: topmost_y_cord
    };
}

export function normalizePointSetPosition(point_set, position = {x: 0, y: 0}, quadrant = 1) {
    const bounding_rect = getBoundingRect(point_set);

    // determine the necessary translation based on the desired quadrant and the bounding rect
    let translation = {x: null, y: null};
    if (quadrant === 1) {
        translation.x = -bounding_rect.x1;
        translation.y = -bounding_rect.y1;
    }
    else if (quadrant === 2) {
        translation.x = -bounding_rect.x2;
        translation.y = -bounding_rect.y1;
    }
    else if (quadrant === 3) {
        translation.x = -bounding_rect.x2;
        translation.y = -bounding_rect.y2;
    }
    else if (quadrant === 4) {
        translation.x = -bounding_rect.x1;
        translation.y = -bounding_rect.y2;
    }

    // Now add on the desired position to the translation
    translation.x += position.x;
    translation.y += position.y;
    
    transformations.transformPointSet(point_set, 'translate', translation);
}

export function fitPointSet(
    point_set, 
    bounding_rect = {x1: 0, x2: 1000, y1: 0, y2: 1000}, 
    x_justify = 'left', y_justify = 'bottom'
) {
    // start by normalizing position to Q1 (bottom-left) of the given bounding rect
    normalizePointSetPosition(point_set, {x: bounding_rect.x1, y: bounding_rect.y1}, 1);

    // determine how much the point set needs to scale to fit snugly in Q1 of the bounding rect
    let ps_bounding_rect = getBoundingRect(point_set);

    // the point set can overflow in the positive x or y directions (or one/neither => scale factor is the max of the two direction ratios)
    const x_scale_factor = (bounding_rect.x2 - bounding_rect.x1) / (ps_bounding_rect.x2 - ps_bounding_rect.x1);
    const y_scale_factor = (bounding_rect.y2 - bounding_rect.y1) / (ps_bounding_rect.y2 - ps_bounding_rect.y1);
    const applied_scale_factor = Math.min(x_scale_factor, y_scale_factor);
    
    // apply the scaling
    transformations.transformPointSet(
        point_set, 'dilate', 
        {x: bounding_rect.x1, y: bounding_rect.y1}, 
        applied_scale_factor
    );

    // get the updated bounding rect
    ps_bounding_rect = getBoundingRect(point_set);

    // get the amount of remaining space in the positive x and y directions
    const x_space = bounding_rect.x2 - ps_bounding_rect.x2;
    const y_space = bounding_rect.y2 - ps_bounding_rect.y2;

    let justification_translation = {x: null, y: null};

    // determine x-justification (left justified by default)
    if (x_justify === 'left') {
        justification_translation.x = 0; // no x translation
    }
    else if (x_justify === 'center') {
        justification_translation.x = x_space / 2; // half the remaining space in the x-direction
    }
    else if (x_justify === 'right') {
        justification_translation.x = x_space; // all the remaining space in the x-direction
    }

    // determine the y-justification (bottom justified by default)
    if (y_justify === 'bottom') {
        justification_translation.y = 0; // no y translation
    }
    else if (y_justify === 'center') {
        justification_translation.y = y_space / 2; // half the remaining space in the y-direction
    }
    else if (y_justify === 'top') {
        justification_translation.y = y_space; // all the remaining space in the y-direction
    }

    // apply the justification translation
    transformations.transformPointSet(point_set, 'translate', justification_translation);
}

export function forEachPoint(point_set_obj, callback) {
    for (let i = 0; i < Object.entries(point_set_obj).length; i++) {
        const key = _getPointKey(i); 

        callback(point_set_obj[key]);
    }
}

export function getCombinedPointSet(...point_sets) {
    const combined_point_set = {};

    let i = 0; // using to ensure unique keys
    point_sets.forEach(point_set_obj => {
        for (const [_, point] of Object.entries(point_set_obj)) {
            combined_point_set[String(i++)] = point;
        }
    });

    return combined_point_set;
}

export function getPolygonPointArray(polygon_point_set) {
    const point_array = [];

    forEachPoint(polygon_point_set, function(point_obj) {
        point_array.push(point_obj);
    });

    return point_array;
}

export function getPolygonSignedArea(polygon_point_set) {
    const point_array = getPolygonPointArray(polygon_point_set);

    let sum = 0;
    for (let i = 0; i < point_array.length - 1; i++) { // "shoelace" formula
        sum += point_array[i].x*point_array[i + 1].y - point_array[i + 1].x*point_array[i].y
    }

    return sum / 2;
}

export function getPolygonOrientation(polygon_point_set) {
    const signed_area = getPolygonSignedArea(polygon_point_set);

    if (signed_area > 0) return 'CCW';
    else if (signed_area < 0) return 'CW';
}

export function getLineSegment(polygon, side_name) {
    let [ first_vertex, second_vertex] = side_name.split('-');
    first_vertex = polygon[first_vertex];
    second_vertex = polygon[second_vertex];

    return buildPointSet(
        {
            x: first_vertex.x,
            y: first_vertex.y
        },
        {
            x: second_vertex.x,
            y: second_vertex.y
        }
    );
}

export function lineSegmentToVector(line_segment, traversal_direction = 'A-B') {
    const vector = {x: null, y: null};

    if (traversal_direction === 'A-B') {
        vector.x = line_segment.B.x - line_segment.A.x;
        vector.y = line_segment.B.y - line_segment.A.y;
    }
    else if (traversal_direction === 'B-A') {
        vector.x = line_segment.A.x - line_segment.B.x;
        vector.y = line_segment.A.y - line_segment.B.y;
    }

    return vector;
}

export function getDotProduct(vector_1, vector_2) {
    return vector_1.x*vector_2.x + vector_1.y*vector_2.y;
}

export function getVectorMagnitude(vector) {
    return Math.sqrt(vector.x**2 + vector.y**2);
}

export function getUnitVector(vector) {
    const mag = Math.sqrt(vector.x**2 + vector.y**2);

    return {
        x: vector.x / mag, y: vector.y / mag
    }
}

export function scaleVector(vector, scalar) {
    vector.x *= scalar;
    vector.y *= scalar;
}

export function addVectors(vector_1, vector_2) {
    return {
        x: vector_1.x + vector_2.x,
        y: vector_1.y + vector_2.y
    }
}

export function getMidPoint(line_segment) {
    return {
        x: (line_segment.A.x + line_segment.B.x) / 2,
        y: (line_segment.A.y + line_segment.B.y) / 2
    };
}

export function getOutwardNormal(polygon, side_name) {
    let [ first_vertex, second_vertex] = side_name.split('-');
    first_vertex = polygon[first_vertex];
    second_vertex = polygon[second_vertex];

    const side_vector = {x: second_vertex.x - first_vertex.x, y: second_vertex.y - first_vertex.y};

    const polygon_orientation = getPolygonSignedArea(polygon) > 0 ? 'CCW' : 'CW';

    let outward_normal_vector = {x: null, y: null};
    if (polygon_orientation === 'CCW') {
        outward_normal_vector.x = side_vector.y;
        outward_normal_vector.y = -side_vector.x;
    }
    else if (polygon_orientation === 'CW') {
        outward_normal_vector.x = -side_vector.y;
        outward_normal_vector.y = side_vector.x;
    }

    // convert to a unit vector
    const mag = Math.sqrt(outward_normal_vector.x**2 + outward_normal_vector.y**2);
    outward_normal_vector.x /= mag;
    outward_normal_vector.y /= mag;

    return outward_normal_vector;
}

export function getTriangleOutwardNormal(triangle, side_name) {
    const first_letter = side_name.split('-')[0]; // (of the side name 'X-Y')
    const second_letter = side_name.split('-')[1];

    const vertex_1 = triangle[first_letter];
    const vertex_2 = triangle[second_letter];
    const other_vertex = triangle[['A','B','C'].filter(letter => ![first_letter,second_letter].includes(letter))[0]];

    // the line (y=mx+b) from vertex 1 to vertex 2
    const slope = ((vertex_2.y - vertex_1.y) / (vertex_2.x - vertex_1.x));
    if (Number.isFinite(slope)) { // regular line
        const sideLine = (x) => slope * (x - vertex_1.x) + vertex_1.y;

        if (other_vertex.y > sideLine(other_vertex.x)) { // other vertex lies above the line (normal should point below the line)
            return getUnitVector({x: slope, y: -1});
        }
        else if (other_vertex.y < sideLine(other_vertex.x)) { // other vertex lies below the line (normal should point above the line)
            return getUnitVector({x: -slope, y: 1});
        }
    }
    else { // vertical line
        if (other_vertex.x > vertex_1.x) return {x: -1, y: 0};
        else if (other_vertex.x < vertex_1.x) return {x: 1, y: 0};
    }

}

export function positionPolygonSideLabel(label_bounding_box, polygon, side_name, distance) {
    // get the side's outward normal vector (to find out which side of the polygon's side the label should be on)
    const outward_normal = getTriangleOutwardNormal(polygon, side_name); // is a unit vector by default

    // place the bounding box's center at the tip of the above normal vector (sprouting from the midpoint of the polygon's side)
    const midpoint = getMidPoint(getLineSegment(polygon, side_name));
    const outward_normal_tip = {
        x: midpoint.x + outward_normal.x,
        y: midpoint.y + outward_normal.y
    };
    const bounding_box_ps = buildPointSet( // bounding box point set (make it a real rectangle)
        {
            x: label_bounding_box.x1,
            y: label_bounding_box.y1
        },
        {
            x: label_bounding_box.x2,
            y: label_bounding_box.y1
        },
        {
            x: label_bounding_box.x2,
            y: label_bounding_box.y2
        },
        {
            x: label_bounding_box.x1,
            y: label_bounding_box.y2
        }
    )
    const bounding_box_center = {
        x: (label_bounding_box.x1 + label_bounding_box.x2) / 2,
        y: (label_bounding_box.y1 + label_bounding_box.y2) / 2
    };
    transformations.transformPointSet(bounding_box_ps, 'translate', // center the bounding box on the origin, so then the translation to a point Is the point
        {
            x: -bounding_box_center.x + outward_normal_tip.x,
            y: -bounding_box_center.y + outward_normal_tip.y
        }
    );

    // now rotate the whole "apparatus" so the normal vector (imaginary now) points directly in the positive x-direction
    const original_angle = Math.atan2(outward_normal.y, outward_normal.x); // original angle of the normal vector
    transformations.transformPointSet(bounding_box_ps, 'rotate', midpoint, -original_angle);

    // translate the base of the normal vector to the origin
    transformations.transformPointSet(bounding_box_ps, 'translate', {x: -midpoint.x, y: -midpoint.y});

    // determine how far along the x-axis the bounding box needs to be moved in so it's closest corner is at least distance^ units away from the y axis
    const leftmost_x_cord = getBoundingRect(bounding_box_ps).x1;
    const total_movement = distance - leftmost_x_cord;

    // apply that translation (to put the closest corner distance units away from the y axis)
    transformations.transformPointSet(bounding_box_ps, 'translate', {x: total_movement, y: 0});

    // set the base of the normal vector back on the mid-point of the polygon's side
    transformations.transformPointSet(bounding_box_ps, 'translate', {x: midpoint.x, y: midpoint.y});

    // undo the rotation
    transformations.transformPointSet(bounding_box_ps, 'rotate', midpoint, original_angle);

    // the label's point set now has the correct position, and the last step is to overwrite the original bounding boxes position with this:
    const new_bounding_box = getBoundingRect(bounding_box_ps);

    label_bounding_box.x1 = new_bounding_box.x1;
    label_bounding_box.y1 = new_bounding_box.y1;
    label_bounding_box.x2 = new_bounding_box.x2;
    label_bounding_box.y2 = new_bounding_box.y2;
}

export function getRightAngleLabel(right_triangle) { // 5% of the length of the longer side, always less than a third of the shorter side
    // first step is to find the vertex that corresponds to the right angle (this function assumes that vertex exists)
    const side_vectors = {'A-B': null, 'A-C': null, 'B-A': null, 'B-C': null, 'C-B': null, 'C-A': null};
    Object.keys(side_vectors).forEach(key => {
        side_vectors[key] = lineSegmentToVector(getLineSegment(right_triangle, key));
    });

    const dot_products = {
        A: getDotProduct(
            side_vectors['A-B'],
            side_vectors['A-C']
        ),
        B: getDotProduct(
            side_vectors['B-A'],
            side_vectors['B-C']
        ),
        C: getDotProduct(
            side_vectors['C-B'],
            side_vectors['C-A']
        )
    };

    // dot product that is closest to 0 is assumed to be the vertex with the right angle
    const right_angle_vertex = _keyWithClosestValue(dot_products, 0);
    const other_vertices = ['A','B','C'].filter(vertex => vertex !== right_angle_vertex);

    // next step is to size the right angle label to the current triangle
    const vector_1 = side_vectors[right_angle_vertex + '-' + other_vertices[0]];
    const vector_2 = side_vectors[right_angle_vertex + '-' + other_vertices[1]];
    const unit_vector_1 = getUnitVector({...vector_1});
    const unit_vector_2 = getUnitVector({...vector_2});

    // square size is 5% of the longer side, but if <that is greater than 25% of the shorter side, square size is 25% of the shorter side
    let square_size = 0.1 * Math.max(getVectorMagnitude(vector_1), getVectorMagnitude(vector_2));
    if (square_size > Math.min(getVectorMagnitude(vector_1), getVectorMagnitude(vector_2)) / 4) {
        square_size = Math.min(getVectorMagnitude(vector_1), getVectorMagnitude(vector_2)) / 4;
    }

    // now the 3 points needed for the right angle label can be defined
    scaleVector(unit_vector_1, square_size);
    scaleVector(unit_vector_2, square_size);

    const point_1 = addVectors(right_triangle[right_angle_vertex], unit_vector_1);
    const point_2 = addVectors(point_1, unit_vector_2);
    const point_3 = addVectors(right_triangle[right_angle_vertex], unit_vector_2);

    return buildPointSet(point_1, point_2, point_3);
}

export function getTriangleIncenter(triangle) {
    const a = Math.sqrt((triangle.B.x - triangle.C.x)**2 + (triangle.B.y - triangle.C.y)**2);
    const b = Math.sqrt((triangle.A.x - triangle.C.x)**2 + (triangle.A.y - triangle.C.y)**2);
    const c = Math.sqrt((triangle.B.x - triangle.A.x)**2 + (triangle.B.y - triangle.A.y)**2);
    
    return {
        x: (a*triangle.A.x + b*triangle.B.x + c*triangle.C.x) / (a + b + c),
        y: (a*triangle.A.y + b*triangle.B.y + c*triangle.C.y) / (a + b + c)
    }
}

export function getBoundingRectRectangle(bounding_rect) {
    return buildPointSet(
        {
            x: bounding_rect.x1, y: bounding_rect.y1
        },
        {
            x: bounding_rect.x2, y: bounding_rect.y1
        },
        {
            x: bounding_rect.x2, y: bounding_rect.y2
        },
        {
            x: bounding_rect.x1, y: bounding_rect.y2
        }
    )
}

function _keyWithClosestValue(object, numerical_value) {
    let closest_key = null;
    let smallest_difference = Infinity;

    for (const [key, value] of Object.entries(object)) {
        const current_difference = Math.abs(value - numerical_value);

        if (current_difference < smallest_difference) {
            closest_key = key;
            smallest_difference = current_difference;
        }
    }

    return closest_key;
}

function _getPointKey(point_index) {
    const alphabet_runs = Math.floor(point_index / 26);
    const key = String.fromCharCode(65 + (point_index % 26)) + String((alphabet_runs >= 1)? alphabet_runs : '');
    return key;
}