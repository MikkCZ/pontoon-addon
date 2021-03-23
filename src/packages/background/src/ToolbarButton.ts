import type { Options } from '@pontoon-addon/commons/src/Options';

import type { RemotePontoon } from './RemotePontoon';
import { browser } from './util/webExtensionsApi';

export class ToolbarButton {
  private readonly _options: Options;
  private readonly _remotePontoon: RemotePontoon;
  private readonly _defaultTitle: string;
  private _badgeText: string;
  private readonly _openPontoonTeamPage: () => void;
  private readonly _openPontoonHomePage: () => void;

  constructor(options: Options, remotePontoon: RemotePontoon) {
    this._options = options;
    this._remotePontoon = remotePontoon;
    this._defaultTitle = 'Pontoon notifications';
    this._badgeText = '';

    this._openPontoonTeamPage = () =>
      browser.tabs.create({ url: this._remotePontoon.getTeamPageUrl() });
    this._openPontoonHomePage = () =>
      browser.tabs.create({ url: this._remotePontoon.getBaseUrl() });
    this._addOnClickAction();
    this._watchStorageChanges();
    this._watchOptionsUpdates();
  }

  private _watchStorageChanges(): void {
    this._remotePontoon.subscribeToNotificationsChange((change) => {
      const notificationsData = change.newValue;
      if (notificationsData) {
        this._updateBadge(
          `${Object.values(notificationsData).filter((n) => n.unread).length}`
        );
      } else {
        this._updateBadge('!');
      }
    });
  }

  private _watchOptionsUpdates(): void {
    this._options.subscribeToOptionChange('toolbar_button_action', (change) => {
      this._setButtonAction(change.newValue);
    });
    this._options.subscribeToOptionChange(
      'display_toolbar_button_badge',
      (change) => {
        if (change.newValue) {
          this._updateBadge(this._badgeText);
        } else {
          this.hideBadge();
        }
      }
    );
  }

  private _setButtonAction(buttonAction: string): void {
    browser.browserAction.setPopup({ popup: '' });
    browser.browserAction.onClicked.removeListener(this._openPontoonTeamPage);
    browser.browserAction.onClicked.removeListener(this._openPontoonHomePage);
    switch (buttonAction) {
      case 'popup':
        browser.browserAction.setPopup({
          popup: browser.runtime.getURL(
            'packages/toolbar-button/dist/index.html'
          ),
        });
        break;
      case 'team-page':
        browser.browserAction.onClicked.addListener(this._openPontoonTeamPage);
        break;
      case 'home-page':
        browser.browserAction.onClicked.addListener(this._openPontoonHomePage);
        break;
    }
  }

  private _addOnClickAction(): void {
    const buttonActionOption = 'toolbar_button_action';
    this._options.get(buttonActionOption).then((item: any) => {
      this._setButtonAction(item[buttonActionOption]);
    });
  }

  private _updateBadge(text: string): void {
    if (text.trim().length > 0) {
      this._badgeText = text;
    }
    const optionKey = 'display_toolbar_button_badge';
    this._options.get(optionKey).then((item: any) => {
      if (item[optionKey]) {
        browser.browserAction.setBadgeText({ text: text });
        browser.browserAction.setTitle({
          title: `${this._defaultTitle} (${text})`,
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
    browser.browserAction.setTitle({ title: this._defaultTitle });
  }
}
