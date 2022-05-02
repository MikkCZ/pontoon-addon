import type { Runtime } from 'webextension-polyfill';

import {
  browser,
  callDelayed,
  openIntro,
  supportsAddressBar,
} from '@commons/webExtensionsApi';
import { getOptions } from '@commons/options';

import { ContextButtons } from './ContextButtons';
import { DataRefresher } from './DataRefresher';
import { AddressBarIcon } from './AddressBarIcon';
import { PageContextMenu } from './PageContextMenu';
import { PontoonAddonPromotion } from './PontoonAddonPromotion';
import { RemotePontoon } from './RemotePontoon';
import { SystemNotifications } from './SystemNotifications';
import { ToolbarButton } from './ToolbarButton';
import { ToolbarButtonContextMenu } from './ToolbarButtonContextMenu';

// Register capturing event listener in case onInstalled fires before all the async stuff below are ready.
let onInstalledDetails: Runtime.OnInstalledDetailsType;
let onInstallFunction = (details: Runtime.OnInstalledDetailsType): void => {
  onInstalledDetails = details;
};
browser.runtime.onInstalled.addListener((details) => {
  onInstallFunction(details);
});

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
  const { pontoon_base_url: pontoonBaseUrl, locale_team: teamCode } =
    await getOptions(['pontoon_base_url', 'locale_team']);

  const remotePontoon = new RemotePontoon(pontoonBaseUrl, teamCode);
  const toolbarButton = new ToolbarButton();
  if (supportsAddressBar()) {
    const _addressBarIcon = new AddressBarIcon(remotePontoon);
  }
  const _systemNotifications = new SystemNotifications(remotePontoon);
  const _pageContextMenu = new PageContextMenu(remotePontoon);
  const _pontoonAddonPromotion = new PontoonAddonPromotion();
  const _contextButtons = new ContextButtons(remotePontoon);
  const dataRefresher = new DataRefresher(remotePontoon);
  const _toolbarButtonContextMenu = new ToolbarButtonContextMenu(
    remotePontoon,
    dataRefresher,
    toolbarButton,
  );

  const refreshDataOnUpdate = (details: Runtime.OnInstalledDetailsType) => {
    if (details.reason === 'update') {
      dataRefresher.refreshData();
    }
  };

  // If the onInstalled event has already fired, the details are stored by the function registered above.
  if (onInstalledDetails) {
    refreshDataOnUpdate(onInstalledDetails);
  } else {
    onInstallFunction = refreshDataOnUpdate;
  }

  callDelayed({ delayInSeconds: 1 }, async () => {
    dataRefresher.refreshData();
  });
}

init();
