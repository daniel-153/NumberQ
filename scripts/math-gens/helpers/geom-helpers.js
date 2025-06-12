
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
                y: side_2 * Math.sin(Math.acos((side_1**2 + side_2**2 - side_3**2) / 2*side_1*side_2))
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
        const r = Math.sqrt( (rotating_point.x - fixed_point.x)**2 + (rotating_point.y - fixed_point.y)**2 );
        rotating_point.x = rotating_point.x - Math.sin(angle) * r;
        rotating_point.y = rotating_point.y + (1 - Math.cos(angle)) * r;
    },
    reflect: function(reflecting_point, line_point, line_slope) {
        const temp = reflecting_point.x;
        reflecting_point.x = (2*line_point.x*line_slope**2 - reflecting_point.x*line_slope**2 - 2*line_slope*line_point.y + reflecting_point.x + 2*reflecting_point.y*line_slope) / (1 + line_slope**2);
        reflecting_point.y = (reflecting_point.y*line_slope**2 + 2*temp*line_slope - 2*line_point.x*line_slope + 2*line_point.y - reflecting_point.y) / (1 + line_slope**2);
    },
    dialate: function(dialating_point, fixed_point, scale_factor) {
        dialating_point.x = scale_factor*dialating_point.x + fixed_point.x*(1 - scale_factor);
        dialating_point.y = scale_factor*dialating_point.y + fixed_point.y*(1 - scale_factor);
    },
    transformPointSet: function(point_set, transformation, ...args) {
        for (const [_, point] of Object.entries(point_set)) {
            this[transformation](point, ...args);
        }
    }
}

export function normalizeShapePosition(polygon) {
    // Identify the x-cord of the point that is farthest to the left on the x-y plane
    // & Identify the y-cord of the point that is farthest down on the x-y plane
    let leftmost_x_cord = Infinity;
    let downmost_y_cord = Infinity;
    for (const [_, point] of Object.entries(polygon)) {
        if (point.x < leftmost_x_cord) leftmost_x_cord = point.x;
        if (point.y < downmost_y_cord) downmost_y_cord = point.y;
    }

    // Basically, get the polygon as "snug" as possible *in the first quadrant* with only a translation
    transformations.transformPointSet(polygon, 'translate',
        {x: -leftmost_x_cord, y: -downmost_y_cord}
    );
}

export function forEachPoint(point_set_obj, callback) {
    for (let i = 0; i < Object.entries(point_set_obj).length; i++) {
        const alphabet_runs = Math.floor(i / 26);
        const key = String.fromCharCode(65 + (i % 26)) + String((alphabet_runs >= 1)? alphabet_runs : ''); 

        callback(point_set_obj[key]);
    }
}

