import type { Menus } from 'webextension-polyfill';

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
import {
  openNewTab,
  openIntro,
  createContextMenu,
} from '@commons/webExtensionsApi';
import { getOneOption } from '@commons/options';

import type { DataRefresher } from './DataRefresher';
import type { RemotePontoon } from './RemotePontoon';
import type { ToolbarButton } from './ToolbarButton';

export class ToolbarButtonContextMenu {
  private readonly remotePontoon: RemotePontoon;
  private readonly dataRefresher: DataRefresher;
  private readonly toolbarButton: ToolbarButton;

  constructor(
    remotePontoon: RemotePontoon,
    dataRefresher: DataRefresher,
    toolbarButton: ToolbarButton,
  ) {
    this.remotePontoon = remotePontoon;
    this.dataRefresher = dataRefresher;
    this.toolbarButton = toolbarButton;

    this.addContextMenu();
  }

  private async addContextMenu(): Promise<void> {
    const localeTeam = await getOneOption('locale_team');
    createContextMenu({
      title: 'Reload notifications',
      contexts: ['browser_action'],
      onclick: async () => {
        await this.toolbarButton.hideBadge();
        this.dataRefresher.refreshData();
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
        onclick: () =>
          openNewTab(
            pontoonTeam(
              this.remotePontoon.getBaseUrl(),
              this.remotePontoon.getTeam(),
            ),
          ),
      } as Menus.CreateCreatePropertiesType,
      {
        title: 'Team insights',
        contexts: ['browser_action'],
        parentId: pontoonPagesMenuId,
        onclick: () =>
          openNewTab(
            pontoonTeamInsights(
              this.remotePontoon.getBaseUrl(),
              this.remotePontoon.getTeam(),
            ),
          ),
      } as Menus.CreateCreatePropertiesType,
      {
        title: 'Team bugs',
        contexts: ['browser_action'],
        parentId: pontoonPagesMenuId,
        onclick: () =>
          openNewTab(
            pontoonTeamBugs(
              this.remotePontoon.getBaseUrl(),
              this.remotePontoon.getTeam(),
            ),
          ),
      } as Menus.CreateCreatePropertiesType,
      {
        title: 'Search in Pontoon',
        contexts: ['browser_action'],
        parentId: pontoonPagesMenuId,
        onclick: () =>
          openNewTab(
            pontoonSearchInProject(
              this.remotePontoon.getBaseUrl(),
              this.remotePontoon.getTeam(),
              { slug: 'all-projects' },
            ),
          ),
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
        onclick: () =>
          openNewTab(
            pontoonSearchInProject(
              this.remotePontoon.getBaseUrl(),
              this.remotePontoon.getTeam(),
              { slug: 'all-projects' },
            ),
          ),
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
