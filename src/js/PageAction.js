class PageAction {
    /**
     * Initialize instance and watch tabs navigation.
     * @param remotePontoon
     */
    constructor(remotePontoon) {
        this._remotePontoon = remotePontoon;
        this._addClickAction();
        this._watchTabsUpdates();

        browser.tabs.query({})
            .then((tabs) => {
                tabs.forEach((tab) => {
                    const projectData = this._getPontoonProjectForPageUrl(tab.url);
                    if (projectData) {
                        chrome.pageAction.setTitle({tabId: tab.id, title: `Open ${projectData.name} in Pontoon`});
                        chrome.pageAction.show(tab.id);
                    }
                });
            });
    }

    /**
     * Add click event handler.
     * @private
     */
    _addClickAction() {
        chrome.pageAction.onClicked.addListener((tab) =>
            chrome.tabs.create({url: this._getPontoonProjectUrlForPageUrl(tab.url)})
        );
    }

    /**
     * Show page action in recognized tabs.
     * @private
     */
    _watchTabsUpdates() {
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete') {
                const projectData = this._getPontoonProjectForPageUrl(tab.url);
                if (projectData) {
                    chrome.pageAction.setTitle({tabId: tabId, title: `Open ${projectData.name} in Pontoon`});
                    chrome.pageAction.show(tabId);
                }
            }
        });
    }

    /**
     * Get Pontoon project URL for the loaded page.
     * @param pageUrl loaded in a tab
     * @returns {string|undefined}
     * @private
     */
    _getPontoonProjectUrlForPageUrl(pageUrl) {
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