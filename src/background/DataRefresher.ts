import {
  browser,
  callWithInterval,
  executeScript,
  getTabsWithBaseUrl,
  listenToTabsCompletedLoading,
  supportsContainers,
} from '@commons/webExtensionsApi';
import {
  getOneOption,
  getOptions,
  listenToOptionChange,
} from '@commons/options';

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

    listenToOptionChange('contextual_identity', () => {
      this.refreshData();
    });
    listenToOptionChange('pontoon_base_url', () => {
      this.refreshData();
    });

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
      const {
        pontoon_base_url: pontoonBaseUrl,
        contextual_identity: contextualIdentity,
      } = await getOptions(['pontoon_base_url', 'contextual_identity']);
      if (tab.url?.startsWith(`${pontoonBaseUrl}/`)) {
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
        const pontoonBaseUrl = await getOneOption('pontoon_base_url');
        for (const tab of await getTabsWithBaseUrl(pontoonBaseUrl)) {
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
