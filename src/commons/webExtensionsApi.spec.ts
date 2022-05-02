/* eslint-disable jest/expect-expect */
import type { MockzillaDeep } from 'mockzilla';
import { Alarms, ExtensionTypes, Tabs } from 'webextension-polyfill';

import { mockBrowser, mockBrowserNode } from './test/mockWebExtensionsApi';
import {
  browser,
  browserFamily,
  closeNotification,
  createContextMenu,
  createNotification,
  deleteFromStorage,
  executeScript,
  getActiveTab,
  getAllContainers,
  getAllTabs,
  getFromStorage,
  getOneFromStorage,
  getTabsWithBaseUrl,
  getResourceUrl,
  hasPermissions,
  hideAddressBarIcon,
  openIntro,
  openNewTab,
  openOptions,
  openPrivacyPolicy,
  openSnakeGame,
  openToolbarButtonPopup,
  removeContextMenu,
  requestPermissionForPontoon,
  saveToStorage,
  showAddressBarIcon,
  supportsAddressBar,
  supportsContainers,
  registerScriptForBaseUrl,
  callWithInterval,
  callDelayed,
} from './webExtensionsApi';

beforeEach(() => {
  mockBrowserNode.enable();
});

afterEach(() => {
  mockBrowserNode.disable();
});

describe('webExtensionsApi', () => {
  it('exports browser', () => {
    expect(browser).toBeTruthy();
  });

  it('getFromStorage', async () => {
    mockBrowser.storage.local.get.expect(['projectsList']).andResolve({});

    await getFromStorage(['projectsList']);

    mockBrowserNode.verify();
  });

  it('getOneFromStorage', async () => {
    mockBrowser.storage.local.get.expect(['projectsList']).andResolve({});

    await getOneFromStorage('projectsList');

    mockBrowserNode.verify();
  });

  it('saveToStorage', async () => {
    mockBrowser.storage.local.set.expect({ projectsList: {} }).andResolve();

    await saveToStorage({ projectsList: {} });

    mockBrowserNode.verify();
  });

  it('deleteFromStorage', async () => {
    mockBrowser.storage.local.remove.expect(['projectsList']).andResolve();

    await deleteFromStorage('projectsList');

    mockBrowserNode.verify();
  });

  it('createNotification', async () => {
    mockBrowser.notifications.create
      .expect({ type: 'basic', title: 'foo', message: 'bar' })
      .andResolve('id');
    mockBrowser.notifications.onClicked.addListener
      .expect(expect.anything())
      .andReturn();

    await createNotification({ type: 'basic', title: 'foo', message: 'bar' });

    mockBrowserNode.verify();
  });

  it('closeNotification', async () => {
    mockBrowser.notifications.clear.expect('id').andResolve(true);

    await closeNotification('id');

    mockBrowserNode.verify();
  });

  it('createContextMenu', () => {
    mockBrowser.contextMenus.create.expect({ title: 'foo' }).andReturn('id');

    createContextMenu({ title: 'foo' });

    mockBrowserNode.verify();
  });

  it('removeContextMenu', async () => {
    mockBrowser.contextMenus.remove.expect('id').andResolve();

    await removeContextMenu('id');

    mockBrowserNode.verify();
  });

  it('browserFamily', () => {
    mockBrowser.runtime.getURL
      .expect('/')
      .andReturn('moz-extension://index.html');
    expect(browserFamily()).toBe('mozilla');

    mockBrowser.runtime.getURL
      .expect('/')
      .andReturn('chrome-extension://index.html');
    expect(browserFamily()).toBe('chromium');

    mockBrowserNode.verify();
  });

  it('openNewTab', async () => {
    mockBrowser.tabs.create
      .expect({ url: 'https://localhost' })
      .andResolve({} as Tabs.Tab);

    await openNewTab('https://localhost');

    mockBrowserNode.verify();
  });

  it('getAllTabs', async () => {
    mockBrowser.tabs.query.expect({}).andResolve([]);

    await getAllTabs();

    mockBrowserNode.verify();
  });

  it('getTabsWithBaseUrl', async () => {
    mockBrowser.tabs.query
      .expect({ url: 'https://localhost/*' })
      .andResolve([]);

    await getTabsWithBaseUrl('https://localhost');

    mockBrowserNode.verify();
  });

  it('getActiveTab', async () => {
    mockBrowser.tabs.query
      .expect({ currentWindow: true, active: true })
      .andResolve([
        {
          index: 0,
          highlighted: true,
          active: true,
          pinned: false,
          incognito: false,
        },
      ]);

    await getActiveTab();

    mockBrowserNode.verify();
  });

  it('getResourceUrl', () => {
    mockBrowser.runtime.getURL.expect('foo').andReturn('');

    getResourceUrl('foo');

    mockBrowserNode.verify();
  });

  it('openOptions', async () => {
    mockBrowser.runtime.openOptionsPage.expect().andResolve();

    await openOptions();

    mockBrowserNode.verify();
  });

  it('openIntro', async () => {
    mockBrowser.runtime.getURL
      .expect('frontend/intro.html')
      .andReturn('https://localhost');
    mockBrowser.tabs.create
      .expect({ url: 'https://localhost' })
      .andResolve({} as Tabs.Tab);

    await openIntro();

    mockBrowserNode.verify();
  });

  it('openPrivacyPolicy', async () => {
    mockBrowser.runtime.getURL
      .expect('frontend/privacy-policy.html')
      .andReturn('https://localhost');
    mockBrowser.tabs.create
      .expect({ url: 'https://localhost' })
      .andResolve({} as Tabs.Tab);

    await openPrivacyPolicy();

    mockBrowserNode.verify();
  });

  it('openSnakeGame', async () => {
    mockBrowser.runtime.getURL
      .expect('frontend/snake-game.html')
      .andReturn('https://localhost');
    mockBrowser.tabs.create
      .expect({ url: 'https://localhost' })
      .andResolve({} as Tabs.Tab);

    await openSnakeGame();

    mockBrowserNode.verify();
  });

  it('openToolbarButtonPopup', async () => {
    mockBrowser.browserAction.openPopup.expect().andResolve();

    await openToolbarButtonPopup();

    mockBrowserNode.verify();
  });

  it('supportsAddressBar', () => {
    mockBrowser.pageAction.mockAllow();
    expect(supportsAddressBar()).toBe(true);
  });

  it('showAddressBarIcon', async () => {
    mockBrowser.pageAction.setTitle
      .expect({ tabId: 42, title: 'foo' })
      .andReturn();
    mockBrowser.pageAction.setIcon
      .expect({ tabId: 42, path: { 16: '16.svg', 32: '32.svg' } })
      .andResolve();
    mockBrowser.pageAction.show.expect(42).andResolve();

    await showAddressBarIcon({ id: 42 } as Tabs.Tab, 'foo', {
      16: '16.svg',
      32: '32.svg',
    });

    mockBrowserNode.verify();
  });

  it('hideAddressBarIcon', async () => {
    mockBrowser.pageAction.setTitle
      .expect({ tabId: 42, title: 'foo' })
      .andReturn();
    mockBrowser.pageAction.setIcon.expect({ tabId: 42 }).andResolve();
    mockBrowser.pageAction.hide.expect(42).andResolve();

    await hideAddressBarIcon({ id: 42 } as Tabs.Tab, 'foo');

    mockBrowserNode.verify();
  });

  it('supportsContainers', () => {
    mockBrowser.contextualIdentities.mockAllow();
    expect(supportsContainers()).toBe(true);
  });

  it('getAllContainers', async () => {
    mockBrowser.contextualIdentities.query.expect({}).andResolve([]);

    await getAllContainers();

    mockBrowserNode.verify();
  });

  it('requestPermissionForPontoon', async () => {
    mockBrowser.permissions.request
      .expect({ origins: ['https://localhost/*'] })
      .andResolve(true);

    const granted = await requestPermissionForPontoon('https://localhost');

    expect(granted).toBe(true);
    mockBrowserNode.verify();
  });

  it('hasPermissions', async () => {
    mockBrowser.permissions.contains
      .expect({ permissions: ['cookies', 'webRequest'] })
      .andResolve(true);

    const result = await hasPermissions('cookies', 'webRequest');

    expect(result).toBe(true);
    mockBrowserNode.verify();
  });

  it('registerScriptForBaseUrl', async () => {
    mockBrowser.contentScripts.register
      .expect({
        js: [{ file: 'foo/bar.js' }],
        matches: ['https://localhost/*'],
        runAt: 'document_end',
      })
      .andResolve({ unregister: jest.fn() });

    await registerScriptForBaseUrl('https://localhost', 'foo/bar.js');

    mockBrowserNode.verify();
  });

  it('executeScript', async () => {
    (
      mockBrowser.tabs.executeScript as unknown as MockzillaDeep<{
        (tabId: number, details: ExtensionTypes.InjectDetails): Promise<
          unknown[]
        >;
      }>
    )
      .expect(42, { file: 'foo/bar.js' })
      .andResolve([]);

    executeScript(42, 'foo/bar.js');

    mockBrowserNode.verify();
  });

  it('callWithInterval', () => {
    (
      mockBrowser.alarms.create as unknown as MockzillaDeep<{
        (name: string, alarmInfo: Alarms.CreateAlarmInfoType): void;
      }>
    )
      .expect('name', { periodInMinutes: 42 })
      .andReturn();
    mockBrowser.alarms.onAlarm.addListener
      .expect(expect.anything())
      .andReturn();

    callWithInterval('name', { periodInMinutes: 42 }, jest.fn());

    mockBrowserNode.verify();
  });

  it('callDelayed', () => {
    (
      mockBrowser.alarms.create as unknown as MockzillaDeep<{
        (name: string, alarmInfo: Alarms.CreateAlarmInfoType): void;
      }>
    )
      .expect(expect.anything(), { delayInMinutes: 0.5 })
      .andReturn();
    mockBrowser.alarms.onAlarm.addListener
      .expect(expect.anything())
      .andReturn();

    callDelayed({ delayInSeconds: 30 }, jest.fn());

    mockBrowserNode.verify();
  });
});
