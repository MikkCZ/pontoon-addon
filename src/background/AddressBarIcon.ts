import { Tabs } from 'webextension-polyfill';

import {
  showAddressBarIcon,
  browser,
  hideAddressBarIcon,
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
    this.remotePontoon.subscribeToProjectsListChange((_change) =>
      this.refreshAllTabsPageActions(),
    );
  }

  private watchTabsUpdates(): void {
    browser.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete') {
        this.showPageActionForTab(tab);
      }
    });
  }

  private refreshAllTabsPageActions(): void {
    browser.tabs
      .query({})
      .then((tabs) => tabs.forEach((tab) => this.showPageActionForTab(tab)));
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
