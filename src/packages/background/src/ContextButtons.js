if (!browser) { // eslint-disable-line no-use-before-define
    var browser = require('webextension-polyfill'); // eslint-disable-line no-var, no-inner-declarations
}

/**
 * Runs in the background and takes care of context button initialization on supported sites.
 */
export class ContextButtons {
    /**
     * Initialize instance and watch tabs navigation.
     */
    constructor(options, remotePontoon, remoteLinks) {
        this._options = options;
        this._remotePontoon = remotePontoon;
        this._remoteLinks = remoteLinks;
        const projectsListDataKey = 'projectsList';
        browser.storage.local.get(projectsListDataKey).then((storageItem) =>
            this._initMozillaWebsitesList(storageItem[projectsListDataKey])
        ).then(() => {
            this._listenToMessagesFromContentScript();
            this._watchTabsUpdates();
            this._refreshContextButtonsInAllTabs();
            remotePontoon.subscribeToProjectsListChange((change) => this._initMozillaWebsitesList(change.newValue));
        });
    }

    /**
     * Initialize the list of supported Mozilla websites to be checked against.
     * @private
     */
    _initMozillaWebsitesList(projects) {
        if (projects) {
            this._mozillaWebsites = [];
            Object.values(projects).forEach((project) =>
                project.domains.forEach((domain) => this._mozillaWebsites.push(`https://${domain}`))
            );
        }
    }

    /**
     * Enable context buttons for supported sites.
     * @private
     */
    _watchTabsUpdates() {
        browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete' && this._isSupportedPage(tab.url)) {
                this._injectContextButtonsScript(tab);
            }
        });
    }

    /**
     * Refresh context buttons script for all tabs.
     * @private
     */
    _refreshContextButtonsInAllTabs() {
        browser.tabs.query({}).then((tabs) => tabs.forEach((tab) => {
            if (this._isSupportedPage(tab.url)) {
                this._injectContextButtonsScript(tab);
            }
        }));
    }

    /**
     * Listen to messages from content script if the button is clicked.
     * @private
     */
    _listenToMessagesFromContentScript() {
        browser.runtime.onMessage.addListener((request, sender) => {
            switch (request.type) {
                case 'pontoon-search-context-button-clicked':
                    browser.tabs.create({url: this._remotePontoon.getSearchInAllProjectsUrl(request.text)});
                    break;
                case 'bugzilla-report-context-button-clicked': {
                    const localeTeamOptionKey = 'locale_team';
                    const teamsListDataKey = 'teamsList';
                    Promise.all([
                        this._options.get(localeTeamOptionKey),
                        browser.storage.local.get(teamsListDataKey),
                    ]).then(([optionsItems, storageItems]) => {
                        const teamCode = optionsItems[localeTeamOptionKey];
                        const team = storageItems[teamsListDataKey][teamCode];
                        browser.tabs.create({url: this._remoteLinks.getBugzillaReportUrlForSelectedTextOnPage(request.text, sender.url, team.code, team.bz_component)});
                    });
                    break;
                }
            }
        });
    }

    /**
     * Check if the page is supported Pontoon project or not.
     * @param url of the page to check
     * @returns {boolean} if the page is Mozilla website
     * @private
     */
    _isSupportedPage(url) {
        return this._mozillaWebsites.some((it) => url.startsWith(it));
    }

    /**
     * Inject context button content script
     * @param tab to inject content script into
     * @private
     */
    _injectContextButtonsScript(tab) {
        browser.tabs.executeScript(tab.id, {file: '/packages/content-scripts/build/context-buttons.js'});
    }
}
