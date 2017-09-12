class Options {
    constructor() {
        this._prefix = 'options.';
        this._prefixRegExp = new RegExp('^' + this._prefix);
    }

    _getOptionId(input) {
        return this._prefix + input.id;
    }

    _getInputId(optionId) {
        return optionId.replace(this._prefixRegExp, '');
    }

    static _isValidInput(input) {
        return (input.parentElement.querySelector(':valid') === input);
    }

    static _getValueFromInput(input) {
        if (input.type !== 'checkbox') {
            return input.value;
        } else {
            return input.checked;
        }
    }

    _saveOption(id, value) {
        const option = {};
        option[id] = value;
        chrome.storage.local.set(option);
    }

    saveInputOnChange(e) {
        const input = e.target;
        if (Options._isValidInput(input)) {
            const optionId = this._getOptionId(input);
            const value = Options._getValueFromInput(input);
            this._saveOption(optionId, value);
        }
    }

    _defaults() {
        const defaults = {};
        defaults[`${this._prefix}data_update_interval`] = 15;
        defaults[`${this._prefix}locale_team`] = navigator.language || navigator.userLanguage;
        defaults[`${this._prefix}open_pontoon_on_button_click`] = false;
        defaults[`${this._prefix}hide_team_info_in_popup`] = false;
        return defaults;
    }

    static _setValueToInput(input, value) {
        if (input.type !== 'checkbox') {
            input.value = value;
        } else {
            input.checked = value;
        }
    }

    _loadAllFromObject(object) {
        Object.keys(object).map((key, index) => {
            if (key.startsWith(this._prefix)) {
                const input = document.getElementById(this._getInputId(key));
                const value = object[key];
                Options._setValueToInput(input, value);
            }
        });
    }

    loadAllFromLocalStorage() {
        this._loadAllFromObject(this._defaults());
        chrome.storage.local.get((items) => this._loadAllFromObject(items));
    }

    get(optionIds, callback) {
        if (typeof optionIds === 'string') {
            optionIds = [optionIds];
        }
        chrome.storage.local.get(optionIds, (items) => {
            for (const optionId of optionIds) {
                if (items[optionId] === undefined) {
                    items[optionId] = this._defaults()[optionId];
                }
            }
            callback(items);
        });
    }
}
