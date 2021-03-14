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
        [
            {
                title: 'Team page',
                contexts: ['browser_action'],
                parentId: pontoonPagesMenuId,
                onclick: () => browser.tabs.create({url: this._remotePontoon.getTeamPageUrl()}),
            },
            {
                title: 'Team bugs',
                contexts: ['browser_action'],
                parentId: pontoonPagesMenuId,
                onclick: () => browser.tabs.create({url: this._remotePontoon.getTeamBugsUrl()}),
            },
            {
                title: 'Search all projects',
                contexts: ['browser_action'],
                parentId: pontoonPagesMenuId,
                onclick: () => browser.tabs.create({url: this._remotePontoon.getSearchInAllProjectsUrl()}),
            },
        ].forEach((it) => browser.contextMenus.create(it));

        const searchMenuId = browser.contextMenus.create({
            title: 'Search l10n',
            contexts: ['browser_action'],
        });
        [
            {
                title: 'Search in Pontoon',
                contexts: ['browser_action'],
                parentId: searchMenuId,
                onclick: () => browser.tabs.create({url: this._remotePontoon.getSearchInAllProjectsUrl()}),
            },
            {
                title: 'Transvision',
                contexts: ['browser_action'],
                parentId: searchMenuId,
                onclick: () => browser.tabs.create({url: this._remoteLinks.getTransvisionUrl(localeTeam)}),
            },
            {
                title: 'Microsoft Terminology Search',
                contexts: ['browser_action'],
                parentId: searchMenuId,
                onclick: () => browser.tabs.create({url: this._remoteLinks.getMicrosoftTerminologySearchUrl()}),
            }
        ].forEach((it) => browser.contextMenus.create(it));

        const localizationResourcesMenuId = browser.contextMenus.create({
            title: 'Other l10n sources',
            contexts: ['browser_action'],
        });
        [
            {
                title: `Mozilla Style Guide (${localeTeam})`,
                contexts: ['browser_action'],
                parentId: localizationResourcesMenuId,
                onclick: () => browser.tabs.create({url: this._remoteLinks.getMozillaStyleGuidesUrl(localeTeam)}),
            },
            {
                title: `L10n:Teams:${localeTeam} - MozillaWiki`,
                contexts: ['browser_action'],
                parentId: localizationResourcesMenuId,
                onclick: () => browser.tabs.create({url: this._remoteLinks.getMozillaWikiL10nTeamUrl(localeTeam)}),
            },
            {
                type: 'separator',
                contexts: ['browser_action'],
                parentId: localizationResourcesMenuId,
            },
            {
                title: 'Cambridge Dictionary',
                contexts: ['browser_action'],
                parentId: localizationResourcesMenuId,
                onclick: () => browser.tabs.create({url: this._remoteLinks.getCambridgeDictionaryUrl()}),
            },
            {
                type: 'separator',
                contexts: ['browser_action'],
                parentId: localizationResourcesMenuId,
            },
            {
                title: `Mozilla L10n Team Dashboard - ${localeTeam}`,
                contexts: ['browser_action'],
                parentId: localizationResourcesMenuId,
                onclick: () => browser.tabs.create({url: this._remoteLinks.getElmoDashboardUrl(localeTeam)}),
            },
        ].forEach((it) => browser.contextMenus.create(it));

        browser.contextMenus.create({
            title: 'Pontoon Add-on wiki',
            contexts: ['browser_action'],
            onclick: () => browser.tabs.create({url: this._remoteLinks.getPontoonAddonWikiUrl()}),
        });

        browser.contextMenus.create({
            title: 'Open Pontoon Add-on tour',
            contexts: ['browser_action'],
            onclick: () => browser.tabs.create({url: browser.runtime.getURL('packages/intro/dist/index.html')}),
        });
    }
}
