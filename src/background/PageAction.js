/**
 * Runs in the background and takes care of proper page actions displaying and project data.
 * @requires RemotePontoon.js
 */
class PageAction {
    /**
     * Initialize instance, watch tabs navigation and options changes.
     * @param remotePontoon
     */
    constructor(remotePontoon) {
        this._remotePontoon = remotePontoon;

        this._watchStorageChanges();
        this._watchTabsUpdates();
        this._listenToMessagesFromPageAction();
        this._refreshAllTabsPageActions();
    }

    /**
     * Update page actions when the list of projects changes.
     * @private
     */
    _watchStorageChanges() {
        this._remotePontoon.subscribeToProjectsListChange(
            (change) => this._refreshAllTabsPageActions()
        );
    }

    /**
     * Listen to messages from opened page action menus
     * @private
     */
    _listenToMessagesFromPageAction() {
        browser.runtime.onMessage.addListener((request, sender) => {
            switch (request.type) {
                case 'page-action-opened':
                    return browser.tabs.query({currentWindow: true, active: true}).then((tab) =>
                        this._getPontoonProjectForPageUrl(tab[0].url)
                    ).then((projectData) => {
                        return {
                            name: projectData.name,
                            pageUrl: this._remotePontoon.getTeamProjectUrl(`/projects/${projectData.slug}/`),
                            translationUrl: this._remotePontoon.getTeamProjectUrl(`/projects/${projectData.slug}/all-resources/`),
                        };
                    });
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
     * Refresh page action for all tabs.
     * @private
     */
    _refreshAllTabsPageActions() {
        browser.tabs.query({}).then((tabs) => tabs.forEach((tab) => this._showPageActionForTab(tab)));
    }

    /**
     * Show page action if the tab is recognized.
     * @param tab to recognize and show page action for
     * @private
     * @async
     */
    async _showPageActionForTab(tab) {
        const projectData = await this._getPontoonProjectForPageUrl(tab.url);
        if (projectData) {
            this._activatePageAction(tab.id);
            browser.pageAction.setTitle({tabId: tab.id, title: `Open ${projectData.name} in Pontoon`});
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
                16: 'commons/img/pontoon-logo.svg',
                32: 'commons/img/pontoon-logo.svg'
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
        browser.pageAction.setIcon({tabId: tabId});
        browser.pageAction.hide(tabId);
    }

    /**
     * Get Pontoon project for the loaded page.
     * @param pageUrl loaded in a tab
     * @returns promise that will be fulfilled with project information or undefined, if not project is known for the url
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
