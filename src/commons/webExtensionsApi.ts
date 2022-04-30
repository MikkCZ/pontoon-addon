import type { Browser } from 'webextension-polyfill';

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const browser = require('webextension-polyfill') as Browser;

export enum BrowserFamily {
  MOZILLA = 'mozilla',
  CHROMIUM = 'chromium',
}

interface StorageContent {
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

export function getResourceUrl(resource: string): string {
  return browser.runtime.getURL(resource);
}

export async function openIntro(): Promise<void> {
  await openNewTab(browser.runtime.getURL('frontend/intro.html'));
}

export async function openPrivacyPolicy(): Promise<void> {
  await openNewTab(browser.runtime.getURL('frontend/privacy-policy.html'));
}

export async function openSnakeGame(): Promise<void> {
  await openNewTab(browser.runtime.getURL('frontend/snake-game.html'));
}

export async function openOptions(): Promise<void> {
  await browser.runtime.openOptionsPage();
}

export async function openToolbarButtonPopup(): Promise<void> {
  await browser.browserAction.openPopup();
}
