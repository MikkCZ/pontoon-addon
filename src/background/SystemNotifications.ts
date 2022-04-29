import { Options } from '@commons/Options';
import { browser } from '@commons/webExtensionsApi';
import {
  pontoonTeam,
  toPontoonTeamSpecificProjectUrl,
} from '@commons/webLinks';
import pontoonLogo from '@assets/img/pontoon-logo.svg';

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
      this.notificationClick(notificationId),
    );
  }

  private async notificationClick(notificationId: string): Promise<void> {
    const dataKey = 'notificationsData';
    const item = await browser.storage.local.get(dataKey);
    const notificationsData = item[dataKey];
    const notification = notificationsData[notificationId];
    if (notification && !notification.target) {
      browser.tabs.create({
        url: toPontoonTeamSpecificProjectUrl(
          this.remotePontoon.getBaseUrl(),
          this.remotePontoon.getTeam(),
          notification.actor.url,
        ),
      });
    } else {
      browser.tabs.create({
        url: pontoonTeam(
          this.remotePontoon.getBaseUrl(),
          this.remotePontoon.getTeam(),
        ),
      });
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
            notificationsData,
          );
        }
      });
    });
  }

  private async getNewUnreadNotifications(
    notificationsData: NotificationsData | undefined,
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
      (id) => id > lastKnownUnreadNotificationId,
    );
  }

  private notifyAboutUnreadNotifications(
    unreadNotificationIds: number[],
    notificationsData: NotificationsData,
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
        if (notification.verb === 'has reviewed suggestions') {
          if (
            notification.description?.content?.startsWith(
              'Your suggestions have been reviewed',
            )
          ) {
            item.title = 'Your suggestions have been reviewed';
          } else {
            item.title = 'Suggestions reviewed';
          }
        }
        return item;
      });
    const lastNotificationId = unreadNotificationIds.sort().reverse()[0];
    if (notificationItems.length === 1) {
      browser.notifications.create(`${lastNotificationId}`, {
        type: 'basic',
        iconUrl: pontoonLogo,
        title: notificationItems[0].title,
        message: notificationItems[0].message,
      });
    } else {
      browser.notifications.create({
        type: 'list',
        iconUrl: pontoonLogo,
        title: 'You have new unread notifications',
        message: `There are ${notificationItems.length} new unread notifications in Pontoon for you.`,
        items: notificationItems,
      });
    }
    browser.storage.local.set({ lastUnreadNotificationId: lastNotificationId });
  }
}
