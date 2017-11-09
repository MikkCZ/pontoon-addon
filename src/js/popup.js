'use strict';

const options = new Options();

function withRemotePontoon(remotePontoon) {
    // See all notifications
    document.querySelector('.notification-list .see-all').addEventListener('click', (e) => {
        e.preventDefault();
        chrome.tabs.create({url: remotePontoon.getNotificationsUrl()});
        window.close();
    });
    // Mark all notifications as read
    document.querySelector('.notification-list .mark-all-as-read').addEventListener('click', (e) => {
        e.preventDefault();
        remotePontoon.markAllNotificationsAsRead();
    });
    // Link to Pontoon when not signed in
    document.querySelector('#error .sign-in').addEventListener('click', (e) => {
        e.preventDefault();
        chrome.tabs.create({url: remotePontoon.getBaseUrl()});
        window.close();
    });
    // Team page links
    document.querySelectorAll('a.team-page,#team-info h1 a').forEach((hLink) => {
        hLink.addEventListener('click', (e) => {
            e.preventDefault();
            chrome.tabs.create({url: remotePontoon.getTeamPageUrl()});
            window.close();
        });
    });

    const notificationsPopup = new NotificationsPopup(remotePontoon);
    const teamInfoPopup = new TeamInfoPopup(options, remotePontoon);
}

const pontoonBaseUrlOptionKey = 'pontoon_base_url';
const localeTeamOptionKey = 'locale_team';
options.get([pontoonBaseUrlOptionKey, localeTeamOptionKey], (items) => {
    const remotePontoon = new RemotePontoon(items[pontoonBaseUrlOptionKey], items[localeTeamOptionKey], options);
    withRemotePontoon(remotePontoon);
});
