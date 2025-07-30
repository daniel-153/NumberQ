import time
import logging
import flask
import flask_cors
import importlib
import traceback

# Start the flask server and enable it for all routes (that are defined below)
app = flask.Flask(__name__)

# Enable CORS for http://127.0.0.1:5500 (this is what live server has been hosting on; you have to make sure this matches the live server url)
flask_cors.CORS(app, resources={r"/*": {"origins": "http://127.0.0.1:5500"}})

# Only log requests with errors (instead of making a log every time a request happens)
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

# info that is needed persistently
module_state = {
    "current_gen_name": None,
    "current_verifier_func": None,
    "inner_verify_func": None, 
    "number_of_tests": 0,
    "number_of_FAILED_tests": 0,
    "failed_test_list": [],
    "start_time": float('nan'),
    "is_first_test": True # very first test in a sesssion (with any gen) (never goes back to true)
}

# handle the request from JS -> get the appropriate python verifier, and call + get result of its verify func
@app.route('/dispatch_test', methods=['POST'])
def dispatch_test():
    if module_state["is_first_test"]: # set the start time on the very first test
        module_state["start_time"] = time.time()
    module_state["is_first_test"] = False

    request_content = flask.request.get_json()

    try: # update the verifer func if the gen changed
        if (request_content["gen_name"] != module_state["current_gen_name"]):
            module_state["current_gen_name"] = request_content["gen_name"]
            module_state["current_gen_output_type"] = request_content["gen_output_type"]
            verifer_module = importlib.import_module(f"gen-verifiers.ver{module_state["current_gen_name"][3:]}")
            module_state["inner_verify_func"] = verifer_module.verify
    
            # wrap the verifer function based on its output type
            if module_state["current_gen_output_type"] == 'latex-Q|latex-A': # no additional wrapping
                def wrapped_verifier(*args):
                    return module_state["inner_verify_func"](*args) 
            elif module_state["current_gen_output_type"] == 'canvas-Q|latex-A':
                q_canvas_validator = verifer_module.question_cmds_validator

                def wrapped_verifier(*args):
                    if q_canvas_validator(args[0]) is not True:
                        return f"Question canvas command history is not valid; command history: \n {args[0]}"
                    else: return module_state["inner_verify_func"](*args)       
            elif module_state["current_gen_output_type"] == 'latex-Q|canvas-A':
                a_canvas_validator = verifer_module.answer_cmds_validator

                def wrapped_verifier(*args):
                    if a_canvas_validator(args[1]) is not True:
                        return f"Answer canvas command history is not valid; command history: \n {args[1]}"
                    else: return module_state["inner_verify_func"](*args) 
            elif module_state["current_gen_output_type"] == 'canvas-Q|canvas-A':
                q_canvas_validator = verifer_module.question_cmds_validator
                a_canvas_validator = verifer_module.answer_cmds_validator

                def wrapped_verifier(*args):
                    q_canvas_verify_result = q_canvas_validator(args[0])
                    a_canvas_verify_result = a_canvas_validator(args[1])
                    verification_message = '\n'
                    if q_canvas_verify_result is not True: verification_message += f"Question canvas command history is not valid; command history: \n {args[0]} \n"
                    if a_canvas_verify_result is not True: verification_message += f"Answer canvas command history is not valid; command history: \n {args[1]} \n"

                    if (q_canvas_verify_result is not True) or (a_canvas_verify_result is not True):
                        return verification_message
                    else: module_state["inner_verify_func"](*args) 
            else: raise Exception(f":Gen output type could not be determined; '{request_content["gen_output_type"]}' is not recognized as a valid output type.")

            module_state["current_verifier_func"] = wrapped_verifier
    except Exception as e:
        return flask.jsonify({"test_result": "not_performable", "error": f"could not get verifier module: {e}"})

    try: # call the verifier func + get its result
        verifer_args = None
        if (module_state["inner_verify_func"].__code__.co_argcount == 2): # verifer takes just a question and answer
            verifer_args = [request_content["question"], request_content["answer"]]
        elif (module_state["inner_verify_func"].__code__.co_argcount == 3): # verifier takes a question, answer, and settings
            verifer_args = [request_content["question"], request_content["answer"], request_content["settings"]]

        test_result = module_state["current_verifier_func"](*verifer_args)
        module_state["number_of_tests"] += 1

        if (test_result is None): # successful math verification
            return flask.jsonify({"test_result": "passed"})
        else: # discrepency found in math
            module_state["number_of_FAILED_tests"] += 1
            module_state["failed_test_list"].append([
                ["question", (request_content["question"] if module_state["current_gen_output_type"].startswith('latex-Q') else '__canvas_command_stack__')],
                ["gens-answer", (request_content["answer"] if module_state["current_gen_output_type"].endswith('latex-A') else '__canvas_command_stack__')],
                ["sympy-answer", str(test_result)],
                ["settings", request_content["settings"]],
                ["gen-name", module_state["current_gen_name"]],
                ["_", "________________________________________________________________________________"]
            ])
            return flask.jsonify({"test_result": "failed"})
    except Exception as e:
        return flask.jsonify({"test_result": "not_performable", "error": f"error inside verifier module function: {traceback.format_exc()}"})
        
# if we get a GET request, call the get_status() function (this json (below) will be displayed at http://127.0.0.1:5000/status)
@app.route('/status', methods=['GET'])
def get_status():        
    return flask.jsonify({
        "current_func_being_tested": module_state["current_gen_name"],
        "current_func_output_type": module_state["current_gen_output_type"], 
        "number_of_tests": module_state["number_of_tests"],
        "number_of_FAILED_tests": module_state["number_of_FAILED_tests"],
        "runtime (mins)": (time.time() - module_state["start_time"]) / 60,
        "z_failed_test_list": module_state["failed_test_list"]
    })

# This must be placed after all the app.route definitions
if __name__ == '__main__':
    # Run the Flask app AFTER defining routes
    app.run(debug=True, host="127.0.0.1", port=5000)