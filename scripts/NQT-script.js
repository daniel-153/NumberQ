function createEventListeners() {
    preloadModules();

    // This is the auto text-fitter
    // NOTE: when you go to the other gens/mobile, you need to somehow supply the initial font size specific to each gen 
    // (right now, 3vw is the global default). And you'll probably also need to put this on the rendered and un-rendered answer boxes
    observeTextChanges(document.getElementById('rendered-Q'), '3vw');
    observeTextChanges(document.getElementById('un-rendered-Q'), '1.2vw');

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
        });
    });

    window.addEventListener('popstate',() => {
        document.getElementById('home-page-content').classList.remove('hidden-content');
        document.getElementById('generation-content').classList.add('hidden-content');
        document.getElementById('FAQ-page').classList.add('hidden-content');
        history.pushState({ page: 'generator' }, '', '');
    });

    document.getElementById('back-arrow-p-modes').addEventListener('click', () => {
        document.getElementById('home-page-content').classList.toggle('hidden-content');
        document.getElementById('generation-content').classList.toggle('hidden-content'); 
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
            answerIsShown = true;
        }
        else {
            document.getElementById('fullscreen-answer').style.background = '';
            document.getElementById('fullscreen-answer').style.color = '';
            document.getElementById('show-hide-button').innerHTML = 'Show';
            document.getElementById('show-hide-button').removeAttribute('data-status');
            answerIsShown = false;
        }
    });

    document.getElementById('fullscreen-mode-button').addEventListener('click', () => {
        document.getElementById('presenation-content').classList.toggle('hidden-content');
        observeTextChanges(document.getElementById('fullscreen-question'), '3.75vw');

        // Same as else{} just above^ (hackfix)
        document.getElementById('fullscreen-answer').style.background = '';
        document.getElementById('fullscreen-answer').style.color = '';
        document.getElementById('show-hide-button').innerHTML = 'Show';
        document.getElementById('show-hide-button').removeAttribute('data-status');
        answerIsShown = false;
    });

    document.getElementById('fullscreen-exit-button').addEventListener('click', () => {
        document.getElementById('presenation-content').classList.toggle('hidden-content');
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
    const module = await import(`./modules_w-sets/${funcName}.js`);  
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
    });

    switchToNewQuestion(currentGen(pre_settings)); 

    cleanedFromListeners(document.getElementById("generate-button")).addEventListener("click", async () => {
        if (!document.getElementById('randomize-all-checkbox').checked) {
            const currentSettings = Object.fromEntries((new FormData(document.getElementById('settings-form'))).entries());
            switchToNewQuestion(currentGen(currentSettings)); 
        } // randomize_all isn't checked -> use provided settings
        else {
            const currentSettings = currentModule.get_rand_settings();
            switchToNewQuestion(currentGen(currentSettings));
        } // randomize_all is checked -> use random (pre-set) settings
    });
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
    
    document.getElementById('rendered-Q').innerHTML = '\\(' + question + '\\)';
    document.getElementById('un-rendered-Q').innerHTML = TeXquestion;
    document.getElementById('rendered-A').innerHTML = '\\(' + answer + '\\)';
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

    document.getElementById('fullscreen-question').innerHTML = '\\(' + question + '\\)';
    document.getElementById('fullscreen-answer').innerHTML = '\\(' + answer + '\\)';

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
        const element = form.elements[setting_name];

        if (!element) {
            // there used to be a warning here saying there was no element by name of error_locations. Why was 'error_locations' ever here?
            continue;
        }

        // Handle input types
        if (element.type === 'checkbox') {
            element.checked = Boolean(value);
        } else if (element.type === 'radio') {
            // For radio buttons, select the one matching the value
            const radio = form.querySelector(`input[name="${setting_name}"][value="${value}"]`);
            if (radio) {
                radio.checked = true;
            }
        } else if (element.type === 'select-multiple') {
            // Handle multi-selects
            for (const option of element.options) {
                option.selected = Array.isArray(value) && value.includes(option.value);
            }
        } else {
            // Default: Set value for text, number, select-one, etc.
            element.value = value;
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

function observeTextChanges(element, initial_font_size) {
    const originalFontSize = initial_font_size !== undefined ? initial_font_size : "3vw"; // Define your original font size
  
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
        container.style.fontSize = newFontSize + "px";
  
        // Break loop if scale factor is minimal
        if (scaleFactor >= 1) break;
      }
    }
  
    // Function to clean the element from existing MutationObservers
    function cleanFromListeners(el) {
      const clone = el.cloneNode(true);
      el.parentNode.replaceChild(clone, el);
      return clone;
    }
  
    // Clean the element to remove existing listeners
    element = cleanFromListeners(element);
  
    // Run the downsizing logic immediately if there’s overflow
    fitTextToDiv(element);
  
    // MutationObserver to detect changes in text content
    const observer = new MutationObserver(() => {
      fitTextToDiv(element); // Adjust font size when content changes
    });
  
    observer.observe(element, { characterData: true, childList: true, subtree: true });
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

    // function that generates the html for each settings field
    function createSettingHtml(setting_obj) {
        let output_html; // string that will hold the form element that is created
    
        // setting is a collection of radio buttons
        if (setting_obj.type === 'radio_buttons') {
            const {code_name, display_name, radio_buttons, tooltip } = setting_obj;
    
            output_html = `
                <div class="setting-box">
                <h3 class="settings-label">${display_name}:</h3>
                <div class="outer-radio-button-wrapper">
            `;
    
            // create first through second-to-last radio buttons
            for (let i = 0; i < radio_buttons.length - 1; i++) {
                output_html = output_html + `
                    <div class="inner-radio-button-wrapper">
                    <input
                        type="radio"
                        name="${code_name}"
                        value="${radio_buttons[i][0]}"
                        class="radio-buttons"
                        id="${code_name}-option-${i + 1}"
                    />
                    <label for="${code_name}-option-${i + 1}" class="radio-button-label"
                        >${radio_buttons[i][1]}</label
                    >
                    </div>
                `;
            }
    
            // create the last radio button
            output_html = output_html + `
                <div class="inner-radio-button-wrapper last-radio-option">
                <input
                    type="radio"
                    name="${code_name}"
                    value="${radio_buttons[radio_buttons.length - 1][0]}"
                    class="radio-buttons"
                    id="${code_name}-option-${radio_buttons.length}"
                />
                <label for="${code_name}-option-${radio_buttons.length}" class="radio-button-label"
                    >${radio_buttons[radio_buttons.length - 1][1]}</label
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
        else if (setting_obj.type === 'range_textboxes') { // settings is a range textbox (two textboxes)
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
    }
}

createEventListeners();

