// TODO: ensure it gets injected only to the Pontoon instance specified in options
import { browser } from '../util/webExtensionsApi';

import { postMessage } from './commons';

function injectScript(src: string) {
  const script = document.createElement('script');
  script.src = browser.runtime.getURL(src);
  document.documentElement.appendChild(script);
}

injectScript(
  'packages/content-scripts/dist/pontoon-addon-promotion-in-page.js'
);
postMessage();
