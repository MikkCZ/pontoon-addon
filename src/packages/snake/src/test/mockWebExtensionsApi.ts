import type { Browser } from 'webextension-polyfill-ts';
import { deepMock } from 'mockzilla';

const [browser, mockBrowser, mockBrowserNode] = deepMock<Browser>(
  'browser',
  false
);

jest.mock('webextension-polyfill-ts', () => ({ browser }));
jest.mock('webextension-polyfill', () => browser);

export { mockBrowser, mockBrowserNode };
