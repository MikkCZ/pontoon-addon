import { browser } from '@commons/webExtensionsApi';

import { pontoonAddonInfo } from './commons';

function injectScript(src: string) {
  const script = document.createElement('script');
  script.src = browser.runtime.getURL(src);
  document.head.prepend(script);
}

async function postMessage(): Promise<void> {
  window.postMessage(
    {
      _type: 'PontoonAddonInfo',
      value: pontoonAddonInfo,
    },
    '*', // required to work for localhost:<port> (<port> may not be part of the baseUrl)
  );
}

injectScript('content-scripts/pontoon-addon-promotion-in-page.js');
postMessage();
