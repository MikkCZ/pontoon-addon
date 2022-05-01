import { markAllNotificationsAsRead } from '@background/backgroundClient';
import { browser, listenToStorageChange } from '@commons/webExtensionsApi';

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

function backgroundMessageHandler({ type }: { type: string }) {
  switch (type) {
    case 'enable-notifications-bell-script':
      listenersEnabled = true;
      registerAllListeners();
      break;
    case 'disable-notifications-bell-script':
      listenersEnabled = false;
      console.info('Pontoon Add-on: listeners disabled');
      break;
  }
}

async function init() {
  browser.runtime.onMessage.addListener((request, _sender) =>
    backgroundMessageHandler(request),
  );
  const response = await browser.runtime.sendMessage({
    type: 'notifications-bell-script-loaded',
  });
  backgroundMessageHandler(response);
}

init();
