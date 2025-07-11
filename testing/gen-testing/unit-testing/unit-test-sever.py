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

# variables that are needed persistently
current_handler_name = None
current_handler_module = None
current_verify_func = None

# handle the request from JS -> get the appropriate python verifier, and call + get result of its verify func
@app.route('/perform_test', methods=['POST'])
def perform_test():
    request_content = flask.request.get_json()
    handler_file_name = request_content.get('handler_file_name')

    if not handler_file_name:
        return flask.jsonify({'test_result': 'failed', 'error': 'Missing handler_file_name'})

    try:
        global current_handler_name, current_handler_module, current_verify_func
        
        if (handler_file_name != current_handler_name):
            current_handler_name = handler_file_name
            current_handler_module = importlib.import_module(f'unit-verifiers.{handler_file_name}')
            current_verify_func = getattr(current_handler_module, 'verify', None)

        if not current_verify_func:
            return flask.jsonify({'test_result': 'failed', 'error': 'No verify() function in module'})

        result = current_verify_func(request_content)
        return flask.jsonify(result)
    except ModuleNotFoundError:
        return flask.jsonify({'test_result': 'failed', 'error': f'No module named unit_verifiers.{handler_file_name}'})
    except Exception as e:
        return flask.jsonify({'test_result': 'failed', 'error': str(e)})

# This must be placed after all the app.route definitions
if __name__ == '__main__':
    # Run the Flask app AFTER defining routes
    app.run(debug=True, host="127.0.0.1", port=5000)