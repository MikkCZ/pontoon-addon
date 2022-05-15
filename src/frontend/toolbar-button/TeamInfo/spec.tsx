import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import flushPromises from 'flush-promises';
import ReactTimeAgo from 'react-time-ago';

import {
  getActiveTab,
  getFromStorage,
  openNewTab,
  StorageContent,
} from '@commons/webExtensionsApi';
import { getOptions } from '@commons/options';
import {
  newLocalizationBug,
  pontoonProjectTranslationView,
  pontoonSearchStringsWithStatus,
  pontoonTeam,
  pontoonTeamsProject,
} from '@commons/webLinks';
import { getPontoonProjectForTheCurrentTab } from '@background/backgroundClient';

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
  (getOptions as jest.Mock).mockResolvedValue({
    locale_team: 'cs',
    pontoon_base_url: 'https://localhost',
  });
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
    await flushPromises();
    expect(openNewTab).toHaveBeenLastCalledWith(
      pontoonTeam('https://localhost', team),
    );

    wrapper.find(Code).simulate('click');
    await flushPromises();
    expect(openNewTab).toHaveBeenLastCalledWith(
      pontoonTeam('https://localhost', team),
    );

    wrapper.find(BottomLink).at(0).simulate('click');
    await flushPromises();
    expect(openNewTab).toHaveBeenLastCalledWith(
      pontoonTeam('https://localhost', team),
    );
  });

  it('string status links work', async () => {
    const wrapper = mount(<TeamInfo />);
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    const statusLinks = wrapper.find(TeamInfoListItem);

    const statuses = [
      // Activity
      'translated',
      'pretranslated',
      'warnings',
      'errors',
      'missing',
      'unreviewed',
      'all',
    ];
    expect(statusLinks).toHaveLength(statuses.length + 1);

    for (const [index, status] of statuses.entries()) {
      statusLinks
        .at(index + 1)
        .find('button')
        .simulate('click');
      await flushPromises();
      expect(openNewTab).toHaveBeenLastCalledWith(
        pontoonSearchStringsWithStatus('https://localhost', team, status),
      );
    }
  });

  it('renders links for project in the current tab', async () => {
    const project = { name: 'Firefox', slug: 'firefox' };
    (getPontoonProjectForTheCurrentTab as jest.Mock).mockResolvedValue(project);
    (getActiveTab as jest.Mock).mockResolvedValue({
      url: 'https://firefox.com',
    });

    const wrapper = mount(<TeamInfo />);
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    const openDashboadLink = wrapper.find(BottomLink).at(1);
    expect(openDashboadLink.text()).toBe('Open Firefox dashboard for Czech');
    openDashboadLink.simulate('click');
    await flushPromises();
    expect(openNewTab).toHaveBeenLastCalledWith(
      pontoonTeamsProject('https://localhost', team, project),
    );

    const translationViewLink = wrapper.find(BottomLink).at(2);
    expect(translationViewLink.text()).toBe(
      'Open Firefox translation view for Czech',
    );
    translationViewLink.simulate('click');
    await flushPromises();
    expect(openNewTab).toHaveBeenLastCalledWith(
      pontoonProjectTranslationView('https://localhost', team, project),
    );

    const reportBugLink = wrapper.find(BottomLink).at(3);
    expect(reportBugLink.text()).toBe(
      'Report bug for localization of Firefox to Czech',
    );
    reportBugLink.simulate('click');
    await flushPromises();
    expect(openNewTab).toHaveBeenLastCalledWith(
      newLocalizationBug({ team, url: 'https://firefox.com' }),
    );
  });
});
