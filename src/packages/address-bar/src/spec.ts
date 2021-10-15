import ReactDOM from 'react-dom';
import { Project } from '@pontoon-addon/commons/src/BackgroundPontoonClient';

import { mockBrowser, mockBrowserNode } from './test/mockWebExtensionsApi';

const reactDomRender = jest.spyOn(ReactDOM, 'render') as jest.Mock;

beforeEach(() => {
  mockBrowserNode.enable();
  mockBrowser.runtime.sendMessage.expect(expect.anything()).andResolve({
    name: 'Some project',
    pageUrl: 'https://127.0.0.1/',
    translationUrl: 'https://127.0.0.1/',
  } as Project as any); // eslint-disable-line @typescript-eslint/no-explicit-any
});

afterEach(() => {
  mockBrowserNode.verifyAndDisable();
});

describe('index', () => {
  it('renders', async () => {
    const rootDiv = document.createElement('div');
    rootDiv.id = 'address-bar-root';
    document.body.appendChild(rootDiv);

    const renderPromise = await require('.');
    await renderPromise;

    expect(reactDomRender).toHaveBeenCalledTimes(1);
    expect(reactDomRender.mock.calls[0][1]).toBe(rootDiv);
  });
});
