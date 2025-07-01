import * as geometry from '../math-gens/helpers/geom-helpers.js';

let canvas = null;
let C = null;

const CH = {
    createCanvas: function(width_px, height_px, set_as_current = false) {
        const canvas_el = document.createElement('canvas');
        const dpr = (window.devicePixelRatio > 1) ? window.devicePixelRatio : 1;

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
    canvasHeight: function() {
        return Number(canvas.style.height.slice(0, -2));
    },
    canvasWidth: function() {
        return Number(canvas.style.width.slice(0, -2));
    },
    drawPolygon: function(point_set_obj) {
        C.save();
        
        C.lineCap = 'square';
        C.beginPath();
        C.moveTo(point_set_obj.A.x, point_set_obj.A.y);
        geometry.forEachPoint(point_set_obj, function(point) {
            C.lineTo(point.x, point.y);
        });
        C.lineTo(point_set_obj.A.x, point_set_obj.A.y)
        C.stroke()

        C.restore();
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

        let fits_in_rect = true;
        if ((actual_bouding_rect.x2 - actual_bouding_rect.x1) > (bounding_rect.x2 - bounding_rect.x1 + 0.1) ||
            (actual_bouding_rect.y2 - actual_bouding_rect.y1) > (bounding_rect.y2 - bounding_rect.y1 + 0.1)
        ) {
            fits_in_rect = false;
        }

        C.save();        

        // ensure the text alignment is correct (left-bottom is assumed)
        C.textAlign = 'left';
        C.textBaseline = "bottom";

        C.fillText(text_string, bounding_rect.x1, CH.canvasHeight() - bounding_rect.y1);

        C.restore();

        return fits_in_rect; // indicate whether or not the text needed to be resized to fit in its rect
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
    MIH: { // mjx image helpers
        awaitIframeResponse: function(iframe_el, resolveCallback) {
            const handlerFunc = function(event) {
                if (
                    event.origin !== window.location.origin ||
                    event.source !== iframe_el.contentWindow
                ) return;
                else {
                    window.removeEventListener('message', handlerFunc);
                    resolveCallback(event.data);
                }
            };

            window.addEventListener('message', handlerFunc);
        },
        initIframe: async function() { // insert into the dom (+ wait until ready before continuing)
            const iframe_el = document.createElement('iframe');
            iframe_el.style.position = 'absolute';
            iframe_el.style.left = '-9999px';
            iframe_el.style.top = '-9999px';
            iframe_el.srcdoc = `
                <!DOCTYPE html><html><body>
                    <script src="https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-svg.js"><\/script>
                    <script>
                        const iframe_parent_origin = '${window.location.origin}';

                        async function getSvgStringArray(string_factor_pairs) {
                            string_factor_pairs.forEach(pair => {
                                const mjx_container = document.createElement('div');
                                mjx_container.innerHTML = '\\\\(' + pair[0] + '\\\\)';
                                mjx_container.setAttribute('data-scale-factor', pair[1]);

                                document.body.appendChild(mjx_container);
                            });

                            await MathJax.typesetPromise([document.body]);

                            const svg_string_array = [];
                            Array.from(document.querySelectorAll('body div')).forEach(mjx_container => {
                                const svg = mjx_container.querySelector('svg');
                                svg.setAttribute('width', Number(svg.getAttribute('width').slice(0, -2)) * Number(mjx_container.getAttribute('data-scale-factor')) + 'ex');
                                svg.setAttribute('height', Number(svg.getAttribute('height').slice(0, -2)) * Number(mjx_container.getAttribute('data-scale-factor')) + 'ex');

                                svg_string_array.push(svg.outerHTML);
                            });

                            // clear all the elements
                            document.body.innerHTML = '';

                            return svg_string_array;
                        }

                        window.addEventListener('message', async (event) => {
                            if (event.origin !== iframe_parent_origin) return;

                            if (event.data.message_type === 'status_confirmation') {
                                window.parent.postMessage('ready', iframe_parent_origin);
                            }
                            else if (event.data.message_type === 'typeset_request') {
                                window.parent.postMessage(
                                    await getSvgStringArray(event.data.string_factor_pairs),
                                    iframe_parent_origin
                                );
                            }
                        });

                        window.parent.postMessage('ready', iframe_parent_origin);
                    <\/script>
                </body></html>
            `;

            // remove a pre-existing iframe if it exists (to avoid adding multiple)
            if (document.getElementById('mjx-svg-loader') !== null) document.getElementById('mjx-svg-loader').remove();
            iframe_el.id = 'mjx-svg-loader';
            document.getElementById('generation-content').appendChild(iframe_el);

            // don't continue until the iframe loads and sends its initial 'ready' message
            await new Promise((resolve) => {CH.MIH.awaitIframeResponse(iframe_el, resolve);});

            return iframe_el;
        },
        getIframeStatus: async function() {
            const iframe_el = document.getElementById('mjx-svg-loader');

            if (iframe_el === null || iframe_el.contentWindow === undefined) return null; // no iframe element was inserted (if the status is null, this is almost certainly why)

            // nonetheless, still add this handling just in case the iframe exists but can't communicate 
            const test_result = await new Promise((resolve) => {
                Promise.race([ // start the race
                    new Promise((resolveResponse) => {
                        CH.MIH.awaitIframeResponse(iframe_el, resolveResponse);
                    }),
                    new Promise((resolveTimedOut) => setTimeout(() => {resolveTimedOut(null)}, 500))
                ]).then((value) => resolve(value));

                iframe_el.contentWindow.postMessage({message_type: 'status_confirmation'}, window.location.origin); // send the message
            });
            
            return test_result; // null or 'ready'
        }
    },
    getMathJaxAsSvg: async function(string_factor_pairs) {
        // initialize the iframe if it isn't already
        let iframe_el;
        if ((await this.MIH.getIframeStatus()) === null) {
            iframe_el = await this.MIH.initIframe();
        }
        else {
            iframe_el = document.getElementById('mjx-svg-loader');
        }

        // send over the latex string(s) and wait for the response
        const svg_string_array = await new Promise((resolve) => {
            new Promise((resolveResponse) => {
                CH.MIH.awaitIframeResponse(iframe_el, resolveResponse);
            }).then((value) => resolve(value));

            iframe_el.contentWindow.postMessage({
                message_type: 'typeset_request', 
                string_factor_pairs
            }, window.location.origin);
        });

        // return the svg elements parsed out of the strings
        const dom_parser = new DOMParser();
        return svg_string_array.map(svg_string => dom_parser.parseFromString(svg_string, 'image/svg+xml').firstChild);
    },
    getMathJaxAsImage: async function(string_factor_pairs) {
        const mjx_images = await this.getMathJaxAsSvg(string_factor_pairs);

        return await Promise.all(mjx_images.map(async function(mjx_svg) { // convert the each svg to an image
            const svg_string = new XMLSerializer().serializeToString(mjx_svg);
            const encoded = btoa(new TextEncoder().encode(svg_string).reduce((data, byte) => data + String.fromCharCode(byte), ''));
            const img_src = "data:image/svg+xml;base64," + encoded;

            const img = new Image();
            img.src = img_src;

            try {
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = () => reject(new Error("SVG image failed to load"));
                });
            } catch (err) {
                throw err;
            }

            return img;
        }));
    },
    getImageBoundingRect(image, location = {x: 0, y: 0}) {
        return {
            x1: location.x, x2: location.x + image.width,
            y1: location.y, y2: location.y + image.height
        };
    },
    drawImage: function(image, bounding_rect) { // images expand rightward and downward (by their size) from their specified location
        const actual_bouding_rect = this.getImageBoundingRect(image);
        if ((actual_bouding_rect.x2 - actual_bouding_rect.x1) > (bounding_rect.x2 - bounding_rect.x1 + 0.1) ||
            (actual_bouding_rect.y2 - actual_bouding_rect.y1) > (bounding_rect.y2 - bounding_rect.y1 + 0.1)
        ) { // Provided image overflows its bounding rect => scale it down to fit in the provided bounding rect
            const x_overflow_factor = (actual_bouding_rect.x2 - actual_bouding_rect.x1) / (bounding_rect.x2 - bounding_rect.x1 + 0.1);
            const y_overflow_factor = (actual_bouding_rect.y2 - actual_bouding_rect.y1) / (bounding_rect.y2 - bounding_rect.y1 + 0.1);
            
            const larger_factor = Math.max(x_overflow_factor, y_overflow_factor);
            C.drawImage( // downscale by the inverse of the larger overflow factor (preserving aspect ratio)
                image, bounding_rect.x1, CH.canvasHeight() - bounding_rect.y2, 
                (actual_bouding_rect.x2 - actual_bouding_rect.x1) * (1 / larger_factor), 
                (actual_bouding_rect.y2 - actual_bouding_rect.y1) * (1 / larger_factor)
            );

            return false; // indicate it didn't fit and was downsized
        }
        else { // provided image fits in provided bounding rect
            C.drawImage(
                image, bounding_rect.x1, CH.canvasHeight() - bounding_rect.y2, 
                bounding_rect.x2 - bounding_rect.x1, bounding_rect.y2 - bounding_rect.y1
            );

            return true; // indicate that the image sucessfully fit in its rect
        }  
    },
    drawRightTriangle: async function(side_lengths_obj, side_labels_obj, rotation, horizontal_reflection = false, vertical_reflection = false) {
        // a -> A-B | b -> B-C | c -> C-A
        const triangle_line_width = 5.5; // the canvas context lineWidth at which the triangle will be drawn
        const triangle_ps = geometry.getBoundingTriangle( // the idea here is to "pretend" we're dealing with the filled-in triangle until the very end
            geometry.build_triangle.SSS(side_lengths_obj.a, side_lengths_obj.c, side_lengths_obj.b),
            triangle_line_width
        );
        const side_name_key = {'a': 'A-B', 'b': 'C-A', 'c': 'B-C'};

        // rotate the triangle by the specified amount (about its incenter)
        geometry.transformations.transformPointSet(triangle_ps, 'rotate', 
            geometry.getTriangleIncenter(triangle_ps), geometry.convertAngle(rotation, 'to_rad')
        );

        // perform the reflections (if specified)
        if (horizontal_reflection) {
            geometry.transformations.transformPointSet(triangle_ps, 'reflect', 
                {x: 0, y: 0}, Infinity
            );
        }
        if (vertical_reflection) {
            geometry.transformations.transformPointSet(triangle_ps, 'reflect', 
                {x: 0, y: 0}, 0
            );
        }

        // scale the triangle to fit a (theoretical) 1000x1000 canvas in the corner of Q1
        geometry.fitPointSet(triangle_ps, {x1: 0, x2: 1000, y1: 0, y2: 1000}, 'center', 'center');

        // get the image for each side label
        const string_factor_pairs = [];
        ['a','b','c'].forEach(side_letter => {
            const label_string = side_labels_obj[side_letter];
            const pair = [];
            pair[0] = label_string;

            // shrink the scale factor for longer latex strings
            let mjx_image_scale = 6;
            if (label_string.includes('~') && label_string.split('~')[0].length >= 6) mjx_image_scale = 5;
            pair[1] = mjx_image_scale;

            string_factor_pairs.push(pair);
        });
        const mjx_images = await CH.getMathJaxAsImage(string_factor_pairs);

        // get the bounding rects for the side labels + put them in position (which will likely overflow the canvas initially) 
        const label_spacing = 17.25; // distance of the labels from the sides (px)
        const label_bounding_rects = {a: null, b: null, c: null};
        const label_images = {a: null, b: null, c: null};
        for (const [key, _] of Object.entries(label_images)) {
            label_images[key] = mjx_images[key.charCodeAt(0) - 97];
            label_bounding_rects[key] = CH.getImageBoundingRect(label_images[key]);

            geometry.positionPolygonSideLabel(
                label_bounding_rects[key],
                triangle_ps,
                side_name_key[key],
                label_spacing
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
                label_spacing
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
        const needed_x_factor = (((original_bounding_rect.x2 - original_bounding_rect.x1) - 1000)*(1 - test_scale_factor)) / x_change + 1;
        const needed_y_factor = (((original_bounding_rect.y2 - original_bounding_rect.y1) - 1000)*(1 - test_scale_factor)) / y_change + 1;

        // undo the test scaling and apply the min (more extreme) of the two factors
        geometry.transformations.transformPointSet(triangle_ps, 'dilate', incenter, 
            (1 / test_scale_factor) * Math.min(needed_x_factor, needed_y_factor)
        );

        // now we know the triangle and its labels must fit in a 1000x1000 bounding rect, but the entire apparatus needs to be put in the Q1 1000x1000 rect
        for (const [key, bounding_rect] of Object.entries(label_bounding_rects)) { 
            geometry.positionPolygonSideLabel( // position the labels on the final scaled (but mispositioned) triangle
                bounding_rect,
                triangle_ps,
                side_name_key[key],
                label_spacing
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
            {x1: 0, x2: 1000, y1: 0, y2: 1000},
            'center',
            'center' 
        );

        // update the bounding rect positions
        label_bounding_rects.a = geometry.getBoundingRect(a_rectangle);
        label_bounding_rects.b = geometry.getBoundingRect(b_rectangle);
        label_bounding_rects.c = geometry.getBoundingRect(c_rectangle); 

        // last step is to actually draw everything in
        // draw the triangle => get the original triangle back from the bounding triangle
        C.lineWidth = triangle_line_width;
        CH.drawPolygon(geometry.getBoundingTriangle(triangle_ps, triangle_line_width, 'inner'));

        // insert the images for the labels
        CH.drawImage(label_images.a, label_bounding_rects.a);
        CH.drawImage(label_images.b, label_bounding_rects.b);
        CH.drawImage(label_images.c, label_bounding_rects.c);

        // draw the right angle label
        const right_angle_label = geometry.getRightAngleLabel(triangle_ps);
        C.lineWidth = 3;
        CH.connectPointsWithLine(right_angle_label);

        return {
            outer_bound_triangle: triangle_ps,
            inner_bound_triangle: geometry.getBoundingTriangle(triangle_ps, 2* triangle_line_width, 'inner')
        };
    },
    drawSpecialRightTriangle: async function(
        side_labels, angle_measures, given_angles, rotation, 
        horizontal_reflection = false, vertical_reflection = false
    ) {
        // draw triangle at a fixed size (hypotenuse = 1)
        let inner_triangle;
        if (angle_measures.A === 30 || angle_measures.A === 60) {
            inner_triangle = (await CH.drawRightTriangle(
                {a: 0.5, b: 0.5*Math.sqrt(3), c: 1},
                side_labels, rotation, horizontal_reflection, vertical_reflection
            )).inner_bound_triangle;
        }
        else if (angle_measures.A === 45) {
            inner_triangle = (await CH.drawRightTriangle(
                {a: Math.SQRT1_2, b: Math.SQRT1_2, c: 1},
                side_labels, rotation, horizontal_reflection, vertical_reflection
            )).inner_bound_triangle;
        }

        // determine which angle labels correspond to which vertex (basically decipher how the labels have been switched around at this point)
        const triangle_angles = geometry.getAllTriangleAngles(inner_triangle, 'deg');
        const already_matched_values = [];
        const label_to_vertex = {'A': null, 'B': null, 'C': null};
        const difference_tolerance = 1;
        for (const [label_letter, _] of Object.entries(label_to_vertex)) {
            const provided_angle_measure = angle_measures[label_letter];

            for (const [vertex_name, calculated_angle_measure] of Object.entries(triangle_angles)) {
                if (
                    Math.abs(provided_angle_measure - calculated_angle_measure) < difference_tolerance &&
                    !already_matched_values.includes(vertex_name)
                ) {
                    label_to_vertex[label_letter] = vertex_name;
                    already_matched_values.push(vertex_name);
                    break;
                }
            }
        }

        // extract all the latex strings that need to be typeset into svg's->images
        const string_factor_pairs = [];
        const vertex_letter_order = []; // the corresponding vertex for each entry in string_factor_pairs
        const default_mjx_scale = 5;
        given_angles.forEach(given_angle_name => {
            const current_pair = [];

            current_pair[0] = angle_measures[given_angle_name] + '^\\circ';
            current_pair[1] = default_mjx_scale;

            string_factor_pairs.push(current_pair);
            vertex_letter_order.push(label_to_vertex[given_angle_name]);
        });
        const mjx_images = await CH.getMathJaxAsImage(string_factor_pairs);

        // position and insert the images onto the triangle
        for (let i = 0; i < mjx_images.length; i++) {
            const current_vertex_letter = vertex_letter_order[i];
            const current_mjx_image = mjx_images[i];

            const bounding_rect = CH.getImageBoundingRect(current_mjx_image);

            geometry.positionAngleLabelFixedSize(bounding_rect, current_vertex_letter, inner_triangle);

            CH.drawImage(current_mjx_image, bounding_rect);
        }
    },
    getCanvasClone: function(original_canvas = canvas) {
        const clone = document.createElement('canvas');
        clone.width = original_canvas.width;
        clone.height = original_canvas.height;

        const ctx = clone.getContext('2d');
        ctx.drawImage(original_canvas, 0, 0);

        return clone;
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
            C.translate(0, CH.canvasHeight());
            C.scale(1, -1);

            const return_val = func_obj(...args); // call the function now that the context is flipped to cartesian

            // restore unflipped context
            C.restore();

            return return_val; 
        }
    }
}

export { CH };