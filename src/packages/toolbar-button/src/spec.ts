import flushPromises from 'flush-promises';
import ReactDOM from 'react-dom';

import { mockBrowser, mockBrowserNode } from './test/mockWebExtensionsApi';

beforeEach(() => {
  mockBrowserNode.enable();
  mockBrowser.storage.local.get.expect(expect.anything()).andResolve({
    notificationsData: {},
    teamsList: {
      cs: { name: 'Czech', code: 'cs', strings: {} },
    },
    latestTeamsActivity: {},
  });
  mockBrowser.runtime.onMessage.hasListener.expect(expect.anything()).andReturn(true);
});

afterEach(() => {
  mockBrowserNode.disable();
});

const reactDomRender = jest.spyOn(ReactDOM, 'render') as jest.Mock;
jest.mock('@pontoon-addon/commons/src/Options', () => ({
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

describe('index', () => {
  it('renders', async () => {
    const rootDiv = document.createElement('div');
    rootDiv.id = 'toolbar-button-root';
    document.body.appendChild(rootDiv);

    const renderPromise = await require('.');
    await renderPromise;

    await flushPromises();

    expect(reactDomRender).toHaveBeenCalledTimes(1);
    expect(reactDomRender.mock.calls[0][1]).toBe(rootDiv);
  });
});
