import * as geometry from '../math-gens/helpers/geom-helpers.js';

let canvas = null;
let C = null;

const CH = {
    createCanvas: function(width_px, height_px, set_as_current = false) {
        const canvas_el = document.createElement('canvas');
        const dpr = window.devicePixelRatio || 1;

        // Set the correct canvas resolution (canvas px per css px)
        canvas_el.width = width_px * dpr;
        canvas_el.height = height_px * dpr;

        // Set CSS size (in layout pixels)
        canvas_el.style.width = width_px + "px";
        canvas_el.style.height = height_px + "px";

        const context = canvas_el.getContext("2d");
        context.scale(dpr, dpr); // scale the draw context according to the canvas resolution

        if (set_as_current) {
            this.setCurrentCanvas(canvas_el, context);
        }

        return {
            element: canvas_el,
            context: context
        };
    },
    setCurrentCanvas: function(canvas_el, context) {
        canvas = canvas_el;
        C = context;
    },
    drawPolygon: function(point_set_obj) {
        C.beginPath();
        C.moveTo(point_set_obj.A.x, point_set_obj.A.y);
        geometry.forEachPoint(point_set_obj, function(point) {
            C.lineTo(point.x, point.y);
        });
        C.lineTo(point_set_obj.A.x, point_set_obj.A.y)
        C.stroke()
    },
    getTextBoundingRect: function(text_string, position = {x: 0, y: 0}) { // assumes left-bottom alignment
        const text_metrics = C.measureText(text_string); 
        const bounding_box = {x1: null, x2: null, y1: null, y2: null};

        bounding_box.x1 = position.x;
        bounding_box.x2 = position.x + text_metrics.width;

        const extremium_text_metrics = C.measureText(text_string + 'HgypÅÉ|');

        bounding_box.y1 = position.y - extremium_text_metrics.actualBoundingBoxDescent,
        bounding_box.y2 = position.y + extremium_text_metrics.actualBoundingBoxAscent 


        return bounding_box;
    },
    insertText: function(text_string, bounding_rect) {
        // get the actual bounding rect for the provided text (to make sure it will fit)
        let actual_bouding_rect = CH.getTextBoundingRect(text_string, {x: bounding_rect.x1, y: bounding_rect.y1});

        if ((actual_bouding_rect.x2 - actual_bouding_rect.x1) > (bounding_rect.x2 - bounding_rect.x1 + 0.1) ||
            (actual_bouding_rect.y2 - actual_bouding_rect.y1) > (bounding_rect.y2 - bounding_rect.y1 + 0.1)
        ) {
            console.error('Provided text overflows its bounding rect.');
            return;
        }

        C.save();        

        // ensure the text alignment is correct (left-bottom is assumed)
        C.textAlign = 'left';
        C.textBaseline = "bottom";

        C.fillText(text_string, bounding_rect.x1, canvas.height - bounding_rect.y1);

        C.restore();
    },
    drawBoundingRect: function(bounding_rect) {
        C.beginPath();
        C.moveTo(bounding_rect.x1, bounding_rect.y1);
        C.lineTo(bounding_rect.x2, bounding_rect.y1);
        C.lineTo(bounding_rect.x2, bounding_rect.y2);
        C.lineTo(bounding_rect.x1, bounding_rect.y2);
        C.lineTo(bounding_rect.x1, bounding_rect.y1);
        C.stroke();
    },
    connectPointsWithLine: function(point_set) {
        C.beginPath();
        C.moveTo(point_set.A.x, point_set.A.y);
        geometry.forEachPoint(point_set, function(point) {
            C.lineTo(point.x, point.y);
        });
        C.stroke()
    },
    drawRightTriangle: function(side_lengths_obj, side_labels_obj, unknown_side, rotation) {
        // a -> A-B | b -> B-C | c -> C-A
        const triangle_ps = geometry.build_triangle.SSS(side_lengths_obj.a, side_lengths_obj.c, side_lengths_obj.b);
        const side_name_key = {'a': 'A-B', 'b': 'B-C', 'c': 'C-A'};

        // rotate the triangle by the specified amount (about its incenter)
        geometry.transformations.transformPointSet(triangle_ps, 'rotate', 
            geometry.getTriangleIncenter(triangle_ps), geometry.convertAngle(rotation, 'to_rad')
        );

        // scale the triangle to fit a (theoretical) 500x500 canvas in the corner of Q1
        geometry.fitPointSet(triangle_ps, {x1: 0, x2: 500, y1: 0, y2: 500}, 'center', 'center');

        // get the bounding rects for the side labels + put them in position (which will likely overflow the canvas initially) 
        C.font = '20px Arial';
        const label_bounding_rects = {a: null, b: null, c: null};
        for (const [key, _] of Object.entries(label_bounding_rects)) {
            label_bounding_rects[key] = CH.getTextBoundingRect(side_labels_obj[key]);

            geometry.positionPolygonSideLabel(
                label_bounding_rects[key],
                triangle_ps,
                side_name_key[key],
                6
            );
        }

        // next step is to fit the whole apparatus (triangle with three labels) to the canvas *without changing the font size*
        // determine the sensitivity to change of the bounding box to a scaling about the triangle incenter
        const original_bounding_rect = geometry.getBoundingRect(
            geometry.getCombinedPointSet(
                triangle_ps,
                geometry.getBoundingRectRectangle(label_bounding_rects.a),
                geometry.getBoundingRectRectangle(label_bounding_rects.b),
                geometry.getBoundingRectRectangle(label_bounding_rects.c)
            )
        );
        const test_scale_factor = 0.9;
        const incenter = geometry.getTriangleIncenter(triangle_ps);
        geometry.transformations.transformPointSet(triangle_ps, 'dilate', incenter, test_scale_factor);
        for (const [key, bounding_rect] of Object.entries(label_bounding_rects)) { // position the labels on the slightly scaled triangle
            geometry.positionPolygonSideLabel(
                bounding_rect,
                triangle_ps,
                side_name_key[key],
                6
            );
        }
        const post_test_bounding_rect = geometry.getBoundingRect(
            geometry.getCombinedPointSet(
                triangle_ps,
                geometry.getBoundingRectRectangle(label_bounding_rects.a),
                geometry.getBoundingRectRectangle(label_bounding_rects.b),
                geometry.getBoundingRectRectangle(label_bounding_rects.c)
            )
        );
        const x_change = (post_test_bounding_rect.x2 - post_test_bounding_rect.x1) - (original_bounding_rect.x2 - original_bounding_rect.x1);
        const y_change =(post_test_bounding_rect.y2 - post_test_bounding_rect.y1) - (original_bounding_rect.y2 - original_bounding_rect.y1);
        const needed_x_factor = (((original_bounding_rect.x2 - original_bounding_rect.x1) - 500)*(1 - test_scale_factor)) / x_change + 1;
        const needed_y_factor = (((original_bounding_rect.y2 - original_bounding_rect.y1) - 500)*(1 - test_scale_factor)) / y_change + 1;

        // undo the test scaling and apply the min (more extreme) of the two factors
        geometry.transformations.transformPointSet(triangle_ps, 'dilate', incenter, 
            (1 / test_scale_factor) * Math.min(needed_x_factor, needed_y_factor)
        );

        // now we know the triangle and its labels must fit in a 500x500 bounding rect, but the entire apparatus needs to be put in the Q1 500x500 rect
        for (const [key, bounding_rect] of Object.entries(label_bounding_rects)) { 
            geometry.positionPolygonSideLabel( // position the labels on the final scaled (but mispositioned) triangle
                bounding_rect,
                triangle_ps,
                side_name_key[key],
                6
            );
        }
        const a_rectangle = geometry.getBoundingRectRectangle(label_bounding_rects.a);
        const b_rectangle = geometry.getBoundingRectRectangle(label_bounding_rects.b);
        const c_rectangle = geometry.getBoundingRectRectangle(label_bounding_rects.c);

        // correctly position the entire apparatus as one big point set
        geometry.fitPointSet(
            geometry.getCombinedPointSet(
                triangle_ps,
                a_rectangle,
                b_rectangle,
                c_rectangle
            ),
            {x1: 0, x2: 500, y1: 0, y2: 500},
            'center',
            'center' 
        );

        // update the bounding rect positions
        label_bounding_rects.a = geometry.getBoundingRect(a_rectangle);
        label_bounding_rects.b = geometry.getBoundingRect(b_rectangle);
        label_bounding_rects.c = geometry.getBoundingRect(c_rectangle); 

        // last step is to actually draw everything in
        // draw the triangle
        C.lineWidth = 2;
        CH.drawPolygon(triangle_ps);

        // insert the text for the labels
        CH.insertText(side_labels_obj.a, label_bounding_rects.a);
        CH.insertText(side_labels_obj.b, label_bounding_rects.b);
        CH.insertText(side_labels_obj.c, label_bounding_rects.c);

        // draw the right angle label
        const right_angle_label = geometry.getRightAngleLabel(triangle_ps);
        C.lineWidth = 1;
        CH.connectPointsWithLine(right_angle_label); 
    }
}

// Module Utilities:

const cartesian_functions = [ // functions that assume a cartesian canvas context
    CH.drawPolygon,
    CH.drawBoundingRect,
    CH.connectPointsWithLine
];
for (const [func_name, func_obj] of Object.entries(CH)) {
    if (cartesian_functions.includes(func_obj)) {
        CH[func_name] = function(...args) {
            // save and flip
            C.save();
            C.translate(0, canvas.height);
            C.scale(1, -1);

            const return_val = func_obj(...args); // call the function now that the context is flipped to cartesian

            // restore unflipped context
            C.restore();

            return return_val; 
        }
    }
}

export { CH };