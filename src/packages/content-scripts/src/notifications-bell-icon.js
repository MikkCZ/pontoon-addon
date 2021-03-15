import { BackgroundPontoonClient } from '@pontoon-addon/commons/src/BackgroundPontoonClient';
if (!browser) { // eslint-disable-line no-use-before-define
    var browser = require('webextension-polyfill'); // eslint-disable-line no-var, no-inner-declarations
}

/**
 * This content script syncs the status of the notifications bell icon in Pontoon with the extension.
 * - https://developer.mozilla.org/Add-ons/WebExtensions/Content_scripts
 */

// Notifications bell icon, if there are any unread notifications.
const unreadNotificationsIcon = document.querySelector('#notifications.unread .button .icon') || document.querySelector('header .user-notifications-menu.unread');
const unreadDOMElement = document.querySelector('#notifications.unread') || document.querySelector('header .user-notifications-menu.unread');
const backgroundPontoonClient = new BackgroundPontoonClient();

/**
 * Removes itself as a listener for further clicks and sends message via BackgroundPontoonClient to mark all notifications as read.
 */
function unreadNotificationsIconClickListener() {
    removeUnreadNotificationsIconClickListener();
    backgroundPontoonClient.markAllNotificationsAsRead();
}

/**
 * Add the notifications icon click listener.
 */
function addUnreadNotificationsIconClickListener() {
    unreadNotificationsIcon.addEventListener('click', unreadNotificationsIconClickListener);
}

/**
 * Remove the notifications icon click listener.
 */
function removeUnreadNotificationsIconClickListener() {
    unreadNotificationsIcon.removeEventListener('click', unreadNotificationsIconClickListener);
}

/**
 * Mark notifications in the tab as read (change the bell icon color) if they have been marked as read from the add-on.
 * @param change of the notifications data
 */
function notificationsDataChangeListener(change) {
    const notificationsData = change.newValue;
    const unreadNotifications = Object.values(notificationsData)
        .filter(n => n.unread)
        .length;
    if (unreadNotifications === 0) {
        removeUnreadNotificationsIconClickListener();
        unreadDOMElement.classList.remove('unread');
    }
}

/**
 * Register listeners for unread icon click and notifications data updates.
 */
function registerAllListeners() {
    if (unreadNotificationsIcon !== null) {
        addUnreadNotificationsIconClickListener();
        backgroundPontoonClient.subscribeToNotificationsChange(notificationsDataChangeListener);
    }
}

/**
 * Remove listeners for unread icon click and notifications data updates.
 */
function deregisterAllListeners() {
    if (unreadNotificationsIcon !== null) {
        removeUnreadNotificationsIconClickListener();
        backgroundPontoonClient.unsubscribeFromNotificationsChange(notificationsDataChangeListener);
    }
}

/**
 * (De)activate this script based on the messages from background/DataRefresher.js.
 */
function backgroundMessageHandler(message) {
    switch (message.type) {
        case 'enable-notifications-bell-script':
            registerAllListeners();
            break;
        case 'disable-notifications-bell-script':
            deregisterAllListeners();
            break;
    }
}

browser.runtime.onMessage.addListener(
    (request, sender) => backgroundMessageHandler(request)
);

browser.runtime.sendMessage({type: 'notifications-bell-script-loaded'})
    .then((response) => backgroundMessageHandler(response));
