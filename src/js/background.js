var notificationsUrl = 'https://pontoon.mozilla.org/notifications/';
var refreshInterval;
var error = false;

var options = new Options();

function updateIconUnreadCount(count) {
  chrome.browserAction.setBadgeText({text: count.toString()});
  if (count != 0) {
    chrome.browserAction.setBadgeBackgroundColor({color: '#F36'});
  } else {
    chrome.browserAction.setBadgeBackgroundColor({color: '#4d5967'});
  }
}

function updateNumberOfUnreadNotifications() {
  chrome.browserAction.setBadgeText({text: ''});
  fetch(notificationsUrl, {
    credentials: 'include',
    redirect: 'manual',
  }).then(function(response) {
    error = (response.status != 200);
    if (!error) {
      return response.text();
    } else {
      chrome.storage.local.remove('notificationsDocText');
      updateIconUnreadCount('!');
      scheduleRefresh();
      return undefined;
    }
  }).then(function(text) {
    if (text != undefined) {
      chrome.storage.local.set({notificationsDocText: text});
      var notificationsDoc = new DOMParser().parseFromString(text, 'text/html');
      var unreadCount = notificationsDoc.querySelectorAll('#main .notification-item[data-unread=true]').length;
      updateIconUnreadCount(unreadCount);
    }
  });
}

function setRefresh(intervalMinutes) {
  clearInterval(refreshInterval);
  refreshInterval = setInterval(updateNumberOfUnreadNotifications, intervalMinutes * 60 * 1000);
}

function scheduleRefresh() {
  if (!error) {
    var optionKey = 'options.notifications_update_interval';
    options.get([optionKey], function (item) {
      var intervalMinutes = parseInt(item[optionKey], 10);
      setRefresh(intervalMinutes);
    });
  } else {
    var intervalMinutes = 1;
    setRefresh(intervalMinutes);
  }
}

chrome.contextMenus.create({
  title: 'Reload notifications',
  contexts: ['browser_action'],
  onclick: function(info, tab) {
    updateNumberOfUnreadNotifications();
    scheduleRefresh();
  },
});
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
