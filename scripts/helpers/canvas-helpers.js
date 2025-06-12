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
            setCurrentCanvas(canvas_el, context);
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
            lineTo(point.x, point.y);
        });
        C.closePath();
    }
}

// Module Utilities:

const cartesian_functions = [ // functions that assume a cartesian canvas context
    GH.drawtriangle
];
for (const [func_name, func_obj] of Object.entries(CH)) {
    if (cartesian_functions.includes(func_obj)) {
        CH[func_name] = function(...args) {
            // save and flip
            C.save();
            C.translate(0, canvas.height);
            C.scale(1, -1);

            const return_val = func(...args); // call the function now that the context is flipped to cartesian

            // restore unflipped context
            C.restore();

            return return_val; 
        }
    }
}

export { CH };