/**
 * This is the content script used for live date updates from loaded Pontoon pages.
 */
'use strict';

// Send page content to RemotePontoon.js to update data live
browser.runtime.sendMessage({
    type: 'pontoon-page-loaded',
    url: document.location.toString(),
    value: document.documentElement.innerHTML
});

// Notifications bell icon, if any are unread
const unreadNotificationsIcon = document.querySelector('#notifications.unread .button .icon');

/**
 * Removes itself as a listener for further clicks and sends message to RemotePontoon.js to mark all notifications as read.
 */
function unreadNotificationsIconClick() {
    unreadNotificationsIcon.removeEventListener('click', unreadNotificationsIconClick);
    browser.runtime.sendMessage({type: 'mark-all-notifications-as-read-from-page'});
}

/**
 * If there are any unread notifications, register a listener for marking them as read in or from the add-on.
 */
if (unreadNotificationsIcon !== null) {
    unreadNotificationsIcon.addEventListener('click', unreadNotificationsIconClick);

    // Listen to message from RemotePontoon.js to mark all notifications as read (change the bell icon color)
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === 'mark-all-notifications-as-read-from-extension') {
            document.getElementById('notifications').classList.remove('unread');
        }
    });
}
