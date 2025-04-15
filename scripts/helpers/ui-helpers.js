import * as TB from '../templates/topic-banners.js';

export function updateElementMath(elementID, latexCode, initial_font_size) {
    /*
     This function can be used in three different ways: 
     (1) All three args passed -> insert new TeX in a certain element and start at a specific max font size
     (2) Only elementID and latexCode passed -> insert new TeX in a certain element and start at 3vw (10vw on mobile) max font size
     (3) Only elementID is passed -> downsize the pre-existing TeX (must have been inserted by this function) and start at 3vw (10vw on mobile)
     */
    
    const element = document.getElementById(elementID);

    // re-set any style that may have been changed to accomodate overflow in the last run of this function
    element.style.overflowX = 'hidden';
    element.style.justifyContent = 'center';

    // use newly provided TeX or previously inserted TeX
    latexCode = latexCode !== undefined ? latexCode : element.getAttribute('data-latexcode'); // previously inserted LaTeX
    if (latexCode === null) {
        console.error('updateElementMath error: provided element does not have a data-latexcode attribute');
        return;
    }

    let defaultFontSize = initial_font_size !== undefined ? initial_font_size : "3vw"; // Default font size
    if (window.innerWidth <= 900) defaultFontSize = "10vw";

    // Determine if the LaTeX code contains a fraction
    let adjustedFontSize;
    if (String(latexCode).includes("\\frac") && window.innerWidth > 900) {
        adjustedFontSize = "4.2vw";
    }
    else if (String(latexCode).includes("\\frac") && window.innerWidth <= 900) {
        adjustedFontSize = "13vw";
    }
    else {
        adjustedFontSize = defaultFontSize;
    }

    // Automatically insert delimiters around the LaTeX code
    const wrappedLatexCode = '\\(' + latexCode + '\\)';

    // Set the initial font size before rendering
    element.style.fontSize = adjustedFontSize;

    // Insert the LaTeX code into the element
    element.innerHTML = wrappedLatexCode;

    // expose the LaTeX so it's still accessible after rendering
    element.setAttribute('data-latexcode', latexCode);

    // Render the content with MathJax
    MathJax.typesetPromise([element]).then(() => {
        // After rendering, adjust font size to fit the container
        fitTextToDiv(element, adjustedFontSize);
    });

    // Function to adjust font size dynamically
    function fitTextToDiv(container, originalFontSize) {
        container.style.fontSize = originalFontSize; // Reset to original font size

        // Detect overflow
        const isOverflowing = () =>
            container.scrollHeight > container.clientHeight || container.scrollWidth > container.clientWidth;

        while (isOverflowing()) {
            // Calculate how much to downsize
            const heightRatio = container.clientHeight / container.scrollHeight;
            const widthRatio = container.clientWidth / container.scrollWidth;
            const scaleFactor = Math.min(heightRatio, widthRatio);

            // Apply scale factor
            const currentFontSize = parseFloat(getComputedStyle(container).fontSize);
            const newFontSize = currentFontSize * scaleFactor;
            container.style.fontSize = newFontSize + "px"; // modify font here
            // container.style.fontSize = (newFontSize / Window.innerWidth) * 100 + 'vw';

            // Break loop if scale factor is 1 (the text isn't overflowing anymore), or we shrunk the text too small (below 16px)
            if (scaleFactor >= 1 || newFontSize < 16) break; 
        }

        // ensure font size is >= 16px
        if (parseFloat(getComputedStyle(container).fontSize) < 16) container.style.fontSize = 16 + 'px';

        if (isOverflowing()) {
            container.style.overflowX = 'auto';
            container.style.display = 'flex';
            container.style.justifyContent = 'left';
            
            container.innerHTML = `
            <div class="clipped-tex-container"> 
                <div class="clipped-tex-wrapper">
                    \\[${latexCode}\\]
                </div>    
            </div>
            <style>
                .clipped-tex-container {
                    width: calc(100% + fit-content);
                    border-right: 4mm solid rgba(0,0,0,0);
                }
                
                .clipped-tex-wrapper {
                    border-left: 4mm solid rgba(0,0,0,0);
                }

                :root {
                --scrollbar-size: max(0.52vw, 7.5px);
                --scrollbar-radius: max(0.26vw, 4px);
                }

                #${elementID}::-webkit-scrollbar {
                    height: var(--scrollbar-size);
                }

                #${elementID}::-webkit-scrollbar-thumb {
                    background-color: #555;
                    border-radius: var(--scrollbar-radius);
                }

                #${elementID}::-webkit-scrollbar-thumb:hover {
                    background-color: #666; 
                }

                #${elementID}::-webkit-scrollbar-track {
                    background: #2222223d;
                    border-radius: var(--scrollbar-radius); 
                }
            </style>
            `;
            MathJax.typesetPromise(document.querySelectorAll(".clipped-tex-container"));
        }

        // make sure the final font size we set is in vw, not px
        container.style.fontSize = (parseFloat(getComputedStyle(container).fontSize) / window.innerWidth) * 100 + 'vw';

        // make sure the scroll is reset every time (all the way back to the left)
        container.scrollLeft = 0;

        // special case for the fullscreen answer (which shouldn't have a scrollbar when hidden)
        if (
            elementID === 'fullscreen-answer' && 
            document.getElementById('show-hide-button').getAttribute('data-status') === 'show'
        ) {
            container.style.overflowX = 'hidden';
        }
        
        // if we overflowed in the y-direction but not the x-direction, don't pull the text to the left
        if (container.scrollHeight > container.clientHeight && !(container.scrollWidth > container.clientWidth)) {
            container.style.justifyContent = "center";
            
            // since real y-direction overflows only seem to happen on mobile (& possibly small ipads), add this special case to deal with this 
            if (window.innerWidth <= 1200) observeTextChanges(container, '13vw', 'run_once');
        }
    }
} // uncollapse for explanation

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