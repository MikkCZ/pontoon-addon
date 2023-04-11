import { act } from '@testing-library/react';
import flushPromises from 'flush-promises';

import {
  getActiveTab,
  getFromStorage,
  getOneFromStorage,
} from '@commons/webExtensionsApi';
import { getOptions } from '@commons/options';
import { getPontoonProjectForTheCurrentTab } from '@background/backgroundClient';

import { render as index } from './index';

jest.mock('@commons/webExtensionsApi');
jest.mock('@commons/options');
jest.mock('@background/backgroundClient');

afterEach(() => {
  jest.resetAllMocks();
  document.body.textContent = '';
});

function prepareRoot(rootId: string) {
  const rootDiv = document.createElement('div');
  rootDiv.id = rootId;
  document.body.appendChild(rootDiv);
  expect(rootDiv.innerHTML).toBe('');
  return rootDiv;
}

describe('address bar', () => {
  beforeEach(() => {
    (getPontoonProjectForTheCurrentTab as jest.Mock).mockReturnValue({
      name: 'Some project',
      slug: 'some-project',
    });
    (getOneFromStorage as jest.Mock).mockResolvedValue({
      cs: { name: 'Czech', bz_component: 'L10N/CS' },
    });
    (getOptions as jest.Mock).mockResolvedValue({
      locale_team: 'cs',
      pontoon_base_url: 'https://localhost',
    });
    (getActiveTab as jest.Mock).mockResolvedValue({
      url: 'https://localhost/firefox',
    });
  });

  it('renders', async () => {
    const root = prepareRoot('address-bar-root');

    await act(async () => {
      index();
      await flushPromises();
    });

    expect(root.innerHTML).not.toBe('');
  });
});

describe('intro', () => {
  it('renders', async () => {
    const root = prepareRoot('intro-root');

    await act(async () => {
      index();
      await flushPromises();
    });

    expect(root.innerHTML).not.toBe('');
  });
});

describe('options', () => {
  it('renders', async () => {
    const root = prepareRoot('options-root');

    await act(async () => {
      index();
      await flushPromises();
    });

    expect(root.innerHTML).not.toBe('');
  });
});

describe('privacy policy', () => {
  it('renders', async () => {
    const root = prepareRoot('privacy-policy-root');

    await act(async () => {
      index();
      await flushPromises();
    });

    expect(root.innerHTML).not.toBe('');
  });
});

describe('snake game', () => {
  it('renders', async () => {
    const root = prepareRoot('snake-game-root');

    await act(async () => {
      index();
      await flushPromises();
    });

    expect(root.innerHTML).not.toBe('');
  });
});

describe('toolbar button', () => {
  beforeEach(() => {
    (getOptions as jest.Mock).mockResolvedValue({
      locale_team: 'cs',
      toolbar_button_popup_always_hide_read_notifications: true,
      pontoon_base_url: 'https://127.0.0.1',
    });
    (getFromStorage as jest.Mock).mockResolvedValue({
      notificationsData: {},
      teamsList: {
        cs: { code: 'cs', name: 'Czech', strings: {}, bz_component: 'L10N/CS' },
      },
      latestTeamsActivity: { cs: {} },
    });
  });

  it('renders', async () => {
    const root = prepareRoot('toolbar-button-root');

    await act(async () => {
      index();
      await flushPromises();
    });

    expect(root.innerHTML).not.toBe('');
  });
});
