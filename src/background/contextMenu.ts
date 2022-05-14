import type { Menus, Tabs } from 'webextension-polyfill';

import {
  pontoonProjectTranslationView,
  newLocalizationBug,
  pontoonTeamsProject,
} from '@commons/webLinks';
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

const GENERIC_CONTEXTS: Menus.ContextType[] = [
  'page',
  'editable',
  'image',
  'video',
];
const SELECTED_TEXT_CONTEXTS: Menus.ContextType[] = ['selection'];

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

    const parentContextMenuId = await recreateContextMenu({
      id: 'page-context-menu-parent',
      title: 'Pontoon Add-on',
      documentUrlPatterns: mozillaWebsitesUrlPatterns,
      contexts: [...GENERIC_CONTEXTS, ...SELECTED_TEXT_CONTEXTS],
    });
    const allProjectsMenuItems = Object.values(projects).flatMap((project) =>
      contextMenuItemsForProject(project, pontoonBaseUrl, team),
    );
    for (const item of allProjectsMenuItems) {
      await recreateContextMenu({
        ...item,
        parentId: parentContextMenuId,
      });
    }
    await recreateContextMenu({
      id: `search-in-all-projects`,
      title: `Search for "%s" in ${team.name} translations of all projects`,
      documentUrlPatterns: mozillaWebsitesUrlPatterns,
      contexts: SELECTED_TEXT_CONTEXTS,
      parentId: parentContextMenuId,
      onclick: (info: Menus.OnClickData) => {
        openNewTab(
          pontoonProjectTranslationView(
            pontoonBaseUrl,
            team,
            { slug: 'all-projects' },
            info.selectionText,
          ),
        );
      },
    });
    await recreateContextMenu({
      id: 'report-l10n-bug',
      title: 'Report l10n bug for "%s"',
      documentUrlPatterns: mozillaWebsitesUrlPatterns,
      contexts: SELECTED_TEXT_CONTEXTS,
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
  team: StorageContent['teamsList'][string],
): Menus.CreateCreatePropertiesType[] {
  const documentUrlPatterns = project.domains.map(
    (domain) => `https://${domain}/*`,
  );
  return [
    {
      id: `open-project-dashboard-${project.slug}`,
      title: `Open ${project.name} dashboard for ${team.name}`,
      documentUrlPatterns,
      contexts: [...GENERIC_CONTEXTS, ...SELECTED_TEXT_CONTEXTS],
      onclick: () => {
        openNewTab(pontoonTeamsProject(pontoonBaseUrl, team, project));
      },
    },
    {
      id: `open-translation-view-${project.slug}`,
      title: `Open ${project.name} translation view for ${team.name}`,
      documentUrlPatterns,
      contexts: GENERIC_CONTEXTS,
      onclick: () => {
        openNewTab(
          pontoonProjectTranslationView(pontoonBaseUrl, team, project),
        );
      },
    },
    {
      id: `search-in-project-${project.slug}`,
      title: `Search for "%s" in ${team.name} translations of ${project.name}`,
      documentUrlPatterns,
      contexts: SELECTED_TEXT_CONTEXTS,
      onclick: (info: Menus.OnClickData) => {
        openNewTab(
          pontoonProjectTranslationView(
            pontoonBaseUrl,
            team,
            project,
            info.selectionText,
          ),
        );
      },
    },
  ];
}

async function recreateContextMenu(
  contextMenuItem: Menus.CreateCreatePropertiesType,
): Promise<number | string> {
  try {
    await removeContextMenu(contextMenuItem.id!);
  } catch (error) {
    console.info(
      `Could not remove context menu id='${contextMenuItem.id}' title='${contextMenuItem.title}'. Most likely it did not exist.`,
      error,
    );
  }
  return createContextMenu(contextMenuItem);
}
