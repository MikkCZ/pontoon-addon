/**
 * This content script syncs the status of the notifications bell icon in Pontoon with the extension.
 * - https://developer.mozilla.org/Add-ons/WebExtensions/Content_scripts
 * @requires commons/js/BackgroundPontoonClient.js
 */
'use strict';

// Notifications bell icon, if there are any unread notifications.
const unreadNotificationsIcon = document.querySelector('#notifications.unread .button .icon');
const backgroundPontoonClient = new BackgroundPontoonClient();

/**
 * Removes itself as a listener for further clicks and sends message via BackgroundPontoonClient to mark all notifications as read.
 */
function unreadNotificationsIconClick() {
    removeUnreadNotificationsIconClickListener();
    backgroundPontoonClient.markAllNotificationsAsRead();
}

/**
 * Remove the notifications icon click listener.
 */
function removeUnreadNotificationsIconClickListener() {
    unreadNotificationsIcon.removeEventListener('click', unreadNotificationsIconClick);
}

/**
 * If there are any unread notifications, register a listener for marking them as read from the add-on.
 */
if (unreadNotificationsIcon !== null) {
    unreadNotificationsIcon.addEventListener('click', unreadNotificationsIconClick);

    // Listen to message from RemotePontoon to mark all notifications as read (change the bell icon color)
    backgroundPontoonClient.subscribeToNotificationsChange((change) => {
        const notificationsData = change.newValue;
        const unreadNotifications = Object.values(notificationsData)
            .filter(n => n.unread)
            .length;
        if (unreadNotifications === 0) {
            removeUnreadNotificationsIconClickListener();
            document.getElementById('notifications').classList.remove('unread');
        }
    });
}
