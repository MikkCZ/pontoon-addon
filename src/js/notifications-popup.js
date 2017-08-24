var notificationsUrl = 'https://pontoon.mozilla.org/notifications/';

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

function loadNotifications() {
  fetch(notificationsUrl, {
    credentials: 'include'
  }).then(function(response) {
    return response.text();
  }).then(function(text) {
    var notificationsDoc = new DOMParser().parseFromString(text, 'text/html');
    var unreadNotifications = notificationsDoc.querySelectorAll('.notification-item[data-unread=true]');
    displayNotifications(unreadNotifications);
  });
}

loadNotifications();
