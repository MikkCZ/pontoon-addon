import {
  browser,
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

browser.runtime.onInstalled.addListener((details) => {
  // For new installations or major updates, open the introduction tour.
  if (
    details.reason === 'install' ||
    parseInt(details?.previousVersion?.split('.')[0] || '') <
      parseInt(browser.runtime.getManifest().version.split('.')[0])
  ) {
    openIntro();
  }
});

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

setupDataRefresh();

console.info('Background context initialized.');
