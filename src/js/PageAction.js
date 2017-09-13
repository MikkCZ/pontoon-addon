class PageAction {
    /**
     * Initialize instance, watch tabs navigation and options changes.
     * @param options
     * @param remotePontoon
     */
    constructor(options, remotePontoon) {
        this._options = options;
        this._remotePontoon = remotePontoon;

        this._openProjectTranslationView = (tab) => chrome.tabs.create({url: this._getPontoonProjectTranslationUrlForPageUrl(tab.url)});
        this._openProjectPage = (tab) => chrome.tabs.create({url: this._getPontoonProjectPageUrlForPageUrl(tab.url)});
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
        chrome.storage.onChanged.addListener((changes, areaName) => {
            const actionOption = 'options.page_action_item_action';
            if (changes[actionOption]) {
                this._setClickAction(changes[actionOption].newValue);
            }
            const displayPageAction = 'options.display_page_action';
            if (changes[displayPageAction]) {
                this._refreshAllTabsPageAction(changes[displayPageAction].newValue);
            }
        });
    }

    /**
     * Add click event handler.
     * @private
     */
    _addOnClickAction() {
        const actionOption = 'options.page_action_item_action';
        this._options.get(actionOption, (item) => this._setClickAction(item[actionOption]));
    }

    /**
     * Set action for click.
     * @param action from options
     * @private
     */
    _setClickAction(action) {
        chrome.pageAction.onClicked.removeListener(this._openProjectTranslationView);
        chrome.pageAction.onClicked.removeListener(this._openProjectPage);
        switch (action) {
            case 'translation-view':
                chrome.pageAction.onClicked.addListener(this._openProjectTranslationView);
                break;
            case 'project-page':
                chrome.pageAction.onClicked.addListener(this._openProjectPage);
                break;
        }
    }

    /**
     * Show page action in recognized tabs.
     * @private
     */
    _watchTabsUpdates() {
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
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
                    const optionKey = 'options.display_page_action';
                    this._options.get(optionKey, (item) => {
                        tabs.forEach((tab) => this._showPageActionForTab(tab, item[optionKey]));
                    });
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
            chrome.pageAction.setTitle({tabId: tab.id, title: `Open ${projectData.name} in Pontoon`});
            if (show === undefined) {
                const optionKey = 'options.display_page_action';
                this._options.get(optionKey, (item) => {
                    if (item[optionKey]) {
                        chrome.pageAction.show(tab.id);
                    }
                })
            } else if(show) {
                chrome.pageAction.show(tab.id);
            } else {
                chrome.pageAction.hide(tab.id);
            }
        }
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