/* global browser */
import React from 'react';
import { shallow } from 'enzyme';
import flushPromises from 'flush-promises';
import { NotificationsList } from '.';
import { NotificationsListItem } from '../NotificationsListItem';
import { NotificationsListError } from '../NotificationsListError';
import { BottomLink } from '../BottomLink';
import { BackgroundPontoonClient } from '@pontoon-addon/commons/src/BackgroundPontoonClient';
import { BackgroundPontoonMessageType } from '@pontoon-addon/commons/src/BackgroundPontoonMessageType';

const windowCloseSpy = jest.spyOn(window, 'close');

afterEach(() => {
  windowCloseSpy.mockReset();
});

describe('<NotificationsList>', () => {

  afterEach(() => {
    browser.flush();
  });

  it('renders', () => {
    const wrapper = shallow(
      <NotificationsList
        notificationsData={{
          1: {id: 1, unread: false},
        }}
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
          13: {id: 13, unread: false},
          42: {id: 42, unread: false},
          1: {id: 1, unread: false},
        }}
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
          1: {id: 1, unread: false},
          2: {id: 2, unread: true},
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
          1: {id: 1, unread: false},
          2: {id: 2, unread: true},
        }}
        backgroundPontoonClient={new BackgroundPontoonClient()}
      />
    );

    expect(wrapper.find(BottomLink).hasClass('NotificationsList-mark-all-as-read')).toBe(true);
    wrapper.find(BottomLink).simulate('click');
    expect(
      browser.runtime.sendMessage.withArgs({type: BackgroundPontoonMessageType.TO_BACKGROUND.NOTIFICATIONS_READ}).calledOnce
    ).toBe(true);
  });

  it('bottom link shows all when all notifications are read', async () => {
    browser.runtime.sendMessage.withArgs({type: BackgroundPontoonMessageType.TO_BACKGROUND.GET_TEAM_PAGE_URL})
      .resolves('https://127.0.0.1/');
    browser.tabs.create.resolves(undefined);

    const wrapper = shallow(
      <NotificationsList
        notificationsData={{
          1: {id: 1, unread: false},
          2: {id: 2, unread: false},
        }}
        backgroundPontoonClient={new BackgroundPontoonClient()}
      />
    );

    expect(wrapper.find(BottomLink).hasClass('NotificationsList-see-all')).toBe(true);
    wrapper.find(BottomLink).simulate('click');
    await flushPromises();
    expect(browser.tabs.create.withArgs({url: 'https://127.0.0.1/'}).calledOnce).toBe(true);
  });

});
