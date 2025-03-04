import * as settings_templates from '../../settings/setting_templates.js';

const gens = Object.fromEntries(
    await Promise.all([
        import('../../scripts/gen-modules/genAddSub.js').then(m => ['genAddSub', m]),
        import('../../scripts/gen-modules/genMulDiv.js').then(m => ['genMulDiv', m]),
        import('../../scripts/gen-modules/genLinEq.js').then(m => ['genLinEq', m]),
        import('../../scripts/gen-modules/genFacQuad.js').then(m => ['genFacQuad', m]),
        import('../../scripts/gen-modules/genSysEqs.js').then(m => ['genSysEqs', m]),
        import('../../scripts/gen-modules/genSimRad.js').then(m => ['genSimRad', m]),
        import('../../scripts/gen-modules/genTrigEx.js').then(m => ['genTrigEx', m]),
        import('../../scripts/gen-modules/genRatEx.js').then(m => ['genRatEx', m]),
        import('../../scripts/gen-modules/genPolArith.js').then(m => ['genPolArith', m]),
        import('../../scripts/gen-modules/genComArith.js').then(m => ['genComArith', m])
    ])
);

// methods to create the {name: value} pairs to make up the settings object being sent to the gen (including functionality for permutations) 
const nameValueMakers = {
    radio_buttons(setting_name) { // setting_name is the name of an object for a settings field from settings_templates   
        const setting_obj = settings_templates[setting_name];
        
        return {
            name: setting_name,
            valid_input_list: setting_obj.radio_buttons.map(subarray => subarray[0]), // get an array of only the code names of the radio buttons (not the display names too)
            current_index: 0,
            get_current_value() {
                return this.valid_input_list[this.current_index];
            },
            get_next_value() {
                this.current_index = (this.current_index + 1) % this.valid_input_list.length; // move to the next option Or wrap around to index 0
                return this.valid_input_list[this.current_index]; // return the code name for the current radio button 
            }
        };
    },
    check_boxes(setting_name) {
        const setting_obj = settings_templates[setting_name];
        
        return {
            name: setting_name,
            valid_input_list: setting_obj.check_boxes.map(subarray => [subarray[0]]), // get an array of the code names for all the options (but there is one layer of nesting [[a],[b],[c]])
            current_index: 0,
            get_current_value() {
                return this.valid_input_list[this.current_index];
            },
            get_next_value() {
                this.current_index = (this.current_index + 1) % this.valid_input_list.length; // move to the next option Or wrap around to index 0
                return this.valid_input_list[this.current_index]; // return the code name for the current check box (it will come in an array [name])
            }
        };
    },
    single_textbox(setting_name) {
        const setting_obj = settings_templates[setting_name];
        
        function integerArray(min, max) { // helper
            let result = [];
            for (let i = min; i <= max; i++) {
                result.push(i);
            }
            return result;
        }
    
        function removeFromArray(elementsToRemove, array) { // helper
            // Convert single number input to an array
            if (!Array.isArray(elementsToRemove)) {
                elementsToRemove = [elementsToRemove];
            }
        
            return array.filter(item => !elementsToRemove.includes(item));
        }
        
        let input_possibilities; // an array of every valid input to the textbox
        
        if (setting_obj.possible_values !== undefined) { // use the exhuastive list of all input possibilities if provided
            input_possibilities = [...setting_obj.possible_values];
        }
        else { // otherwise create the list based on the min and max of the range & the excluded values
            let excluded_values; // an array of invalid inputs (that would otherwise be valid because they are in the range (special cases))
            
            if (setting_obj.excluded_values !== undefined) { // excluded values were provided
                excluded_values = [...setting_obj.excluded_values];
            }
            else excluded_values = []; // no excluded values were provided   
    
            // create the array of possibilities based on the range and excluded values
            input_possibilities = removeFromArray(excluded_values, integerArray(setting_obj.range[0],setting_obj.range[1]));
        }
        
        return {
            name: setting_name,
            valid_input_list: input_possibilities,
            current_index: 0,
            get_current_value() {
                return this.valid_input_list[this.current_index];
            },
            get_next_value() {
                this.current_index = (this.current_index + 1) % this.valid_input_list.length; // move to the next option Or wrap around to index 0
                return this.valid_input_list[this.current_index]; // return the next valid value for the checkbox
            }
        };
    },
    range_textboxes(setting_name) { // Important: creates TWO settings key-value pairs (since a 'rangeTextBoxes' is basically 2 settings fields)
        const setting_obj = settings_templates[setting_name];
        
        function integerArray(min, max) { // helper
            let result = [];
            for (let i = min; i <= max; i++) {
                result.push(i);
            }
            return result;
        }
        
        let [ box_1_ID, box_2_ID ] = setting_obj.code_names; // get the names of the first and second textbox (strings)
    
        return [
            {
                name: box_1_ID,
                valid_input_list: integerArray(-25, 25),
                current_index: 0,
                get_current_value() {
                    return this.valid_input_list[this.current_index];
                },
                get_next_value() {
                    this.current_index = (this.current_index + 1) % this.valid_input_list.length; // move to the next option Or wrap around to index 0
                    return this.valid_input_list[this.current_index]; // return the next valid value for the checkbox
                }
            },
            {
                name: box_2_ID,
                valid_input_list: integerArray(-25, 25),
                current_index: 0,
                get_current_value() {
                    return this.valid_input_list[this.current_index];
                },
                get_next_value() {
                    this.current_index = (this.current_index + 1) % this.valid_input_list.length; // move to the next option Or wrap around to index 0
                    return this.valid_input_list[this.current_index]; // return the next valid value for the checkbox
                }
            },
        ];
    },
    point_check_boxes(setting_name) { // only sysEqs has this at the moment also (Important): creates THREE settings key-value pairs
        const setting_obj = settings_templates[setting_name];
        
        function integerArray(min, max) { // helper
            let result = [];
            for (let i = min; i <= max; i++) {
                result.push(i);
            }
            return result;
        }
    
        let [ box_1_ID, box_2_ID, checkbox_ID ] = setting_obj.code_names; // get the names of the first and second textbox (strings) & the randomize all checkbox
    
        return [
            {
                name: box_1_ID,
                valid_input_list: integerArray(-20, 20),
                current_index: 0,
                get_current_value() {
                    return this.valid_input_list[this.current_index];
                },
                get_next_value() {
                    this.current_index = (this.current_index + 1) % this.valid_input_list.length; // move to the next option Or wrap around to index 0
                    return this.valid_input_list[this.current_index]; // return the next valid value for the checkbox
                }
            },
            {
                name: box_2_ID,
                valid_input_list: integerArray(-20, 20),
                current_index: 0,
                get_current_value() {
                    return this.valid_input_list[this.current_index];
                },
                get_next_value() {
                    this.current_index = (this.current_index + 1) % this.valid_input_list.length; // move to the next option Or wrap around to index 0
                    return this.valid_input_list[this.current_index]; // return the next valid value for the checkbox
                }
            },
            {
                name: checkbox_ID, 
                valid_input_list: ['is_checked', undefined], // special case for the randomize-box in the solution point for sys-eqs
                current_index: 0,
                get_current_value() {
                    return this.valid_input_list[this.current_index];
                },
                get_next_value() {
                    this.current_index = (this.current_index + 1) % this.valid_input_list.length; // move to the next option Or wrap around to index 0
                    return this.valid_input_list[this.current_index]; // return the code name for the current check box (it will come in an array [name])
                }
            }
        ];
    }
}; // the purpose of all these functions is to standardize/generalize all settings into a 'name' and array of 'valid input values'

// creates an array for all the settings in the following form [[name, settings_obj], [name, settings_obj], ...]
function createSettingsArray(current_module) {
    const setting_names = [...current_module.settings_fields]; // an array of all the names of the settings for the current gen

    let settings_array = [];

    // insert each setting into the settings_array as [name, obj] pairs
    let current_type; // the type of whichever setting we are currently on (radio,checkbox,etc) NOTE: this is the official standard name
    let current_obj; // the object/array comming out of nameValueMakers
    let current_settings_obj; // the actual object storing the setting possibilities, index, and methods (might be the same as current_obj but also might not be)
    for (let i = 0; i < setting_names.length; i++) {
        current_type = settings_templates[setting_names[i]].type;

        current_obj = nameValueMakers[current_type](setting_names[i]); // the object/array yielded by the nameValueMakers functions

        if (Array.isArray(current_obj)) { // nameValueMakers yielded multiple settings fields (and we need to loop over them to insert)
            for (let j = 0; j < current_obj.length; j++) {
                current_settings_obj = current_obj[j];

                settings_array.push([ current_settings_obj.name, current_settings_obj ]);
            }
        }
        else { // nameValueMakers yielded just one settings field (and we can just insert it)
            current_settings_obj = current_obj;
            
            settings_array.push([ current_settings_obj.name, current_settings_obj ]);
        }
    }

    return settings_array;
} // NOTE: settings_obj is the output of nameValueMakers and has the valid_input_list, current_index, and methods for dealing with these

function* generateCombinations(settingsArray) {
    while (true) {
        // Step 1: Create a settings array with current values
        let combination = Object.fromEntries(
            settingsArray.map(([name, settingObj]) => [name, settingObj.get_current_value()])
        );
        yield combination; // Yield the current combination

        // Step 2: Advance to the next setting option (like an odometer)
        let carry = true; // Track if we need to keep incrementing (like an odometer rollover)
        for (let i = settingsArray.length - 1; i >= 0 && carry; i--) {
            let [, settingObj] = settingsArray[i];

            let prevIndex = settingObj.current_index;
            settingObj.get_next_value();
            carry = (settingObj.current_index === 0 && prevIndex !== 0); // If it wrapped, continue
        }
    }
}











