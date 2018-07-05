/**
 * Takes care of displaying the toolbar button badge, context menu and if the popup should be open on click or not. Also
 * triggers data refreshing.
 * @requires commons/js/Options.js, RemotePontoon.js, commons/js/RemoteLinks.js, DataRefresher.js
 */
class ToolbarButton {
    /**
     * Initialize instance, add button click action and context menu, watch for future data and options changes.
     * @param options
     * @param remotePontoon
     * @param remoteLinks
     * @param dataRefresher
     */
    constructor(options, remotePontoon, remoteLinks, dataRefresher) {
        this._options = options;
        this._remotePontoon = remotePontoon;
        this._remoteLinks = remoteLinks;
        this._dataRefresher = dataRefresher;
        this._defaultTitle = 'Pontoon notifications';
        this._badgeText = '';

        this._openPontoonTeamPage = () => browser.tabs.create({url: this._remotePontoon.getTeamPageUrl()});
        this._openPontoonHomePage = () => browser.tabs.create({url: this._remotePontoon.getBaseUrl()});
        this._addOnClickAction();
        this._addContextMenu();
        this._watchStorageChanges();
        this._watchOptionsUpdates();

        this._dataRefresher.refreshData();
    }

    /**
     * Update button badge when notification data change in storage.
     * @private
     */
    _watchStorageChanges() {
        this._remotePontoon.subscribeToNotificationsChange((change) => {
            const notificationsData = change.newValue;
            if (notificationsData !== undefined) {
                this._updateBadge(`${Object.values(notificationsData).filter(n => n.unread).length}`);
            } else {
                this._updateBadge('!');
            }
        });
    }

    /**
     * Keep button click action in sync with options.
     * @private
     */
    _watchOptionsUpdates() {
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
        browser.browserAction.setPopup({popup: ''});
        browser.browserAction.onClicked.removeListener(this._openPontoonTeamPage);
        browser.browserAction.onClicked.removeListener(this._openPontoonHomePage);
        switch (buttonAction) {
            case 'popup':
                browser.browserAction.setPopup({popup: browser.runtime.getURL('toolbar-button/index.html')});
                break;
            case 'team-page':
                browser.browserAction.onClicked.addListener(this._openPontoonTeamPage);
                break;
            case 'home-page':
                browser.browserAction.onClicked.addListener(this._openPontoonHomePage);
                break;
        }
    }

    /**
     * Add button click actions.
     * @private
     */
    _addOnClickAction() {
        const buttonActionOption = 'toolbar_button_action';
        this._options.get(buttonActionOption).then(
            (item) => this._setButtonAction(item[buttonActionOption])
        );
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
                this._hideBadge();
                this._dataRefresher.refreshData();
            }
        });
        const pontoonPagesMenuId = browser.contextMenus.create({
            title: 'Pontoon',
            contexts: ['browser_action'],
        });
        browser.contextMenus.create({
            title: 'Team page',
            contexts: ['browser_action'],
            parentId: pontoonPagesMenuId,
            onclick: () => browser.tabs.create({url: this._remotePontoon.getTeamPageUrl()}),
        });
        browser.contextMenus.create({
            title: 'Team bugs',
            contexts: ['browser_action'],
            parentId: pontoonPagesMenuId,
            onclick: () => browser.tabs.create({url: this._remotePontoon.getTeamBugsUrl()}),
        });
        browser.contextMenus.create({
            title: 'Search all projects',
            contexts: ['browser_action'],
            parentId: pontoonPagesMenuId,
            onclick: () => browser.tabs.create({url: this._remotePontoon.getSearchInAllProjectsUrl()}),
        });
        const searchMenuId = browser.contextMenus.create({
            title: 'Search l10n',
            contexts: ['browser_action'],
        });
        browser.contextMenus.create({
            title: 'Search in Pontoon',
            contexts: ['browser_action'],
            parentId: searchMenuId,
            onclick: () => browser.tabs.create({url: this._remotePontoon.getSearchInAllProjectsUrl()}),
        });
        browser.contextMenus.create({
            title: 'Transvision',
            contexts: ['browser_action'],
            parentId: searchMenuId,
            onclick: () => browser.tabs.create({url: this._remoteLinks.getTransvisionUrl(localeTeam)}),
        });
        browser.contextMenus.create({
            title: 'Microsoft Terminology Search',
            contexts: ['browser_action'],
            parentId: searchMenuId,
            onclick: () => browser.tabs.create({url: this._remoteLinks.getMicrosoftTerminologySearchUrl()}),
        });
        const localizationResourcesMenuId = browser.contextMenus.create({
            title: 'Other l10n sources',
            contexts: ['browser_action'],
        });
        browser.contextMenus.create({
            title: `Mozilla Style Guide (${localeTeam})`,
            contexts: ['browser_action'],
            parentId: localizationResourcesMenuId,
            onclick: () => browser.tabs.create({url: this._remoteLinks.getMozillaStyleGuidesUrl(localeTeam)}),
        });
        browser.contextMenus.create({
            title: `L10n:Teams:${localeTeam} - MozillaWiki`,
            contexts: ['browser_action'],
            parentId: localizationResourcesMenuId,
            onclick: () => browser.tabs.create({url: this._remoteLinks.getMozillaWikiL10nTeamUrl(localeTeam)}),
        });
        browser.contextMenus.create({
            type: 'separator',
            contexts: ['browser_action'],
            parentId: localizationResourcesMenuId,
        });
        browser.contextMenus.create({
            title: 'Cambridge Dictionary',
            contexts: ['browser_action'],
            parentId: localizationResourcesMenuId,
            onclick: () => browser.tabs.create({url: this._remoteLinks.getCambridgeDictionaryUrl()}),
        });
        browser.contextMenus.create({
            type: 'separator',
            contexts: ['browser_action'],
            parentId: localizationResourcesMenuId,
        });
        browser.contextMenus.create({
            title: `Mozilla L10n Team Dashboard - ${localeTeam}`,
            contexts: ['browser_action'],
            parentId: localizationResourcesMenuId,
            onclick: () => browser.tabs.create({url: this._remoteLinks.getElmoDashboardUrl(localeTeam)}),
        });
        browser.contextMenus.create({
            title: `Mozilla Web L10n Dashboard - ${localeTeam}`,
            contexts: ['browser_action'],
            parentId: localizationResourcesMenuId,
            onclick: () => browser.tabs.create({url: this._remoteLinks.getWebDashboardUrl(localeTeam)}),
        });
        browser.contextMenus.create({
            title: 'Open Pontoon Tools tour',
            contexts: ['browser_action'],
            onclick: () => browser.tabs.create({url: browser.runtime.getURL('intro/index.html')}),
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
        this._options.get(optionKey).then(
            (item) => {
                if (item[optionKey]) {
                    browser.browserAction.setBadgeText({text: text});
                    browser.browserAction.setTitle({title: `${this._defaultTitle} (${text})`});
                    if (text !== '0') {
                        browser.browserAction.setBadgeBackgroundColor({color: '#F36'});
                    } else {
                        browser.browserAction.setBadgeBackgroundColor({color: '#4d5967'});
                    }
                } else {
                    this._hideBadge();
                }
            }
        );
    }

    /**
     * Hide the button badge.
     * @private
     */
    _hideBadge() {
        browser.browserAction.setBadgeText({text: ''});
        browser.browserAction.setTitle({title: this._defaultTitle});
    }
}
