import { Menus, Tabs } from 'webextension-polyfill';

import { Options } from '@commons/Options';
import { pontoonSearchInProject, newLocalizationBug } from '@commons/webLinks';
import { browser, openNewTab, getFromStorage } from '@commons/webExtensionsApi';

import { ProjectsList, RemotePontoon, Team } from './RemotePontoon';

export class PageContextMenu {
  private readonly options: Options;
  private readonly remotePontoon: RemotePontoon;

  constructor(options: Options, remotePontoon: RemotePontoon) {
    this.options = options;
    this.remotePontoon = remotePontoon;

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
      onclick: (info: Menus.OnClickData, tab: Tabs.Tab) =>
        openNewTab(
          newLocalizationBug({
            team,
            selectedText: info.selectionText ?? '',
            url: tab.url!,
          }),
        ),
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
              openNewTab(
                pontoonSearchInProject(
                  this.remotePontoon.getBaseUrl(),
                  this.remotePontoon.getTeam(),
                  project,
                  info.selectionText,
                ),
              ),
          } as Menus.CreateCreatePropertiesType,
          {
            id: `page-context-menu-search-all-${domain}`,
            title: 'Search for "%s" in Pontoon (all projects)',
            documentUrlPatterns: [`https://${domain}/*`],
            contexts: ['selection'],
            parentId: mozillaPageContextMenuParent,
            onclick: (info: Menus.OnClickData, _tab: Tabs.Tab) =>
              openNewTab(
                pontoonSearchInProject(
                  this.remotePontoon.getBaseUrl(),
                  this.remotePontoon.getTeam(),
                  { slug: 'all-projects' },
                  info.selectionText,
                ),
              ),
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

  private async loadDataFromStorage(): Promise<void> {
    const localeTeamOptionKey = 'locale_team';
    const [optionsItems, { projectsList, teamsList }] = await Promise.all([
      this.options.get(localeTeamOptionKey),
      getFromStorage<'teamsList' | 'projectsList'>([
        'teamsList',
        'projectsList',
      ]),
    ]);
    const teamCode = optionsItems[localeTeamOptionKey] as string;
    if (projectsList && teamsList) {
      this.createContextMenus(projectsList, teamsList[teamCode]);
    }
  }
}
