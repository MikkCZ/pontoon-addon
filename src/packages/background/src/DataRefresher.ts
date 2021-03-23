import type { Tabs } from 'webextension-polyfill-ts';

import type { Options } from '@pontoon-addon/commons/src/Options';

import type { RemotePontoon } from './RemotePontoon';
import { browser } from './util/webExtensionsApi';

export class DataRefresher {
  private readonly _options: Options;
  private readonly _remotePontoon: RemotePontoon;
  private readonly _alarmName: string;

  constructor(options: Options, remotePontoon: RemotePontoon) {
    this._options = options;
    this._remotePontoon = remotePontoon;
    this._alarmName = 'data-refresher-alarm';

    this._watchOptionsUpdates();
    this._watchTabsUpdates();
    this._listenToMessagesFromNotificationsBellContentScript();

    this._listenToAlarm();
    this._setupAlarm();
  }

  public refreshDataOnInstallOrUpdate(): void {
    this._remotePontoon.updateProjectsList();
  }

  public refreshData(): void {
    this._remotePontoon.updateNotificationsData();
    this._remotePontoon.updateLatestTeamActivity();
    this._remotePontoon.updateTeamsList();
  }

  private _listenToAlarm(): void {
    browser.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === this._alarmName) {
        this.refreshData();
      }
    });
  }

  private _watchOptionsUpdates(): void {
    this._options.subscribeToOptionChange('data_update_interval', (change) => {
      const intervalMinutes = parseInt(change.newValue, 10);
      this._setupAlarmWithInterval(intervalMinutes);
    });
    this._options.subscribeToOptionChange('contextual_identity', (change) => {
      browser.tabs
        .query({ url: this._remotePontoon.getBaseUrl() + '/*' })
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

  private _watchTabsUpdates(): void {
    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) =>
      this._addLiveDataProvider(tabId, changeInfo, tab)
    );
  }

  private _listenToMessagesFromNotificationsBellContentScript(): void {
    browser.runtime.onMessage.addListener((message, sender) => {
      if (message.type === 'notifications-bell-script-loaded') {
        return this._options.get('contextual_identity').then((item: any) => {
          if (
            item['contextual_identity'] === sender.tab?.cookieStoreId ||
            !this._supportsContainers()
          ) {
            return { type: 'enable-notifications-bell-script' };
          }
        });
      }
    });
  }

  private _addLiveDataProvider(
    tabId: number,
    changeInfo: Tabs.OnUpdatedChangeInfoType,
    tab: Tabs.Tab
  ): void {
    if (
      changeInfo.status === 'complete' &&
      tab.url?.startsWith(`${this._remotePontoon.getBaseUrl()}/`)
    ) {
      this._options.get('contextual_identity').then((item: any) => {
        if (
          item['contextual_identity'] === tab.cookieStoreId ||
          !this._supportsContainers()
        ) {
          browser.tabs.executeScript(tabId, {
            file: '/packages/content-scripts/dist/live-data-provider.js',
          });
        }
      });
    }
  }

  private _setupAlarm(): void {
    const optionKey = 'data_update_interval';
    this._options.get(optionKey).then((item: any) => {
      const intervalMinutes = parseInt(item[optionKey], 10);
      this._setupAlarmWithInterval(intervalMinutes);
    });
  }

  private _setupAlarmWithInterval(intervalMinutes: number) {
    browser.alarms.create(this._alarmName, {
      periodInMinutes: intervalMinutes,
    });
  }

  private _supportsContainers(): boolean {
    return browser.contextualIdentities !== undefined;
  }
}
