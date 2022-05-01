import { getOneOption, listenToOptionChange } from '@commons/options';
import {
  browser,
  openNewTab,
  getResourceUrl,
  listenToStorageChange,
} from '@commons/webExtensionsApi';
import { pontoonTeam } from '@commons/webLinks';

import type { RemotePontoon } from './RemotePontoon';

export class ToolbarButton {
  private readonly remotePontoon: RemotePontoon;
  private readonly defaultTitle: string;
  private badgeText: string;
  private readonly openPontoonTeamPage: () => void;
  private readonly openPontoonHomePage: () => void;

  constructor(remotePontoon: RemotePontoon) {
    this.remotePontoon = remotePontoon;
    this.defaultTitle = 'Pontoon notifications';
    this.badgeText = '';

    this.openPontoonTeamPage = () =>
      openNewTab(
        pontoonTeam(
          this.remotePontoon.getBaseUrl(),
          this.remotePontoon.getTeam(),
        ),
      );
    this.openPontoonHomePage = () =>
      openNewTab(this.remotePontoon.getBaseUrl());
    this.addOnClickAction();
    this.watchStorageChanges();
    this.watchOptionsUpdates();
  }

  private watchStorageChanges(): void {
    listenToStorageChange(
      'notificationsData',
      ({ newValue: notificationsData }) => {
        if (notificationsData) {
          this.updateBadge(
            `${
              Object.values(notificationsData).filter((n) => n.unread).length
            }`,
          );
        } else {
          this.updateBadge('!');
        }
      },
    );
  }

  private watchOptionsUpdates(): void {
    listenToOptionChange(
      'toolbar_button_action',
      ({ newValue: buttonAction }) => {
        this.setButtonAction(buttonAction);
      },
    );
    listenToOptionChange(
      'display_toolbar_button_badge',
      ({ newValue: displayBadge }) => {
        if (displayBadge) {
          this.updateBadge(this.badgeText);
        } else {
          this.hideBadge();
        }
      },
    );
  }

  private setButtonAction(buttonAction: string): void {
    browser.browserAction.setPopup({ popup: '' });
    browser.browserAction.onClicked.removeListener(this.openPontoonTeamPage);
    browser.browserAction.onClicked.removeListener(this.openPontoonHomePage);
    switch (buttonAction) {
      case 'popup':
        browser.browserAction.setPopup({
          popup: getResourceUrl('frontend/toolbar-button.html'),
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

  private async addOnClickAction(): Promise<void> {
    const clickAction = await getOneOption('toolbar_button_action');
    this.setButtonAction(clickAction);
  }

  private async updateBadge(text: string): Promise<void> {
    if (text.trim().length > 0) {
      this.badgeText = text;
    }
    const displayBadge = await getOneOption('display_toolbar_button_badge');
    if (displayBadge) {
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
  }

  public hideBadge(): void {
    browser.browserAction.setBadgeText({ text: '' });
    browser.browserAction.setTitle({ title: this.defaultTitle });
  }
}
