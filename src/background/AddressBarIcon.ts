import type { Tabs } from 'webextension-polyfill';

import {
  showAddressBarIcon,
  hideAddressBarIcon,
  listenToStorageChange,
  getAllTabs,
  listenToTabsCompletedLoading,
} from '@commons/webExtensionsApi';

import { RemotePontoon } from './RemotePontoon';

export class AddressBarIcon {
  constructor(remotePontoon: RemotePontoon) {
    listenToStorageChange('projectsList', () =>
      this.refreshAllTabsPageActions(remotePontoon),
    );
    listenToTabsCompletedLoading((tab) => {
      this.showPageActionForTab(tab, remotePontoon);
    });
    this.refreshAllTabsPageActions(remotePontoon);
  }

  private async refreshAllTabsPageActions(
    remotePontoon: RemotePontoon,
  ): Promise<void> {
    for (const tab of await getAllTabs()) {
      this.showPageActionForTab(tab, remotePontoon);
    }
  }

  private async showPageActionForTab(
    tab: Tabs.Tab,
    remotePontoon: RemotePontoon,
  ): Promise<void> {
    const projectData = await remotePontoon.getPontoonProjectForPageUrl(
      tab.url!,
    );
    if (projectData) {
      showAddressBarIcon(tab, `Open ${projectData.name} in Pontoon`, {
        16: 'assets/img/pontoon-logo.svg',
        32: 'assets/img/pontoon-logo.svg',
      });
    } else {
      hideAddressBarIcon(tab, 'No project for this page');
    }
  }
}
