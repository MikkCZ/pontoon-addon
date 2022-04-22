import { Menus, Tabs } from 'webextension-polyfill';

import { Options } from '@commons/Options';
import { RemoteLinks } from '@commons/RemoteLinks';
import { browser } from '@commons/webExtensionsApi';

import {
  ProjectsListInStorage,
  ProjectsList,
  RemotePontoon,
  TeamsListInStorage,
  Team,
} from './RemotePontoon';

export class PageContextMenu {
  private readonly options: Options;
  private readonly remotePontoon: RemotePontoon;
  private readonly remoteLinks: RemoteLinks;

  constructor(
    options: Options,
    remotePontoon: RemotePontoon,
    remoteLinks: RemoteLinks,
  ) {
    this.options = options;
    this.remotePontoon = remotePontoon;
    this.remoteLinks = remoteLinks;

    this.watchStorageChangesAndOptionsUpdates();
    this.loadDataFromStorage();
  }

  private createContextMenus(projects: ProjectsList, team: Team): void {
    // Create website patterns for all projects in Pontoon.
    const mozillaWebsitesUrlPatterns: string[] = [];
    Object.values(projects).forEach((project) =>
      project.domains.forEach((domain) =>
        mozillaWebsitesUrlPatterns.push(`https://${domain}/*`),
      ),
    );

    // Recreate the selection context menus (report l10n bug & search in project)
    const mozillaPageContextMenuParent = PageContextMenu.recreateContextMenu({
      id: 'page-context-menu-parent',
      title: 'Pontoon Add-on',
      documentUrlPatterns: mozillaWebsitesUrlPatterns,
      contexts: ['selection'],
    });
    PageContextMenu.recreateContextMenu({
      id: 'page-context-menu-report-l10n-bug',
      title: 'Report l10n bug for "%s"',
      documentUrlPatterns: mozillaWebsitesUrlPatterns,
      contexts: ['selection'],
      parentId: mozillaPageContextMenuParent,
      onclick: (info: Menus.OnClickData, tab: Tabs.Tab) => {
        browser.tabs.create({
          url: this.remoteLinks.getBugzillaReportUrlForSelectedTextOnPage(
            info.selectionText!,
            tab.url!,
            team.code,
            team.bz_component,
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
                url: this.remotePontoon.getSearchInProjectUrl(
                  project.slug,
                  info.selectionText,
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
                url: this.remotePontoon.getSearchInAllProjectsUrl(
                  info.selectionText,
                ),
              }),
          } as Menus.CreateCreatePropertiesType,
        ])
        .forEach(PageContextMenu.recreateContextMenu);
    });
  }

  private static recreateContextMenu(
    contextMenuItem: Menus.CreateCreatePropertiesType,
  ): number | string {
    browser.contextMenus.remove(contextMenuItem.id!);
    return browser.contextMenus.create(contextMenuItem);
  }

  private watchStorageChangesAndOptionsUpdates(): void {
    this.remotePontoon.subscribeToProjectsListChange((_projectsList) =>
      this.loadDataFromStorage(),
    );
    this.remotePontoon.subscribeToTeamsListChange((_teamsList) =>
      this.loadDataFromStorage(),
    );
    this.options.subscribeToOptionChange('locale_team', (_teamOption) =>
      this.loadDataFromStorage(),
    );
  }

  private loadDataFromStorage(): void {
    const localeTeamOptionKey = 'locale_team';
    const teamsListDataKey = 'teamsList';
    const projectsListDataKey = 'projectsList';
    Promise.all([
      this.options.get(localeTeamOptionKey) as Promise<any>,
      browser.storage.local.get([teamsListDataKey, projectsListDataKey]),
    ]).then(([optionsItems, storageItems]) => {
      const team = optionsItems[localeTeamOptionKey] as string;
      const projectsList = (storageItems as ProjectsListInStorage).projectsList;
      const teamsList = (storageItems as TeamsListInStorage).teamsList;
      if (projectsList && teamsList) {
        this.createContextMenus(projectsList, teamsList[team]);
      }
    });
  }
}
