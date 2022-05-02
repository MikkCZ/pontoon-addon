import {
  browser,
  callWithInterval,
  executeScript,
  getTabsWithBaseUrl,
  listenToTabsCompletedLoading,
  supportsContainers,
} from '@commons/webExtensionsApi';
import { getOneOption, listenToOptionChange } from '@commons/options';

import type { RemotePontoon } from './RemotePontoon';
import { BackgroundClientMessageType } from './BackgroundClientMessageType';
import { listenToMessages } from './backgroundClient';

export class DataRefresher {
  private readonly remotePontoon: RemotePontoon;

  constructor(remotePontoon: RemotePontoon) {
    this.remotePontoon = remotePontoon;

    listenToOptionChange(
      'data_update_interval',
      ({ newValue: periodInMinutes }) => {
        this.refreshDataWithInterval(periodInMinutes);
      },
    );
    getOneOption('data_update_interval').then((periodInMinutes) =>
      this.refreshDataWithInterval(periodInMinutes),
    );

    this.registerLiveDataProvider();
  }

  public refreshData(): void {
    this.remotePontoon.updateNotificationsData();
    this.remotePontoon.updateLatestTeamActivity();
    this.remotePontoon.updateTeamsList();
  }

  private refreshDataWithInterval(periodInMinutes: number) {
    callWithInterval('data-refresher-alarm', { periodInMinutes }, () =>
      this.refreshData(),
    );
  }

  private registerLiveDataProvider() {
    listenToTabsCompletedLoading(async (tab) => {
      if (tab.url?.startsWith(`${this.remotePontoon.getBaseUrl()}/`)) {
        const contextualIdentity = await getOneOption('contextual_identity');
        if (contextualIdentity === tab.cookieStoreId || !supportsContainers()) {
          executeScript(tab.id, 'content-scripts/live-data-provider.js');
        }
      }
    });
    listenToMessages(({ type }, { tab: fromTab }) => {
      if (
        type === BackgroundClientMessageType.NOTIFICATIONS_BELL_SCRIPT_LOADED
      ) {
        return getOneOption('contextual_identity').then(
          (contextualIdentity) => {
            if (
              contextualIdentity === fromTab?.cookieStoreId ||
              !supportsContainers()
            ) {
              return {
                type: BackgroundClientMessageType.ENABLE_NOTIFICATIONS_BELL_SCRIPT,
              };
            }
          },
        );
      }
    });
    listenToOptionChange(
      'contextual_identity',
      async ({ newValue: contextualIdentity }) => {
        for (const tab of await getTabsWithBaseUrl(
          this.remotePontoon.getBaseUrl(),
        )) {
          if (
            contextualIdentity !== tab.cookieStoreId &&
            typeof tab.id !== 'undefined'
          ) {
            browser.tabs.sendMessage(tab.id, {
              type: BackgroundClientMessageType.DISABLE_NOTIFICATIONS_BELL_SCRIPT,
            });
          }
        }
      },
    );
  }
}
