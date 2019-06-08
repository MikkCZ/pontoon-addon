/**
 * Displays notifications in the browser-action popup.
 * @requires commons/js/Options.js, commons/js/BackgroundPontoonClient.js
 * @requires moment
 */
class NotificationsPopup {
    /**
     * Initialize instance, load notifications from storage and watch future data updates.
     * @param options
     * @param backgroundPontoonClient
     */
    constructor(options, backgroundPontoonClient) {
        this._options = options;
        this._backgroundPontoonClient = backgroundPontoonClient;

        this._watchStorageChanges();
        this._loadNotificationsFromStorage();
    }

    /**
     * Update notifications popup when notification data change in storage.
     * @private
     */
    _watchStorageChanges() {
        this._backgroundPontoonClient.subscribeToNotificationsChange(
            (change) => this._displayNotifications(change.newValue)
        );
    }

    /**
     * Load notifications data from storage and update the popup.
     * @private
     */
    _loadNotificationsFromStorage() {
        const dataKey = 'notificationsData';
        browser.storage.local.get(dataKey).then(
            (item) => this._displayNotifications(item[dataKey])
        );
    }

    /**
     * Create notification popup list item from data object.
     * @param notification data object
     * @returns {Element} notification list item
     * @private
     */
    _createNotificationListItem(notification) {
        const listItem = document.createElement('li');
        if (notification.unread) {
            listItem.classList.add('unread');
        } else {
            listItem.classList.add('read');
        }
        if (notification.actor) {
            const actorLink = document.createElement('a');
            actorLink.textContent = notification.actor.anchor || notification.actor.text;
            this._backgroundPontoonClient.getTeamProjectUrl(notification.actor.url || notification.actor.link).then(
                (teamProjectUrl) => actorLink.setAttribute('href', teamProjectUrl)
            );
            listItem.appendChild(actorLink);
        }
        if (notification.verb) {
            const verb = document.createElement('span');
            verb.textContent = ` ${notification.verb}`;
            listItem.appendChild(verb);
        }
        if (notification.target) {
            const targetLink = document.createElement('a');
            targetLink.textContent = ` ${notification.target.anchor || notification.target.text}`;
            this._backgroundPontoonClient.getTeamProjectUrl(notification.target.url || notification.target.link).then(
                (teamProjectUrl) => targetLink.setAttribute('href', teamProjectUrl)
            );
            listItem.appendChild(targetLink);
        }
        if (notification.date_iso) {
            const timeago = document.createElement('div');
            timeago.textContent = NotificationsPopup._timeAgo(new Date(notification.date_iso));
            timeago.classList.add('timeago');
            listItem.appendChild(timeago);
        } else if (notification.timeago) {
            const timeago = document.createElement('div');
            timeago.textContent = notification.timeago;
            timeago.classList.add('timeago');
            listItem.appendChild(timeago);
        }
        if (notification.message) {
            const message = document.createElement('div');
            message.innerHTML = notification.message;
            message.classList.add('message');
            listItem.appendChild(message);
        }
        if (listItem.querySelectorAll('a').length === 1) {
            const listItemClick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                browser.tabs.create({url: listItem.querySelector('a').href});
            };
            listItem.querySelectorAll('*').forEach((child) =>
                child.addEventListener('click', listItemClick)
            );
            listItem.addEventListener('click', listItemClick);
            listItem.classList.add('pointer');
        }
        return listItem;
    }

    /**
     * Display notifications from data from storage.
     * @param notificationsData from storage
     * @private
     * @async
     */
    async _displayNotifications(notificationsData) {
        const notificationsList = document.getElementById('notification-list');
        const markAllReadLink = document.querySelector('.notification-list .mark-all-as-read');
        const seeAllLink = document.querySelector('.notification-list .see-all');
        const error = document.getElementById('error');

        const optionKey = 'toolbar_button_popup_always_hide_read_notifications';
        const hideReadNotifications = await this._options.get(optionKey).then((item) => item[optionKey]);

        if (notificationsData !== undefined && Object.keys(notificationsData).length > 0) {
            while (notificationsList.lastChild) {
                notificationsList.removeChild(notificationsList.lastChild);
            }
            Object.keys(notificationsData)
                .map((nKey) => parseInt(nKey))
                .sort((a, b) => a - b).reverse()
                .map((nKey) => notificationsData[nKey])
                .filter((notification) => notification.unread || !hideReadNotifications)
                .map((data) => this._createNotificationListItem(data))
                .forEach((listItem) => notificationsList.appendChild(listItem));
            notificationsList.classList.remove('hidden');
            if (Object.values(notificationsData).some(n => n.unread)) {
                markAllReadLink.classList.remove('hidden');
                seeAllLink.classList.add('hidden');
            } else {
                markAllReadLink.classList.add('hidden');
                seeAllLink.classList.remove('hidden');
            }
            error.classList.add('hidden');
        } else if (notificationsData !== undefined) {
            notificationsList.classList.add('hidden');
            markAllReadLink.classList.add('hidden');
            seeAllLink.classList.remove('hidden');
            error.classList.add('hidden');
        } else {
            notificationsList.classList.add('hidden');
            markAllReadLink.classList.add('hidden');
            seeAllLink.classList.add('hidden');
            error.classList.remove('hidden');
        }
    }

    /**
     * Return string of how much is the given date in past.
     * @param date
     * @returns {String}
     * @private
     * @static
     */
    static _timeAgo(date) {
        const dateMoment = moment.utc(date);
        if (!date || !dateMoment.isValid()) {
            return '―';
        }
        const duration = moment.duration(moment.utc().diff(dateMoment));
        const durationString = duration.format({
            template: 'Y __, M __, W __, D __, h __, m __, s __',
            largest: 2,
            minValue: 60,
        });
        return `${durationString} ago`;
    }
}
