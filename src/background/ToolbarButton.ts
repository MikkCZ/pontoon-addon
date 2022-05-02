import {
  getOptions,
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
  StorageContent,
} from '@commons/webExtensionsApi';
import { pontoonTeam } from '@commons/webLinks';

const DEFAULT_TITLE = 'Pontoon notifications';

export class ToolbarButton {
  constructor() {
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
          this.updateBadge();
        }
      },
    );
    listenToOptionChange('display_toolbar_button_badge', () => {
      this.updateBadge();
    });
    this.updateBadge();
  }

  private async buttonClickHandler() {
    const {
      toolbar_button_action: action,
      pontoon_base_url: pontoonBaseUrl,
      locale_team: teamCode,
    } = await getOptions([
      'toolbar_button_action',
      'pontoon_base_url',
      'locale_team',
    ]);
    switch (action) {
      case 'popup':
        break;
      case 'home-page':
        openNewTab(await getOneOption('pontoon_base_url'));
        break;
      case 'team-page':
        openNewTab(pontoonTeam(pontoonBaseUrl, { code: teamCode }));
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
    notificationsData?: Partial<StorageContent>['notificationsData'],
  ) {
    if (typeof notificationsData === 'undefined') {
      notificationsData = await getOneFromStorage('notificationsData');
    }

    if (typeof notificationsData !== 'undefined') {
      if (await getOneOption('display_toolbar_button_badge')) {
        const text = `${
          Object.values(notificationsData).filter((n) => n.unread).length
        }`;
        const color = text === '0' ? '#4d5967' : '#F36';
        await Promise.all([
          browser.browserAction.setBadgeText({ text }),
          browser.browserAction.setTitle({
            title: `${DEFAULT_TITLE} (${text})`,
          }),
          browser.browserAction.setBadgeBackgroundColor({ color }),
        ]);
      } else {
        this.hideBadge();
      }
    } else {
      const text = '!';
      const color = '#F36';
      await Promise.all([
        browser.browserAction.setBadgeText({ text }),
        browser.browserAction.setTitle({ title: `${DEFAULT_TITLE} (${text})` }),
        browser.browserAction.setBadgeBackgroundColor({ color }),
      ]);
    }
  }

  public async hideBadge() {
    await Promise.all([
      browser.browserAction.setBadgeText({ text: '' }),
      browser.browserAction.setTitle({ title: DEFAULT_TITLE }),
    ]);
  }
}
