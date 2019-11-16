if (!browser) { // eslint-disable-line no-use-before-define
    var browser = require('webextension-polyfill'); // eslint-disable-line no-var, no-inner-declarations
}

/**
 * Takes care of the toolbar button context menu.
 */
export class ToolbarButtonContextMenu {
    /**
     * Initialize instance and add context menu.
     * @param options
     * @param remotePontoon
     * @param remoteLinks
     * @param dataRefresher
     * @param toolbarButton
     */
    constructor(options, remotePontoon, remoteLinks, dataRefresher, toolbarButton) {
        this._options = options;
        this._remotePontoon = remotePontoon;
        this._remoteLinks = remoteLinks;
        this._dataRefresher = dataRefresher;
        this._toolbarButton = toolbarButton;

        this._addContextMenu();
    }

    /**
     * Add button context menu.
     * @private
     * @async
     */
    async _addContextMenu() {
        const localeTeam = await this._options.get('locale_team').then((item) => item['locale_team']);
        browser.contextMenus.create({
            title: 'Reload notifications',
            contexts: ['browser_action'],
            onclick: () => {
                this._toolbarButton.hideBadge();
                this._dataRefresher.refreshData();
            }
        });
        const pontoonPagesMenuId = browser.contextMenus.create({
            title: 'Pontoon',
            contexts: ['browser_action'],
        });
        browser.contextMenus.create({
            title: 'Team page',
            contexts: ['browser_action'],
            parentId: pontoonPagesMenuId,
            onclick: () => browser.tabs.create({url: this._remotePontoon.getTeamPageUrl()}),
        });
        browser.contextMenus.create({
            title: 'Team bugs',
            contexts: ['browser_action'],
            parentId: pontoonPagesMenuId,
            onclick: () => browser.tabs.create({url: this._remotePontoon.getTeamBugsUrl()}),
        });
        browser.contextMenus.create({
            title: 'Search all projects',
            contexts: ['browser_action'],
            parentId: pontoonPagesMenuId,
            onclick: () => browser.tabs.create({url: this._remotePontoon.getSearchInAllProjectsUrl()}),
        });
        const searchMenuId = browser.contextMenus.create({
            title: 'Search l10n',
            contexts: ['browser_action'],
        });
        browser.contextMenus.create({
            title: 'Search in Pontoon',
            contexts: ['browser_action'],
            parentId: searchMenuId,
            onclick: () => browser.tabs.create({url: this._remotePontoon.getSearchInAllProjectsUrl()}),
        });
        browser.contextMenus.create({
            title: 'Transvision',
            contexts: ['browser_action'],
            parentId: searchMenuId,
            onclick: () => browser.tabs.create({url: this._remoteLinks.getTransvisionUrl(localeTeam)}),
        });
        browser.contextMenus.create({
            title: 'Microsoft Terminology Search',
            contexts: ['browser_action'],
            parentId: searchMenuId,
            onclick: () => browser.tabs.create({url: this._remoteLinks.getMicrosoftTerminologySearchUrl()}),
        });
        const localizationResourcesMenuId = browser.contextMenus.create({
            title: 'Other l10n sources',
            contexts: ['browser_action'],
        });
        browser.contextMenus.create({
            title: `Mozilla Style Guide (${localeTeam})`,
            contexts: ['browser_action'],
            parentId: localizationResourcesMenuId,
            onclick: () => browser.tabs.create({url: this._remoteLinks.getMozillaStyleGuidesUrl(localeTeam)}),
        });
        browser.contextMenus.create({
            title: `L10n:Teams:${localeTeam} - MozillaWiki`,
            contexts: ['browser_action'],
            parentId: localizationResourcesMenuId,
            onclick: () => browser.tabs.create({url: this._remoteLinks.getMozillaWikiL10nTeamUrl(localeTeam)}),
        });
        browser.contextMenus.create({
            type: 'separator',
            contexts: ['browser_action'],
            parentId: localizationResourcesMenuId,
        });
        browser.contextMenus.create({
            title: 'Cambridge Dictionary',
            contexts: ['browser_action'],
            parentId: localizationResourcesMenuId,
            onclick: () => browser.tabs.create({url: this._remoteLinks.getCambridgeDictionaryUrl()}),
        });
        browser.contextMenus.create({
            type: 'separator',
            contexts: ['browser_action'],
            parentId: localizationResourcesMenuId,
        });
        browser.contextMenus.create({
            title: `Mozilla L10n Team Dashboard - ${localeTeam}`,
            contexts: ['browser_action'],
            parentId: localizationResourcesMenuId,
            onclick: () => browser.tabs.create({url: this._remoteLinks.getElmoDashboardUrl(localeTeam)}),
        });
        browser.contextMenus.create({
            title: `Mozilla Web L10n Dashboard - ${localeTeam}`,
            contexts: ['browser_action'],
            parentId: localizationResourcesMenuId,
            onclick: () => browser.tabs.create({url: this._remoteLinks.getWebDashboardUrl(localeTeam)}),
        });
        browser.contextMenus.create({
            title: 'Pontoon Tools wiki',
            contexts: ['browser_action'],
            onclick: () => browser.tabs.create({url: this._remoteLinks.getPontoonToolsWikiUrl()}),
        });
        browser.contextMenus.create({
            title: 'Open Pontoon Tools tour',
            contexts: ['browser_action'],
            onclick: () => browser.tabs.create({url: browser.runtime.getURL('packages/intro/build/index.html')}),
        });
    }
}
