import {
  browser,
  openNewTab,
  getOneFromStorage,
  saveToStorage,
  createNotification,
  closeNotification,
} from '@commons/webExtensionsApi';
import {
  pontoonTeam,
  toPontoonTeamSpecificProjectUrl,
} from '@commons/webLinks';
import pontoonLogo from '@assets/img/pontoon-logo.svg';
import { getOneOption } from '@commons/options';

import { NotificationsData, RemotePontoon } from './RemotePontoon';

export class SystemNotifications {
  private readonly remotePontoon: RemotePontoon;

  constructor(remotePontoon: RemotePontoon) {
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
    const notificationsData = await getOneFromStorage('notificationsData');
    const notification = notificationsData![parseInt(notificationId, 10)];

    const isSuggestion =
      notification?.description?.content?.startsWith(
        'Unreviewed suggestions have been submitted',
      ) || notification?.verb === 'has reviewed suggestions';

    if (isSuggestion || notification.target || !notification) {
      openNewTab(
        pontoonTeam(
          this.remotePontoon.getBaseUrl(),
          this.remotePontoon.getTeam(),
        ),
      );
    } else {
      openNewTab(
        toPontoonTeamSpecificProjectUrl(
          this.remotePontoon.getBaseUrl(),
          this.remotePontoon.getTeam(),
          notification.actor!.url,
        ),
      );
    }
    closeNotification(notificationId);
  }

  private watchStorageChanges(): void {
    this.remotePontoon.subscribeToNotificationsChange(async (change) => {
      const notificationsData = change.newValue;
      const [newUnreadNotificationIds, showNotifications] = await Promise.all([
        this.getNewUnreadNotifications(notificationsData),
        getOneOption('show_notifications'),
      ]);
      if (showNotifications && newUnreadNotificationIds.length > 0) {
        this.notifyAboutUnreadNotifications(
          newUnreadNotificationIds,
          notificationsData,
        );
      }
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
    const lastKnownUnreadNotificationId =
      (await getOneFromStorage('lastUnreadNotificationId')) ?? 0;
    return unreadNotificationIds.filter(
      (id) => id > lastKnownUnreadNotificationId,
    );
  }

  private async notifyAboutUnreadNotifications(
    unreadNotificationIds: number[],
    notificationsData: NotificationsData,
  ): Promise<void> {
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
        if (
          notification.description?.content?.startsWith(
            'Unreviewed suggestions have been submitted',
          )
        ) {
          item.title = 'Unreviewed suggestions have been submitted';
        }
        return item;
      });
    const lastUnreadNotificationId = unreadNotificationIds.sort().reverse()[0];
    if (notificationItems.length === 1) {
      await createNotification(
        {
          type: 'basic',
          iconUrl: pontoonLogo,
          title: notificationItems[0].title,
          message: notificationItems[0].message,
        },
        `${lastUnreadNotificationId}`,
      );
    } else {
      await createNotification({
        type: 'list',
        iconUrl: pontoonLogo,
        title: 'You have new unread notifications',
        message: `There are ${notificationItems.length} new unread notifications in Pontoon for you.`,
        items: notificationItems,
      });
    }
    await saveToStorage({ lastUnreadNotificationId });
  }
}
