import { Options } from '@pontoon-addon/commons/src/Options';

import { RemotePontoon } from './RemotePontoon';
import { browser } from './util/webExtensionsApi';

export class SystemNotifications {
  private readonly _options: Options;
  private readonly _remotePontoon: RemotePontoon;

  constructor(options: Options, remotePontoon: RemotePontoon) {
    this._options = options;
    this._remotePontoon = remotePontoon;

    this._watchNotificationClicks();
    this._watchStorageChanges();
  }

  private _watchNotificationClicks(): void {
    browser.notifications.onClicked.addListener((notificationId) =>
      this._notificationClick(notificationId)
    );
  }

  private async _notificationClick(notificationId: string): Promise<void> {
    const dataKey = 'notificationsData';
    const item = await browser.storage.local.get(dataKey);
    const notificationsData = item[dataKey];
    const notification = notificationsData[notificationId];
    if (notification && !notification.target) {
      browser.tabs.create({
        url: this._remotePontoon.getTeamProjectUrl(notification.actor.url),
      });
    } else {
      browser.tabs.create({ url: this._remotePontoon.getTeamPageUrl() });
    }
    browser.notifications.clear(notificationId);
  }

  private _watchStorageChanges(): void {
    this._remotePontoon.subscribeToNotificationsChange((change) => {
      const notificationsData = change.newValue;
      Promise.all([
        this._getNewUnreadNotifications(notificationsData),
        this._options
          .get('show_notifications')
          .then((option: any) => option['show_notifications']),
      ]).then(([newUnreadNotificationIds, showNotifications]) => {
        if (showNotifications && newUnreadNotificationIds.length > 0) {
          this._notifyAboutUnreadNotifications(
            newUnreadNotificationIds,
            notificationsData
          );
        }
      });
    });
  }

  private async _getNewUnreadNotifications(
    notificationsData: any
  ): Promise<number[]> {
    let unreadNotificationIds = [0];
    if (notificationsData !== undefined) {
      unreadNotificationIds = Object.values(notificationsData)
        .filter((notification: any) => notification.unread)
        .map((notification: any) => notification.id);
    }
    const dataKey = 'lastUnreadNotificationId';
    const lastKnownUnreadNotificationId = await browser.storage.local
      .get(dataKey)
      .then((item) => {
        return item[dataKey] || 0;
      });
    return unreadNotificationIds.filter(
      (id) => id > lastKnownUnreadNotificationId
    );
  }

  private _notifyAboutUnreadNotifications(
    unreadNotificationIds: number[],
    notificationsData: any
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
