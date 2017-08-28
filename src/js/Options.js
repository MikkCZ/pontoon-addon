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

    _getDefaultFor: function(id) {
        switch(id) {
            case `${this._prefix}notifications_update_interval`:
                return 15;
                break;
            case `${this._prefix}locale_team`:
                return navigator.language || navigator.userLanguage;
                break;
        }
    },

    _setValue: function(input, value) {
        if (input.type != 'checkbox') {
            input.value = value;
        } else {
            input.checked = value;
        }
    },

    loadDefault: function(input) {
        var defaultValue = this._getDefaultFor(this._getOptionId(input));
        this._setValue(input, defaultValue);
    },

    loadAllFromLocalStorage: function() {
        chrome.storage.local.get(function (items) {
            Object.keys(items).map(function(key, index) {
                if (key.startsWith(this._prefix)) {
                    var value = items[key];
                    var inputId = this._getInputId(key);
                    var input = document.getElementById(inputId);
                    this._setValue(input, value);
                }
            }.bind(this));
        }.bind(this));
    },

    get: function(optionIds, callback) {
        chrome.storage.local.get(optionIds, function(items) {
            for (optionId of optionIds) {
                if (items[optionId] === undefined) {
                    items[optionId] = this._getDefaultFor(optionId);
                }
            }
            callback(items);
        }.bind(this));
    },
}
