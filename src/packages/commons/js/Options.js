if (!browser) { // eslint-disable-line no-use-before-define
    var browser = require('webextension-polyfill'); // eslint-disable-line no-var, no-inner-declarations
}

/**
 * Encapsulates storing and retrieving user preferences and notifying about their updates.
 */
export class Options {
    static async create() {
        const prefix = 'options.';
        const defaults = await Options._loadDefaults(prefix);
        return new Options(prefix, defaults);
    }

    constructor(prefix, defaults) {
        this._prefix = prefix;
        this._prefixRegExp = new RegExp('^' + this._prefix);
        this._defaults = defaults;
    }

    /**
     * Load default values from JSON files or calculate them from the browser runtime.
     * @private
     * @async
     */
    static async _loadDefaults(prefix) {
        const defaults = {};
        let browserFamily = '';
        if (browser.runtime.getURL('/').startsWith('moz-extension:')) {
            browserFamily = 'mozilla';
        } else {
            browserFamily = 'chromium';
        }
        await Promise.all([
            fetch(browser.runtime.getURL('packages/commons/data/default-options.json')).then((response) => response.json()),
            fetch(browser.runtime.getURL(`packages/commons/data/default-options-${browserFamily}.json`)).then((response) => response.json()),
            Promise.resolve({locale_team: browser.i18n.getUILanguage()}),
        ]).then(([
            defaultOptionsFromJSON,
            defaultOptionsForBrowser,
            defaultOptionsFromRuntime,
        ]) => {
            const loadedDefaults = Object.assign({}, defaultOptionsFromJSON, defaultOptionsForBrowser, defaultOptionsFromRuntime);
            Object.keys(loadedDefaults)
                .forEach((key) => defaults[`${prefix}${key}`] = loadedDefaults[key]);
        });
        return defaults;
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
     * Check if the given input element value is valid based on the HTML5 validation constraints (select or radio are always valid).
     * @param input element to validate
     * @returns {boolean}
     * @private
     * @static
     */
    static _isValidInput(input) {
        return (input.nodeName.toLowerCase() === 'select') || (input.type === 'radio') || (input.parentElement.querySelector(':valid') === input);
    }

    /**
     * Get option value from the given input.
     * @param input element to get value from
     * @returns {*} boolean for checkbox, else input.value
     * @private
     * @static
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
     * @param id of the option (including prefix)
     * @param value to save
     * @private
     */
    _saveOption(id, value) {
        const option = {};
        option[id] = value;
        browser.storage.local.set(option);
    }

    /**
     * Save the option.
     * @param id of the option
     * @param value to save
     * @public
     */
    set(id, value) {
        this._saveOption(this._prefix+id, value);
    }

    /**
     * Update options from changed input, if the new value is valid.
     * @param input which value has changed
     * @public
     */
    updateOptionFromInput(input) {
        if (Options._isValidInput(input)) {
            const optionId = this._getOptionId(input);
            const value = Options._getValueFromInput(input);
            this._saveOption(optionId, value);
        }
    }

    /**
     * Set given value to the input.
     * @param inputs to set the value
     * @param value to set (boolean for checkbox)
     * @private
     * @static
     */
    static _setValueToInputs(inputs, value) {
        if (inputs.length === 1) {
            const input = inputs[0];
            if (input.type !== 'checkbox' && input.type !== 'radio') {
                input.value = value;
            } else {
                input.checked = value;
            }
        } else if (inputs.length > 1 && [...inputs].every((input) => input.type === 'radio')) {
            const input = [...inputs].filter((input) => input.value === value);
            if (input.length === 1) {
                Options._setValueToInputs(input, true);
            } else {
                console.error(`The options inputs do not correspond with the stored value ${value}.`, inputs);
            }
        } else {
            console.error('The options inputs have wrong structure.', inputs);
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
                const inputs = document.querySelectorAll(`[data-option-id=${this._getInputId(key)}]`);
                const value = object[key];
                if (inputs) {
                    Options._setValueToInputs(inputs, value);
                }
            });
    }

    /**
     * Load options page values from storage, handling the default values.
     * @public
     * @async
     * @todo This should be moved out of here to not touch the DOM
     */
    async loadAllFromLocalStorage() {
        this._loadAllFromObject(this._defaults);
        await browser.storage.local.get().then(
            (items) => this._loadAllFromObject(items)
        );
    }

    /**
     * Get options values for given ids.
     * @param optionIds to retrieve
     * @returns promise that will be fulfilled with the retrieved options or their default values, if not set
     * @public
     * @async
     */
    async get(optionIds) {
        if (typeof optionIds === 'string') {
            optionIds = [optionIds];
        }
        return await browser.storage.local.get(optionIds.map((optionId) => this._prefix+optionId)).then(
            (items) => {
                const optionsWithDefaultValues = {};
                optionIds.forEach((optionId) => {
                    const realOptionId = this._prefix+optionId;
                    if (items[realOptionId] !== undefined) {
                        optionsWithDefaultValues[optionId] = items[realOptionId];
                    } else {
                        optionsWithDefaultValues[optionId] = this._defaults[realOptionId];
                    }
                });
                return optionsWithDefaultValues;
            }
        );
    }

    /**
     * Subscribe to be notified about options changes.
     * @param optionId to watch changes
     * @param callback function to call with the change object
     * @public
     */
    subscribeToOptionChange(optionId, callback) {
        browser.storage.onChanged.addListener((changes, areaName) => {
            if (changes[this._prefix+optionId]) {
                callback(changes[this._prefix+optionId]);
            }
        });
    }

    /**
     * Reset all options to default values.
     * @returns promise that will be fulfilled with nothing after the defaults are reset
     * @public
     * @async
     */
    async resetDefaults() {
        await browser.storage.local.set(this._defaults);
    }
}
