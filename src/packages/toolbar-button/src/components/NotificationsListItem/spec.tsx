import React from 'react';
import { render, mount, shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';
import ReactTimeAgo from 'react-time-ago';

import { BackgroundPontoonClient } from '@pontoon-addon/commons/src/BackgroundPontoonClient';
import { BackgroundPontoonMessageType } from '@pontoon-addon/commons/src/BackgroundPontoonMessageType';

import { mockBrowser, mockBrowserNode } from '../../test/mockWebExtensionsApi';

import { NotificationsListItem } from '.';

beforeEach(() => {
  mockBrowserNode.enable();
});

afterEach(() => {
  mockBrowserNode.disable();
});

describe('NotificationsListItem', () => {
  it('renders', () => {
    const wrapper = mount(
      <NotificationsListItem
        unread={true}
        actor={{ anchor: 'ACTOR', url: '' }}
        verb="VERB"
        target={{ anchor: 'TARGET', url: '' }}
        date_iso="1970-01-01T00:00:00Z"
        description={{ safe: true, content: 'DESCRIPTION' }}
        backgroundPontoonClient={new BackgroundPontoonClient()}
      />
    );

    expect(wrapper.find('.NotificationsListItem').hasClass('unread')).toBe(
      true
    );
    expect(wrapper.find('.NotificationsListItem').hasClass('read')).toBe(false);
    expect(wrapper.find('.link').length).toBe(2);
    expect(wrapper.find('.link').first().text()).toBe('ACTOR');
    expect(wrapper.find('.link').last().text()).toBe('TARGET');
    expect(wrapper.find('span').text()).toBe(' VERB ');
    expect(
      wrapper.find('.NotificationsListItem-timeago').find(ReactTimeAgo).length
    ).toBe(1);
    expect(wrapper.find('.NotificationsListItem-description').text()).toBe(
      'DESCRIPTION'
    );
  });

  it('renders links and formatting tags in description', () => {
    const wrapper = render(
      <NotificationsListItem
        unread={true}
        actor={{ anchor: 'ACTOR', url: '' }}
        verb="VERB"
        target={{ anchor: 'TARGET', url: '' }}
        date_iso="1970-01-01T00:00:00Z"
        description={{
          safe: true,
          content:
            'DESCRIPTION <em>WITH A</em> <a href="https://example.com/">LINK</a>',
        }}
        backgroundPontoonClient={new BackgroundPontoonClient()}
      />
    );

    expect(wrapper.find('.NotificationsListItem-description').html()).toBe(
      'DESCRIPTION <em>WITH A</em> <a href="https://example.com/">LINK</a>'
    );
  });

  it('linkifies URL in unsafe description', () => {
    const wrapper = render(
      <NotificationsListItem
        unread={true}
        actor={{ anchor: 'ACTOR', url: '' }}
        verb="VERB"
        target={{ anchor: 'TARGET', url: '' }}
        date_iso="1970-01-01T00:00:00Z"
        description={{
          safe: false,
          content: 'DESCRIPTION WITH A LINK TO https://example.com/',
        }}
        backgroundPontoonClient={new BackgroundPontoonClient()}
      />
    );

    expect(wrapper.find('.NotificationsListItem-description').html()).toBe(
      '<span class="Linkify">DESCRIPTION WITH A LINK TO <a href="https://example.com/" class="link" target="_blank" rel="noopener noreferrer">https://example.com/</a></span>'
    );
  });

  it('prevents XSS in description', () => {
    const wrapper = render(
      <NotificationsListItem
        unread={true}
        actor={{ anchor: 'ACTOR', url: '' }}
        verb="VERB"
        target={{ anchor: 'TARGET', url: '' }}
        date_iso="1970-01-01T00:00:00Z"
        description={{
          safe: true,
          content:
            'DESCRIPTION WITH(OUT) <a onload=alert("XSS")>XSS ATTEMPTS</a> <script>alert("XSS");</script>',
        }}
        backgroundPontoonClient={new BackgroundPontoonClient()}
      />
    );

    expect(wrapper.find('.NotificationsListItem-description').html()).toBe(
      'DESCRIPTION WITH(OUT) <a>XSS ATTEMPTS</a> '
    );
  });

  it('renders read notification', () => {
    const wrapper = shallow(
      <NotificationsListItem
        unread={false}
        backgroundPontoonClient={new BackgroundPontoonClient()}
      />
    );

    expect(wrapper.find('.NotificationsListItem').hasClass('unread')).toBe(
      false
    );
    expect(wrapper.find('.NotificationsListItem').hasClass('read')).toBe(true);
  });

  it('actor and target links work', async () => {
    const actorUrl = 'https://127.0.0.1/actor/';
    const targetUrl = 'https://127.0.0.1/target/';
    mockBrowser.runtime.sendMessage
      .expect({
        type: BackgroundPontoonMessageType.TO_BACKGROUND.GET_TEAM_PROJECT_URL,
        args: [actorUrl],
      })
      .andResolve(actorUrl as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    mockBrowser.runtime.sendMessage
      .expect({
        type: BackgroundPontoonMessageType.TO_BACKGROUND.GET_TEAM_PROJECT_URL,
        args: [targetUrl],
      })
      .andResolve(targetUrl as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    mockBrowser.tabs.create.expect(expect.anything()).andResolve({} as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    const wrapper = shallow(
      <NotificationsListItem
        unread={true}
        actor={{ url: actorUrl, anchor: 'ACTOR' }}
        target={{ url: targetUrl, anchor: 'TARGET' }}
        backgroundPontoonClient={new BackgroundPontoonClient()}
      />
    );

    expect(wrapper.find('.NotificationsListItem').hasClass('pointer')).toBe(
      false
    );
    expect(wrapper.find('.link').length).toBe(2);

    act(() => {
      wrapper.find('.link').first().simulate('click', {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      });
    });
    act(() => {
      wrapper.find('.link').last().simulate('click', {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      });
    });

    mockBrowserNode.verify();
  });

  it('whole item is clickable when only one link is present', async () => {
    const actorUrl = 'https://127.0.0.1/actor/';
    mockBrowser.runtime.sendMessage
      .expect({
        type: BackgroundPontoonMessageType.TO_BACKGROUND.GET_TEAM_PROJECT_URL,
        args: [actorUrl],
      })
      .andResolve(actorUrl as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    mockBrowser.tabs.create.expect(expect.anything()).andResolve({} as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    const wrapper = shallow(
      <NotificationsListItem
        unread={true}
        actor={{ url: actorUrl, anchor: 'ACTOR' }}
        backgroundPontoonClient={new BackgroundPontoonClient()}
      />
    );

    expect(wrapper.find('.NotificationsListItem').hasClass('pointer')).toBe(
      true
    );

    act(() => {
      wrapper.find('.NotificationsListItem').simulate('click', {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      });
    });

    mockBrowserNode.verify();
  });
});
