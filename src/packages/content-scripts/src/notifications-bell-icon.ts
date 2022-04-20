import {
  BackgroundPontoonClient,
  NotificationsData,
} from '@pontoon-addon/commons/src/BackgroundPontoonClient';
import { browser } from '@pontoon-addon/commons/src/webExtensionsApi';

const unreadNotificationsIcon =
  document.querySelector('#notifications.unread .button .icon') ||
  document.querySelector('header .user-notifications-menu.unread');
const unreadDOMElement =
  document.querySelector('#notifications.unread') ||
  document.querySelector('header .user-notifications-menu.unread');
const backgroundPontoonClient = new BackgroundPontoonClient();

/**
 * Removes itself as a listener for further clicks and sends message via BackgroundPontoonClient to mark all notifications as read.
 */
function unreadNotificationsIconClickListener() {
  removeUnreadNotificationsIconClickListener();
  backgroundPontoonClient.markAllNotificationsAsRead();
}

function addUnreadNotificationsIconClickListener() {
  unreadNotificationsIcon?.addEventListener(
    'click',
    unreadNotificationsIconClickListener
  );
}

function removeUnreadNotificationsIconClickListener() {
  unreadNotificationsIcon?.removeEventListener(
    'click',
    unreadNotificationsIconClickListener
  );
}

/**
 * Mark notifications in the tab as read (change the bell icon color) if they have been marked as read from the add-on.
 */
function notificationsDataChangeListener(change: {
  newValue: NotificationsData;
}) {
  const notificationsData = change.newValue;
  const unreadNotifications = Object.values(notificationsData).filter(
    (n) => n.unread
  ).length;
  if (unreadNotifications === 0) {
    removeUnreadNotificationsIconClickListener();
    unreadDOMElement?.classList.remove('unread');
  }
}

/**
 * Register listeners for unread icon click and notifications data updates.
 */
function registerAllListeners() {
  if (unreadNotificationsIcon !== null) {
    addUnreadNotificationsIconClickListener();
    backgroundPontoonClient.subscribeToNotificationsChange(
      notificationsDataChangeListener
    );
  }
}

function deregisterAllListeners() {
  if (unreadNotificationsIcon !== null) {
    removeUnreadNotificationsIconClickListener();
    backgroundPontoonClient.unsubscribeFromNotificationsChange(
      notificationsDataChangeListener
    );
  }
}

function backgroundMessageHandler(message: { type: string }) {
  switch (message.type) {
    case 'enable-notifications-bell-script':
      registerAllListeners();
      break;
    case 'disable-notifications-bell-script':
      deregisterAllListeners();
      break;
  }
}

browser.runtime.onMessage.addListener((request, _sender) =>
  backgroundMessageHandler(request)
);

browser.runtime
  .sendMessage({ type: 'notifications-bell-script-loaded' })
  .then((response) => backgroundMessageHandler(response));
