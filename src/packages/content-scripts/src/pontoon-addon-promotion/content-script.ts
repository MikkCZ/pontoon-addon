import { BackgroundPontoonClient } from '@pontoon-addon/commons/src/BackgroundPontoonClient';

import { browser } from '../util/webExtensionsApi';

import { pontoonAddonInfo } from './commons';

const backgroundPontoonClient = new BackgroundPontoonClient();

function injectScript(src: string) {
  const script = document.createElement('script');
  script.src = browser.runtime.getURL(src);
  document.documentElement.appendChild(script);
}

async function postMessage(): Promise<void> {
  window.postMessage(
    JSON.stringify({
      _type: 'PontoonAddonInfo',
      value: pontoonAddonInfo,
    }),
    await backgroundPontoonClient.getBaseUrl()
  );
}

injectScript(
  'packages/content-scripts/dist/pontoon-addon-promotion-in-page.js'
);
postMessage();
