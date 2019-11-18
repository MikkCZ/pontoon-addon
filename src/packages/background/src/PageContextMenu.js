if (!browser) { // eslint-disable-line no-use-before-define
    var browser = require('webextension-polyfill'); // eslint-disable-line no-var, no-inner-declarations
}

/**
 * PageContextMenu takes care of context menus on Mozilla websites.
 */
export class PageContextMenu {
    /**
     * Initialize instance and declare context menus for Mozilla websites.
     * @param options
     * @param remotePontoon
     * @param remoteLinks
     */
    constructor(options, remotePontoon, remoteLinks) {
        this._options = options;
        this._remotePontoon = remotePontoon;
        this._remoteLinks = remoteLinks;

        this._watchStorageChangesAndOptionsUpdates();
        this._loadDataFromStorage();
    }

    /**
     * Create selection context menus on projects related websites to report a bug or search selected text in Pontoon.
     * If the menus already exist, remove and create them again with the new data.
     * @param projects list of projects in Pontoon
     * @param team locale team selected by the user in options
     * @private
     */
    _createContextMenus(projects, team) {
        // Create website patterns for all projects in Pontoon.
        const mozillaWebsitesUrlPatterns = [];
        Object.values(projects).forEach((project) =>
            project.domains.forEach((domain) => mozillaWebsitesUrlPatterns.push(`https://${domain}/*`))
        );

        // Recreate the selection context menus (report l10n bug & search in project)
        const mozillaPageContextMenuParent = PageContextMenu._recreateContextMenu({
            id: 'page-context-menu-parent',
            title: 'Pontoon Tools',
            documentUrlPatterns: mozillaWebsitesUrlPatterns,
            contexts: ['selection'],
        });
        PageContextMenu._recreateContextMenu({
            id: 'page-context-menu-report-l10n-bug',
            title: 'Report l10n bug for "%s"',
            documentUrlPatterns: mozillaWebsitesUrlPatterns,
            contexts: ['selection'],
            parentId: mozillaPageContextMenuParent,
            onclick: (info, tab) => {
                browser.tabs.create({url: this._remoteLinks.getBugzillaReportUrlForSelectedTextOnPage(info.selectionText, tab.url, team.code, team.bz_component)});
            },
        });
        Object.values(projects).forEach((project) => {
            project.domains.flatMap((domain) => [
                {
                    id: `page-context-menu-search-${project.slug}-${domain}`,
                    title: `Search for "%s" in Pontoon (${project.name})`,
                    documentUrlPatterns: [`https://${domain}/*`],
                    contexts: ['selection'],
                    parentId: mozillaPageContextMenuParent,
                    onclick: (info, tab) => browser.tabs.create({url: this._remotePontoon.getSearchInProjectUrl(project.slug, info.selectionText)}),
                },
                {
                    id: `page-context-menu-search-all-${domain}`,
                    title: 'Search for "%s" in Pontoon (all projects)',
                    documentUrlPatterns: [`https://${domain}/*`],
                    contexts: ['selection'],
                    parentId: mozillaPageContextMenuParent,
                    onclick: (info, tab) => browser.tabs.create({url: this._remotePontoon.getSearchInAllProjectsUrl(info.selectionText)}),
                },
            ]).forEach(PageContextMenu._recreateContextMenu);
        });
    }

    static _recreateContextMenu(contextMenuItem) {
        browser.contextMenus.remove(contextMenuItem.id);
        return browser.contextMenus.create(contextMenuItem);
    }

    /**
     * Watch for changes in options or relevant data and trigger context menu reload.
     * @private
     */
    _watchStorageChangesAndOptionsUpdates() {
        this._remotePontoon.subscribeToProjectsListChange(
            (projectsList) => this._loadDataFromStorage()
        );
        this._remotePontoon.subscribeToTeamsListChange(
            (teamsList) => this._loadDataFromStorage()
        );
        this._options.subscribeToOptionChange('locale_team',
            (teamOption) => this._loadDataFromStorage()
        );
    }

    /**
     * Initialize context menu from data present in the storage. For new installations the data are missing and all will triggered from background.js.
     * @private
     */
    _loadDataFromStorage() {
        const localeTeamOptionKey = 'locale_team';
        const teamsListDataKey = 'teamsList';
        const projectsListDataKey = 'projectsList';
        Promise.all([
            this._options.get(localeTeamOptionKey),
            browser.storage.local.get([teamsListDataKey, projectsListDataKey]),
        ]).then(([
            optionsItems,
            storageItems
        ]) => {
            const team = optionsItems[localeTeamOptionKey];
            if (storageItems[projectsListDataKey] && storageItems[teamsListDataKey]) {
                this._createContextMenus(storageItems[projectsListDataKey], storageItems[teamsListDataKey][team]);
            }
        });
    }
}
