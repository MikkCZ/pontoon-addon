function RemotePontoon(team) {
    this._baseUrl = 'https://pontoon.mozilla.org';
    this._notificationsUrl = this._baseUrl + '/notifications/';
    this._markAsReadUrl = this._notificationsUrl + 'mark-all-as-read/';
    this._team = team;
    this._domParser = new DOMParser();
    this._listenToMessagesFromContent();
    this._watchOptionsUpdates();
}

RemotePontoon.prototype = {
    getBaseUrl: function() {
        return this._baseUrl;
    },

    getNotificationsUrl: function() {
        return this._notificationsUrl;
    },

    getMachineryUrl: function() {
        return `${this._baseUrl}/machinery/`;
    },

    getTeamPageUrl: function() {
        return `${this._baseUrl}/${this._team}/`;
    },

    getTeamBugsUrl: function() {
        return `${this._baseUrl}/${this._team}/bugs/`;
    },

    getTeamProjectUrl: function(projectsUrl) {
        return this._baseUrl + projectsUrl.replace('/projects/', `/${this._team}/`);
    },

    getSearchInFirefoxProjectUrl: function(textToSearch) {
        return `${this._baseUrl}/${this._team}/firefox/all-resources/?search=${textToSearch.replace(' ', '+')}`;
    },

    getSearchInMozillaOrgProjectUrl: function(textToSearch) {
        return `${this._baseUrl}/${this._team}/mozillaorg/all-resources/?search=${textToSearch.replace(' ', '+')}`;
    },

    _updateNotificationsDataFromPageContent: function(notificationsPageContent) {
        var notificationsPage = this._domParser.parseFromString(notificationsPageContent, 'text/html');
        if (notificationsPage.querySelector('header #notifications')) {
            var notificationsDataObj = {};
            for (const n of notificationsPage.querySelectorAll('header .notification-item[data-unread=true]')) {
                var nObj = {};
                nObj.id = n.dataset.id;
                nObj.actor = {text: n.querySelector('.actor a').textContent, link: n.querySelector('.actor a').getAttribute('href')};
                if (n.querySelector('.target')) {
                    nObj.target = {text: n.querySelector('.target a').textContent, link: n.querySelector('.target a').getAttribute('href')};
                }
                nObj.description = n.querySelector('.verb').textContent;
                nObj.timeago = n.querySelector('.timeago').textContent;
                notificationsDataObj[n.dataset.id] = nObj;
            }
            chrome.storage.local.set({notificationsData: notificationsDataObj});
        } else {
            chrome.storage.local.set({notificationsData: undefined});
        }
    },

    updateNotificationsData: function() {
        fetch(this.getNotificationsUrl(), {
            credentials: 'include',
        }).then(function(response) {
            return response.text();
        }.bind(this)).then(function(text) {
            this._updateNotificationsDataFromPageContent(text);
        }.bind(this));
    },

    _listenToMessagesFromContent: function() {
        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
            switch (request.type) {
                case 'pontoon-page-loaded':
                    this._updateNotificationsDataFromPageContent(request.value);
                    break;
                case 'mark-all-notifications-as-read-from-page':
                    this.markAllNotificationsAsRead();
                    break;
            }
        }.bind(this));
    },

    _watchOptionsUpdates: function() {
        chrome.storage.onChanged.addListener(function(changes, areaName) {
            if (changes['options.locale_team'] !== undefined) {
                this._team = changes['options.locale_team'].newValue;
            }
        }.bind(this));
    },

    _triggerNotificationsReload: function() {
        chrome.runtime.sendMessage({type: 'notifications-reload-request'});
    },

    markAllNotificationsAsRead: function() {
        browser.tabs.query({
            url: this.getBaseUrl() + '/*',
        }).then(function(pontoonTabs) {
            for (const tab of pontoonTabs) {
                chrome.tabs.sendMessage(tab.id, {type: 'mark-all-notifications-as-read-from-extension'});
            }
        }.bind(this));

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
