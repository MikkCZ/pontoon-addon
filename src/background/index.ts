import {
  browser,
  callDelayed,
  openIntro,
  supportsAddressBar,
} from '@commons/webExtensionsApi';

import { ContextButtons } from './ContextButtons';
import { DataRefresher } from './DataRefresher';
import { AddressBarIcon } from './AddressBarIcon';
import { PageContextMenu } from './PageContextMenu';
import { PontoonAddonPromotion } from './PontoonAddonPromotion';
import { RemotePontoon } from './RemotePontoon';
import { SystemNotifications } from './SystemNotifications';
import { ToolbarButton } from './ToolbarButton';

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

async function init() {
  const remotePontoon = new RemotePontoon();
  const dataRefresher = new DataRefresher(remotePontoon);
  const _toolbarButton = new ToolbarButton(dataRefresher);
  if (supportsAddressBar()) {
    const _addressBarIcon = new AddressBarIcon(remotePontoon);
  }
  const _systemNotifications = new SystemNotifications();
  const _pageContextMenu = new PageContextMenu();
  const _pontoonAddonPromotion = new PontoonAddonPromotion();
  const _contextButtons = new ContextButtons();

  callDelayed({ delayInSeconds: 1 }, async () => {
    remotePontoon.updateProjectsList();
    dataRefresher.refreshData();
  });
}

init();
