export const status = {
    number_of_tests: 0,
    handler_file_name: null,
    is_currently_testing: false
};

// Module import: const unit_testing = await import('http://127.0.0.1:5500/testing/gen-testing/unit-testing/unit-testing.js')
export async function beginTestLoop(handler_file_name, end_on_failed_test = true, starting_test_number = 1) {
    // get the test generator function (calling next().value gets an the next test_data_obj)
    let test;
    try {
        test = (await import(`./unit-test-handlers/${handler_file_name}.js`)).test;
    } catch (error) {
        console.error(error);
        console.error('Failed to get test generator from handler file with name: ',handler_file_name);
        return;
    }
    
    status.handler_file_name = handler_file_name;
    status.is_currently_testing = true;

    // "fast foward" to the specified starting test number
    for (let i = 1; i < starting_test_number; i++) test.next();

    try {
        let generator_yield;
        while (!(generator_yield = test.next()).done) {
            const test_data_obj = generator_yield.value;
            test_data_obj.handler_file_name = handler_file_name;

            // send the test data obj to the python server, wait for the response, turn the result data part of the response into a JS object
            const response = await fetch('http://127.0.0.1:5000/perform_test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(test_data_obj)
            });

            const result_data_obj = await response.json();

            if (result_data_obj.test_result === 'failed' && result_data_obj.error !== undefined) { // error in processing the test on python end
                throw new Error(`Test could not be performed: ${result_data_obj.error}`);
            }
            else if (result_data_obj.test_result === 'failed') { // failure in math verification
                status.number_of_tests++;
                handleFailedTest(test_data_obj, result_data_obj);
                
                if (end_on_failed_test) {
                    status.is_currently_testing = false;
                    break;
                }
            } 
            else if (result_data_obj.test_result === 'passed') { // success in math verification
                status.number_of_tests++;
                continue;
            }
            else throw new Error('Could not parse test result data object: ',JSON.stringify(result_data_obj)); 
        }
    } catch (error) {
        status.is_currently_testing = false;
        console.error(`Error in creating, sending, or recieving test #${status.number_of_tests + 1}: `, error);
        return;
    }

    handleTestFinish();
}

function handleFailedTest(test_data_obj, result_data_obj) {
    console.log(`
        Test ${status.number_of_tests} with ${status.handler_file_name} failed:
        Test Data: ${JSON.stringify(test_data_obj, null, 2)},
        Test Result: ${JSON.stringify(result_data_obj, null, 2)}
    `);
}

function handleTestFinish() {
    status.is_currently_testing = false;
    console.log(`${status.number_of_tests} tests with ${status.handler_file_name} completed.`)
}