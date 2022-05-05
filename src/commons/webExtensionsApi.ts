import type {
  Browser,
  Menus,
  Notifications,
  Storage,
  Tabs,
} from 'webextension-polyfill';

import { BackgroundClientMessageType } from '@background/BackgroundClientMessageType';

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const browser = require('webextension-polyfill') as Browser;

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
  return browser.storage.local.set(toSave);
}

export async function deleteFromStorage<K extends keyof StorageContent>(
  ...storageKeys: K[]
) {
  return browser.storage.local.remove(storageKeys);
}

export async function createNotification(
  options: Notifications.CreateNotificationOptions,
  onClick: (notificationId: string) => void = closeNotification,
) {
  const createdNotificationId = await browser.notifications.create(options);
  if (onClick) {
    browser.notifications.onClicked.addListener((clickedNotificationId) => {
      if (clickedNotificationId === createdNotificationId) {
        onClick(clickedNotificationId);
      }
    });
  }
}

export async function closeNotification(notificationId: string) {
  return browser.notifications.clear(notificationId);
}

export function createContextMenu(
  createProperties: Menus.CreateCreatePropertiesType,
) {
  return browser.contextMenus.create(createProperties);
}

export async function removeContextMenu(menuItemId: number | string) {
  return browser.contextMenus.remove(menuItemId);
}

export function browserFamily(): BrowserFamily {
  if (browser.runtime.getURL('/').startsWith('moz-extension://')) {
    return BrowserFamily.MOZILLA;
  } else {
    return BrowserFamily.CHROMIUM;
  }
}

export async function openNewTab(url: string) {
  return browser.tabs.create({ url });
}

export async function getAllTabs() {
  return browser.tabs.query({});
}

export async function getTabsWithBaseUrl(baseUrl: string) {
  return browser.tabs.query({ url: `${baseUrl}/*` });
}

export async function listenToTabsCompletedLoading(
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
  return browser.runtime.openOptionsPage();
}

export async function openIntro() {
  return openNewTab(browser.runtime.getURL('frontend/intro.html'));
}

export async function openPrivacyPolicy() {
  return openNewTab(browser.runtime.getURL('frontend/privacy-policy.html'));
}

export async function openSnakeGame() {
  return openNewTab(browser.runtime.getURL('frontend/snake-game.html'));
}

export async function openToolbarButtonPopup() {
  return browser.browserAction.openPopup();
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
    return browser.contextualIdentities.query({});
  } else {
    return [];
  }
}

export async function requestPermissionForPontoon(pontoonBaseUrl: string) {
  return browser.permissions.request({ origins: [`${pontoonBaseUrl}/*`] });
}

export async function registerScriptForBaseUrl(baseUrl: string, file: string) {
  return browser.contentScripts.register({
    js: [{ file }],
    matches: [`${baseUrl}/*`],
    runAt: 'document_end', // Corresponds to interactive. The DOM has finished loading, but resources such as scripts and images may still be loading.
  });
}

export async function executeScript(tabId: number, file: string) {
  return browser.tabs.executeScript(tabId, { file });
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

export function listenToMessages<T extends BackgroundClientMessageType>(
  type: T,
  action: (message: any, sender: { tab?: Tabs.Tab; url?: string }) => void,
) {
  browser.runtime.onMessage.addListener((message, sender) => {
    if (message.type === type) {
      // no return to allow all listeners to react on the message
      action(message, sender);
    }
  });
}

export function listenToMessagesExclusively<
  T extends BackgroundClientMessageType,
>(
  type: T,
  action: (
    message: any,
    sender: { tab?: Tabs.Tab; url?: string },
  ) => Promise<unknown>,
) {
  browser.runtime.onMessage.addListener((message, sender) => {
    if (message.type === type) {
      // only one listener can send a response
      return action(message, sender);
    }
  });
}
