/**
 * Encapsulates all communication with Pontoon and contains all information about it.
 * @requires BackgroundPontoonMessageType.js
 */
class RemotePontoon {
    /**
     * Initialize instance, listen to messages from tabs content and watch for options updates.
     * @param baseUrl Pontoon instance base URL
     * @param team locale
     * @param options
     * @todo get rid of the team parameter and use options to fetch is when needed
     */
    constructor(baseUrl, team, options) {
        this._baseUrl = baseUrl;
        this._notificationsUrl = this._baseUrl + '/notifications/';
        this._markAsReadUrl = this._notificationsUrl + 'mark-all-as-read/';
        this._team = team;
        this._options = options;
        this._domParser = new DOMParser();
        this._listenToMessagesFromClients();
        this._watchOptionsUpdates();
    }

    /**
     * Get home page URL.
     * @returns {string}
     * @public
     */
    getBaseUrl() {
        return this._baseUrl;
    }

    /**
     * Get notifications page URL.
     * @param utm_source to include into the URL
     * @returns {string}
     * @private
     */
    _getNotificationsUrl(utm_source) {
        if (utm_source !== undefined) {
            return `${this._notificationsUrl}?utm_source=${utm_source}`;
        }
        return this._notificationsUrl;
    }

    /**
     * Get settings page URL.
     * @param utm_source to include into the URL
     * @returns {string}
     * @public
     */
    getSettingsUrl(utm_source) {
        if (utm_source !== undefined) {
            return `${this._baseUrl}/settings/?utm_source=${utm_source}`;
        }
        return `${this._baseUrl}/settings/`;
    }

    /**
     * Get team page URL.
     * @returns {string}
     * @public
     */
    getTeamPageUrl() {
        return `${this._baseUrl}/${this._team}/?utm_source=pontoon-tools`;
    }

    /**
     * Get team bugs list URL.
     * @returns {string}
     * @public
     * @todo add utm_source, see https://github.com/MikkCZ/pontoon-tools/pull/76#discussion_r195809548
     */
    getTeamBugsUrl() {
        return `${this._baseUrl}/${this._team}/bugs/`;
    }

    /**
     * Get project URL for the team.
     * @param projectUrl general project URL
     * @returns {string} team specific URL
     * @public
     */
    getTeamProjectUrl(projectUrl) {
        return this._baseUrl + projectUrl.replace('/projects/', `/${this._team}/`) + '?utm_source=pontoon-tools';
    }

    /**
     * Get URL to search text in project.
     * @param projectSlug
     * @param textToSearch
     * @returns {string}
     * @public
     */
    getSearchInProjectUrl(projectSlug, textToSearch) {
        if (textToSearch !== undefined) {
            return `${this._baseUrl}/${this._team}/${projectSlug}/all-resources/?search="${textToSearch.trim().replace(/ /g, '+')}"&utm_source=pontoon-tools`;
        }
        return `${this._baseUrl}/${this._team}/${projectSlug}/all-resources/?utm_source=pontoon-tools`;
    }

    /**
     * Get URL to search in all projects.
     * @param textToSearch
     * @returns {string}
     * @public
     */
    getSearchInAllProjectsUrl(textToSearch) {
        return this.getSearchInProjectUrl('all-projects', textToSearch);
    }

    /**
     * Get URL to display translation view with all string in given state.
     * @param status
     * @returns {string}
     * @private
     */
    _getStringsWithStatusSearchUrl(status) {
        return `${this._baseUrl}/${this._team}/all-projects/all-resources/?status=${status}&utm_source=pontoon-tools`;
    }

    /**
     * Get URL of the list of teams.
     * @param utm_source to include into the URL
     * @returns {string}
     * @public
     */
    getTeamsListUrl(utm_source) {
        if (utm_source !== undefined) {
            return `${this._baseUrl}/teams/?utm_source=${utm_source}`;
        }
        return `${this._baseUrl}/teams/`;
    }

    /**
     * Get URL for the given query.
     * @param query
     * @returns {string}
     * @public
     */
    getQueryURL(query) {
        return `${this._baseUrl}/graphql?query=${query}`;
    }

    /**
     * Get URL to sign in.
     * @returns {string}
     * @private
     */
    _getSignInURL() {
        return `${this._baseUrl}/accounts/fxa/login/?scope=profile%3Auid+profile%3Aemail+profile%3Adisplay_name`;
    }

    /**
     * Extract notification data from notification item to data object.
     * @param n notifications list item
     * @returns {{}} notification data object
     * @private
     * @static
     */
    static _createNotificationsData(n) {
        const nObj = {};
        nObj.id = n.dataset.id;
        nObj.unread = (n.dataset.unread === 'true');
        nObj.actor = {text: n.querySelector('.actor a').textContent, link: n.querySelector('.actor a').getAttribute('href')};
        if (n.querySelector('.target')) {
            nObj.target = {text: n.querySelector('.target a').textContent, link: n.querySelector('.target a').getAttribute('href')};
        }
        nObj.verb = n.querySelector('.verb').textContent;
        nObj.timeago = n.querySelector('.timeago').textContent;
        if (n.querySelector('.message')) {
            nObj.message = n.querySelector('.message').innerHTML;
        }
        return nObj;
    }

    /**
     * Update notifications data in storage from Pontoon page content.
     * @param pageContent
     * @private
     */
    _updateNotificationsDataFromPageContent(pageContent) {
        const page = this._domParser.parseFromString(pageContent, 'text/html');
        if (page.querySelector('header #notifications')) {
            const notificationsDataObj = {};
            [...page.querySelectorAll('header .notification-item')]
                .map((n) => RemotePontoon._createNotificationsData(n))
                .forEach((nObj) => notificationsDataObj[nObj.id] = nObj);
            browser.storage.local.set({notificationsData: notificationsDataObj});
        } else {
            browser.storage.local.set({notificationsData: undefined});
        }
    }

    /**
     * Subscribe to notifications data change.
     * @param callback function to call with the new value
     * @public
     */
    subscribeToNotificationsChange(callback) {
        browser.storage.onChanged.addListener((changes, areaName) => {
            const dataKey = 'notificationsData';
            if (changes[dataKey] !== undefined) {
                callback(changes[dataKey]);
            }
        });
    }

    /**
     * Update notifications data in storage.
     * @public
     */
    updateNotificationsData() {
        fetch(this._getNotificationsUrl('pontoon-tools-automation'), {
            credentials: 'include',
        }).then(
            (response) => response.text()
        ).then(
            (text) => this._updateNotificationsDataFromPageContent(text)
        );
    }

    /**
     * Update latest team activity in storage.
     * @public
     */
    updateLatestTeamActivity() {
        fetch(this.getTeamsListUrl('pontoon-tools-automation')).then(
            (response) => response.text()
        ).then((allTeamsPageContent) => {
            const latestActivityObj = {};
            const allTeamsPage = this._domParser.parseFromString(allTeamsPageContent, 'text/html');
            [...allTeamsPage.querySelectorAll('.team-list tbody tr')]
                .map((row) => {
                    const latestActivityTime = row.querySelector('.latest-activity time');
                    return {
                        team: row.querySelector('.code a').textContent,
                        user: latestActivityTime !== null ? latestActivityTime.dataset.userName : '',
                        date: latestActivityTime !== null ? new Date(latestActivityTime.attributes.datetime.value) : undefined,
                    };
                })
                .forEach((teamActivity) => {
                    latestActivityObj[teamActivity.team] = teamActivity;
                });
            if (Object.keys(latestActivityObj).length > 0) {
                browser.storage.local.set({latestTeamsActivity: latestActivityObj});
            } else {
                browser.storage.local.remove('latestTeamsActivity');
            }
        });
    }

    /**
     * Update list of teams in storage from Pontoon.
     * @returns promise fulfilled with sorted list of locale codes
     * @public
     * @async
     */
    async updateTeamsList() {
        return await Promise.all([
            fetch(this.getQueryURL('{locales{code,name,totalStrings,approvedStrings,fuzzyStrings,missingStrings,unreviewedStrings}}')).then((response) => response.json()),
            fetch('https://l10n.mozilla-community.org/mozilla-l10n-query/?bugzilla=product').then((response) => response.json())
        ]).then(([pontoonData, bz_components]) => {
            const teamsListObj = {};
            pontoonData.data.locales
                .sort((locale1, locale2) => locale1.code.localeCompare(locale2.code))
                .forEach((locale) =>
                    teamsListObj[locale.code] = {
                        code: locale.code,
                        name: locale.name,
                        strings: {
                            totalStrings: locale.totalStrings,
                            approvedStrings: locale.approvedStrings,
                            fuzzyStrings: locale.fuzzyStrings,
                            missingStrings: locale.missingStrings,
                            unreviewedStrings: locale.unreviewedStrings,
                        },
                        bz_component: bz_components[locale.code],
                    }
                );
            browser.storage.local.set({teamsList: teamsListObj});
            return teamsListObj;
        });
    }

    /**
     * Subscribe to projects list change.
     * @param callback function to call with the new value
     * @public
     */
    subscribeToProjectsListChange(callback) {
        browser.storage.onChanged.addListener((changes, areaName) => {
            const dataKey = 'projectsList';
            if (changes[dataKey] !== undefined) {
                callback(changes[dataKey]);
            }
        });
    }

    /**
     * Update list of projects in storage from Pontoon.
     * @returns promise fulfilled with object containing projects in Pontoon and known domains
     * @public
     * @async
     */
    async updateProjectsList() {
        return await fetch(this.getQueryURL('{projects{slug,name}}')).then((response) => response.json()).then(
            (data) => {
                const projectsListObj = {};
                const projectsMap = new Map();
                data.data.projects.forEach((project) => projectsMap.set(project.slug, project));
                [
                    {slug: 'amo', domains: ['addons.mozilla.org']},
                    {slug: 'copyright-campaign', domains: ['www.changecopyright.org']},
                    {slug: 'firefox-accounts', domains: ['accounts.firefox.com']},
                    {slug: 'firefox-screenshots', domains: ['screenshots.firefox.com']},
                    {slug: 'fundraising', domains: ['donate.mozilla.org']},
                    {slug: 'mdn', domains: ['developer.mozilla.org']},
                    {slug: 'mozilla-advocacy', domains: ['advocacy.mozilla.org']},
                    {slug: 'mozilla-learning-network', domains: ['learning.mozilla.org']},
                    {slug: 'mozillaorg', domains: ['www.mozilla.org', 'www-dev.allizom.org']},
                    {slug: 'mozillians', domains: ['mozillians.org']},
                    {slug: 'sumo', domains: ['support.mozilla.org']},
                    {slug: 'test-pilot-firefox-send', domains: ['send.firefox.com']},
                    {slug: 'test-pilot-website', domains: ['testpilot.firefox.com']},
                    {slug: 'thimble', domains: ['thimble.mozilla.org']}
                ]
                    .map((project) => Object.assign(project, projectsMap.get(project.slug)))
                    .forEach((project) => projectsListObj[project.slug] = project);
                browser.storage.local.set({projectsList: projectsListObj});
                return projectsListObj;
            }
        );
    }

    /**
     * Listen to messages from commons/js/BackgroundPontoonClient.js.
     * @private
     */
    _listenToMessagesFromClients() {
        browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
            switch (request.type) {
                case BackgroundPontoon.MessageType.TO_BACKGROUND.PAGE_LOADED:
                    this._updateNotificationsDataFromPageContent(request.value);
                    break;
                case BackgroundPontoon.MessageType.TO_BACKGROUND.NOTIFICATIONS_READ:
                    this._markAllNotificationsAsRead();
                    break;
                case BackgroundPontoon.MessageType.TO_BACKGROUND.GET_NOTIFICATIONS_URL:
                    sendResponse({response: this._getNotificationsUrl('pontoon-tools')});
                    break;
                case BackgroundPontoon.MessageType.TO_BACKGROUND.GET_SIGN_IN_URL:
                    sendResponse({response: this._getSignInURL()});
                    break;
                case BackgroundPontoon.MessageType.TO_BACKGROUND.GET_TEAM_PAGE_URL:
                    sendResponse({response: this.getTeamPageUrl()});
                    break;
                case BackgroundPontoon.MessageType.TO_BACKGROUND.GET_TEAM_PROJECT_URL:
                    sendResponse({response: this.getTeamProjectUrl(request.args[0])});
                    break;
                case BackgroundPontoon.MessageType.TO_BACKGROUND.GET_STRINGS_WITH_STATUS_SEARCH_URL:
                    sendResponse({response: this._getStringsWithStatusSearchUrl(request.args[0])});
                    break;
            }
        });
        this.subscribeToNotificationsChange((newNotificationsData) => {
            const message = {
                type: BackgroundPontoon.MessageType.FROM_BACKGROUND.NOTIFICATIONS_UPDATED,
                data: newNotificationsData,
            };
            browser.runtime.sendMessage(message);
            browser.tabs.query({url: this.getBaseUrl() + '/*'}).then(
                (pontoonTabs) => pontoonTabs.forEach((tab) =>
                    browser.tabs.sendMessage(tab.id, message)
                )
            );
        });
    }

    /**
     * Keep the team locale in sync with the options.
     * @private
     */
    _watchOptionsUpdates() {
        this._options.subscribeToOptionChange('pontoon_base_url', (change) =>
            this._baseUrl = change.newValue
        );
        this._options.subscribeToOptionChange('locale_team', (change) =>
            this._team = change.newValue
        );
    }

    /**
     * Mark all notifications as read both in Pontoon and in the storage.
     * @private
     */
    _markAllNotificationsAsRead() {
        const dataKey = 'notificationsData';
        const headers = new Headers();
        headers.append('X-Requested-With', 'XMLHttpRequest');
        Promise.all([
            browser.tabs.query({url: this.getBaseUrl() + '/*'}),
            fetch(this._markAsReadUrl, {method: 'GET', credentials: 'include', headers: headers}),
            browser.storage.local.get(dataKey)
        ]).then(([
            pontoonTabs,
            response,
            storageItem
        ]) => {
            if (response.ok) {
                Object.values(storageItem[dataKey]).forEach(n => n.unread = false);
                browser.storage.local.set({notificationsData: storageItem[dataKey]});
            }
        });
    }

    /**
     * Get locale team selected in Pontoon preferences.
     * @returns promise that will be fulfilled with the team code from the Pontoon settings page or from options
     * @public
     * @async
     */
    async getTeamFromPontoon() {
        const response = await fetch(this.getSettingsUrl('pontoon-tools-automation'), {credentials: 'include'});
        const text = await response.text();
        const language = this._domParser.parseFromString(text, 'text/html').querySelector('#homepage .language');
        return language !== null ? language.dataset['code'] : undefined;
    }
}
