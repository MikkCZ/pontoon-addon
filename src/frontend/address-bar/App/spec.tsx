import React from 'react';
import { render, screen, act } from '@testing-library/react';
import flushPromises from 'flush-promises';

import { getPontoonProjectForTheCurrentTab } from '@commons/backgroundMessaging';
import {
  getActiveTab,
  getOneFromStorage,
  StorageContent,
} from '@commons/webExtensionsApi';
import { getOptions } from '@commons/options';

import { App } from '.';

jest.mock('@commons/webExtensionsApi');
jest.mock('@commons/options');
jest.mock('@commons/backgroundMessaging');

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

describe('address-bar/App', () => {
  it('renders links for project in the current tab', async () => {
    const project = { name: 'Firefox', slug: 'firefox' };
    (getPontoonProjectForTheCurrentTab as jest.Mock).mockResolvedValue(project);
    (getActiveTab as jest.Mock).mockResolvedValue({
      url: 'https://firefox.com',
    });

    render(<App />);
    await act(async () => {
      await flushPromises();
    });

    expect(screen.getByTestId('project-links')).toBeInTheDocument();
  });
});
