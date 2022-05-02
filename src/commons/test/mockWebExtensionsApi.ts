import type { Browser } from 'webextension-polyfill';
import { deepMock } from 'mockzilla';

const [browser, mockBrowser, mockBrowserNode] = deepMock<Browser>(
  'browser',
  false,
);

jest.mock('webextension-polyfill', () => ({ browser }));
jest.mock('webextension-polyfill', () => browser);

export { browser, mockBrowser, mockBrowserNode };
