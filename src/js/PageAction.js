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
        // TODO: refactor this elsewhere
        const toProjectMap = new Map([
            ['addons.mozilla.org', 'amo'],
            ['www.changecopyright.org', 'copyright-campaign'],
            ['accounts.firefox.com', 'firefox-accounts'],
            ['screenshots.firefox.com', 'firefox-screenshots'],
            ['donate.mozilla.org', 'fundraising'],
            ['developer.mozilla.org', 'mdn'],
            ['advocacy.mozilla.org', 'mozilla-advocacy'],
            ['learning.mozilla.org', 'mozilla-learning-network'],
            ['www.mozilla.org', 'mozillaorg'],
            ['www-dev.allizom.org', 'mozillaorg'],
            ['mozillians.org', 'mozillians'],
            ['support.mozilla.org', 'sumo'],
            ['send.firefox.com', 'test-pilot-firefox-send'],
            ['testpilot.firefox.com', 'test-pilot-website'],
            ['thimble.mozilla.org', 'thimble']
        ]);
        const project = toProjectMap.get(tmpLink.hostname);
        if (project) {
            return `/projects/${project}/`;
        } else {
            return undefined;
        }
    }
}