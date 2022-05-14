import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import flushPromises from 'flush-promises';
import ReactTimeAgo from 'react-time-ago';

import {
  getFromStorage,
  openNewTab,
  StorageContent,
} from '@commons/webExtensionsApi';
import { getOneOption } from '@commons/options';
import {
  getPontoonProjectForTheCurrentTab,
  getStringsWithStatusSearchUrl,
  getTeamPageUrl,
} from '@background/backgroundClient';

import { BottomLink } from '../BottomLink';
import { TeamInfoListItem } from '../TeamInfoListItem';

import { TeamInfo, Name, Code } from '.';

jest.mock('@commons/webExtensionsApi');
jest.mock('@commons/options');
jest.mock('@background/backgroundClient');

const windowCloseSpy = jest.spyOn(window, 'close');

const team: StorageContent['teamsList'][string] = {
  code: 'cs',
  name: 'Czech',
  bz_component: 'L10N/CS',
  strings: {
    approvedStrings: 0,
    pretranslatedStrings: 0,
    stringsWithWarnings: 0,
    stringsWithErrors: 0,
    missingStrings: 0,
    unreviewedStrings: 0,
    totalStrings: 0,
  },
};

beforeEach(() => {
  (getPontoonProjectForTheCurrentTab as jest.Mock).mockResolvedValue(undefined);
  (getFromStorage as jest.Mock).mockResolvedValue({
    teamsList: { cs: team },
    latestTeamsActivity: {
      cs: {
        user: 'USER',
        date_iso: '1970-01-01T00:00:00Z',
      },
    },
  });
  (getOneOption as jest.Mock).mockResolvedValue('cs');
  (getTeamPageUrl as jest.Mock).mockReturnValue('https://127.0.0.1/team-page');
  (getStringsWithStatusSearchUrl as jest.Mock).mockImplementation(
    (status: string) => `https://127.0.0.1/${status}/`,
  );
});

afterEach(() => {
  windowCloseSpy.mockReset();
  jest.resetAllMocks();
});

describe('TeamInfo', () => {
  it('renders', async () => {
    const wrapper = mount(<TeamInfo />);
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

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

  it('renders without activity', async () => {
    (getFromStorage as jest.Mock).mockResolvedValue({
      teamsList: { cs: team },
      latestTeamsActivity: {
        cs: {
          user: '',
          date_iso: undefined,
        },
      },
    });

    const wrapper = mount(<TeamInfo />);
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.find(TeamInfoListItem).at(0).prop('label')).toBe('Activity');
    expect(wrapper.find(TeamInfoListItem).at(0).prop('value')).toBe('―');
  });

  it('team page links work', async () => {
    const wrapper = mount(<TeamInfo />);
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    wrapper.find(Name).simulate('click');
    wrapper.find(Code).simulate('click');
    wrapper.find(BottomLink).at(0).simulate('click');

    await flushPromises();

    expect(openNewTab).toHaveBeenCalledWith('https://127.0.0.1/team-page');
    expect(openNewTab).toHaveBeenCalledTimes(3);
  });

  it('string status links work', async () => {
    const wrapper = mount(<TeamInfo />);
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

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
