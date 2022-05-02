import {
  getOneOption,
  listenToOptionChange,
  OptionValue,
} from '@commons/options';
import {
  browser,
  openNewTab,
  getResourceUrl,
  listenToStorageChange,
  getOneFromStorage,
} from '@commons/webExtensionsApi';
import { pontoonTeam } from '@commons/webLinks';

import type { NotificationsData, RemotePontoon } from './RemotePontoon';

const DEFAULT_TITLE = 'Pontoon notifications';

export class ToolbarButton {
  private readonly remotePontoon: RemotePontoon;

  constructor(remotePontoon: RemotePontoon) {
    this.remotePontoon = remotePontoon;

    this.registerBadgeChanges();
    this.registerClickAction();
  }

  private async registerBadgeChanges() {
    listenToStorageChange(
      'notificationsData',
      ({ newValue: notificationsData }) => {
        if (notificationsData) {
          this.updateBadge(notificationsData);
        } else {
          this.updateBadge(undefined);
        }
      },
    );
    listenToOptionChange('display_toolbar_button_badge', async () => {
      this.updateBadge(await getOneFromStorage('notificationsData'));
    });
    this.updateBadge(await getOneFromStorage('notificationsData'));
  }

  private async buttonClickHandler() {
    const action = await getOneOption('toolbar_button_action');
    switch (action) {
      case 'popup':
        break;
      case 'home-page':
        openNewTab(this.remotePontoon.getBaseUrl());
        break;
      case 'team-page':
        openNewTab(
          pontoonTeam(
            this.remotePontoon.getBaseUrl(),
            this.remotePontoon.getTeam(),
          ),
        );
        break;
      default:
        throw new Error(`Unknown toolbar button action '${action}'.`);
    }
  }

  private registerButtonPopup(action: OptionValue<'toolbar_button_action'>) {
    let popup;
    switch (action) {
      case 'popup':
        popup = getResourceUrl('frontend/toolbar-button.html');
        break;
      case 'home-page':
      case 'team-page':
        popup = '';
        break;
      default:
        throw new Error(`Unknown toolbar button action '${action}'.`);
    }
    browser.browserAction.setPopup({ popup });
  }

  private async registerClickAction() {
    browser.browserAction.onClicked.addListener(() =>
      this.buttonClickHandler(),
    );
    listenToOptionChange('toolbar_button_action', ({ newValue: action }) => {
      this.registerButtonPopup(action);
    });
    this.registerButtonPopup(await getOneOption('toolbar_button_action'));
  }

  private async updateBadge(
    notificationsData: NotificationsData | undefined,
  ): Promise<void> {
    let text;
    if (typeof notificationsData !== 'undefined') {
      text = `${
        Object.values(notificationsData).filter((n) => n.unread).length
      }`;
    } else {
      text = '!';
    }
    const displayBadge = await getOneOption('display_toolbar_button_badge');
    if (displayBadge || text === '!') {
      browser.browserAction.setBadgeText({ text });
      browser.browserAction.setTitle({ title: `${DEFAULT_TITLE} (${text})` });
      const color = text === '0' ? '#4d5967' : '#F36';
      browser.browserAction.setBadgeBackgroundColor({ color });
    } else {
      this.hideBadge();
    }
  }

  public hideBadge(): void {
    browser.browserAction.setBadgeText({ text: '' });
    browser.browserAction.setTitle({ title: DEFAULT_TITLE });
  }
}
