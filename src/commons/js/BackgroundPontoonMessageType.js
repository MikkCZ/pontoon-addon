/**
 * This is the enum of message type, that can be sent to or from RemotePontoon.js.
 */
'use strict';

var BackgroundPontoon = Object.freeze({
    MessageType: {
        TO_BACKGROUND: {
            PAGE_LOADED: 'pontoon-page-loaded',
            NOTIFICATIONS_READ: 'notifications-read',
        },
        FROM_BACKGROUND: {
            NOTIFICATIONS_READ: 'notifications-read-in-extension',
        },
    }
});
