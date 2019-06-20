/**
 * Handles native system notifications for new unread notifications in Pontoon.
 * @requires commons/js/Options.js, RemotePontoon.js
 */
class SystemNotifications {
    /**
     * Initialize instance and watch for storage updates.
     * @param options
     * @param remotePontoon
     */
    constructor(options, remotePontoon) {
        this._options = options;
        this._remotePontoon = remotePontoon;

        this._watchNotificationClicks();
        this._watchStorageChanges();
    }

    /**
     * Register a listener for notification clicks.
     * @private
     */
    _watchNotificationClicks() {
        browser.notifications.onClicked.addListener((notificationId) => this._notificationClick(notificationId));
    }

    /**
     * Handle click to a system notification.
     * @param notificationId corresponding to the Pontoon notification id, if the notification is not grouped
     * @private
     */
    async _notificationClick(notificationId) {
        const dataKey = 'notificationsData';
        const item = await browser.storage.local.get(dataKey);
        const notificationsData = item[dataKey];
        const notification = notificationsData[notificationId];
        if (notification && !notification.target) {
            browser.tabs.create({url: this._remotePontoon.getTeamProjectUrl(notification.actor.url)});
        } else {
            browser.tabs.create({url: this._remotePontoon.getTeamPageUrl()});
        }
        browser.notifications.clear(notificationId);
    }

    /**
     * Check for new unread notifications if the storage gets updated.
     * @private
     */
    _watchStorageChanges() {
        this._remotePontoon.subscribeToNotificationsChange(
            (change) => {
                const notificationsData = change.newValue;
                Promise.all([
                    this._getNewUnreadNotifications(notificationsData),
                    this._options.get('show_notifications').then((option) => option['show_notifications'])
                ]).then(([
                    newUnreadNotificationIds,
                    showNotifications
                ]) => {
                    if (showNotifications && newUnreadNotificationIds.length > 0) {
                        this._notifyAboutUnreadNotifications(newUnreadNotificationIds, notificationsData);
                    }
                });
            }
        );
    }

    /**
     * Get new unread notifications that the user hasn't been notified about.
     * @param notificationsData
     * @returns {Promise.<Array.<number>>} promise that will be fulfilled with the list of unread notification ids
     * @private
     * @async
     */
    async _getNewUnreadNotifications(notificationsData) {
        let unreadNotificationIds = [0];
        if (notificationsData !== undefined) {
            unreadNotificationIds = Object.keys(notificationsData)
                .map((key) => parseInt(key))
                .filter((id) => notificationsData[id].unread);
        }
        const dataKey = 'lastUnreadNotificationId';
        const lastKnownUnreadNotificationId = await browser.storage.local.get(dataKey).then((item) => {
            return item[dataKey] || 0;
        });
        return unreadNotificationIds.filter((id) => id > lastKnownUnreadNotificationId);
    }

    /**
     * Show a system notification about new unread notifications in Pontoon.
     * @param unreadNotificationIds
     * @param notificationsData
     * @private
     */
    _notifyAboutUnreadNotifications(unreadNotificationIds, notificationsData) {
        const notificationItems = unreadNotificationIds.sort().reverse()
            .map((id) => notificationsData[id])
            .map((notification) => {
                const item = {
                    title: '',
                    message: '',
                };
                if (notification.actor) {
                    item.title = `${item.title} ${notification.actor.anchor}`;
                }
                if (notification.verb) {
                    item.title = `${item.title} ${notification.verb}`;
                }
                if (notification.target) {
                    item.title = `${item.title} ${notification.target.anchor}`;
                }
                if (notification.message) {
                    item.message = notification.message;
                }
                return item;
            });
        const lastNotificationId = unreadNotificationIds.sort().reverse()[0];
        if (notificationItems.length === 1) {
            browser.notifications.create(
                `${lastNotificationId}`,
                {
                    type: 'basic',
                    iconUrl: browser.runtime.getURL('packages/commons/img/pontoon-logo.svg'),
                    title: notificationItems[0].title,
                    message: notificationItems[0].message,
                }
            );
        } else {
            browser.notifications.create({
                type: 'list',
                iconUrl: browser.runtime.getURL('packages/commons/img/pontoon-logo.svg'),
                title: 'You have new unread notifications',
                message: `There are ${notificationItems.length} new unread notifications in Pontoon for you.`,
                items: notificationItems,
            });
        }
        browser.storage.local.set({lastUnreadNotificationId: lastNotificationId});
    }
}
