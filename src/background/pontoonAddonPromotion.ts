import {
  executeScript,
  getTabsWithBaseUrl,
  registerScriptForBaseUrl,
} from '@commons/webExtensionsApi';
import { getOneOption, listenToOptionChange } from '@commons/options';

const CONTENT_SCRIPT =
  'content-scripts/pontoon-addon-promotion-content-script.js';

export function setupIntegrationWithPontoonAddonPromotion() {
  listenToOptionChange('pontoon_base_url', ({ newValue: pontoonBaseUrl }) => {
    registerContentScript(pontoonBaseUrl);
  });
  getOneOption('pontoon_base_url').then((pontoonBaseUrl) => {
    registerContentScript(pontoonBaseUrl);
  });
}

async function registerContentScript(pontoonBaseUrl: string) {
  await registerScriptForBaseUrl(pontoonBaseUrl, CONTENT_SCRIPT);
  for (const tab of await getTabsWithBaseUrl(pontoonBaseUrl)) {
    if (typeof tab.id !== 'undefined') {
      executeScript(tab.id, CONTENT_SCRIPT);
    }
  }
}
