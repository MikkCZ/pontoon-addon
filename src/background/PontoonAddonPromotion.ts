import {
  executeScript,
  getTabsWithBaseUrl,
  registerScriptForBaseUrl,
} from '@commons/webExtensionsApi';
import { getOneOption, listenToOptionChange } from '@commons/options';

export class PontoonAddonPromotion {
  private unregisterContentScript: () => Promise<void>;

  constructor() {
    this.unregisterContentScript = () => Promise.resolve();
    listenToOptionChange('pontoon_base_url', ({ newValue: pontoonBaseUrl }) => {
      this.registerContentScript(pontoonBaseUrl);
    });
    getOneOption('pontoon_base_url').then((pontoonBaseUrl) => {
      this.registerContentScript(pontoonBaseUrl);
    });
  }

  private async registerContentScript(pontoonBaseUrl: string): Promise<void> {
    const contentScriptFile =
      'content-scripts/pontoon-addon-promotion-content-script.js';
    await this.unregisterContentScript();
    this.unregisterContentScript = (
      await registerScriptForBaseUrl(pontoonBaseUrl, contentScriptFile)
    ).unregister;
    for (const tab of await getTabsWithBaseUrl(pontoonBaseUrl)) {
      if (typeof tab.id !== 'undefined') {
        executeScript(tab.id, contentScriptFile);
      }
    }
  }
}
