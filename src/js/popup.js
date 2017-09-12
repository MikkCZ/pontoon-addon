'use strict';

const options = new Options();

function withRemotePontoon(remotePontoon) {
    document.querySelector('#empty-list .see-all').addEventListener('click', (e) => {
        e.preventDefault();
        chrome.tabs.create({url: remotePontoon.getNotificationsUrl()});
        window.close();
    });
    document.querySelector('#full-list .mark-all-as-read').addEventListener('click', (e) => {
        e.preventDefault();
        remotePontoon.markAllNotificationsAsRead();
    });
    document.querySelector('#error .sign-in').addEventListener('click', (e) => {
        e.preventDefault();
        chrome.tabs.create({url: remotePontoon.getBaseUrl()});
        window.close();
    });
    document.querySelector('a.team-page').addEventListener('click', (e) => {
        e.preventDefault();
        chrome.tabs.create({url: remotePontoon.getTeamPageUrl()});
        window.close();
    });
    document.querySelectorAll('#team-info h1 a').forEach((hLink) => {
        hLink.addEventListener('click', (e) => {
            e.preventDefault();
            chrome.tabs.create({url: remotePontoon.getTeamPageUrl()});
            window.close();
        });
    });

    const notificationsPopup = new NotificationsPopup(remotePontoon);
    const teamInfoPopup = new TeamInfoPopup(options, remotePontoon);
}

const localeTeamOptionKey = 'options.locale_team';
options.get(localeTeamOptionKey, (items) => {
    const remotePontoon = new RemotePontoon(items[localeTeamOptionKey]);
    withRemotePontoon(remotePontoon);
});
