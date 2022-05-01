/* eslint-disable jest/expect-expect */
import type { MockzillaDeep } from 'mockzilla';
import type { Notifications, Tabs } from 'webextension-polyfill';

import { mockBrowser, mockBrowserNode } from './test/mockWebExtensionsApi';
import {
  browser,
  browserFamily,
  closeNotification,
  createContextMenu,
  createNotification,
  deleteFromStorage,
  getAllContainers,
  getFromStorage,
  getOneFromStorage,
  getResourceUrl,
  hideAddressBarIcon,
  openIntro,
  openNewTab,
  openOptions,
  openPrivacyPolicy,
  openSnakeGame,
  openToolbarButtonPopup,
  removeContextMenu,
  saveToStorage,
  showAddressBarIcon,
  supportsAddressBar,
  supportsContainers,
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

    await createNotification({ type: 'basic', title: 'foo', message: 'bar' });

    mockBrowserNode.verify();
  });

  it('createNotification with id', async () => {
    (
      mockBrowser.notifications.create as unknown as MockzillaDeep<{
        (
          notificationId: string,
          options: Notifications.CreateNotificationOptions,
        ): Promise<string>;
      }>
    )
      .expect('id', { type: 'basic', title: 'foo', message: 'bar' })
      .andResolve('id');

    await createNotification(
      { type: 'basic', title: 'foo', message: 'bar' },
      'id',
    );

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
});
