import React from 'react';
import { shallow } from 'enzyme';
import flushPromises from 'flush-promises';
import { act } from 'react-dom/test-utils';
import type { BackgroundPontoonClient } from '@pontoon-addon/commons/src/BackgroundPontoonClient';

import { mockBrowser, mockBrowserNode } from '../../test/mockWebExtensionsApi';
import { NotificationsListItem } from '../NotificationsListItem';
import { NotificationsListError } from '../NotificationsListError';
import { BottomLink } from '../BottomLink';

import { NotificationsList } from '.';

const windowCloseSpy = jest.spyOn(window, 'close');

afterEach(() => {
  windowCloseSpy.mockReset();
});

const backgroundPontoonClientMock = {
  getNotificationsUrl: async () => 'https://127.0.0.1/notifications',
  markAllNotificationsAsRead: jest.fn(),
  subscribeToNotificationsChange: jest.fn(),
} as unknown as BackgroundPontoonClient;

beforeEach(() => {
  mockBrowserNode.enable();
});

afterEach(() => {
  mockBrowserNode.disable();
  (
    backgroundPontoonClientMock.markAllNotificationsAsRead as jest.Mock
  ).mockReset();
});

describe('NotificationsList', () => {
  it('renders list of items', () => {
    const wrapper = shallow(
      <NotificationsList
        notificationsData={{
          1: { id: 1, unread: false },
        }}
        hideReadNotifications={false}
        backgroundPontoonClient={backgroundPontoonClientMock}
      />
    );

    expect(wrapper.find(NotificationsListItem)).toHaveLength(1);
    expect(wrapper.find(BottomLink)).toHaveLength(1);
    expect(wrapper.find(NotificationsListError)).toHaveLength(0);
  });

  it('sorts notifications by id', () => {
    const wrapper = shallow(
      <NotificationsList
        notificationsData={{
          13: { id: 13, unread: false },
          42: { id: 42, unread: false },
          1: { id: 1, unread: false },
        }}
        hideReadNotifications={false}
        backgroundPontoonClient={backgroundPontoonClientMock}
      />
    );

    expect(wrapper.find(NotificationsListItem)).toHaveLength(3);
    expect(wrapper.find(NotificationsListItem).at(0).key()).toBe('42');
    expect(wrapper.find(NotificationsListItem).at(1).key()).toBe('13');
    expect(wrapper.find(NotificationsListItem).at(2).key()).toBe('1');
  });

  it('hides read notifications if set to', () => {
    const wrapper = shallow(
      <NotificationsList
        notificationsData={{
          1: { id: 1, unread: false },
          2: { id: 2, unread: true },
        }}
        hideReadNotifications={true}
        backgroundPontoonClient={backgroundPontoonClientMock}
      />
    );

    expect(wrapper.find(NotificationsListItem)).toHaveLength(1);
    expect(wrapper.find(NotificationsListItem).first().key()).toBe('2');
  });

  it('renders error when loading notification data fails', () => {
    const wrapper = shallow(
      <NotificationsList
        notificationsData={undefined}
        hideReadNotifications={false}
        backgroundPontoonClient={backgroundPontoonClientMock}
      />
    );

    expect(wrapper.find(NotificationsListItem)).toHaveLength(0);
    expect(wrapper.find(BottomLink)).toHaveLength(0);
    expect(wrapper.find(NotificationsListError)).toHaveLength(1);
  });

  it('bottom link marks all as read when unread notifications are present', () => {
    const wrapper = shallow(
      <NotificationsList
        notificationsData={{
          1: { id: 1, unread: false },
          2: { id: 2, unread: true },
        }}
        hideReadNotifications={false}
        backgroundPontoonClient={backgroundPontoonClientMock}
      />
    );

    expect(
      wrapper.find(BottomLink).hasClass('NotificationsList-mark-all-as-read')
    ).toBe(true);

    act(() => {
      wrapper.find(BottomLink).simulate('click');
    });

    expect(
      backgroundPontoonClientMock.markAllNotificationsAsRead
    ).toHaveBeenCalled();
  });

  it('bottom link shows all when all notifications are read', async () => {
    const wrapper = shallow(
      <NotificationsList
        notificationsData={{
          1: { id: 1, unread: false },
          2: { id: 2, unread: false },
        }}
        hideReadNotifications={false}
        backgroundPontoonClient={backgroundPontoonClientMock}
      />
    );

    expect(wrapper.find(BottomLink).hasClass('NotificationsList-see-all')).toBe(
      true
    );

    mockBrowser.tabs.create
      .expect({ url: 'https://127.0.0.1/notifications' })
      .andResolve({} as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    act(() => {
      wrapper.find(BottomLink).simulate('click');
    });
    await flushPromises();

    mockBrowserNode.verify();
  });
});
