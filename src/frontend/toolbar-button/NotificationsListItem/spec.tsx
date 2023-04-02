import type { Tabs } from 'webextension-polyfill';
import React from 'react';
import { mount, shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';
import ReactTimeAgo from 'react-time-ago';
import flushPromises from 'flush-promises';

import * as UtilsApiModule from '@commons/utils';
import { getTeamProjectUrl } from '@background/backgroundClient';

import {
  NotificationsListItem,
  Wrapper,
  ActorTargetLink,
  Description,
  TimeAgo,
} from '.';

jest.mock('@commons/webExtensionsApi/browser');
jest.mock('@commons/options');
jest.mock('@background/backgroundClient');

jest.spyOn(window, 'close').mockReturnValue(undefined);
const openNewPontoonTabSpy = jest
  .spyOn(UtilsApiModule, 'openNewPontoonTab')
  .mockResolvedValue({} as Tabs.Tab);

(getTeamProjectUrl as jest.Mock).mockImplementation(
  (projectUrl: string) => projectUrl,
);

afterEach(() => {
  jest.clearAllMocks();
});

describe('NotificationsListItem', () => {
  it('renders', () => {
    const wrapper = mount(
      <NotificationsListItem
        pontoonBaseUrl="https://127.0.0.1"
        unread={true}
        actor={{ anchor: 'ACTOR', url: '' }}
        verb="VERB"
        target={{ anchor: 'TARGET', url: '' }}
        date_iso="1970-01-01T00:00:00Z"
        description={{ safe: true, content: 'DESCRIPTION' }}
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
        pontoonBaseUrl="https://127.0.0.1"
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
      />,
    );

    expect(wrapper.find(Description).html()).toContain(
      'DESCRIPTION <em>WITH A</em> <a href="https://example.com/">LINK</a>',
    );
  });

  it('linkifies URL in unsafe description', () => {
    const wrapper = mount(
      <NotificationsListItem
        pontoonBaseUrl="https://127.0.0.1"
        unread={true}
        actor={{ anchor: 'ACTOR', url: '' }}
        verb="VERB"
        target={{ anchor: 'TARGET', url: '' }}
        date_iso="1970-01-01T00:00:00Z"
        description={{
          safe: false,
          content: 'DESCRIPTION WITH A LINK TO https://example.com/',
        }}
      />,
    );

    expect(wrapper.find(Description).html()).toContain(
      '<span class="Linkify">DESCRIPTION WITH A LINK TO <a href="https://example.com/" class="link" target="_blank" rel="noopener noreferrer">https://example.com/</a></span>',
    );
  });

  it('prevents XSS in description', () => {
    const wrapper = mount(
      <NotificationsListItem
        pontoonBaseUrl="https://127.0.0.1"
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
      />,
    );

    expect(wrapper.find(Description).html()).toContain(
      'DESCRIPTION WITH(OUT) <a>XSS ATTEMPTS</a> ',
    );
  });

  it('actor and target links work', async () => {
    const actorUrl = 'https://127.0.0.1/actor/';
    const targetUrl = 'https://127.0.0.1/target/';
    const wrapper = shallow(
      <NotificationsListItem
        pontoonBaseUrl="https://127.0.0.1"
        unread={true}
        actor={{ url: actorUrl, anchor: 'ACTOR' }}
        target={{ url: targetUrl, anchor: 'TARGET' }}
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

    expect(openNewPontoonTabSpy).toHaveBeenCalledWith(actorUrl);
    expect(openNewPontoonTabSpy).toHaveBeenCalledWith(targetUrl);
  });

  it('whole item is clickable when only one link is present', async () => {
    const actorUrl = 'https://127.0.0.1/actor/';
    const wrapper = shallow(
      <NotificationsListItem
        pontoonBaseUrl="https://127.0.0.1"
        unread={true}
        actor={{ url: actorUrl, anchor: 'ACTOR' }}
      />,
    );

    act(() => {
      wrapper.find(Wrapper).simulate('click', {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      });
    });
    await flushPromises();

    expect(openNewPontoonTabSpy).toHaveBeenCalledWith(actorUrl);
  });
});
