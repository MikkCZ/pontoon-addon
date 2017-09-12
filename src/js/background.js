'use strict';

const options = new Options();
const localeTeamOptionKey = 'options.locale_team';
options.get([localeTeamOptionKey], (items) => {
    const remotePontoon = new RemotePontoon(items[localeTeamOptionKey]);
    const remoteLinks = new RemoteLinks(items[localeTeamOptionKey]);
    const toolbarButton = new ToolbarButton(options, remotePontoon, remoteLinks);

    const mozillaWebsitesUrlPatterns = ['*://*.mozilla.org/*', '*://*.firefox.com/*', '*://mozillians.org/*', '*://*.allizom.org/*'];
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
        onclick: (info, tab) => chrome.tabs.create({url: remoteLinks.getBuzillaReportUrlForSelectedTextOnPage(info.selectionText, tab.url)}),
    });
    chrome.contextMenus.create({
        title: 'Search for "%s" in Pontoon (Firefox)',
        documentUrlPatterns: ['*://support.mozilla.org/*'],
        contexts: ['selection'],
        parentId: mozillaPageContextMenuParent,
        onclick: (info, tab) => chrome.tabs.create({url: remotePontoon.getSearchInFirefoxProjectUrl(info.selectionText)}),
    });
    chrome.contextMenus.create({
        title: 'Search for "%s" in Pontoon (Mozilla.org)',
        documentUrlPatterns: ['*://www.mozilla.org/*', '*://www-dev.allizom.org/*'],
        contexts: ['selection'],
        parentId: mozillaPageContextMenuParent,
        onclick: (info, tab) => chrome.tabs.create({url: remotePontoon.getSearchInMozillaOrgProjectUrl(info.selectionText)}),
    });
});
