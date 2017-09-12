class ToolbarButton {
    constructor(options, remotePontoon, remoteLinks) {
        this._options = options;
        this._remotePontoon = remotePontoon;
        this._remoteLinks = remoteLinks;
        this._defaultTitle = 'Pontoon notifications';
        this._refreshInterval = undefined;

        this._init();
    }

    _init() {
        this._addOnClickAction();
        this._addContextMenu();
        this._watchStorageChanges();
        this._watchOptionsUpdates();
        this._reload();
        // Bug 1395885 workaround
        chrome.windows.onCreated.addListener(function() {
            chrome.browserAction.getBadgeText({}, function(text) {
                this._updateBadge(text);
            }.bind(this));
        }.bind(this));
    }

    _updateNumberOfUnreadNotifications() {
        this._updateBadge('');
        this._remotePontoon.updateNotificationsData();
    }

    _updateTeamData() {
        this._remotePontoon.updateTeamData();
    }

    _updateData() {
        this._updateNumberOfUnreadNotifications();
        this._updateTeamData();
    }

    _scheduleOrUpdateRefreshWithInterval(intervalMinutes) {
        clearInterval(this._refreshInterval);
        this._refreshInterval = setInterval(this._updateData.bind(this), intervalMinutes * 60 * 1000);
    }

    _scheduleOrUpdateRefresh() {
        const optionKey = 'options.data_update_interval';
        this._options.get([optionKey], function(item) {
            const intervalMinutes = parseInt(item[optionKey], 10);
            this._scheduleOrUpdateRefreshWithInterval(intervalMinutes);
        }.bind(this));
    }

    _watchStorageChanges() {
        chrome.storage.onChanged.addListener(function(changes, areaName) {
            const dataKey = 'notificationsData';
            if (changes[dataKey] !== undefined) {
                const notificationsData = changes[dataKey].newValue;
                if (notificationsData !== undefined) {
                    this._updateBadge(`${Object.keys(notificationsData).length}`);
                } else {
                    this._updateBadge('!');
                }
            }
        }.bind(this));
    }

    _watchOptionsUpdates() {
        chrome.storage.onChanged.addListener(function(changes, areaName) {
            const updateIntervalOptionKey = 'options.data_update_interval';
            if (changes[updateIntervalOptionKey] !== undefined) {
                const intervalMinutes = parseInt(changes[updateIntervalOptionKey].newValue, 10);
                this._scheduleOrUpdateRefreshWithInterval(intervalMinutes);
            }
            const openPontoonOptionKey = 'options.open_pontoon_on_button_click';
            if (changes[openPontoonOptionKey]) {
                this._setPopup(!changes[openPontoonOptionKey].newValue);
            }
        }.bind(this));
    }

    _setPopup(showPopup) {
        if (showPopup) {
            chrome.browserAction.setPopup({popup: chrome.extension.getURL('html/popup.html')});
        } else {
            chrome.browserAction.setPopup({popup: ''});
        }
    }

    _addOnClickAction() {
        chrome.browserAction.onClicked.addListener(function(tab) {
            chrome.tabs.create({url: this._remotePontoon.getTeamPageUrl()});
        }.bind(this));
        const optionKey = 'options.open_pontoon_on_button_click';
        this._options.get([optionKey], function(item) {
            this._setPopup(!item[optionKey]);
        }.bind(this));
    }

    _addContextMenu() {
        chrome.contextMenus.create({
            title: 'Mark all Notifications as read',
            contexts: ['browser_action'],
            onclick: this._remotePontoon.markAllNotificationsAsRead.bind(this._remotePontoon),
        });
        chrome.contextMenus.create({
            title: 'Reload notifications',
            contexts: ['browser_action'],
            onclick: this._reload.bind(this),
        });
        const pontoonPagesMenuId = chrome.contextMenus.create({
            title: 'Pontoon pages',
            contexts: ['browser_action'],
        });
        chrome.contextMenus.create({
            title: 'Home',
            contexts: ['browser_action'],
            parentId: pontoonPagesMenuId,
            onclick: function() {chrome.tabs.create({url: this._remotePontoon.getBaseUrl()});}.bind(this),
        });
        chrome.contextMenus.create({
            title: 'Team page',
            contexts: ['browser_action'],
            parentId: pontoonPagesMenuId,
            onclick: function() {chrome.tabs.create({url: this._remotePontoon.getTeamPageUrl()});}.bind(this),
        });
        chrome.contextMenus.create({
            title: 'Team bugs',
            contexts: ['browser_action'],
            parentId: pontoonPagesMenuId,
            onclick: function() {chrome.tabs.create({url: this._remotePontoon.getTeamBugsUrl()});}.bind(this),
        });
        chrome.contextMenus.create({
            title: 'Machinery',
            contexts: ['browser_action'],
            parentId: pontoonPagesMenuId,
            onclick: function() {chrome.tabs.create({url: this._remotePontoon.getMachineryUrl()});}.bind(this),
        });
        const localizationResourcesMenuId = chrome.contextMenus.create({
            title: 'Other l10n sources',
            contexts: ['browser_action'],
        });
        chrome.contextMenus.create({
            title: 'Transvision',
            contexts: ['browser_action'],
            parentId: localizationResourcesMenuId,
            onclick: function() {chrome.tabs.create({url: this._remoteLinks.getTransvisionUrl()});}.bind(this),
        });
        chrome.contextMenus.create({
            title: 'amaGama.locamotion.org',
            contexts: ['browser_action'],
            parentId: localizationResourcesMenuId,
            onclick: function() {chrome.tabs.create({url: this._remoteLinks.getAmaGamaUrl()});}.bind(this),
        });
        chrome.contextMenus.create({
            title: 'Microsoft Terminology Search',
            contexts: ['browser_action'],
            parentId: localizationResourcesMenuId,
            onclick: function() {chrome.tabs.create({url: this._remoteLinks.getMicrosoftTerminologySearchUrl()});}.bind(this),
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
            onclick: function() {chrome.tabs.create({url: this._remoteLinks.getCambridgeDictionaryUrl()});}.bind(this),
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
            onclick: function() {chrome.tabs.create({url: this._remoteLinks.getMozillaStyleGuidesUrl()});}.bind(this),
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
            onclick: function() {chrome.tabs.create({url: this._remoteLinks.getElmoDashboardUrl()});}.bind(this),
        });
        chrome.contextMenus.create({
            title: 'Mozilla Web l10n Dashboard',
            contexts: ['browser_action'],
            parentId: localizationResourcesMenuId,
            onclick: function() {chrome.tabs.create({url: this._remoteLinks.getWebDashboardUrl()});}.bind(this),
        });
        chrome.contextMenus.create({
            title: 'MozillaWiki L10n Team',
            contexts: ['browser_action'],
            parentId: localizationResourcesMenuId,
            onclick: function() {chrome.tabs.create({url: this._remoteLinks.getMozillaWikiL10nTeamUrl()});}.bind(this),
        });
        chrome.contextMenus.create({
            title: 'Pontoon Tools options',
            contexts: ['browser_action'],
            onclick: function() {chrome.runtime.openOptionsPage();}.bind(this),
        });
    }

    _updateBadge(text) {
        chrome.browserAction.setBadgeText({text: text});
        if (text.trim().length === 0) {
            chrome.browserAction.setTitle({title: this._defaultTitle});
        } else {
            chrome.browserAction.setTitle({title: `${this._defaultTitle} (${text})`});
        }
        if (text !== '0' && text !== '') {
            chrome.browserAction.setBadgeBackgroundColor({color: '#F36'});
        } else {
            chrome.browserAction.setBadgeBackgroundColor({color: '#4d5967'});
        }
    }

    _reload() {
        this._updateData();
        this._scheduleOrUpdateRefresh();
    }
}
