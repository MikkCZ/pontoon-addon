function ToolbarButton(options, remotePontoon) {
    this._options = options;
    this._remotePontoon = remotePontoon;
    this._updateError = false;
    this._refreshInterval;

    this._init();
}

ToolbarButton.prototype = {
    _init: function() {
        this._addContextMenu();
        this._watchStorageChanges();
        this._watchOptionsUpdates();
        this._listenToMessagesFromPopup();
        this._reload();
    },

    _updateNumberOfUnreadNotifications: function() {
        this._updateBadge('');
        this._remotePontoon.updateNotificationsDocText();
    },

    _setRefresh: function(intervalMinutes) {
        clearInterval(this._refreshInterval);
        this._refreshInterval = setInterval(this._updateNumberOfUnreadNotifications.bind(this), intervalMinutes * 60 * 1000);
    },

    _scheduleOrUpdateRefreshWithInterval: function(intervalMinutes) {
        if (!this._updateError) {
            this._setRefresh(intervalMinutes);
        } else {
            this._setRefresh(1);
        }
    },

    _scheduleOrUpdateRefresh: function() {
        var optionKey = 'options.notifications_update_interval';
        this._options.get([optionKey], function(item) {
            var intervalMinutes = parseInt(item[optionKey], 10);
            this._scheduleOrUpdateRefreshWithInterval(intervalMinutes);
        }.bind(this));
    },

    _watchStorageChanges: function() {
        chrome.storage.onChanged.addListener(function(changes, areaName) {
            var docKey = 'notificationsDocText';
            if (changes[docKey] !== undefined) {
                var docContent = changes[docKey].newValue;
                if (docContent != undefined) {
                    var notificationsDoc = new DOMParser().parseFromString(docContent, 'text/html');
                    var unreadCount = notificationsDoc.querySelectorAll('header .notification-item[data-unread=true]').length;
                    this._updateBadge(unreadCount);
                } else {
                    this._updateBadge('!');
                    this._scheduleOrUpdateRefresh();
                }
            }
        }.bind(this));
    },

    _watchOptionsUpdates: function() {
        chrome.storage.onChanged.addListener(function(changes, areaName) {
            var optionKey = 'options.notifications_update_interval';
            if (changes[optionKey] !== undefined) {
                var intervalMinutes = parseInt(changes[optionKey].newValue, 10);
                this._scheduleOrUpdateRefreshWithInterval(intervalMinutes);
            }
        }.bind(this));
    },

    _listenToMessagesFromPopup: function() {
        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
            if (request.type == 'notifications-reload-request') {
                this._reload();
            }
        }.bind(this));
    },

    _addContextMenu: function() {
        chrome.contextMenus.create({
            title: 'Reload notifications',
            contexts: ['browser_action'],
            onclick: this._reload.bind(this),
        });
    },

    _updateBadge: function(text) {
        chrome.browserAction.setBadgeText({text: text.toString()});
        if (text != 0) {
            chrome.browserAction.setBadgeBackgroundColor({color: '#F36'});
        } else {
            chrome.browserAction.setBadgeBackgroundColor({color: '#4d5967'});
        }
    },

    _reload: function() {
        this._updateNumberOfUnreadNotifications();
        this._scheduleOrUpdateRefresh();
    },
}
