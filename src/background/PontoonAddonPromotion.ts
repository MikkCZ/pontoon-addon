import URI from 'urijs';
import type { ContentScripts } from 'webextension-polyfill';

import { browser } from '@commons/webExtensionsApi';

import type { RemotePontoon } from './RemotePontoon';

export class PontoonAddonPromotion {
  private readonly remotePontoon: RemotePontoon;
  private contentScript: ContentScripts.RegisteredContentScript | undefined;

  constructor(remotePontoon: RemotePontoon) {
    this.remotePontoon = remotePontoon;
    this.remotePontoon.subscribeToBaseUrlChange(() => {
      this.registerContentScript();
    });
    this.registerContentScript();
  }

  private async registerContentScript(): Promise<void> {
    const contentScriptInfo = {
      file: 'content-scripts/pontoon-addon-promotion-content-script.js',
    };
    await this.contentScript?.unregister();
    this.contentScript = await browser.contentScripts.register({
      js: [contentScriptInfo],
      matches: [`${URI(this.remotePontoon.getBaseUrl()).port('').valueOf()}*`],
      runAt: 'document_end', // Corresponds to interactive. The DOM has finished loading, but resources such as scripts and images may still be loading.
    });
    (await browser.tabs.query({}))
      .filter((tab) => this.isPontoonServer(tab.url))
      .forEach((tab) => browser.tabs.executeScript(tab.id, contentScriptInfo));
  }

  private isPontoonServer(url: string | undefined): boolean {
    if (url) {
      return URI(url)
        .port('')
        .valueOf()
        .startsWith(URI(this.remotePontoon.getBaseUrl()).port('').valueOf());
    } else {
      return false;
    }
  }
}
