function Options() {
    this._prefix = 'options.';
    this._prefixRegExp = new RegExp('^' + this._prefix);
}

Options.prototype = {
    _getOptionId: function(input) {
        return this._prefix + input.id;
    },

    _getInputId: function(optionId) {
        return optionId.replace(this._prefixRegExp, '');
    },

    _isValid: function(input) {
        return (input.parentElement.querySelector(':valid') === input);
    },

    _getValue: function(input) {
        if (input.type != 'checkbox') {
            return input.value;
        } else {
            return input.checked;
        }
    },

    _saveOption: function(id, value) {
        var option = { };
        option[id] = value;
        chrome.storage.local.set(option);
    },

    saveInputOnChange: function(e) {
        var input = e.target;
        if (this._isValid(input)) {
            var optionId = this._getOptionId(input);
            var value = this._getValue(input);
            this._saveOption(optionId, value);
        }
    },

    _defaults: function() {
        var defaults = {};
        defaults[`${this._prefix}notifications_update_interval`] = 15;
        defaults[`${this._prefix}locale_team`] = navigator.language || navigator.userLanguage;
        defaults[`${this._prefix}open_pontoon_on_button_click`] = false;
        return defaults;
    },

    _setValue: function(input, value) {
        if (input.type != 'checkbox') {
            input.value = value;
        } else {
            input.checked = value;
        }
    },

    _loadAllFromObject: function(object) {
        Object.keys(object).map(function(key, index) {
            if (key.startsWith(this._prefix)) {
                var input = document.getElementById(this._getInputId(key));
                var value = object[key];
                this._setValue(input, value);
            }
        }.bind(this));
    },

    loadAllFromLocalStorage: function() {
        this._loadAllFromObject(this._defaults());
        chrome.storage.local.get(function (items) {
            this._loadAllFromObject(items);
        }.bind(this));
    },

    get: function(optionIds, callback) {
        chrome.storage.local.get(optionIds, function(items) {
            for (const optionId of optionIds) {
                if (items[optionId] === undefined) {
                    items[optionId] = this._defaults()[optionId];
                }
            }
            callback(items);
        }.bind(this));
    },
}
