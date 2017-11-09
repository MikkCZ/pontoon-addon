'use strict';

const options = new Options();
const pontoonBaseUrlOptionKey = 'pontoon_base_url';
const localeTeamOptionKey = 'locale_team';
const teamsListDataKey = 'teamsList';

let newInstallation = false;
let onInstallFunction = () => newInstallation = true;
browser.runtime.onInstalled.addListener(() => {
    onInstallFunction.apply();
});

Promise.all([
    options.get([pontoonBaseUrlOptionKey, localeTeamOptionKey]),
    browser.storage.local.get(teamsListDataKey)
]).then(([
    optionsItems,
    storageItems
]) => {
    const team = optionsItems[localeTeamOptionKey];
    const remotePontoon = new RemotePontoon(optionsItems[pontoonBaseUrlOptionKey], team, options);
    const remoteLinks = new RemoteLinks(team, options);
    const toolbarButton = new ToolbarButton(options, remotePontoon, remoteLinks);

    onInstallFunction = () => remotePontoon.updateTeamsList();
    if (newInstallation) {
        onInstallFunction.apply();
    }

    const domainToProjectKvArray = remotePontoon.getDomainToProjectKvArray();
    const mozillaWebsitesUrlPatterns = domainToProjectKvArray
        .map((kvArray) => kvArray[0])
        .map((domain) => `https://${domain}/*`);
    const mozillaPageContextMenuParent = browser.contextMenus.create({
        title: 'Pontoon Tools',
        documentUrlPatterns: mozillaWebsitesUrlPatterns,
        contexts: ['selection'],
    });
    browser.contextMenus.create({
        title: 'Report l10n bug for "%s"',
        documentUrlPatterns: mozillaWebsitesUrlPatterns,
        contexts: ['selection'],
        parentId: mozillaPageContextMenuParent,
        onclick: (info, tab) => {
            const teamComponent = storageItems[teamsListDataKey][team].bz_component;
            browser.tabs.create({url: remoteLinks.getBugzillaReportUrlForSelectedTextOnPage(info.selectionText, tab.url, teamComponent)});
        },
    });
    browser.contextMenus.create({
        title: 'Search for "%s" in Pontoon (Firefox)',
        documentUrlPatterns: ['https://support.mozilla.org/*'],
        contexts: ['selection'],
        parentId: mozillaPageContextMenuParent,
        onclick: (info, tab) => browser.tabs.create({url: remotePontoon.getSearchInFirefoxProjectUrl(info.selectionText)}),
    });
    domainToProjectKvArray.forEach((kvArray) => {
        const [domain, projectData] = kvArray;
        browser.contextMenus.create({
            title: `Search for "%s" in Pontoon (${projectData.name})`,
            documentUrlPatterns: [`https://${domain}/*`],
            contexts: ['selection'],
            parentId: mozillaPageContextMenuParent,
            onclick: (info, tab) => browser.tabs.create({url: remotePontoon.getSearchInProjectUrl(projectData.slug, info.selectionText)}),
        });
    });

    const pageAction = new PageAction(options, remotePontoon);
});
