/**
 * This is the main script for the background "page". Initiates all backend stuff running permanently in background like
 * toolbar button, page actions or notifications.
 * @requires commons/js/Options.js, commons/js/RemoteLinks.js, RemotePontoon.js, ToolbarButton.js, PageAction.js, SystemNotifications.js, PageContextMenu.js
 */
'use strict';

// Register capturing event listener in case onInstalled fires before all the async stuff below are ready.
let newInstallationDetails;
let onInstallFunction = (details) => newInstallationDetails = details;
browser.runtime.onInstalled.addListener((details) => {
    onInstallFunction(details);
});

browser.runtime.onInstalled.addListener((details) => {
    // For new installations or major updates, open the introduction tour.
    if (details.reason === 'install' || parseInt(details.previousVersion.split('.')[0]) < parseInt(browser.runtime.getManifest().version.split('.')[0])
    ) {
        browser.tabs.create({url: browser.runtime.getURL('intro/index.html')});
    }
});

const options = new Options();
const pontoonBaseUrlOptionKey = 'pontoon_base_url';
const localeTeamOptionKey = 'locale_team';

/**
 * With the necessary options, create all parts of the UI and objects for data updates and access.
 */
options.get([pontoonBaseUrlOptionKey, localeTeamOptionKey]).then((optionsItems) => {
    const requestsToken = 'foo'; // TODO: better secure this (https://www.npmjs.com/package/uuid)
    const remotePontoon = new RemotePontoon(optionsItems[pontoonBaseUrlOptionKey], optionsItems[localeTeamOptionKey], options, requestsToken);
    const remotePontoonRequestsFilter = new RemotePontoonAuthenticationFilter(options, remotePontoon, requestsToken);
    const toolbarButton = new ToolbarButton(options, remotePontoon);
    if (typeof PageAction === 'function') {
        const pageAction = new PageAction(remotePontoon);
    }
    const systemNotifications = new SystemNotifications(options, remotePontoon);
    const remoteLinks = new RemoteLinks();
    const pageContextMenu = new PageContextMenu(options, remotePontoon, remoteLinks);
    const dataRefresher = new DataRefresher(options, remotePontoon);
    const toolbarButtonContextMenu = new ToolbarButtonContextMenu(options, remotePontoon, remoteLinks, dataRefresher, toolbarButton);

    // If the onInstalled event has already fired, the details are stored by the function registered above.
    onInstallFunction = (details) => dataRefresher.refreshDataOnInstallOrUpdate();
    if (newInstallationDetails) {
        onInstallFunction(newInstallationDetails);
    }
});
