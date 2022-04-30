import type { Browser } from 'webextension-polyfill';

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const browser = require('webextension-polyfill') as Browser;

export enum BrowserFamily {
  MOZILLA = 'mozilla',
  CHROMIUM = 'chromium',
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

export async function getResourceUrl(resource: string): Promise<string> {
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
