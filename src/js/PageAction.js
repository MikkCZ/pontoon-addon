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
        // TODO: refactor this elsewhere
        const toProjectMap = new Map([
            ['addons.mozilla.org', {slug: 'amo', name: 'AMO'}],
            ['www.changecopyright.org', {slug: 'copyright-campaign', name: 'EU Copyright campaign'}],
            ['accounts.firefox.com', {slug: 'firefox-accounts', name: 'Firefox Accounts'}],
            ['screenshots.firefox.com', {slug: 'firefox-screenshots', name: 'Firefox Screenshots'}],
            ['donate.mozilla.org', {slug: 'fundraising', name: 'Fundraising'}],
            ['developer.mozilla.org', {slug: 'mdn', name: 'MDN'}],
            ['advocacy.mozilla.org', {slug: 'mozilla-advocacy', name: 'Mozilla Advocacy'}],
            ['learning.mozilla.org', {slug: 'mozilla-learning-network', name: 'Mozilla Learning Network'}],
            ['www.mozilla.org', {slug: 'mozillaorg', name: 'Mozilla.org'}],
            ['www-dev.allizom.org', {slug: 'mozillaorg', name: 'Mozilla.org'}],
            ['mozillians.org', {slug: 'mozillians', name: 'Mozillians'}],
            ['support.mozilla.org', {slug: 'sumo', name: 'SUMO'}],
            ['send.firefox.com', {slug: 'test-pilot-firefox-send', name: 'Test Pilot: Firefox Send'}],
            ['testpilot.firefox.com', {slug: 'test-pilot-website', name: 'Test Pilot: Website'}],
            ['thimble.mozilla.org', {slug: 'thimble', name: 'Thimble'}]
        ]);
        return toProjectMap.get(tmpLink.hostname);
    }
}