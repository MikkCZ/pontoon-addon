import { Menus, Tabs } from 'webextension-polyfill-ts';

import { Options } from '@pontoon-addon/commons/src/Options';
import { RemoteLinks } from '@pontoon-addon/commons/src/RemoteLinks';

import {
  ProjectsListInStorage,
  ProjectsList,
  RemotePontoon,
  TeamsListInStorage,
  Team,
} from './RemotePontoon';
import { browser } from './util/webExtensionsApi';

export class PageContextMenu {
  private readonly _options: Options;
  private readonly _remotePontoon: RemotePontoon;
  private readonly _remoteLinks: RemoteLinks;

  constructor(
    options: Options,
    remotePontoon: RemotePontoon,
    remoteLinks: RemoteLinks
  ) {
    this._options = options;
    this._remotePontoon = remotePontoon;
    this._remoteLinks = remoteLinks;

    this._watchStorageChangesAndOptionsUpdates();
    this._loadDataFromStorage();
  }

  private _createContextMenus(projects: ProjectsList, team: Team): void {
    // Create website patterns for all projects in Pontoon.
    const mozillaWebsitesUrlPatterns: string[] = [];
    Object.values(projects).forEach((project) =>
      project.domains.forEach((domain) =>
        mozillaWebsitesUrlPatterns.push(`https://${domain}/*`)
      )
    );

    // Recreate the selection context menus (report l10n bug & search in project)
    const mozillaPageContextMenuParent = PageContextMenu._recreateContextMenu({
      id: 'page-context-menu-parent',
      title: 'Pontoon Add-on',
      documentUrlPatterns: mozillaWebsitesUrlPatterns,
      contexts: ['selection'],
    });
    PageContextMenu._recreateContextMenu({
      id: 'page-context-menu-report-l10n-bug',
      title: 'Report l10n bug for "%s"',
      documentUrlPatterns: mozillaWebsitesUrlPatterns,
      contexts: ['selection'],
      parentId: mozillaPageContextMenuParent,
      onclick: (info: Menus.OnClickData, tab: Tabs.Tab) => {
        browser.tabs.create({
          url: this._remoteLinks.getBugzillaReportUrlForSelectedTextOnPage(
            info.selectionText!,
            tab.url!,
            team.code,
            team.bz_component
          ),
        });
      },
    });
    Object.values(projects).forEach((project) => {
      project.domains
        .flatMap((domain) => [
          {
            id: `page-context-menu-search-${project.slug}-${domain}`,
            title: `Search for "%s" in Pontoon (${project.name})`,
            documentUrlPatterns: [`https://${domain}/*`],
            contexts: ['selection'],
            parentId: mozillaPageContextMenuParent,
            onclick: (info: Menus.OnClickData, _tab: Tabs.Tab) =>
              browser.tabs.create({
                url: this._remotePontoon.getSearchInProjectUrl(
                  project.slug,
                  info.selectionText
                ),
              }),
          } as Menus.CreateCreatePropertiesType,
          {
            id: `page-context-menu-search-all-${domain}`,
            title: 'Search for "%s" in Pontoon (all projects)',
            documentUrlPatterns: [`https://${domain}/*`],
            contexts: ['selection'],
            parentId: mozillaPageContextMenuParent,
            onclick: (info: Menus.OnClickData, _tab: Tabs.Tab) =>
              browser.tabs.create({
                url: this._remotePontoon.getSearchInAllProjectsUrl(
                  info.selectionText
                ),
              }),
          } as Menus.CreateCreatePropertiesType,
        ])
        .forEach(PageContextMenu._recreateContextMenu);
    });
  }

  private static _recreateContextMenu(
    contextMenuItem: Menus.CreateCreatePropertiesType
  ): number | string {
    browser.contextMenus.remove(contextMenuItem.id!);
    return browser.contextMenus.create(contextMenuItem);
  }

  private _watchStorageChangesAndOptionsUpdates(): void {
    this._remotePontoon.subscribeToProjectsListChange((_projectsList) =>
      this._loadDataFromStorage()
    );
    this._remotePontoon.subscribeToTeamsListChange((_teamsList) =>
      this._loadDataFromStorage()
    );
    this._options.subscribeToOptionChange('locale_team', (_teamOption) =>
      this._loadDataFromStorage()
    );
  }

  private _loadDataFromStorage(): void {
    const localeTeamOptionKey = 'locale_team';
    const teamsListDataKey = 'teamsList';
    const projectsListDataKey = 'projectsList';
    Promise.all([
      this._options.get(localeTeamOptionKey) as Promise<any>,
      browser.storage.local.get([teamsListDataKey, projectsListDataKey]),
    ]).then(([optionsItems, storageItems]) => {
      const team = optionsItems[localeTeamOptionKey] as string;
      const projectsList = (storageItems as ProjectsListInStorage).projectsList;
      const teamsList = (storageItems as TeamsListInStorage).teamsList;
      if (projectsList && teamsList) {
        this._createContextMenus(projectsList, teamsList[team]);
      }
    });
  }
}
