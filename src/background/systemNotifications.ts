import type { StorageContent } from '@commons/webExtensionsApi';
import {
  getOneFromStorage,
  saveToStorage,
  createNotification,
  closeNotification,
  listenToStorageChange,
} from '@commons/webExtensionsApi';
import {
  pontoonTeam,
  toPontoonTeamSpecificProjectUrl,
} from '@commons/webLinks';
import pontoonLogo from '@assets/img/pontoon-logo.svg';
import { getOneOption, getOptions } from '@commons/options';
import { openNewPontoonTab } from '@commons/utils';

export function setupSystemNotifications() {
  listenToStorageChange(
    'notificationsData',
    async ({ newValue: notificationsData }) => {
      const [showNotifications, newUnreadNotifications] = await Promise.all([
        getOneOption('show_notifications'),
        notificationsData ? getNewUnreadNotifications(notificationsData) : [],
      ]);
      if (showNotifications && newUnreadNotifications.length > 0) {
        notifyAboutUnreadNotifications(newUnreadNotifications);
      }
    },
  );
}

async function getNewUnreadNotifications(
  notificationsData: StorageContent['notificationsData'],
): Promise<Array<StorageContent['notificationsData'][number]>> {
  const lastKnownUnreadNotificationId =
    (await getOneFromStorage('lastUnreadNotificationId')) ??
    Number.NEGATIVE_INFINITY;
  return Object.values(notificationsData)
    .filter((notification) => notification.unread)
    .filter((notification) => notification.id > lastKnownUnreadNotificationId);
}

async function notifyAboutUnreadNotifications(
  newUnreadNotifications: Array<StorageContent['notificationsData'][number]>,
) {
  const notificationItems = newUnreadNotifications
    .sort((a, b) => (a.id > b.id ? 1 : -1))
    .map((notification) => {
      const item = {
        notification,
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
  for (const notificationItem of notificationItems) {
    await createNotification(
      {
        type: 'basic',
        iconUrl: pontoonLogo,
        title: notificationItem.title,
        message: notificationItem.message,
      },
      (notificationId) => {
        handleNotificationClick(notificationId, notificationItem.notification);
      },
    );
  }
  const lastUnreadNotificationId = Math.max(
    ...newUnreadNotifications.map((notification) => notification.id),
  );
  await saveToStorage({ lastUnreadNotificationId });
}

async function handleNotificationClick(
  id: string,
  notification: StorageContent['notificationsData'][number],
) {
  const isSuggestion =
    notification.description?.content?.startsWith(
      'Unreviewed suggestions have been submitted',
    ) || notification.verb === 'has reviewed suggestions';

  const { pontoon_base_url: pontoonBaseUrl, locale_team: teamCode } =
    await getOptions(['pontoon_base_url', 'locale_team']);

  if (isSuggestion || notification.target) {
    openNewPontoonTab(pontoonTeam(pontoonBaseUrl, { code: teamCode }));
  } else {
    openNewPontoonTab(
      toPontoonTeamSpecificProjectUrl(
        pontoonBaseUrl,
        { code: teamCode },
        notification.actor!.url,
      ),
    );
  }
  closeNotification(id);
}
