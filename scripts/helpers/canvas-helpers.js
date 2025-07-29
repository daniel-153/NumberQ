import * as geometry from '../math-gens/helpers/geom-helpers.js';

let canvas = null;
let C = null;

function getProxiedCanvasContext(context) {
    const stringfyArg = (arg) => { // helper
        if (!(arg instanceof Object)) return arg;
        if (arg instanceof Element) {
            if (arg.nodeName === 'IMG') return `__obj:htmlElement__{<img src="__removed__" data-latex-code="${arg.getAttribute('data-latex-code')}">}`;
            else return `__obj:htmlElement__{${arg.outerHTML}}`
        }
        if (arg instanceof Object) return `__obj__{${JSON.stringify(arg)}}`;
    }
    
    return new Proxy(context, {
        get: function(proxied_ctx, property_name) {
            if (typeof(proxied_ctx[property_name]) === 'function') { // call canvas context prototype methods ([[Prototype]] CanvasRenderingContext2D) (.beginPath(), .stroke(), etc)
                return function(...args) {
                    canvas["__ctx_command_history__"].push({
                        "action": "method_call",
                        "method_name": property_name,
                        "args": args.map(arg => stringfyArg(arg))
                    });

                    return proxied_ctx[property_name](...args);
                }
            }
            else { // access canvas context properties (.lineWidth, .strokeStyle, etc)
                return proxied_ctx[property_name]
            }
        },
        set: function(proxied_ctx, key_name, new_value) { // change to a canvas context property (.lineWidth = 5, .strokeStyle = 'red', etc)
            if (key_name in proxied_ctx) { // only allow setting canvas context properties that already exist (no ctx['aksdlfbj'] = 'asjkhb')
                canvas["__ctx_command_history__"].push({
                    "action": "property_set",
                    "property_name": key_name,
                    "new_value": new_value
                });

                proxied_ctx[key_name] = new_value;
                return true;
            }
            else {
                throw new Error(`Cannot set property '${key_name}' on ${proxied_ctx}: ${proxied_ctx} has no property '${key_name}'.`);
            }
        }
    });
}

const CH = {
    createCanvas: function(width_px, height_px, set_as_current = false, write_command_history = true) {
        // save global canvas and context before temp (or perm) overwriting
        const prev_canvas = canvas;
        const prev_context = C;
        
        canvas = document.createElement('canvas');
        C = canvas.getContext("2d");
        if (write_command_history) {
            canvas["__ctx_command_history__"] = [];
            C = getProxiedCanvasContext(C);
            canvas["__ctx_command_history__"].push({"action": "canvas_property_set", "property_name": "width", "new_value": width_px});
            canvas["__ctx_command_history__"].push({"action": "canvas_property_set", "property_name": "height", "new_value": height_px});
        }
        const new_canvas_and_context = {element: canvas, context: C};

        const dpr = (window.devicePixelRatio > 1) ? window.devicePixelRatio : 1;

        // Set the correct canvas resolution (canvas px per css px)
        canvas.width = width_px * dpr;
        canvas.height = height_px * dpr;

        // Set CSS size (in layout pixels)
        canvas.style.width = width_px + "px";
        canvas.style.height = height_px + "px";

        // scale the draw context according to the canvas resolution
        C.scale(dpr, dpr); 

        // store the actual "drawing" width and height
        canvas["__draw_width__"] = width_px;
        canvas["__draw_height__"] = height_px;

        if (!set_as_current) { // if the new canvas should *Not* be set as current, restore the old canvas and context
            canvas = prev_canvas;
            C = prev_context;
        }

        return new_canvas_and_context;
    },
    setCurrentCanvas: function(canvas_el, context) {
        canvas = canvas_el;
        C = context;
    },
    canvasHeight: function() {
        return canvas["__draw_height__"];
    },
    canvasWidth: function() {
        return canvas["__draw_width__"];
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
                                mjx_container.setAttribute('data-latex-code', pair[0]);
                                mjx_container.setAttribute('data-scale-factor', pair[1]);

                                document.body.appendChild(mjx_container);
                            });

                            await MathJax.typesetPromise([document.body]);

                            const svg_string_array = [];
                            Array.from(document.querySelectorAll('body div')).forEach(mjx_container => {
                                const svg = mjx_container.querySelector('svg');
                                svg.setAttribute('width', Number(svg.getAttribute('width').slice(0, -2)) * Number(mjx_container.getAttribute('data-scale-factor')) + 'ex');
                                svg.setAttribute('height', Number(svg.getAttribute('height').slice(0, -2)) * Number(mjx_container.getAttribute('data-scale-factor')) + 'ex');
                                svg.setAttribute('data-latex-code', mjx_container.getAttribute('data-latex-code'));

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
            const svg_latex_code = mjx_svg.getAttribute('data-latex-code');
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

            img.setAttribute('data-latex-code', svg_latex_code);
            return img;
        }));
    },
    getImageBoundingRect(image, location = {x: 0, y: 0}) {
        return {
            x1: location.x, x2: location.x + image.width,
            y1: location.y, y2: location.y + image.height
        };
    },
    drawNullImage: function() { // no effect on canvas, but places a .drawImage call on the command stack (which is necessary for later reading)
        const empty_canvas = document.createElement('canvas');
        empty_canvas.width = 1;
        empty_canvas.height = 1;

        C.drawImage(empty_canvas, 0, 0, 0, 0); // occupies zero space on the canvas
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
    drawRightTriangle: async function(
        side_lengths_obj, side_labels_obj, rotation, 
        mjx_scale = 6, horizontal_reflection = false, vertical_reflection = false
    ) {
        // a -> A-B | b -> B-C | c -> C-A
        const triangle_line_width = 5.5; // the canvas context lineWidth at which the triangle will be drawn
        const triangle_ps = geometry.getBoundingTriangle( // the idea here is to "pretend" we're dealing with the filled-in triangle until the very end
            geometry.build_triangle.SSS(side_lengths_obj.c, side_lengths_obj.b, side_lengths_obj.a),
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
        const skipped_image_indices = [];
        ['a','b','c'].forEach(side_letter => {
            if (side_labels_obj[side_letter] === null) { // don't get empty images for sides that aren't labeled
                skipped_image_indices.push(side_letter.charCodeAt(0) - 97);
                return;
            }

            const label_string = side_labels_obj[side_letter];
            const pair = [];
            pair[0] = label_string;

            // shrink the scale factor for longer latex strings
            let mjx_image_scale = mjx_scale;
            if (label_string.includes('~') && label_string.split('~')[0].length >= 6) mjx_image_scale = mjx_scale * (5 / 6);
            else if (label_string.includes('\\frac')) mjx_image_scale = mjx_scale * (7.5 / 6.5);
            else if (label_string === 'x' || label_string === '?' || label_string === 'a' || label_string === 'b' || label_string === 'c') {
                mjx_image_scale = Math.max(6.5, mjx_scale);
            }
            pair[1] = mjx_image_scale;

            string_factor_pairs.push(pair);
        });
        const mjx_images = await CH.getMathJaxAsImage(string_factor_pairs);

        // get the bounding rects for the side labels + put them in position (which will likely overflow the canvas initially) 
        const label_spacing = 17.25; // distance of the labels from the sides (px)
        const label_bounding_rects = {};
        const label_images = {};
        for (let image_index = 0; image_index < 3; image_index++) {
            const side_letter = String.fromCharCode(97 + image_index);

            if (skipped_image_indices.includes(image_index)) { // no image created for the current side
                mjx_images.splice(image_index, 0, null);
                label_images[side_letter] = null;
            }
            else { // current side has a corresponding image
                label_images[side_letter] = mjx_images[image_index];
                label_bounding_rects[side_letter] = CH.getImageBoundingRect(label_images[side_letter]);

                geometry.positionPolygonSideLabel(
                    label_bounding_rects[side_letter],
                    triangle_ps,
                    side_name_key[side_letter],
                    label_spacing
                );
            }
        }

        // next step is to fit the whole apparatus (triangle with three labels) to the canvas *without changing the font size*
        // determine the sensitivity to change of the bounding box to a scaling about the triangle incenter
        const original_bounding_rect = geometry.getBoundingRect(
            geometry.getCombinedPointSet(
                triangle_ps,
                ...Object.values(label_bounding_rects).map(bounding_rect => geometry.getBoundingRectRectangle(bounding_rect))
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
                ...Object.values(label_bounding_rects).map(bounding_rect => geometry.getBoundingRectRectangle(bounding_rect))
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
        const bounding_rect_rectangles = {};
        for (const [key, bounding_rect] of Object.entries(label_bounding_rects)) { 
            geometry.positionPolygonSideLabel( // position the labels on the final scaled (but mispositioned) triangle
                bounding_rect,
                triangle_ps,
                side_name_key[key],
                label_spacing
            );

            bounding_rect_rectangles[key] = geometry.getBoundingRectRectangle(bounding_rect);
        }

        // correctly position the entire apparatus as one big point set
        geometry.fitPointSet(
            geometry.getCombinedPointSet(
                triangle_ps,
                ...Object.values(bounding_rect_rectangles)
            ),
            {x1: 0, x2: 1000, y1: 0, y2: 1000},
            'center',
            'center' 
        );

        // update the bounding rect positions
        for (const [key, _] of Object.entries(label_bounding_rects)) {
            label_bounding_rects[key] = geometry.getBoundingRect(bounding_rect_rectangles[key]);
        }

        // last step is to actually draw everything in
        // draw the triangle => get the original triangle back from the bounding triangle
        C.lineWidth = triangle_line_width;
        CH.drawPolygon(geometry.getBoundingTriangle(triangle_ps, triangle_line_width, 'inner'));

        // draw the right angle label
        const right_angle_label = geometry.getRightAngleLabel(triangle_ps);
        C.lineWidth = 3;
        CH.connectPointsWithLine(right_angle_label);

        // insert the images for the side labels
        for (const [side_name, image_value] of Object.entries(label_images)) {
            if (image_value === null) { // no side label image associated with the side -> insert a "null image"
                CH.drawNullImage();
            }
            else { // side has a label image -> insert it
                CH.drawImage(image_value, label_bounding_rects[side_name]);
            }
        }

        return {
            outer_bound_triangle: triangle_ps,
            inner_bound_triangle: geometry.getBoundingTriangle(triangle_ps, 2* triangle_line_width, 'inner')
        };
    },
    drawSpecialRightTriangle: async function(
        side_labels, angle_measures, given_angles, rotation, 
        mjx_scale = 6.5, horizontal_reflection = false, vertical_reflection = false
    ) {
        // draw triangle at a fixed size (hypotenuse = 1)
        let inner_triangle;
        if (angle_measures.A === 30 || angle_measures.A === 60) {
            inner_triangle = (await CH.drawRightTriangle(
                {a: 0.5, b: 0.5*Math.sqrt(3), c: 1},
                side_labels, rotation, mjx_scale, horizontal_reflection, vertical_reflection
            )).inner_bound_triangle;
        }
        else if (angle_measures.A === 45) {
            inner_triangle = (await CH.drawRightTriangle(
                {a: Math.SQRT1_2, b: Math.SQRT1_2, c: 1},
                side_labels, rotation, mjx_scale, horizontal_reflection, vertical_reflection
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

            geometry.positionAngleLabelFixedSize(bounding_rect, current_vertex_letter, inner_triangle, 0.95);

            CH.drawImage(current_mjx_image, bounding_rect);
        }

        // if only one of the 30-60 or 45-45 angles were given, insert a semantic (null) image for the other one
        if (given_angles.length === 1) CH.drawNullImage();
    },
    drawGeneralTriangle: async function(
        triangle_info_obj, label_vertices = true, rotation = 0, 
        horizontal_reflection = false, vertical_reflection = false
    ) {
        const {triangle, side_labels, angle_labels, written_prompt} = triangle_info_obj;
        let vertex_labels;
        if (label_vertices) vertex_labels = {'A': 'A', 'B': 'B', 'C': 'C'};
        else vertex_labels = {'A': null, 'B': null, 'C': null};

        const mjx_scale = 6;
        const line_width = 5.5;
        const side_label_spacing = 17.25; // distance of the side labels from the sides (px)
        const vertex_label_spacing = 4; // distance of vertex labels from vertices

        // get the adjusted triangle with no too-small angles
        const triangle_ps = geometry.getBoundingTriangle(geometry.getAdjustedTriangle(triangle, 30), line_width);

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

        // get several image labels in one typset (max would be 10 => 3 sides, 3 angles, 3 vertices, 1 prompt)
        const string_factor_pairs = [];
        const image_no_image_key = [];
        for (let pair_index = 0; pair_index < 10; pair_index++) {
            let image_to_typset = false;
            
            if (pair_index < 3) { // sides
                const letter = String.fromCharCode(97 + pair_index);
                if (side_labels[letter] !== null) {
                    if (side_labels[letter] === 'x' || side_labels[letter] === 'a' || side_labels[letter] === 'b' || side_labels[letter] === 'c') {
                        string_factor_pairs.push([side_labels[letter], mjx_scale * (6.5/6)]); // scale up variable letters
                    }
                    else if (side_labels[letter].includes('\\,')) { 
                        string_factor_pairs.push([side_labels[letter], mjx_scale * (5/6)]); // scale down side labels that include units
                    }
                    else {
                        string_factor_pairs.push([side_labels[letter], mjx_scale]);
                    }
                    
                    image_to_typset = true;
                }
                
            }
            else if (pair_index < 6) { // angles
                const letter = String.fromCharCode(65 + (pair_index - 3));
                if (angle_labels[letter] !== null) {
                    if (angle_labels[letter] === '\\theta') {
                        string_factor_pairs.push([angle_labels[letter], mjx_scale * (6.5/6)]); // scale up angles labeled with theta
                    }
                    else {
                        string_factor_pairs.push([angle_labels[letter], mjx_scale * (4.5/6)]); // 4.5/6 mjx scale
                    }
                    
                    image_to_typset = true;
                }
            }
            else if (pair_index < 9) { // vertices
                const letter = String.fromCharCode(65 + (pair_index - 6));
                if (vertex_labels[letter] !== null) {
                    string_factor_pairs.push([vertex_labels[letter], mjx_scale * (5/6)]);
                    image_to_typset = true;
                }
            }
            else if (pair_index === 9) { // prompt
                string_factor_pairs.push([written_prompt, mjx_scale]);
                image_to_typset = true;
            }

            image_no_image_key.push(image_to_typset);
        }
        const mjx_images = await CH.getMathJaxAsImage(string_factor_pairs);

        // unpack only the images that weren't null (and therefore were typeset)
        const side_images = {};
        const side_image_b_rects = {};
        const angle_images = {};
        const angle_image_b_rects = {};
        const vertex_images = {};
        const vertex_image_b_rects = {};
        let prompt_image;
        let prompt_image_b_rect;
        let image_index = 0;
        for (let pair_index = 0; pair_index < 10; pair_index++) {
            let image_to_typset = image_no_image_key[pair_index];
            if (!image_to_typset) continue;
            
            if (pair_index < 3) { // sides
                const letter = String.fromCharCode(97 + pair_index);
                side_images[letter] = mjx_images[image_index];
                side_image_b_rects[letter] = CH.getImageBoundingRect(mjx_images[image_index]);
            }
            else if (pair_index < 6) { // angles
                const letter = String.fromCharCode(65 + (pair_index - 3));
                angle_images[letter] = mjx_images[image_index];
                angle_image_b_rects[letter] = CH.getImageBoundingRect(mjx_images[image_index]);
            }
            else if (pair_index < 9) { // vertices
                const letter = String.fromCharCode(65 + (pair_index - 6));
                vertex_images[letter] = mjx_images[image_index];
                vertex_image_b_rects[letter] = CH.getImageBoundingRect(mjx_images[image_index]);
            }
            else if (pair_index === 9) { // prompt
                prompt_image = mjx_images[image_index];
                prompt_image_b_rect = CH.getImageBoundingRect(mjx_images[image_index]);
            }
            image_index++
        }

        // determine how much space should be allocated to the triangle drawing vs the prompt image
        const canvas_size = 1000;
        const prompt_image_padding = 30; // a bit of extra space between the triangle region and prompt region (so they are never touching)
        const prompt_space = {x1: 0, x2: canvas_size, y1: canvas_size - (prompt_image_b_rect.y2 - prompt_image_b_rect.y1) - prompt_image_padding, y2: canvas_size};
        const triangle_space = {x1: 0, x2: canvas_size, y1: 0, y2: prompt_space.y1};

        // position the bounding rect for the prompt (left-aligned in its space)
        prompt_image_b_rect = {
            x1: 0, x2: (prompt_image_b_rect.x2 - prompt_image_b_rect.x1), 
            y1: prompt_space.y1 + prompt_image_padding, y2: prompt_space.y2
        };

        // scale the triangle to fit its space the entirety of its space (ignoring labels for now)
        geometry.fitPointSet(triangle_ps, triangle_space, 'center', 'center');

        // position the side and vertex labels on the initial triangle (which will likely overflow initially)
        geometry.positionAllTriangleSideLabels(side_image_b_rects, triangle_ps, side_label_spacing);
        geometry.positionAllTriangleVertexLabels(vertex_image_b_rects, triangle_ps, vertex_label_spacing);
        
        // next step is to do the linear scaling algo to fit the triangle apparatus in its space
        let triangle_content_b_rect = geometry.getCombinedBoundingRect(
            geometry.getBoundingRect(triangle_ps), ...Object.values(side_image_b_rects), ...Object.values(vertex_image_b_rects) 
        );
        const x0 = triangle_content_b_rect.x2 - triangle_content_b_rect.x1;
        const y0 = triangle_content_b_rect.y2 - triangle_content_b_rect.y1;

        const test_scale_factor = 0.9;
        const incenter = geometry.getTriangleIncenter(triangle_ps);
        geometry.transformations.transformPointSet(triangle_ps, 'dilate', incenter, test_scale_factor);
        geometry.positionAllTriangleSideLabels(side_image_b_rects, triangle_ps, side_label_spacing);
        geometry.positionAllTriangleVertexLabels(vertex_image_b_rects, triangle_ps, vertex_label_spacing);

        triangle_content_b_rect = geometry.getCombinedBoundingRect(
            geometry.getBoundingRect(triangle_ps), ...Object.values(side_image_b_rects), ...Object.values(vertex_image_b_rects) 
        );
        const x1 = triangle_content_b_rect.x2 - triangle_content_b_rect.x1;
        const y1 = triangle_content_b_rect.y2 - triangle_content_b_rect.y1;
        const needed_x_factor = (((triangle_space.x2 - triangle_space.x1) - x0)*(test_scale_factor - 1)) / (x1 - x0) + 1;
        const needed_y_factor = (((triangle_space.y2 - triangle_space.y1) - y0)*(test_scale_factor - 1)) / (y1 - y0) + 1;
        geometry.transformations.transformPointSet(triangle_ps, 'dilate', incenter, 
            (1 / test_scale_factor) * Math.min(needed_x_factor, needed_y_factor) // more extreme of the two factors ensures all the triangle content fits in its space
        );

        // reposition labels on the downscaled triangle
        geometry.positionAllTriangleSideLabels(side_image_b_rects, triangle_ps, side_label_spacing);
        geometry.positionAllTriangleVertexLabels(vertex_image_b_rects, triangle_ps, vertex_label_spacing);

        // now the triangle content can fit in its space, but it still needs positioned properly (centered within its space)
        const side_rectangles = {};
        const vertex_rectangles = {};
        for (const [side_name, b_rect] of Object.entries(side_image_b_rects)) {
            side_rectangles[side_name] = geometry.getBoundingRectRectangle(b_rect);
        }
        for (const [vertex_name, b_rect] of Object.entries(vertex_image_b_rects)) {
            vertex_rectangles[vertex_name] = geometry.getBoundingRectRectangle(b_rect);
        }
        geometry.fitPointSet(
            geometry.getCombinedPointSet(
                triangle_ps,
                ...Object.values(side_rectangles),
                ...Object.values(vertex_rectangles)
            ),
            triangle_space, 'center', 'center' 
        );
        for (const [side_name, rect] of Object.entries(side_rectangles)) {
            side_image_b_rects[side_name] = geometry.getBoundingRect(rect);
        }
        for (const [vertex_name, rect] of Object.entries(vertex_rectangles)) {
            vertex_image_b_rects[vertex_name] = geometry.getBoundingRect(rect);
        }

        // put the angle labels on the triangle (now that it's in its final position)
        const inner_triangle = geometry.getBoundingTriangle(triangle_ps, 2*line_width, 'inner'); // account for line width
        geometry.positionAllTriangleAngleLabelsFS(angle_image_b_rects, inner_triangle, 0.97);

        // draw the triangle
        const middle_triangle = geometry.getBoundingTriangle(triangle_ps, line_width, 'inner');
        C.lineWidth = line_width;
        CH.drawPolygon(middle_triangle);

        // draw the side labels
        ['a','b','c'].forEach(side_name => {
            if (side_images[side_name] !== undefined && side_images[side_name] !== null) {
                CH.drawImage(side_images[side_name], side_image_b_rects[side_name])
            }
            else CH.drawNullImage();
        });

        // draw the vertex labels
        ['A','B','C'].forEach(vertex_name => {
            if (vertex_images[vertex_name] !== undefined && vertex_images[vertex_name] !== null) {
                CH.drawImage(vertex_images[vertex_name], vertex_image_b_rects[vertex_name]);
            }
            else CH.drawNullImage();
        });

        // draw the angle labels
        ['A','B','C'].forEach(angle_name => {
            if (angle_images[angle_name] !== undefined && angle_images[angle_name] !== null) {
                CH.drawImage(angle_images[angle_name], angle_image_b_rects[angle_name]);
            }
            else CH.drawNullImage();
        });

        // draw the written prompt
        CH.drawImage(prompt_image, prompt_image_b_rect);
    },
    getCanvasClone: function(original_canvas = canvas) {
        const clone = document.createElement('canvas');
        clone.width = original_canvas.width;
        clone.height = original_canvas.height;

        const ctx = clone.getContext('2d');
        ctx.drawImage(original_canvas, 0, 0);

        return clone;
    },
    getCanvasBoundingRect: function() {
        return {
            x1: 0, x2: CH.canvasWidth(),
            y1: 0, y2: CH.canvasHeight()
        };
    },
    drawCenteredImageOnCanvas(image) {
        const canvas_rect = CH.getCanvasBoundingRect(canvas);
        const image_rect = CH.getImageBoundingRect(image);

        geometry.centerBoundingRect(image_rect, canvas_rect);

        CH.drawImage(image, image_rect);
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