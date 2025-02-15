import {
  browser,
  BrowserFamily,
  browserFamily,
  executeScript,
  getTabsMatching,
  openIntro,
  supportsAddressBar,
} from '@commons/webExtensionsApi';

import { init as initPontoonHttpClient } from './httpClients/pontoonHttpClient';
import { initMessageListeners, initOptions } from './RemotePontoon';
import { init as initSystemNotifications } from './systemNotifications';
import {
  init as initToolbarButton,
  initContextMenu as initToolbarButtonContextMenu,
} from './toolbarButton';
import { init as init } from './addressBarIcon';
import { init as initPageContextMenu } from './contextMenu';
import { init as initPageContextButtons } from './contextButtons';
import { init as initPontoonAddonPromotion } from './pontoonAddonPromotion';
import { init as initDataRefresh } from './dataRefresh';

initPontoonHttpClient();
initMessageListeners();
initOptions();

// native system
initSystemNotifications();

// browser UI
initToolbarButton();
if (supportsAddressBar()) {
  init();
}

// pages content
initPageContextButtons();
initPontoonAddonPromotion();

browser.runtime.onStartup.addListener(() => {
  initToolbarButtonContextMenu();
  initPageContextMenu();
});

// inject content scripts after installation
// kudos to https://github.com/fregante/webext-inject-on-install
browser.runtime.onInstalled.addListener(async (details) => {
  // Firefox does that automatically
  if (
    details.reason === 'install' &&
    browserFamily() !== BrowserFamily.MOZILLA
  ) {
    const contentScripts = browser.runtime.getManifest().content_scripts ?? [];
    for (const { matches: urlPatterns, js: files } of contentScripts) {
      for (const matchingTab of await getTabsMatching(...urlPatterns)) {
        for (const file of files ?? []) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          executeScript(matchingTab.id!, file);
        }
      }
    }
  }
});

// For new installations or major updates, open the introduction tour.
browser.runtime.onInstalled.addListener((details) => {
  if (
    details.reason === 'install' ||
    parseInt(details?.previousVersion?.split('.')[0] ?? '') <
      parseInt(browser.runtime.getManifest().version.split('.')[0])
  ) {
    openIntro();
  }
});

initDataRefresh();

console.info('Background context initialized.');
