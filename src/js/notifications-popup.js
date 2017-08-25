var pontoonBaseUrl = 'https://pontoon.mozilla.org';
var notificationsUrl = pontoonBaseUrl + '/notifications/';
var markAsReadUrl = notificationsUrl + 'mark-all-as-read/';

function seeAllNotifications(e) {
  e.preventDefault();
  chrome.tabs.create({url: notificationsUrl});
}
document.querySelectorAll('#empty-list .see-all')[0].addEventListener('click', seeAllNotifications);

function triggerNotificationsReload() {
  chrome.runtime.sendMessage({
    type: 'notifications-reload-request'
  });
}

function markAllNotificationsAsRead(e) {
  e.preventDefault();
  var request = new XMLHttpRequest();
  request.addEventListener('readystatechange', function (e) {
    if(request.readyState === XMLHttpRequest.DONE) {
      console.log('request done');
      triggerNotificationsReload();
    }
  });
  request.open('GET', markAsReadUrl, true);
  request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  request.send(null);
}
document.querySelectorAll('#full-list .mark-all-as-read')[0].addEventListener('click', markAllNotificationsAsRead);

function appendNotificationToList(list, notification) {
  var sourceLink = notification.getElementsByTagName('a')[0];
  var link = document.createElement('a');
  link.textContent = sourceLink.textContent;
  link.setAttribute('href', pontoonBaseUrl + sourceLink.getAttribute('href'));
  var description = document.createElement('span');
  description.textContent = notification.querySelectorAll('.verb')[0].textContent + ' ' + notification.querySelectorAll('.timeago')[0].textContent;
  var listItem = document.createElement('li');
  listItem.appendChild(link);
  listItem.appendChild(document.createElement('br'));
  listItem.appendChild(description);
  list.appendChild(listItem);
}

function displayNotifications(notifications) {
  var notificationsList = document.getElementById('notification-list');
  var fullList = document.getElementById('full-list');
  var emptyList = document.getElementById('empty-list');

  if (notifications.length > 0) {
    while (notificationsList.lastChild) {
      notificationsList.removeChild(notificationsList.lastChild);
    }
    for (n of notifications) {
      appendNotificationToList(notificationsList, n);
    }
    notificationsList.classList.remove('hidden');
    fullList.classList.remove('hidden');
    emptyList.classList.add('hidden');
  } else {
    notificationsList.classList.add('hidden');
    fullList.classList.add('hidden');
    emptyList.classList.remove('hidden');
  }
}

function loadNotificationsFromStorage() {
  chrome.storage.local.get('notificationsDocText', function(item) {
    var notificationsDoc = new DOMParser().parseFromString(item.notificationsDocText, 'text/html');
    var unreadNotifications = notificationsDoc.querySelectorAll('#main .notification-item[data-unread=true]');
    displayNotifications(unreadNotifications);
  });
}
chrome.storage.onChanged.addListener(function(changes, areaName) {
  loadNotificationsFromStorage();
});

loadNotificationsFromStorage();
