import React from 'react';
import ReactTimeAgo from 'react-time-ago';
import { mount } from 'enzyme';
import flushPromises from 'flush-promises';

import type { BackgroundPontoonClient } from '@background/BackgroundPontoonClient';
import {
  mockBrowser,
  mockBrowserNode,
} from '@commons/test/mockWebExtensionsApi';

import { BottomLink } from '../BottomLink';
import { TeamInfoListItem } from '../TeamInfoListItem';

import { TeamInfo, Name, Code } from '.';

const windowCloseSpy = jest.spyOn(window, 'close');

afterEach(() => {
  windowCloseSpy.mockReset();
});

const backgroundPontoonClientMock = {
  getTeamPageUrl: async () => 'https://127.0.0.1/team-page',
  getStringsWithStatusSearchUrl: async (status: string) =>
    `https://127.0.0.1/${status}/`,
} as unknown as BackgroundPontoonClient;

beforeEach(() => {
  mockBrowserNode.enable();
});

afterEach(() => {
  mockBrowserNode.disable();
});

describe('TeamInfo', () => {
  it('renders', () => {
    const wrapper = mount(
      <TeamInfo
        name="Czech"
        code="cs"
        latestActivity={{
          user: 'USER',
          date_iso: '1970-01-01T00:00:00Z',
        }}
        backgroundPontoonClient={backgroundPontoonClientMock}
      />,
    );

    expect(wrapper.find(Name).text()).toBe('Czech');
    expect(wrapper.find(Code).text()).toBe('cs');
    expect(wrapper.find(TeamInfoListItem)).toHaveLength(8);
    expect(wrapper.find(TeamInfoListItem).at(0).prop('label')).toBe('Activity');
    expect(wrapper.find(ReactTimeAgo)).toHaveLength(1);
    expect(wrapper.find(TeamInfoListItem).at(1).prop('label')).toBe(
      'translated',
    );
    expect(wrapper.find(TeamInfoListItem).at(2).prop('label')).toBe(
      'pretranslated',
    );
    expect(wrapper.find(TeamInfoListItem).at(3).prop('label')).toBe('warnings');
    expect(wrapper.find(TeamInfoListItem).at(4).prop('label')).toBe('errors');
    expect(wrapper.find(TeamInfoListItem).at(5).prop('label')).toBe('missing');
    expect(wrapper.find(TeamInfoListItem).at(6).prop('label')).toBe(
      'unreviewed',
    );
    expect(wrapper.find(TeamInfoListItem).at(7).prop('label')).toBe(
      'all strings',
    );
  });

  it('renders without activity', () => {
    const wrapper = mount(
      <TeamInfo
        name="Czech"
        code="cs"
        latestActivity={{
          user: '',
          date_iso: undefined,
        }}
        backgroundPontoonClient={backgroundPontoonClientMock}
      />,
    );

    expect(wrapper.find(TeamInfoListItem).at(0).prop('label')).toBe('Activity');
    expect(wrapper.find(TeamInfoListItem).at(0).prop('value')).toBe('―');
  });

  it('team page links work', async () => {
    const wrapper = mount(
      <TeamInfo
        name="Czech"
        code="cs"
        stringsData={{
          approvedStrings: 0,
          pretranslatedStrings: 0,
          stringsWithWarnings: 0,
          stringsWithErrors: 0,
          missingStrings: 0,
          unreviewedStrings: 0,
          totalStrings: 0,
        }}
        latestActivity={{
          user: 'USER',
          date_iso: '1970-01-01T00:00:00Z',
        }}
        backgroundPontoonClient={backgroundPontoonClientMock}
      />,
    );

    mockBrowser.tabs.create
      .expect({ url: 'https://127.0.0.1/team-page' })
      .andResolve({} as any)
      .times(3); // eslint-disable-line @typescript-eslint/no-explicit-any

    wrapper.find(Name).simulate('click');
    wrapper.find(Code).simulate('click');
    wrapper.find(BottomLink).simulate('click');

    await flushPromises();

    mockBrowserNode.verify();
  });

  it('string status links work', async () => {
    const wrapper = mount(
      <TeamInfo
        name="Czech"
        code="cs"
        stringsData={{
          approvedStrings: 0,
          pretranslatedStrings: 0,
          stringsWithWarnings: 0,
          stringsWithErrors: 0,
          missingStrings: 0,
          unreviewedStrings: 0,
          totalStrings: 0,
        }}
        latestActivity={{
          user: 'USER',
          date_iso: '1970-01-01T00:00:00Z',
        }}
        backgroundPontoonClient={backgroundPontoonClientMock}
      />,
    );

    [
      'translated',
      'pretranslated',
      'warnings',
      'errors',
      'missing',
      'unreviewed',
      'all',
    ].forEach(async (status, index) => {
      mockBrowser.tabs.create
        .expect({ url: `https://127.0.0.1/${status}/` })
        .andResolve({} as any)
        .times(1); // eslint-disable-line @typescript-eslint/no-explicit-any
      wrapper
        .find(TeamInfoListItem)
        .at(index + 1)
        .simulate('click');
      await flushPromises();
      mockBrowserNode.verify();
    });
  });
});
