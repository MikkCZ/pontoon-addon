/* eslint-disable jest/expect-expect, testing-library/render-result-naming-convention */
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import flushPromises from 'flush-promises';

import {
  mockBrowser,
  mockBrowserNode,
} from '@commons/test/mockWebExtensionsApi';
import { getFromStorage } from '@commons/webExtensionsApi';
import type { Project } from '@background/BackgroundPontoonClient';

import { render } from './index';

jest.mock('@commons/webExtensionsApi');
jest.mock('@commons/Options', () => ({
  Options: jest.fn(() => ({
    get: () => ({ locale_team: 'cs' }),
  })),
}));
jest.mock('@background/BackgroundPontoonClient', () => ({
  BackgroundPontoonClient: jest.fn(() => ({
    getBaseUrl: () => 'https://127.0.0.1',
    getPontoonProjectForTheCurrentTab: () => ({
      name: 'Some project',
      pageUrl: 'https://127.0.0.1/',
      translationUrl: 'https://127.0.0.1/',
    } as Project),
  })),
}));

const reactDomRender = jest.spyOn(ReactDOM, 'render') as jest.Mock;

beforeEach(() => {
  mockBrowserNode.enable();
});

afterEach(() => {
  mockBrowserNode.disable();
  reactDomRender.mockReset();
  (getFromStorage as jest.Mock).mockReset();
  document.body.textContent = '';
});

async function expectRendersToRoot(rootId: string): Promise<void> {
  const rootDiv = document.createElement('div');
  rootDiv.id = rootId;
  document.body.appendChild(rootDiv);

  await act(async () => {
    await render();
    await flushPromises();
  });

  expect(reactDomRender).toHaveBeenCalledTimes(1);
  expect(reactDomRender.mock.calls[0][1]).toBe(rootDiv);
}

describe('address bar', () => {
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
    (getFromStorage as jest.Mock).mockImplementation(async () => ({
      notificationsData: {},
      teamsList: { 'cs': {} },
      latestTeamsActivity: { 'cs': {} },
    }));
    mockBrowser.runtime.onMessage.hasListener
      .expect(expect.anything())
      .andReturn(true);
  });

  it('renders', async () => {
    await expectRendersToRoot('toolbar-button-root');
  });
});
