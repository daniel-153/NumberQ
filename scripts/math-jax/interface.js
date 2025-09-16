(async function init() {
    // create the two iframes (svg and chtml)
    const iframes = {'svg': null, 'chtml': null};
    Object.keys(iframes).forEach(loader_type => {
        iframes[loader_type] = document.createElement('iframe');
        iframes[loader_type].srcdoc = `
            <!DOCTYPE html><html><body>
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
            chtml_msg_limit: 200,
            svg_msg_limit: 200,
            chtml_msg_count: 0,
            svg_msg_count: 0,

            texToChtml: async function(tex_str_arr) {
                const chtml_str_arr = await newIframeMessagePromise(this.target_iframe, {
                    message_type: 'typeset_request',
                    tex_str_arr: tex_str_arr 
                });

                const dom_parser = new DOMParser();
                return chtml_str_arr.map(chtml_str => dom_parser.parseFromString(chtml_str, 'text/html').body.firstChild);
            },
            texToSvg: async function(string_factor_pairs) {
                const svg_str_arr = await newIframeMessagePromise(this.target_iframe, {
                    message_type: 'typeset_request',
                    string_factor_pairs: string_factor_pairs
                });

                const dom_parser = new DOMParser();
                return svg_str_arr.map(svg_str => dom_parser.parseFromString(svg_str, 'image/svg+xml').firstChild);
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

            loadSvgComponent: function() {

            },
            loadChtmlComponent: function() {

            }
        },
        {
            get: function(mjx_loader, accessed_prop_name) {
                if (['texToChtml', 'texToSvg', 'texToImg'].includes(accessed_prop_name)) {
                    if (accessed_prop_name === 'texToChtml') {
                        let iframeHandler = async () => {};
                        if (mjx_loader['chtml_msg_count'] === mjx_loader['chtml_msg_limit']) {
                            iframeHandler = () => destroyAndRestartLoader('chtml');
                            mjx_loader['chtml_msg_count'] = 0;
                        }

                        mjx_loader['chtml_msg_count']++;
                         
                        return async function(...args) {
                            await iframeHandler();

                            return await mjx_loader['texToChtml'].call({target_iframe: iframes['chtml']}, ...args);
                        }
                    }
                    else if (
                        accessed_prop_name === 'texToSvg' || 
                        accessed_prop_name === 'texToImg'
                    ) {
                        let iframeHandler = async () => {};
                        if (mjx_loader['svg_msg_count'] === mjx_loader['svg_msg_limit']) {
                            iframeHandler = () => destroyAndRestartLoader('svg');
                            mjx_loader['svg_msg_count'] = 0;
                        }

                        mjx_loader['svg_msg_count']++;

                        if (accessed_prop_name === 'texToSvg') {
                            return async function(...args) {
                                await iframeHandler();

                                return await mjx_loader['texToSvg'].call({target_iframe: iframes['svg']}, ...args)
                            }
                        }
                        else if (accessed_prop_name === 'texToImg') {
                            return async function(...args) {
                                await iframeHandler();

                                return await mjx_loader['texToImg'].call({
                                    target_iframe: iframes['svg'],
                                    texToSvg: mjx_loader['texToSvg']
                                }, ...args);
                            }
                        }
                    }
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
    function newIframeResponsePromise(iframe_el) {
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
            
            window.addEventListener('message', handlerFunc); // resolves on iframe response (with data)
        });
    }

    function newIframeMessagePromise(iframe_el, message_data) {
        const response_promise = newIframeResponsePromise(iframe_el);

        iframe_el.contentWindow.postMessage(message_data, window.location.origin);

        return response_promise;
    }

    function destroyAndRestartLoader(svg_or_chtml) {
        console.log(svg_or_chtml + ' destroyed and reloaded')

        const iframe_styles = iframes[svg_or_chtml].getAttribute('style');
        
        iframes[svg_or_chtml].remove();
        delete iframes[svg_or_chtml];

        iframes[svg_or_chtml] = document.createElement('iframe');
        iframes[svg_or_chtml].srcdoc = `
            <!DOCTYPE html><html><body>
                <script src="${window.location.origin}/scripts/math-jax/${svg_or_chtml}/loader.js"><\/script>
            </body></html>
        `;

        iframes[svg_or_chtml].setAttribute('style', iframe_styles);

        const init_promise = newIframeResponsePromise(iframes[svg_or_chtml]);

        document.getElementById('mjx-loaders').appendChild(iframes[svg_or_chtml]);

        return init_promise;
    }
})();