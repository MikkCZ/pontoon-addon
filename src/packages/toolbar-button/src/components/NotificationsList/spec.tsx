/* global browser */
import React from 'react';
import { shallow } from 'enzyme';
import flushPromises from 'flush-promises';
import { act } from 'react-dom/test-utils';

import { BackgroundPontoonClient } from '@pontoon-addon/commons/src/BackgroundPontoonClient';
import { BackgroundPontoonMessageType } from '@pontoon-addon/commons/src/BackgroundPontoonMessageType';

import { mockBrowser, mockBrowserNode } from '../../test/mockWebExtensionsApi';

import { NotificationsListItem } from '../NotificationsListItem';
import { NotificationsListError } from '../NotificationsListError';
import { BottomLink } from '../BottomLink';
import { NotificationsList } from '.';

const windowCloseSpy = jest.spyOn(window, 'close');

afterEach(() => {
  windowCloseSpy.mockReset();
});

beforeEach(() => {
  mockBrowserNode.enable();
});

afterEach(() => {
  mockBrowserNode.disable();
});

describe('NotificationsList', () => {
  it('renders list of items', () => {
    const wrapper = shallow(
      <NotificationsList
        notificationsData={{
          1: { id: 1, unread: false },
        }}
        hideReadNotifications={false}
        backgroundPontoonClient={new BackgroundPontoonClient()}
      />
    );

    expect(wrapper.find(NotificationsListItem).length).toBe(1);
    expect(wrapper.find(BottomLink).length).toBe(1);
    expect(wrapper.find(NotificationsListError).length).toBe(0);
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
        backgroundPontoonClient={new BackgroundPontoonClient()}
      />
    );

    expect(wrapper.find(NotificationsListItem).length).toBe(3);
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
        backgroundPontoonClient={new BackgroundPontoonClient()}
      />
    );

    expect(wrapper.find(NotificationsListItem).length).toBe(1);
    expect(wrapper.find(NotificationsListItem).first().key()).toBe('2');
  });

  it('renders error when loading notification data fails', () => {
    const wrapper = shallow(
      <NotificationsList
        notificationsData={undefined}
        hideReadNotifications={false}
        backgroundPontoonClient={new BackgroundPontoonClient()}
      />
    );

    expect(wrapper.find(NotificationsListItem).length).toBe(0);
    expect(wrapper.find(BottomLink).length).toBe(0);
    expect(wrapper.find(NotificationsListError).length).toBe(1);
  });

  it('bottom link marks all as read when unread notifications are present', () => {
    const wrapper = shallow(
      <NotificationsList
        notificationsData={{
          1: { id: 1, unread: false },
          2: { id: 2, unread: true },
        }}
        hideReadNotifications={false}
        backgroundPontoonClient={new BackgroundPontoonClient()}
      />
    );

    expect(
      wrapper.find(BottomLink).hasClass('NotificationsList-mark-all-as-read')
    ).toBe(true);

    mockBrowser.runtime.sendMessage
      .expect({
        type: BackgroundPontoonMessageType.TO_BACKGROUND.NOTIFICATIONS_READ,
      })
      .andResolve({} as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    act(() => {
      wrapper.find(BottomLink).simulate('click');
    });

    mockBrowserNode.verify();
  });

  it('bottom link shows all when all notifications are read', async () => {
    const wrapper = shallow(
      <NotificationsList
        notificationsData={{
          1: { id: 1, unread: false },
          2: { id: 2, unread: false },
        }}
        hideReadNotifications={false}
        backgroundPontoonClient={new BackgroundPontoonClient()}
      />
    );

    expect(wrapper.find(BottomLink).hasClass('NotificationsList-see-all')).toBe(
      true
    );

    mockBrowser.runtime.sendMessage
      .expect({
        type: BackgroundPontoonMessageType.TO_BACKGROUND.GET_TEAM_PAGE_URL,
      })
      .andResolve('https://127.0.0.1/' as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    mockBrowser.tabs.create.expect(expect.anything()).andResolve({} as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    act(() => {
      wrapper.find(BottomLink).simulate('click');
    });

    mockBrowserNode.verify();
  });
});
