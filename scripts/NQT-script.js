function createEventListeners() {
    preloadModules();

    [...document.getElementsByClassName('start-button')].forEach((element) => {
        element.addEventListener(
            'click',
            () => {
                document.getElementById('home-page-content').classList.toggle('hidden-content');
                document.getElementById('generation-content').classList.toggle('hidden-content');
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
    switchToNewQuestion(currentGen(pre_settings)); 
    updateSettings(pre_settings); 

    cleanedFromListeners(document.getElementById("generate-button")).addEventListener("click", async () => {
        const currentSettings = Object.fromEntries((new FormData(document.getElementById('settings-form'))).entries());
        switchToNewQuestion(currentGen(currentSettings));
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
    const error_locations = newQuestion.error_locations;
    if (error_locations.length > 0) {
        updateSettings(newQuestion.settings);

    }
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

    for (const [key, value] of Object.entries(settings)) {
        const element = form.elements[key];

        if (!element) {
            console.warn(`No form element found with the name '${key}'.`);
            continue;
        }

        // Handle input types
        if (element.type === 'checkbox') {
            element.checked = Boolean(value);
        } else if (element.type === 'radio') {
            // For radio buttons, select the one matching the value
            const radio = form.querySelector(`input[name="${key}"][value="${value}"]`);
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


createEventListeners();

// test