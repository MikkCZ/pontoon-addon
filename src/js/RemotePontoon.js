function RemotePontoon() {
    this._baseUrl = 'https://pontoon.mozilla.org';
    this._notificationsUrl = this._baseUrl + '/notifications/';
    this._markAsReadUrl = this._notificationsUrl + 'mark-all-as-read/';
    this._listenToMessagesFromContent();
}

RemotePontoon.prototype = {
    getBaseUrl: function() {
        return this._baseUrl;
    },

    getNotificationsUrl: function() {
        return this._notificationsUrl;
    },

    updateNotificationsDocText: function() {
        fetch(this.getNotificationsUrl(), {
            credentials: 'include',
            redirect: 'manual',
        }).then(function(response) {
            if (response.status == 200) {
                return response.text();
            } else {
                return undefined;
            }
        }.bind(this)).then(function(text) {
            if (text != undefined) {
                chrome.storage.local.set({notificationsDocText: text});
            } else {
                chrome.storage.local.set({notificationsDocText: undefined});
            }
        }.bind(this));
    },

    _listenToMessagesFromContent: function() {
        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
            if (request.type == 'pontoon-page-loaded') {
                chrome.storage.local.set({notificationsDocText: request.value});
            }
        }.bind(this));
    },

    _triggerNotificationsReload: function() {
        chrome.runtime.sendMessage({type: 'notifications-reload-request'});
    },

    markAllNotificationsAsRead: function() {
        var request = new XMLHttpRequest();
        request.addEventListener('readystatechange', function (e) {
            if(request.readyState === XMLHttpRequest.DONE) {
                 this._triggerNotificationsReload();
            }
        }.bind(this));
        request.open('GET', this._markAsReadUrl, true);
        request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        request.send(null);
    },
}