class ToolbarButton {
    /**
     * Initialize instance, add button click action and context menu, load data from Pontoon and schedule data updates
     * trigger, watch for future data and options changes.
     * @param options
     * @param remotePontoon
     * @param remoteLinks
     */
    constructor(options, remotePontoon, remoteLinks) {
        this._options = options;
        this._remotePontoon = remotePontoon;
        this._remoteLinks = remoteLinks;
        this._defaultTitle = 'Pontoon notifications';
        this._refreshInterval = undefined;
        this._badgeText = '';

        this._openPontoonTeamPage = () => chrome.tabs.create({url: this._remotePontoon.getTeamPageUrl()});
        this._openPontoonHomePage= () => chrome.tabs.create({url: this._remotePontoon.getBaseUrl()});
        this._addOnClickAction();
        this._addContextMenu();
        this._watchStorageChanges();
        this._watchOptionsUpdates();
        this._refreshDataAndUpdateSchedule();
    }

    /**
     * Trigger notifications and team data refresh.
     * @private
     */
    _triggerDataRefresh() {
        this._hideBadge();
        this._remotePontoon.updateNotificationsData();

        this._remotePontoon.updateTeamData();
    }

    /**
     * Schedule data update to repeat with given interval.
     * @param intervalMinutes interval to update in minutes
     * @private
     */
    _scheduleOrUpdateRefreshWithInterval(intervalMinutes) {
        clearInterval(this._refreshInterval);
        this._refreshInterval = setInterval(() => this._triggerDataRefresh(), intervalMinutes * 60 * 1000);
    }

    /**
     * Schedule data update with interval from options.
     * @private
     */
    _scheduleOrUpdateRefresh() {
        const optionKey = 'data_update_interval';
        this._options.get(optionKey, (item) => {
            const intervalMinutes = parseInt(item[optionKey], 10);
            this._scheduleOrUpdateRefreshWithInterval(intervalMinutes);
        });
    }

    /**
     * Update button badge when notification data change in storage.
     * @private
     */
    _watchStorageChanges() {
        chrome.storage.onChanged.addListener((changes, areaName) => {
            const dataKey = 'notificationsData';
            if (changes[dataKey] !== undefined) {
                const notificationsData = changes[dataKey].newValue;
                if (notificationsData !== undefined) {
                    this._updateBadge(`${Object.keys(notificationsData).length}`);
                } else {
                    this._updateBadge('!');
                }
            }
        });
    }

    /**
     * Keep data update interval and button click action in sync with options.
     * @private
     */
    _watchOptionsUpdates() {
        this._options.subscribeToOptionChange('data_update_interval', (change) => {
            const intervalMinutes = parseInt(change.newValue, 10);
            this._scheduleOrUpdateRefreshWithInterval(intervalMinutes);
        });
        this._options.subscribeToOptionChange('toolbar_button_action', (change) =>
            this._setButtonAction(change.newValue)
        );
        this._options.subscribeToOptionChange('display_toolbar_button_badge', (change) => {
            if (change.newValue) {
                this._updateBadge(this._badgeText);
            } else {
                this._hideBadge();
            }
        });
    }

    /**
     * Set action for button click.
     * @param buttonAction from options
     * @private
     */
    _setButtonAction(buttonAction) {
        chrome.browserAction.setPopup({popup: ''});
        chrome.browserAction.onClicked.removeListener(this._openPontoonTeamPage);
        chrome.browserAction.onClicked.removeListener(this._openPontoonHomePage);
        switch (buttonAction) {
            case 'popup':
                chrome.browserAction.setPopup({popup: chrome.extension.getURL('html/popup.html')});
                break;
            case 'team-page':
                chrome.browserAction.onClicked.addListener(this._openPontoonTeamPage);
                break;
            case 'home-page':
                chrome.browserAction.onClicked.addListener(this._openPontoonHomePage);
                break;
        }
    }

    /**
     * Add button click actions.
     * @private
     */
    _addOnClickAction() {
        const buttonActionOption = 'toolbar_button_action';
        this._options.get(buttonActionOption, (item) => this._setButtonAction(item[buttonActionOption]));
    }

    /**
     * Add button context menu.
     * @private
     */
    _addContextMenu() {
        chrome.contextMenus.create({
            title: 'Mark all Notifications as read',
            contexts: ['browser_action'],
            onclick: () => this._remotePontoon.markAllNotificationsAsRead(),
        });
        chrome.contextMenus.create({
            title: 'Reload notifications',
            contexts: ['browser_action'],
            onclick: () => this._refreshDataAndUpdateSchedule(),
        });
        const pontoonPagesMenuId = chrome.contextMenus.create({
            title: 'Pontoon pages',
            contexts: ['browser_action'],
        });
        chrome.contextMenus.create({
            title: 'Home',
            contexts: ['browser_action'],
            parentId: pontoonPagesMenuId,
            onclick: () => chrome.tabs.create({url: this._remotePontoon.getBaseUrl()}),
        });
        chrome.contextMenus.create({
            title: 'Team page',
            contexts: ['browser_action'],
            parentId: pontoonPagesMenuId,
            onclick: () => chrome.tabs.create({url: this._remotePontoon.getTeamPageUrl()}),
        });
        chrome.contextMenus.create({
            title: 'Team bugs',
            contexts: ['browser_action'],
            parentId: pontoonPagesMenuId,
            onclick: () => chrome.tabs.create({url: this._remotePontoon.getTeamBugsUrl()}),
        });
        chrome.contextMenus.create({
            title: 'Machinery',
            contexts: ['browser_action'],
            parentId: pontoonPagesMenuId,
            onclick: () => chrome.tabs.create({url: this._remotePontoon.getMachineryUrl()}),
        });
        const localizationResourcesMenuId = chrome.contextMenus.create({
            title: 'Other l10n sources',
            contexts: ['browser_action'],
        });
        chrome.contextMenus.create({
            title: 'Transvision',
            contexts: ['browser_action'],
            parentId: localizationResourcesMenuId,
            onclick: () => chrome.tabs.create({url: this._remoteLinks.getTransvisionUrl()}),
        });
        chrome.contextMenus.create({
            title: 'amaGama.locamotion.org',
            contexts: ['browser_action'],
            parentId: localizationResourcesMenuId,
            onclick: () => chrome.tabs.create({url: this._remoteLinks.getAmaGamaUrl()}),
        });
        chrome.contextMenus.create({
            title: 'Microsoft Terminology Search',
            contexts: ['browser_action'],
            parentId: localizationResourcesMenuId,
            onclick: () => chrome.tabs.create({url: this._remoteLinks.getMicrosoftTerminologySearchUrl()}),
        });
        chrome.contextMenus.create({
            type: 'separator',
            contexts: ['browser_action'],
            parentId: localizationResourcesMenuId,
        });
        chrome.contextMenus.create({
            title: 'Cambridge Dictionary',
            contexts: ['browser_action'],
            parentId: localizationResourcesMenuId,
            onclick: () => chrome.tabs.create({url: this._remoteLinks.getCambridgeDictionaryUrl()}),
        });
        chrome.contextMenus.create({
            type: 'separator',
            contexts: ['browser_action'],
            parentId: localizationResourcesMenuId,
        });
        chrome.contextMenus.create({
            title: 'Mozilla Style Guides',
            contexts: ['browser_action'],
            parentId: localizationResourcesMenuId,
            onclick: () => chrome.tabs.create({url: this._remoteLinks.getMozillaStyleGuidesUrl()}),
        });
        chrome.contextMenus.create({
            type: 'separator',
            contexts: ['browser_action'],
            parentId: localizationResourcesMenuId,
        });
        chrome.contextMenus.create({
            title: 'Mozilla l10n Team dashboard',
            contexts: ['browser_action'],
            parentId: localizationResourcesMenuId,
            onclick: () => chrome.tabs.create({url: this._remoteLinks.getElmoDashboardUrl()}),
        });
        chrome.contextMenus.create({
            title: 'Mozilla Web l10n Dashboard',
            contexts: ['browser_action'],
            parentId: localizationResourcesMenuId,
            onclick: () => chrome.tabs.create({url: this._remoteLinks.getWebDashboardUrl()}),
        });
        chrome.contextMenus.create({
            title: 'MozillaWiki L10n Team',
            contexts: ['browser_action'],
            parentId: localizationResourcesMenuId,
            onclick: () => chrome.tabs.create({url: this._remoteLinks.getMozillaWikiL10nTeamUrl()}),
        });
        chrome.contextMenus.create({
            title: 'Pontoon Tools options',
            contexts: ['browser_action'],
            onclick: () => chrome.runtime.openOptionsPage(),
        });
    }

    /**
     * Update button badge with the given text and corresponding color.
     * @param text to set
     * @private
     */
    _updateBadge(text) {
        if (text.trim().length > 0) {
            this._badgeText = text;
        }
        const optionKey = 'display_toolbar_button_badge';
        this._options.get(optionKey, (item) => {
            if (item[optionKey]) {
                chrome.browserAction.setBadgeText({text: text});
                chrome.browserAction.setTitle({title: `${this._defaultTitle} (${text})`});
                if (text !== '0') {
                    chrome.browserAction.setBadgeBackgroundColor({color: '#F36'});
                } else {
                    chrome.browserAction.setBadgeBackgroundColor({color: '#4d5967'});
                }
            } else {
                this._hideBadge();
            }
        });
    }

    /**
     * Hide the button badge.
     * @private
     */
    _hideBadge() {
        chrome.browserAction.setBadgeText({text: ''});
        chrome.browserAction.setTitle({title: this._defaultTitle});
    }

    /**
     * Reload data and schedule further updates.
     * @private
     */
    _refreshDataAndUpdateSchedule() {
        this._triggerDataRefresh();
        this._scheduleOrUpdateRefresh();
    }
}
