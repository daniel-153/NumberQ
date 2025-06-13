import * as GH from '../math-gens/helpers/geom-helpers.js';

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
        GH.forEachPoint(point_set_obj, function(point) {
            C.lineTo(point.x, point.y);
        });
        C.lineTo(point_set_obj.A.x, point_set_obj.A.y)
        C.stroke()
    },
    getTextBoundingRect: function(text_string, position = {x: 0, y: 0}) { // assumes the text sprouts from the bottom-left of the rect
        const text_metrics = C.measureText(text_string);

        return {
            x1: position.x, x2: position.x + text_metrics.width,
            y1: position.y, y2: position.y + text_metrics.actualBoundingBoxAscent + text_metrics.actualBoundingBoxDescent
        };
    },
    insertText: function(text_string, bounding_rect) {
        // get the actual bounding rect for the provided text (to make sure it will fit)
        let actual_bouding_rect = this.getTextBoundingRect(text_string, {x: bounding_rect.x1, y: bounding_rect.y1});

        if (actual_bouding_rect.x2 > bounding_rect.x2 || actual_bouding_rect.y2 > bounding_rect.y2) {
            console.error('Provided text overflows its bounding rect.');
            return;
        }

        C.save();        

        // ensure the text alignment is correct (left-bottom is assumed)
        C.textAlign = 'left';
        C.textBaseline = 'bottom';

        C.fillText(text_string, bounding_rect.x1, bounding_rect.y1);

        C.restore();
    }
}

// Module Utilities:

const cartesian_functions = [ // functions that assume a cartesian canvas context
    CH.drawPolygon
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