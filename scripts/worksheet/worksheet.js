import { render } from "./actions/render.js";
import { print } from "./actions/print.js";
import { updateUi } from "./actions/update-ui.js";

export let worksheet = {};

const _editor_functions = {
    createAsEmptyDoc,
    createAsDefault,
    deleteItemAt,
    editTextContent,
    addPageToDoc,
    focusItemAt,
    addSectToPage,
    addContentToSect,
    unshiftOverflowSect
}

export const worksheet_editor = {
    focused_item_ID: null, 
    ...(new Proxy(
        _editor_functions, 
        {
            get: function(target_obj, property) { 
                if (Object.prototype.hasOwnProperty.call(target_obj, property) && property !== 'print') { 
                    return function(...args) { 
                        const return_value = target_obj[property](...args);
                        _editor_functions.focusItemAt(return_value);
                        render(); 
                        updateUi();
                    }
                }
                else return target_obj[property];
            }
        }
    )),
    render,
    print,
    updateUi,
    static_update: _editor_functions,
    getItemById,
    getIdByItem,
    getProblemNumber,
    getItemType
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
    addPageToDoc();
    addSectToPage('page-0');
    addContentToSect('sect-0.0');
    return 'content-0.0.0';
}

function addPageToDoc(method = 'push') {
    // add a page to the document
    // console.log(worksheet.pages[method])

    worksheet.pages[method](
        {
            sects: [],
            settings: {},
        }
    );

    // console.log(worksheet)

    return 'page-' + (worksheet.pages.length - 1); // return the item_ID of the page that got added
}

function addSectToPage(page_item_ID, sect_item = null, method = 'push') {    
    if (sect_item !== null) { // a sect was provided
        worksheet.pages[Number(page_item_ID.split('-')[1])].sects[method](sect_item)
    }
    else { // no sect was provided (use an empty default)
        worksheet.pages[Number(page_item_ID.split('-')[1])].sects[method]({
            content: [],
            settings: {
                directions_text: 'Add problem directions here.',
                height: '0.3in',
                font_size: '0.2in',
                is_block_level: true,
                is_overflow_sect: false,
                parent_sect: null
            }
        });
    }
    
    return `sect-${Number(page_item_ID.split('-')[1])}.${worksheet.pages[Number(page_item_ID.split('-')[1])].sects.length - 1}`;
}

function addContentToSect(sec_item_ID, content_item = null, method = 'push') {
    const [ page_index , sect_index ] = sec_item_ID.split('-')[1].split('.');
    
    if (content_item !== null) {
        worksheet.pages[Number(page_index)].sects[Number(sect_index)].content[method](content_item);
    }
    else {
        worksheet.pages[Number(page_index)].sects[Number(sect_index)].content[method]({
            settings: {
                text_content: '[insert~~problem]',
                font_size: '1cm',
                height: '1.5in',
                is_block_level: false,
                type: 'problem',
                type_display_name: 'Problem',
                mjx_status: 'not-rendered',
                mjx_content: null
            }
        });
    }

    return `content-${page_index}.${sect_index}.${worksheet.pages[Number(page_index)].sects[Number(sect_index)].content.length - 1}`;
}

function deleteItemAt(item_ID) {
    const [ item_type, item_number ] = item_ID.split('-');

    if (item_type === 'document') {
        worksheet = null;
    }
    else if (item_type === 'page') {
        worksheet.pages.splice(Number(item_number), 1);

        return 'document'; 
    }
    else if (item_type === 'sect') {
        const [ page_index, sect_index ] = item_number.split('.');

        worksheet.pages[page_index].sects.splice(sect_index, 1);

        return 'page-' + page_index;
    }
    else if (item_type === 'content') {
        const [ page_index, sect_index, content_index ] = item_number.split('.');
        worksheet.pages[page_index].sects[sect_index].content.splice(content_index, 1);

        return 'sect-' + page_index + '.' + sect_index; 
    }
}

function unshiftOverflowSect(page_ID, base_sect) {
    getItemById(page_ID).sects.unshift({
        content: [],
        settings: {
            is_overflow_sect: true,
            base_sect: base_sect,
            height: '0in',
            is_block_level: true
        }
    });

    return `sect-${page_ID.split('-')[1]}.0`;
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
    const [ item_type, item_number] = item_ID.split('-');

    if (item_type === 'document') {
        if (worksheet !== null) return worksheet;
    }
    else if (item_type === 'page') {       
        if (worksheet.pages[item_number] !== undefined) return worksheet.pages[item_number];
    }
    else if (item_type === 'sect') {
        const [ page_index, sect_index ] = item_number.split('.');
        
        if (
            worksheet.pages[page_index] !== undefined &&
            worksheet.pages[page_index].sects[sect_index] !== undefined
        ) {
            return worksheet.pages[page_index].sects[sect_index];
        }
    }
    else if (item_type === 'content') {
        const [ page_index, sect_index, content_index ] = item_number.split('.');

        if (
            worksheet.pages[page_index] !== undefined &&
            worksheet.pages[page_index].sects[sect_index] !== undefined &&
            worksheet.pages[page_index].sects[sect_index].content[content_index] !== undefined
        ) {
            return worksheet.pages[page_index].sects[sect_index].content[content_index];
        }
    }
    
    return null;
}

function getIdByItem(item_obj) {
    let id_found = false;
    if ('pages' in item_obj) { // document (probably)
        if (item_obj === worksheet) {
            id_found = true;
            return 'document';
        }
    }
    else if ('sects' in item_obj) { // a page (probably)
        while (!id_found) {
            for (let i = 0; i < worksheet.pages.length; i++) {
                if (item_obj === worksheet.pages[i]) { // check for strict (reference) object equality (same obj)
                    id_found = true;
                    return 'page-' + i;
                }
            }
        }
    }
    else if ('content' in item_obj) { // a sect (probably)
        while (!id_found) {
            for (let i = 0; i < worksheet.pages.length; i++) {
                for (let j = 0; j < worksheet.pages[i].sects.length; j++) {
                    if (item_obj === worksheet.pages[i].sects[j]) {
                        id_found = true;
                        return `sect-${i}.${j}`; 
                    }
                }
            }
        }
    }
    else { // a content (probably)
        while (!id_found) {
            for (let i = 0; i < worksheet.pages.length; i++) {
                for (let j = 0; j < worksheet.pages[i].sects.length; j++) {
                    for (let k = 0; k < worksheet.pages[i].sects[j].content.length; k++) {
                        if (item_obj === worksheet.pages[i].sects[j].content[k]) {
                            id_found = true;
                            return `content-${i}.${j}.${k}`;
                        }
                    }
                }
            }
        }
    }

    return null;
}

function getProblemNumber(problem_item) {
    let problem_number = 0;
    let item_found = false;

    for (let i = 0; (i < worksheet.pages.length) && !item_found; i++) {
        for (let j = 0; (j < worksheet.pages[i].sects.length) && !item_found; j++) {
            for (let k = 0; (k < worksheet.pages[i].sects[j].content.length) && !item_found; k++) {
                // for every content item that has type==='problem', iterate the problem number counter
                if (worksheet.pages[i].sects[j].content[k].settings.type === 'problem') problem_number++;
                
                // if the supplied problem item matches the current item, stop counting and return the number
                if (problem_item === worksheet.pages[i].sects[j].content[k]) {
                    item_found = true;
                    return problem_number;
                }
            }
        }
    }

    if (!item_found) {
        console.error('Item=', problem_item, `is not an item of type='problem', or no matching problem item could be found.`);
        return null;
    }
}

function getItemType(item_obj) {
    return getIdByItem(item_obj).split('-')[0];
}

function focusItemAt(item_ID) { 
    worksheet_editor.focused_item_ID = item_ID;
    return item_ID;
}