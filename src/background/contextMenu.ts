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

const NON_SELECTION_CONTEXTS: Menus.ContextType[] = [
  'page',
  'editable',
  'image',
  'video',
];
const SELECTION_CONTEXTS: Menus.ContextType[] = ['selection'];

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

    const parentContextMenuId = await recreateContextMenu({
      id: 'page-context-menu-parent',
      title: 'Pontoon Add-on',
      documentUrlPatterns: Object.values(projects)
        .flatMap((project) => project.domains)
        .map((domain) => `https://${domain}/*`),
      contexts: [...NON_SELECTION_CONTEXTS, ...SELECTION_CONTEXTS],
    });

    for (const project of Object.values(projects)) {
      for (const item of contextMenuItemsForProject(
        project,
        team,
        pontoonBaseUrl,
      )) {
        await recreateContextMenu({
          ...item,
          parentId: parentContextMenuId,
        });
      }
    }
  }
}

function contextMenuItemsForProject(
  project: StorageContent['projectsList'][string],
  team: StorageContent['teamsList'][string],
  pontoonBaseUrl: OptionsContent['pontoon_base_url'],
): Menus.CreateCreatePropertiesType[] {
  const documentUrlPatterns = project.domains.map(
    (domain) => `https://${domain}/*`,
  );
  return [
    {
      id: `open-project-dashboard-${project.slug}`,
      title: `Open ${project.name} dashboard for ${team.name}`,
      documentUrlPatterns,
      contexts: [...NON_SELECTION_CONTEXTS, ...SELECTION_CONTEXTS],
      onclick: () => {
        openNewTab(pontoonTeamsProject(pontoonBaseUrl, team, project));
      },
    },
    {
      id: `open-translation-view-${project.slug}`,
      title: `Open ${project.name} translation view for ${team.name}`,
      documentUrlPatterns,
      contexts: NON_SELECTION_CONTEXTS,
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
      contexts: SELECTION_CONTEXTS,
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
    {
      id: `search-in-all-projects-${project.slug}`,
      title: `Search for "%s" in ${team.name} translations of all projects`,
      documentUrlPatterns,
      contexts: SELECTION_CONTEXTS,
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
    },
    {
      id: `report-bug-for-localization-of-project-${project.slug}`,
      title: `Report bug for localization of ${project.name} to ${team.name}`,
      documentUrlPatterns,
      contexts: NON_SELECTION_CONTEXTS,
      onclick: (_info: Menus.OnClickData, tab: Tabs.Tab) =>
        openNewTab(
          newLocalizationBug({
            team,
            url: tab.url!,
          }),
        ),
    },
    {
      id: `report-bug-for-localization-of-selected-text-${project.slug}`,
      title: 'Report bug for localization of "%s"',
      documentUrlPatterns,
      contexts: SELECTION_CONTEXTS,
      onclick: (info: Menus.OnClickData, tab: Tabs.Tab) =>
        openNewTab(
          newLocalizationBug({
            team,
            selectedText: info.selectionText ?? '',
            url: tab.url!,
          }),
        ),
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
