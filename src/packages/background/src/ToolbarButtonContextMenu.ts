import type { Menus } from 'webextension-polyfill-ts';

import type { Options } from '@pontoon-addon/commons/src/Options';
import type { RemoteLinks } from '@pontoon-addon/commons/src/RemoteLinks';

import type { DataRefresher } from './DataRefresher';
import type { RemotePontoon } from './RemotePontoon';
import type { ToolbarButton } from './ToolbarButton';
import { browser } from './util/webExtensionsApi';

export class ToolbarButtonContextMenu {
  private readonly _options: Options;
  private readonly _remotePontoon: RemotePontoon;
  private readonly _remoteLinks: RemoteLinks;
  private readonly _dataRefresher: DataRefresher;
  private readonly _toolbarButton: ToolbarButton;

  constructor(
    options: Options,
    remotePontoon: RemotePontoon,
    remoteLinks: RemoteLinks,
    dataRefresher: DataRefresher,
    toolbarButton: ToolbarButton
  ) {
    this._options = options;
    this._remotePontoon = remotePontoon;
    this._remoteLinks = remoteLinks;
    this._dataRefresher = dataRefresher;
    this._toolbarButton = toolbarButton;

    this._addContextMenu();
  }

  private async _addContextMenu(): Promise<void> {
    const localeTeam = await this._options
      .get('locale_team')
      .then((item: any) => item['locale_team']);
    browser.contextMenus.create({
      title: 'Reload notifications',
      contexts: ['browser_action'],
      onclick: () => {
        this._toolbarButton.hideBadge();
        this._dataRefresher.refreshData();
      },
    });

    const pontoonPagesMenuId = browser.contextMenus.create({
      title: 'Pontoon',
      contexts: ['browser_action'],
    });
    [
      {
        title: 'Team page',
        contexts: ['browser_action'],
        parentId: pontoonPagesMenuId,
        onclick: () =>
          browser.tabs.create({ url: this._remotePontoon.getTeamPageUrl() }),
      } as Menus.CreateCreatePropertiesType,
      {
        title: 'Team bugs',
        contexts: ['browser_action'],
        parentId: pontoonPagesMenuId,
        onclick: () =>
          browser.tabs.create({ url: this._remotePontoon.getTeamBugsUrl() }),
      } as Menus.CreateCreatePropertiesType,
      {
        title: 'Search all projects',
        contexts: ['browser_action'],
        parentId: pontoonPagesMenuId,
        onclick: () =>
          browser.tabs.create({
            url: this._remotePontoon.getSearchInAllProjectsUrl(),
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
            url: this._remotePontoon.getSearchInAllProjectsUrl(),
          }),
      } as Menus.CreateCreatePropertiesType,
      {
        title: 'Transvision',
        contexts: ['browser_action'],
        parentId: searchMenuId,
        onclick: () =>
          browser.tabs.create({
            url: this._remoteLinks.getTransvisionUrl(localeTeam),
          }),
      } as Menus.CreateCreatePropertiesType,
      {
        title: 'Microsoft Terminology Search',
        contexts: ['browser_action'],
        parentId: searchMenuId,
        onclick: () =>
          browser.tabs.create({
            url: this._remoteLinks.getMicrosoftTerminologySearchUrl(),
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
            url: this._remoteLinks.getMozillaStyleGuidesUrl(localeTeam),
          }),
      } as Menus.CreateCreatePropertiesType,
      {
        title: `L10n:Teams:${localeTeam} - MozillaWiki`,
        contexts: ['browser_action'],
        parentId: localizationResourcesMenuId,
        onclick: () =>
          browser.tabs.create({
            url: this._remoteLinks.getMozillaWikiL10nTeamUrl(localeTeam),
          }),
      } as Menus.CreateCreatePropertiesType,
      {
        type: 'separator',
        contexts: ['browser_action'],
        parentId: localizationResourcesMenuId,
      } as Menus.CreateCreatePropertiesType,
      {
        title: 'Cambridge Dictionary',
        contexts: ['browser_action'],
        parentId: localizationResourcesMenuId,
        onclick: () =>
          browser.tabs.create({
            url: this._remoteLinks.getCambridgeDictionaryUrl(),
          }),
      } as Menus.CreateCreatePropertiesType,
      {
        type: 'separator',
        contexts: ['browser_action'],
        parentId: localizationResourcesMenuId,
      } as Menus.CreateCreatePropertiesType,
      {
        title: `Mozilla L10n Team Dashboard - ${localeTeam}`,
        contexts: ['browser_action'],
        parentId: localizationResourcesMenuId,
        onclick: () =>
          browser.tabs.create({
            url: this._remoteLinks.getElmoDashboardUrl(localeTeam),
          }),
      } as Menus.CreateCreatePropertiesType,
    ].forEach((it) => browser.contextMenus.create(it));

    browser.contextMenus.create({
      title: 'Pontoon Add-on wiki',
      contexts: ['browser_action'],
      onclick: () =>
        browser.tabs.create({
          url: this._remoteLinks.getPontoonAddonWikiUrl(),
        }),
    });

    browser.contextMenus.create({
      title: 'Open Pontoon Add-on tour',
      contexts: ['browser_action'],
      onclick: () =>
        browser.tabs.create({
          url: browser.runtime.getURL('packages/intro/dist/index.html'),
        }),
    });
  }
}
