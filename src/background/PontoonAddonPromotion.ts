import URI from 'urijs';
import type { ContentScripts, Tabs } from 'webextension-polyfill';

import { browser } from '@commons/webExtensionsApi';
import { getOneOption, listenToOptionChange } from '@commons/options';

export class PontoonAddonPromotion {
  private contentScript: ContentScripts.RegisteredContentScript | undefined;

  constructor() {
    listenToOptionChange('pontoon_base_url', ({ newValue: pontoonBaseUrl }) => {
      this.registerContentScript(pontoonBaseUrl);
    });
    getOneOption('pontoon_base_url').then((pontoonBaseUrl) => {
      this.registerContentScript(pontoonBaseUrl);
    });
  }

  private async registerContentScript(pontoonBaseUrl: string): Promise<void> {
    const contentScriptInfo = {
      file: 'content-scripts/pontoon-addon-promotion-content-script.js',
    };
    await this.contentScript?.unregister();
    this.contentScript = await browser.contentScripts.register({
      js: [contentScriptInfo],
      matches: [`${URI(pontoonBaseUrl).port('').valueOf()}*`],
      runAt: 'document_end', // Corresponds to interactive. The DOM has finished loading, but resources such as scripts and images may still be loading.
    });
    const tabs = await browser.tabs.query({});
    for (const tab of tabs) {
      if (this.isPontoonServer(tab, pontoonBaseUrl)) {
        browser.tabs.executeScript(tab.id, contentScriptInfo);
      }
    }
  }

  private isPontoonServer(tab: Tabs.Tab, pontoonBaseUrl: string): boolean {
    if (tab.url) {
      return URI(tab.url)
        .port('')
        .valueOf()
        .startsWith(URI(pontoonBaseUrl).port('').valueOf());
    } else {
      return false;
    }
  }
}
