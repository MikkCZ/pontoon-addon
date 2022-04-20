import type { Options } from '@pontoon-addon/commons/src/Options';
import { browser } from '@pontoon-addon/commons/src/webExtensionsApi';

import type { RemotePontoon } from './RemotePontoon';

export class ToolbarButton {
  private readonly options: Options;
  private readonly remotePontoon: RemotePontoon;
  private readonly defaultTitle: string;
  private badgeText: string;
  private readonly openPontoonTeamPage: () => void;
  private readonly openPontoonHomePage: () => void;

  constructor(options: Options, remotePontoon: RemotePontoon) {
    this.options = options;
    this.remotePontoon = remotePontoon;
    this.defaultTitle = 'Pontoon notifications';
    this.badgeText = '';

    this.openPontoonTeamPage = () =>
      browser.tabs.create({ url: this.remotePontoon.getTeamPageUrl() });
    this.openPontoonHomePage = () =>
      browser.tabs.create({ url: this.remotePontoon.getBaseUrl() });
    this.addOnClickAction();
    this.watchStorageChanges();
    this.watchOptionsUpdates();
  }

  private watchStorageChanges(): void {
    this.remotePontoon.subscribeToNotificationsChange((change) => {
      const notificationsData = change.newValue;
      if (notificationsData) {
        this.updateBadge(
          `${Object.values(notificationsData).filter((n) => n.unread).length}`
        );
      } else {
        this.updateBadge('!');
      }
    });
  }

  private watchOptionsUpdates(): void {
    this.options.subscribeToOptionChange('toolbar_button_action', (change) => {
      this.setButtonAction(change.newValue);
    });
    this.options.subscribeToOptionChange(
      'display_toolbar_button_badge',
      (change) => {
        if (change.newValue) {
          this.updateBadge(this.badgeText);
        } else {
          this.hideBadge();
        }
      }
    );
  }

  private setButtonAction(buttonAction: string): void {
    browser.browserAction.setPopup({ popup: '' });
    browser.browserAction.onClicked.removeListener(this.openPontoonTeamPage);
    browser.browserAction.onClicked.removeListener(this.openPontoonHomePage);
    switch (buttonAction) {
      case 'popup':
        browser.browserAction.setPopup({
          popup: browser.runtime.getURL(
            'packages/toolbar-button/dist/index.html'
          ),
        });
        break;
      case 'team-page':
        browser.browserAction.onClicked.addListener(this.openPontoonTeamPage);
        break;
      case 'home-page':
        browser.browserAction.onClicked.addListener(this.openPontoonHomePage);
        break;
    }
  }

  private addOnClickAction(): void {
    const buttonActionOption = 'toolbar_button_action';
    this.options.get(buttonActionOption).then((item: any) => {
      this.setButtonAction(item[buttonActionOption]);
    });
  }

  private updateBadge(text: string): void {
    if (text.trim().length > 0) {
      this.badgeText = text;
    }
    const optionKey = 'display_toolbar_button_badge';
    this.options.get(optionKey).then((item: any) => {
      if (item[optionKey]) {
        browser.browserAction.setBadgeText({ text: text });
        browser.browserAction.setTitle({
          title: `${this.defaultTitle} (${text})`,
        });
        if (text !== '0') {
          browser.browserAction.setBadgeBackgroundColor({ color: '#F36' });
        } else {
          browser.browserAction.setBadgeBackgroundColor({ color: '#4d5967' });
        }
      } else {
        this.hideBadge();
      }
    });
  }

  public hideBadge(): void {
    browser.browserAction.setBadgeText({ text: '' });
    browser.browserAction.setTitle({ title: this.defaultTitle });
  }
}
