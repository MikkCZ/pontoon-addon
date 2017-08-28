var remotePontoon = new RemotePontoon();

function seeAllNotifications(e) {
  e.preventDefault();
  chrome.tabs.create({url: remotePontoon.getNotificationsUrl()});
  window.close();
}
document.querySelectorAll('#empty-list .see-all')[0].addEventListener('click', seeAllNotifications);

document.querySelectorAll('#full-list .mark-all-as-read')[0].addEventListener('click', function(e) {
  e.preventDefault();
  remotePontoon.markAllNotificationsAsRead();
});

function appendNotificationToList(list, notification) {
  var sourceLink = notification.getElementsByTagName('a')[0];
  var link = document.createElement('a');
  link.textContent = sourceLink.textContent;
  link.setAttribute('href', remotePontoon.getBaseUrl() + sourceLink.getAttribute('href'));
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
  var error = document.getElementById('error');

  if (notifications != undefined && notifications.length > 0) {
    while (notificationsList.lastChild) {
      notificationsList.removeChild(notificationsList.lastChild);
    }
    for (n of notifications) {
      appendNotificationToList(notificationsList, n);
    }
    notificationsList.classList.remove('hidden');
    fullList.classList.remove('hidden');
    emptyList.classList.add('hidden');
    error.classList.add('hidden');
  } else if (notifications != undefined) {
    notificationsList.classList.add('hidden');
    fullList.classList.add('hidden');
    emptyList.classList.remove('hidden');
    error.classList.add('hidden');
  } else {
    notificationsList.classList.add('hidden');
    fullList.classList.add('hidden');
    emptyList.classList.add('hidden');
    error.classList.remove('hidden');
  }
}

function loadNotificationsFromStorage() {
  chrome.storage.local.get('notificationsDocText', function(item) {
    if (item.notificationsDocText != undefined) {
      var notificationsDoc = new DOMParser().parseFromString(item.notificationsDocText, 'text/html');
      var unreadNotifications = notificationsDoc.querySelectorAll('#main .notification-item[data-unread=true]');
      displayNotifications(unreadNotifications);
    } else {
      displayNotifications(undefined);
    }
  });
}
chrome.storage.onChanged.addListener(function(changes, areaName) {
  loadNotificationsFromStorage();
});

loadNotificationsFromStorage();
