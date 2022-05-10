import {
  browser,
  BrowserFamily,
  browserFamily,
  executeScript,
  getTabsMatching,
  openIntro,
  supportsAddressBar,
} from '@commons/webExtensionsApi';

import { listenToMessagesFromClients } from './RemotePontoon';
import { setupSystemNotifications } from './systemNotifications';
import { setupToolbarButton } from './toolbarButton';
import { setupAddressBarIcon } from './addressBarIcon';
import { setupPageContextMenus } from './contextMenu';
import { setupPageContextButtons } from './contextButtons';
import { setupIntegrationWithPontoonAddonPromotion } from './pontoonAddonPromotion';
import { setupDataRefresh } from './dataRefresh';

listenToMessagesFromClients();

// native system
setupSystemNotifications();

// browser UI
setupToolbarButton();
if (supportsAddressBar()) {
  setupAddressBarIcon();
}
setupPageContextMenus();

// pages content
setupPageContextButtons();
setupIntegrationWithPontoonAddonPromotion();

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

setupDataRefresh();

console.info('Background context initialized.');
