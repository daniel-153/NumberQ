import * as TB from '../templates/topic-banners.js';

export function updateElementMath(math_container_id, latex_str, initial_font_size_vw) { // insert math into element, make adjustments (if needed) to ensure it doesn't overflow    
    const math_container = document.getElementById(math_container_id);
    initial_font_size_vw = parseFloat(initial_font_size_vw); // break off the 'vw'
    latex_str = String(latex_str); // ensure string input (some gens output numbers)

    // clear previously applied styles and scroll before running this func
    math_container.style.fontSize = '';
    math_container.style.display = '';
    math_container.style.overflowX = 'hidden';
    math_container.style.overflowY = 'hidden';
    math_container.style.justifyContent = '';
    math_container.style.alignItems = '';
    math_container.scrollTop = 0;
    math_container.scrollLeft = 0;

    // make some adjustments to the initial font size based on special cases (latex contains fractions, or smaller screen size detected)
    const frac_upscale = (latex_str.includes('\\frac')) ? 1.3 : 1;
    initial_font_size_vw *= frac_upscale;
    if (document.documentElement.clientWidth > 900 && document.documentElement.clientWidth <= 1700) { // laptops and tablets
        initial_font_size_vw *= (4/3);
    }
    else if (document.documentElement.clientWidth < 900) { // phones + small tablets
        initial_font_size_vw *= (10/3);
    }

    // apply the resolved initial font size and do the intial typeset
    math_container.innerHTML = '<div class="inner-math-wrapper" style="width: fit-content; height: fit-content; max-width: fit-content; max-height: fit-content; opacity: 0;">\\(' + latex_str + '\\)</div>';
    const inner_math_container = math_container.firstElementChild;
    inner_math_container.style.fontSize = initial_font_size_vw + 'vw';
    math_container.setAttribute('data-latexcode', latex_str); // expose the LaTeX so it's still accessible after rendering
    mjx_loader.typesetPromise(inner_math_container).then(() => {
        inner_math_container.style.opacity = 1;
        const hasXOverflow = () => inner_math_container.clientWidth > math_container.clientWidth;
        const hasYOverflow = () => inner_math_container.clientHeight > math_container.clientHeight;
        const hasXorYOverflow = () => hasXOverflow() || hasYOverflow();

        if (hasXorYOverflow()) {
            // needed factor is the most extreme out of (available x-space/total x-space with scroll) and (available y-space/total y-space with scroll)
            let needed_downscale_factor = Math.min(math_container.clientWidth/inner_math_container.clientWidth, math_container.clientHeight/inner_math_container.clientHeight);
            needed_downscale_factor -= needed_downscale_factor * (1 / 100); // add an additional 1% 
            inner_math_container.style.fontSize = (initial_font_size_vw * needed_downscale_factor) + 'vw';

            // ensure the font size never shrinks below 16px
            if (((initial_font_size_vw * needed_downscale_factor)/100) * document.documentElement.clientWidth < 16) {
                inner_math_container.style.fontSize = (16 / document.documentElement.clientWidth) * 100 + 'vw';
            }

            // settle (apply) all styles then check if there is still overflow (in which case, scroll bars are needed)
            requestAnimationFrame(() => {
                if (hasXorYOverflow()) {
                    math_container.style.display = 'flex';
                    const applyYStyleUpdates = () => {math_container.style.overflowY = 'auto'; math_container.style.alignItems = 'flex-start';}
                    const applyXStyleUpdates = () => {math_container.style.overflowX = 'auto'; math_container.style.justifyContent = 'left';}

                    if (hasXOverflow() && hasYOverflow()) { // both directions overflowed (just apply both scroll bars at the same time)
                        applyXStyleUpdates();
                        applyYStyleUpdates();
                    }
                    else if (hasXOverflow()) { // only x overflowed
                        applyXStyleUpdates();

                        requestAnimationFrame(() => { // check if the x scroll bar caused y overflow
                            if (hasYOverflow()) applyYStyleUpdates();
                        });
                    }
                    else if (hasYOverflow()) { // only y overflowed
                        applyYStyleUpdates();

                        requestAnimationFrame(() => { // check if the y scroll bar caused x overflow
                            if (hasXOverflow()) applyXStyleUpdates();
                        });
                    }
                }
            });
        }
    });
}

export function addTextAutofitter(element, initial_font_size, method) {
    let originalFontSize = initial_font_size !== undefined ? initial_font_size : "3vw"; // Define your original font size
    if (window.innerWidth <= 900) originalFontSize = "10vw";
    method = method || 'set'; // Default method is 'set'

    // Function to adjust font size dynamically
    function fitTextToDiv(container) {
        container.style.fontSize = originalFontSize; // Reset to original font size

        // Detect overflow
        let scaleFactor = 1; // Initialize scale factor
        const isOverflowing = () =>
            container.scrollHeight > container.clientHeight || container.scrollWidth > container.clientWidth;

        while (isOverflowing()) {
            // Calculate how much to downsize
            const heightRatio = container.clientHeight / container.scrollHeight;
            const widthRatio = container.clientWidth / container.scrollWidth;
            scaleFactor = Math.min(heightRatio, widthRatio);

            // Apply scale factor
            const newFontSize = parseFloat(getComputedStyle(container).fontSize) * scaleFactor;
            container.style.fontSize = newFontSize + "px"; // modify font here
            // container.style.fontSize = (newFontSize / Window.innerWidth) * 100 + 'vw';

            // Break loop if scale factor is 1 (the text isn't overflowing anymore)
            if (scaleFactor >= 1) break;
        }

        // make sure the final font size we set is in vw, not px
        container.style.fontSize = (parseFloat(getComputedStyle(container).fontSize) / window.innerWidth) * 100 + 'vw';
    }

    // Function to clean the element from existing MutationObservers
    function cleanFromListeners(el) {
        const clone = el.cloneNode(true);
        el.parentNode.replaceChild(clone, el);
        return clone;
    }

    // Clean the element to remove existing listeners
    element = cleanFromListeners(element);

    // Run the downsizing logic immediately
    fitTextToDiv(element);

    if (method === 'set') {
        // MutationObserver to detect changes in text content
        const observer = new MutationObserver(() => {
            fitTextToDiv(element); // Adjust font size when content changes
        });

        observer.observe(element, { characterData: true, childList: true, subtree: true });
    }
    // If method is 'run_once', we don't create any observer
} // when the text content of the element changes, downsize it to fit the element if needed

export function toggleVisibility(elements_to_show, elements_to_hide) {
    elements_to_show.forEach(id => document.getElementById(id).classList.remove('hidden-content'));
    elements_to_hide.forEach(id => document.getElementById(id).classList.add('hidden-content'));
}

export function cleanedFromListeners(element) {
    const clone = element.cloneNode(true); 
    element.parentNode.replaceChild(clone, element); 
    return clone; 
} 

export function insertModeBanners() {
    let output_html = '';
    TB.templates.forEach(banner_template => {
        let example_problem_class;
        if (banner_template.example_problem_class === undefined) example_problem_class = '';
        else example_problem_class = banner_template.example_problem_class;
             
        output_html += `
            <div class="generator ${banner_template.category_class_name}">
            <div class="gen-title-container">
                <h1 class="gen-title">${banner_template.display_name}</h1>
                <h2 class="gen-topic">(${banner_template.display_category})</h2>
            </div>
            <div class="example-problem ${example_problem_class}">${banner_template.example_problem}</div>
            <button
                class="start-button"
                data-gen-type="${banner_template.display_name}"
                data-gen-func-name="${banner_template.function_name}"
            >
                Generate
            </button>
            </div>
        `;
    })

    const gen_list = document.getElementById('generator-list');
    gen_list.insertAdjacentHTML('afterbegin',output_html);
}

const UVH = { // ui visibility helpers
    visibility_states: {
        'home-page-content': {
            is_open: true,
            children: null
        },
        'generation-content': {
            is_open: false,
            children: {
                'export-content': {
                    is_open: false,
                    children: null
                },
                'present-content': {
                    is_open: false,
                    children: null
                }
            }
        }
    },
    getRoot: function(visibility_states) {
        return {
            is_open: true,
            children: visibility_states
        }
    },
    findContent: function(content_id, parent_page) {
        if (parent_page.children !== null && typeof(parent_page.children) === 'object') {
            const children_ids = Object.keys(parent_page.children);

            if (children_ids.includes(content_id)) {
                return {
                    target_page: parent_page.children[content_id],
                    parent: parent_page
                };
            }
            else {
                for (let i = 0; i < children_ids.length; i++) {
                    const sub_parent = parent_page.children[children_ids[i]];
                    const search_result = UVH.findContent(content_id, sub_parent);

                    if (search_result !== null) return search_result;
                }

                return null;
            }
        }
        else return null;
    },
    closeRecursive: function(content_id, parent_page) {
        document.getElementById(content_id)?.classList.add('hidden-content');
        parent_page.children[content_id].is_open = false;

        if (
            parent_page.children[content_id].children !== null && 
            typeof(parent_page.children[content_id].children) === 'object'
        ) {
            Object.keys(parent_page.children[content_id].children).forEach(sub_child => {
                UVH.closeRecursive(sub_child, parent_page.children[content_id]);
            });
        }
    }
};
export function open(content_id, visibility_states = UVH.visibility_states) {
    const root = UVH.getRoot(visibility_states);
    const search_result = UVH.findContent(content_id, root);

    if (search_result !== null) {
        const {target_page, parent} = search_result;

        if (!parent.is_open) return false;
        else {
            Object.keys(parent.children).forEach(content_at_level => {
                if (content_at_level !== content_id) {
                    UVH.closeRecursive(content_at_level, parent);
                }
            });

            document.getElementById(content_id)?.classList.remove('hidden-content');
            target_page.is_open = true;

            return true;
        }
    }   
    else return false;
}
export function close(content_id, visibility_states = UVH.visibility_states) {
    const root = UVH.getRoot(visibility_states);
    const search_result = UVH.findContent(content_id, root);

    if (search_result !== null) {
        UVH.closeRecursive(content_id, search_result.parent);

        return true;
    }   
    else return false;
}

export async function loadStyleSheets(sheet_name_array) {
    const link_els = [];
    const sheet_promises = [];
    sheet_name_array.forEach(sheet_name => {
        const link_el = document.createElement('link');
        link_el.rel = 'stylesheet';
        link_el.href = `styles/${sheet_name}.css`;
        link_els.push(link_el);

        sheet_promises.push(new Promise((resolve, reject) => {
            link_el.onload = resolve;
            link_el.onerror = reject;
        }));
    });

    let all_loaded = true;
    try {
        link_els.forEach(link_el => document.head.appendChild(link_el));
        await Promise.all(sheet_promises);

        await new Promise(resolve => {
            requestAnimationFrame(() => {
                setTimeout(resolve, 0);
            });
        });
    } catch (error) {
        all_loaded = false;
        console.error(`Failed to load one or more stylesheets: ${error}`);
    }

    return all_loaded;
}

export function insertHomeMath() {
    const el_math_pairs = [
        ['numberQ-Q', '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1.76ex" height="1.995ex" role="img" focusable="false" viewBox="0 -701 778 882" aria-hidden="true" style="vertical-align: -0.41ex;"><defs><path id="MJX-1-TEX-D-211A" d="M480 -10Q480 -13 486 -24T507 -50T541 -80T588 -104T648 -114Q666 -114 688 -110T714 -106Q724 -106 728 -114T729 -130Q723 -145 663 -163T548 -181Q503 -181 463 -169T395 -139T343 -97T307 -56T284 -19L280 -3L262 1Q188 24 131 81Q57 155 37 275Q34 292 34 342T37 410Q58 528 131 601Q179 652 248 676T388 701Q485 701 562 661Q698 595 731 448Q742 410 742 341T731 235Q707 141 646 81Q616 50 575 27T493 -5L480 -10ZM568 342Q568 613 437 659L395 666Q329 666 286 626Q232 570 213 439Q210 408 210 342T213 246Q231 113 286 57Q309 37 342 23Q357 19 389 19Q420 19 437 23Q469 38 491 57Q568 134 568 342ZM174 341V354Q174 393 175 419T183 484T205 561T246 635L249 639Q246 639 224 627T193 608Q189 606 183 601T169 589T155 577Q69 491 69 344Q69 133 231 52Q247 42 247 46Q247 46 246 48Q231 69 222 85T200 141T177 239Q174 269 174 341ZM708 341Q708 410 689 467T640 556T588 606T546 630Q532 638 531 638Q530 638 531 635Q563 590 577 543Q602 472 602 341V316Q602 264 599 230T580 144T531 48Q529 44 532 45T546 52Q575 68 596 84T642 128T683 200T706 299Q708 327 708 341ZM391 -17H333Q329 -15 326 -15Q324 -15 324 -17Q324 -21 362 -68Q424 -130 506 -143Q518 -144 544 -144Q569 -144 577 -143L589 -141L575 -139Q544 -127 509 -101T453 -37L442 -19L391 -17Z"></path></defs><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="scale(1,-1)"><g data-mml-node="math"><g data-mml-node="TeXAtom" data-mjx-texclass="ORD"><g data-mml-node="mi"><use data-c="211A" xlink:href="#MJX-1-TEX-D-211A"></use></g></g></g></g></svg>'],
        ['coming-soon-problems', '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="22.394ex" height="7.599ex" role="img" focusable="false" viewBox="0 -1929.3 9897.9 3358.6" aria-hidden="true" style="vertical-align: -3.234ex;"><defs><path id="MJX-1-TEX-I-1D451" d="M366 683Q367 683 438 688T511 694Q523 694 523 686Q523 679 450 384T375 83T374 68Q374 26 402 26Q411 27 422 35Q443 55 463 131Q469 151 473 152Q475 153 483 153H487H491Q506 153 506 145Q506 140 503 129Q490 79 473 48T445 8T417 -8Q409 -10 393 -10Q359 -10 336 5T306 36L300 51Q299 52 296 50Q294 48 292 46Q233 -10 172 -10Q117 -10 75 30T33 157Q33 205 53 255T101 341Q148 398 195 420T280 442Q336 442 364 400Q369 394 369 396Q370 400 396 505T424 616Q424 629 417 632T378 637H357Q351 643 351 645T353 664Q358 683 366 683ZM352 326Q329 405 277 405Q242 405 210 374T160 293Q131 214 119 129Q119 126 119 118T118 106Q118 61 136 44T179 26Q233 26 290 98L298 109L352 326Z"></path><path id="MJX-1-TEX-I-1D465" d="M52 289Q59 331 106 386T222 442Q257 442 286 424T329 379Q371 442 430 442Q467 442 494 420T522 361Q522 332 508 314T481 292T458 288Q439 288 427 299T415 328Q415 374 465 391Q454 404 425 404Q412 404 406 402Q368 386 350 336Q290 115 290 78Q290 50 306 38T341 26Q378 26 414 59T463 140Q466 150 469 151T485 153H489Q504 153 504 145Q504 144 502 134Q486 77 440 33T333 -11Q263 -11 227 52Q186 -10 133 -10H127Q78 -10 57 16T35 71Q35 103 54 123T99 143Q142 143 142 101Q142 81 130 66T107 46T94 41L91 40Q91 39 97 36T113 29T132 26Q168 26 194 71Q203 87 217 139T245 247T261 313Q266 340 266 352Q266 380 251 392T217 404Q177 404 142 372T93 290Q91 281 88 280T72 278H58Q52 284 52 289Z"></path><path id="MJX-1-TEX-SO-5B" d="M202 -349V850H394V810H242V-309H394V-349H202Z"></path><path id="MJX-1-TEX-N-35" d="M164 157Q164 133 148 117T109 101H102Q148 22 224 22Q294 22 326 82Q345 115 345 210Q345 313 318 349Q292 382 260 382H254Q176 382 136 314Q132 307 129 306T114 304Q97 304 95 310Q93 314 93 485V614Q93 664 98 664Q100 666 102 666Q103 666 123 658T178 642T253 634Q324 634 389 662Q397 666 402 666Q410 666 410 648V635Q328 538 205 538Q174 538 149 544L139 546V374Q158 388 169 396T205 412T256 420Q337 420 393 355T449 201Q449 109 385 44T229 -22Q148 -22 99 32T50 154Q50 178 61 192T84 210T107 214Q132 214 148 197T164 157Z"></path><path id="MJX-1-TEX-N-32" d="M109 429Q82 429 66 447T50 491Q50 562 103 614T235 666Q326 666 387 610T449 465Q449 422 429 383T381 315T301 241Q265 210 201 149L142 93L218 92Q375 92 385 97Q392 99 409 186V189H449V186Q448 183 436 95T421 3V0H50V19V31Q50 38 56 46T86 81Q115 113 136 137Q145 147 170 174T204 211T233 244T261 278T284 308T305 340T320 369T333 401T340 431T343 464Q343 527 309 573T212 619Q179 619 154 602T119 569T109 550Q109 549 114 549Q132 549 151 535T170 489Q170 464 154 447T109 429Z"></path><path id="MJX-1-TEX-N-73" d="M295 316Q295 356 268 385T190 414Q154 414 128 401Q98 382 98 349Q97 344 98 336T114 312T157 287Q175 282 201 278T245 269T277 256Q294 248 310 236T342 195T359 133Q359 71 321 31T198 -10H190Q138 -10 94 26L86 19L77 10Q71 4 65 -1L54 -11H46H42Q39 -11 33 -5V74V132Q33 153 35 157T45 162H54Q66 162 70 158T75 146T82 119T101 77Q136 26 198 26Q295 26 295 104Q295 133 277 151Q257 175 194 187T111 210Q75 227 54 256T33 318Q33 357 50 384T93 424T143 442T187 447H198Q238 447 268 432L283 424L292 431Q302 440 314 448H322H326Q329 448 335 442V310L329 304H301Q295 310 295 316Z"></path><path id="MJX-1-TEX-N-69" d="M69 609Q69 637 87 653T131 669Q154 667 171 652T188 609Q188 579 171 564T129 549Q104 549 87 564T69 609ZM247 0Q232 3 143 3Q132 3 106 3T56 1L34 0H26V46H42Q70 46 91 49Q100 53 102 60T104 102V205V293Q104 345 102 359T88 378Q74 385 41 385H30V408Q30 431 32 431L42 432Q52 433 70 434T106 436Q123 437 142 438T171 441T182 442H185V62Q190 52 197 50T232 46H255V0H247Z"></path><path id="MJX-1-TEX-N-6E" d="M41 46H55Q94 46 102 60V68Q102 77 102 91T102 122T103 161T103 203Q103 234 103 269T102 328V351Q99 370 88 376T43 385H25V408Q25 431 27 431L37 432Q47 433 65 434T102 436Q119 437 138 438T167 441T178 442H181V402Q181 364 182 364T187 369T199 384T218 402T247 421T285 437Q305 442 336 442Q450 438 463 329Q464 322 464 190V104Q464 66 466 59T477 49Q498 46 526 46H542V0H534L510 1Q487 2 460 2T422 3Q319 3 310 0H302V46H318Q379 46 379 62Q380 64 380 200Q379 335 378 343Q372 371 358 385T334 402T308 404Q263 404 229 370Q202 343 195 315T187 232V168V108Q187 78 188 68T191 55T200 49Q221 46 249 46H265V0H257L234 1Q210 2 183 2T145 3Q42 3 33 0H25V46H41Z"></path><path id="MJX-1-TEX-N-2061" d=""></path><path id="MJX-1-TEX-N-28" d="M94 250Q94 319 104 381T127 488T164 576T202 643T244 695T277 729T302 750H315H319Q333 750 333 741Q333 738 316 720T275 667T226 581T184 443T167 250T184 58T225 -81T274 -167T316 -220T333 -241Q333 -250 318 -250H315H302L274 -226Q180 -141 137 -14T94 250Z"></path><path id="MJX-1-TEX-N-29" d="M60 749L64 750Q69 750 74 750H86L114 726Q208 641 251 514T294 250Q294 182 284 119T261 12T224 -76T186 -143T145 -194T113 -227T90 -246Q87 -249 86 -250H74Q66 -250 63 -250T58 -247T55 -238Q56 -237 66 -225Q221 -64 221 250T66 725Q56 737 55 738Q55 746 60 749Z"></path><path id="MJX-1-TEX-SO-5D" d="M22 810V850H214V-349H22V-309H174V810H22Z"></path><path id="MJX-1-TEX-N-A0" d=""></path><path id="MJX-1-TEX-N-33" d="M127 463Q100 463 85 480T69 524Q69 579 117 622T233 665Q268 665 277 664Q351 652 390 611T430 522Q430 470 396 421T302 350L299 348Q299 347 308 345T337 336T375 315Q457 262 457 175Q457 96 395 37T238 -22Q158 -22 100 21T42 130Q42 158 60 175T105 193Q133 193 151 175T169 130Q169 119 166 110T159 94T148 82T136 74T126 70T118 67L114 66Q165 21 238 21Q293 21 321 74Q338 107 338 175V195Q338 290 274 322Q259 328 213 329L171 330L168 332Q166 335 166 348Q166 366 174 366Q202 366 232 371Q266 376 294 413T322 525V533Q322 590 287 612Q265 626 240 626Q208 626 181 615T143 592T132 580H135Q138 579 143 578T153 573T165 566T175 555T183 540T186 520Q186 498 172 481T127 463Z"></path><path id="MJX-1-TEX-LO-221A" d="M1001 1150Q1017 1150 1020 1132Q1020 1127 741 244L460 -643Q453 -650 436 -650H424Q423 -647 423 -645T421 -640T419 -631T415 -617T408 -594T399 -560T385 -512T367 -448T343 -364T312 -259L203 119L138 41L111 67L212 188L264 248L472 -474L983 1140Q988 1150 1001 1150Z"></path><path id="MJX-1-TEX-I-1D466" d="M21 287Q21 301 36 335T84 406T158 442Q199 442 224 419T250 355Q248 336 247 334Q247 331 231 288T198 191T182 105Q182 62 196 45T238 27Q261 27 281 38T312 61T339 94Q339 95 344 114T358 173T377 247Q415 397 419 404Q432 431 462 431Q475 431 483 424T494 412T496 403Q496 390 447 193T391 -23Q363 -106 294 -155T156 -205Q111 -205 77 -183T43 -117Q43 -95 50 -80T69 -58T89 -48T106 -45Q150 -45 150 -87Q150 -107 138 -122T115 -142T102 -147L99 -148Q101 -153 118 -160T152 -167H160Q177 -167 186 -165Q219 -156 247 -127T290 -65T313 -9T321 21L315 17Q309 13 296 6T270 -6Q250 -11 231 -11Q185 -11 150 11T104 82Q103 89 103 113Q103 170 138 262T173 379Q173 380 173 381Q173 390 173 393T169 400T158 404H154Q131 404 112 385T82 344T65 302T57 280Q55 278 41 278H27Q21 284 21 287Z"></path><path id="MJX-1-TEX-N-34" d="M462 0Q444 3 333 3Q217 3 199 0H190V46H221Q241 46 248 46T265 48T279 53T286 61Q287 63 287 115V165H28V211L179 442Q332 674 334 675Q336 677 355 677H373L379 671V211H471V165H379V114Q379 73 379 66T385 54Q393 47 442 46H471V0H462ZM293 211V545L74 212L183 211H293Z"></path><path id="MJX-1-TEX-N-6C" d="M42 46H56Q95 46 103 60V68Q103 77 103 91T103 124T104 167T104 217T104 272T104 329Q104 366 104 407T104 482T104 542T103 586T103 603Q100 622 89 628T44 637H26V660Q26 683 28 683L38 684Q48 685 67 686T104 688Q121 689 141 690T171 693T182 694H185V379Q185 62 186 60Q190 52 198 49Q219 46 247 46H263V0H255L232 1Q209 2 183 2T145 3T107 3T57 1L34 0H26V46H42Z"></path><path id="MJX-1-TEX-N-6F" d="M28 214Q28 309 93 378T250 448Q340 448 405 380T471 215Q471 120 407 55T250 -10Q153 -10 91 57T28 214ZM250 30Q372 30 372 193V225V250Q372 272 371 288T364 326T348 362T317 390T268 410Q263 411 252 411Q222 411 195 399Q152 377 139 338T126 246V226Q126 130 145 91Q177 30 250 30Z"></path><path id="MJX-1-TEX-N-67" d="M329 409Q373 453 429 453Q459 453 472 434T485 396Q485 382 476 371T449 360Q416 360 412 390Q410 404 415 411Q415 412 416 414V415Q388 412 363 393Q355 388 355 386Q355 385 359 381T368 369T379 351T388 325T392 292Q392 230 343 187T222 143Q172 143 123 171Q112 153 112 133Q112 98 138 81Q147 75 155 75T227 73Q311 72 335 67Q396 58 431 26Q470 -13 470 -72Q470 -139 392 -175Q332 -206 250 -206Q167 -206 107 -175Q29 -140 29 -75Q29 -39 50 -15T92 18L103 24Q67 55 67 108Q67 155 96 193Q52 237 52 292Q52 355 102 398T223 442Q274 442 318 416L329 409ZM299 343Q294 371 273 387T221 404Q192 404 171 388T145 343Q142 326 142 292Q142 248 149 227T179 192Q196 182 222 182Q244 182 260 189T283 207T294 227T299 242Q302 258 302 292T299 343ZM403 -75Q403 -50 389 -34T348 -11T299 -2T245 0H218Q151 0 138 -6Q118 -15 107 -34T95 -74Q95 -84 101 -97T122 -127T170 -155T250 -167Q319 -167 361 -139T403 -75Z"></path><path id="MJX-1-TEX-N-2212" d="M84 237T84 250T98 270H679Q694 262 694 250T679 230H98Q84 237 84 250Z"></path></defs><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="scale(1,-1)"><g data-mml-node="math"><g data-mml-node="mtable"><g data-mml-node="mtr" transform="translate(0,632.9)"><g data-mml-node="mtd"><g data-mml-node="mfrac"><g data-mml-node="mi" transform="translate(422.2,394) scale(0.707)"><use data-c="1D451" xlink:href="#MJX-1-TEX-I-1D451"></use></g><g data-mml-node="mrow" transform="translate(220,-345) scale(0.707)"><g data-mml-node="mi"><use data-c="1D451" xlink:href="#MJX-1-TEX-I-1D451"></use></g><g data-mml-node="mi" transform="translate(520,0)"><use data-c="1D465" xlink:href="#MJX-1-TEX-I-1D465"></use></g></g><rect width="972.2" height="60" x="120" y="220"></rect></g><g data-mml-node="mrow" transform="translate(1212.2,0)"><g data-mml-node="mo" transform="translate(0 -0.5)"><use data-c="5B" xlink:href="#MJX-1-TEX-SO-5B"></use></g><g data-mml-node="mn" transform="translate(417,0)"><use data-c="35" xlink:href="#MJX-1-TEX-N-35"></use></g><g data-mml-node="msup" transform="translate(917,0)"><g data-mml-node="mi"><use data-c="1D465" xlink:href="#MJX-1-TEX-I-1D465"></use></g><g data-mml-node="TeXAtom" transform="translate(605,363) scale(0.707)" data-mjx-texclass="ORD"><g data-mml-node="mn"><use data-c="32" xlink:href="#MJX-1-TEX-N-32"></use></g></g></g><g data-mml-node="mi" transform="translate(2092.2,0)"><use data-c="73" xlink:href="#MJX-1-TEX-N-73"></use><use data-c="69" xlink:href="#MJX-1-TEX-N-69" transform="translate(394,0)"></use><use data-c="6E" xlink:href="#MJX-1-TEX-N-6E" transform="translate(672,0)"></use></g><g data-mml-node="mo" transform="translate(3320.2,0)"><use data-c="2061" xlink:href="#MJX-1-TEX-N-2061"></use></g><g data-mml-node="mrow" transform="translate(3486.9,0)"><g data-mml-node="mo"><use data-c="28" xlink:href="#MJX-1-TEX-N-28"></use></g><g data-mml-node="mi" transform="translate(389,0)"><use data-c="1D465" xlink:href="#MJX-1-TEX-I-1D465"></use></g><g data-mml-node="mo" transform="translate(961,0)"><use data-c="29" xlink:href="#MJX-1-TEX-N-29"></use></g></g><g data-mml-node="mo" transform="translate(4836.9,0) translate(0 -0.5)"><use data-c="5D" xlink:href="#MJX-1-TEX-SO-5D"></use></g></g><g data-mml-node="mtext" transform="translate(6466,0)"><use data-c="A0" xlink:href="#MJX-1-TEX-N-A0"></use></g><g data-mml-node="mroot" transform="translate(6716,0)"><g><g data-mml-node="mfrac" transform="translate(1020,0)"><g data-mml-node="mrow" transform="translate(220,485) scale(0.707)"><g data-mml-node="mn"><use data-c="33" xlink:href="#MJX-1-TEX-N-33"></use></g><g data-mml-node="msup" transform="translate(500,0)"><g data-mml-node="mi"><use data-c="1D465" xlink:href="#MJX-1-TEX-I-1D465"></use></g><g data-mml-node="TeXAtom" transform="translate(605,289) scale(0.707)" data-mjx-texclass="ORD"><g data-mml-node="mn"><use data-c="35" xlink:href="#MJX-1-TEX-N-35"></use></g></g></g><g data-mml-node="msup" transform="translate(1508.6,0)"><g data-mml-node="mi"><use data-c="1D466" xlink:href="#MJX-1-TEX-I-1D466"></use></g><g data-mml-node="TeXAtom" transform="translate(523,289) scale(0.707)" data-mjx-texclass="ORD"><g data-mml-node="mn"><use data-c="34" xlink:href="#MJX-1-TEX-N-34"></use></g></g></g></g><g data-mml-node="mrow" transform="translate(554.1,-345) scale(0.707)"><g data-mml-node="mn"><use data-c="32" xlink:href="#MJX-1-TEX-N-32"></use><use data-c="34" xlink:href="#MJX-1-TEX-N-34" transform="translate(500,0)"></use></g><g data-mml-node="mi" transform="translate(1000,0)"><use data-c="1D466" xlink:href="#MJX-1-TEX-I-1D466"></use></g></g><rect width="1921.9" height="60" x="120" y="220"></rect></g></g><g data-mml-node="mn" transform="translate(362,437.4) scale(0.5)"><use data-c="33" xlink:href="#MJX-1-TEX-N-33"></use></g><g data-mml-node="mo" transform="translate(0,86.4)"><use data-c="221A" xlink:href="#MJX-1-TEX-LO-221A"></use></g><rect width="2161.9" height="60" x="1020" y="1176.4"></rect></g></g></g><g data-mml-node="mtr" transform="translate(0,-1172.4)"><g data-mml-node="mtd" transform="translate(632.6,0)"><g data-mml-node="msub"><g data-mml-node="mi"><use data-c="6C" xlink:href="#MJX-1-TEX-N-6C"></use><use data-c="6F" xlink:href="#MJX-1-TEX-N-6F" transform="translate(278,0)"></use><use data-c="67" xlink:href="#MJX-1-TEX-N-67" transform="translate(778,0)"></use></g><g data-mml-node="TeXAtom" transform="translate(1311,-241.4) scale(0.707)" data-mjx-texclass="ORD"><g data-mml-node="mn"><use data-c="35" xlink:href="#MJX-1-TEX-N-35"></use></g></g></g><g data-mml-node="mo" transform="translate(1714.6,0)"><use data-c="2061" xlink:href="#MJX-1-TEX-N-2061"></use></g><g data-mml-node="mo" transform="translate(1714.6,0)"><use data-c="28" xlink:href="#MJX-1-TEX-N-28"></use></g><g data-mml-node="msup" transform="translate(2103.6,0)"><g data-mml-node="mi"><use data-c="1D465" xlink:href="#MJX-1-TEX-I-1D465"></use></g><g data-mml-node="TeXAtom" transform="translate(605,363) scale(0.707)" data-mjx-texclass="ORD"><g data-mml-node="mn"><use data-c="33" xlink:href="#MJX-1-TEX-N-33"></use></g></g></g><g data-mml-node="mi" transform="translate(3112.1,0)"><use data-c="1D466" xlink:href="#MJX-1-TEX-I-1D466"></use></g><g data-mml-node="mo" transform="translate(3602.1,0)"><use data-c="29" xlink:href="#MJX-1-TEX-N-29"></use></g><g data-mml-node="mo" transform="translate(4213.3,0)"><use data-c="2212" xlink:href="#MJX-1-TEX-N-2212"></use></g><g data-mml-node="msub" transform="translate(5213.6,0)"><g data-mml-node="mi"><use data-c="6C" xlink:href="#MJX-1-TEX-N-6C"></use><use data-c="6F" xlink:href="#MJX-1-TEX-N-6F" transform="translate(278,0)"></use><use data-c="67" xlink:href="#MJX-1-TEX-N-67" transform="translate(778,0)"></use></g><g data-mml-node="TeXAtom" transform="translate(1311,-241.4) scale(0.707)" data-mjx-texclass="ORD"><g data-mml-node="mn"><use data-c="35" xlink:href="#MJX-1-TEX-N-35"></use></g></g></g><g data-mml-node="mo" transform="translate(6928.1,0)"><use data-c="2061" xlink:href="#MJX-1-TEX-N-2061"></use></g><g data-mml-node="mo" transform="translate(6928.1,0)"><use data-c="28" xlink:href="#MJX-1-TEX-N-28"></use></g><g data-mml-node="msup" transform="translate(7317.1,0)"><g data-mml-node="mi"><use data-c="1D466" xlink:href="#MJX-1-TEX-I-1D466"></use></g><g data-mml-node="TeXAtom" transform="translate(523,363) scale(0.707)" data-mjx-texclass="ORD"><g data-mml-node="mn"><use data-c="34" xlink:href="#MJX-1-TEX-N-34"></use></g></g></g><g data-mml-node="mo" transform="translate(8243.7,0)"><use data-c="29" xlink:href="#MJX-1-TEX-N-29"></use></g></g></g></g></g></g></svg>']
    ];

    for (const [el_id, svg_str] of el_math_pairs) {
        document.getElementById(el_id).innerHTML = svg_str;
    }
}