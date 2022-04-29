import type { Menus } from 'webextension-polyfill';

import type { Options } from '@commons/Options';
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
import { browser } from '@commons/webExtensionsApi';

import type { DataRefresher } from './DataRefresher';
import type { RemotePontoon } from './RemotePontoon';
import type { ToolbarButton } from './ToolbarButton';

export class ToolbarButtonContextMenu {
  private readonly options: Options;
  private readonly remotePontoon: RemotePontoon;
  private readonly dataRefresher: DataRefresher;
  private readonly toolbarButton: ToolbarButton;

  constructor(
    options: Options,
    remotePontoon: RemotePontoon,
    dataRefresher: DataRefresher,
    toolbarButton: ToolbarButton,
  ) {
    this.options = options;
    this.remotePontoon = remotePontoon;
    this.dataRefresher = dataRefresher;
    this.toolbarButton = toolbarButton;

    this.addContextMenu();
  }

  private async addContextMenu(): Promise<void> {
    const localeTeam = await this.options
      .get('locale_team')
      .then((item: any) => item['locale_team']);
    browser.contextMenus.create({
      title: 'Reload notifications',
      contexts: ['browser_action'],
      onclick: () => {
        this.toolbarButton.hideBadge();
        this.dataRefresher.refreshData();
      },
    });

    const pontoonPagesMenuId = browser.contextMenus.create({
      title: 'Pontoon',
      contexts: ['browser_action'],
    });
    [
      {
        title: 'Team dashboard',
        contexts: ['browser_action'],
        parentId: pontoonPagesMenuId,
        onclick: () =>
          browser.tabs.create({
            url: pontoonTeam(
              this.remotePontoon.getBaseUrl(),
              this.remotePontoon.getTeam(),
            ),
          }),
      } as Menus.CreateCreatePropertiesType,
      {
        title: 'Team insights',
        contexts: ['browser_action'],
        parentId: pontoonPagesMenuId,
        onclick: () =>
          browser.tabs.create({
            url: pontoonTeamInsights(
              this.remotePontoon.getBaseUrl(),
              this.remotePontoon.getTeam(),
            ),
          }),
      } as Menus.CreateCreatePropertiesType,
      {
        title: 'Team bugs',
        contexts: ['browser_action'],
        parentId: pontoonPagesMenuId,
        onclick: () =>
          browser.tabs.create({
            url: pontoonTeamBugs(
              this.remotePontoon.getBaseUrl(),
              this.remotePontoon.getTeam(),
            ),
          }),
      } as Menus.CreateCreatePropertiesType,
      {
        title: 'Search in Pontoon',
        contexts: ['browser_action'],
        parentId: pontoonPagesMenuId,
        onclick: () =>
          browser.tabs.create({
            url: pontoonSearchInProject(
              this.remotePontoon.getBaseUrl(),
              this.remotePontoon.getTeam(),
              { slug: 'all-projects' },
            ),
          }),
      } as Menus.CreateCreatePropertiesType,
    ].forEach((it) => browser.contextMenus.create(it));

    const searchMenuId = browser.contextMenus.create({
      title: 'Search l10n',
      contexts: ['browser_action'],
    });
    [
      {
        title: 'Search in Pontoon',
        contexts: ['browser_action'],
        parentId: searchMenuId,
        onclick: () =>
          browser.tabs.create({
            url: pontoonSearchInProject(
              this.remotePontoon.getBaseUrl(),
              this.remotePontoon.getTeam(),
              { slug: 'all-projects' },
            ),
          }),
      } as Menus.CreateCreatePropertiesType,
      {
        title: 'Transvision',
        contexts: ['browser_action'],
        parentId: searchMenuId,
        onclick: () =>
          browser.tabs.create({
            url: transvisionHome(localeTeam),
          }),
      } as Menus.CreateCreatePropertiesType,
      {
        title: 'Microsoft Terminology Search',
        contexts: ['browser_action'],
        parentId: searchMenuId,
        onclick: () =>
          browser.tabs.create({
            url: microsoftTerminologySearch(),
          }),
      } as Menus.CreateCreatePropertiesType,
    ].forEach((it) => browser.contextMenus.create(it));

    const localizationResourcesMenuId = browser.contextMenus.create({
      title: 'Other l10n sources',
      contexts: ['browser_action'],
    });
    [
      {
        title: `Mozilla Style Guide (${localeTeam})`,
        contexts: ['browser_action'],
        parentId: localizationResourcesMenuId,
        onclick: () =>
          browser.tabs.create({
            url: mozillaL10nStyleGuide(localeTeam),
          }),
      } as Menus.CreateCreatePropertiesType,
      {
        title: `L10n:Teams:${localeTeam} - MozillaWiki`,
        contexts: ['browser_action'],
        parentId: localizationResourcesMenuId,
        onclick: () =>
          browser.tabs.create({
            url: mozillaWikiL10nTeamPage(localeTeam),
          }),
      } as Menus.CreateCreatePropertiesType,
    ].forEach((it) => browser.contextMenus.create(it));

    browser.contextMenus.create({
      title: 'Pontoon Add-on wiki',
      contexts: ['browser_action'],
      onclick: () =>
        browser.tabs.create({
          url: pontoonAddonWiki(),
        }),
    });

    browser.contextMenus.create({
      title: 'Pontoon Add-on tour',
      contexts: ['browser_action'],
      onclick: () =>
        browser.tabs.create({
          url: browser.runtime.getURL('frontend/intro.html'),
        }),
    });
  }
}
