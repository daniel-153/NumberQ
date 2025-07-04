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
    ASA: function(angle_1, side, angle_2, angular_unit = 'rad') { // angle_1 -> A, side -> c, angle_2 -> B
        if (angular_unit === 'deg') {
            angle_1 = convertAngle(angle_1, 'to_rad');
            angle_2 = convertAngle(angle_2, 'to_rad');
        }
        
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
    SAS: function(side_1, angle, side_2, angular_unit = 'rad') { // side_1 -> c, angle -> B, side_2 -> a
        if (angular_unit === 'deg') {
            angle = convertAngle(angle, 'to_rad');
        }
        
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
    SSS: function(side_1, side_2, side_3) { // side_1 -> a, side_2 -> b, side_3 -> c
        const B = Math.acos((side_1**2 + side_3**2 - side_2**2) / (2*side_1*side_3));
        const a_vect = {x: side_1*Math.cos(Math.PI - B), y: side_1*Math.sin(Math.PI - B)};
        
        return {
            A: {
                x: 0,
                y: 0
            },
            B: {
                x: side_3,
                y: 0
            },
            C: {
                x: side_3 + a_vect.x,
                y: a_vect.y
            }
        };
    },
    AAS: function(angle_1, angle_2, side, angular_unit = 'rad') { // angle_1 -> C, angle_2 -> A, side -> c
        if (angular_unit === 'deg') {
            angle_1 = convertAngle(angle_1, 'to_rad');
            angle_2 = convertAngle(angle_2, 'to_rad');
        }
        
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

export function getCombinedBoundingRect(...bounding_rects) {
    let min_x = Infinity;
    let max_x = -Infinity;
    let min_y = Infinity;
    let max_y = -Infinity;
    bounding_rects.forEach(b_rect => {
        if (b_rect.x1 < min_x) min_x = b_rect.x1;
        if (b_rect.x2 > max_x) max_x = b_rect.x2;
        if (b_rect.y1 < min_y) min_y = b_rect.y1;
        if (b_rect.y2 > max_y) max_y = b_rect.y2;
    });

    return {
        x1: min_x, x2: max_x,
        y1: min_y, y2: max_y
    };
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

export function get2DVectorOrientation(base_vector, test_vector) { // (using the determinant), if > 0, 2 is CCW to 1, if < 0 2 is CW to 1, if 0, colinear
    const determinant = base_vector.x * test_vector.y - base_vector.y * test_vector.x;
    
    if (determinant > 0) return 'CCW';
    else if (determinant < 0) return 'CW';
    else if (determinant === 0) return 'L';
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

export function getScaledVector(vector, scalar) {
    return {
        x: vector.x * scalar,
        y: vector.y * scalar
    };
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

export function positionAllTriangleSideLabels(label_b_rects_obj, triangle, distance, side_name_key = {'a': 'B-C', 'b': 'C-A', 'C': 'A-B'}) {
    for (const [side_letter, b_rect] of Object.entries(label_b_rects_obj)) {
        positionPolygonSideLabel(b_rect, triangle, side_name_key[side_letter], distance);
    }
}

export function getDistance(point_1, point_2) {
    return Math.sqrt((point_1.x - point_2.x)**2 + (point_1.y - point_2.y)**2)
}

export function getNextVertexLetter(polygon, vertex_letter) {
    if (polygon[vertex_letter] === undefined) {
        console.error('Provided polygon does not have vertex: ', vertex_letter);
        return;
    }

    let possible_next_letter = String.fromCharCode(vertex_letter.charCodeAt(0) + 1);
    if (polygon[possible_next_letter] !== undefined) return possible_next_letter;
    else return 'A';
}

export function pointOnSegment(point, segment_point_1, segment_point_2) {
    const cross = (segment_point_2.x - segment_point_1.x) * (point.y - segment_point_1.y) - (segment_point_2.y - segment_point_1.y) * (point.x - segment_point_1.x);
    if (cross !== 0) return false; // Not collinear

    const dot = (point.x - segment_point_1.x) * (segment_point_2.x - segment_point_1.x) + (point.y - segment_point_1.y) * (segment_point_2.y - segment_point_1.y);
    if (dot < 0) return false;

    const lenSq = (segment_point_2.x - segment_point_1.x)**2 + (segment_point_2.y - segment_point_1.y)**2;
    return dot <= lenSq;
}

export function pointRelativeToPolygon(point, polygon) {
    const vertices = Object.values(polygon);
    const numVertices = vertices.length;
    let inside = false;

    for (let i = 0, j = numVertices - 1; i < numVertices; j = i++) {
        const pi = vertices[i];
        const pj = vertices[j];

        // Check if point is exactly on the edge
        if (pointOnSegment(point, pj, pi)) {
            return 'on';
        }

        // Ray casting logic (crossing count)
        const intersects = (
            ((pi.y > point.y) !== (pj.y > point.y)) &&
            (point.x < ((pj.x - pi.x) * (point.y - pi.y)) / (pj.y - pi.y) + pi.x)
        );

        if (intersects) {
            inside = !inside;
        }
    }

    return inside ? 'inside' : 'outside';
}

export function pointToLineDistance(target_point, line_point_1, line_point_2) {
    const a = target_point.x;
    const b = target_point.y;

    const x1 = line_point_1.x;
    const y1 = line_point_1.y;
    const x2 = line_point_2.x;
    const y2 = line_point_2.y; 

    const xt = (t) => (x2 - x1) * t + x1;
    const yt = (t) => (y2 - y1) * t + y1;

    const Dt = (t) => Math.sqrt((xt(t) - a)**2 + (yt(t) - b)**2);

    const tmin = ((x1 - a)*(x1 - x2) + (y1 - b)*(y1 - y2)) / ((x1 - x2)**2 + (y1 - y2)**2); // t value where D't equals 0

    return Dt(tmin);
}

export function lineSegmentToPointDistance(target_point, line_seg_point_1, line_seg_point_2) {
    const a = target_point.x;
    const b = target_point.y;

    const x1 = line_seg_point_1.x;
    const y1 = line_seg_point_1.y;
    const x2 = line_seg_point_2.x;
    const y2 = line_seg_point_2.y; 

    const xt = (t) => (x2 - x1) * t + x1;
    const yt = (t) => (y2 - y1) * t + y1;

    const Dt = (t) => Math.sqrt((xt(t) - a)**2 + (yt(t) - b)**2);

    const t0 = 0;
    const t1 = 1;

    const tmin = ((x1 - a)*(x1 - x2) + (y1 - b)*(y1 - y2)) / ((x1 - x2)**2 + (y1 - y2)**2); // t value where D't equals 0

    if (tmin > t0 && tmin < t1) { // absolute min distance occurs between the two points that form the line segment
        return Dt(tmin);
    }
    else { // absolute min distance occurs elsewhere on the line (so the min is one of the endpoints)
        return Math.min(Dt(t0), Dt(t1));
    }
}

export function getPointToPolygonDistance(point, polygon) {
    // first ensure the point isn't inside/on the polygon (which would immidiately mean the distance is zero)
    const point_relative_to_polygon = pointRelativeToPolygon(point, polygon);
    if (point_relative_to_polygon === 'inside' || point_relative_to_polygon === 'on') return 0;
    
    // run the "point to line" distance formula for each of the polygon's sides (the calculus optimization version)
    let min_distance = Infinity;
    const a = point.x;
    const b = point.y;
    for (const [vertex_letter, vertex_cords] of Object.entries(polygon)) {
        const next_vertex_cords = polygon[getNextVertexLetter(polygon, vertex_letter)];
        let current_distance = lineSegmentToPointDistance(point, vertex_cords, next_vertex_cords);
        if (current_distance < min_distance) min_distance = current_distance;
    }

    return min_distance;
}

export function vectorDirection(vector) {
    return Math.atan2(vector.y, vector.x);
}

export function pointToSegmentInDirection(target_point, direction, seg_point_1, seg_point_2) { // suppose we started at target_point, and went in direction by some scalar amount. Is there a scalar that lands the vector on the segment? Give its length, or indicate impossible
    const sin0 = Math.sin(direction);
    const cos0 = Math.cos(direction);

    const Px = target_point.x;
    const Py = target_point.y;
    const Ax = seg_point_1.x;
    const Ay = seg_point_1.y;
    const Bx = seg_point_2.x;
    const By = seg_point_2.y;

    const N = (Px*sin0 - Py*cos0 - Ax*sin0 + Ay*cos0) / (sin0*(Bx - Ax) - cos0*(By - Ay));
    const K = (Ax + N*(Bx - Ax) - Px) / cos0;

    if ((K >= 0) && (N >= 0 && N <= 1)) { // there is a scalar that produces a valid intersection (its value is K)
        return K;
    }
    else { // no intersection with the given constraints
        return 'no_intersection';
    }
}

export function getRectangleCenter(rectangle_point_set) {
    // basically take the average of all the points
    let avg_x = 0;
    let avg_y = 0;
    for (const [_, point] of Object.entries(rectangle_point_set)) {
        avg_x += point.x;
        avg_y += point.y;
    }

    return {x: avg_x / 4, y: avg_y / 4};
}

export function buildLinearInequality(
    inequality = {
        point_1: {x: 0, y: 0},
        point_2: {x: 1, y: 0},
        normal_direction: 'CW',
        inclusive: true
    },
    tolerance = 1e-6
) {
    return function(point) {
        // determinant of the vectors [point_1->point_2] and [point_1->point]
        const det = (inequality.point_2.x - inequality.point_1.x)*(point.y - inequality.point_1.y) - 
        (inequality.point_2.y - inequality.point_1.y)*(point.x - inequality.point_1.x);

        // the orientation of [point_1->point] relative to [point_1->point_2] (generally CCW, CW, or neither)
        let orientation;
        if (Math.abs(det) <= tolerance) orientation = 'L'; // L for colinear
        else if (det > 0) orientation = 'CCW';
        else if (det < 0) orientation  = 'CW';

        return (
            orientation === inequality.normal_direction ||
            (inequality.inclusive && orientation === 'L')
        );
    }
}

export function positionAngleLabelFixedSize(label_bounding_rect, vertex_letter, triangle, rect_size_ratio = 0.9) {
    const target_vertex = triangle[vertex_letter];
    const other_vertices = ['A','B','C'].filter(letter => letter !== vertex_letter).map(letter => triangle[letter]);

    // first step is to build the inequality that tests whether a point is "inside" the vertex rays or "on" them
    const vector_1 = {x: other_vertices[0].x - target_vertex.x, y: other_vertices[0].y - target_vertex.y};
    const vector_2 = {x: other_vertices[1].x - target_vertex.x, y: other_vertices[1].y - target_vertex.y};
    const inequality_1 = buildLinearInequality(
        {
            point_1: {x: target_vertex.x, y: target_vertex.y},
            point_2: {x: other_vertices[0].x, y: other_vertices[0].y},
            normal_direction: get2DVectorOrientation(vector_1, vector_2),
            inclusive: true
        }
    );
    const inequality_2 = buildLinearInequality(
        {
            point_1: {x: target_vertex.x, y: target_vertex.y},
            point_2: {x: other_vertices[1].x, y: other_vertices[1].y},
            normal_direction: get2DVectorOrientation(vector_2, vector_1),
            inclusive: true
        }
    );
    const pointIsWithinVertex = function(point) { // tolerance of 1e-6 by default
        return (inequality_1(point) && inequality_2(point));
    }
    
    // get the larger (bounding-bounding) rect based on the rect_size_ratio (basically serves to add padding around the label so not right on triangle sides)
    const rect = getBoundingRectRectangle(label_bounding_rect);
    transformations.transformPointSet(rect, 'dilate', rect.A, 1 / rect_size_ratio);
    const rect_center = getRectangleCenter(rect);

    // for each rect point, the signed distance (D) between the point and each of the vertex rays is linear with respect to the translation scalar (T)
    // the correct translation is the one where all 4 points satisfy the combined inequality after applying it
    const unit_bisector = getAngleBisectorVector(triangle, vertex_letter);
    const lines = { // the two lines representing the triangle vertex 
        line_1: {point_1: {x: target_vertex.x, y: target_vertex.y}, point_2: {x: other_vertices[0].x, y: other_vertices[0].y}},
        line_2: {point_1: {x: target_vertex.x, y: target_vertex.y}, point_2: {x: other_vertices[1].x, y: other_vertices[1].y}},
    };
    let translation_found = false;
    let final_scalar;
    for (const [vertex_letter, vertex_cords] of Object.entries(rect)) {
        let line_index = 1;
        for (const [_, points] of Object.entries(lines)) {
            // build the function that gives the signed distance between the rect vertex point and the line based on a translation scalar
            const rectVertexToLineDist = function(translation_scalar) {
                // the center of the rect based on the translation (center of the rect always sits on the bisector)
                const point_on_bisector = addVectors(target_vertex, getScaledVector(unit_bisector, translation_scalar));

                const rect_vertex_location = addVectors(
                    point_on_bisector,
                    {x: vertex_cords.x - rect_center.x, y: vertex_cords.y - rect_center.y} // vector from rect center to current vertex
                );

                const unsigned_distance = pointToLineDistance(rect_vertex_location, points.point_1, points.point_2);

                let current_inequality;
                if (line_index === 1) current_inequality = inequality_1;
                else if (line_index === 2) current_inequality = inequality_2;

                let distance_sign;
                if (current_inequality(rect_vertex_location)) { // satisfies the inequality
                    distance_sign = 1;
                } // fails the inequality
                else distance_sign = -1;

                return distance_sign * unsigned_distance;
            }

            // use the fact that distance is linear with respect to the translation to find and solve a linear equation
            const test_scalar_1 = 0;
            const test_scalar_2 = 50;
            const test_distance_1 = rectVertexToLineDist(test_scalar_1);
            const test_distance_2 = rectVertexToLineDist(test_scalar_2);
            // solve the linear equation for a distance of 0 (which scalar puts the rect vertex exactly on the line)
            const target_scalar = test_scalar_1 - test_distance_1 * ((test_scalar_2 - test_scalar_1) / (test_distance_2 - test_distance_1));
            const rect_center_on_bisector = addVectors(target_vertex, getScaledVector(unit_bisector, target_scalar));

            // now, if all 3 other points satisfy the inequality (are within the vertex), this is the correct scalar (out of the possible 8)
            let all_satisfied = true;
            ['A','B','C','D'].filter(letter => letter !== vertex_letter).forEach(other_vertex_letter => {
                const vertex_vector = {x: rect[other_vertex_letter].x - rect_center.x, y: rect[other_vertex_letter].y - rect_center.y};

                const point_location = addVectors(rect_center_on_bisector, vertex_vector);

                if (!pointIsWithinVertex(point_location)) all_satisfied = false;
            });

            if (all_satisfied) {
                final_scalar = target_scalar;
                translation_found = true;
                break;
            }

            line_index++;
        }

        if (translation_found) break;
    }

    // the ideal translation found above is based on the upsized (padded rect), but the original rect has the same center as this rect
    const new_rect_location = addVectors(target_vertex, getScaledVector(unit_bisector, final_scalar));
    transformations.transformPointSet(rect, 'dilate', rect_center, rect_size_ratio); // undo the upsizing
    transformations.transformPointSet(rect, 'translate', {x: -rect_center.x, y: -rect_center.y}); // center at the origin
    transformations.transformPointSet(rect, 'translate', {x: new_rect_location.x, y: new_rect_location.y}); // bring to new location

    // update the values in the provided bounding rect
    const new_bounding_rect = getBoundingRect(rect);
    label_bounding_rect.x1 = new_bounding_rect.x1;
    label_bounding_rect.x2 = new_bounding_rect.x2;
    label_bounding_rect.y1 = new_bounding_rect.y1;
    label_bounding_rect.y2 = new_bounding_rect.y2;
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

export function getTriangleAngle(triangle, vertex_letter, angular_unit = 'rad') {
    const vertex = triangle[vertex_letter];
    const other_vertices = ['A','B','C'].filter(letter => letter !== vertex_letter).map(letter => triangle[letter]);

    // apply the law of cosines
    const a = Math.sqrt((vertex.x - other_vertices[0].x)**2 + (vertex.y - other_vertices[0].y)**2);
    const b = Math.sqrt((vertex.x - other_vertices[1].x)**2 + (vertex.y - other_vertices[1].y)**2);
    const c = Math.sqrt((other_vertices[0].x - other_vertices[1].x)**2 + (other_vertices[0].y - other_vertices[1].y)**2);

    // return the angle in the specified unit
    const radian_angle = Math.acos((a**2 + b**2 - c**2) / (2*a*b));
    if (angular_unit === 'rad') {
        return radian_angle;
    }
    else if (angular_unit === 'deg') {
        return convertAngle(radian_angle, 'to_deg');
    }
}

export function getTriangleSide(triangle, side_letter_or_segment) { // side_letter_or_segment => 'a' or 'B-C'
    if (!side_letter_or_segment.includes('-')) { // side_letter (needs to be parsed)
        const opposite_vertex_letter = side_letter_or_segment.toUpperCase();
        const other_vertex_letters = ['A','B','C'].filter(letter => letter !== opposite_vertex_letter);

        side_letter_or_segment = other_vertex_letters.join('-');
    }

    const [letter_1, letter_2] = side_letter_or_segment.split('-');
    const vertex_1 = triangle[letter_1];
    const vertex_2 = triangle[letter_2];

    return getDistance(vertex_1, vertex_2);
}

export function getAllTriangleSides(triangle) {
    return {
        'a': getTriangleSide(triangle, 'a'),
        'b': getTriangleSide(triangle, 'b'),
        'c': getTriangleSide(triangle, 'c')
    };
}

export function getAngleBisectorVector(triangle, vertex_letter) {
    const vertex = triangle[vertex_letter];
    const other_vertices = ['A','B','C'].filter(letter => letter !== vertex_letter).map(letter => triangle[letter]);

    const vertex_vector_1 = getUnitVector({x: other_vertices[0].x - vertex.x, y: other_vertices[0].y - vertex.y});
    const vertex_vector_2 = getUnitVector({x: other_vertices[1].x - vertex.x, y: other_vertices[1].y - vertex.y});

    return getUnitVector(addVectors(vertex_vector_1, vertex_vector_2));
}

export function getBoundingTriangle(triangle, line_width, bound = 'outer') {
    const bounding_triangle = {A: {x: null, y: null}, B: {x: null, y: null}, C: {x: null, y: null}};

    for (const [vertex_letter, vertex] of Object.entries(triangle)) {
        const vertex_angle = getTriangleAngle(triangle, vertex_letter);
        const half_miter_length = line_width / (2 * Math.sin(vertex_angle / 2));

        // traverse half the miter length in the opposite direction of the vertex's angle bisector
        const unit_bisector_vector = getAngleBisectorVector(triangle, vertex_letter);

        let direction;
        (bound === 'inner')? (direction = 1) : (direction = -1);

        const x_step = direction*half_miter_length*unit_bisector_vector.x;
        const y_step = direction*half_miter_length*unit_bisector_vector.y;

        bounding_triangle[vertex_letter].x = vertex.x + x_step;
        bounding_triangle[vertex_letter].y = vertex.y + y_step;
    }

    return bounding_triangle;
}

export function getAllTriangleAngles(triangle, angular_unit = 'rad') {
    return {
        A: getTriangleAngle(triangle, 'A', angular_unit),
        B: getTriangleAngle(triangle, 'B', angular_unit),
        C: getTriangleAngle(triangle, 'C', angular_unit)
    };
}

export function centerBoundingRect(bounding_rect, outer_bounding_rect) {
    const b_rect = getBoundingRectRectangle(bounding_rect);

    // first bring the bounding rect to the bottom left corner of the outer rectangle 
    transformations.transformPointSet(b_rect, 'translate', 
        {x: -bounding_rect.x1 + outer_bounding_rect.x1, y: -bounding_rect.y1 + outer_bounding_rect.y1}
    );

    // then center based on the available space in the x and y directions (traverse half of it)
    const x_space = (outer_bounding_rect.x2 - outer_bounding_rect.x1) - (bounding_rect.x2 - bounding_rect.x1);
    const y_space = (outer_bounding_rect.y2 - outer_bounding_rect.y1) - (bounding_rect.y2 - bounding_rect.y1);

    transformations.transformPointSet(b_rect, 'translate', {x: x_space / 2, y: y_space / 2});

    // update the values in the original bounding rect
    _updateBoundingRectValues(bounding_rect, getBoundingRect(b_rect));
}

export function positionTriangleVertexLabel(label_bounding_rect, triangle_ps, vertex_name, distance) {
    const neg_unit_bisector = getScaledVector(getAngleBisectorVector(triangle_ps, vertex_name), -1); // points directly outside the vertex
    const rect = getBoundingRectRectangle(label_bounding_rect);
    const rect_center = getRectangleCenter(rect);
    transformations.transformPointSet(rect, 'translate', // center the rect on the tip of the negative bisector
        {x: -rect_center.x + neg_unit_bisector.x, y: -rect_center.y + neg_unit_bisector.y}
    );

    // orient the neg_unit_bisector along the pos-x axis to simplify the distance calculation
    const neg_unit_bisector_ang = Math.atan2(neg_unit_bisector.y, neg_unit_bisector.x);
    transformations.transformPointSet(rect, 'rotate', {x: 0, y: 0}, -neg_unit_bisector_ang);
    const reoriented_bounding_rect = getBoundingRect(rect); // bounding rect of the rotated rect, centered on the vector pointing in positive x
    
    // now x1 of this bounding rect is the distance we want to "set"
    const current_distance = reoriented_bounding_rect.x1; // possibly negative
    const addition_needed_distance = distance - current_distance;
    transformations.transformPointSet(rect, 'translate', {x: addition_needed_distance, y: 0}); // apply the additional distance
    transformations.transformPointSet(rect, 'rotate', {x: 0, y: 0}, neg_unit_bisector_ang); // rotate everything back into original orientation

    // update the values in the original bounding rect
    _updateBoundingRectValues(label_bounding_rect, getBoundingRect(rect));
}

export function getRandomTriangleAngles(min_angle = 10) {
    if (min_angle > 60) {
        console.error(`A triangle with all angles >= to ${min_angle}deg is impossible.`);
        return;
    }

    // use the stars and bars (**|****|***) process to randomly decompose 180 - 3*min_angle into three non-neg ints that add to 180 - 3*min_angle
    const max_reduced_angle = 180 - min_angle * 3;
    let rand_1 = Math.floor(Math.random() * (max_reduced_angle + 1));
    let rand_2 = Math.floor(Math.random() * (max_reduced_angle + 1));
    if (rand_2 < rand_1) [rand_1, rand_2] = [rand_2, rand_1];

    let A = rand_1 + min_angle;
    let B = rand_2 - rand_1 + min_angle;
    let C = max_reduced_angle - rand_2 + min_angle;

    let angles = [A, B, C];
 
    for (let i = angles.length - 1; i > 0; i--) { // Fisher–Yates
        let j = Math.floor(Math.random() * (i + 1));
        [angles[i], angles[j]] = [angles[j], angles[i]];
    }

    return angles;
}

export function getIncreasedAnglesForDrawing(triangle_angle_array, min_angle = 25) {
    const t_values = triangle_angle_array.map(a => {
        if (a >= min_angle || a >= 60) return 0;
        else return (min_angle - a) / (60 - a);
    });

    const t = Math.max(...t_values);

    const new_angles = triangle_angle_array.map(a => (1 - t) * a + t * 60);
    return new_angles;
}

export function getAdjustedTriangle(triangle_ps, min_angle = 25) {
    const orig_angles = getAllTriangleAngles(triangle_ps, 'deg');
    const increased_angles = getIncreasedAnglesForDrawing([orig_angles.A, orig_angles.B, orig_angles.C], min_angle);
    const c = getTriangleSide(triangle_ps, 'c');

    // ASA => A, c, B
    const adjusted_triangle = build_triangle.ASA(increased_angles[0], c, increased_angles[1]);

    return adjusted_triangle;
}

export function positionTopLeftLabelBRect(label_bounding_rect, other_content_b_rect) {
    const rect = getBoundingRectRectangle(label_bounding_rect);

    // bring the bottom left corner of the rect to the origin, then to the top left corner of the other content rect
    transformations.transformPointSet(rect, 'translate', 
        {x: -rect.A.x + other_content_b_rect.x1, y: -rect.A.y + other_content_b_rect.y2}
    );

    _updateBoundingRectValues(label_bounding_rect, getBoundingRect(rect));
}

function _updateBoundingRectValues(old_bounding_rect, new_bounding_rect) {
    old_bounding_rect.x1 = new_bounding_rect.x1;
    old_bounding_rect.x2 = new_bounding_rect.x2;
    old_bounding_rect.y1 = new_bounding_rect.y1;
    old_bounding_rect.y2 = new_bounding_rect.y2;
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