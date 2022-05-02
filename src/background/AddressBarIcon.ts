import { Tabs } from 'webextension-polyfill';

import {
  showAddressBarIcon,
  hideAddressBarIcon,
  listenToStorageChange,
  getAllTabs,
  listenToTabsCompletedLoading,
} from '@commons/webExtensionsApi';

import { RemotePontoon } from './RemotePontoon';

export class AddressBarIcon {
  private readonly remotePontoon: RemotePontoon;

  constructor(remotePontoon: RemotePontoon) {
    this.remotePontoon = remotePontoon;

    this.watchStorageChanges();
    this.watchTabsUpdates();
    this.refreshAllTabsPageActions();
  }

  private watchStorageChanges(): void {
    listenToStorageChange('projectsList', () =>
      this.refreshAllTabsPageActions(),
    );
  }

  private watchTabsUpdates(): void {
    listenToTabsCompletedLoading((tab) => {
      this.showPageActionForTab(tab);
    });
  }

  private async refreshAllTabsPageActions(): Promise<void> {
    for (const tab of await getAllTabs()) {
      this.showPageActionForTab(tab);
    }
  }

  private async showPageActionForTab(tab: Tabs.Tab): Promise<void> {
    const projectData = await this.remotePontoon.getPontoonProjectForPageUrl(
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
