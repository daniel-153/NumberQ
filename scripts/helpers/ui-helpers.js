import * as TB from '../templates/topic-banners.js';

export function updateElementMath(math_container_id, latex_str, initial_font_size_vw) { // insert math into element, make adjustments (if needed) to ensure it doesn't overflow    
    const math_container = document.getElementById(math_container_id);
    initial_font_size_vw = parseFloat(initial_font_size_vw); // break off the 'vw'
    latex_str = String(latex_str); // ensure string input (some gens output numbers)

    // clear previously applied styles before running this func
    math_container.style.fontSize = '';
    math_container.style.display = '';
    math_container.style.overflowX = 'hidden';
    math_container.style.overflowY = 'hidden';
    math_container.style.justifyContent = '';
    math_container.style.alignItems = '';

    // make some adjustments to the initial font size based on special cases (latex contains fractions, or smaller screen size detected)
    const frac_upscale = (latex_str.includes('\\frac')) ? 1.3 : 1;
    initial_font_size_vw *= frac_upscale;
    if (document.documentElement.clientWidth > 900 && document.documentElement.clientWidth <= 1700) { // laptops and tablets
        initial_font_size_vw *= (4/3);
    }
    else if (document.documentElement.clientWidth < 900) { // phones + small tablets
        initial_font_size_vw *= (10/3);
    }

    // apply the resolved initial font size and do the intial typeset
    math_container.innerHTML = '<div class="inner-math-wrapper" style="width: fit-content; height: fit-content; max-width: fit-content; max-height: fit-content;">\\(' + latex_str + '\\)</div>';
    const inner_math_container = math_container.firstElementChild;
    inner_math_container.style.fontSize = initial_font_size_vw + 'vw';
    math_container.setAttribute('data-latexcode', latex_str); // expose the LaTeX so it's still accessible after rendering
    MathJax.typesetPromise([inner_math_container]).then(() => {
        const hasXOverflow = () => inner_math_container.clientWidth > math_container.clientWidth;
        const hasYOverflow = () => inner_math_container.clientHeight > math_container.clientHeight;
        const hasXorYOverflow = () => hasXOverflow() || hasYOverflow();

        if (hasXorYOverflow()) {
            // needed factor is the most extreme out of (available x-space/total x-space with scroll) and (available y-space/total y-space with scroll)
            let needed_downscale_factor = Math.min(math_container.clientWidth/inner_math_container.clientWidth, math_container.clientHeight/inner_math_container.clientHeight);
            needed_downscale_factor -= needed_downscale_factor * (1 / 100); // add an additional 1% 
            inner_math_container.style.fontSize = (initial_font_size_vw * needed_downscale_factor) + 'vw';

            // ensure the font size never shrinks below 16px
            if (((initial_font_size_vw * needed_downscale_factor)/100) * document.documentElement.clientWidth < 16) {
                inner_math_container.style.fontSize = (16 / document.documentElement.clientWidth) * 100 + 'vw';
            }

            // settle (apply) all styles then check if there is still overflow (in which case, scroll bars are needed)
            requestAnimationFrame(() => {
                if (hasXorYOverflow()) {
                    math_container.style.display = 'flex';
                    const applyYStyleUpdates = () => {math_container.style.overflowY = 'auto'; math_container.style.alignItems = 'flex-start'; math_container.scrollTop = 0;}
                    const applyXStyleUpdates = () => {math_container.style.overflowX = 'auto'; math_container.style.justifyContent = 'left'; math_container.scrollLeft = 0;}

                    if (hasXOverflow() && hasYOverflow()) { // both directions overflowed (just apply both scroll bars at the same time)
                        applyXStyleUpdates();
                        applyYStyleUpdates();
                    }
                    else if (hasXOverflow()) { // only x overflowed
                        applyXStyleUpdates();

                        requestAnimationFrame(() => { // check if the x scroll bar caused y overflow
                            if (hasYOverflow()) applyYStyleUpdates();
                        });
                    }
                    else if (hasYOverflow()) { // only y overflowed
                        applyYStyleUpdates();

                        requestAnimationFrame(() => { // check if the y scroll bar caused x overflow
                            if (hasXOverflow()) applyXStyleUpdates();
                        });
                    }
                }
            });
        }
    });
}

export function addTextAutofitter(element, initial_font_size, method) {
    let originalFontSize = initial_font_size !== undefined ? initial_font_size : "3vw"; // Define your original font size
    if (window.innerWidth <= 900) originalFontSize = "10vw";
    method = method || 'set'; // Default method is 'set'

    // Function to adjust font size dynamically
    function fitTextToDiv(container) {
        container.style.fontSize = originalFontSize; // Reset to original font size

        // Detect overflow
        let scaleFactor = 1; // Initialize scale factor
        const isOverflowing = () =>
            container.scrollHeight > container.clientHeight || container.scrollWidth > container.clientWidth;

        while (isOverflowing()) {
            // Calculate how much to downsize
            const heightRatio = container.clientHeight / container.scrollHeight;
            const widthRatio = container.clientWidth / container.scrollWidth;
            scaleFactor = Math.min(heightRatio, widthRatio);

            // Apply scale factor
            const newFontSize = parseFloat(getComputedStyle(container).fontSize) * scaleFactor;
            container.style.fontSize = newFontSize + "px"; // modify font here
            // container.style.fontSize = (newFontSize / Window.innerWidth) * 100 + 'vw';

            // Break loop if scale factor is 1 (the text isn't overflowing anymore)
            if (scaleFactor >= 1) break;
        }

        // make sure the final font size we set is in vw, not px
        container.style.fontSize = (parseFloat(getComputedStyle(container).fontSize) / window.innerWidth) * 100 + 'vw';
    }

    // Function to clean the element from existing MutationObservers
    function cleanFromListeners(el) {
        const clone = el.cloneNode(true);
        el.parentNode.replaceChild(clone, el);
        return clone;
    }

    // Clean the element to remove existing listeners
    element = cleanFromListeners(element);

    // Run the downsizing logic immediately
    fitTextToDiv(element);

    if (method === 'set') {
        // MutationObserver to detect changes in text content
        const observer = new MutationObserver(() => {
            fitTextToDiv(element); // Adjust font size when content changes
        });

        observer.observe(element, { characterData: true, childList: true, subtree: true });
    }
    // If method is 'run_once', we don't create any observer
} // when the text content of the element changes, downsize it to fit the element if needed

export function toggleVisibility(elements_to_show, elements_to_hide) {
    elements_to_show.forEach(id => document.getElementById(id).classList.remove('hidden-content'));
    elements_to_hide.forEach(id => document.getElementById(id).classList.add('hidden-content'));
}

export function cleanedFromListeners(element) {
    const clone = element.cloneNode(true); 
    element.parentNode.replaceChild(clone, element); 
    return clone; 
} 

export function insertModeBanners() {
    let output_html = '';
    TB.templates.forEach(banner_template => {
        let example_problem_class;
        if (banner_template.example_problem_class === undefined) example_problem_class = '';
        else example_problem_class = banner_template.example_problem_class;
             
        output_html += `
            <div class="generator ${banner_template.category_class_name}">
            <div class="gen-title-container">
                <h1 class="gen-title">${banner_template.display_name}</h1>
                <h2 class="gen-topic">(${banner_template.display_category})</h2>
            </div>
            <div class="example-problem ${example_problem_class}">\\(${banner_template.example_problem}\\)</div>
            <button
                class="start-button"
                data-gen-type="${banner_template.display_name}"
                data-gen-func-name="${banner_template.function_name}"
            >
                Generate
            </button>
            </div>
        `;
    })

    document.getElementById('generator-list').insertAdjacentHTML('afterbegin',output_html);
    MathJax.typesetPromise(['#generator-list']);
}