import time
import logging
import sympy as smp
import flask
import flask_cors

# Start the flask server and enable it for all routes (that are defined below)
app = flask.Flask(__name__)

# Enable CORS for specific origin BEFORE starting the server
flask_cors.CORS(app, resources={r"/*": {"origins": "http://127.0.0.1:5500"}})

# Only log requests with errors (instead of making a log every time a request happens)
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

@app.route('/receive-string', methods=['POST', 'OPTIONS'])  # Allow OPTIONS for preflight
def receive_string():
    if flask.request.method == 'OPTIONS':
        # Explicitly allow the request with correct headers
        response = flask.jsonify({'status': 'OK'})
        response.headers.add("Access-Control-Allow-Origin", "http://127.0.0.1:5500")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        return response, 200  # Handle preflight request

    data = flask.request.json  # Get JSON data
    print(data)  # Debugging

    #
    # how much overhead do these lines add? is there any way to avoid them?
    response = flask.jsonify({"status": "processed"})  # Success response
    response.headers.add("Access-Control-Allow-Origin", "http://127.0.0.1:5500")
    #

    return response, 200  

if __name__ == '__main__':
    # Run the Flask app AFTER defining routes
    app.run(debug=True, host="127.0.0.1", port=5000)





# if we get a POST request, call the recieve_string() function
# @app.route('/receive-string', methods=['POST'])
# def receive_string():
#     data = flask.request.json # parse the incomming json into a dictionary
    
#     # extract all parts of the newly recieved question (first arg is the key to look for, second arg is the value to default to if it doesn't exist)
#     question = data.get('question', '')  
#     answer = data.get('answer', '')  
#     settings = data.get('settings', {})  
#     gen_name = data.get('gen_name', '')
    
#     print(data)
    
#     # TODO: this is where we'll have the entry point to the question/answer verification process 
#     # (so that we'll only move to the return below once the question is processed)


#     # indicate that the we are finished processing the question (js sends the next question after recieving this)
#     return {"status": "processed"}, 200  

# if we get a GET request, call the get_status() function
@app.route('/status', methods=['GET'])
def get_status():
    global number_of_tests, failed_Q_list
    # IMPORTANT: you definetly want to put the settings for the failed Qs here so you can actually try to recreate them
    return flask.jsonify({
        "failed_Q_list": failed_Q_list,
        "number_of_tests": number_of_tests,
        "number_of_FAILED_tests": '',
        "runtime (mins)": (time.time() - start_time) / 60
    })


start_time = time.time()
