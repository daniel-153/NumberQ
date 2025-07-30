class CmdPath:
    def __init__(self, relative_cmd_index, arg_index = 0):
        self.relative_cmd_index = relative_cmd_index # relative to the current command (so -1 would be the cmd immediately before, -2 two before, etc)
        self.arg_index = arg_index

def number(n):
    return isinstance(n, (int, float)) and not isinstance(n, bool)

def pos_number(n):
    return (number(n) and n > 0)

def image(dictionary_img_data):
    return (
        (dictionary_img_data['identifier_note'] == 'mjx_image' and isinstance(dictionary_img_data['data']['latex_code'], str)) or
        (dictionary_img_data['identifier_note'] == 'null_image')
    )

def resolve_cmd_path(cmd_stack, cmd_path, current_cmd_index):
    absolute_index = current_cmd_index + cmd_path.relative_cmd_index

    if cmd_stack[absolute_index]['action'] == 'method_call':
        return cmd_stack[absolute_index]['args'][cmd_path.arg_index]
    elif cmd_stack[absolute_index]['action'] == 'property_set' or cmd_stack[absolute_index]['action'] == 'canvas_modification':
        if cmd_path.arg_index != 0: raise Exception(f"Relative path to a property_set or canvas_modification cannot have an arg index of '{cmd_path.arg_index}'")

        return cmd_stack[absolute_index]['new_value']
    
def arg_is_valid(actual_arg, validator_arg, running_cmd_stack, cmd_index):
    if isinstance(validator_arg, CmdPath): # validate via path to another arg
        return (actual_arg == resolve_cmd_path(running_cmd_stack, validator_arg, cmd_index))
    elif callable(validator_arg): # validate by provided func
        return (validator_arg(actual_arg) is True)
    else: # validate by value
        return (actual_arg == validator_arg)

def cmd_history_is_valid(cmd_history, cmd_history_validator):
    running_cmd_stack = []

    if len(cmd_history) != len(cmd_history_validator): return False
    for cmd_index in range(0, len(cmd_history_validator)):
        actual_cmd = cmd_history[cmd_index]
        validator_cmd = cmd_history_validator[cmd_index]

        if actual_cmd == validator_cmd: # actual command exactly equal to the one in the validator
            running_cmd_stack.append(actual_cmd)
        else: # commands need to be compared relatively (by validator function or paths) Or they aren't equal
            if validator_cmd['action'] != actual_cmd['action']: return False # actions don't match (test failed - no further checks)
            elif validator_cmd['action'] == 'method_call':
                if validator_cmd['method_name'] != actual_cmd['method_name']: return False # method names don't match 
                
                validator_args_arr = validator_cmd['args']
                for arg_index in range(0, len(validator_args_arr)):
                    actual_arg = actual_cmd['args'][arg_index]
                    validator_arg = validator_cmd['args'][arg_index]

                    if arg_is_valid(actual_arg, validator_arg, running_cmd_stack, cmd_index) is not True: return False # validate each arg
            elif validator_cmd['action'] == 'property_set' or validator_cmd['action'] == 'canvas_modification':
                if validator_cmd['property_name'] != actual_cmd['property_name']: return False # property names don't match 

                actual_value = actual_cmd['new_value']
                validator_value = validator_cmd['new_value']

                if arg_is_valid(actual_value, validator_value, running_cmd_stack, cmd_index) is not True: return False # validate the new value for the prop

            running_cmd_stack.append(actual_cmd) # only reachable if command was valid

    return True # only reachable if all commands were valid

def build_cmd_history_validator(cmd_history_validator_list):
    def validator(cmd_history):
        return cmd_history_is_valid(cmd_history, cmd_history_validator_list)
    
    return validator


