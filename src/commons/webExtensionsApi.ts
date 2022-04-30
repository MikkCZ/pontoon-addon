import type {
  Browser,
  ContextualIdentities,
  Tabs,
} from 'webextension-polyfill';

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

export async function getFromStorage<K extends keyof StorageContent>(
  storageKeys: K[],
): Promise<StorageResult<K>> {
  return (await browser.storage.local.get(storageKeys)) as StorageResult<K>;
}

export async function getOneFromStorage<T = unknown>(
  storageKey: keyof StorageContent,
): Promise<T | undefined> {
  return (await getFromStorage([storageKey]))[storageKey] as unknown as T;
}

export async function saveToStorage(
  toSave: Partial<StorageContent>,
): Promise<void> {
  await browser.storage.local.set(toSave);
}

export async function deleteFromStorage<K extends keyof StorageContent>(
  ...storageKeys: K[]
) {
  await browser.storage.local.remove(storageKeys);
}

export const { create: createNotification, clear: closeNotification } =
  browser.notifications;

export const { create: createContextMenu, remove: removeContextMenu } =
  browser.contextMenus;

export function browserFamily(): BrowserFamily {
  if (browser.runtime.getURL('/').startsWith('moz-extension:')) {
    return BrowserFamily.MOZILLA;
  } else {
    return BrowserFamily.CHROMIUM;
  }
}

export async function openNewTab(url: string): Promise<void> {
  await browser.tabs.create({ url });
}

export const { getURL: getResourceUrl, openOptionsPage: openOptions } =
  browser.runtime;

export async function openIntro(): Promise<void> {
  await openNewTab(browser.runtime.getURL('frontend/intro.html'));
}

export async function openPrivacyPolicy(): Promise<void> {
  await openNewTab(browser.runtime.getURL('frontend/privacy-policy.html'));
}

export async function openSnakeGame(): Promise<void> {
  await openNewTab(browser.runtime.getURL('frontend/snake-game.html'));
}

export const { openPopup: openToolbarButtonPopup } = browser.browserAction;

export function supportsAddressBar(): boolean {
  return !!browser.pageAction;
}

export async function showAddressBarIcon(
  tab: Tabs.Tab,
  title: string,
  icons: { 16: string; 32: string },
): Promise<void> {
  if (supportsAddressBar() && tab.id) {
    const tabId = tab.id;
    browser.pageAction.setTitle({ tabId, title });
    await browser.pageAction.setIcon({ tabId, path: icons });
    await browser.pageAction.show(tabId);
  }
}

export async function hideAddressBarIcon(
  tab: Tabs.Tab,
  title: string,
): Promise<void> {
  if (supportsAddressBar() && tab.id) {
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

export async function getAllContainers(): Promise<
  ContextualIdentities.ContextualIdentity[]
> {
  if (supportsContainers()) {
    return browser.contextualIdentities.query({});
  } else {
    return [];
  }
}
