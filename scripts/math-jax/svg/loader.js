(function init() {
    const math_jax = new Promise((resolve) => {
        try {
            const math_jax_script = document.createElement('script');
            math_jax_script.src = `${window.parent.origin}/scripts/math-jax/svg/tex-svg.js`;
            math_jax_script.async = true;

            window.math_jax = {
                startup: {
                    pageReady: () => {
                        resolve(window.math_jax)
                    }
                }
            };
        } catch (error) {
            throw new Error(`Failed to load math_jax tex-svg: ${error}`);
        }
    });
    
    window.addEventListener('message', async (event) => {
        if (event.origin !== window.parent.origin) return;

        if (event.data.message_type === 'status_confirmation') {
            window.parent.postMessage('ready', window.parent.origin);
        }
        else if (event.data.message_type === 'typeset_request') {
            window.parent.postMessage(
                await getSvgStringArray((await math_jax), event.data.string_factor_pairs),
                window.parent.origin
            );
        }
        else if (event.data.message_type === 'load_mjx_components') {
            try {
                await (await math_jax).loader.load(...event.data.component_paths);
                window.parent.postMessage('done', window.parent.origin);
            } catch (error) {
                window.parent.postMessage('failed: ' + error, window.parent.origin);
            } 
        }
    });

    window.parent.postMessage('ready', window.parent.origin);
})();

async function getSvgStringArray(math_jax, string_factor_pairs) {
    string_factor_pairs.forEach(pair => {
        const mjx_container = document.createElement('div');
        mjx_container.innerHTML = '\\\\(' + pair[0] + '\\\\)';
        mjx_container.setAttribute('data-latex-code', pair[0]);
        mjx_container.setAttribute('data-scale-factor', pair[1]);

        document.body.appendChild(mjx_container);
    });

    await math_jax.typesetPromise([document.body]);

    const svg_string_array = [];
    Array.from(document.querySelectorAll('body div')).forEach(mjx_container => {
        const svg = mjx_container.querySelector('svg');
        svg.setAttribute('width', Number(svg.getAttribute('width').slice(0, -2)) * Number(mjx_container.getAttribute('data-scale-factor')) + 'ex');
        svg.setAttribute('height', Number(svg.getAttribute('height').slice(0, -2)) * Number(mjx_container.getAttribute('data-scale-factor')) + 'ex');
        svg.setAttribute('data-latex-code', mjx_container.getAttribute('data-latex-code'));

        svg_string_array.push(svg.outerHTML);
    });

    // remove math elements from MathJax's internal registry + remove them from the DOM
    math_jax.typesetClear();
    math_jax.texReset();
    document.body.innerHTML = '';

    return svg_string_array;
}