'use strict';

// Send page content to update data live
browser.runtime.sendMessage({
    type: 'pontoon-page-loaded',
    url: document.location.toString(),
    value: document.documentElement.innerHTML
});

const unreadNotificationsIcon = document.querySelector('#notifications.unread .button .icon');

/**
 * Remove itself as a click listener and send message to the background to mark all notifications as read.
 */
function unreadNotificationsIconClick() {
    unreadNotificationsIcon.removeEventListener('click', unreadNotificationsIconClick);
    browser.runtime.sendMessage({type: 'mark-all-notifications-as-read-from-page'});
}

if (unreadNotificationsIcon !== null) {
    unreadNotificationsIcon.addEventListener('click', unreadNotificationsIconClick);

    // Listen to messages from background to mark all notifications as read (change the bell icon color)
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === 'mark-all-notifications-as-read-from-extension') {
            document.getElementById('notifications').classList.remove('unread');
        }
    });
}
