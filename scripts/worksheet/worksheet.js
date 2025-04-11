import { render } from "./render.js";
import { print } from "./print.js";
import { updateUi } from "./update-ui.js";

export let worksheet = null;

const _editor_functions = {
    createAsEmptyDoc,
    createAsDefault,
    appendItemAt,
    deleteItemAt,
    editTextContent
}

export const worksheet_editor = {
    static_update: _editor_functions,
    ...(new Proxy(
        _editor_functions, 
        {
            get: function(target_obj, property) { 
                if (Object.prototype.hasOwnProperty.call(target_obj, property) && property !== 'print') { 
                    return function(...args) { 
                        const return_value = target_obj[property](...args); 
                        render(); 
                        updateUi();
                        return return_value;
                    }
                }
                else return target_obj[property];
            }
        }
    )),
    worksheet: worksheet,
    focused_item_ID: null, 
    render: render,
    print: print,
    updateUi: updateUi,
    getItemById: getItemById,
    getIdByItem: getIdByItem,
    getProblemNumber: getProblemNumber
};

// Editor Functions:
function createAsEmptyDoc() {
    worksheet = {
        pages: [],
        settings: {},
    };
}

function createAsDefault() { 
    createAsEmptyDoc();
    appendItemAt('document');
}

function appendItemAt(item_ID, method = 'push') {
    const [ item_type, item_number ] = item_ID.split('-');

    if (item_type === 'document') {
        // add a page to the document
        worksheet.pages[method](
            {
                content: [],
                settings: {},
            }
        );

        return 'page-' + (worksheet.pages.length - 1); // return the item_ID of the page that got added
    }
    else if (item_type === 'page') {
        worksheet.pages[Number(item_number)].content[method]({
            settings: {
                text_content: '[insert]',
                font_size: '1cm',
                type: 'question',
                mjx_status: 'not-rendered',
                mjx_content: null
            },
        });

        return 'content-' + item_number + '.' + (worksheet.pages[Number(item_number)].content.length - 1); // return the item_ID of the content that got added
    }
}

function deleteItemAt(item_ID) {
    const [ item_type, item_number ] = item_ID.split('-');

    if (item_type === 'document') {
        worksheet = null;
    }
    else if (item_type === 'page') {
        worksheet.pages.splice(Number(item_number), 1);

        return 'document'; // indicate the focus should be "moved" to the docuement
    }
    else if (item_type === 'content') {
        const [ page_index, content_index ] = item_number.split('.');
        worksheet.pages[page_index].content.splice(content_index, 1);

        return 'page-' + page_index; // indicate the focus should be "moved" to the page where the content got deleted
    }
}

function editTextContent(item_ID, value) {
    if (item_ID.split('-')[0] !== 'content') {
        console.error("Cannot call 'editTextContent()' on docuement or page");
        return;
    }

    const content_item = getItemById(item_ID);

    content_item.settings.text_content = value;
    content_item.settings.mjx_status = 'not-rendered';
    content_item.settings.mjx_content = null;
}

// Util Functions:
function getItemById(item_ID) {
    const [ item_type, item_number ] = item_ID.split('-');

    if (item_type === 'document') {
        if (worksheet !== null) return worksheet;
    }
    else if (item_type === 'page') {
        if (worksheet.pages[item_number] !== undefined) return worksheet.pages[item_number];
    }
    else if (item_type === 'content') {
        const [ page_index, content_index ] = item_number.split('.');
        
        if (
            worksheet.pages[page_index] !== undefined &&
            worksheet.pages[page_index].content[content_index] !== undefined
        ) {
            return worksheet.pages[page_index].content[content_index];
        }
    }
    
    return null;
}

function getIdByItem(item_obj) {
    let id_found = false;
    if ('pages' in item_obj) {
        if (item_obj === worksheet) {
            id_found = true;
            return 'document';
        }
    }
    else if ('content' in item_obj) {
        while (!id_found) {
            for (let i = 0; i < worksheet.pages.length; i++) {
                if (item_obj === worksheet.pages[i]) { // check for strict (reference) object equality (same obj)
                    id_found = true;
                    return 'page-' + i;
                }
            }
        }
    }
    else {
        while (!id_found) {
            for (let i = 0; i < worksheet.pages.length; i++) {
                for (let j = 0; j < worksheet.pages[i].content.length; j++) {
                    if (item_obj === worksheet.pages[i].content[j]) {
                        id_found = true;
                        return 'content-' + i +'.' + j;
                    }
                }
            }
        }
    }

    return null;
}

function getProblemNumber(item) {
    let problem_number = 0;
    let item_found = false;
    for (let i = 0; i < worksheet.pages.length; i++) {
        for (let j = 0; j < worksheet.pages[i].content.length; j++) {
            problem_number++;
            if (item === worksheet.pages[i].content[j]) {
                item_found = true;
                break;
            }
        }
        if (item_found) break;
    }
    
    return problem_number;
}