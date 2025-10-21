await (async function init() {
    try { window.localStorage.clear(); } catch(e) {} // ensures MathJax loads with empty local storage
    
    // create the two iframes (svg and chtml)
    const iframes = {'svg': null, 'chtml': null};
    Object.keys(iframes).forEach(loader_type => {
        iframes[loader_type] = document.createElement('iframe');
        iframes[loader_type].srcdoc = `
            <!DOCTYPE html><html data-use-adaptive-css="0"><body>
                <script src="${window.location.origin}/scripts/math-jax/${loader_type}/loader.js"><\/script>
            </body></html>
        `;

        iframes[loader_type].style.position = 'absolute';
        iframes[loader_type].style.left = '-9999px';
        iframes[loader_type].style.top = '-9999px';
    });

    const iframe_wrapper = document.createElement('div');
    iframe_wrapper.id = 'mjx-loaders';

    Object.values(iframes).forEach(iframe_el => {
        iframe_wrapper.appendChild(iframe_el);
    });

    // wait for the two iframes to load
    const iframe_inits = [newIframeResponsePromise(iframes['svg']), newIframeResponsePromise(iframes['chtml'])];
    document.body.appendChild(iframe_wrapper);
    await Promise.all(iframe_inits);

    // expose the interface to interact with the iframes
    window.mjx_loader = new Proxy(
        {
            chtml_render_limit: 200,
            svg_render_limit: 200,
            chtml_render_count: 0,
            svg_render_count: 0,

            texToChtml: async function(tex_str_arr) {
                const chtml_str_arr = await newIframeMessagePromise(this.target_iframe, {
                    message_type: 'typeset_request',
                    tex_str_arr: tex_str_arr 
                });

                const dom_parser = new DOMParser();
                return chtml_str_arr.map(chtml_str => dom_parser.parseFromString(chtml_str, 'text/html').body.firstElementChild);
            },
            texToSvg: async function(string_factor_pairs) {
                const svg_str_arr = await newIframeMessagePromise(this.target_iframe, {
                    message_type: 'typeset_request',
                    string_factor_pairs: string_factor_pairs
                });

                const dom_parser = new DOMParser();
                return svg_str_arr.map(svg_str => dom_parser.parseFromString(svg_str, 'image/svg+xml').documentElement);
            },
            texToImg: async function(string_factor_pairs) {
                const mjx_svgs = await this.texToSvg.call(
                    {target_iframe: this.target_iframe}, 
                    string_factor_pairs
                );

                return await Promise.all(mjx_svgs.map(async function(mjx_svg) { // convert the each svg to an image
                    const svg_latex_code = mjx_svg.getAttribute('data-latex-code');
                    const svg_string = new XMLSerializer().serializeToString(mjx_svg);
                    const encoded = btoa(new TextEncoder().encode(svg_string).reduce((data, byte) => data + String.fromCharCode(byte), ''));
                    const img_src = "data:image/svg+xml;base64," + encoded;

                    const img = new Image();
                    img.src = img_src;

                    await new Promise((resolve, reject) => {
                        img.onload = resolve;
                        img.onerror = () => reject(new Error("SVG image failed to load"));
                    });

                    img.setAttribute('data-latex-code', svg_latex_code);
                    return img;
                }));
            },
            typesetPromise: async function(root_element = document.body, format = 'chtml', scale = 1) {
                if (!(root_element instanceof Element)) {
                    throw new Error('Supplied root element is not an html element.');
                }
                if (!['chtml', 'svg', 'img'].includes(format)) {
                    throw new Error(`Supplied format '${format}' is invalid. Format must be 'chtml', 'svg', or 'img'.`);
                }
                if (Number.isNaN(scale) || scale <= 0) {
                    throw new Error(`Supplied scale '${scale}' is invalid. Scale must be a positve number.`);
                }

                root_element.normalize();
                const tree_walker = document.createTreeWalker(
                    root_element,
                    NodeFilter.SHOW_TEXT
                );

                const text_nodes = [];
                let text_node;
                while ((text_node = tree_walker.nextNode())) {
                    text_nodes.push(text_node);
                }
                
                let tex_strings = [];
                const mjx_nodes = [];
                const math_regex = /\\\(([.\s\S]+?)\\\)/; 
                text_nodes.forEach(text_node => {
                    let delim_match = text_node.nodeValue.match(math_regex);
                    let node_slice = text_node;

                    while (delim_match) {
                        const math_node = node_slice.splitText(delim_match.index);
                        node_slice = math_node.splitText(delim_match[0].length);

                        tex_strings.push(math_node.nodeValue.slice(2, -2));
                        mjx_nodes.push(math_node);

                        delim_match = node_slice.nodeValue.match(math_regex);
                    }
                });
                
                if (format === 'svg' || format === 'img') {
                    tex_strings = tex_strings.map(tex_str => [tex_str, scale]);
                }

                let math_output_els = await this.resolveTexFunc(format)(tex_strings);

                for (let i = 0; i < mjx_nodes.length; i++) {
                    const mjx_node = mjx_nodes[i];
                    const math_el = math_output_els[i];

                    mjx_node.parentNode.replaceChild(math_el, mjx_node);
                }
            },

            // implemented in get()
            loadSvgComponents: async function(component_paths) {},
            loadChtmlComponents: async function(component_paths) {}
        },
        {
            __task_queue__: Promise.resolve(),
            __getTaskFunc__: function(func_name, mjx_loader) {
                let task_func;
                if (['texToChtml', 'texToSvg', 'texToImg'].includes(func_name)) {
                    let typesetFunc, loader_name;
                    if (func_name === 'texToChtml') {
                        loader_name = 'chtml';
                        typesetFunc = async function(tex_str_arr) {
                            return await mjx_loader['texToChtml'].call({target_iframe: iframes['chtml']}, tex_str_arr)
                        }
                    }
                    else if (func_name === 'texToSvg') {
                        loader_name = 'svg';
                        typesetFunc = async function(tex_str_arr) {
                            return await mjx_loader['texToSvg'].call({target_iframe: iframes['svg']}, tex_str_arr)
                        }
                    }   
                    else if (func_name === 'texToImg') {
                        loader_name = 'svg';
                        typesetFunc = async function(tex_str_arr) {
                            return await mjx_loader['texToImg'].call({
                                target_iframe: iframes['svg'],
                                texToSvg: mjx_loader['texToSvg']
                            }, tex_str_arr);
                        }
                    }

                    task_func = async function(tex_str_arr) {
                        const render_count = `${loader_name}_render_count`;
                        const render_limit = `${loader_name}_render_limit`;
                        const capacity = Math.max(0, mjx_loader[render_limit] - mjx_loader[render_count]);
                        let pre_limit_tex = tex_str_arr.slice(0, capacity);
                        let post_limit_tex = tex_str_arr.slice(capacity);
                        let rendered_output_arr = []; 

                        do {
                            if (pre_limit_tex.length > 0) {
                                rendered_output_arr = rendered_output_arr.concat(
                                    await typesetFunc(pre_limit_tex)
                                );

                                mjx_loader[render_count] += pre_limit_tex.length;
                                pre_limit_tex.length = 0
                            }

                            if (post_limit_tex.length > 0) {
                                await destroyAndRestartLoader(loader_name);
                                mjx_loader[render_count] = 0;
                                
                                pre_limit_tex = post_limit_tex.splice(0, Math.min(mjx_loader[render_limit], post_limit_tex.length));
                            }
                        } while (pre_limit_tex.length > 0);

                        return rendered_output_arr;
                    }
                }
                else if (['loadSvgComponents', 'loadChtmlComponents'].includes(func_name)) {
                    const svg_or_chtml = (func_name.includes('html'))? 'chtml' : 'svg';

                    task_func = async function(component_paths) {
                        await newIframeMessagePromise(iframes[svg_or_chtml], {
                            message_type: 'load_mjx_components',
                            component_paths: component_paths
                        });

                        if (!Array.isArray(iframes[svg_or_chtml].loaded_extensions)) {
                            iframes[svg_or_chtml].loaded_extensions = [];
                        }

                        iframes[svg_or_chtml].loaded_extensions.push(...component_paths)
                    }
                }

                return task_func;
            },
            get: function(mjx_loader, accessed_prop_name) {
                if (typeof(mjx_loader[accessed_prop_name]) === 'function') {
                    let current_task_func;
                    if (['texToChtml', 'texToSvg', 'texToImg','loadSvgComponents', 'loadChtmlComponents'].includes(accessed_prop_name)) {
                        current_task_func = this.__getTaskFunc__(accessed_prop_name, mjx_loader);
                    }
                    else if (accessed_prop_name === 'typesetPromise') {
                        const typesetFunc = mjx_loader[accessed_prop_name].bind({resolveTexFunc: (format) => this.__getTaskFunc__(`texTo${format.charAt(0).toUpperCase()}${format.slice(1)}`, mjx_loader)});
                        
                        current_task_func = async function(...args) {
                            return await typesetFunc(...args);
                        }
                    }
                    else {
                        current_task_func = async function(...args) {
                            return await mjx_loader[accessed_prop_name](...args);
                        }
                    }

                    const previous_tasks = this.__task_queue__;
                    let wrapped_task_func;
                    const current_task = new Promise((resolve) => {
                        wrapped_task_func = async function(...args) {
                            try {
                                await previous_tasks;
                                return await current_task_func(...args);
                            } finally {
                                resolve();
                            }
                        }
                    });

                    this.__task_queue__ = current_task;

                    return wrapped_task_func;
                }
                else {
                    return mjx_loader[accessed_prop_name];
                }
            },
            set: function(_, accessed_prop_name, new_value) {
                throw new Error(`Cannot set property '${accessed_prop_name}' to '${new_value}' on mjx_loader: mjx_loader is read-only.`);
            }
        }
    );

    // asynchronously request the mjx chtml styles from the chtml loader (to be inserted into the head when they are ready)
    newIframeMessagePromise(iframes['chtml'], {message_type: 'mjx_styles_request'}).then((style_tag_str) => {
        const parsed_styles = (new DOMParser()).parseFromString(style_tag_str, 'text/html').head.firstChild;
        document.head.appendChild(parsed_styles);
    });

    // helpers
    function newIframeResponsePromise(iframe_el) { // resolves on the soonest message from the same iframe
        return new Promise((resolve) => {
            const handlerFunc = function(event) {
                if (
                    event.origin !== window.location.origin ||
                    event.source !== iframe_el.contentWindow
                ) return;
                else {
                    window.removeEventListener('message', handlerFunc);
                    resolve(event.data);
                }
            };
            
            window.addEventListener('message', handlerFunc);
        });
    }

    function newIframeMessagePromise(iframe_el, message_data) { // resolves on the corresponding response to the message sent
        return new Promise((resolve, reject) => {
            const {port1, port2} = new MessageChannel();

            port1.onmessage = (event) => {
                port1.close();
                resolve(event.data);
            };

            port1.onmessageerror = () => {
                port1.close();
                reject(new Error('Iframe message attempt failed.'));
            };

            iframe_el.contentWindow.postMessage(message_data, window.location.origin, [port2]);
        });
    }

    async function destroyAndRestartLoader(svg_or_chtml) {
        const iframe_styles = iframes[svg_or_chtml].getAttribute('style');
        const loaded_extensions = iframes[svg_or_chtml].loaded_extensions;
        
        iframes[svg_or_chtml].remove();
        delete iframes[svg_or_chtml];

        let extension_data = '';
        if (Array.isArray(loaded_extensions) && loaded_extensions.length > 0) {
            extension_data = `data-loaded-extensions="${loaded_extensions.join(',')}"`;
        } 

        iframes[svg_or_chtml] = document.createElement('iframe');
        iframes[svg_or_chtml].srcdoc = `
            <!DOCTYPE html><html data-use-adaptive-css="1" ${extension_data}><body>
                <script src="${window.location.origin}/scripts/math-jax/${svg_or_chtml}/loader.js"><\/script>
            </body></html>
        `;

        iframes[svg_or_chtml].setAttribute('style', iframe_styles);

        const init_promise = newIframeResponsePromise(iframes[svg_or_chtml]);
        document.getElementById('mjx-loaders').appendChild(iframes[svg_or_chtml]);
        await init_promise;
    }
})();