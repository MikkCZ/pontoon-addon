/**
 * Takes care of regular refreshing notifications and other data from Pontoon.
 * @requires commons/js/Options.js, commons/js/RemotePontoon.js
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
        this._setupAlarm();
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
                this._triggerDataRefresh();
            }
        });
    }

    /**
     * Keep data update interval in sync with options.
     * @private
     */
    _watchOptionsUpdates() {
        this._options.subscribeToOptionChange('data_update_interval', (change) => {
            const intervalMinutes = parseInt(change.newValue, 10);
            this._setupAlarmWithInterval(intervalMinutes);
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
}
