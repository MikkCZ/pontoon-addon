'use-strict';

chrome.runtime.sendMessage({
    type: 'pontoon-page-loaded',
    value: document.documentElement.innerHTML
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type == 'mark-all-notifications-as-read-from-extension') {
        document.querySelectorAll('#notifications.unread .button .icon')[0].style.color = '#4D5967';
    }
});