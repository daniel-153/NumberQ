import time
import logging
import flask
import flask_cors
import importlib

# Start the flask server and enable it for all routes (that are defined below)
app = flask.Flask(__name__)

# Enable CORS for http://127.0.0.1:5500 (this is what live server has been hosting on; you have to make sure this matches the live server url)
flask_cors.CORS(app, resources={r"/*": {"origins": "http://127.0.0.1:5500"}})

# Only log requests with errors (instead of making a log every time a request happens)
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

# variables that we need globally
start_time = time.time()
current_gen_name = None
current_verifier = None
failed_Q_list = []
number_of_tests = 0
number_of_fails = 0

# Call recieve string when we get a POST or OPTIONS request
@app.route('/receive-string', methods=['POST', 'OPTIONS'])  # Allow OPTIONS for a precheck that the chrome browser does
def receive_string():
    # handle the initial 'preflight' request (only happens at the start of a session)
    if flask.request.method == 'OPTIONS':
        # Explicitly allow the request with correct headers
        response = flask.jsonify({'status': 'OK'})
        response.headers.add("Access-Control-Allow-Origin", "http://127.0.0.1:5500")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        return response, 200  # Handle preflight request

    # handle the normal request for question verification
    global current_gen_name, current_verifier, number_of_tests, number_of_fails 

    recieved_json = flask.request.json  # Get JSON data (looks like { question, answer, settings, gen_name})

    # check if the current_gen_name needs to be set (if this is the first run or if we switched to a new gen)
    if (current_gen_name is None or current_gen_name != recieved_json["gen_name"]): 
        current_gen_name = recieved_json["gen_name"] # set to genAddSub, genMulDiv, etc
        current_verifier = importlib.import_module(f"gen-verifiers.ver{current_gen_name[3:]}").verify # get the correct verify function

    test_result = current_verifier(recieved_json["question"], recieved_json["answer"])

    number_of_tests += 1
    if (test_result is not None): # answers DON'T match (and we need to log the incorrect info)
        number_of_fails += 1

        failed_Q_list.append(
            [
                ["question", recieved_json["question"]],
                ["gens-answer", str(recieved_json["answer"])],
                ["sympy-answer", str(test_result)],
                ["settings", recieved_json["settings"]], 
                ["gen-name", current_gen_name]
            ]
        )

    response = flask.jsonify({"status": "processed"})  # Success response (indicate the question has been processed)
    response.headers.add("Access-Control-Allow-Origin", "http://127.0.0.1:5500")

    return response, 200  

# if we get a GET request, call the get_status() function (this json (below) will be displayed in http://127.0.0.1:5000/status)
@app.route('/status', methods=['GET'])
def get_status():        
    return flask.jsonify({ 
        "number_of_tests": number_of_tests,
        "number_of_FAILED_tests": number_of_fails,
        "runtime (mins)": (time.time() - start_time) / 60,
        "failed_Q_list": failed_Q_list
    })

# This must be placed after all the app.route definitions
if __name__ == '__main__':
    # Run the Flask app AFTER defining routes
    app.run(debug=True, host="127.0.0.1", port=5000)




