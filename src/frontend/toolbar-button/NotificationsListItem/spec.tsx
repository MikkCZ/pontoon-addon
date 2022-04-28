import React from 'react';
import { mount, shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';
import ReactTimeAgo from 'react-time-ago';
import flushPromises from 'flush-promises';

import type { BackgroundPontoonClient } from '@background/BackgroundPontoonClient';
import {
  mockBrowser,
  mockBrowserNode,
} from '@commons/test/mockWebExtensionsApi';

import {
  NotificationsListItem,
  Wrapper,
  ActorTargetLink,
  Description,
  TimeAgo,
} from '.';

const backgroundPontoonClientMock = {
  getTeamProjectUrl: async (projectUrl: string) => projectUrl,
} as unknown as BackgroundPontoonClient;

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
        backgroundPontoonClient={backgroundPontoonClientMock}
      />,
    );

    expect(wrapper.find(ActorTargetLink)).toHaveLength(2);
    expect(wrapper.find(ActorTargetLink).first().text()).toBe('ACTOR');
    expect(wrapper.find(ActorTargetLink).last().text()).toBe('TARGET');
    expect(wrapper.find('span').text()).toBe(' VERB ');
    expect(wrapper.find(TimeAgo).find(ReactTimeAgo)).toHaveLength(1);
    expect(wrapper.find(Description).text()).toBe('DESCRIPTION');
  });

  it('renders links and formatting tags in description', () => {
    const wrapper = mount(
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
        backgroundPontoonClient={backgroundPontoonClientMock}
      />,
    );

    expect(wrapper.find(Description).html()).toContain(
      'DESCRIPTION <em>WITH A</em> <a href="https://example.com/">LINK</a>',
    );
  });

  it('linkifies URL in unsafe description', () => {
    const wrapper = mount(
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
        backgroundPontoonClient={backgroundPontoonClientMock}
      />,
    );

    expect(wrapper.find(Description).html()).toContain(
      '<span class="Linkify">DESCRIPTION WITH A LINK TO <a href="https://example.com/" class="link" target="_blank" rel="noopener noreferrer">https://example.com/</a></span>',
    );
  });

  it('prevents XSS in description', () => {
    const wrapper = mount(
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
        backgroundPontoonClient={backgroundPontoonClientMock}
      />,
    );

    expect(wrapper.find(Description).html()).toContain(
      'DESCRIPTION WITH(OUT) <a>XSS ATTEMPTS</a> ',
    );
  });

  it('actor and target links work', async () => {
    const actorUrl = 'https://127.0.0.1/actor/';
    const targetUrl = 'https://127.0.0.1/target/';
    mockBrowser.tabs.create
      .expect(expect.anything())
      .andResolve({} as any)
      .times(2); // eslint-disable-line @typescript-eslint/no-explicit-any

    const wrapper = shallow(
      <NotificationsListItem
        unread={true}
        actor={{ url: actorUrl, anchor: 'ACTOR' }}
        target={{ url: targetUrl, anchor: 'TARGET' }}
        backgroundPontoonClient={backgroundPontoonClientMock}
      />,
    );

    expect(wrapper.find(ActorTargetLink)).toHaveLength(2);

    act(() => {
      wrapper.find(ActorTargetLink).first().simulate('click', {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      });
      wrapper.find(ActorTargetLink).last().simulate('click', {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      });
    });

    await flushPromises();

    mockBrowserNode.verify();
  });

  it('whole item is clickable when only one link is present', async () => {
    const actorUrl = 'https://127.0.0.1/actor/';
    mockBrowser.tabs.create
      .expect(expect.anything())
      .andResolve({} as any)
      .times(0); // eslint-disable-line @typescript-eslint/no-explicit-any

    const wrapper = shallow(
      <NotificationsListItem
        unread={true}
        actor={{ url: actorUrl, anchor: 'ACTOR' }}
        backgroundPontoonClient={backgroundPontoonClientMock}
      />,
    );

    act(() => {
      wrapper.find(Wrapper).simulate('click', {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      });
    });

    await flushPromises();

    mockBrowserNode.verify();
  });
});
