import {
  browser,
  callDelayed,
  callWithInterval,
  executeScript,
  getTabsWithBaseUrl,
  listenToMessagesExclusively,
  listenToTabsCompletedLoading,
  supportsContainers,
} from '@commons/webExtensionsApi';
import {
  getOneOption,
  getOptions,
  listenToOptionChange,
} from '@commons/options';

import { BackgroundClientMessageType } from './BackgroundClientMessageType';
import { refreshData } from './RemotePontoon';

export function setupDataRefresh() {
  listenToOptionChange(
    'data_update_interval',
    ({ newValue: periodInMinutes }) => {
      refreshDataWithInterval(periodInMinutes);
    },
  );
  getOneOption('data_update_interval').then((periodInMinutes) =>
    refreshDataWithInterval(periodInMinutes),
  );
  callDelayed({ delayInSeconds: 1 }, async () => {
    await refreshData();
    console.info('Data refreshed after initialization.');
  });

  listenToOptionChange('contextual_identity', () => refreshData());
  listenToOptionChange('pontoon_base_url', () => refreshData());

  registerLiveDataProvider();
}

function refreshDataWithInterval(periodInMinutes: number) {
  callWithInterval('data-refresher-alarm', { periodInMinutes }, () =>
    refreshData(),
  );
}

function registerLiveDataProvider() {
  listenToTabsCompletedLoading(async (tab) => {
    const {
      pontoon_base_url: pontoonBaseUrl,
      contextual_identity: contextualIdentity,
    } = await getOptions(['pontoon_base_url', 'contextual_identity']);
    if (tab.url?.startsWith(`${pontoonBaseUrl}/`)) {
      if (contextualIdentity === tab.cookieStoreId || !supportsContainers()) {
        await executeScript(tab.id, 'content-scripts/live-data-provider.js');
      }
    }
  });
  listenToMessagesExclusively(
    BackgroundClientMessageType.NOTIFICATIONS_BELL_SCRIPT_LOADED,
    async (_message, { tab: fromTab }) => {
      const contextualIdentity = await getOneOption('contextual_identity');
      if (
        contextualIdentity === fromTab?.cookieStoreId ||
        !supportsContainers()
      ) {
        return {
          type: BackgroundClientMessageType.ENABLE_NOTIFICATIONS_BELL_SCRIPT,
        };
      } else {
        // nothing
      }
    },
  );
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
