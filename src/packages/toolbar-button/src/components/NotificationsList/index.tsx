import React, { useState } from 'react';
import type { BackgroundPontoonClient } from '@pontoon-addon/commons/src/BackgroundPontoonClient';

import { browser } from '../../util/webExtensionsApi';
import { NotificationsListItem } from '../NotificationsListItem';
import { BottomLink } from '../BottomLink';
import { NotificationsListError } from '../NotificationsListError';
import './index.css';

interface Props {
  notificationsData: any;
  hideReadNotifications: boolean;
  backgroundPontoonClient: BackgroundPontoonClient;
}

export const NotificationsList: React.FC<Props> = ({
  hideReadNotifications,
  backgroundPontoonClient,
  ...props
}) => {
  const [notificationsData, setNotificationsData] = useState(
    props.notificationsData
  );
  backgroundPontoonClient.subscribeToNotificationsChange((change: any) => {
    setNotificationsData(change.newValue);
  });

  if (notificationsData) {
    const containsUnreadNotifications = Object.values(notificationsData).some(
      (notification: any) => notification.unread
    );
    return (
      <section className="NotificationsList">
        <ul className="NotificationsList-list">
          {Object.values(notificationsData)
            .sort((a: any, b: any) => a.id - b.id)
            .reverse()
            .filter(
              (notification: any) =>
                notification.unread || !hideReadNotifications
            )
            .map((notification: any) => (
              <NotificationsListItem
                unread={notification.unread}
                key={notification.id}
                backgroundPontoonClient={backgroundPontoonClient}
                {...notification}
              />
            ))}
        </ul>
        {containsUnreadNotifications ? (
          <BottomLink
            className="NotificationsList-mark-all-as-read"
            text="Mark all Notifications as read"
            onClick={() => backgroundPontoonClient.markAllNotificationsAsRead()}
          />
        ) : (
          <BottomLink
            className="NotificationsList-see-all"
            text="See all Notifications"
            onClick={async () => {
              const notificationsUrl =
                await backgroundPontoonClient.getNotificationsUrl();
              await browser.tabs.create({ url: notificationsUrl });
              window.close();
            }}
          />
        )}
      </section>
    );
  } else {
    return (
      <NotificationsListError
        backgroundPontoonClient={backgroundPontoonClient}
      />
    );
  }
};
