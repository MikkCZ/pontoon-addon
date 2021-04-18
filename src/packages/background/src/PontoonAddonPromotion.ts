import type { ContentScripts, Tabs } from 'webextension-polyfill-ts';

import type { RemotePontoon } from './RemotePontoon';
import { browser } from './util/webExtensionsApi';

export class PontoonAddonPromotion {
  private readonly _remotePontoon: RemotePontoon;
  private _contentScript: ContentScripts.RegisteredContentScript | undefined;

  constructor(remotePontoon: RemotePontoon) {
    this._remotePontoon = remotePontoon;
    this._remotePontoon.subscribeToBaseUrlChange(() =>
      this._injectContentScriptIntoAllPontoonTabs()
    );
    this._watchTabUpdates();
    this._injectContentScriptIntoAllPontoonTabs();
  }

  private _watchTabUpdates(): void {
    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && this._isPontoonServer(tab.url)) {
        this._injectContentScript(tab);
      }
    });
  }

  private async _injectContentScriptIntoAllPontoonTabs(): Promise<void> {
    (await browser.tabs.query({}))
      .filter((tab) => this._isPontoonServer(tab.url))
      .forEach((tab) => this._injectContentScript(tab));
  }

  private _isPontoonServer(url: string | undefined): boolean {
    if (url) {
      return url.startsWith(`${this._remotePontoon.getBaseUrl()}/`);
    } else {
      return false;
    }
  }

  private _injectContentScript(tab: Tabs.Tab): void {
    browser.tabs.executeScript(tab.id, {
      file:
        'packages/content-scripts/dist/pontoon-addon-promotion-content-script.js',
    });
  }
}
