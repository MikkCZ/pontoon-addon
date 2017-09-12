class RemotePontoon {
    constructor(team) {
        this._baseUrl = 'https://pontoon.mozilla.org';
        this._notificationsUrl = this._baseUrl + '/notifications/';
        this._markAsReadUrl = this._notificationsUrl + 'mark-all-as-read/';
        this._team = team;
        this._domParser = new DOMParser();
        this._listenToMessagesFromContent();
        this._watchOptionsUpdates();
    }

    getBaseUrl() {
        return this._baseUrl;
    }

    getNotificationsUrl() {
        return this._notificationsUrl;
    }

    getMachineryUrl() {
        return `${this._baseUrl}/machinery/`;
    }

    getTeamPageUrl() {
        return `${this._baseUrl}/${this._team}/`;
    }

    getTeamBugsUrl() {
        return `${this._baseUrl}/${this._team}/bugs/`;
    }

    getTeamProjectUrl(projectsUrl) {
        return this._baseUrl + projectsUrl.replace('/projects/', `/${this._team}/`);
    }

    getSearchInFirefoxProjectUrl(textToSearch) {
        return `${this._baseUrl}/${this._team}/firefox/all-resources/?search=${textToSearch.replace(' ', '+')}`;
    }

    getSearchInMozillaOrgProjectUrl(textToSearch) {
        return `${this._baseUrl}/${this._team}/mozillaorg/all-resources/?search=${textToSearch.replace(' ', '+')}`;
    }

    getTeamCode() {
        return this._team;
    }

    _updateNotificationsDataFromPageContent(notificationsPageContent) {
        const notificationsPage = this._domParser.parseFromString(notificationsPageContent, 'text/html');
        if (notificationsPage.querySelector('header #notifications')) {
            const notificationsDataObj = {};
            for (const n of notificationsPage.querySelectorAll('header .notification-item[data-unread=true]')) {
                const nObj = {};
                nObj.id = n.dataset.id;
                nObj.actor = {text: n.querySelector('.actor a').textContent, link: n.querySelector('.actor a').getAttribute('href')};
                if (n.querySelector('.target')) {
                    nObj.target = {text: n.querySelector('.target a').textContent, link: n.querySelector('.target a').getAttribute('href')};
                }
                nObj.verb = n.querySelector('.verb').textContent;
                nObj.timeago = n.querySelector('.timeago').textContent;
                if (n.querySelector('.message')) {
                    nObj.message = n.querySelector('.message').textContent;
                }
                notificationsDataObj[n.dataset.id] = nObj;
            }
            chrome.storage.local.set({notificationsData: notificationsDataObj});
        } else {
            chrome.storage.local.set({notificationsData: undefined});
        }
    }

    updateNotificationsData() {
        fetch(this.getNotificationsUrl(), {
            credentials: 'include',
        }).then(function(response) {
            return response.text();
        }.bind(this)).then(function(text) {
            this._updateNotificationsDataFromPageContent(text);
        }.bind(this));
    }

    _getTextWithoutChildren(element) {
        for (const child of element.childNodes) {
            if (child.nodeName === '#text' && child.textContent.trim().length > 0) {
                return child.textContent.trim();
            }
        }
        return '';
    }

    _updateDataFromTeamPageContent(teamPageContent) {
        const teamPage = this._domParser.parseFromString(teamPageContent, 'text/html');
        if (teamPage.querySelector('#heading .legend')) {
            const teamDataObj = {};
            teamDataObj.teamName = teamPage.querySelector('h1 .None').textContent;
            teamDataObj.strings = {};
            for (const item of teamPage.querySelectorAll('#heading .legend li')) {
                const iObj = {};
                iObj.status = item.getAttribute('class');
                iObj.title = this._getTextWithoutChildren(item);
                iObj.count = item.querySelector('.value').textContent;
                teamDataObj.strings[iObj.status] = iObj;
            }
            chrome.storage.local.set({teamData: teamDataObj});
        } else {
            chrome.storage.local.set({teamData: undefined});
        }
    }

    updateTeamData() {
        fetch(this.getTeamPageUrl()).then(function(response) {
            return response.text();
        }.bind(this)).then(function(text) {
            this._updateDataFromTeamPageContent(text);
        }.bind(this));
    }

    _listenToMessagesFromContent() {
        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
            switch (request.type) {
                case 'pontoon-page-loaded':
                    this._updateNotificationsDataFromPageContent(request.value);
                    if (request.url === this.getTeamPageUrl()) {
                        this._updateDataFromTeamPageContent(request.value);
                    }
                    break;
                case 'mark-all-notifications-as-read-from-page':
                    this.markAllNotificationsAsRead();
                    break;
            }
        }.bind(this));
    }

    _watchOptionsUpdates() {
        chrome.storage.onChanged.addListener(function(changes, areaName) {
            if (changes['options.locale_team'] !== undefined) {
                this._team = changes['options.locale_team'].newValue;
            }
        }.bind(this));
    }

    markAllNotificationsAsRead() {
        browser.tabs.query({
            url: this.getBaseUrl() + '/*',
        }).then(function(pontoonTabs) {
            for (const tab of pontoonTabs) {
                chrome.tabs.sendMessage(tab.id, {type: 'mark-all-notifications-as-read-from-extension'});
            }
        }.bind(this));

        const request = new XMLHttpRequest();
        request.addEventListener('readystatechange', function (e) {
            if(request.readyState === XMLHttpRequest.DONE) {
                chrome.storage.local.set({notificationsData: {}});
            }
        }.bind(this));
        request.open('GET', this._markAsReadUrl, true);
        request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        request.send(null);
    }
}
