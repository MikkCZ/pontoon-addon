import ReactDOM from 'react-dom';

import { mockBrowser, mockBrowserNode } from './test/mockWebExtensionsApi';

const reactDomRender = jest.spyOn(ReactDOM, 'render') as jest.Mock;

beforeEach(() => {
  mockBrowserNode.enable();
  mockBrowser.runtime.getURL
    .expect(expect.anything())
    .andReturn('moz-extension://foo-bar');
});

afterEach(() => {
  mockBrowserNode.disable();
});

describe('index', () => {
  it('renders SnakeGameRoot', async () => {
    const rootDiv = document.createElement('div');
    rootDiv.id = 'snake-root';
    document.body.appendChild(rootDiv);

    await require('.');

    expect(reactDomRender).toHaveBeenCalledTimes(1);
    expect(reactDomRender.mock.calls[0][1]).toBe(rootDiv);
  });
});
