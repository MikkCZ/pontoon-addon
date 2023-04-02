import React from 'react';
import styled from 'styled-components';

import type { StorageContent } from '@commons/webExtensionsApi';
import {
  getNotificationsUrl,
  markAllNotificationsAsRead,
} from '@background/backgroundClient';
import { openNewPontoonTab } from '@commons/utils';

import { BottomLink } from '../BottomLink';
import { NotificationsListItem } from '../NotificationsListItem';
import { NotificationsListError } from '../NotificationsListError';

const List = styled.ul`
  list-style: none;
  text-align: center;
  max-height: 250px;
  overflow: auto;
  margin: 0;
  padding: 0;
  border-bottom: 1px solid #525a65;
`;

interface Props {
  notificationsData?: StorageContent['notificationsData'];
  hideReadNotifications: boolean;
  pontoonBaseUrl: string;
}

export const NotificationsList: React.FC<Props> = ({
  notificationsData,
  hideReadNotifications,
  pontoonBaseUrl,
}) => {
  if (notificationsData) {
    const containsUnreadNotifications = Object.values(notificationsData).some(
      (notification) => notification.unread,
    );
    return (
      <section>
        <List>
          {Object.values(notificationsData)
            .sort((a, b) => a.id - b.id)
            .reverse()
            .filter(
              (notification) => notification.unread || !hideReadNotifications,
            )
            .map((notification) => (
              <NotificationsListItem
                key={notification.id}
                pontoonBaseUrl={pontoonBaseUrl}
                {...notification}
              />
            ))}
        </List>
        {containsUnreadNotifications ? (
          <BottomLink onClick={() => markAllNotificationsAsRead()}>
            Mark all Notifications as read
          </BottomLink>
        ) : (
          <BottomLink
            onClick={async () => {
              await openNewPontoonTab(await getNotificationsUrl());
              window.close();
            }}
          >
            See all Notifications
          </BottomLink>
        )}
      </section>
    );
  } else {
    return <NotificationsListError />;
  }
};
