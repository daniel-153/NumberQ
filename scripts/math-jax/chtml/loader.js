(function init() {
    const math_jax = new Promise((resolve) => {
        try {
            const math_jax_script = document.createElement('script');
            math_jax_script.src = `${window.parent.origin}/scripts/math-jax/chtml/tex-chtml.js`;
            math_jax_script.async = true;

            window.MathJax = {
                startup: {
                    pageReady: () => {
                        return window.MathJax.startup.defaultPageReady().then(() => {
                            resolve(window.MathJax)
                        });
                    }
                }
            };

            document.body.appendChild(math_jax_script);
        } catch (error) {
            throw new Error(`Failed to load math_jax tex-chtml: ${error}`);
        }
    });
    
    window.addEventListener('message', async (event) => {
        const reply_port = event.ports[0];
        if (event.origin !== window.parent.origin || !reply_port) return;

        if (event.data.message_type === 'status_confirmation') {
            reply_port.postMessage('ready');
        }
        else if (event.data.message_type === 'typeset_request') {
            reply_port.postMessage(
                await getChtmlStringArray((await math_jax), event.data.tex_str_arr),
            );
        }
        else if (event.data.message_type === 'load_mjx_components') {
            try {
                await (await math_jax).loader.load(...event.data.component_paths);
                reply_port.postMessage('done');
            } catch (error) {
                reply_port.postMessage('failed: ' + error);
            } 
        }
        else if (event.data.message_type === 'mjx_styles_request') {
            await math_jax;
            reply_port.postMessage(document.getElementById('MJX-CHTML-styles').outerHTML);
        }

        reply_port.close();
    });

    window.parent.postMessage('ready', window.parent.origin);

    // helpers
    async function getChtmlStringArray(math_jax, tex_str_list) {
        tex_str_list.forEach(tex_str => {
            const mjx_container = document.createElement('div');
            mjx_container.innerHTML = '\\(' + tex_str + '\\)';
            mjx_container.setAttribute('data-latex-code', tex_str);

            document.body.appendChild(mjx_container);
        });

        await math_jax.typesetPromise([document.body]);

        const chtml_string_array = [];
        Array.from(document.querySelectorAll('body div')).forEach(mjx_container => {
            const chtml = mjx_container.querySelector('mjx-container');
            chtml.setAttribute('data-latex-code', mjx_container.getAttribute('data-latex-code'));

            chtml_string_array.push(chtml.outerHTML);
        });

        // remove math elements from MathJax's internal registry + remove them from the DOM
        math_jax.typesetClear();
        math_jax.texReset();
        document.body.innerHTML = '';

        return chtml_string_array;
    }
})();