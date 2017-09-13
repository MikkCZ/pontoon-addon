'use strict';

const options = new Options();
const localeTeamOptionKey = 'options.locale_team';
options.get(localeTeamOptionKey, (items) => {
    const remotePontoon = new RemotePontoon(items[localeTeamOptionKey]);
    const remoteLinks = new RemoteLinks(items[localeTeamOptionKey]);
    const toolbarButton = new ToolbarButton(options, remotePontoon, remoteLinks);

    const domainToProjectKvArray = remotePontoon.getDomainToProjectKvArray();
    const mozillaWebsitesUrlPatterns = domainToProjectKvArray
        .map((kvArray) => kvArray[0])
        .map((domain) => `https://${domain}/*`);
    const mozillaPageContextMenuParent = chrome.contextMenus.create({
        title: 'Pontoon Tools',
        documentUrlPatterns: mozillaWebsitesUrlPatterns,
        contexts: ['selection'],
    });
    chrome.contextMenus.create({
        title: 'Report l10n bug for "%s"',
        documentUrlPatterns: mozillaWebsitesUrlPatterns,
        contexts: ['selection'],
        parentId: mozillaPageContextMenuParent,
        onclick: (info, tab) => chrome.tabs.create({url: remoteLinks.getBugzillaReportUrlForSelectedTextOnPage(info.selectionText, tab.url)}),
    });
    chrome.contextMenus.create({
        title: 'Search for "%s" in Pontoon (Firefox)',
        documentUrlPatterns: ['https://support.mozilla.org/*'],
        contexts: ['selection'],
        parentId: mozillaPageContextMenuParent,
        onclick: (info, tab) => chrome.tabs.create({url: remotePontoon.getSearchInFirefoxProjectUrl(info.selectionText)}),
    });
    domainToProjectKvArray.forEach((kvArray) => {
        const [domain, projectData] = kvArray;
        chrome.contextMenus.create({
            title: `Search for "%s" in Pontoon (${projectData.name})`,
            documentUrlPatterns: [`https://${domain}/*`],
            contexts: ['selection'],
            parentId: mozillaPageContextMenuParent,
            onclick: (info, tab) => chrome.tabs.create({url: remotePontoon.getSearchInProjectUrl(projectData.slug, info.selectionText)}),
        });
    });

    const pageAction = new PageAction(remotePontoon);
});
