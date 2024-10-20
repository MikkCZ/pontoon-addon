/* eslint-disable jest/expect-expect */
import type { Tabs } from 'webextension-polyfill';

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

jest.mock('@commons/data/defaultOptions');

(defaultOptionsFor as jest.Mock).mockReturnValue({ locale_team: 'en' });

describe('webExtensionsApi', () => {
  it('exports browser', () => {
    expect(browser).toBeTruthy();
  });

  it('getFromStorage', async () => {
    (browser.storage.local.get as jest.Mock).mockResolvedValueOnce({});

    await getFromStorage(['projectsList']);

    expect(browser.storage.local.get).toHaveBeenCalledWith(['projectsList']);
  });

  it('getOneFromStorage', async () => {
    (browser.storage.local.get as jest.Mock).mockResolvedValueOnce({});

    await getOneFromStorage('projectsList');

    expect(browser.storage.local.get).toHaveBeenCalledWith(['projectsList']);
  });

  it('saveToStorage', async () => {
    (browser.storage.local.set as jest.Mock).mockResolvedValueOnce(undefined);

    await saveToStorage({ projectsList: {} });

    expect(browser.storage.local.set).toHaveBeenCalledWith({
      projectsList: {},
    });
  });

  it('deleteFromStorage', async () => {
    (browser.storage.local.remove as jest.Mock).mockResolvedValueOnce(
      undefined,
    );

    await deleteFromStorage('projectsList');

    expect(browser.storage.local.remove).toHaveBeenCalledWith(['projectsList']);
  });

  it('createNotification', async () => {
    (browser.notifications.create as jest.Mock).mockResolvedValueOnce('id');
    (
      browser.notifications.onClicked.addListener as jest.Mock
    ).mockReturnValueOnce(undefined);

    await createNotification({ type: 'basic', title: 'foo', message: 'bar' });

    expect(browser.notifications.create).toHaveBeenCalledWith({
      type: 'basic',
      title: 'foo',
      message: 'bar',
    });
    expect(browser.notifications.onClicked.addListener).toHaveBeenCalled();
  });

  it('closeNotification', async () => {
    (browser.notifications.clear as jest.Mock).mockResolvedValueOnce(true);

    await closeNotification('id');

    expect(browser.notifications.clear).toHaveBeenCalledWith('id');
  });

  it('createContextMenu', () => {
    (browser.contextMenus.create as jest.Mock).mockReturnValueOnce('id');

    createContextMenu({ title: 'foo' });

    expect(browser.contextMenus.create).toHaveBeenCalledWith({ title: 'foo' });
  });

  it('removeContextMenu', async () => {
    (browser.contextMenus.remove as jest.Mock).mockResolvedValueOnce(undefined);

    await removeContextMenu('id');

    expect(browser.contextMenus.remove).toHaveBeenCalledWith('id');
  });

  it('browserFamily mozilla', () => {
    (browser.runtime.getURL as jest.Mock).mockReturnValueOnce(
      'moz-extension://index.html',
    );

    const family = browserFamily();

    expect(family).toBe('mozilla');
    expect(browser.runtime.getURL).toHaveBeenCalledWith('/');
  });

  it('browserFamily chromium', () => {
    (browser.runtime.getURL as jest.Mock).mockReturnValueOnce(
      'chrome-extension://index.html',
    );

    const family = browserFamily();

    expect(family).toBe('chromium');
    expect(browser.runtime.getURL).toHaveBeenCalledWith('/');
  });

  it('openNewTab', async () => {
    (browser.tabs.create as jest.Mock).mockResolvedValueOnce({} as Tabs.Tab);

    await openNewTab('https://localhost');

    expect(browser.tabs.create).toHaveBeenCalledWith({
      url: 'https://localhost',
    });
  });

  it('getAllTabs', async () => {
    (browser.tabs.query as jest.Mock).mockResolvedValueOnce([]);

    await getAllTabs();

    expect(browser.tabs.query).toHaveBeenCalledWith({});
  });

  it('getTabsMatching', async () => {
    (browser.tabs.query as jest.Mock).mockResolvedValueOnce([]);

    await getTabsMatching('https://localhost/*', 'https://127.0.0.1/*');

    expect(browser.tabs.query).toHaveBeenCalledWith({
      url: ['https://localhost/*', 'https://127.0.0.1/*'],
    });
  });

  it('getTabsWithBaseUrl', async () => {
    (browser.tabs.query as jest.Mock).mockResolvedValueOnce([]);

    await getTabsWithBaseUrl('https://localhost');

    expect(browser.tabs.query).toHaveBeenCalledWith({
      url: ['https://localhost/*'],
    });
  });

  it('getActiveTab', async () => {
    (browser.tabs.query as jest.Mock).mockResolvedValueOnce([
      {
        index: 0,
        highlighted: true,
        active: true,
        pinned: false,
        incognito: false,
      },
    ]);

    await getActiveTab();

    expect(browser.tabs.query).toHaveBeenCalledWith({
      currentWindow: true,
      active: true,
    });
  });

  it('getResourceUrl', () => {
    (browser.runtime.getURL as jest.Mock).mockReturnValueOnce('');

    getResourceUrl('foo');

    expect(browser.runtime.getURL).toHaveBeenCalledWith('foo');
  });

  it('openOptions', async () => {
    (browser.runtime.openOptionsPage as jest.Mock).mockResolvedValueOnce(
      undefined,
    );

    await openOptions();

    expect(browser.runtime.openOptionsPage).toHaveBeenCalledWith();
  });

  it('openIntro', async () => {
    (browser.runtime.getURL as jest.Mock).mockReturnValueOnce(
      'https://localhost/intro',
    );
    (browser.tabs.create as jest.Mock).mockResolvedValueOnce({} as Tabs.Tab);

    await openIntro();

    expect(browser.runtime.getURL).toHaveBeenCalledWith('frontend/intro.html');
    expect(browser.tabs.create).toHaveBeenCalledWith({
      url: 'https://localhost/intro',
    });
  });

  it('openPrivacyPolicy', async () => {
    (browser.runtime.getURL as jest.Mock).mockReturnValueOnce(
      'https://localhost/privacy-policy',
    );
    (browser.tabs.create as jest.Mock).mockResolvedValueOnce({} as Tabs.Tab);

    await openPrivacyPolicy();

    expect(browser.runtime.getURL).toHaveBeenCalledWith(
      'frontend/privacy-policy.html',
    );
    expect(browser.tabs.create).toHaveBeenCalledWith({
      url: 'https://localhost/privacy-policy',
    });
  });

  it('openSnakeGame', async () => {
    (browser.runtime.getURL as jest.Mock).mockReturnValueOnce(
      'https://localhost/snake-game',
    );
    (browser.tabs.create as jest.Mock).mockResolvedValueOnce({} as Tabs.Tab);

    await openSnakeGame();

    expect(browser.runtime.getURL).toHaveBeenCalledWith(
      'frontend/snake-game.html',
    );
    expect(browser.tabs.create).toHaveBeenCalledWith({
      url: 'https://localhost/snake-game',
    });
  });

  it('openToolbarButtonPopup', async () => {
    (browser.browserAction.openPopup as jest.Mock).mockResolvedValueOnce(
      undefined,
    );

    await openToolbarButtonPopup();

    expect(browser.browserAction.openPopup).toHaveBeenCalled();
  });

  it('supportsAddressBar', () => {
    expect(supportsAddressBar()).toBe(true);
  });

  it('showAddressBarIcon', async () => {
    (browser.pageAction.setTitle as jest.Mock).mockReturnValueOnce(undefined);
    (browser.pageAction.setIcon as jest.Mock).mockResolvedValueOnce(undefined);
    (browser.pageAction.show as jest.Mock).mockResolvedValueOnce(undefined);

    await showAddressBarIcon({ id: 42 } as Tabs.Tab, 'foo', {
      16: '16.svg',
      32: '32.svg',
    });

    expect(browser.pageAction.setTitle).toHaveBeenCalledWith({
      tabId: 42,
      title: 'foo',
    });
    expect(browser.pageAction.setIcon).toHaveBeenCalledWith({
      tabId: 42,
      path: { 16: '16.svg', 32: '32.svg' },
    });
    expect(browser.pageAction.show).toHaveBeenCalledWith(42);
  });

  it('hideAddressBarIcon', async () => {
    (browser.pageAction.setTitle as jest.Mock).mockReturnValueOnce(undefined);
    (browser.pageAction.setIcon as jest.Mock).mockResolvedValueOnce(undefined);
    (browser.pageAction.hide as jest.Mock).mockResolvedValueOnce(undefined);

    await hideAddressBarIcon({ id: 42 } as Tabs.Tab, 'foo');

    expect(browser.pageAction.setTitle).toHaveBeenCalledWith({
      tabId: 42,
      title: 'foo',
    });
    expect(browser.pageAction.setIcon).toHaveBeenCalledWith({ tabId: 42 });
    expect(browser.pageAction.hide).toHaveBeenCalledWith(42);
  });

  it('supportsContainers', () => {
    expect(supportsContainers()).toBe(true);
  });

  it('getAllContainers', async () => {
    (browser.contextualIdentities.query as jest.Mock).mockResolvedValueOnce([]);

    await getAllContainers();

    expect(browser.contextualIdentities.query).toHaveBeenCalledWith({});
  });

  it('requestPermissionForPontoon', async () => {
    (browser.permissions.request as jest.Mock).mockResolvedValueOnce(true);

    const granted = await requestPermissionForPontoon('https://localhost');

    expect(granted).toBe(true);
    expect(browser.permissions.request).toHaveBeenCalledWith({
      origins: ['https://localhost/*'],
    });
  });

  it('registerScriptForBaseUrl', async () => {
    (browser.contentScripts.register as jest.Mock).mockResolvedValueOnce({
      unregister: jest.fn(),
    });

    await registerScriptForBaseUrl('https://localhost', 'foo/bar.js');

    expect(browser.contentScripts.register).toHaveBeenCalledWith({
      js: [{ file: 'foo/bar.js' }],
      matches: ['https://localhost/*'],
      runAt: 'document_end',
    });
  });

  it('executeScript', async () => {
    (browser.tabs.executeScript as jest.Mock).mockResolvedValueOnce([]);

    await executeScript(42, 'foo/bar.js');

    expect(browser.tabs.executeScript).toHaveBeenCalledWith(42, {
      file: 'foo/bar.js',
    });
  });

  it('callWithInterval', () => {
    (browser.alarms.create as jest.Mock).mockReturnValueOnce(undefined);
    (browser.alarms.onAlarm.addListener as jest.Mock).mockReturnValueOnce(
      undefined,
    );

    callWithInterval('name', { periodInMinutes: 42 }, jest.fn());

    expect(browser.alarms.create).toHaveBeenCalledWith('name', {
      periodInMinutes: 42,
    });
    expect(browser.alarms.onAlarm.addListener).toHaveBeenCalled();
  });

  it('callDelayed', () => {
    (browser.alarms.create as jest.Mock).mockReturnValueOnce(undefined);
    (browser.alarms.onAlarm.addListener as jest.Mock).mockReturnValueOnce(
      undefined,
    );

    callDelayed({ delayInSeconds: 30 }, jest.fn());

    expect(browser.alarms.create).toHaveBeenCalledWith(expect.anything(), {
      delayInMinutes: 0.5,
    });
    expect(browser.alarms.onAlarm.addListener).toHaveBeenCalled();
  });

  it('listenToMessages', () => {
    (browser.runtime.onMessage.addListener as jest.Mock).mockReturnValueOnce(
      undefined,
    );

    listenToMessages<'SEARCH_TEXT_IN_PONTOON'>(
      'search-text-in-pontoon',
      jest.fn(),
    );

    expect(browser.runtime.onMessage.addListener).toHaveBeenCalled();
  });

  it('listenToMessagesAndRespond', () => {
    (browser.runtime.onMessage.addListener as jest.Mock).mockReturnValueOnce(
      undefined,
    );

    listenToMessagesAndRespond<'UPDATE_TEAMS_LIST'>(
      'update-teams-list',
      jest.fn(),
    );

    expect(browser.runtime.onMessage.addListener).toHaveBeenCalled();
  });
});
