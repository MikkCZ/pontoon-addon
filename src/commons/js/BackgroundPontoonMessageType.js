/**
 * This is the enum of message type, that can be sent to or from RemotePontoon.js.
 */
'use strict';

var BackgroundPontoon = Object.freeze({
    MessageType: {
        TO_BACKGROUND: {
            PAGE_LOADED: 'pontoon-page-loaded',
            NOTIFICATIONS_READ: 'notifications-read',
            GET_NOTIFICATIONS_URL: 'get-notifications-url',
            GET_SIGN_IN_URL: 'get-sign-in-url',
            GET_TEAM_PAGE_URL: 'get-team-page-url',
            GET_TEAM_PROJECT_URL: 'get-team-project-url',
            GET_STRINGS_WITH_STATUS_SEARCH_URL: 'get-strings-with-status-search-url',
        },
        FROM_BACKGROUND: {
            NOTIFICATIONS_UPDATED: 'notifications-updated',
        },
    }
});
