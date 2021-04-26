import type { Runtime } from 'webextension-polyfill-ts';

import { Options } from '@pontoon-addon/commons/src/Options';
import { RemoteLinks } from '@pontoon-addon/commons/src/RemoteLinks';

import { browser } from './util/webExtensionsApi';
import { RemotePontoon } from './RemotePontoon';
import { ToolbarButton } from './ToolbarButton';
import { PageAction } from './PageAction';
import { SystemNotifications } from './SystemNotifications';
import { PageContextMenu } from './PageContextMenu';
import { ToolbarButtonContextMenu } from './ToolbarButtonContextMenu';
import { DataRefresher } from './DataRefresher';
import { ContextButtons } from './ContextButtons';
import { PontoonAddonPromotion } from './PontoonAddonPromotion';

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
    browser.tabs.create({
      url: browser.runtime.getURL('packages/intro/dist/index.html'),
    });
  }
});

Options.create().then((options) => {
  const pontoonBaseUrlOptionKey = 'pontoon_base_url';
  const localeTeamOptionKey = 'locale_team';

  options
    .get([pontoonBaseUrlOptionKey, localeTeamOptionKey])
    .then((optionsItems: any) => {
      const remotePontoon = new RemotePontoon(
        optionsItems[pontoonBaseUrlOptionKey],
        optionsItems[localeTeamOptionKey],
        options
      );
      const toolbarButton = new ToolbarButton(options, remotePontoon);
      const _pageAction = new PageAction(remotePontoon);
      const _systemNotifications = new SystemNotifications(
        options,
        remotePontoon
      );
      const remoteLinks = new RemoteLinks();
      const _pageContextMenu = new PageContextMenu(
        options,
        remotePontoon,
        remoteLinks
      );
      const _pontoonAddonPromotion = new PontoonAddonPromotion(remotePontoon);
      const _contextButtons = new ContextButtons(
        options,
        remotePontoon,
        remoteLinks
      );
      const dataRefresher = new DataRefresher(options, remotePontoon);
      const _toolbarButtonContextMenu = new ToolbarButtonContextMenu(
        options,
        remotePontoon,
        remoteLinks,
        dataRefresher,
        toolbarButton
      );

      // If the onInstalled event has already fired, the details are stored by the function registered above.
      onInstallFunction = (_details) =>
        dataRefresher.refreshDataOnInstallOrUpdate();
      if (newInstallationDetails) {
        onInstallFunction(newInstallationDetails);
      }

      setTimeout(() => dataRefresher.refreshData(), 1000);
    });
});
