/* eslint-disable testing-library/render-result-naming-convention */
import ReactDOM from 'react-dom';
import flushPromises from 'flush-promises';

import { Project } from '@background/BackgroundPontoonClient';
import {
  mockBrowser,
  mockBrowserNode,
} from '@commons/test/mockWebExtensionsApi';

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

async function renderInRootId(rootId: string): Promise<HTMLDivElement> {
  const rootDiv = document.createElement('div');
  rootDiv.id = rootId;
  document.body.appendChild(rootDiv);

  const renderPromise = await require('./index');
  await renderPromise;
  await flushPromises();

  return rootDiv;
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
    const rootDiv = await renderInRootId('address-bar-root');

    expect(reactDomRender).toHaveBeenCalledTimes(1);
    expect(reactDomRender.mock.calls[0][1]).toBe(rootDiv);
  });
});

describe('intro', () => {
  it('renders', async () => {
    const rootDiv = await renderInRootId('intro-root');

    expect(reactDomRender).toHaveBeenCalledTimes(1);
    expect(reactDomRender.mock.calls[0][1]).toBe(rootDiv);
  });
});

describe('privacy policy', () => {
  it('renders', async () => {
    const rootDiv = await renderInRootId('privacy-policy-root');

    expect(reactDomRender).toHaveBeenCalledTimes(1);
    expect(reactDomRender.mock.calls[0][1]).toBe(rootDiv);
  });
});

describe('snake game', () => {
  it('renders', async () => {
    const rootDiv = await renderInRootId('snake-game-root');

    expect(reactDomRender).toHaveBeenCalledTimes(1);
    expect(reactDomRender.mock.calls[0][1]).toBe(rootDiv);
  });
});

describe('toolbar button', () => {
  beforeEach(() => {
    mockBrowser.storage.local.get.expect(expect.anything()).andResolve({
      notificationsData: {},
    });
    mockBrowser.runtime.onMessage.hasListener
      .expect(expect.anything())
      .andReturn(true);
  });

  it('renders', async () => {
    const rootDiv = await renderInRootId('toolbar-button-root');

    expect(reactDomRender).toHaveBeenCalledTimes(1);
    expect(reactDomRender.mock.calls[0][1]).toBe(rootDiv);
  });
});
