class Options {
    constructor() {
        this._prefix = 'options.';
        this._prefixRegExp = new RegExp('^' + this._prefix);
    }

    /**
     * Get option id corresponding to the input.
     * @param input element
     * @returns {string} option id
     * @private
     */
    _getOptionId(input) {
        return this._prefix + input.dataset.optionId;
    }

    /**
     * Get input id for the option (reverse of _getOptionId).
     * @param optionId
     * @returns {string} id for the input
     * @private
     */
    _getInputId(optionId) {
        return optionId.replace(this._prefixRegExp, '');
    }

    /**
     * Check if the given input element value is valid based on the HTML5 validation constraints.
     * @param input element to validate
     * @returns {boolean}
     * @private
     */
    static _isValidInput(input) {
        return (typeof input.nodeName.toLowerCase() === 'select') || (input.parentElement.querySelector(':valid') === input);
    }

    /**
     * Get option value from the given input.
     * @param input element to get value from
     * @returns {*} boolean for checkbox, else input.value
     * @private
     */
    static _getValueFromInput(input) {
        if (input.type !== 'checkbox') {
            return input.value;
        } else {
            return input.checked;
        }
    }

    /**
     * Save the option.
     * @param id of the option
     * @param value to save
     * @private
     */
    _saveOption(id, value) {
        const option = {};
        option[id] = value;
        chrome.storage.local.set(option);
    }

    /**
     * Update options from changed input, if the new value is valid.
     * @param input which value has changed
     */
    updateOptionFromInput(input) {
        if (Options._isValidInput(input)) {
            const optionId = this._getOptionId(input);
            const value = Options._getValueFromInput(input);
            this._saveOption(optionId, value);
        }
    }

    /**
     * Get default option values.
     * @returns {{}} default values for option keys
     * @private
     */
    _defaults() {
        const defaults = {};
        defaults[`${this._prefix}data_update_interval`] = 15;
        defaults[`${this._prefix}locale_team`] = chrome.i18n.getUILanguage();
        defaults[`${this._prefix}open_pontoon_on_button_click`] = false;
        defaults[`${this._prefix}hide_team_info_in_popup`] = false;
        return defaults;
    }

    /**
     * Set given value to the input.
     * @param input to set the value
     * @param value to set (boolean for checkbox)
     * @private
     */
    static _setValueToInput(input, value) {
        if (input.type !== 'checkbox') {
            input.value = value;
        } else {
            input.checked = value;
        }
    }

    /**
     * Load options page values from the object from storage (does not care about default values).
     * @param object from storage
     * @private
     */
    _loadAllFromObject(object) {
        Object.keys(object)
            .filter((key) => key.startsWith(this._prefix))
            .forEach((key) => {
                const input = document.querySelector(`[data-option-id=${this._getInputId(key)}]`);
                const value = object[key];
                Options._setValueToInput(input, value);
            });
    }

    /**
     * Load options page values from storage, handling the default values.
     */
    loadAllFromLocalStorage() {
        this._loadAllFromObject(this._defaults());
        chrome.storage.local.get((items) => this._loadAllFromObject(items));
    }

    /**
     * Get options values for given ids.
     * @param optionIds to retrieve
     * @param callback function to call with the object of options values (fallback to default value if option value not found)
     */
    get(optionIds, callback) {
        if (typeof optionIds === 'string') {
            optionIds = [optionIds];
        }
        chrome.storage.local.get(optionIds, (items) => {
            const optionsWithDefaultValues = {};
            optionIds.forEach((optionId) => {
                if (items[optionId] !== undefined) {
                    optionsWithDefaultValues[optionId] = items[optionId];
                } else {
                    optionsWithDefaultValues[optionId] = this._defaults()[optionId];
                }
            });
            callback(optionsWithDefaultValues);
        });
    }

    resetDefaults(callback) {
        chrome.storage.local.set(this._defaults(), callback);
    }
}
