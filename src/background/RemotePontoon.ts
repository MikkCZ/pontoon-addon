import URI from 'urijs';

import type { StorageContent } from '@commons/webExtensionsApi';
import {
  deleteFromStorage,
  getActiveTab,
  getOneFromStorage,
  listenToMessages,
  listenToMessagesExclusively,
  saveToStorage,
} from '@commons/webExtensionsApi';
import { pontoonSettings, pontoonTeamsList } from '@commons/webLinks';
import { getOneOption } from '@commons/options';

import {
  AUTOMATION_UTM_SOURCE,
  markAllNotificationsAsRead as markAllNotificationsAsReadUrl,
  pontoonUserData,
  bugzillaTeamComponents,
} from './apiEndpoints';
import { BackgroundClientMessageType } from './BackgroundClientMessageType';
import type { GetProjectsInfoResponse } from './httpClients';
import { pontoonHttpClient, httpClient, graphqlClient } from './httpClients';
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

export function listenToMessagesFromClients() {
  listenToMessages(
    BackgroundClientMessageType.PAGE_LOADED,
    (message: { documentHTML: string }) =>
      updateNotificationsIfThereAreNew(message.documentHTML),
  );
  listenToMessages(BackgroundClientMessageType.NOTIFICATIONS_READ, () =>
    markAllNotificationsAsRead(),
  );
  listenToMessagesExclusively(
    BackgroundClientMessageType.UPDATE_TEAMS_LIST,
    async () => {
      return updateTeamsList();
    },
  );
  listenToMessagesExclusively(
    BackgroundClientMessageType.GET_CURRENT_TAB_PROJECT,
    async () => {
      const activeTab = await getActiveTab();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return getPontoonProjectForPageUrl(activeTab.url!);
    },
  );
  listenToMessagesExclusively(
    BackgroundClientMessageType.GET_TEAM_FROM_PONTOON,
    async () => {
      return getUsersTeamFromPontoon();
    },
  );
}

export async function refreshData() {
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
      notificationsData[notification.id] = notification;
    }
    await saveToStorage({ notificationsData });
  } catch (error) {
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
    graphqlClient(await getOneOption('pontoon_base_url')).getTeamsInfo(),
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
  const pontoonData = await graphqlClient(
    await getOneOption('pontoon_base_url'),
  ).getProjectsInfo();
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
): Promise<Project | null> {
  const { hostname } = URI.parse(pageUrl);
  const projectsList = await getOneFromStorage('projectsList');
  if (hostname && projectsList) {
    return (
      Object.values(projectsList).find((project) =>
        project.domains.includes(hostname),
      ) ?? null
    );
  } else {
    return null;
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
