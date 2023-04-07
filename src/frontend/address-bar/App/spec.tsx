import type { Tabs } from 'webextension-polyfill';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import flushPromises from 'flush-promises';

import { getPontoonProjectForTheCurrentTab } from '@background/backgroundClient';
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

import { App } from '.';

jest.mock('@commons/webExtensionsApi');
jest.mock('@commons/options');
jest.mock('@background/backgroundClient');

const openNewPontoonTabSpy = jest
  .spyOn(UtilsApiModule, 'openNewPontoonTab')
  .mockResolvedValue({} as Tabs.Tab);

const project = {
  name: 'Some Project',
  slug: 'some-project',
};

const team = {
  code: 'cs',
  name: 'Czech',
  bz_component: 'L10N/CS',
};

(getPontoonProjectForTheCurrentTab as jest.Mock).mockResolvedValue(project);
(getOneFromStorage as jest.Mock).mockResolvedValue({ [team.code]: team });
(getOptions as jest.Mock).mockResolvedValue({
  locale_team: team.code,
  pontoon_base_url: 'https://localhost',
});
(getActiveTab as jest.Mock).mockResolvedValue({
  url: 'https://localhost/firefox',
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('address-bar/App', () => {
  it('renders items for the project', async () => {
    render(<App />);
    await act(async () => {
      await flushPromises();
    });

    const expectedItems = [
      'Open Some Project dashboard for Czech',
      'Open Some Project translation view for Czech',
      'Report bug for localization of Some Project to Czech',
    ];

    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getByRole('list')).toHaveClass('panel-section');
    expect(screen.getAllByRole('listitem')).toHaveLength(expectedItems.length);
    for (const [i, expectedText] of expectedItems.entries()) {
      expect(screen.getAllByRole('listitem')[i]).toHaveTextContent(
        expectedText,
      );
    }
  });

  it('item opens project dashboard page', async () => {
    render(<App />);
    await act(async () => {
      await flushPromises();
    });

    await act(async () => {
      screen.getByText('Open Some Project dashboard for Czech').click();
      await flushPromises();
    });

    expect(openNewPontoonTabSpy).toHaveBeenCalledWith(
      pontoonTeamsProject('https://localhost', { code: 'cs' }, project),
    );
  });

  it('items opens project translation view', async () => {
    render(<App />);
    await act(async () => {
      await flushPromises();
    });

    await act(async () => {
      screen.getByText('Open Some Project translation view for Czech').click();
      await flushPromises();
    });

    expect(openNewPontoonTabSpy).toHaveBeenCalledWith(
      pontoonProjectTranslationView(
        'https://localhost',
        { code: 'cs' },
        project,
      ),
    );
  });

  it('items opens link to report a bug', async () => {
    render(<App />);
    await act(async () => {
      await flushPromises();
    });

    await act(async () => {
      screen
        .getByText('Report bug for localization of Some Project to Czech')
        .click();
      await flushPromises();
    });

    expect(openNewTab).toHaveBeenCalledWith(
      newLocalizationBug({
        team,
        url: 'https://localhost/firefox',
      }),
    );
  });
});
