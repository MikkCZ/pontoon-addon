/* eslint-disable testing-library/render-result-naming-convention */
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import flushPromises from 'flush-promises';

import { Project } from '@background/BackgroundPontoonClient';
import {
  mockBrowser,
  mockBrowserNode,
} from '@commons/test/mockWebExtensionsApi';

import { render } from './index';

jest.mock('@commons/Options', () => ({
  Options: {
    create: async () => ({
      set: jest.fn(),
      get: jest.fn(async () => ({
        toolbar_button_popup_always_hide_read_notifications: false,
        locale_team: 'cs',
      })),
    }),
  },
}));

const reactDomRender = jest.spyOn(ReactDOM, 'render') as jest.Mock;

beforeEach(() => {
  mockBrowserNode.enable();
});

afterEach(() => {
  reactDomRender.mockClear();
  mockBrowserNode.verifyAndDisable();
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
  beforeEach(() => {
    mockBrowser.runtime.sendMessage.expect(expect.anything()).andResolve({
      name: 'Some project',
      pageUrl: 'https://127.0.0.1/',
      translationUrl: 'https://127.0.0.1/',
    } as Project as any); // eslint-disable-line @typescript-eslint/no-explicit-any
  });

  it('renders', async () => {
    await expectRendersToRoot('address-bar-root');
  });
});

describe.skip('intro', () => {
  it('renders', async () => {
    await expectRendersToRoot('intro-root');
  });
});

describe.skip('options', () => {
  it('renders', async () => {
    await expectRendersToRoot('options-root');
  });
});

describe.skip('privacy policy', () => {
  it('renders', async () => {
    await expectRendersToRoot('privacy-policy-root');
  });
});

describe.skip('snake game', () => {
  it('renders', async () => {
    await expectRendersToRoot('snake-game-root');
  });
});

describe.skip('toolbar button', () => {
  beforeEach(() => {
    mockBrowser.storage.local.get.expect(expect.anything()).andResolve({
      notificationsData: {},
    });
    mockBrowser.runtime.onMessage.hasListener
      .expect(expect.anything())
      .andReturn(true);
  });

  it('renders', async () => {
    await expectRendersToRoot('toolbar-button-root');
  });
});
