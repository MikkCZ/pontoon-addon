import { BackgroundPontoonMessageType } from 'Commons/src/BackgroundPontoonMessageType';
import { DataFetcher } from './DataFetcher';
if (!browser) { // eslint-disable-line no-use-before-define
    var browser = require('webextension-polyfill'); // eslint-disable-line no-var, no-inner-declarations
}

/**
 * Handles all communication with Pontoon web app and contains all information about it.
 */
export class RemotePontoon {
    /**
     * Initialize instance, listen to messages from tabs content and watch for options updates.
     * @param baseUrl Pontoon instance base URL
     * @param team locale
     * @param options
     * @todo get rid of the team parameter and use options to fetch is when needed
     */
    constructor(baseUrl, team, options) {
        this._baseUrl = baseUrl;
        this._baseUrlChangeListeners = new Set();
        this._team = team;
        this._options = options;
        this._domParser = new DOMParser();
        this._dataFetcher = new DataFetcher(this._options, this);

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
     * Get settings page URL.
     * @param utm_source to include into the URL
     * @returns {string}
     * @private
     */
    _getSettingsUrl(utm_source) {
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
        return `${this._baseUrl}/${this._team}/?utm_source=pontoon-addon`;
    }

    /**
     * Get team bugs list URL.
     * @returns {string}
     * @public
     * @todo add utm_source, see https://github.com/MikkCZ/pontoon-addon/pull/76#discussion_r195809548
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
        return this._baseUrl + projectUrl.replace('/projects/', `/${this._team}/`) + '?utm_source=pontoon-addon';
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
            return `${this._baseUrl}/${this._team}/${projectSlug}/all-resources/?search="${textToSearch.trim().replace(/ /g, '+')}"&utm_source=pontoon-addon`;
        }
        return `${this._baseUrl}/${this._team}/${projectSlug}/all-resources/?utm_source=pontoon-addon`;
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
        return `${this._baseUrl}/${this._team}/all-projects/all-resources/?status=${status}&utm_source=pontoon-addon`;
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
     * @private
     */
    _getQueryURL(query) {
        return `${this._baseUrl}/graphql?query=${query}`;
    }

    /**
     * Update notifications data if the Pontoon page contains a new one.
     * @param pageContent to check for new notifications
     * @private
     */
    _updateNotificationsIfThereAreNew(pageContent) {
        const page = this._domParser.parseFromString(pageContent, 'text/html');
        if (page.querySelector('header #notifications')) {
            const dataKey = 'notificationsData';
            Promise.all([
                browser.storage.local.get(dataKey),
                [...page.querySelectorAll('header .notification-item')].map((n) => n.dataset.id),
            ]).then(([
                storageItem,
                notificationsIdsFromPage,
            ]) => {
                const notificationsInStorage = storageItem[dataKey];
                if (!notificationsInStorage || !notificationsIdsFromPage.every(id => id in notificationsInStorage)) {
                    this.updateNotificationsData();
                }
            });
        }
    }

    /**
     * Subscribe to data change.
     * @param dataKey data key to subscribe for change to
     * @param callback function to call with the new value
     * @private
     */
    _subscribeToDataChange(dataKey, callback) {
        browser.storage.onChanged.addListener((changes, areaName) => {
            if (changes[dataKey] !== undefined) {
                callback(changes[dataKey]);
            }
        });
    }

    /**
     * Subscribe to notifications data change.
     * @param callback function to call with the new value
     * @public
     */
    subscribeToNotificationsChange(callback) {
        this._subscribeToDataChange('notificationsData', callback);
    }

    /**
     * Subscribe to change of Pontoon url.
     * @param callback function to call when the value changes
     * @public
     */
    subscribeToBaseUrlChange(callback) {
        this._baseUrlChangeListeners.add(callback);
    }

    /**
     * Update notifications data in storage.
     * @public
     */
    updateNotificationsData() {
        this._dataFetcher.fetchFromPontoonSession(`${this._baseUrl}/user-data/?utm_source=pontoon-addon-automation`).then(
            (response) => response.json()
        ).then((userData) => {
            const notificationsDataObj = {};
            userData.notifications.notifications.forEach(
                (n) => notificationsDataObj[n.id] = n
            );
            return notificationsDataObj;
        }).then(
            (nData) => browser.storage.local.set({notificationsData: nData})
        ).catch(
            (error) => browser.storage.local.set({notificationsData: undefined})
        );
    }

    /**
     * Update latest team activity in storage.
     * @public
     */
    updateLatestTeamActivity() {
        this._dataFetcher.fetch(this.getTeamsListUrl('pontoon-addon-automation')).then(
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
                        date_iso: latestActivityTime !== null ? latestActivityTime.attributes.datetime.value : undefined,
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
            this._dataFetcher.fetch(this._getQueryURL('{locales{code,name,approvedStrings,fuzzyStrings,stringsWithWarnings,stringsWithErrors,missingStrings,unreviewedStrings,totalStrings}}')).then((response) => response.json()),
            this._dataFetcher.fetch('https://l10n.mozilla-community.org/mozilla-l10n-query/?bugzilla=product').then((response) => response.json())
        ]).then(([pontoonData, bz_components]) => {
            const teamsListObj = {};
            pontoonData.data.locales
                .filter((locale) => locale.totalStrings > 0)
                .sort((locale1, locale2) => locale1.code.localeCompare(locale2.code))
                .forEach((locale) =>
                    teamsListObj[locale.code] = {
                        code: locale.code,
                        name: locale.name,
                        strings: {
                            approvedStrings: locale.approvedStrings,
                            fuzzyStrings: locale.fuzzyStrings,
                            stringsWithWarnings: locale.stringsWithWarnings,
                            stringsWithErrors: locale.stringsWithErrors,
                            missingStrings: locale.missingStrings,
                            unreviewedStrings: locale.unreviewedStrings,
                            totalStrings: locale.totalStrings,
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
        this._subscribeToDataChange('projectsList', callback);
    }

    /**
     * Get Pontoon project for the loaded page.
     * @param pageUrl loaded in a tab
     * @returns promise that will be fulfilled with project information or undefined, if no project is known for the url
     * @public
     */
    async getPontoonProjectForPageUrl(pageUrl) {
        const tmpLink = document.createElement('a');
        tmpLink.href = pageUrl;
        const toProjectMap = new Map();
        const dataKey = 'projectsList';
        await browser.storage.local.get(dataKey).then((item) => {
            if (item[dataKey]) {
                Object.values(item[dataKey]).forEach((project) =>
                    project.domains.forEach((domain) => toProjectMap.set(domain, project))
                );
            }
        });
        const projectData = toProjectMap.get(tmpLink.hostname);
        if (projectData) {
            return {
                name: projectData.name,
                pageUrl: this.getTeamProjectUrl(`/projects/${projectData.slug}/`),
                translationUrl: this.getTeamProjectUrl(`/projects/${projectData.slug}/all-resources/`),
            };
        } else {
            return undefined;
        }
    }

    /**
     * Subscribe to teams list change.
     * @param callback function to call with the new value
     * @public
     */
    subscribeToTeamsListChange(callback) {
        this._subscribeToDataChange('teamsList', callback);
    }

    /**
     * Update list of projects in storage from Pontoon.
     * @returns promise fulfilled with object containing projects in Pontoon and known domains
     * @public
     * @async
     */
    async updateProjectsList() {
        return await Promise.all([
            this._dataFetcher.fetch(this._getQueryURL('{projects{slug,name}}')).then((response) => response.json()),
            fetch(browser.runtime.getURL('packages/background/static/data/projects-list.json')).then((response) => response.json())
        ]).then(([
            pontoonData,
            projectsListJson
        ]) => {
            const projectsListObj = {};
            const projectsMap = new Map();
            pontoonData.data.projects.forEach((project) => projectsMap.set(project.slug, project));
            projectsListJson.map((project) => Object.assign(project, projectsMap.get(project.slug)))
                .forEach((project) => projectsListObj[project.slug] = project);
            browser.storage.local.set({projectsList: projectsListObj});
            return projectsListObj;
        });
    }

    /**
     * Listen to messages from commons/src/BackgroundPontoonClient.js.
     * @private
     */
    _listenToMessagesFromClients() {
        browser.runtime.onMessage.addListener((request, sender) => {
            switch (request.type) {
                case BackgroundPontoonMessageType.TO_BACKGROUND.PAGE_LOADED:
                    this._updateNotificationsIfThereAreNew(request.value);
                    break;
                case BackgroundPontoonMessageType.TO_BACKGROUND.NOTIFICATIONS_READ:
                    this._markAllNotificationsAsRead();
                    break;
                case BackgroundPontoonMessageType.TO_BACKGROUND.GET_NOTIFICATIONS_URL:
                    return Promise.resolve(`${this._baseUrl}/notifications/?utm_source=pontoon-addon`);
                case BackgroundPontoonMessageType.TO_BACKGROUND.GET_SETTINGS_URL:
                    return Promise.resolve(this._getSettingsUrl('pontoon-addon'));
                case BackgroundPontoonMessageType.TO_BACKGROUND.GET_SIGN_IN_URL:
                    return Promise.resolve(`${this._baseUrl}/accounts/fxa/login/?scope=profile%3Auid+profile%3Aemail+profile%3Adisplay_name`);
                case BackgroundPontoonMessageType.TO_BACKGROUND.GET_TEAM_PAGE_URL:
                    return Promise.resolve(this.getTeamPageUrl());
                case BackgroundPontoonMessageType.TO_BACKGROUND.GET_TEAM_PROJECT_URL:
                    return Promise.resolve(this.getTeamProjectUrl(request.args[0]));
                case BackgroundPontoonMessageType.TO_BACKGROUND.GET_STRINGS_WITH_STATUS_SEARCH_URL:
                    return Promise.resolve(this._getStringsWithStatusSearchUrl(request.args[0]));
                case BackgroundPontoonMessageType.TO_BACKGROUND.UPDATE_TEAMS_LIST:
                    return this.updateTeamsList();
                case BackgroundPontoonMessageType.TO_BACKGROUND.GET_TEAM_FROM_PONTOON:
                    return this._getTeamFromPontoon();
                case BackgroundPontoonMessageType.GET_CURRENT_TAB_PROJECT:
                    return browser.tabs.query({currentWindow: true, active: true}).then((tab) =>
                        this.getPontoonProjectForPageUrl(tab[0].url)
                    );
            }
        });
        this.subscribeToNotificationsChange((change) => {
            const message = {
                type: BackgroundPontoonMessageType.FROM_BACKGROUND.NOTIFICATIONS_UPDATED,
                data: change,
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
        this._options.subscribeToOptionChange('pontoon_base_url', (change) => {
            this._baseUrl = change.newValue;
            this._baseUrlChangeListeners.forEach((callback) => callback());
        });
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
        Promise.all([
            this._dataFetcher.fetchFromPontoonSession(`${this._baseUrl}/notifications/mark-all-as-read/?utm_source=pontoon-addon-automation`),
            browser.storage.local.get(dataKey)
        ]).then(([
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
     * @private
     * @async
     */
    async _getTeamFromPontoon() {
        const response = await this._dataFetcher.fetchFromPontoonSession(this._getSettingsUrl('pontoon-addon-automation'));
        const text = await response.text();
        const language = this._domParser.parseFromString(text, 'text/html').querySelector('#homepage .language');
        return language !== null ? language.dataset['code'] : undefined;
    }
}
