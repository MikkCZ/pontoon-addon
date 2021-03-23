import { Tabs } from 'webextension-polyfill-ts';

import { RemotePontoon } from './RemotePontoon';
import { browser } from './util/webExtensionsApi';

export class PageAction {
  private readonly _remotePontoon: RemotePontoon;

  constructor(remotePontoon: RemotePontoon) {
    this._remotePontoon = remotePontoon;

    if (browser.pageAction) {
      this._watchStorageChanges();
      this._watchTabsUpdates();
      this._refreshAllTabsPageActions();
    }
  }

  private _watchStorageChanges(): void {
    this._remotePontoon.subscribeToProjectsListChange((_change) =>
      this._refreshAllTabsPageActions()
    );
  }

  private _watchTabsUpdates(): void {
    browser.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete') {
        this._showPageActionForTab(tab);
      }
    });
  }

  private _refreshAllTabsPageActions(): void {
    browser.tabs
      .query({})
      .then((tabs) => tabs.forEach((tab) => this._showPageActionForTab(tab)));
  }

  private async _showPageActionForTab(tab: Tabs.Tab): Promise<void> {
    const projectData = await this._remotePontoon.getPontoonProjectForPageUrl(
      tab.url!
    );
    if (projectData) {
      this._activatePageAction(tab.id);
      browser.pageAction.setTitle({
        tabId: tab.id!,
        title: `Open ${projectData.name} in Pontoon`,
      });
    } else {
      this._deactivatePageAction(tab.id);
      browser.pageAction.setTitle({
        tabId: tab.id!,
        title: 'No project for this page',
      });
    }
  }

  private _activatePageAction(tabId: number | undefined): void {
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

  private _deactivatePageAction(tabId: number | undefined): void {
    if (tabId) {
      browser.pageAction.setIcon({ tabId });
      browser.pageAction.hide(tabId);
    }
  }
}
