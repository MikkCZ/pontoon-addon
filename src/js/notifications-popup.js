'use-strict';

var remotePontoon = new RemotePontoon();
document.querySelectorAll('#empty-list .see-all')[0].addEventListener('click', function(e) {
    e.preventDefault();
    chrome.tabs.create({url: remotePontoon.getNotificationsUrl()});
    window.close();
});
document.querySelectorAll('#full-list .mark-all-as-read')[0].addEventListener('click', function(e) {
    e.preventDefault();
    remotePontoon.markAllNotificationsAsRead();
});

var popup = new NotificationsPopup(remotePontoon);
popup.init();