class PageAction {
    /**
     * Initialize instance, watch tabs navigation and options changes.
     * @param options
     * @param remotePontoon
     */
    constructor(options, remotePontoon) {
        this._options = options;
        this._remotePontoon = remotePontoon;

        this._watchOptionsUpdates();
        this._watchStorageChanges();
        this._watchTabsUpdates();
        this._listenToMessagesFromPageAction();
        this._refreshAllTabsPageAction();
    }

    /**
     * Keep click action in sync with options.
     * @private
     */
    _watchOptionsUpdates() {
        this._options.subscribeToOptionChange('display_page_action', (change) =>
            this._refreshAllTabsPageAction(change.newValue)
        );
    }

    /**
     * Update page actions when the list of projects changes.
     * @private
     */
    _watchStorageChanges() {
        this._remotePontoon.subscribeToProjectsListChange(
            (change) => this._refreshAllTabsPageAction()
        );
    }

    /**
     * Listen to messages from opened page action menus
     * @private
     */
    _listenToMessagesFromPageAction() {
        browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
            switch (request.type) {
                case 'page-action-opened':
                    browser.tabs.query({currentWindow: true, active: true}).then((tab) => {
                        this._getPontoonProjectForPageUrl(tab[0].url).then((projectData) => {
                            // NOTE: The request-response messaging does not work here, because we are in async code here.
                            browser.runtime.sendMessage({
                                type: 'page-action-project-data',
                                project: {
                                    name: projectData.name,
                                    pageUrl: this._remotePontoon.getTeamProjectUrl(`/projects/${projectData.slug}/`),
                                    translationUrl: this._remotePontoon.getTeamProjectUrl(`/projects/${projectData.slug}/all-resources/`),
                                }
                            });
                        });
                    });
                    break;
            }
        });
    }

    /**
     * Show page action in recognized tabs.
     * @private
     */
    _watchTabsUpdates() {
        browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete') {
                this._showPageActionForTab(tab);
            }
        });
    }

    /**
     * Refresh page action for all tab.
     * @param show optional boolean to force show (true) or hide (false)
     * @private
     */
    _refreshAllTabsPageAction(show) {
        const optionKey = 'display_page_action';
        Promise.all([
            browser.tabs.query({}),
            this._options.get(optionKey)
        ]).then(([
            tabs,
            optionItem
        ]) => {
            if (show === undefined) {
                tabs.forEach((tab) => this._showPageActionForTab(tab, optionItem[optionKey]));
            } else {
                tabs.forEach((tab) => this._showPageActionForTab(tab, show));
            }
        });
    }

    /**
     * Show page action if the tab is recognized.
     * @param tab to recognize and show page action for
     * @param show optional boolean to force show (true) or hide (false)
     * @private
     */
    async _showPageActionForTab(tab, show) {
        const projectData = await this._getPontoonProjectForPageUrl(tab.url);
        if (projectData) {
            if (show === undefined) {
                const optionKey = 'display_page_action';
                show = (await this._options.get(optionKey))[optionKey];
            }
            if(show) {
                this._activatePageAction(tab.id);
                browser.pageAction.setTitle({tabId: tab.id, title: `Open ${projectData.name} in Pontoon`});
            } else {
                this._deactivatePageAction(tab.id);
                browser.pageAction.setTitle({tabId: tab.id, title: 'Pontoon Tools page action is disabled'});
            }
        } else {
            this._deactivatePageAction(tab.id);
            browser.pageAction.setTitle({tabId: tab.id, title: 'No project for this page'});
        }
    }

    /**
     * Activate the page action for tab with the right icon.
     * @param tabId to show the page action for
     * @private
     */
    _activatePageAction(tabId) {
        browser.pageAction.setIcon({
            path: {
              16: "img/pontoon-logo.svg",
              32: "img/pontoon-logo.svg"
            },
            tabId: tabId,
        });
        browser.pageAction.show(tabId);
    }

    /**
     * Show the page action for tab with the right icon.
     * @param tabId to show the page action for
     * @private
     */
    _deactivatePageAction(tabId) {
        browser.pageAction.setIcon({
            path: {
                16: "img/pontoon-logo-gray-alpha.svg",
                32: "img/pontoon-logo-gray-alpha.svg"
            },
            tabId: tabId,
        });
        browser.pageAction.hide(tabId);
    }

    /**
     * Get Pontoon project for the loaded page.
     * @param pageUrl loaded in a tab
     * @returns {object|undefined}
     * @private
     */
    async _getPontoonProjectForPageUrl(pageUrl) {
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
        return toProjectMap.get(tmpLink.hostname);
    }
}