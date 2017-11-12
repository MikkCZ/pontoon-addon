'use strict';

const options = new Options();
const pontoonBaseUrlOptionKey = 'pontoon_base_url';
const localeTeamOptionKey = 'locale_team';
const teamsListDataKey = 'teamsList';
const projectsListDataKey = 'projectsList';

let newInstallationDetails;
let onInstallFunction = (details) => newInstallationDetails = details;
browser.runtime.onInstalled.addListener((details) => {
    onInstallFunction(details);
});

function createContextMenus(projects, team, remotePontoon, remoteLinks) {
    const mozillaWebsitesUrlPatterns = [];
    Object.values(projects).forEach((project) =>
        project.domains.forEach((domain) => mozillaWebsitesUrlPatterns.push(`https://${domain}/*`))
    );
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
            const teamComponent = team.bz_component;
            browser.tabs.create({url: remoteLinks.getBugzillaReportUrlForSelectedTextOnPage(info.selectionText, tab.url, teamComponent)});
        },
    });
    browser.contextMenus.remove('sumo-context-menu-search-firefox');
    browser.contextMenus.create({
        id: 'sumo-page-context-menu-search-firefox',
        title: 'Search for "%s" in Pontoon (Firefox)',
        documentUrlPatterns: projects['sumo'].domains.map((domain) => `https://${domain}/*`),
        contexts: ['selection'],
        parentId: mozillaPageContextMenuParent,
        onclick: (info, tab) => browser.tabs.create({url: remotePontoon.getSearchInFirefoxProjectUrl(info.selectionText)}),
    });
    Object.values(projects).forEach((project) => {
        project.domains.forEach((domain) => {
            const menuId = `page-context-menu-search-${project.slug}-${domain}`;
            browser.contextMenus.remove(menuId);
            browser.contextMenus.create({
                id: menuId,
                title: `Search for "%s" in Pontoon (${project.name})`,
                documentUrlPatterns: [`https://${domain}/*`],
                contexts: ['selection'],
                parentId: mozillaPageContextMenuParent,
                onclick: (info, tab) => browser.tabs.create({url: remotePontoon.getSearchInProjectUrl(project.slug, info.selectionText)}),
            });
        })
    });
}

Promise.all([
    options.get([pontoonBaseUrlOptionKey, localeTeamOptionKey]),
    browser.storage.local.get([teamsListDataKey, projectsListDataKey]),
]).then(([
    optionsItems,
    storageItems
]) => {
    const team = optionsItems[localeTeamOptionKey];
    const remotePontoon = new RemotePontoon(optionsItems[pontoonBaseUrlOptionKey], team, options);
    const remoteLinks = new RemoteLinks(team, options);
    const toolbarButton = new ToolbarButton(options, remotePontoon, remoteLinks);

    // Create context menus. The data may be missing for new installation or update.
    if (storageItems[projectsListDataKey] && storageItems[teamsListDataKey]) {
        createContextMenus(storageItems[projectsListDataKey], storageItems[teamsListDataKey][team], remotePontoon, remoteLinks);
    }

    // When the add-on is installed or updated, update the teams and projects data too.
    onInstallFunction = (details) => {
        Promise.all([
            remotePontoon.updateTeamsList(),
            remotePontoon.updateProjectsList(),
        ]).then(([
            teams,
            projects
        ]) => {
            createContextMenus(projects, teams[team], remotePontoon, remoteLinks);
            if (
                details.reason === 'install'
                || parseInt(details.previousVersion.split('.')[0]) < parseInt(browser.runtime.getManifest().version.split('.')[0])
            ) {
                browser.tabs.create({url: '/html/intro.html'});
            }
        });
    };
    if (newInstallationDetails) { // The event has already fired before.
        onInstallFunction(newInstallationDetails);
    }

    const pageAction = new PageAction(options, remotePontoon);
    const notifications = new Notifications(options, remotePontoon);
});
