import { worksheet_editor, worksheet }  from '../worksheet.js';

function _addMainHeader(settings) {
    return `
        <div class="full-width-bounding-box">
            <div class="ws-header-wrapper">
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
}

function _createProblemBox(problem_item) {
    return `
        <div class="problem-box half-width-box" data-item-ID="${worksheet_editor.getIdByItem(problem_item)}">
            <div class="problem-number">${worksheet_editor.getProblemNumber(problem_item)})</div>
            <div class="problem-tex" data-math-container="true" style="font-size: ${problem_item.settings.font_size};"></div>
        </div> 
    `;
}

function _createDirectionsBox(sect_item) {
    return `
        <div 
            class="directions-box" data-item-ID="${worksheet_editor.getIdByItem(sect_item)}"
            style="font-size: ${sect_item.settings.font_size};"
        >
            ${sect_item.settings.directions_text}   
        </div>
    `;
}

function _createPageFwbbs(page_item) {
    const sect_array = page_item.sects;
    const page_settings = page_item.settings; // in case there are page settings that may add fwbbs (in the future)

    let fwbb_html_string = '';

    // (for every sect on the current page)
    for (let sect_index = 0; sect_index < sect_array.length; sect_index++) {
        const current_sect = sect_array[sect_index];

        // create a directions box as long as its not an overflow sect
        if (!current_sect.settings.is_overflow_sect) {
            fwbb_html_string += `
                <div class="full-width-bounding-box">
                    ${_createDirectionsBox(current_sect)}
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
                        ${_createProblemBox(current_content)}
                        ${_createProblemBox(next_content)}
                    </div>
                `;

                content_index++; // jump ahead by one content item because we added 2
            }
            else if (current_content.settings.type === 'problem') {
                fwbb_html_string += `
                    <div class="full-width-bounding-box">
                        ${_createProblemBox(current_content)}
                    </div>
                `;
            }
            else {

            }
        }
    }

    return fwbb_html_string;
}

export function insertWorksheetHtml() {    
    let updated_html = '';
    for (let page_index = 0; page_index < worksheet.pages.length; page_index++) {
        updated_html += `
            <div class="worksheet-page-wrapper">
                <div class="worksheet-page" style="padding: 0.5in 0.5in 0.5in 0.5in;">
                    <div class="worksheet-page-content-area">
        `;

        // add the header on the first page
        if (page_index === 0) updated_html += _addMainHeader();

        // add the fwbb's on each page
        updated_html += _createPageFwbbs(worksheet.pages[page_index]);
        
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

export function pushContentOverflow() {    
    const page_element_list = [...document.getElementsByClassName('worksheet-page-content-area')];
    const fwbb_height_series = []; // array of arrays of heights
    for (let i = 0; i < page_element_list.length; i++) {
        fwbb_height_series.push([]);
    }

    let overflow_detected = false;
    for (let page_index = 0; page_index < worksheet.pages.length; page_index++) {
        // we need the logic below because the current page might not exist in the DOM yet if it was created due to previous overflow
        let fwbb_element_list;
        let current_page_height;
        if (page_element_list[page_index] !== undefined) {
            current_page_height = page_element_list[page_index].clientHeight;
            fwbb_element_list = [...page_element_list[page_index].children];
        }
        else {
            // !!!!temporary!!!! (obviously you would need to actually find what the real page height would be here)
            // If there are document-level settings that modify the margins of the content areas this will be wrong
            // If the screen resolution isn't the same as where I got this px value for 9in, this will be wrong
            current_page_height = 864;
            fwbb_element_list = [];
        }

        const current_fwbb_heights = fwbb_height_series[page_index];

        for (let fwbb_index = 0; fwbb_index < fwbb_element_list.length; fwbb_index++) {
            current_fwbb_heights.push(fwbb_element_list[fwbb_index].clientHeight);
        }

        // while (the sum of fwbb heights is greater than the page height) [meaning at least one fwbb is overflowing]
        while (current_fwbb_heights.reduce((accumulator, current_value) => accumulator + current_value, 0) > current_page_height) {
            // (if there is no next page to overflow content onto)
            if (worksheet_editor.getItemById(`page-${page_index + 1}`) === null) {
                worksheet_editor.static_update.addPageToDoc(); // add a page if there is no next page to overflow content onto
                fwbb_height_series.push([]); // add another array to the height series 
            }
            
            // get the last fwbb and its contents + second to last fwbb
            const last_fwbb = fwbb_element_list[fwbb_element_list.length - 1];
            const second_last_fwbb = fwbb_element_list[fwbb_element_list.length - 2];
            const last_fwbb_items = [...last_fwbb.children];
            const second_fwbb_items = [...second_last_fwbb.children];

            // if-else here is responsible for moving everything in the offending fwbb to the next page (and taking anything with it)
            if (last_fwbb_items.length === 1) {
                const current_item_ID = last_fwbb_items[0].getAttribute('data-item-ID');
                const current_item_type = current_item_ID.split('-')[0];
                const current_item = worksheet_editor.getItemById(current_item_ID); // item in the fwbb that overflowed
                const item_before = worksheet_editor.getItemById(second_fwbb_items[second_fwbb_items.length - 1].getAttribute('data-item-ID'));

                if (current_item_type === 'sect') { // directions overflowed (can just move them)
                    worksheet_editor.static_update.deleteItemAt(current_item_ID);
                    worksheet_editor.static_update.addSectToPage(
                        `page-${page_index + 1}`,
                        current_item,
                        'unshift'
                    );
                }
                else if (current_item_type === 'content') { // content overflowed (need to check if there were directions immidiately before)
                    if (worksheet_editor.getIdByItem(item_before).split('-')[0] === 'sect') { // item before was sect
                        // pull the overflowing item over
                        worksheet_editor.static_update.deleteItemAt(current_item_ID);
                        worksheet_editor.static_update.addContentToSect()

                        // 
                    }
                    else if (worksheet_editor.getIdByItem(item_before).split('-')[0] === 'content') { // content before

                    }
                }
            }
            else if (last_fwbb_items.length === 2) {

            }

            // [...last_fwbb.children].forEach(content_box => {
            //     // (if there is no next page to overflow content onto)
            //     if (worksheet_editor.getItemById(`page-${page_index + 1}`) === null) {
            //         worksheet_editor.static_update.addPageToDoc(); // add a page if there is no next page to overflow content onto
            //         fwbb_height_series.push([]); // add another array to the height series 
            //     }

            //     // save the overflowing item's settings before deleting it
            //     const item_settings = worksheet_editor.getItemById(content_box.getAttribute('data-item-ID')).settings; 
            //     console.log(item_settings)

            //     // delete the overflowing item and add it to the next page
            //     worksheet_editor.static_update.deleteItemAt(content_box.getAttribute('data-item-ID'));
            //     worksheet_editor.static_update.addContentToPage(
            //         `page-${page_index + 1}`,
            //         '_', 
            //         item_settings,
            //         'unshift'
            //     );
            // });

            // push the height of the fwbb we moved to the next array
            fwbb_height_series[page_index + 1].push(current_fwbb_heights[current_fwbb_heights.length - 1]);
            current_fwbb_heights.pop();

            overflow_detected = true; // if we entered this while() a single time, that means something overflowed; if not, nothing overflowed
        }
    }
    

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