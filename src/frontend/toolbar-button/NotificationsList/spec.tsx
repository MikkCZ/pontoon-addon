import type { Tabs } from 'webextension-polyfill';
import React from 'react';
import { mount, shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';
import flushPromises from 'flush-promises';

import * as UtilsApiModule from '@commons/utils';
import {
  getNotificationsUrl,
  markAllNotificationsAsRead,
} from '@background/backgroundClient';

import { BottomLink } from '../BottomLink';
import { NotificationsListItem } from '../NotificationsListItem';
import { NotificationsListError } from '../NotificationsListError';

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
    const wrapper = shallow(
      <NotificationsList
        notificationsData={{
          1: { id: 1, unread: false },
        }}
        hideReadNotifications={false}
        pontoonBaseUrl="https://127.0.0.1"
      />,
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
        pontoonBaseUrl="https://127.0.0.1"
      />,
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
        pontoonBaseUrl="https://127.0.0.1"
      />,
    );

    expect(wrapper.find(NotificationsListItem)).toHaveLength(1);
    expect(wrapper.find(NotificationsListItem).first().key()).toBe('2');
  });

  it('renders error when loading notification data fails', () => {
    const wrapper = shallow(
      <NotificationsList
        notificationsData={undefined}
        hideReadNotifications={false}
        pontoonBaseUrl="https://127.0.0.1"
      />,
    );

    expect(wrapper.find(NotificationsListItem)).toHaveLength(0);
    expect(wrapper.find(BottomLink)).toHaveLength(0);
    expect(wrapper.find(NotificationsListError)).toHaveLength(1);
  });

  it('bottom link marks all as read when unread notifications are present', () => {
    const wrapper = mount(
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
      wrapper.find(BottomLink).find('button').simulate('click');
    });

    expect(markAllNotificationsAsRead).toHaveBeenCalled();
  });

  it('bottom link shows all when all notifications are read', async () => {
    const wrapper = mount(
      <NotificationsList
        notificationsData={{
          1: { id: 1, unread: false },
          2: { id: 2, unread: false },
        }}
        hideReadNotifications={false}
        pontoonBaseUrl="https://127.0.0.1"
      />,
    );

    act(() => {
      wrapper.find(BottomLink).find('button').simulate('click');
    });
    await flushPromises();

    expect(openNewPontoonTabSpy).toHaveBeenCalledWith(
      'https://127.0.0.1/notifications',
    );
    expect(windowCloseSpy).toHaveBeenCalled();
  });
});
