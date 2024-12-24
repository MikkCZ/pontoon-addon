import {
  markAllNotificationsAsRead,
  notificationBellIconScriptLoaded,
} from '@commons/backgroundMessaging';
import { doAsync } from '@commons/utils';
import {
  listenToMessages,
  listenToStorageChange,
} from '@commons/webExtensionsApi';

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

function init() {
  listenToMessages<'ENABLE_NOTIFICATIONS_BELL_SCRIPT'>(
    'enable-notifications-bell-script',
    () => {
      listenersEnabled = true;
      registerAllListeners();
    },
  );
  listenToMessages<'DISABLE_NOTIFICATIONS_BELL_SCRIPT'>(
    'disable-notifications-bell-script',
    () => {
      listenersEnabled = false;
      console.info('Pontoon Add-on: listeners disabled');
    },
  );
  doAsync(async () => {
    const { type: responseType } = await notificationBellIconScriptLoaded();
    switch (responseType) {
      case 'enable-notifications-bell-script':
        listenersEnabled = true;
        registerAllListeners();
        break;
      case 'disable-notifications-bell-script':
        listenersEnabled = false;
        console.info('Pontoon Add-on: listeners disabled');
        break;
      default:
        throw new Error(`Unexpected response type '${responseType}'.`);
    }
  });
}

init();
