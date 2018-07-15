/**
 * Takes care of regular refreshing notifications and other data from Pontoon.
 * @requires commons/js/Options.js, RemotePontoon.js
 */
class DataRefresher {
    /**
     * Initialize instance, load data from Pontoon and schedule regular data updates.
     * @param options
     * @param remotePontoon
     */
    constructor(options, remotePontoon) {
        this._options = options;
        this._remotePontoon = remotePontoon;
        this._alarmName = 'data-refresher-alarm';

        this._listenToAlarm();
        this._watchOptionsUpdates();
        this._watchTabsUpdates();
        this._setupAlarm();

        this.refreshData();
    }

    /**
     * Trigger refresh of rather 'static' data after add-on is updated or installed.
     */
    refreshDataOnInstallOrUpdate() {
        this._remotePontoon.updateProjectsList();
    }

    /**
     * Trigger notifications and team data refresh.
     */
    refreshData() {
        this._remotePontoon.updateNotificationsData();
        this._remotePontoon.updateLatestTeamActivity();
        this._remotePontoon.updateTeamsList();
    }

    /**
     * Trigger data refresh, when the alarm fires.
     * @private
     */
    _listenToAlarm() {
        browser.alarms.onAlarm.addListener((alarm) => {
            if (alarm.name === this._alarmName) {
                this.refreshData();
            }
        });
    }

    /**
     * Keep data update interval in sync with options and watch for container settings changes.
     * @private
     */
    _watchOptionsUpdates() {
        this._options.subscribeToOptionChange('data_update_interval', (change) => {
            const intervalMinutes = parseInt(change.newValue, 10);
            this._setupAlarmWithInterval(intervalMinutes);
        });
        this._options.subscribeToOptionChange('contextual_identity', (change) => {
            browser.tabs.query(
                {url: this._remotePontoon.getBaseUrl() + '/*'}
            ).then((pontoonTabs) =>
                pontoonTabs
                    .filter((tab) => change.newValue !== tab.cookieStoreId)
                    .forEach((tab) =>
                        browser.tabs.sendMessage(tab.id, {type: 'disable-notifications-bell-script'})
                    )
            ).then(() => this.refreshData());
        });
    }

    /**
     * Load/activate content scripts in recognized tabs.
     * @private
     */
    _watchTabsUpdates() {
        browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete') {
                this._options.get('contextual_identity').then((item) => {
                    if (item['contextual_identity'] === tab.cookieStoreId || !_isFirefox()) {
                        browser.tabs.executeScript(tabId, {file: '/content-scripts/live-data-provider.js'});
                    }
                });
            }
        });
        browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === 'notifications-bell-script-loaded') {
                return this._options.get('contextual_identity').then((item) => {
                    if (item['contextual_identity'] === sender.tab.cookieStoreId || !_isFirefox()) {
                        return {type: 'enable-notifications-bell-script'};
                    }
                });
            }
        });
    }

    /**
     * Schedule data update with interval from options.
     * @private
     */
    _setupAlarm() {
        const optionKey = 'data_update_interval';
        this._options.get(optionKey).then((item) => {
            const intervalMinutes = parseInt(item[optionKey], 10);
            this._setupAlarmWithInterval(intervalMinutes);
        });
    }

    /**
     * Schedule data update to repeat with given interval.
     * @param intervalMinutes interval to update in minutes
     * @private
     */
    _setupAlarmWithInterval(intervalMinutes) {
        browser.alarms.create(this._alarmName, {periodInMinutes: intervalMinutes});
    }

    _isFirefox() {
        return browser.runtime.getURL('/').startsWith('moz-extension:');
    }
}
