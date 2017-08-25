var notificationsUrl = 'https://pontoon.mozilla.org/notifications/';

function markAllNotificationsAsRead(e) {
  e.preventDefault();
  var request = new XMLHttpRequest();
  request.addEventListener('readystatechange', function (e) {
    if(request.readyState === XMLHttpRequest.DONE) {
      console.log('request done');
      triggerNotificationsReload();
    }
  });
  request.open('GET', notificationsUrl+'mark-all-as-read/', true);
  request.send(null);
}

function appendNotificationToList(list, notification) {
  var sourceLink = notification.getElementsByTagName('a')[0];
  var link = document.createElement('a');
  link.innerHTML = sourceLink.innerHTML;
  link.setAttribute('href', 'https://pontoon.mozilla.org'+sourceLink.getAttribute('href'));
  var description = document.createElement('span');
  description.innerHTML = notification.querySelectorAll('.verb')[0].innerHTML + ' ' + notification.querySelectorAll('.timeago')[0].innerHTML;
  var listItem = document.createElement('li');
  listItem.appendChild(link);
  listItem.appendChild(document.createElement('br'));
  listItem.appendChild(description);
  list.appendChild(listItem);
}

function displayNotifications(notifications) {
  var notificationsList = document.getElementById('notification-list');
  while (notificationsList.lastChild) {
    notificationsList.removeChild(notificationsList.lastChild);
  }
  if (notifications.length > 0) {
    for (n of notifications) {
      appendNotificationToList(notificationsList, n);
    }
    notificationsList.appendChild(document.createElement('br'));
    var markAsReadLink = document.createElement('a');
    markAsReadLink.innerHTML = 'Mark all notifications as read';
    markAsReadLink.setAttribute('href', '#');
    markAsReadLink.addEventListener('click', markAllNotificationsAsRead);
    notificationsList.appendChild(markAsReadLink);
  } else {
    var span = document.createElement('span');
    span.innerHTML = 'There are no unread notifications!';
    var notificationsPageLink = document.createElement('a');
    notificationsPageLink.innerHTML = 'See all notifications.';
    notificationsPageLink.setAttribute('href', notificationsUrl);
    notificationsList.appendChild(span);
    notificationsList.appendChild(document.createElement('br'));
    notificationsList.appendChild(notificationsPageLink);
  }
}

function loadNotificationsFromStorage() {
  chrome.storage.local.get('notificationsDocText', function(item) {
    var notificationsDoc = new DOMParser().parseFromString(item.notificationsDocText, 'text/html');
    var unreadNotifications = notificationsDoc.querySelectorAll('.notification-item[data-unread=true]');
    displayNotifications(unreadNotifications);
  });
}

function triggerNotificationsReload() {
  chrome.runtime.sendMessage({
    type: 'notifications-reload-request'
  });
}

chrome.storage.onChanged.addListener(function(changes, areaName) {
  loadNotificationsFromStorage();
});

loadNotificationsFromStorage();
