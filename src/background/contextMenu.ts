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
import { getOptions, listenToOptionChange } from '@commons/options';
import { OptionsContent } from '@commons/data/defaultOptions';

export function setupPageContextMenus() {
  listenToStorageChange('projectsList', () => createContextMenuItems());
  listenToStorageChange('teamsList', () => createContextMenuItems());
  listenToOptionChange('pontoon_base_url', () => createContextMenuItems());
  listenToOptionChange('locale_team', () => createContextMenuItems());
  createContextMenuItems();
}

async function createContextMenuItems() {
  const [
    { pontoon_base_url: pontoonBaseUrl, locale_team: teamCode },
    { projectsList: projects, teamsList },
  ] = await Promise.all([
    getOptions(['pontoon_base_url', 'locale_team']),
    getFromStorage(['projectsList', 'teamsList']),
  ]);
  if (projects && teamsList) {
    const team = teamsList[teamCode];

    const mozillaWebsitesUrlPatterns = Object.values(projects)
      .flatMap((project) => project.domains)
      .map((domain) => `https://${domain}/*`);

    const parentContextMenuId = recreateContextMenu({
      id: 'page-context-menu-parent',
      title: 'Pontoon Add-on',
      documentUrlPatterns: mozillaWebsitesUrlPatterns,
      contexts: ['selection'],
    });
    Object.values(projects)
      .flatMap((project) =>
        contextMenuItemsForProject(project, pontoonBaseUrl, team),
      )
      .forEach((item) =>
        recreateContextMenu({
          ...item,
          contexts: ['selection'],
          parentId: parentContextMenuId,
        }),
      );
    recreateContextMenu({
      id: 'page-context-menu-report-l10n-bug',
      title: 'Report l10n bug for "%s"',
      documentUrlPatterns: mozillaWebsitesUrlPatterns,
      contexts: ['selection'],
      parentId: parentContextMenuId,
      onclick: (info: Menus.OnClickData, tab: Tabs.Tab) =>
        openNewTab(
          newLocalizationBug({
            team,
            selectedText: info.selectionText ?? '',
            url: tab.url!,
          }),
        ),
    });
  }
}

function contextMenuItemsForProject(
  project: StorageContent['projectsList'][string],
  pontoonBaseUrl: OptionsContent['pontoon_base_url'],
  team: { code: string },
): Menus.CreateCreatePropertiesType[] {
  return project.domains
    .flatMap((domain) => ({ project, domain }))
    .flatMap(({ project, domain }) => {
      const domainSlug = domain.replace('.', '_');
      return [
        {
          id: `page-context-menu-search-${project.slug}-${domainSlug}`,
          title: `Search for "%s" in Pontoon (${project.name})`,
          documentUrlPatterns: [`https://${domain}/*`],
          onclick: async (info: Menus.OnClickData) => {
            openNewTab(
              pontoonSearchInProject(
                pontoonBaseUrl,
                team,
                project,
                info.selectionText,
              ),
            );
          },
        },
        {
          id: `page-context-menu-search-all-${domainSlug}`,
          title: 'Search for "%s" in Pontoon (all projects)',
          documentUrlPatterns: [`https://${domain}/*`],
          onclick: async (info: Menus.OnClickData) => {
            openNewTab(
              pontoonSearchInProject(
                pontoonBaseUrl,
                team,
                { slug: 'all-projects' },
                info.selectionText,
              ),
            );
          },
        },
      ];
    });
}

function recreateContextMenu(
  contextMenuItem: Menus.CreateCreatePropertiesType,
): number | string {
  removeContextMenu(contextMenuItem.id!);
  return createContextMenu(contextMenuItem);
}
