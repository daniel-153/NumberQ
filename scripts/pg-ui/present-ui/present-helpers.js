`
<div id="present-content" class="dark-overlay">
        <div class="large-pop-up-banner">
          <div class="main-pop-up-content present-main-content">
            <div class="present-preview-wrap" id="present-preview-wrap"></div>
            <div class="present-form-wrap">
              <form class="present-form" id="present-form">
                <div class="present-form-section">
                  <h3 class="present-form-header">Sizes & Scales:</h3>
                  <div class="present-form-input-wrap">
                    <div
                      class="outer-radio-button-wrapper auto-spaced-radio-buttons"
                    >
                      <div class="pm-num-inputs-wrapper">
                        <label
                          class="present-size-label"
                          for="present-question-scale"
                          >Prompt Scale:</label
                        >
                        <div class="pm-num-inputs">
                          <div role="button" class="pm-incrementer">
                            &ndash;
                          </div>
                          <div class="pm-textbox-wrap">
                            <input
                              type="text"
                              name="present-question-scale"
                              class="present-size-textbox"
                              value="100"
                              id="present-question-scale"
                            />
                            <span class="pm-num-units">%</span>
                          </div>
                          <div role="button" class="pm-incrementer">+</div>
                        </div>
                      </div>
                      <div class="pm-num-inputs-wrapper">
                        <label
                          class="present-size-label"
                          for="present-answer-scale"
                          >Answer Scale:</label
                        >
                        <div class="pm-num-inputs">
                          <div role="button" class="pm-incrementer">
                            &ndash;
                          </div>
                          <div class="pm-textbox-wrap">
                            <input
                              type="text"
                              name="present-answer-scale"
                              class="present-size-textbox"
                              value="100"
                              id="present-answer-scale"
                            />
                            <span class="pm-num-units">%</span>
                          </div>
                          <div role="button" class="pm-incrementer">+</div>
                        </div>
                      </div>
                      <div class="pm-num-inputs-wrapper">
                        <label
                          class="present-size-label"
                          for="present-global-zoom"
                          >Global Zoom:</label
                        >
                        <div class="pm-num-inputs">
                          <div role="button" class="pm-incrementer">
                            &ndash;
                          </div>
                          <div class="pm-textbox-wrap">
                            <input
                              type="text"
                              name="present-global-zoom"
                              class="present-size-textbox"
                              value="100"
                              id="present-global-zoom"
                            />
                            <span class="pm-num-units">%</span>
                          </div>
                          <div role="button" class="pm-incrementer">+</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="present-form-section">
                  <h3 class="present-form-header">Answer Visibility:</h3>
                  <div class="present-form-input-wrap">
                    <div
                      class="outer-radio-button-wrapper auto-spaced-radio-buttons"
                    >
                      <div class="inner-radio-button-wrapper">
                        <div class="radio-circle-wrapper">
                          <input
                            type="radio"
                            name="present-answer-vis"
                            value="invisible"
                            class="radio-buttons export-radio-buttons"
                            id="answer-vis-invisible"
                          />
                        </div>
                        <label
                          for="answer-vis-invisible"
                          class="radio-button-label export-radio-label"
                          ><span class="file-type-name">Hidden</span>
                          (invisible)</label
                        >
                      </div>
                      <div class="inner-radio-button-wrapper">
                        <div class="radio-circle-wrapper">
                          <input
                            type="radio"
                            name="present-answer-vis"
                            value="empty-box"
                            class="radio-buttons export-radio-buttons"
                            id="answer-vis-empty-box"
                          />
                        </div>
                        <label
                          for="answer-vis-empty-box"
                          class="radio-button-label export-radio-label"
                          ><span class="file-type-name">Hidden</span> (empty
                          box)</label
                        >
                      </div>
                      <div class="inner-radio-button-wrapper">
                        <div class="radio-circle-wrapper">
                          <input
                            type="radio"
                            name="present-answer-vis"
                            value="shown"
                            class="radio-buttons export-radio-buttons"
                            id="answer-vis-shown"
                          />
                        </div>
                        <label
                          for="answer-vis-shown"
                          class="radio-button-label export-radio-label"
                          ><span class="file-type-name">Shown</span> (not
                          boxed)</label
                        >
                      </div>
                      <div class="inner-radio-button-wrapper">
                        <div class="radio-circle-wrapper">
                          <input
                            type="radio"
                            name="present-answer-vis"
                            value="shown-boxed"
                            class="radio-buttons export-radio-buttons"
                            id="answer-vis-shown-boxed"
                          />
                        </div>
                        <label
                          for="answer-vis-shown-boxed"
                          class="radio-button-label export-radio-label"
                          ><span class="file-type-name">Shown</span>
                          (boxed)</label
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div class="pop-up-base present-base">
            <button
              class="present-export-btn present-download-btn"
              id="present-download-btn"
            >
              Download
            </button>
            <button
              class="present-export-btn preset-copy-btn"
              id="present-copy-btn"
            >
              Copy
            </button>
          </div>
          <button id="present-exit-button" class="export-exit-button">✕</button>
        </div>
      </div>
`