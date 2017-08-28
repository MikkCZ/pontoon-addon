'use-strict';

var options = new Options();
var remotePontoon = new RemotePontoon();

document.querySelectorAll('#empty-list .see-all')[0].addEventListener('click', function(e) {
    e.preventDefault();
    chrome.tabs.create({url: remotePontoon.getNotificationsUrl()});
    window.close();
});
var localeTeamOptionKey = 'options.locale_team';
options.get([localeTeamOptionKey], function(items) {
    for (const link of document.querySelectorAll('a.team-page')) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            chrome.tabs.create({url: remotePontoon.getTeamPageUrl(items[localeTeamOptionKey])});
            window.close();
        });
    }
});
document.querySelectorAll('#full-list .mark-all-as-read')[0].addEventListener('click', function(e) {
    e.preventDefault();
    remotePontoon.markAllNotificationsAsRead();
});
document.querySelectorAll('#error .sign-in')[0].addEventListener('click', function(e) {
    e.preventDefault();
    chrome.tabs.create({url: remotePontoon.getBaseUrl()});
    window.close();
});

var popup = new NotificationsPopup(remotePontoon);