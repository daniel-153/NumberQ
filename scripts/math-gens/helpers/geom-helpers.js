
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
    const ps_diagonal_len = Math.sqrt( (ps_bounding_rect.x2 - ps_bounding_rect.x1)**2 + (ps_bounding_rect.y2 - ps_bounding_rect.y1)**2 );
    const bounding_diagonal_len = Math.sqrt( (bounding_rect.x2 - bounding_rect.x1)**2 + (bounding_rect.y2 - bounding_rect.y1)**2 );
    
    // apply the scaling
    transformations.transformPointSet(
        point_set, 'dilate', 
        {x: bounding_rect.x1, y: bounding_rect.y1}, 
        (bounding_diagonal_len / ps_diagonal_len)
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
        const alphabet_runs = Math.floor(i / 26);
        const key = String.fromCharCode(65 + (i % 26)) + String((alphabet_runs >= 1)? alphabet_runs : ''); 

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