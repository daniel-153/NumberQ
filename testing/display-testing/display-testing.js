import { generate } from '../../scripts/pg-ui/pg-ui.js';
import * as FH from '../../scripts/helpers/form-helpers.js';
import * as GT from '../gen-testing/gen-testing.js';

// module import: const display_testing = await import('http://10.0.0.244:5500/testing/display-testing/display-testing.js');

let test_state = {
    current_gen_name: null,
    current_gen_module: null,
    current_settings_permutator: null,
    question_buffer: [], // first in first out
    testLoopHandler: null,
    test_is_currently_running: false,
    test_loop_timeout: null,
    time_between_tests_ms: 500,
    current_buffer_index: -1,
    current_question_info: null,
    num_completed_tests: 0,
    max_number_of_tests: 500,
    stratify_numerical_ranges: true,
    test_is_primed: false
};
test_state.default_state = JSON.parse(JSON.stringify(test_state));

// navigation + action handlers
document.addEventListener('keydown', (event) => { 
    if (!test_state.test_is_primed) return;
    
    if (event.key === ' ') { // space
        event.preventDefault(); // overwrite scroll (default spacebar action)
        toggleTestLoop();
    }
    else if (event.key === 'ArrowLeft') { // back
        focusPrevQuestion();
    }
    else if (event.key === 'ArrowRight') { // foward
        focusNextQuestion();
    }
    else if (event.key === '/') { // slash
        logCurrentQuestionSettings();
    }

    _updateTestUi();
});

// prime the testing: load + set up everything so that it can start when spacebar is pressed
export async function primeTest() {
    // ensure the pg-ui is currently open
    if (
        !document.getElementById('home-page-content').classList.contains('hidden-content') ||
        document.getElementById('generation-content').classList.contains('hidden-content')
    ) throw new Error('Cannot prime test when pg-ui is not opened.');

    test_state.current_gen_name = document.getElementById('generate-button').getAttribute('data-gen-func-name');
    test_state.current_gen_module = await import(`../../scripts/math-gens/gens/${test_state.current_gen_name}.js`);
    test_state.current_settings_permutator = await GT.getSettingsPermutator(test_state.current_gen_module, test_state.stratify_numerical_ranges);

    test_state.testLoopHandler = async function() {
        const current_settings = test_state.current_settings_permutator.getRandomSettings();
        const input_settings = JSON.parse(JSON.stringify(current_settings)); // may be different from the final settings after validation
        FH.updateFormValues(current_settings, 'settings-form');

        await generate(test_state.current_gen_name);
        
        const rendered_Q = document.getElementById('rendered-Q')
        const rendered_A = document.getElementById('rendered-A')

        test_state.question_buffer.push({
            question_content: rendered_Q.firstElementChild,
            answer_content: rendered_A.firstElementChild,
            input_settings: input_settings,
            final_settings: JSON.parse(JSON.stringify(current_settings)),
            q_font_size: rendered_Q.style.fontSize,
            a_font_size: rendered_A.style.fontSize
        });

        if (test_state.question_buffer.length > 10) test_state.question_buffer.shift(); // maintain no more than 10 question at a time in the buffer (dispose of the oldest one when 10 is exceeded)

        test_state.current_buffer_index = test_state.question_buffer.length - 1; // always set the 'current focused question' to the last one in the buffer (while the test loop is running)

        test_state.num_completed_tests++;

        _updateTestUi();
    }

    // create and insert the small testing ui
    document.body.insertAdjacentHTML('afterbegin', `
        <div
        id="display-test-info-wrapper"
        style="
            z-index: 1000000;
            position: absolute;
            display: flex;
            flex-direction: row;
            width: 20vw;
            height: 5vw;
            top: 2vw;
            left: calc(50vw - 20vw / 2);
            border: 3px solid rgb(222, 45, 9);
            background-color: white;
        "
        >
        <div
            style="
            width: 50%;
            height: 100%;
            border: 1px solid black;
            display: flex;
            flex-direction: column;
            "
        >
            <div
            style="
                width: 100%;
                height: 20%;
                font-size: 1vw;
                font-weight: 800;
                text-align: center;
            "
            >
            Buffer Location:
            </div>
            <div
            id="buffer-location-counter"
            style="
                width: 100%;
                height: 80%;
                font-size: 3vw;
                text-align: center;
                border-top: 1px solid black;
            "
            >
            0
            </div>
        </div>
        <div
            style="
            width: 50%;
            height: 100%;
            border: 1px solid black;
            display: flex;
            flex-direction: column;
            "
        >
            <div
            style="
                width: 100%;
                height: 20%;
                font-size: 1vw;
                font-weight: 800;
                text-align: center;
            "
            >
            Number of Tests:
            </div>
            <div
            id="number-of-tests-counter"
            style="
                width: 100%;
                height: 80%;
                font-size: 3vw;
                text-align: center;
                border-top: 1px solid black;
            "
            >
            0
            </div>
        </div>
        </div>
    `);

    test_state.test_is_primed = true;
}

function _updateTestUi() {
    document.getElementById('buffer-location-counter').innerHTML = test_state.current_buffer_index + 1 - test_state.question_buffer.length;
    document.getElementById('number-of-tests-counter').innerHTML = test_state.num_completed_tests;
}

// change the delay between each test
export function updateTestFrequencyMS(new_frequency_ms) {
    if (!Number.isNaN(new_frequency_ms) && new_frequency_ms > 0) {
        test_state.time_between_tests_ms = new_frequency_ms;
    }
    else {
        throw new Error(`Cannot set test frequency to '${new_frequency_ms}' typeof '${typeof(new_frequency_ms)}'; test frequency must be a positive number.`)
    }
}

// change the maximum number of tests (automatic stopping point)
export function updateMaxNumberOfTests(new_max_tests) {
    if (Number.isSafeInteger(new_max_tests) && new_max_tests > 0) {
        test_state.max_number_of_tests = new_max_tests;
    }
    else {
        throw new Error(`Cannot set max number of tests to '${new_max_tests}' typeof '${typeof(new_max_tests)}'; max number of tests must be a positive integer.`)
    }
}

// change whether numerical ranges are stratified
export function updateSettingsStratification(stratify_numerical_ranges) {
    if (typeof(stratify_numerical_ranges) === 'boolean') {
        test_state.stratify_numerical_ranges = stratify_numerical_ranges;
    }
    else {
        throw new Error(`Cannot set stratify_numerical_ranges to '${stratify_numerical_ranges}' typeof '${typeof(stratify_numerical_ranges)}'; stratify_numerical_ranges must be a boolean.`)
    }
}

// spacebar system -> start and stop
export function toggleTestLoop() { // (start and stop)
    if (test_state.test_is_currently_running) { // stop
        clearTimeout(test_state.test_loop_timeout);

        test_state.test_is_currently_running = false;
    }
    else { // start        
        (function loopTimeout() {
            if (test_state.num_completed_tests < test_state.max_number_of_tests - 1) {
                test_state.test_loop_timeout = setTimeout(() => {
                    test_state.testLoopHandler();
                    loopTimeout();
                }, test_state.time_between_tests_ms);
            }
            else test_state.test_is_currently_running = false;
        })();

        test_state.test_is_currently_running = true;
    }
}

// display the current focused question (used with the arrow navigation below)
export function displayCurrentQuestion() {
    const rendered_Q = document.getElementById('rendered-Q');
    const rendered_A = document.getElementById('rendered-A');

    rendered_Q.innerHTML = '';
    rendered_A.innerHTML = '';

    rendered_Q.appendChild(test_state.current_question_info.question_content);
    rendered_A.appendChild(test_state.current_question_info.answer_content);

    rendered_Q.style.fontSize = test_state.current_question_info.q_font_size;
    rendered_A.style.fontSize = test_state.current_question_info.a_font_size;

    FH.updateFormValues(test_state.current_question_info.final_settings, 'settings-form');
}

// log the settings that produced the current question
export function logCurrentQuestionSettings() {
    console.log('------------------------------------------------------------');
    console.log('input settings:');
    console.log(test_state.current_question_info.input_settings);
    console.log('final settings:');
    console.log(test_state.current_question_info.final_settings);
    console.log('------------------------------------------------------------');
}

// arrow system -> go back up to 9 questions in the past
export function focusPrevQuestion() {
    if (test_state.test_is_currently_running) {
        throw new Error('Cannot navigate to previous question when test loop is currently running. Stop test loop first.');
    }
    else if (test_state.current_buffer_index === 0) {
        throw new Error(`Failed to navigate to previous question: the current buffer location is [${test_state.current_buffer_index + 1 - test_state.question_buffer.length}] (this is the *last* saved question in the buffer).`);
    }
    else {
        test_state.current_question_info = test_state.question_buffer[--test_state.current_buffer_index];

        displayCurrentQuestion();
    }
}

export function focusNextQuestion() {
    if (test_state.test_is_currently_running) {
        throw new Error('Cannot navigate to next question when test loop is currently running. Stop test loop first.');
    }
    else if (test_state.current_buffer_index === test_state.question_buffer.length - 1) {
        throw new Error(`Failed to navigate to next question: the current buffer location is [${test_state.current_buffer_index + 1 - test_state.question_buffer.length}] (this is the *first* saved question in the buffer).`);
    }
    else {
        test_state.current_question_info = test_state.question_buffer[++test_state.current_buffer_index];

        displayCurrentQuestion();
    }
}

// ability to reset everything (start a new test without reloading the page and having to use the import again)
export function resetTestState() {
    // ensure testing is stopped
    clearTimeout(test_state.test_loop_timeout);

    // remove ui indicators
    document.getElementById('display-test-info-wrapper').remove();

    // reset the test_state to defaults
    test_state = test_state.default_state;
    test_state.default_state = JSON.parse(JSON.stringify(test_state));
}