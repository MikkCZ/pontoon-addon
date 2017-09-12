class PageAction {
    /**
     * Initialize instance and watch tabs navigation.
     * @param remotePontoon
     */
    constructor(remotePontoon) {
        this._remotePontoon = remotePontoon;
        this._addClickAction();
        this._watchTabsUpdates();
        // TODO: show page action for existing tabs (necessary for extension install/update/reload)
    }

    /**
     * Add click event handler.
     * @private
     */
    _addClickAction() {
        chrome.pageAction.onClicked.addListener((tab) =>
            chrome.tabs.create({url: this._remotePontoon.getTeamProjectUrl(this._getPontoonProjectUrlForPageUrl(tab.url))+'all-resources/'})
        );
    }

    /**
     * Show page action in recognized tabs.
     * @private
     */
    _watchTabsUpdates() {
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete' && this._getPontoonProjectUrlForPageUrl(tab.url)) {
                chrome.pageAction.show(tabId);
                // TODO: set page action title "Open ${project.name} in Pontoon"
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
        const tmpLink = document.createElement('a');
        tmpLink.href = pageUrl;
        // TODO: refactor this elsewhere + add mapping for all projects
        const toProjectMap = new Map([
            ['support.mozilla.org', 'sumo'],
            ['www.mozilla.org', 'mozillaorg'],
            ['www-dev.allizom.org', 'mozillaorg']
        ]);
        const project = toProjectMap.get(tmpLink.hostname);
        if (project) {
            return `/projects/${project}/`;
        } else {
            return undefined;
        }
    }
}