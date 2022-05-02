import React from 'react';
import ReactTimeAgo from 'react-time-ago';
import { mount } from 'enzyme';
import flushPromises from 'flush-promises';

import { openNewTab } from '@commons/webExtensionsApi';
import {
  getStringsWithStatusSearchUrl,
  getTeamPageUrl,
} from '@background/backgroundClient';

import { BottomLink } from '../BottomLink';
import { TeamInfoListItem } from '../TeamInfoListItem';

import { TeamInfo, Name, Code } from '.';

jest.mock('@commons/webExtensionsApi');
jest.mock('@background/backgroundClient');

const windowCloseSpy = jest.spyOn(window, 'close');

beforeEach(() => {
  (getTeamPageUrl as jest.Mock).mockReturnValue('https://127.0.0.1/team-page');
  (getStringsWithStatusSearchUrl as jest.Mock).mockImplementation(
    (status: string) => `https://127.0.0.1/${status}/`,
  );
});

afterEach(() => {
  (openNewTab as jest.Mock).mockReset();
  windowCloseSpy.mockReset();
  (getTeamPageUrl as jest.Mock).mockReset();
  (getStringsWithStatusSearchUrl as jest.Mock).mockReset();
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
      />,
    );

    wrapper.find(Name).simulate('click');
    wrapper.find(Code).simulate('click');
    wrapper.find(BottomLink).simulate('click');

    await flushPromises();

    expect(openNewTab).toHaveBeenCalledWith('https://127.0.0.1/team-page');
    expect(openNewTab).toHaveBeenCalledTimes(3);
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
      wrapper
        .find(TeamInfoListItem)
        .at(index + 1)
        .simulate('click');
      await flushPromises();
      expect(openNewTab).toHaveBeenCalledWith(`https://127.0.0.1/${status}/`);
      expect(openNewTab).toHaveBeenCalledTimes(1);
      (openNewTab as jest.Mock).mockReset();
    });
  });
});
