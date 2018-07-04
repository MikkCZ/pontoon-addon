/**
 * This content script syncs the status of the notifications bell icon in Pontoon with the extension.
 * - https://developer.mozilla.org/Add-ons/WebExtensions/Content_scripts
 */
'use strict';

// Notifications bell icon, if there are any unread notifications.
const unreadNotificationsIcon = document.querySelector('#notifications.unread .button .icon');

/**
 * Removes itself as a listener for further clicks and sends message to RemotePontoon.js to mark all notifications as read.
 */
function unreadNotificationsIconClick() {
    removeUnreadNotificationsIconClickListener();
    browser.runtime.sendMessage({type: 'mark-all-notifications-as-read-from-page'});
}

/**
 * Remove the notifications icon click listener.
 */
function removeUnreadNotificationsIconClickListener() {
    unreadNotificationsIcon.removeEventListener('click', unreadNotificationsIconClick);
}

/**
 * If there are any unread notifications, register a listener for marking them as read in or from the add-on.
 */
if (unreadNotificationsIcon !== null) {
    unreadNotificationsIcon.addEventListener('click', unreadNotificationsIconClick);

    // Listen to message from RemotePontoon.js to mark all notifications as read (change the bell icon color)
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === 'mark-all-notifications-as-read-from-extension') {
            removeUnreadNotificationsIconClickListener();
            document.getElementById('notifications').classList.remove('unread');
        }
    });
}
