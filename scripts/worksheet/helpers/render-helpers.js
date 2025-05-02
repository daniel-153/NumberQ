import { worksheet_editor, worksheet }  from '../worksheet.js';

const IWH = { // insertWorksheetHtml helpers
    addMainHeader: function(settings) {
        return `
            <div class="ws-page-header">
                <div class="ws-header-wrapper" data-item-id="document">
                    <div class="ws-header-top-box">
                        <div class="ws-course-name">
                            Algebra 2
                        </div>
                        <div class="ws-name-period-wrapper">
                            <div class="ws-name-period-label">
                                Name:
                            </div>
                            <div class="ws-name-box">
                            </div>
                            <div class="ws-name-period-label">
                                Period:
                            </div>
                            <div class="ws-period-box">
                            </div>
                        </div>
                    </div>
                    <div class="ws-header-bottom-box">
                        <div class="ws-assignment-title">
                            Systems of Equations
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    createProblemBox: function(problem_item) {
        return `
            <div class="problem-box half-width-box" data-item-ID="${worksheet_editor.getIdByItem(problem_item)}" style="min-height: ${problem_item.settings.height}; max-height: ${problem_item.settings.height};">
                <div class="problem-number">${worksheet_editor.getProblemNumber(problem_item)})</div>
                <div class="problem-tex" data-math-container="true" style="font-size: ${problem_item.settings.font_size};"></div>
            </div> 
        `;
    },
    createDirectionsBox: function(sect_item) {
        return `
            <div 
                class="directions-box" data-item-ID="${worksheet_editor.getIdByItem(sect_item)}"
                style="font-size: ${sect_item.settings.font_size}; min-height: ${sect_item.settings.height}; max-height: ${sect_item.settings.height};"
            >
                ${sect_item.settings.directions_text}   
            </div>
        `;  
    },
    createPageFwbbs: function(page_item) {
        const sect_array = page_item.sects;
        const page_settings = page_item.settings; // in case there are page settings that may add fwbbs (in the future)

        let fwbb_html_string = '';

        // (for every sect on the current page)
        for (let sect_index = 0; sect_index < sect_array.length; sect_index++) {
            const current_sect = sect_array[sect_index];

            // create a directions box as hide_directions is false
            if (!current_sect.settings.hide_directions) {
                fwbb_html_string += `
                    <div class="full-width-bounding-box">
                        ${IWH.createDirectionsBox(current_sect)}
                    </div>
                `;
            }
            
            // (for every content item in the current sect) 
            for (let content_index = 0; content_index < sect_array[sect_index].content.length; content_index++) {
                const current_content = sect_array[sect_index].content[content_index];
                const next_content = sect_array[sect_index].content[content_index + 1];
                
                if (
                    current_content.settings.type === 'problem' && 
                    next_content !== undefined &&
                    next_content.settings.type === 'problem'
                ) {
                    fwbb_html_string += `
                        <div class="full-width-bounding-box">
                            ${IWH.createProblemBox(current_content)}
                            ${IWH.createProblemBox(next_content)}
                        </div>
                    `;

                    content_index++; // jump ahead by one content item because we added 2
                }
                else if (current_content.settings.type === 'problem') {
                    fwbb_html_string += `
                        <div class="full-width-bounding-box">
                            ${IWH.createProblemBox(current_content)}
                        </div>
                    `;
                }
                else {

                }
            }
        }

        return fwbb_html_string;   
    }
}
export function insertWorksheetHtml() {    
    let updated_html = '';
    for (let page_index = 0; page_index < worksheet.pages.length; page_index++) {
        updated_html += `
            <div class="worksheet-page-wrapper">
                <div class="worksheet-page" style="padding: 0.5in 0.5in 0.5in 0.5in;">
        `;

        // add the header on the first page
        let page_content_height = '10in'; // temp hackfix (you need to figure out how big the header is or this will break)
        if (page_index === 0) {
            updated_html += IWH.addMainHeader();
            page_content_height = '9in';
        }

        updated_html += `<div class="worksheet-page-content-area" style="height: ${page_content_height}">`;

        // add the fwbb's on each page
        updated_html += IWH.createPageFwbbs(worksheet.pages[page_index]);
        
        updated_html += '</div></div></div>';
    }

    updated_html += '<div id="worksheet-preview-bottom">&nbsp;</div>'; // add space below very last page
    document.getElementById('worksheet-page-column').innerHTML = updated_html;
}

export function handleTexUpdates() {
    [...document.getElementsByClassName('problem-box')].forEach(content_box => {
        // make sure we filter out any content that isn't a question
        const current_item = worksheet_editor.getItemById(content_box.getAttribute('data-item-ID'));
        if (current_item.settings.type !== 'problem') return;

        const tex_container = content_box.lastElementChild;
        
        if (current_item.settings.mjx_status === 'rendered') {
            tex_container.innerHTML = current_item.settings.mjx_content;
        }
        else if (current_item.settings.mjx_status === 'not-rendered') {
            tex_container.innerHTML = `\\(${current_item.settings.text_content}\\)`;
            MathJax.typesetPromise([tex_container]);
            current_item.settings.mjx_status = 'rendered';
            current_item.settings.mjx_content = tex_container.innerHTML;
        }
    });
}

const PCH = { // pushContentOverflow helpers
    forEachPage: function(callBack) {
        const page_element_list = [...document.getElementsByClassName('worksheet-page-content-area')];
        const num_pages = worksheet.pages.length;

        for (let page_index = 0; page_index < num_pages; page_index++) {
            // assign all these to the correct values
            const current_page_item = worksheet.pages[page_index];
            const next_page_item = worksheet.pages[page_index + 1];
            const current_page_element = page_element_list[page_index];
            
            // pass them to the provided function
            callBack(current_page_item, next_page_item, current_page_element);
        }
    },
    getInnerPageHeight: function(page_element) { // get the height of the content area on the page (exclude the 'margins' (padding))
        const page_styles = getComputedStyle(page_element)
        
        return parseFloat(page_styles.height) - (parseFloat(page_styles.paddingTop) + parseFloat(page_styles.paddingBottom));
    },
    getInToPx: function() { 
        // use the first page to find out what the current (in) to (px) conversion is 
        const test_element = [...document.getElementsByClassName('worksheet-page-content-area')][0];
        const element_styles = getComputedStyle(test_element);

        return parseFloat(element_styles.height) / Number(test_element.style.height.split('i')[0]); // (CSS px per inch on the current screen)
    },
    getFwbbHeightsSum: function(fwbb_list) {
        let sum_of_heights = 0;

        fwbb_list.forEach(fwbb_obj => {
            sum_of_heights += fwbb_obj.height;
        });

        return sum_of_heights;
    },
    moveItemsFoward: function(item_array, current_page_item, next_page_item) {
        item_array.forEach(item_obj => {
            if (worksheet_editor.getItemType(item_obj) === 'content') { // logic for moving content foward
                // add to an overflow sect if existing
                if (
                    next_page_item.sects[0] !== undefined && 
                    next_page_item.sects[0].settings.is_overflow_sect &&
                    next_page_item.sects[0].settings.base_sect === current_page_item.sects[current_page_item.sects.length - 1]
                ) {
                    worksheet_editor.static_update.addContentToSect(
                        worksheet_editor.getIdByItem(next_page_item.sects[0]),
                        item_obj,
                        'unshift'
                    );
                } // create an overflow sect if not existing
                else {
                    const sect_id = worksheet_editor.static_update.unshiftOverflowSect(
                        worksheet_editor.getIdByItem(next_page_item),
                        current_page_item.sects[current_page_item.sects.length - 1]
                    );

                    worksheet_editor.static_update.addContentToSect(sect_id, item_obj, 'unshift');
                }
            }
            else if (worksheet_editor.getItemType(item_obj) === 'sect') { // logic for moving sects foward
                // if overflow sect existing, move content into this sect, delete overflow sect, then push sect foward
                if (
                    next_page_item.sects[0] !== undefined && 
                    next_page_item.sects[0].settings.is_overflow_sect &&
                    next_page_item.sects[0].settings.base_sect === item_obj
                ) {
                    worksheet_editor.static_update.addSectToPage(
                        worksheet_editor.getIdByItem(next_page_item),
                        {
                            content: [...next_page_item.sects[0].content],
                            settings: item_obj.settings
                        },
                        'unshift'
                    );

                    worksheet_editor.static_update.deleteItemAt(worksheet_editor.getIdByItem(next_page_item.sects[1]));
                } // if not existing, just push this sect foward (means this is a standalone sect with no content)
                else {
                    worksheet_editor.static_update.addSectToPage(
                        worksheet_editor.getIdByItem(next_page_item),
                        item_obj,
                        'unshift'
                    );
                }
            }

            // delete the item at the original location of the item we moved
            worksheet_editor.static_update.deleteItemAt(worksheet_editor.getIdByItem(item_obj));
        });
    },
    createFwbbList: function(unshifted_items, current_page_item) {        
        // create a list of all the worksheet items on the page
        let page_element_list = [...unshifted_items];
        
        // break down the page into a 'single-file' list of its items
        current_page_item.sects.forEach(sect_item => {
            page_element_list.push(sect_item);

            sect_item.content.forEach(content_item => {
                page_element_list.push(content_item);
            });
        });

        // now we re-group them into "fwbb's" based on the items being block-level or inline
        let fwbb_list = {
            array: [],
            getHeightSum: function() {
                let sum_of_heights = 0;

                this.array.forEach(fwbb_obj => {
                    sum_of_heights += fwbb_obj.height;
                });

                return sum_of_heights;
            },
            popLastItem: function() {
                const last_fwbb_obj = this.array[this.array.length - 1];

                let last_ws_item;
                if (last_fwbb_obj.number_of_items === 1) {
                    last_ws_item = last_fwbb_obj.first_ws_item;

                    this.array.pop();

                    return last_ws_item;
                }
                else if (last_fwbb_obj.number_of_items === 2) {
                    last_ws_item = last_fwbb_obj.second_ws_item;

                    this.array[this.array.length - 1] = {
                        number_of_items: 1,
                        first_ws_item: last_fwbb_obj.first_ws_item,
                        second_ws_item: null,
                        height: Number(last_fwbb_obj.first_ws_item.settings.height.split('i')[0]) * PCH.getInToPx()
                    };

                    return last_ws_item;
                }
            },
            getLastItem: function() {
                const last_fwbb = this.array[this.array.length - 1];

                if (last_fwbb.number_of_items === 2) return last_fwbb.second_ws_item;
                else if (last_fwbb.number_of_items === 1) return last_fwbb.first_ws_item;
            },
            getSecondTlFwbbItem: function() {
                const secondtl_fwbb = this.array[this.array.length - 2];

                if (secondtl_fwbb === undefined) return null;

                if (secondtl_fwbb.number_of_items === 2) return secondtl_fwbb.second_ws_item;
                else if (secondtl_fwbb.number_of_items === 1) return secondtl_fwbb.first_ws_item;
            },
            getItemArrayAt: function(fwbb_index) {
                const fwbb_obj = this.array[fwbb_index];

                if (fwbb_obj.second_ws_item !== null) return [fwbb_obj.first_ws_item, fwbb_obj.second_ws_item];
                else return [fwbb_obj.first_ws_item];
            }
        };
        for (let item_index = 0; item_index < page_element_list.length; item_index++) {
            const current_item = page_element_list[item_index];
            const next_item = page_element_list[item_index + 1];

            // if the current item is block level or the text item is block level or there is no next item => only item item in the fwbb
            if (current_item.settings.is_block_level || next_item === undefined || next_item.settings.is_block_level) {
                fwbb_list.array.push({
                    number_of_items: 1,
                    first_ws_item: current_item,
                    second_ws_item: null,
                    height: Number(current_item.settings.height.split('i')[0]) * this.getInToPx()
                });
            } // two items in the fwbb
            else {
                const first_item_height = Number(current_item.settings.height.split('i')[0]) * this.getInToPx();
                const second_item_height = Number(next_item.settings.height.split('i')[0]) * this.getInToPx();
                
                fwbb_list.array.push({
                    number_of_items: 2,
                    first_ws_item: current_item,
                    second_ws_item: next_item,
                    height: (first_item_height > second_item_height)? first_item_height : second_item_height // use the greater height
                });
                
                item_index++; // skip foward by one since we added 2 items
            }
        }

        return fwbb_list;
    }
}
export function pushContentOverflow() {
    let overflow_detected = false; // at least one page had overflow (so a re-render is needed)
    let unshifted_items = [];

    PCH.forEachPage((current_page_item, next_page_item, current_page_element) => {
        const current_fwbb_list = PCH.createFwbbList(unshifted_items, current_page_item);
        unshifted_items = []; // clear the moved heights

        // (while the sum of fwbb heights is greater than the page height)
        while (current_fwbb_list.getHeightSum() > PCH.getInnerPageHeight(current_page_element)) {
            overflow_detected = true;

            if (next_page_item === undefined) { // add another page to overflow content onto if there wasn't one
                next_page_item = worksheet_editor.getItemById(worksheet_editor.static_update.addPageToDoc());
            }

            let num_moved_fwbbs = 1; // at least one fwbb must have been moved

            // the following handle the special rules with moving directions
            let last_is_content, secondtl_is_directions;

            if (worksheet_editor.getIdByItem(current_fwbb_list.getLastItem()).split('-')[0] === 'content') last_is_content = true;
            else if (worksheet_editor.getIdByItem(current_fwbb_list.getLastItem()).split('-')[0] === 'sect') last_is_content = false;
            if (worksheet_editor.getIdByItem(current_fwbb_list.getSecondTlFwbbItem()).split('-')[0] === 'sect') secondtl_is_directions = true;
            else if (worksheet_editor.getIdByItem(current_fwbb_list.getSecondTlFwbbItem()).split('-')[0] === 'content') secondtl_is_directions = false;

            if (last_is_content && secondtl_is_directions) { // only case where you need to move 2 fwbbs
                PCH.moveItemsFoward(current_fwbb_list.getItemArrayAt(current_fwbb_list.array.length - 1), current_page_item, next_page_item);
                PCH.moveItemsFoward(current_fwbb_list.getItemArrayAt(current_fwbb_list.array.length - 2), current_page_item, next_page_item);
                num_moved_fwbbs = 2;
            }
            else {
                PCH.moveItemsFoward(current_fwbb_list.getItemArrayAt(current_fwbb_list.array.length - 1), current_page_item, next_page_item);
                num_moved_fwbbs = 1;
            }

            // pop off the heights for the number of fwbbs we moved foward 
            for (let i = 0; i < num_moved_fwbbs; i++) {
                current_fwbb_list.popLastItem();
            }
        }
    });

    return overflow_detected;
}

export function fitMathOverflow() {
    [...document.getElementsByClassName('worksheet-page-content-area')].forEach(content_area => {
        [...content_area.children].forEach(block_bounding_box => {
            [...block_bounding_box.children].forEach(content_box => {
                if (!content_box.classList.contains('problem-box')) return; // skip all content boxes except for problem boxes
                const math_div = [...content_box.children][1];

                let scale_factor = math_div.clientWidth / math_div.scrollWidth;
                const worksheet_item = worksheet_editor.getItemById(content_box.getAttribute('data-item-ID'));
                let current_font_size = Number(worksheet_item.settings.font_size.split('c')[0]);
                while (Math.abs(scale_factor - 1) > 0.001) {
                    current_font_size = current_font_size * scale_factor; 
                    math_div.style.fontSize = current_font_size + 'cm';

                    scale_factor = math_div.clientWidth / math_div.scrollWidth;
                }
            });
        });
    });
}