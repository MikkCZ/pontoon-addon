'use-strict';

var options = new Options();
var localeTeamOptionKey = 'options.locale_team';
options.get([localeTeamOptionKey], function(items) {
    var remotePontoon = new RemotePontoon(items[localeTeamOptionKey]);
    var remoteLinks = new RemoteLinks(items[localeTeamOptionKey]);
    var toolbarButton = new ToolbarButton(options, remotePontoon, remoteLinks);

    var mozillaWebsitesUrlPatterns = ['*://*.mozilla.org/*', '*://*.firefox.com/*', '*://mozillians.org/*', '*://*.allizom.org/*'];
    var mozillaPageContextMenuParent = chrome.contextMenus.create({
        title: 'Pontoon Tools',
        documentUrlPatterns: mozillaWebsitesUrlPatterns,
        contexts: ['selection'],
    });
    chrome.contextMenus.create({
        title: 'Report l10n bug for "%s"',
        documentUrlPatterns: mozillaWebsitesUrlPatterns,
        contexts: ['selection'],
        parentId: mozillaPageContextMenuParent,
        onclick: function(info, tab) {
            chrome.tabs.create({url: remoteLinks.getBuzillaReportUrlForSelectedTextOnPage(info.selectionText, tab.url)});
        },
    });
});
