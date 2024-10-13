import type { Tabs } from 'webextension-polyfill';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import flushPromises from 'flush-promises';

import type { StorageContent } from '@commons/webExtensionsApi';
import {
  getActiveTab,
  getOneFromStorage,
  openNewTab,
} from '@commons/webExtensionsApi';
import { getOptions } from '@commons/options';
import {
  newLocalizationBug,
  pontoonProjectTranslationView,
  pontoonTeamsProject,
} from '@commons/webLinks';
import * as UtilsApiModule from '@commons/utils';
import { getPontoonProjectForTheCurrentTab } from '@commons/backgroundMessaging';

import { ProjectLinks } from '.';

jest.mock('@commons/webExtensionsApi');
jest.mock('@commons/options');
jest.mock('@commons/backgroundMessaging');

jest.spyOn(window, 'close').mockReturnValue(undefined);
const openNewPontoonTabSpy = jest
  .spyOn(UtilsApiModule, 'openNewPontoonTab')
  .mockResolvedValue({} as Tabs.Tab);

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

(getPontoonProjectForTheCurrentTab as jest.Mock).mockResolvedValue(undefined);
(getOneFromStorage as jest.Mock).mockResolvedValue({ cs: team });
(getOptions as jest.Mock).mockResolvedValue({
  locale_team: 'cs',
  pontoon_base_url: 'https://localhost',
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('ProjectLinks', () => {
  it('renders links for project in the current tab', async () => {
    const project = { name: 'Firefox', slug: 'firefox' };
    (getPontoonProjectForTheCurrentTab as jest.Mock).mockResolvedValue(project);
    (getActiveTab as jest.Mock).mockResolvedValue({
      url: 'https://firefox.com',
    });

    render(<ProjectLinks />);
    await act(async () => {
      await flushPromises();
    });

    await act(async () => {
      screen.getByText('Open Firefox dashboard for Czech').click();
      await flushPromises();
    });
    expect(openNewPontoonTabSpy).toHaveBeenCalledTimes(1);
    expect(openNewPontoonTabSpy).toHaveBeenLastCalledWith(
      pontoonTeamsProject('https://localhost', team, project),
    );

    await act(async () => {
      screen.getByText('Open Firefox translation view for Czech').click();
      await flushPromises();
    });
    expect(openNewPontoonTabSpy).toHaveBeenCalledTimes(2);
    expect(openNewPontoonTabSpy).toHaveBeenLastCalledWith(
      pontoonProjectTranslationView('https://localhost', team, project),
    );

    await act(async () => {
      screen
        .getByText('Report bug for localization of Firefox to Czech')
        .click();
      await flushPromises();
    });
    expect(openNewTab).toHaveBeenCalledTimes(1);
    expect(openNewTab).toHaveBeenLastCalledWith(
      newLocalizationBug({ team, url: 'https://firefox.com' }),
    );
  });
});
