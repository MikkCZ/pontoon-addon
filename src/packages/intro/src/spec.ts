import ReactDOM from 'react-dom';

import { mockBrowser, mockBrowserNode } from './test/mockWebExtensionsApi';

beforeEach(() => {
  mockBrowserNode.enable();
  mockBrowser.pageAction.openPopup.spy(jest.fn()).times(0);
  mockBrowser.runtime.getURL
    .expect(expect.anything())
    .andReturn('moz-extension://foo-bar');
});

afterEach(() => {
  mockBrowserNode.disable();
});

const reactDomRender = jest.spyOn(ReactDOM, 'render') as jest.Mock;
jest.mock('@pontoon-addon/commons/src/Options', () => ({
  Options: {
    create: async () => ({
      set: jest.fn(),
    }),
  },
}));

describe('index', () => {
  it('renders', async () => {
    const rootDiv = document.createElement('div');
    rootDiv.id = 'tour-root';
    document.body.appendChild(rootDiv);

    const renderPromise = await require('.');
    await renderPromise;

    expect(reactDomRender).toHaveBeenCalledTimes(1);
    expect(reactDomRender.mock.calls[0][1]).toBe(rootDiv);
  });
});
