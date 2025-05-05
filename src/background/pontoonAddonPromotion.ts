import {
  executeScript,
  getTabsWithBaseUrl,
  registerScriptForBaseUrl,
} from '@commons/webExtensionsApi';
import { getOneOption, listenToOptionChange } from '@commons/options';
import { doAsync } from '@commons/utils';

const CONTENT_SCRIPT =
  'content-scripts/pontoon-addon-promotion-content-script.js';

export function init() {
  listenToOptionChange('pontoon_base_url', ({ newValue: pontoonBaseUrl }) => {
    registerContentScript(pontoonBaseUrl);
  });
  doAsync(async () => {
    registerContentScript(await getOneOption('pontoon_base_url'));
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
