/**
 * This is the main script for the background "page". Initiates all background staff like toolbar button, page actions
 * or notifications.
 * @requires Options.js, RemotePontoon.js, RemoteLinks.js, ToolbarButton.js, PageAction.js, Notifications.js
 */
'use strict';

const options = new Options();
const pontoonBaseUrlOptionKey = 'pontoon_base_url';
const localeTeamOptionKey = 'locale_team';
const teamsListDataKey = 'teamsList';
const projectsListDataKey = 'projectsList';

// Register onInstalled event listener to store its details in case the event fires before all the async stuff below are ready.
let newInstallationDetails;
let onInstallFunction = (details) => newInstallationDetails = details;
browser.runtime.onInstalled.addListener((details) => {
    onInstallFunction(details);
});

/**
 * Create selection context menus on projects related websites to report a bug or search selected text in Pontoon. If
 * the menus already exist, removes and creates them again with the new data.
 * @param projects list of projects in Pontoon
 * @param team locale team selected by the user in options
 * @param remotePontoon RemotePontoon instance used in background
 * @param remoteLinks RemoteLinks instance used in background
 */
function createContextMenus(projects, team, remotePontoon, remoteLinks) {
    // Create website patterns for all projects in Pontoon.
    const mozillaWebsitesUrlPatterns = [];
    Object.values(projects).forEach((project) =>
        project.domains.forEach((domain) => mozillaWebsitesUrlPatterns.push(`https://${domain}/*`))
    );

    // Recreate the selection context menus (report l10n bug & search in project)
    browser.contextMenus.remove('page-context-menu-parent');
    const mozillaPageContextMenuParent = browser.contextMenus.create({
        id: 'page-context-menu-parent',
        title: 'Pontoon Tools',
        documentUrlPatterns: mozillaWebsitesUrlPatterns,
        contexts: ['selection'],
    });
    browser.contextMenus.remove('page-context-menu-report-l10n-bug');
    browser.contextMenus.create({
        id: 'page-context-menu-report-l10n-bug',
        title: 'Report l10n bug for "%s"',
        documentUrlPatterns: mozillaWebsitesUrlPatterns,
        contexts: ['selection'],
        parentId: mozillaPageContextMenuParent,
        onclick: (info, tab) => {
            browser.tabs.create({url: remoteLinks.getBugzillaReportUrlForSelectedTextOnPage(info.selectionText, tab.url, team.code, team.bz_component)});
        },
    });
    Object.values(projects).forEach((project) => {
        project.domains.forEach((domain) => {
            const projectSearchMenuId = `page-context-menu-search-${project.slug}-${domain}`;
            browser.contextMenus.remove(projectSearchMenuId);
            browser.contextMenus.create({
                id: projectSearchMenuId,
                title: `Search for "%s" in Pontoon (${project.name})`,
                documentUrlPatterns: [`https://${domain}/*`],
                contexts: ['selection'],
                parentId: mozillaPageContextMenuParent,
                onclick: (info, tab) => browser.tabs.create({url: remotePontoon.getSearchInProjectUrl(project.slug, info.selectionText)}),
            });

            const allProjectsSearchMenuId = `page-context-menu-search-all-${domain}`;
            browser.contextMenus.remove(allProjectsSearchMenuId);
            browser.contextMenus.create({
                id: allProjectsSearchMenuId,
                title: 'Search for "%s" in Pontoon (all projects)',
                documentUrlPatterns: [`https://${domain}/*`],
                contexts: ['selection'],
                parentId: mozillaPageContextMenuParent,
                onclick: (info, tab) => browser.tabs.create({url: remotePontoon.getSearchInAllProjectsUrl(info.selectionText)}),
            });
        });
    });
}

/**
 * With the necessary options and data from storage, create all parts of the UI and objects handling data updates.
 */
Promise.all([
    options.get([pontoonBaseUrlOptionKey, localeTeamOptionKey]),
    browser.storage.local.get([teamsListDataKey, projectsListDataKey]),
]).then(([
    optionsItems,
    storageItems
]) => {
    // Create objects for fetching data from Pontoon and encapsulating remote links.
    const team = optionsItems[localeTeamOptionKey];
    const remotePontoon = new RemotePontoon(optionsItems[pontoonBaseUrlOptionKey], team, options);
    const remoteLinks = new RemoteLinks(team, options);

    // Create context menus. For new installations the data are missing and the menus are created by onInstallFunction below.
    if (storageItems[projectsListDataKey] && storageItems[teamsListDataKey]) {
        createContextMenus(storageItems[projectsListDataKey], storageItems[teamsListDataKey][team], remotePontoon, remoteLinks);
    }

    // When the add-on is installed or updated.
    onInstallFunction = (details) => {
        // Fetch and update data about teams and project.
        Promise.all([
            remotePontoon.updateTeamsList(),
            remotePontoon.updateProjectsList(),
        ]).then(([
            teams,
            projects
        ]) => {
            // Create context menus.
            createContextMenus(projects, teams[team], remotePontoon, remoteLinks);
            // For new installations or major updates, open the introduction tour.
            if (
                details.reason === 'install'
                || parseInt(details.previousVersion.split('.')[0]) < parseInt(browser.runtime.getManifest().version.split('.')[0])
            ) {
                browser.tabs.create({url: '/html/intro.html'});
            }
        });
    };

    // If the onInstalled event has already fired, we have the details stored by the function registered at the beginning
    // of this file and need to call the newly created function manually.
    if (newInstallationDetails) {
        onInstallFunction(newInstallationDetails);
    }

    // Create toolbar button, page action and object handling system notifications
    const toolbarButton = new ToolbarButton(options, remotePontoon, remoteLinks);
    if (typeof PageAction === 'function') {
        const pageAction = new PageAction(options, remotePontoon);
    }
    const notifications = new Notifications(options, remotePontoon);
});
