'use-strict';

function withRemotePontoon(remotePontoon) {
    document.querySelector('#empty-list .see-all').addEventListener('click', function(e) {
        e.preventDefault();
        chrome.tabs.create({url: remotePontoon.getNotificationsUrl()});
        window.close();
    });
    document.querySelector('#full-list .mark-all-as-read').addEventListener('click', function(e) {
        e.preventDefault();
        remotePontoon.markAllNotificationsAsRead();
    });
    document.querySelector('#error .sign-in').addEventListener('click', function(e) {
        e.preventDefault();
        chrome.tabs.create({url: remotePontoon.getBaseUrl()});
        window.close();
    });
    document.querySelector('a.team-page').addEventListener('click', function(e) {
        e.preventDefault();
        chrome.tabs.create({url: remotePontoon.getTeamPageUrl()});
        window.close();
    });
    for (const hLink of document.querySelectorAll('#team-info h1 a')) {
        hLink.addEventListener('click', function(e) {
            e.preventDefault();
            chrome.tabs.create({url: remotePontoon.getTeamPageUrl()});
            window.close();
        });
    }

    var notificationsPopup = new NotificationsPopup(remotePontoon);
    var teamInfoPopup = new TeamInfoPopup(remotePontoon);
}

var options = new Options();
var localeTeamOptionKey = 'options.locale_team';
options.get([localeTeamOptionKey], function(items) {
    var remotePontoon = new RemotePontoon(items[localeTeamOptionKey]);
    withRemotePontoon(remotePontoon);
});
