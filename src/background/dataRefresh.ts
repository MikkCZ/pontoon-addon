import {
  browser,
  callDelayed,
  callWithInterval,
  executeScript,
  getTabsWithBaseUrl,
  listenToMessagesAndRespond,
  listenToTabsCompletedLoading,
  supportsContainers,
} from '@commons/webExtensionsApi';
import {
  getOneOption,
  getOptions,
  listenToOptionChange,
} from '@commons/options';
import type { BackgroundMessagesWithoutResponse } from '@commons/backgroundMessaging';

import { refreshData } from './RemotePontoon';

export function init() {
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
    await refreshData({ event: 'user interaction' });
    console.info('Data refreshed after initialization.');
  });

  listenToOptionChange('contextual_identity', () =>
    refreshData({ event: 'user interaction' }),
  );
  listenToOptionChange('pontoon_base_url', () =>
    refreshData({ event: 'user interaction' }),
  );

  registerLiveDataProvider();
}

function refreshDataWithInterval(periodInMinutes: number) {
  callWithInterval('data-refresher-alarm', { periodInMinutes }, () =>
    refreshData({ event: 'automation' }),
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
  listenToMessagesAndRespond<'NOTIFICATIONS_BELL_SCRIPT_LOADED'>(
    'notifications-bell-script-loaded',
    async (_, { tab: fromTab }) => {
      const contextualIdentity = await getOneOption('contextual_identity');
      if (
        contextualIdentity === fromTab?.cookieStoreId ||
        !supportsContainers()
      ) {
        return {
          type: 'enable-notifications-bell-script',
        };
      } else {
        return {
          type: 'disable-notifications-bell-script',
        };
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
          const message: BackgroundMessagesWithoutResponse['DISABLE_NOTIFICATIONS_BELL_SCRIPT']['message'] =
            {
              type: 'disable-notifications-bell-script',
            };
          browser.tabs.sendMessage(tab.id, message);
        }
      }
    },
  );
}
