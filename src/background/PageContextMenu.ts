import type { Menus, Tabs } from 'webextension-polyfill';

import { pontoonSearchInProject, newLocalizationBug } from '@commons/webLinks';
import {
  openNewTab,
  getFromStorage,
  createContextMenu,
  removeContextMenu,
  listenToStorageChange,
  StorageContent,
} from '@commons/webExtensionsApi';
import {
  getOneOption,
  getOptions,
  listenToOptionChange,
} from '@commons/options';

export class PageContextMenu {
  constructor() {
    listenToStorageChange('projectsList', () => this.loadDataFromStorage());
    listenToStorageChange('teamsList', () => this.loadDataFromStorage());
    listenToOptionChange('locale_team', () => this.loadDataFromStorage());
    this.loadDataFromStorage();
  }

  private createContextMenus(
    projects: StorageContent['projectsList'],
    team: StorageContent['teamsList'][string],
  ): void {
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
            onclick: async (info: Menus.OnClickData, _tab: Tabs.Tab) => {
              const {
                pontoon_base_url: pontoonBaseUrl,
                locale_team: teamCode,
              } = await getOptions(['pontoon_base_url', 'locale_team']);
              openNewTab(
                pontoonSearchInProject(
                  pontoonBaseUrl,
                  { code: teamCode },
                  project,
                  info.selectionText,
                ),
              );
            },
          } as Menus.CreateCreatePropertiesType,
          {
            id: `page-context-menu-search-all-${domain}`,
            title: 'Search for "%s" in Pontoon (all projects)',
            documentUrlPatterns: [`https://${domain}/*`],
            contexts: ['selection'],
            parentId: mozillaPageContextMenuParent,
            onclick: async (info: Menus.OnClickData, _tab: Tabs.Tab) => {
              const {
                pontoon_base_url: pontoonBaseUrl,
                locale_team: teamCode,
              } = await getOptions(['pontoon_base_url', 'locale_team']);
              openNewTab(
                pontoonSearchInProject(
                  pontoonBaseUrl,
                  { code: teamCode },
                  { slug: 'all-projects' },
                  info.selectionText,
                ),
              );
            },
          } as Menus.CreateCreatePropertiesType,
        ])
        .forEach(PageContextMenu.recreateContextMenu);
    });
  }

  private static recreateContextMenu(
    contextMenuItem: Menus.CreateCreatePropertiesType,
  ): number | string {
    removeContextMenu(contextMenuItem.id!);
    return createContextMenu(contextMenuItem);
  }

  private async loadDataFromStorage(): Promise<void> {
    const [teamCode, { projectsList, teamsList }] = await Promise.all([
      getOneOption('locale_team'),
      getFromStorage(['teamsList', 'projectsList']),
    ]);
    if (projectsList && teamsList) {
      this.createContextMenus(projectsList, teamsList[teamCode]);
    }
  }
}
