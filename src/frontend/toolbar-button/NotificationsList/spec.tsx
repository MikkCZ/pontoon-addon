import type { Tabs } from 'webextension-polyfill';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import flushPromises from 'flush-promises';

import * as UtilsApiModule from '@commons/utils';
import {
  getNotificationsUrl,
  markAllNotificationsAsRead,
} from '@background/backgroundClient';

import { NotificationsList } from '.';

jest.mock('@commons/webExtensionsApi/browser');
jest.mock('@commons/options');
jest.mock('@background/backgroundClient');

const windowCloseSpy = jest.spyOn(window, 'close').mockReturnValue(undefined);
const openNewPontoonTabSpy = jest
  .spyOn(UtilsApiModule, 'openNewPontoonTab')
  .mockResolvedValue({} as Tabs.Tab);

(getNotificationsUrl as jest.Mock).mockReturnValue(
  'https://127.0.0.1/notifications',
);

afterEach(() => {
  jest.clearAllMocks();
});

describe('NotificationsList', () => {
  it('renders list of items', () => {
    render(
      <NotificationsList
        notificationsData={{
          1: { id: 1, unread: false },
        }}
        hideReadNotifications={false}
        pontoonBaseUrl="https://127.0.0.1"
      />,
    );

    expect(screen.getByRole('listitem')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveTextContent('See all Notifications');
    expect(
      screen.queryByTestId('notifications-list-error'),
    ).not.toBeInTheDocument();
  });

  it('sorts notifications by id', () => {
    render(
      <NotificationsList
        notificationsData={{
          13: { id: 13, unread: false, verb: '13' },
          42: { id: 42, unread: false, verb: '42' },
          1: { id: 1, unread: false, verb: '1' },
        }}
        hideReadNotifications={false}
        pontoonBaseUrl="https://127.0.0.1"
      />,
    );

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('42');
    expect(items[1]).toHaveTextContent('13');
    expect(items[2]).toHaveTextContent('1');
  });

  it('renders read notifications only if set to', () => {
    render(
      <NotificationsList
        notificationsData={{
          1: { id: 1, unread: false, verb: 'read' },
          2: { id: 2, unread: true, verb: 'unread' },
        }}
        hideReadNotifications={true}
        pontoonBaseUrl="https://127.0.0.1"
      />,
    );

    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByRole('listitem')).toHaveTextContent('read');
  });

  it('renders error when loading notification data fails', () => {
    render(
      <NotificationsList
        notificationsData={undefined}
        hideReadNotifications={false}
        pontoonBaseUrl="https://127.0.0.1"
      />,
    );

    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    expect(screen.queryByText('See all Notifications')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Mark all Notifications as read'),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('notifications-list-error')).toBeInTheDocument();
  });

  it('bottom link marks all as read when unread notifications are present', () => {
    render(
      <NotificationsList
        notificationsData={{
          1: { id: 1, unread: false },
          2: { id: 2, unread: true },
        }}
        hideReadNotifications={false}
        pontoonBaseUrl="https://127.0.0.1"
      />,
    );

    act(() => {
      screen.getByText('Mark all Notifications as read').click();
    });

    expect(markAllNotificationsAsRead).toHaveBeenCalled();
  });

  it('bottom link shows all when all notifications are read', async () => {
    render(
      <NotificationsList
        notificationsData={{
          1: { id: 1, unread: false },
          2: { id: 2, unread: false },
        }}
        hideReadNotifications={false}
        pontoonBaseUrl="https://127.0.0.1"
      />,
    );

    await act(async () => {
      screen.getByText('See all Notifications').click();
      await flushPromises();
    });

    expect(openNewPontoonTabSpy).toHaveBeenCalledWith(
      'https://127.0.0.1/notifications',
    );
    expect(windowCloseSpy).toHaveBeenCalled();
  });
});
