function NotificationsPopup(remotePontoon) {
    this._remotePontoon = remotePontoon;

    this._init();
}

NotificationsPopup.prototype = {
    _init: function() {
        this._watchStorageChanges();
        this._loadNotificationsFromStorage();
    },

    _watchStorageChanges: function() {
        chrome.storage.onChanged.addListener(function(changes, areaName) {
            if (changes['nofiticationsData'] !== undefined) {
                this._displayNotifications(changes['nofiticationsData'].newValue);
            }
        }.bind(this));
    },

    _appendNotificationToList: function(list, notification) {
        var link = document.createElement('a');
        link.textContent = notification.link.text;
        link.setAttribute('href', this._remotePontoon.getTeamProjectUrl(notification.link.href));
        var description = document.createElement('span');
        description.textContent = ` ${notification.description}`;
        var timeago = document.createElement('div');
        timeago.textContent = notification.timeago;
        timeago.classList.add('timeago');
        var listItem = document.createElement('li');
        listItem.appendChild(link);
        listItem.appendChild(description);
        listItem.appendChild(timeago);
        list.appendChild(listItem);
    },

    _displayNotifications: function(notificationsData) {
        var notificationsList = document.getElementById('notification-list');
        var fullList = document.getElementById('full-list');
        var emptyList = document.getElementById('empty-list');
        var error = document.getElementById('error');

        if (notificationsData != undefined && Object.keys(notificationsData).length > 0) {
            while (notificationsList.lastChild) {
                notificationsList.removeChild(notificationsList.lastChild);
            }
            for (const nKey of Object.keys(notificationsData).sort().reverse()) {
                this._appendNotificationToList(notificationsList, notificationsData[nKey]);
            }
            notificationsList.classList.remove('hidden');
            fullList.classList.remove('hidden');
            emptyList.classList.add('hidden');
            error.classList.add('hidden');
        } else if (notificationsData != undefined) {
            notificationsList.classList.add('hidden');
            fullList.classList.add('hidden');
            emptyList.classList.remove('hidden');
            error.classList.add('hidden');
        } else {
            notificationsList.classList.add('hidden');
            fullList.classList.add('hidden');
            emptyList.classList.add('hidden');
            error.classList.remove('hidden');
        }
    },

    _loadNotificationsFromStorage: function() {
        var dataKey = 'notificationsData';
        chrome.storage.local.get(dataKey, function(item) {
            this._displayNotifications(item[dataKey]);
        }.bind(this));
    },
}
