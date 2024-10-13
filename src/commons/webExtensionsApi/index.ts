import type {
  Menus,
  Notifications,
  Runtime,
  Storage,
  Tabs,
} from 'webextension-polyfill';
import { v4 as uuidv4 } from 'uuid';

import { hash } from '@commons/utils';

import type {
  BackgroundMessagesWithResponse,
  BackgroundMessagesWithoutResponse,
} from '../backgroundMessaging';

import { default as browserObj } from './browser';

export const browser = browserObj;

export enum BrowserFamily {
  MOZILLA = 'mozilla',
  CHROMIUM = 'chromium',
}

export interface StorageContent {
  projectsList: {
    [slug: string]: {
      slug: string;
      name: string;
      domains: string[];
    };
  };
  teamsList: {
    [code: string]: {
      code: string;
      name: string;
      strings: {
        approvedStrings: number;
        pretranslatedStrings: number;
        stringsWithWarnings: number;
        stringsWithErrors: number;
        missingStrings: number;
        unreviewedStrings: number;
        totalStrings: number;
      };
      bz_component: string;
    };
  };
  notificationsDataLoadingState: 'loading' | 'loaded' | 'error' | undefined;
  notificationsData: {
    [id: number]: {
      id: number;
      unread: boolean;
      actor?: {
        anchor: string;
        url: string;
      };
      target?: {
        anchor: string;
        url: string;
      };
      verb?: string;
      description?: {
        safe: boolean;
        content?: string;
        is_comment?: boolean;
      };
      date_iso?: string;
    };
  };
  lastUnreadNotificationId: number;
  latestTeamsActivity: {
    [code: string]: {
      team: string;
      user: string;
      date_iso?: string;
    };
  };
}

type StorageResult<K extends keyof StorageContent> = Partial<
  Pick<StorageContent, K>
>;

interface StorageChange<K extends keyof StorageContent>
  extends Storage.StorageChange {
  oldValue?: StorageResult<K>[K];
  newValue?: StorageResult<K>[K];
}

export interface ContextMenuItemProperties
  extends Menus.CreateCreatePropertiesType {
  id: NonNullable<Menus.CreateCreatePropertiesType['id']>;
  onclick?: (
    info: Parameters<
      NonNullable<Menus.CreateCreatePropertiesType['onclick']>
    >[0],
    tab?: Parameters<
      NonNullable<Menus.CreateCreatePropertiesType['onclick']>
    >[1],
  ) => void;
}

export async function getFromStorage<K extends keyof StorageContent>(
  storageKeys: K[],
): Promise<StorageResult<K>> {
  return (await browser.storage.local.get(storageKeys)) as StorageResult<K>;
}

export async function getOneFromStorage<K extends keyof StorageContent>(
  storageKey: K,
): Promise<StorageResult<K>[K]> {
  return (await getFromStorage([storageKey]))[
    storageKey
  ] as StorageResult<K>[K];
}

export function listenToStorageChange<K extends keyof StorageContent>(
  storageKey: K,
  listener: (change: StorageChange<K>) => void,
) {
  return browser.storage.onChanged.addListener((changes, _areaName) => {
    if (changes[storageKey]) {
      listener(changes[storageKey] as StorageChange<K>);
    }
  });
}

export async function saveToStorage(toSave: Partial<StorageContent>) {
  return await browser.storage.local.set(toSave);
}

export async function deleteFromStorage<K extends keyof StorageContent>(
  ...storageKeys: K[]
) {
  return await browser.storage.local.remove(storageKeys);
}

export function createNotification(
  options: Notifications.CreateNotificationOptions,
  onClick: (notificationId: string) => void = closeNotification,
) {
  const notificationId = uuidv4();
  if (typeof onClick === 'function') {
    browser.notifications.onClicked.addListener((clickedNotificationId) => {
      if (clickedNotificationId === notificationId) {
        onClick(clickedNotificationId);
      }
    });
  }
  browser.notifications.create(notificationId, options);
}

export async function closeNotification(notificationId: string) {
  return await browser.notifications.clear(notificationId);
}

export function createContextMenu(createProperties: ContextMenuItemProperties) {
  const { onclick, ...declarativeCreateProperties } = createProperties;
  if (typeof onclick === 'function') {
    browser.contextMenus.onClicked.addListener((info, tab) => {
      if (info.menuItemId === declarativeCreateProperties.id) {
        onclick(info, tab);
      }
    });
  }
  return browser.contextMenus.create(declarativeCreateProperties);
}

export async function removeContextMenu(menuItemId: number | string) {
  return await browser.contextMenus.remove(menuItemId);
}

export function browserFamily(): BrowserFamily {
  if (browser.runtime.getURL('/').startsWith('moz-extension://')) {
    return BrowserFamily.MOZILLA;
  } else {
    return BrowserFamily.CHROMIUM;
  }
}

export async function openNewTab(url: string) {
  return await browser.tabs.create({ url });
}

export async function getAllTabs() {
  return await browser.tabs.query({});
}

export async function getTabsMatching(...patterns: string[]) {
  return await browser.tabs.query({ url: patterns });
}

export async function getTabsWithBaseUrl(baseUrl: string) {
  return await getTabsMatching(`${baseUrl}/*`);
}

export async function getActiveTab(): Promise<Tabs.Tab> {
  return (await browser.tabs.query({ currentWindow: true, active: true }))[0];
}

export function listenToTabsCompletedLoading(
  listener: (tab: Tabs.Tab & { id: number }) => void,
) {
  browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
      listener({ ...tab, id: tabId });
    }
  });
}

export function getResourceUrl(path: string) {
  return browser.runtime.getURL(path);
}

export async function openOptions() {
  return await browser.runtime.openOptionsPage();
}

export async function openIntro() {
  return await openNewTab(browser.runtime.getURL('frontend/intro.html'));
}

export async function openPrivacyPolicy() {
  return await openNewTab(
    browser.runtime.getURL('frontend/privacy-policy.html'),
  );
}

export async function openSnakeGame() {
  return await openNewTab(browser.runtime.getURL('frontend/snake-game.html'));
}

export async function openToolbarButtonPopup() {
  return await (browser.action ?? browser.browserAction).openPopup();
}

export function supportsAddressBar(): boolean {
  return !!browser.pageAction;
}

export async function showAddressBarIcon(
  tab: Tabs.Tab,
  title: string,
  icons: { 16: string; 32: string },
) {
  if (supportsAddressBar() && typeof tab.id !== 'undefined') {
    const tabId = tab.id;
    browser.pageAction.setTitle({ tabId, title });
    await browser.pageAction.setIcon({ tabId, path: icons });
    await browser.pageAction.show(tabId);
  }
}

export async function hideAddressBarIcon(tab: Tabs.Tab, title: string) {
  if (supportsAddressBar() && typeof tab.id !== 'undefined') {
    const tabId = tab.id;
    await Promise.all([
      browser.pageAction.hide(tabId),
      browser.pageAction.setTitle({ tabId, title }),
      browser.pageAction.setIcon({ tabId }),
    ]);
  }
}

export function supportsContainers(): boolean {
  return !!browser.contextualIdentities;
}

export async function getAllContainers() {
  if (supportsContainers()) {
    return await browser.contextualIdentities.query({});
  } else {
    return [];
  }
}

export async function requestPermissionForPontoon(pontoonBaseUrl: string) {
  return await browser.permissions.request({
    origins: [`${pontoonBaseUrl}/*`],
  });
}

export async function registerScriptForBaseUrl(
  baseUrl: string,
  file: string,
): Promise<void> {
  const matches = [`${baseUrl}/*`];
  const runAt = 'document_end'; // Corresponds to interactive. The DOM has finished loading, but resources such as scripts and images may still be loading.
  if (typeof browser.contentScripts?.register === 'function') {
    await browser.contentScripts.register({
      js: [{ file }],
      matches,
      runAt,
    });
  } else if (typeof browser.scripting?.registerContentScripts === 'function') {
    await browser.scripting.registerContentScripts([
      {
        id: await hash(`${baseUrl}_${file}`),
        js: [file],
        matches,
        runAt,
      },
    ]);
  } else {
    console.error(`No extension API found to register content scripts.`);
  }
}

export async function executeScript(tabId: number, file: string) {
  if (typeof browser.tabs?.executeScript === 'function') {
    return await browser.tabs.executeScript(tabId, { file });
  } else if (typeof browser.scripting?.executeScript === 'function') {
    return await browser.scripting.executeScript({
      target: { tabId },
      files: [file],
    });
  } else {
    console.error(`No extension API found to execute content scripts.`);
  }
}

export function callWithInterval(
  name: string,
  interval: { periodInMinutes: number },
  action: () => void,
) {
  browser.alarms.create(name, interval);
  browser.alarms.onAlarm.addListener(({ name: triggeredAlarmName }) => {
    if (triggeredAlarmName === name) {
      action();
    }
  });
}

export function callDelayed(
  delay: { delayInSeconds: number },
  action: () => void,
) {
  const name = Math.random().toString(16).substring(2);
  browser.alarms.create(name, { delayInMinutes: delay.delayInSeconds / 60 });
  browser.alarms.onAlarm.addListener(({ name: triggeredAlarmName }) => {
    if (triggeredAlarmName === name) {
      action();
    }
  });
}

export function listenToMessages<
  T extends keyof BackgroundMessagesWithoutResponse,
>(
  type: BackgroundMessagesWithoutResponse[T]['message']['type'],
  action: (
    message: BackgroundMessagesWithoutResponse[T]['message'],
    sender: Pick<Runtime.MessageSender, 'tab' | 'url'>,
  ) => void | Promise<void>,
) {
  browser.runtime.onMessage.addListener((message, sender) => {
    const typedMessade =
      message as BackgroundMessagesWithoutResponse[T]['message'];
    if (typedMessade.type === type) {
      // no return to allow all listeners to react on the message
      action(typedMessade, sender);
    }
    // always check check other actions if they are subscribed for this message
    return undefined;
  });
}

export function listenToMessagesAndRespond<
  T extends keyof BackgroundMessagesWithResponse,
>(
  type: BackgroundMessagesWithResponse[T]['message']['type'],
  action: (
    message: BackgroundMessagesWithResponse[T]['message'],
    sender: Pick<Runtime.MessageSender, 'tab' | 'url'>,
  ) => Promise<BackgroundMessagesWithResponse[T]['response']>,
) {
  browser.runtime.onMessage.addListener((message, sender) => {
    const typedMessade =
      message as BackgroundMessagesWithResponse[T]['message'];
    if (typedMessade.type === type) {
      // only one listener can send a response
      return action(typedMessade, sender);
    } else {
      // let other actions check if they are subscribed for this message
      return undefined;
    }
  });
}
