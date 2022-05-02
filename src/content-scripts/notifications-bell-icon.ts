import {
  listenToMessages,
  markAllNotificationsAsRead,
  notificationBellIconScriptLoaded,
} from '@background/backgroundClient';
import { BackgroundClientMessageType } from '@background/BackgroundClientMessageType';
import { listenToStorageChange } from '@commons/webExtensionsApi';

const unreadNotificationsIcon =
  document.querySelector('#notifications.unread .button .icon') ||
  document.querySelector('header .user-notifications-menu.unread');
const unreadDOMElement =
  document.querySelector('#notifications.unread') ||
  document.querySelector('header .user-notifications-menu.unread');

let listenersEnabled = false;
let listenersRegistered = false;

function registerAllListeners() {
  if (unreadNotificationsIcon && !listenersRegistered) {
    unreadNotificationsIcon.addEventListener('click', () => {
      if (listenersEnabled) {
        listenersEnabled = false;
        markAllNotificationsAsRead();
        console.info('Pontoon Add-on: notified markAllNotificationsAsRead');
      }
    });
    listenToStorageChange(
      'notificationsData',
      ({ newValue: notificationsData }) => {
        if (notificationsData) {
          const unreadNotifications = Object.values(notificationsData).filter(
            ({ unread }) => unread,
          ).length;
          if (unreadNotifications === 0 && listenersEnabled) {
            listenersEnabled = false;
            unreadDOMElement?.classList.remove('unread');
            console.info('Pontoon Add-on: unread mark hidden');
          }
        }
      },
    );
    listenersRegistered = true;
    console.info('Pontoon Add-on: listeners registered');
  }
}

function backgroundMessageHandler(type: BackgroundClientMessageType) {
  switch (type) {
    case BackgroundClientMessageType.ENABLE_NOTIFICATIONS_BELL_SCRIPT:
      listenersEnabled = true;
      registerAllListeners();
      break;
    case BackgroundClientMessageType.DISABLE_NOTIFICATIONS_BELL_SCRIPT:
      listenersEnabled = false;
      console.info('Pontoon Add-on: listeners disabled');
      break;
  }
}

async function init() {
  listenToMessages((message) => {
    backgroundMessageHandler(message.type);
  });
  backgroundMessageHandler((await notificationBellIconScriptLoaded()).type);
}

init();
