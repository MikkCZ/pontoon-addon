import type { Runtime } from 'webextension-polyfill';

import { Options } from '@commons/Options';
import {
  browser,
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
import { ToolbarButtonContextMenu } from './ToolbarButtonContextMenu';

// Register capturing event listener in case onInstalled fires before all the async stuff below are ready.
let newInstallationDetails: Runtime.OnInstalledDetailsType;
let onInstallFunction = (details: Runtime.OnInstalledDetailsType): void => {
  newInstallationDetails = details;
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

const options = new Options();

const pontoonBaseUrlOptionKey = 'pontoon_base_url';
const localeTeamOptionKey = 'locale_team';

options
  .get([pontoonBaseUrlOptionKey, localeTeamOptionKey])
  .then((optionsItems: any) => {
    const remotePontoon = new RemotePontoon(
      optionsItems[pontoonBaseUrlOptionKey],
      optionsItems[localeTeamOptionKey],
      options,
    );
    const toolbarButton = new ToolbarButton(options, remotePontoon);
    if (supportsAddressBar()) {
      const _addressBarIcon = new AddressBarIcon(remotePontoon);
    }
    const _systemNotifications = new SystemNotifications(
      options,
      remotePontoon,
    );
    const _pageContextMenu = new PageContextMenu(options, remotePontoon);
    const _pontoonAddonPromotion = new PontoonAddonPromotion(remotePontoon);
    const _contextButtons = new ContextButtons(options, remotePontoon);
    const dataRefresher = new DataRefresher(options, remotePontoon);
    const _toolbarButtonContextMenu = new ToolbarButtonContextMenu(
      options,
      remotePontoon,
      dataRefresher,
      toolbarButton,
    );

    // If the onInstalled event has already fired, the details are stored by the function registered above.
    onInstallFunction = (_details) =>
      dataRefresher.refreshDataOnInstallOrUpdate();
    if (newInstallationDetails) {
      onInstallFunction(newInstallationDetails);
    }

    setTimeout(() => dataRefresher.refreshData(), 1000);
  });
