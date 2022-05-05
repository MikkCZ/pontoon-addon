import type { Menus } from 'webextension-polyfill';

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
  openIntro,
  createContextMenu,
} from '@commons/webExtensionsApi';
import {
  pontoonTeam,
  pontoonTeamInsights,
  pontoonTeamBugs,
  pontoonSearchInProject,
  transvisionHome,
  mozillaL10nStyleGuide,
  mozillaWikiL10nTeamPage,
  microsoftTerminologySearch,
  pontoonAddonWiki,
} from '@commons/webLinks';

import type { DataRefresher } from './DataRefresher';

const DEFAULT_TITLE = 'Pontoon notifications';

export class ToolbarButton {
  constructor(dataRefresher: DataRefresher) {
    this.registerBadgeChanges();
    this.registerClickAction();

    this.addContextMenu(dataRefresher);
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

  private async hideBadge() {
    await Promise.all([
      browser.browserAction.setBadgeText({ text: '' }),
      browser.browserAction.setTitle({ title: DEFAULT_TITLE }),
    ]);
  }

  private async addContextMenu(dataRefresher: DataRefresher): Promise<void> {
    const localeTeam = await getOneOption('locale_team');
    createContextMenu({
      title: 'Reload notifications',
      contexts: ['browser_action'],
      onclick: async () => {
        await this.hideBadge();
        dataRefresher.refreshData();
      },
    });

    const pontoonPagesMenuId = createContextMenu({
      title: 'Pontoon',
      contexts: ['browser_action'],
    });
    [
      {
        title: 'Team dashboard',
        contexts: ['browser_action'],
        parentId: pontoonPagesMenuId,
        onclick: async () => {
          const { pontoon_base_url: pontoonBaseUrl, locale_team: teamCode } =
            await getOptions(['pontoon_base_url', 'locale_team']);
          openNewTab(pontoonTeam(pontoonBaseUrl, { code: teamCode }));
        },
      } as Menus.CreateCreatePropertiesType,
      {
        title: 'Team insights',
        contexts: ['browser_action'],
        parentId: pontoonPagesMenuId,
        onclick: async () => {
          const { pontoon_base_url: pontoonBaseUrl, locale_team: teamCode } =
            await getOptions(['pontoon_base_url', 'locale_team']);
          openNewTab(pontoonTeamInsights(pontoonBaseUrl, { code: teamCode }));
        },
      } as Menus.CreateCreatePropertiesType,
      {
        title: 'Team bugs',
        contexts: ['browser_action'],
        parentId: pontoonPagesMenuId,
        onclick: async () => {
          const { pontoon_base_url: pontoonBaseUrl, locale_team: teamCode } =
            await getOptions(['pontoon_base_url', 'locale_team']);
          openNewTab(pontoonTeamBugs(pontoonBaseUrl, { code: teamCode }));
        },
      } as Menus.CreateCreatePropertiesType,
      {
        title: 'Search in Pontoon',
        contexts: ['browser_action'],
        parentId: pontoonPagesMenuId,
        onclick: async () => {
          const { pontoon_base_url: pontoonBaseUrl, locale_team: teamCode } =
            await getOptions(['pontoon_base_url', 'locale_team']);
          openNewTab(
            pontoonSearchInProject(
              pontoonBaseUrl,
              { code: teamCode },
              { slug: 'all-projects' },
            ),
          );
        },
      } as Menus.CreateCreatePropertiesType,
    ].forEach((it) => createContextMenu(it));

    const searchMenuId = createContextMenu({
      title: 'Search l10n',
      contexts: ['browser_action'],
    });
    [
      {
        title: 'Search in Pontoon',
        contexts: ['browser_action'],
        parentId: searchMenuId,
        onclick: async () => {
          const { pontoon_base_url: pontoonBaseUrl, locale_team: teamCode } =
            await getOptions(['pontoon_base_url', 'locale_team']);
          openNewTab(
            pontoonSearchInProject(
              pontoonBaseUrl,
              { code: teamCode },
              { slug: 'all-projects' },
            ),
          );
        },
      } as Menus.CreateCreatePropertiesType,
      {
        title: 'Transvision',
        contexts: ['browser_action'],
        parentId: searchMenuId,
        onclick: () => openNewTab(transvisionHome(localeTeam)),
      } as Menus.CreateCreatePropertiesType,
      {
        title: 'Microsoft Terminology Search',
        contexts: ['browser_action'],
        parentId: searchMenuId,
        onclick: () => openNewTab(microsoftTerminologySearch()),
      } as Menus.CreateCreatePropertiesType,
    ].forEach((it) => createContextMenu(it));

    const localizationResourcesMenuId = createContextMenu({
      title: 'Other l10n sources',
      contexts: ['browser_action'],
    });
    [
      {
        title: `Mozilla Style Guide (${localeTeam})`,
        contexts: ['browser_action'],
        parentId: localizationResourcesMenuId,
        onclick: () => openNewTab(mozillaL10nStyleGuide(localeTeam)),
      } as Menus.CreateCreatePropertiesType,
      {
        title: `L10n:Teams:${localeTeam} - MozillaWiki`,
        contexts: ['browser_action'],
        parentId: localizationResourcesMenuId,
        onclick: () => openNewTab(mozillaWikiL10nTeamPage(localeTeam)),
      } as Menus.CreateCreatePropertiesType,
    ].forEach((it) => createContextMenu(it));

    createContextMenu({
      title: 'Pontoon Add-on wiki',
      contexts: ['browser_action'],
      onclick: () => openNewTab(pontoonAddonWiki()),
    });

    createContextMenu({
      title: 'Pontoon Add-on tour',
      contexts: ['browser_action'],
      onclick: () => openIntro(),
    });
  }
}
