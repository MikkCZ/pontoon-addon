var notificationsUrl = 'https://pontoon.mozilla.org/notifications/';
var refreshInterval;

function updateIconUnreadCount(count) {
  chrome.browserAction.setBadgeText({text: count.toString()});
  if (count > 0) {
    chrome.browserAction.setBadgeBackgroundColor({color: '#F36'});
  } else {
    chrome.browserAction.setBadgeBackgroundColor({color: '#4d5967'});
  }
}

function updateNumberOfUnreadNotifications() {
  fetch(notificationsUrl, {
    credentials: 'include'
  }).then(function(response) {
    return response.text();
  }).then(function(text) {
    chrome.storage.local.set({notificationsDocText: text});
    var notificationsDoc = new DOMParser().parseFromString(text, 'text/html');
    var unreadCount = notificationsDoc.querySelectorAll('#main .notification-item[data-unread=true]').length;
    updateIconUnreadCount(unreadCount);
  });
}

function scheduleRefresh() {
  var optionKey = 'options.notifications_update_interval';
  chrome.storage.local.get(optionKey, function (item) {
    if (item[optionKey] === undefined) {
      var intervalMinutes = 15;
    } else {
      var intervalMinutes = parseInt(item[optionKey], 10);
    }
    clearInterval(refreshInterval);
    refreshInterval = setInterval(updateNumberOfUnreadNotifications, intervalMinutes * 3600 * 1000);
  });
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  updateNumberOfUnreadNotifications();
  scheduleRefresh();
});
chrome.storage.onChanged.addListener(function(changes, areaName) {
  if (changes['options.notifications_update_interval'] !== undefined) {
    scheduleRefresh();
  }
});
updateNumberOfUnreadNotifications();
scheduleRefresh();
