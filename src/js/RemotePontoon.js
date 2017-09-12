class RemotePontoon {
    /**
     * Initialize instance, listen to messages from tabs content and watch for options updates.
     * @param team locale
     */
    constructor(team) {
        this._baseUrl = 'https://pontoon.mozilla.org';
        this._notificationsUrl = this._baseUrl + '/notifications/';
        this._markAsReadUrl = this._notificationsUrl + 'mark-all-as-read/';
        this._team = team;
        this._domParser = new DOMParser();
        this._listenToMessagesFromContent();
        this._watchOptionsUpdates();
    }

    /**
     * Get home page URL.
     * @returns {string}
     */
    getBaseUrl() {
        return this._baseUrl;
    }

    /**
     * Get notifications page URL.
     * @returns {string}
     */
    getNotificationsUrl() {
        return this._notificationsUrl;
    }

    /**
     * Get machinery page URL.
     * @returns {string}
     */
    getMachineryUrl() {
        return `${this._baseUrl}/machinery/`;
    }

    /**
     * Get team page URL.
     * @returns {string}
     */
    getTeamPageUrl() {
        return `${this._baseUrl}/${this._team}/`;
    }

    /**
     * Get team bugs list URL.
     * @returns {string}
     */
    getTeamBugsUrl() {
        return `${this._baseUrl}/${this._team}/bugs/`;
    }

    /**
     * Get project URL for the team.
     * @param projectsUrl general project URL
     * @returns {string} team specific URL
     */
    getTeamProjectUrl(projectsUrl) {
        return this._baseUrl + projectsUrl.replace('/projects/', `/${this._team}/`);
    }

    /**
     * Get URL to search in Firefox project.
     * @param textToSearch
     * @returns {string}
     */
    getSearchInFirefoxProjectUrl(textToSearch) {
        return `${this._baseUrl}/${this._team}/firefox/all-resources/?search=${textToSearch.replace(' ', '+')}`;
    }

    /**
     * Get URL to search in Mozilla.org project.
     * @param textToSearch
     * @returns {string}
     */
    getSearchInMozillaOrgProjectUrl(textToSearch) {
        return `${this._baseUrl}/${this._team}/mozillaorg/all-resources/?search=${textToSearch.replace(' ', '+')}`;
    }

    /**
     * Get team locale code.
     * @returns {string}
     */
    getTeamCode() {
        return this._team;
    }

    /**
     * Extract unread notification data from notification item to data object.
     * @param n notifications list item
     * @returns {{}} notification data object
     * @private
     */
    static _createUnreadNotificationData(n) {
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
        return nObj;
    }

    /**
     * Update notifications data in storage from notifications page content.
     * @param notificationsPageContent
     * @private
     */
    _updateNotificationsDataFromPageContent(notificationsPageContent) {
        const notificationsPage = this._domParser.parseFromString(notificationsPageContent, 'text/html');
        if (notificationsPage.querySelector('header #notifications')) {
            const notificationsDataObj = {};
            [...notificationsPage.querySelectorAll('header .notification-item[data-unread=true]')]
                .map((n) => RemotePontoon._createUnreadNotificationData(n))
                .forEach((nObj) => notificationsDataObj[nObj.id] = nObj);
            chrome.storage.local.set({notificationsData: notificationsDataObj});
        } else {
            chrome.storage.local.set({notificationsData: undefined});
        }
    }

    /**
     * Update notifications data in storage.
     */
    updateNotificationsData() {
        fetch(this.getNotificationsUrl(), {
            credentials: 'include',
        }).then(
            (response) => response.text()
        ).then(
            (text) => this._updateNotificationsDataFromPageContent(text)
        );
    }

    /**
     * Get text contained directly in the element (ignore content of children).
     * @param element
     * @returns {string}
     * @private
     */
    static _getTextFromElementWithoutChildrenText(element) {
        const text = [...element.childNodes]
            .filter((child) => child.nodeName === '#text')
            .map((child) => child.textContent.trim())
            .find((text) => text.length > 0);
        if (text !== undefined) {
            return text;
        } else {
            return '';
        }
    }

    /**
     * Extract strings status data from list item to data object.
     * @param item list item
     * @returns {{}} string status data object
     * @private
     */
    static _createTeamStringStatusObject(item) {
        const iObj = {};
        iObj.status = item.getAttribute('class');
        iObj.title = RemotePontoon._getTextFromElementWithoutChildrenText(item);
        iObj.count = item.querySelector('.value').textContent;
        return iObj;
    }

    /**
     * Update team info in storage from team page content.
     * @param teamPageContent
     * @private
     */
    _updateDataFromTeamPageContent(teamPageContent) {
        const teamPage = this._domParser.parseFromString(teamPageContent, 'text/html');
        if (teamPage.querySelector('#heading .legend')) {
            const teamDataObj = {};
            teamDataObj.teamName = teamPage.querySelector('h1 .None').textContent;
            teamDataObj.strings = {};
            [...teamPage.querySelectorAll('#heading .legend li')]
                .map((item) => RemotePontoon._createTeamStringStatusObject(item))
                .forEach((iObj) => teamDataObj.strings[iObj.status] = iObj);
            chrome.storage.local.set({teamData: teamDataObj});
        } else {
            chrome.storage.local.set({teamData: undefined});
        }
    }

    /**
     * Update team info in storage.
     */
    updateTeamData() {
        fetch(this.getTeamPageUrl()).then(
            (response) => response.text()
        ).then(
            (text) => this._updateDataFromTeamPageContent(text)
        );
    }

    /**
     * Listen to messages from tabs content to update storage data accordingly.
     * @private
     */
    _listenToMessagesFromContent() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
        });
    }

    /**
     * Keep the team locale in sync with the options.
     * @private
     */
    _watchOptionsUpdates() {
        chrome.storage.onChanged.addListener((changes, areaName) => {
            if (changes['options.locale_team'] !== undefined) {
                this._team = changes['options.locale_team'].newValue;
            }
        });
    }

    /**
     * Mark all notifications as read both in Pontoon and in the storage.
     */
    markAllNotificationsAsRead() {
        browser.tabs.query({
            url: this.getBaseUrl() + '/*',
        }).then((pontoonTabs) => {
            pontoonTabs.forEach((tab) =>
                chrome.tabs.sendMessage(tab.id, {type: 'mark-all-notifications-as-read-from-extension'})
            );
        });

        const request = new XMLHttpRequest();
        request.addEventListener('readystatechange', (e) => {
            if(request.readyState === XMLHttpRequest.DONE) {
                chrome.storage.local.set({notificationsData: {}});
            }
        });
        request.open('GET', this._markAsReadUrl, true);
        request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        request.send(null);
    }
}
