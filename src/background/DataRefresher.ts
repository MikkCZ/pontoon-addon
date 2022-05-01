import type { Tabs } from 'webextension-polyfill';

import { browser, supportsContainers } from '@commons/webExtensionsApi';
import { getOneOption, listenToOptionChange } from '@commons/options';

import type { RemotePontoon } from './RemotePontoon';
import { BackgroundClientMessageType } from './BackgroundClientMessageType';

export class DataRefresher {
  private readonly remotePontoon: RemotePontoon;
  private readonly alarmName: string;

  constructor(remotePontoon: RemotePontoon) {
    this.remotePontoon = remotePontoon;
    this.alarmName = 'data-refresher-alarm';

    this.watchOptionsUpdates();
    this.watchTabsUpdates();
    this.listenToMessagesFromNotificationsBellContentScript();

    this.listenToAlarm();
    this.setupAlarm();
  }

  public refreshDataOnInstallOrUpdate(): void {
    this.remotePontoon.updateProjectsList();
  }

  public refreshData(): void {
    this.remotePontoon.updateNotificationsData();
    this.remotePontoon.updateLatestTeamActivity();
    this.remotePontoon.updateTeamsList();
  }

  private listenToAlarm(): void {
    browser.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === this.alarmName) {
        this.refreshData();
      }
    });
  }

  private watchOptionsUpdates(): void {
    listenToOptionChange(
      'data_update_interval',
      ({ newValue: intervalMinutes }) => {
        this.setupAlarmWithInterval(intervalMinutes);
      },
    );
    listenToOptionChange(
      'contextual_identity',
      async ({ newValue: contextualIdentity }) => {
        const pontoonTabs = await browser.tabs.query({
          url: `${this.remotePontoon.getBaseUrl()}/*`,
        });
        for (const tab of pontoonTabs) {
          if (contextualIdentity !== tab.cookieStoreId) {
            browser.tabs.sendMessage(tab.id!, {
              type: BackgroundClientMessageType.DISABLE_NOTIFICATIONS_BELL_SCRIPT,
            });
          }
        }
      },
    );
  }

  private watchTabsUpdates(): void {
    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) =>
      this.addLiveDataProvider(tabId, changeInfo, tab),
    );
  }

  private listenToMessagesFromNotificationsBellContentScript(): void {
    browser.runtime.onMessage.addListener(({ type }, sender) => {
      if (
        type === BackgroundClientMessageType.NOTIFICATIONS_BELL_SCRIPT_LOADED
      ) {
        return getOneOption('contextual_identity').then(
          (contextualIdentity) => {
            if (
              contextualIdentity === sender.tab?.cookieStoreId ||
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
  }

  private async addLiveDataProvider(
    tabId: number,
    changeInfo: Tabs.OnUpdatedChangeInfoType,
    tab: Tabs.Tab,
  ): Promise<void> {
    if (
      changeInfo.status === 'complete' &&
      tab.url?.startsWith(`${this.remotePontoon.getBaseUrl()}/`)
    ) {
      const contextualIdentity = await getOneOption('contextual_identity');
      if (contextualIdentity === tab.cookieStoreId || !supportsContainers()) {
        browser.tabs.executeScript(tabId, {
          file: 'content-scripts/live-data-provider.js',
        });
      }
    }
  }

  private async setupAlarm(): Promise<void> {
    const intervalMinutes = await getOneOption('data_update_interval');
    this.setupAlarmWithInterval(intervalMinutes);
  }

  private setupAlarmWithInterval(intervalMinutes: number) {
    browser.alarms.create(this.alarmName, {
      periodInMinutes: intervalMinutes,
    });
  }
}
