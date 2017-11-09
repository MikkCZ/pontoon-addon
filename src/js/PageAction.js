class PageAction {
    /**
     * Initialize instance, watch tabs navigation and options changes.
     * @param options
     * @param remotePontoon
     */
    constructor(options, remotePontoon) {
        this._options = options;
        this._remotePontoon = remotePontoon;

        this._openProjectTranslationView = (tab) => browser.tabs.create({url: this._getPontoonProjectTranslationUrlForPageUrl(tab.url)});
        this._openProjectPage = (tab) => browser.tabs.create({url: this._getPontoonProjectPageUrlForPageUrl(tab.url)});
        this._addOnClickAction();
        this._watchOptionsUpdates();
        this._watchTabsUpdates();
        this._refreshAllTabsPageAction();
    }

    /**
     * Keep click action in sync with options.
     * @private
     */
    _watchOptionsUpdates() {
        this._options.subscribeToOptionChange('page_action_item_action', (change) =>
            this._setClickAction(change.newValue)
        );
        this._options.subscribeToOptionChange('display_page_action', (change) =>
            this._refreshAllTabsPageAction(change.newValue)
        );
    }

    /**
     * Add click event handler.
     * @private
     */
    _addOnClickAction() {
        const actionOption = 'page_action_item_action';
        this._options.get(actionOption).then(
            (item) => this._setClickAction(item[actionOption])
        );
    }

    /**
     * Set action for click.
     * @param action from options
     * @private
     */
    _setClickAction(action) {
        browser.pageAction.onClicked.removeListener(this._openProjectTranslationView);
        browser.pageAction.onClicked.removeListener(this._openProjectPage);
        switch (action) {
            case 'translation-view':
                browser.pageAction.onClicked.addListener(this._openProjectTranslationView);
                break;
            case 'project-page':
                browser.pageAction.onClicked.addListener(this._openProjectPage);
                break;
        }
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
        browser.tabs.query({})
            .then((tabs) => {
                if (show === undefined) {
                    const optionKey = 'display_page_action';
                    this._options.get(optionKey).then(
                        (item) => {
                            tabs.forEach((tab) => this._showPageActionForTab(tab, item[optionKey]));
                        }
                    );
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
    _showPageActionForTab(tab, show) {
        const projectData = this._getPontoonProjectForPageUrl(tab.url);
        if (projectData) {
            browser.pageAction.setTitle({tabId: tab.id, title: `Open ${projectData.name} in Pontoon`});
            if (show === undefined) {
                const optionKey = 'display_page_action';
                this._options.get(optionKey).then(
                    (item) => {
                        if (item[optionKey]) {
                            this._activatePageAction(tab.id);
                        }
                    }
                )
            } else if(show) {
                this._activatePageAction(tab.id);
            } else {
                this._deactivatePageAction(tab.id);
            }
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
     * Get Pontoon project page URL for the loaded page.
     * @param pageUrl loaded in a tab
     * @returns {string|undefined}
     * @private
     */
    _getPontoonProjectPageUrlForPageUrl(pageUrl) {
        const projectData = this._getPontoonProjectForPageUrl(pageUrl);
        if (projectData) {
            return this._remotePontoon.getTeamProjectUrl(`/projects/${projectData.slug}/`);
        } else {
            return undefined;
        }
    }

    /**
     * Get Pontoon project translation view URL for the loaded page.
     * @param pageUrl loaded in a tab
     * @returns {string|undefined}
     * @private
     */
    _getPontoonProjectTranslationUrlForPageUrl(pageUrl) {
        const projectData = this._getPontoonProjectForPageUrl(pageUrl);
        if (projectData) {
            return this._remotePontoon.getTeamProjectUrl(`/projects/${projectData.slug}/all-resources/`);
        } else {
            return undefined;
        }
    }

    /**
     * Get Pontoon project for the loaded page.
     * @param pageUrl loaded in a tab
     * @returns {object|undefined}
     * @private
     */
    _getPontoonProjectForPageUrl(pageUrl) {
        const tmpLink = document.createElement('a');
        tmpLink.href = pageUrl;
        const toProjectMap = this._remotePontoon.getDomainToProjectMap();
        return toProjectMap.get(tmpLink.hostname);
    }
}