/* eslint-disable jest/expect-expect, testing-library/render-result-naming-convention */
import ReactDOM from 'react-dom';
import flushPromises from 'flush-promises';

import {
  getActiveTab,
  getFromStorage,
  getOneFromStorage,
} from '@commons/webExtensionsApi';
import { getOptions } from '@commons/options';
import { getPontoonProjectForTheCurrentTab } from '@background/backgroundClient';

import { render } from './index';

jest.mock('@commons/webExtensionsApi');
jest.mock('@commons/options');
jest.mock('@background/backgroundClient');

const reactDomRender = jest.spyOn(ReactDOM, 'render') as jest.Mock;

afterEach(() => {
  reactDomRender.mockReset();
  jest.resetAllMocks();
  document.body.textContent = '';
});

async function expectRendersToRoot(rootId: string): Promise<void> {
  const rootDiv = document.createElement('div');
  rootDiv.id = rootId;
  document.body.appendChild(rootDiv);

  await render();
  await flushPromises();

  expect(reactDomRender).toHaveBeenCalledTimes(1);
  expect(reactDomRender.mock.calls[0][1]).toBe(rootDiv);
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
    await expectRendersToRoot('address-bar-root');
  });
});

describe('intro', () => {
  it('renders', async () => {
    await expectRendersToRoot('intro-root');
  });
});

describe('options', () => {
  it('renders', async () => {
    await expectRendersToRoot('options-root');
  });
});

describe('privacy policy', () => {
  it('renders', async () => {
    await expectRendersToRoot('privacy-policy-root');
  });
});

describe('snake game', () => {
  it('renders', async () => {
    await expectRendersToRoot('snake-game-root');
  });
});

describe('toolbar button', () => {
  beforeEach(() => {
    (getOptions as jest.Mock).mockImplementation(async () => ({
      locale_team: 'cs',
      toolbar_button_popup_always_hide_read_notifications: true,
      pontoon_base_url: 'https://127.0.0.1',
    }));
    (getFromStorage as jest.Mock).mockImplementation(async () => ({
      notificationsData: {},
      teamsList: { cs: {} },
      latestTeamsActivity: { cs: {} },
    }));
  });

  it('renders', async () => {
    await expectRendersToRoot('toolbar-button-root');
  });
});
