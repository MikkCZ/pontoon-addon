import { Options } from 'Commons/js/Options';
import { BackgroundPontoonClient } from 'Commons/js/BackgroundPontoonClient';
import { NotificationsPopup } from './NotificationsPopup';
import { TeamInfoPopup } from './TeamInfoPopup';
if (!browser) { // eslint-disable-line no-use-before-define
    var browser = require('webextension-polyfill'); // eslint-disable-line no-var, no-inner-declarations
}

/**
 * This is the main script for the content of the toolbar button popup. Registers handlers for actions and initiates
 * objects taking care of the content.
 */

function withOptions(options) {
    const backgroundPontoonClient = new BackgroundPontoonClient();

    // See all notifications
    document.querySelector('.notification-list .see-all').addEventListener('click', (e) => {
        e.preventDefault();
        backgroundPontoonClient.getNotificationsUrl().then((notificationsUrl) => {
            browser.tabs.create({url: notificationsUrl});
            window.close();
        });
    });
    // Mark all notifications as read
    document.querySelector('.notification-list .mark-all-as-read').addEventListener('click', (e) => {
        e.preventDefault();
        backgroundPontoonClient.markAllNotificationsAsRead();
    });
    // Link to Pontoon when not signed in
    document.querySelector('#error .sign-in').addEventListener('click', (e) => {
        e.preventDefault();
        backgroundPontoonClient.getSignInURL().then((signInUrl) => {
            browser.tabs.create({url: signInUrl});
            window.close();
        });
    });
    // Team page links
    document.querySelectorAll('a.team-page,#team-info h1 a').forEach((hLink) => {
        hLink.addEventListener('click', (e) => {
            e.preventDefault();
            backgroundPontoonClient.getTeamPageUrl().then((teamPageUrl) => {
                browser.tabs.create({url: teamPageUrl});
                window.close();
            });
        });
    });

    const notifications = new NotificationsPopup(options, backgroundPontoonClient);
    const teamInfo = new TeamInfoPopup(options, backgroundPontoonClient);
}

Options.create().then(withOptions);
