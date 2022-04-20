import { browser } from '@pontoon-addon/commons/src/webExtensionsApi';
import { Tabs } from 'webextension-polyfill';

import { RemotePontoon } from './RemotePontoon';

export class PageAction {
  private readonly remotePontoon: RemotePontoon;

  constructor(remotePontoon: RemotePontoon) {
    this.remotePontoon = remotePontoon;

    if (browser.pageAction) {
      this.watchStorageChanges();
      this.watchTabsUpdates();
      this.refreshAllTabsPageActions();
    }
  }

  private watchStorageChanges(): void {
    this.remotePontoon.subscribeToProjectsListChange((_change) =>
      this.refreshAllTabsPageActions()
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
      tab.url!
    );
    if (projectData) {
      this.activatePageAction(tab.id);
      browser.pageAction.setTitle({
        tabId: tab.id!,
        title: `Open ${projectData.name} in Pontoon`,
      });
    } else {
      this.deactivatePageAction(tab.id);
      browser.pageAction.setTitle({
        tabId: tab.id!,
        title: 'No project for this page',
      });
    }
  }

  private activatePageAction(tabId: number | undefined): void {
    if (tabId) {
      browser.pageAction.setIcon({
        path: {
          16: 'packages/commons/static/img/pontoon-logo.svg',
          32: 'packages/commons/static/img/pontoon-logo.svg',
        },
        tabId,
      });
      browser.pageAction.show(tabId);
    }
  }

  private deactivatePageAction(tabId: number | undefined): void {
    if (tabId) {
      browser.pageAction.setIcon({ tabId });
      browser.pageAction.hide(tabId);
    }
  }
}
