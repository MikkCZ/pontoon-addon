import { Options } from '@pontoon-addon/commons/src/Options';
import { browser } from '@pontoon-addon/commons/src/webExtensionsApi';

import { NotificationsData, RemotePontoon } from './RemotePontoon';

export class SystemNotifications {
  private readonly options: Options;
  private readonly remotePontoon: RemotePontoon;

  constructor(options: Options, remotePontoon: RemotePontoon) {
    this.options = options;
    this.remotePontoon = remotePontoon;

    this.watchNotificationClicks();
    this.watchStorageChanges();
  }

  private watchNotificationClicks(): void {
    browser.notifications.onClicked.addListener((notificationId) =>
      this.notificationClick(notificationId)
    );
  }

  private async notificationClick(notificationId: string): Promise<void> {
    const dataKey = 'notificationsData';
    const item = await browser.storage.local.get(dataKey);
    const notificationsData = item[dataKey];
    const notification = notificationsData[notificationId];
    if (notification && !notification.target) {
      browser.tabs.create({
        url: this.remotePontoon.getTeamProjectUrl(notification.actor.url),
      });
    } else {
      browser.tabs.create({ url: this.remotePontoon.getTeamPageUrl() });
    }
    browser.notifications.clear(notificationId);
  }

  private watchStorageChanges(): void {
    this.remotePontoon.subscribeToNotificationsChange((change) => {
      const notificationsData = change.newValue;
      Promise.all([
        this.getNewUnreadNotifications(notificationsData),
        this.options.get('show_notifications').then((option: any) => {
          return option['show_notifications'];
        }),
      ]).then(([newUnreadNotificationIds, showNotifications]) => {
        if (showNotifications && newUnreadNotificationIds.length > 0) {
          this.notifyAboutUnreadNotifications(
            newUnreadNotificationIds,
            notificationsData
          );
        }
      });
    });
  }

  private async getNewUnreadNotifications(
    notificationsData: NotificationsData | undefined
  ): Promise<number[]> {
    let unreadNotificationIds: number[] = [0];
    if (notificationsData) {
      unreadNotificationIds = Object.values(notificationsData)
        .filter((notification) => notification.unread)
        .map((notification) => notification.id);
    }
    const dataKey = 'lastUnreadNotificationId';
    const lastKnownUnreadNotificationId = await browser.storage.local
      .get(dataKey)
      .then((item) => item[dataKey] || 0);
    return unreadNotificationIds.filter(
      (id) => id > lastKnownUnreadNotificationId
    );
  }

  private notifyAboutUnreadNotifications(
    unreadNotificationIds: number[],
    notificationsData: NotificationsData
  ) {
    const notificationItems = unreadNotificationIds
      .sort()
      .reverse()
      .map((id) => notificationsData[id])
      .map((notification) => {
        const item = {
          title: '',
          message: '',
        };
        if (notification.actor) {
          item.title = `${item.title} ${notification.actor.anchor}`;
        }
        if (notification.verb) {
          item.title = `${item.title} ${notification.verb}`;
        }
        if (notification.target) {
          item.title = `${item.title} ${notification.target.anchor}`;
        }
        if (notification.message) {
          item.message = notification.message;
        }
        return item;
      });
    const lastNotificationId = unreadNotificationIds.sort().reverse()[0];
    if (notificationItems.length === 1) {
      browser.notifications.create(`${lastNotificationId}`, {
        type: 'basic',
        iconUrl: browser.runtime.getURL(
          'packages/commons/static/img/pontoon-logo.svg'
        ),
        title: notificationItems[0].title,
        message: notificationItems[0].message,
      });
    } else {
      browser.notifications.create({
        type: 'list',
        iconUrl: browser.runtime.getURL(
          'packages/commons/static/img/pontoon-logo.svg'
        ),
        title: 'You have new unread notifications',
        message: `There are ${notificationItems.length} new unread notifications in Pontoon for you.`,
        items: notificationItems,
      });
    }
    browser.storage.local.set({ lastUnreadNotificationId: lastNotificationId });
  }
}
