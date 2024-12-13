import URI from 'urijs';

import type { StorageContent } from '@commons/webExtensionsApi';
import {
  deleteFromStorage,
  getActiveTab,
  getOneFromStorage,
  listenToMessages,
  listenToMessagesAndRespond,
  saveToStorage,
} from '@commons/webExtensionsApi';
import { pontoonSettings, pontoonTeamsList } from '@commons/webLinks';
import { getOneOption, resetDefaultOptions, setOption } from '@commons/options';

import {
  AUTOMATION_UTM_SOURCE,
  markAllNotificationsAsRead as markAllNotificationsAsReadUrl,
  pontoonUserData,
  bugzillaTeamComponents,
} from './apiEndpoints';
import { httpClient } from './httpClients/httpClient';
import type { GetProjectsInfoResponse } from './httpClients/pontoonGraphqlClient';
import { pontoonGraphqlClient } from './httpClients/pontoonGraphqlClient';
import { pontoonHttpClient } from './httpClients/pontoonHttpClient';
import { projectsListData } from './data/projectsListData';

type GetProjectsInfoProject = GetProjectsInfoResponse['projects'][number];

interface UserDataApiResponse {
  notifications: {
    has_unread: boolean;
    notifications: Array<{
      id: number;
      unread: boolean;
      actor?: {
        anchor: string;
        url: string;
      };
      target?: {
        anchor: string;
        url: string;
      };
      verb?: string;
      description?: {
        safe: boolean;
        content?: string;
        is_comment?: boolean;
      };
      date_iso?: string;
    }>;
  };
}

type Project = StorageContent['projectsList']['slug'];

function parseDOM(pageContent: string) {
  return new DOMParser().parseFromString(pageContent, 'text/html');
}

export function initMessageListeners() {
  listenToMessages<'PAGE_LOADED'>('pontoon-page-loaded', ({ documentHTML }) =>
    updateNotificationsIfThereAreNew(documentHTML),
  );
  listenToMessages<'NOTIFICATIONS_READ'>('notifications-read', () =>
    markAllNotificationsAsRead(),
  );
  listenToMessagesAndRespond<'UPDATE_TEAMS_LIST'>(
    'update-teams-list',
    async () => {
      return await updateTeamsList();
    },
  );
  listenToMessagesAndRespond<'GET_CURRENT_TAB_PROJECT'>(
    'get-current-tab-project',
    async () => {
      const activeTab = await getActiveTab();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return getPontoonProjectForPageUrl(activeTab.url!);
    },
  );
  listenToMessagesAndRespond<'GET_TEAM_FROM_PONTOON'>(
    'get-team-from-pontoon',
    async () => {
      return await getUsersTeamFromPontoon();
    },
  );
  listenToMessagesAndRespond<'RESET_DEFAULT_OPTIONS'>(
    'reset-default-options',
    async () => {
      await resetDefaultOptions();
      await initOptions();
      return {
        type: 'default-options-reset',
      };
    },
  );
}

export async function initOptions() {
  const localeTeamOption = await getOneOption('locale_team');
  if (typeof localeTeamOption !== 'string') {
    const teamFromPontoon = await getUsersTeamFromPontoon();
    if (typeof teamFromPontoon === 'string') {
      await setOption('locale_team', teamFromPontoon);
    }
  }
}

export async function refreshData(context: {
  event: 'user interaction' | 'automation';
}) {
  if (context.event === 'user interaction') {
    await saveToStorage({ notificationsDataLoadingState: 'loading' });
  }
  await Promise.all([
    updateNotificationsData(),
    updateLatestTeamActivity(),
    updateTeamsList(),
    updateProjectsList(),
  ]);
}

async function updateNotificationsIfThereAreNew(pageContent: string) {
  const page = parseDOM(pageContent);
  if (page.querySelector('header #notifications')) {
    const [notificationsData, notificationsIdsFromPage] = await Promise.all([
      getOneFromStorage('notificationsData'),
      Array.from(
        page.querySelectorAll<HTMLElement>('header .notification-item'),
      )
        .map((n) => n.dataset['id'] ?? '')
        .filter((id) => id !== ''),
    ]);
    if (
      !notificationsData ||
      !notificationsIdsFromPage.every((id) => id in notificationsData)
    ) {
      updateNotificationsData();
    }
  }
}

async function updateNotificationsData() {
  try {
    const reponse = await pontoonHttpClient.fetchFromPontoonSession(
      pontoonUserData(await getOneOption('pontoon_base_url')),
    );
    const userData = (await reponse.json()) as UserDataApiResponse;
    const notificationsData: StorageContent['notificationsData'] = {};
    for (const notification of userData.notifications.notifications) {
      notificationsData[notification.id] = {
        ...notification,
        verb: notification.verb === 'ignore' ? undefined : notification.verb,
      };
    }
    await saveToStorage({
      notificationsData,
      notificationsDataLoadingState: 'loaded',
    });
  } catch (error) {
    await saveToStorage({ notificationsDataLoadingState: 'error' });
    await deleteFromStorage('notificationsData');
    console.error(error);
  }
}

async function updateLatestTeamActivity() {
  const reponse = await httpClient.fetch(
    pontoonTeamsList(
      await getOneOption('pontoon_base_url'),
      AUTOMATION_UTM_SOURCE,
    ),
  );
  const allTeamsPageContent = await reponse.text();
  const latestActivityArray = Array.from(
    parseDOM(allTeamsPageContent).querySelectorAll('.team-list tbody tr'),
  ).map((row): StorageContent['latestTeamsActivity'][string] => {
    const latestActivityTime = row.querySelector<HTMLElement>(
      '.latest-activity time',
    );
    return {
      team: row.querySelector('.code a')?.textContent ?? '',
      user: latestActivityTime?.dataset['userName'] ?? '',
      date_iso: latestActivityTime?.attributes.getNamedItem('datetime')?.value,
    };
  });
  const latestTeamsActivity: StorageContent['latestTeamsActivity'] = {};
  for (const latestTeamActivity of latestActivityArray) {
    latestTeamsActivity[latestTeamActivity.team] = latestTeamActivity;
  }
  if (Object.keys(latestTeamsActivity).length > 0) {
    await saveToStorage({ latestTeamsActivity });
  } else {
    await deleteFromStorage('latestTeamsActivity');
  }
}

async function updateTeamsList(): Promise<StorageContent['teamsList']> {
  const [pontoonData, bugzillaComponentsResponse] = await Promise.all([
    pontoonGraphqlClient.getTeamsInfo(),
    httpClient.fetch(bugzillaTeamComponents()),
  ]);
  const bugzillaComponents = (await bugzillaComponentsResponse.json()) as {
    [code: string]: string;
  };
  const sortedTeams = pontoonData.locales
    .filter((team) => team.totalStrings > 0)
    .sort((team1, team2) => team1.code.localeCompare(team2.code));
  const teamsList: StorageContent['teamsList'] = {};
  for (const team of sortedTeams) {
    teamsList[team.code] = {
      code: team.code,
      name: team.name,
      strings: {
        approvedStrings: team.approvedStrings,
        pretranslatedStrings: team.pretranslatedStrings,
        stringsWithWarnings: team.stringsWithWarnings,
        stringsWithErrors: team.stringsWithErrors,
        missingStrings: team.missingStrings,
        unreviewedStrings: team.unreviewedStrings,
        totalStrings: team.totalStrings,
      },
      bz_component: bugzillaComponents[team.code],
    };
  }
  await saveToStorage({ teamsList });
  return teamsList;
}

async function updateProjectsList(): Promise<StorageContent['projectsList']> {
  const pontoonData = await pontoonGraphqlClient.getProjectsInfo();
  const partialProjectsMap = new Map<
    GetProjectsInfoProject['slug'],
    GetProjectsInfoProject
  >();
  for (const project of pontoonData.projects) {
    partialProjectsMap.set(project.slug, project);
  }
  const projects = projectsListData.map((project) => ({
    ...project,
    ...partialProjectsMap.get(project.slug)!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
  }));
  const projectsList: StorageContent['projectsList'] = {};
  for (const project of projects) {
    projectsList[project.slug] = project;
  }
  await saveToStorage({ projectsList });
  return projectsList;
}

export async function getPontoonProjectForPageUrl(
  pageUrl: string,
): Promise<Project | undefined> {
  const { hostname } = URI.parse(pageUrl);
  const projectsList = await getOneFromStorage('projectsList');
  if (hostname && projectsList) {
    return Object.values(projectsList).find((project) =>
      project.domains.includes(hostname),
    );
  } else {
    return undefined;
  }
}

async function markAllNotificationsAsRead(): Promise<void> {
  const [response, notificationsData] = await Promise.all([
    pontoonHttpClient.fetchFromPontoonSession(
      markAllNotificationsAsReadUrl(await getOneOption('pontoon_base_url')),
    ),
    getOneFromStorage('notificationsData'),
  ]);
  if (response.ok && typeof notificationsData !== 'undefined') {
    for (const notification of Object.values(notificationsData)) {
      notification.unread = false;
    }
    await saveToStorage({ notificationsData });
  }
}

async function getUsersTeamFromPontoon(): Promise<string | undefined> {
  const response = await pontoonHttpClient.fetchFromPontoonSession(
    pontoonSettings(
      await getOneOption('pontoon_base_url'),
      AUTOMATION_UTM_SOURCE,
    ),
  );
  const language = parseDOM(await response.text()).querySelector<HTMLElement>(
    '#homepage .language',
  );
  return language?.dataset['code'];
}
