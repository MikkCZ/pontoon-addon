/* eslint-disable jest/expect-expect */
import type { MockzillaDeep } from 'mockzilla';
import type { Alarms, ExtensionTypes, Tabs } from 'webextension-polyfill';
import 'mockzilla-webextension';

import { defaultOptionsFor } from '../data/defaultOptions';

import {
  browser,
  browserFamily,
  closeNotification,
  createContextMenu,
  createNotification,
  deleteFromStorage,
  executeScript,
  getAllContainers,
  getAllTabs,
  getFromStorage,
  getOneFromStorage,
  getTabsWithBaseUrl,
  getActiveTab,
  getResourceUrl,
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
  listenToMessages,
  listenToMessagesAndRespond,
  getTabsMatching,
} from '.';

jest.mock('@commons/webExtensionsApi/browser');
jest.mock('@commons/data/defaultOptions');

(defaultOptionsFor as jest.Mock).mockImplementation(() => ({
  locale_team: 'en',
}));

describe('webExtensionsApi', () => {
  it('exports browser', () => {
    expect(browser).toBeTruthy();
  });

  it('getFromStorage', async () => {
    mockBrowser.storage.local.get.expect(['projectsList']).andResolve({});

    await getFromStorage(['projectsList']);
  });

  it('getOneFromStorage', async () => {
    mockBrowser.storage.local.get.expect(['projectsList']).andResolve({});

    await getOneFromStorage('projectsList');
  });

  it('saveToStorage', async () => {
    mockBrowser.storage.local.set.expect({ projectsList: {} }).andResolve();

    await saveToStorage({ projectsList: {} });
  });

  it('deleteFromStorage', async () => {
    mockBrowser.storage.local.remove.expect(['projectsList']).andResolve();

    await deleteFromStorage('projectsList');
  });

  it('createNotification', async () => {
    mockBrowser.notifications.create
      .expect({ type: 'basic', title: 'foo', message: 'bar' })
      .andResolve('id');
    mockBrowser.notifications.onClicked.addListener
      .expect(expect.anything())
      .andReturn();

    await createNotification({ type: 'basic', title: 'foo', message: 'bar' });
  });

  it('closeNotification', async () => {
    mockBrowser.notifications.clear.expect('id').andResolve(true);

    await closeNotification('id');
  });

  it('createContextMenu', () => {
    mockBrowser.contextMenus.create
      .expect({ id: 'foo', title: 'Foo' })
      .andReturn('id');

    createContextMenu({ id: 'foo', title: 'Foo' });
  });

  it('removeContextMenu', async () => {
    mockBrowser.contextMenus.remove.expect('id').andResolve();

    await removeContextMenu('id');
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
  });

  it('openNewTab', async () => {
    mockBrowser.tabs.create
      .expect({ url: 'https://localhost' })
      .andResolve({} as Tabs.Tab);

    await openNewTab('https://localhost');
  });

  it('getAllTabs', async () => {
    mockBrowser.tabs.query.expect({}).andResolve([]);

    await getAllTabs();
  });

  it('getTabsMatching', async () => {
    mockBrowser.tabs.query
      .expect({ url: ['https://localhost/*', 'https://127.0.0.1/*'] })
      .andResolve([]);

    await getTabsMatching('https://localhost/*', 'https://127.0.0.1/*');
  });

  it('getTabsWithBaseUrl', async () => {
    mockBrowser.tabs.query
      .expect({ url: ['https://localhost/*'] })
      .andResolve([]);

    await getTabsWithBaseUrl('https://localhost');
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
  });

  it('getResourceUrl', () => {
    mockBrowser.runtime.getURL.expect('foo').andReturn('');

    getResourceUrl('foo');
  });

  it('openOptions', async () => {
    mockBrowser.runtime.openOptionsPage.expect().andResolve();

    await openOptions();
  });

  it('openIntro', async () => {
    mockBrowser.runtime.getURL
      .expect('frontend/intro.html')
      .andReturn('https://localhost');
    mockBrowser.tabs.create
      .expect({ url: 'https://localhost' })
      .andResolve({} as Tabs.Tab);

    await openIntro();
  });

  it('openPrivacyPolicy', async () => {
    mockBrowser.runtime.getURL
      .expect('frontend/privacy-policy.html')
      .andReturn('https://localhost');
    mockBrowser.tabs.create
      .expect({ url: 'https://localhost' })
      .andResolve({} as Tabs.Tab);

    await openPrivacyPolicy();
  });

  it('openSnakeGame', async () => {
    mockBrowser.runtime.getURL
      .expect('frontend/snake-game.html')
      .andReturn('https://localhost');
    mockBrowser.tabs.create
      .expect({ url: 'https://localhost' })
      .andResolve({} as Tabs.Tab);

    await openSnakeGame();
  });

  it('openToolbarButtonPopup', async () => {
    mockBrowser.action.openPopup.expect().andResolve();

    await openToolbarButtonPopup();
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
  });

  it('hideAddressBarIcon', async () => {
    mockBrowser.pageAction.setTitle
      .expect({ tabId: 42, title: 'foo' })
      .andReturn();
    mockBrowser.pageAction.setIcon.expect({ tabId: 42 }).andResolve();
    mockBrowser.pageAction.hide.expect(42).andResolve();

    await hideAddressBarIcon({ id: 42 } as Tabs.Tab, 'foo');
  });

  it('supportsContainers', () => {
    mockBrowser.contextualIdentities.mockAllow();
    expect(supportsContainers()).toBe(true);
  });

  it('getAllContainers', async () => {
    mockBrowser.contextualIdentities.query.expect({}).andResolve([]);

    await getAllContainers();
  });

  it('requestPermissionForPontoon', async () => {
    mockBrowser.permissions.request
      .expect({ origins: ['https://localhost/*'] })
      .andResolve(true);

    const granted = await requestPermissionForPontoon('https://localhost');

    expect(granted).toBe(true);
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
  });

  it('executeScript', async () => {
    (
      mockBrowser.tabs.executeScript as unknown as MockzillaDeep<{
        (
          tabId: number,
          details: ExtensionTypes.InjectDetails,
        ): Promise<unknown[]>;
      }>
    )
      .expect(42, { file: 'foo/bar.js' })
      .andResolve([]);

    await executeScript(42, 'foo/bar.js');
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
  });

  it('listenToMessages', () => {
    mockBrowser.runtime.onMessage.addListener
      .expect(expect.anything())
      .andReturn();

    listenToMessages<'SEARCH_TEXT_IN_PONTOON'>(
      'search-text-in-pontoon',
      jest.fn(),
    );
  });

  it('listenToMessagesAndRespond', () => {
    mockBrowser.runtime.onMessage.addListener
      .expect(expect.anything())
      .andReturn();

    listenToMessagesAndRespond<'UPDATE_TEAMS_LIST'>(
      'update-teams-list',
      jest.fn(),
    );
  });
});
