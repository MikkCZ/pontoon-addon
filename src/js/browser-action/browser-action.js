/**
 * This is the main script for the content of the toolbar button popup. Registers handlers for actions and initiates
 * objects taking care of the content.
 * @requires Options.js, NotificationsPopup.js, TeamInfoPopup.js, RemotePontoon.js
 */
'use strict';

const options = new Options();
const pontoonBaseUrlOptionKey = 'pontoon_base_url';
const localeTeamOptionKey = 'locale_team';

/**
 * Does everything depending on data about or from Pontoon.
 * @param remotePontoon RemotePontoon instance used in the toolbar button popup
 */
function withRemotePontoon(remotePontoon) {
    // See all notifications
    document.querySelector('.notification-list .see-all').addEventListener('click', (e) => {
        e.preventDefault();
        browser.tabs.create({url: remotePontoon.getNotificationsUrl('pontoon-tools')});
        window.close();
    });
    // Mark all notifications as read
    document.querySelector('.notification-list .mark-all-as-read').addEventListener('click', (e) => {
        e.preventDefault();
        browser.runtime.sendMessage({type: 'mark-all-notifications-as-read-from-browser-action'});
    });
    // Link to Pontoon when not signed in
    document.querySelector('#error .sign-in').addEventListener('click', (e) => {
        e.preventDefault();
        browser.tabs.create({url: remotePontoon.getSignInURL()});
        window.close();
    });
    // Team page links
    document.querySelectorAll('a.team-page,#team-info h1 a').forEach((hLink) => {
        hLink.addEventListener('click', (e) => {
            e.preventDefault();
            browser.tabs.create({url: remotePontoon.getTeamPageUrl()});
            window.close();
        });
    });

    // Create objects to fill and handle the content
    const notifications = new NotificationsPopup(options, remotePontoon);
    const teamInfo = new TeamInfoPopup(options, remotePontoon);
}

/**
 * With the necessary options, create RemotePontoon instance and trigger actions depending on it.
 */
options.get([pontoonBaseUrlOptionKey, localeTeamOptionKey]).then(
    (items) => {
        const remotePontoon = new RemotePontoon(items[pontoonBaseUrlOptionKey], items[localeTeamOptionKey], options);
        withRemotePontoon(remotePontoon);
    }
);
