function createEventListeners() {
    observeTextChanges(document.getElementById('un-rendered-Q'), '1.2vw');
    observeTextChanges(document.getElementById('un-rendered-A'), '1.2vw');

    [...document.getElementsByClassName('start-button')].forEach((element) => {
        element.addEventListener(
            'click',
            () => {
                document.getElementById('home-page-content').classList.toggle('hidden-content');
                document.getElementById('generation-content').classList.toggle('hidden-content');
                document.getElementById('presenation-content').classList.add('hidden-content');
                initiateGenerator(element.getAttribute('data-gen-type'),element.getAttribute('data-gen-func-name'));
                window.scrollTo(0, 0);
                history.pushState({ page: 'generator' }, '', '');
                document.getElementById('randomize-all-checkbox').checked = false; // make sure randomize-all always starts unchecked
                document.getElementById('settings-container').scrollTop = 0; // reset the scroll on the settings group
        });
    });

    window.addEventListener('popstate',() => {
        document.getElementById('home-page-content').classList.remove('hidden-content');
        document.getElementById('generation-content').classList.add('hidden-content');
        document.getElementById('FAQ-page').classList.add('hidden-content');
        document.body.style.overflowY = 'visible';
        history.pushState({ page: 'generator' }, '', '');
    });

    document.getElementById('back-arrow-p-modes').addEventListener('click', () => {
        document.getElementById('home-page-content').classList.toggle('hidden-content');
        document.getElementById('generation-content').classList.toggle('hidden-content'); 
        document.body.style.overflowY = 'visible';
    });

    document.getElementById('feedback-button').addEventListener('click', () => {
        window.open('https://forms.gle/WecgWERFcqpR4sSEA', '_blank');
        document.getElementById('feedback-button').blur();
    })

    document.getElementById('see-info-button').addEventListener('click', () => {
        document.getElementById('home-page-content').classList.toggle('hidden-content');
        document.getElementById('FAQ-page').classList.toggle('hidden-content');
        window.scrollTo(0, 0);
        document.getElementById('FAQ-content-container').scrollTo(0, 0);
        history.pushState({ page: 'generator' }, '', '');
    });

    document.getElementById('back-arrow-FAQ').addEventListener('click', () => {
        document.getElementById('home-page-content').classList.toggle('hidden-content');
        document.getElementById('FAQ-page').classList.toggle('hidden-content'); 
    });

    const QCopyButton = document.getElementById('Q-copy-button');
    const ACopyButton = document.getElementById('A-copy-button');

    QCopyButton.addEventListener('click',() => {
        navigator.clipboard.writeText(document.getElementById('un-rendered-Q').textContent);
        QCopyButton.innerHTML = 'Copied!';
        QCopyButton.setAttribute('data-status','text-was-copied');
        removeCopyMessage(QCopyButton);
    });

    ACopyButton.addEventListener('click',() => {
        navigator.clipboard.writeText(document.getElementById('un-rendered-A').textContent);
        ACopyButton.innerHTML = 'Copied!';
        ACopyButton.setAttribute('data-status','text-was-copied')
        removeCopyMessage(ACopyButton);
    });

    // Presentation mode event listeners
    document.getElementById('fullscreen-regen-button').addEventListener('click', () => {
        document.getElementById('generate-button').click();
    });

    let answerIsShown = false;
    document.getElementById('show-hide-button').addEventListener('click', () => {
        if (!answerIsShown) {
            document.getElementById('fullscreen-answer').style.background = 'whitesmoke';
            document.getElementById('fullscreen-answer').style.color = 'rgb(11, 5, 5)';
            document.getElementById('show-hide-button').innerHTML = 'Hide';
            document.getElementById('show-hide-button').setAttribute('data-status','hide');
            document.getElementById('fullscreen-answer').style.overflowX = 'auto';
            answerIsShown = true;
        }
        else {
            document.getElementById('fullscreen-answer').style.background = '';
            document.getElementById('fullscreen-answer').style.color = '';
            document.getElementById('show-hide-button').innerHTML = 'Show';
            document.getElementById('show-hide-button').removeAttribute('data-status');
            document.getElementById('show-hide-button').setAttribute('data-status','show');
            document.getElementById('fullscreen-answer').style.overflowX = 'hidden';
            answerIsShown = false;
        }
    });

    document.getElementById('fullscreen-mode-button').addEventListener('click', () => {
        document.getElementById('presenation-content').classList.toggle('hidden-content');
        
        // fit the TeX on the Q and A when the presentation window is first opened
        updateElementMath('fullscreen-question');
        updateElementMath('fullscreen-answer');

        // don't allow scrolling the generation content while in the presentation banner (by hiding it) (mostly for mobile)
        document.body.style.overflowY = 'hidden'; // the three ways out of here (where you need to set this back) are back-arrow, exit, and browser-back

        // Same as else{} just above^
        document.getElementById('fullscreen-answer').style.background = '';
        document.getElementById('fullscreen-answer').style.color = '';
        document.getElementById('show-hide-button').innerHTML = 'Show';
        document.getElementById('show-hide-button').removeAttribute('data-status');
        document.getElementById('show-hide-button').setAttribute('data-status','show');
        answerIsShown = false;
    });

    document.getElementById('fullscreen-exit-button').addEventListener('click', () => {
        document.getElementById('presenation-content').classList.toggle('hidden-content');
        document.body.style.overflowY = 'visible';
    });
}

async function preloadModules() {
    const genModuleNames = [
        'genAddSub',
        'genMulDiv',
        'genLinEq',
        'genFacQuad',
        'genSysEqs',
        'genSimRad',
        'genTrigEx',
        'genRatEx',
        'genPolArith',
        'genComArith'
    ];

    const helperModuleNames = [
        'gen-helpers',
        'polynom-helpers'
    ];

    const importPromises = [
        ...genModuleNames.map(name => import(`./gen-modules/${name}.js`)),
        ...helperModuleNames.map(name => import(`./helper-modules/${name}.js`))
    ];

    await Promise.all(importPromises);
}

const loadModule = async (funcName) => {
    const module = await import(`./gen-modules/${funcName}.js`);  
    return module;  
};

async function initiateGenerator(type, funcName) {
    document.getElementById("generator-name").innerHTML = type;
    document.querySelectorAll(".output-box").forEach(element => {
        element.removeAttribute("data-special-styles");
        element.setAttribute("data-special-styles", funcName);
    });

    const currentModule = await loadModule(funcName); 
    const currentGen = currentModule.default;
    const pre_settings = currentModule.get_presets();

    insertSettings(currentModule.settings_fields).then(() => {
        // This will run after all settings have been inserted
        updateSettings(pre_settings);
        // moved this into the .then because pre-sets might not actually match the first generation (due to a change in validation or as in sysEqs)
        switchToNewQuestion(currentGen(pre_settings));
    });
    
    cleanedFromListeners(document.getElementById("generate-button")).addEventListener("click", async () => {
        if (!document.getElementById('randomize-all-checkbox').checked) {
            const currentSettings = currentFormObject();
            switchToNewQuestion(currentGen(currentSettings)); 
        } // randomize_all isn't checked -> use provided settings
        else {
            const currentSettings = currentModule.get_rand_settings();
            switchToNewQuestion(currentGen(currentSettings));
        } // randomize_all is checked -> use random (pre-set) settings
    });

    // change sizing of Q and A boxes in fullscreen mode (if needed)
    document.getElementById('fullscreen-question').removeAttribute("data-special-styles");
    document.getElementById('fullscreen-question').setAttribute("data-special-styles", funcName);
    document.getElementById('fullscreen-answer').removeAttribute("data-special-styles");
    document.getElementById('fullscreen-answer').setAttribute("data-special-styles", funcName);
}

function cleanedFromListeners(element) {
    const clone = element.cloneNode(true); 
    element.parentNode.replaceChild(clone, element); 
    return clone; 
} 

function switchToNewQuestion(newQuestion) {
    const question = newQuestion.question;
    const answer = newQuestion.answer;
    const TeXquestion = (newQuestion.TeXquestion === undefined) ? newQuestion.question : newQuestion.TeXquestion;
    const TeXanswer = (newQuestion.TeXanswer === undefined) ? newQuestion.answer : newQuestion.TeXanswer;
    
    updateElementMath('rendered-Q',question,'3vw')
    document.getElementById('un-rendered-Q').innerHTML = TeXquestion;
    updateElementMath('rendered-A',answer,'2.5vw')
    document.getElementById('un-rendered-A').innerHTML = TeXanswer;

    MathJax.typesetPromise([document.getElementById('Q-A-container')]);

    // Change settings if needed here
    updateSettings(newQuestion.settings);

    // flash any elements with errors here
    const error_locations = newQuestion.error_locations;
    if (error_locations.length > 0) {
        flashElements(error_locations);
    }


    // Presentation mode updates
    updateElementMath('fullscreen-question', question, '3.75vw');
    updateElementMath('fullscreen-answer', answer, '3.3vw');

    MathJax.typesetPromise([document.getElementById('fullscreen-Q-A-wrapper')]);
} 

function removeCopyMessage(element) {
    if (element._timeoutId) {
        clearTimeout(element._timeoutId);
    }

    element._timeoutId = setTimeout(() => {
        element.innerHTML = 'Copy';
        element.removeAttribute('data-status');
        element._timeoutId = null; 
    }, 2000);
}

function resetStyles(elements) {
    elements.forEach((element) => {
        element.removeAttribute('style');
    });
}

function updateSettings(settings) {
    const form = document.getElementById('settings-form');

    for (const [setting_name, value] of Object.entries(settings)) {
        const elements = form.elements[setting_name];

        if (!elements) {
            // there used to be a warning here saying there was no element by name of error_locations. Why was 'error_locations' ever here?
            continue;
        }

        // Handle collections of checkboxes
        if (elements.length && elements[0].type === 'checkbox') {
            for (const checkbox of elements) {
                checkbox.checked = Array.isArray(value) && value.includes(checkbox.value);
            }
        } 
        // Handle single checkboxes
        else if (elements.type === 'checkbox') {
            elements.checked = Boolean(value);
        } 
        // Handle radio buttons
        else if (elements.type === 'radio') {
            const radio = form.querySelector(`input[name="${setting_name}"][value="${value}"]`);
            if (radio) {
                radio.checked = true;
            }
        } 
        // Handle multi-select dropdowns
        else if (elements.type === 'select-multiple') {
            for (const option of elements.options) {
                option.selected = Array.isArray(value) && value.includes(option.value);
            }
        } 
        // Default case: set value for text inputs, number inputs, select-one, etc.
        else {
            elements.value = value;
        }
    }
}

function flashElements(element_name_array) {
    const form = document.getElementById('settings-form');
    if (!form) {
        console.error("Form with ID 'settings-form' not found.");
        return;
    }

    element_name_array.forEach(name => {
        const element = form.elements[name];

        if (!element) {
            console.warn(`No form element found with the name '${name}'.`);
            return;
        }

        // Store the original styles
        const originalBorderColor = element.style.borderColor || '';
        const originalTextColor = element.style.color || '';

        // Apply flashing effect
        element.style.borderColor = 'red';
        element.style.color = 'red';

        setTimeout(() => {
            element.style.borderColor = originalBorderColor;
            element.style.color = originalTextColor;

            setTimeout(() => {
                element.style.borderColor = 'red';
                element.style.color = 'red';

                setTimeout(() => {
                    element.style.borderColor = originalBorderColor;
                    element.style.color = originalTextColor;
                }, 200); // End of second red flash
            }, 100); // Pause before second flash
        }, 200); // Hold the first red flash
    });
}

function observeTextChanges(element, initial_font_size, method) {
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
}

function updateElementMath(elementID, latexCode, initial_font_size) {
    /*
     This function can be used in three different ways: 
     (1) All three args passed -> insert new TeX in a certain element and start at a specific max font size
     (2) Only elementID and latexCode passed -> insert new TeX in a certain element and start at 3vw (10vw on mobile) max font size
     (3) Only elementID is passed -> downsize the pre-existing TeX (must be inserted by this function) and start at 3vw (10vw on mobile)
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
}

async function insertSettings(settings_names) {
    const settings_templates = await import('../settings/setting_templates.js');
    const settings_objects = {}; // this is an object of objects instead of an array of objects

    settings_names.forEach((setting_name) => {        
        if (settings_templates[setting_name]) {
          settings_objects[setting_name] = settings_templates[setting_name]; // find the settings object and put it in setting_objects {...}
        }
        else {
            console.error(`No setting with name ${setting_name} found in settings_templates.js`)
        }
    });

    let combined_html = '';
    Object.values(settings_objects).forEach(setting_obj => {
        combined_html = combined_html + createSettingHtml(setting_obj);
    });

    document.getElementById('settings-form').innerHTML = combined_html;
    MathJax.typesetPromise(["#settings-form"]);

    // function that generates the html for each settings field
    function createSettingHtml(setting_obj) {
        let output_html; // string that will hold the form element that is created

        // setting is a collection of radio buttons
        if (setting_obj.type === 'radio_buttons') { // setting is a collection of radio buttons
            let {code_name, display_name, radio_buttons, tooltip } = setting_obj;
            let current_class; // the special class of whichever radio button we are currently on (if provided)

            // Calculate the number of options and the appropriate margin-bottom value.
            const numberOfOptions = radio_buttons.length;
            let marginBottom;
            if (numberOfOptions <= 3) {
                marginBottom = '1.7vw';
            } 
            else if (numberOfOptions <= 9) {
                const computedMargin = 1.7 * (3 / numberOfOptions);
                marginBottom = `${computedMargin}vw`;
            }
            else {
                marginBottom = '0.57vw'
            }

            output_html = `
                <div class="setting-box">
                <h3 class="settings-label">${display_name}:</h3>
                <div class="outer-radio-button-wrapper">
            `;

            // create first through second-to-last radio buttons
            let current_label; // the visible label for the radio button
            for (let i = 0; i < radio_buttons.length - 1; i++) {
                current_label = radio_buttons[i][1] // pull out the label so we can modify it
                
                // add a special class to the radio button if specified (in the settings template)
                if (radio_buttons[i][2] !== undefined) current_class = radio_buttons[i][2];
                else current_class = '';
                if (current_class.includes('radio-math')) current_label = '\\(' + current_label + '\\)'; // make it renderable for MathJax
                
                output_html = output_html + `
                    <div class="inner-radio-button-wrapper" style="margin-bottom: ${marginBottom};">
                    <input
                        type="radio"
                        name="${code_name}"
                        value="${radio_buttons[i][0]}"
                        class="radio-buttons"
                        id="${code_name}-option-${i + 1}"
                    />
                    <label for="${code_name}-option-${i + 1}" class="radio-button-label ${current_class}"
                        >${current_label}</label
                    >
                    </div>
                `;
            }

            // create the last radio button
            current_label = radio_buttons[radio_buttons.length - 1][1];
            if (radio_buttons[radio_buttons.length - 1][2] !== undefined) current_class = radio_buttons[radio_buttons.length - 1][2];
            else current_class = '';
            if (current_class.includes('radio-math')) current_label = '\\(' + current_label + '\\)';

            output_html = output_html + `
                <div class="inner-radio-button-wrapper last-radio-option">
                <input
                    type="radio"
                    name="${code_name}"
                    value="${radio_buttons[radio_buttons.length - 1][0]}"
                    class="radio-buttons"
                    id="${code_name}-option-${radio_buttons.length}"
                />
                <label for="${code_name}-option-${radio_buttons.length}" class="radio-button-label ${current_class}"
                    >${current_label}</label
                >
                </div>
            </div>
            <div
                class="settings-info-button"
                data-tooltip="${tooltip}"
            >
                ?
            </div>
            </div>
            `;

            return output_html;
        } 
        else if (setting_obj.type === 'single_textbox') { // setting is a single textbox
            const {code_name, display_name, tooltip} = setting_obj;

            output_html = `
                <div class="setting-box">
                <label for="${code_name}-text-box" class="settings-label">${display_name}:</label>
                <input
                    type="text"
                    name="${code_name}"
                    class="settings-text-box"
                    id="${code_name}-text-box"
                />
                <div
                    class="settings-info-button"
                    data-tooltip="${tooltip}"
                >
                    ?
                </div>
                </div>
            `;

            return output_html;
        }
        else if (setting_obj.type === 'range_textboxes') { // setting is a range textbox (two textboxes)
            const {code_names, display_name, tooltip} = setting_obj;

            output_html = `
                <div class="setting-box">
                <h3 class="settings-label">${display_name}:</h3>
                <div id="number-range-wrapper">
                    from:&thinsp;<input
                    type="text"
                    name="${code_names[0]}"
                    class="settings-text-box number-range-box"
                    />&thinsp;to:&thinsp;<input
                    type="text"
                    name="${code_names[1]}"
                    class="settings-text-box number-range-box"
                    />
                </div>
                <div
                    class="settings-info-button"
                    data-tooltip="${tooltip}"
                >
                    ?
                </div>
                </div>
            `;

            return output_html;
        }
        else if (setting_obj.type === 'check_boxes') { // setting is a collection of checkboxes
            const {code_name, display_name, check_boxes, tooltip } = setting_obj;

            // Calculate the number of options and the appropriate margin-bottom value.
            const numberOfOptions = check_boxes.length;
            let marginBottom;
            if (numberOfOptions <= 3) {
                marginBottom = '1.7vw';
            } else {
                const computedMargin = 1.7 * (3 / numberOfOptions);
                marginBottom = `${computedMargin}vw`;
            }

            output_html = `
                <div class="setting-box">
                <h3 class="settings-label">${display_name}:</h3>
                <div class="outer-radio-button-wrapper">
            `;

            // create first through second-to-last checkboxes
            for (let i = 0; i < check_boxes.length - 1; i++) {
                output_html = output_html + `
                    <div class="inner-radio-button-wrapper" style="margin-bottom: ${marginBottom};">
                    <input
                        type="checkbox"
                        name="${code_name}"
                        value="${check_boxes[i][0]}"
                        class="radio-buttons"
                        id="${code_name}-option-${i + 1}"
                    />
                    <label for="${code_name}-option-${i + 1}" class="radio-button-label"
                        >${check_boxes[i][1]}</label
                    >
                    </div>
                `;
            }

            // create the last checkbox
            output_html = output_html + `
                <div class="inner-radio-button-wrapper last-radio-option">
                <input
                    type="checkbox"
                    name="${code_name}"
                    value="${check_boxes[check_boxes.length - 1][0]}"
                    class="radio-buttons"
                    id="${code_name}-option-${check_boxes.length}"
                />
                <label for="${code_name}-option-${check_boxes.length}" class="radio-button-label"
                    >${check_boxes[check_boxes.length - 1][1]}</label
                >
                </div>
            </div>
            <div
                class="settings-info-button"
                data-tooltip="${tooltip}"
            >
                ?
            </div>
            </div>
            `;

            return output_html;
        }
        else if (setting_obj.type === 'point_check_boxes') { // setting is a user-picked point (_,_) (with a radomize option)
            const {code_names, display_name, tooltip} = setting_obj;

            output_html = `
                <div class="setting-box">
                <h3 class="settings-label">${display_name}:</h3>
                <div id="solution-point-wrapper">
                    (<input
                    type="text"
                    name="${code_names[0]}"
                    class="settings-text-box number-range-box"
                    />,<input
                    type="text"
                    name="${code_names[1]}"
                    class="settings-text-box number-range-box"
                    />)
                </div>
                <div class="settings-checkbox-tab">
                    <input
                    type="checkbox"
                    name="${code_names[2]}"
                    value="is_checked"
                    class="single-settings-checkbox"
                    />Randomize
                </div>
                <div class="settings-info-button" data-tooltip="${tooltip}">?</div>
                </div>
            `;

            return output_html;
        }
    }
}

function currentFormObject() {
    const form = document.getElementById("settings-form");
    const formData = new FormData(form);
    const formObject = {};

    for (const [key, value] of formData.entries()) {
        const inputElements = form.elements[key];

        // Check if the input type is a collection of checkboxes
        const isCheckboxGroup = inputElements && inputElements[0]?.type === "checkbox";

        if (formObject.hasOwnProperty(key)) {
            // Only enforce an array for checkboxes
            if (isCheckboxGroup) {
                formObject[key] = [].concat(formObject[key], value);
            } else {
                formObject[key] = value; // Ensure radios remain a single value
            }
        } else {
            formObject[key] = isCheckboxGroup ? [value] : value;
        }
    }

    return formObject;
}

createEventListeners();

