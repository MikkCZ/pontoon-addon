import React, { useState } from 'react';
import styled from 'styled-components';

import {
  getNotificationsUrl,
  markAllNotificationsAsRead,
} from '@background/backgroundClient';
import { listenToStorageChange, openNewTab } from '@commons/webExtensionsApi';

import { BottomLink } from '../BottomLink';
import { NotificationsListItem } from '../NotificationsListItem';
import { NotificationsListError } from '../NotificationsListError';

const List = styled.ul`
  list-style: none;
  text-align: center;
  max-height: 280px;
  overflow: auto;
  margin: 0;
  padding: 0;
`;

interface Props {
  notificationsData: any;
  hideReadNotifications?: boolean;
}

export const NotificationsList: React.FC<Props> = ({
  hideReadNotifications,
  ...props
}) => {
  const [notificationsData, setNotificationsData] = useState(
    props.notificationsData,
  );
  listenToStorageChange(
    'notificationsData',
    ({ newValue: notificationsData }) => {
      setNotificationsData(notificationsData);
    },
  );

  if (notificationsData) {
    const containsUnreadNotifications = Object.values(notificationsData).some(
      (notification: any) => notification.unread,
    );
    return (
      <section>
        <List>
          {Object.values(notificationsData)
            .sort((a: any, b: any) => a.id - b.id)
            .reverse()
            .filter(
              (notification: any) =>
                notification.unread || !hideReadNotifications,
            )
            .map((notification: any) => (
              <NotificationsListItem
                unread={notification.unread}
                key={notification.id}
                {...notification}
              />
            ))}
        </List>
        {containsUnreadNotifications ? (
          <BottomLink
            text="Mark all Notifications as read"
            onClick={() => markAllNotificationsAsRead()}
          />
        ) : (
          <BottomLink
            text="See all Notifications"
            onClick={async () => {
              await openNewTab(await getNotificationsUrl());
              window.close();
            }}
          />
        )}
      </section>
    );
  } else {
    return <NotificationsListError />;
  }
};
