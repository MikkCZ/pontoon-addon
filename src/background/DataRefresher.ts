import type { Tabs } from 'webextension-polyfill';

import type { Options } from '@commons/Options';
import { browser } from '@commons/webExtensionsApi';

import type { RemotePontoon } from './RemotePontoon';

export class DataRefresher {
  private readonly options: Options;
  private readonly remotePontoon: RemotePontoon;
  private readonly alarmName: string;

  constructor(options: Options, remotePontoon: RemotePontoon) {
    this.options = options;
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
    this.options.subscribeToOptionChange('data_update_interval', (change) => {
      const intervalMinutes = parseInt(change.newValue, 10);
      this.setupAlarmWithInterval(intervalMinutes);
    });
    this.options.subscribeToOptionChange('contextual_identity', (change) => {
      browser.tabs
        .query({ url: `${this.remotePontoon.getBaseUrl()}/*` })
        .then((pontoonTabs) => {
          pontoonTabs
            .filter((tab) => change.newValue !== tab.cookieStoreId)
            .forEach((tab) => {
              browser.tabs.sendMessage(tab.id!, {
                type: 'disable-notifications-bell-script',
              });
            });
        })
        .then(() => this.refreshData());
    });
  }

  private watchTabsUpdates(): void {
    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) =>
      this.addLiveDataProvider(tabId, changeInfo, tab),
    );
  }

  private listenToMessagesFromNotificationsBellContentScript(): void {
    browser.runtime.onMessage.addListener((message, sender) => {
      if (message.type === 'notifications-bell-script-loaded') {
        return this.options.get('contextual_identity').then((item: any) => {
          if (
            item['contextual_identity'] === sender.tab?.cookieStoreId ||
            !this.supportsContainers()
          ) {
            return { type: 'enable-notifications-bell-script' };
          }
        });
      }
    });
  }

  private addLiveDataProvider(
    tabId: number,
    changeInfo: Tabs.OnUpdatedChangeInfoType,
    tab: Tabs.Tab,
  ): void {
    if (
      changeInfo.status === 'complete' &&
      tab.url?.startsWith(`${this.remotePontoon.getBaseUrl()}/`)
    ) {
      this.options.get('contextual_identity').then((item: any) => {
        if (
          item['contextual_identity'] === tab.cookieStoreId ||
          !this.supportsContainers()
        ) {
          browser.tabs.executeScript(tabId, {
            file: 'content-scripts/live-data-provider.js',
          });
        }
      });
    }
  }

  private setupAlarm(): void {
    const optionKey = 'data_update_interval';
    this.options.get(optionKey).then((item: any) => {
      const intervalMinutes = parseInt(item[optionKey], 10);
      this.setupAlarmWithInterval(intervalMinutes);
    });
  }

  private setupAlarmWithInterval(intervalMinutes: number) {
    browser.alarms.create(this.alarmName, {
      periodInMinutes: intervalMinutes,
    });
  }

  private supportsContainers(): boolean {
    return browser.contextualIdentities !== undefined;
  }
}
