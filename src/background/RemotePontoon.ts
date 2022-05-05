import URI from 'urijs';

import {
  deleteFromStorage,
  getOneFromStorage,
  listenToMessages,
  listenToMessagesExclusively,
  saveToStorage,
  StorageContent,
} from '@commons/webExtensionsApi';
import {
  pontoonSettings,
  toPontoonTeamSpecificProjectUrl,
  pontoonTeamsList,
} from '@commons/webLinks';
import { getOneOption, getOptions } from '@commons/options';

import {
  AUTOMATION_UTM_SOURCE,
  markAllNotificationsAsRead as markAllNotificationsAsReadUrl,
  pontoonGraphQL,
  pontoonUserData,
  bugzillaTeamComponents,
} from './apiEndpoints';
import { BackgroundClientMessageType } from './BackgroundClientMessageType';
import { pontoonHttpClient, httpClient } from './httpClients';
import { projectsListData } from './data/projectsListData';
import type { ProjectForCurrentTab } from './backgroundClient';

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

interface TeamsListGqlResponse {
  locales: Array<{
    code: string;
    name: string;
    approvedStrings: number;
    pretranslatedStrings: number;
    stringsWithWarnings: number;
    stringsWithErrors: number;
    missingStrings: number;
    unreviewedStrings: number;
    totalStrings: number;
  }>;
}

type Project = StorageContent['projectsList']['slug'];

interface ProjectGqlReponse {
  slug: string;
  name: string;
}

interface ProjectsListGqlResponse {
  projects: ProjectGqlReponse[];
}

function parseDOM(pageContent: string) {
  return new DOMParser().parseFromString(pageContent, 'text/html');
}

export function listenToMessagesFromClients() {
  listenToMessages(
    BackgroundClientMessageType.PAGE_LOADED,
    (message: { documentHTML?: string }) =>
      updateNotificationsIfThereAreNew(message.documentHTML!),
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
    async (_message, { url: fromUrl }) => {
      return getPontoonProjectForPageUrl(fromUrl!);
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
      Array.from(page.querySelectorAll('header .notification-item')).map(
        (n: any) => n.dataset.id,
      ),
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
    const latestActivityTime = row.querySelector(
      '.latest-activity time',
    ) as any;
    return {
      team: row.querySelector('.code a')?.textContent || '',
      user: latestActivityTime?.dataset?.userName || '',
      date_iso: latestActivityTime?.attributes?.datetime?.value || undefined,
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
  const [pontoonDataResponse, bugzillaComponentsResponse] = await Promise.all([
    httpClient.fetch(
      pontoonGraphQL(
        await getOneOption('pontoon_base_url'),
        '{locales{code,name,approvedStrings,pretranslatedStrings,stringsWithWarnings,stringsWithErrors,missingStrings,unreviewedStrings,totalStrings}}',
      ),
    ),
    httpClient.fetch(bugzillaTeamComponents()),
  ]);
  const pontoonData = (await pontoonDataResponse.json()) as {
    data: TeamsListGqlResponse;
  };
  const bugzillaComponents = (await bugzillaComponentsResponse.json()) as {
    [code: string]: string;
  };
  const sortedTeams = pontoonData.data.locales
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
  const pontoonDataResponse = await httpClient.fetch(
    pontoonGraphQL(
      await getOneOption('pontoon_base_url'),
      '{projects{slug,name}}',
    ),
  );
  const pontoonData = (await pontoonDataResponse.json()) as {
    data: ProjectsListGqlResponse;
  };
  const partialProjectsMap = new Map<
    ProjectGqlReponse['slug'],
    ProjectGqlReponse
  >();
  for (const project of pontoonData.data.projects) {
    partialProjectsMap.set(project.slug, project);
  }
  const projects = projectsListData.map((project) => ({
    ...project,
    ...partialProjectsMap.get(project.slug)!,
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
): Promise<ProjectForCurrentTab | undefined> {
  const toProjectMap = new Map<Project['domains'][number], Project>();
  const projectsList = await getOneFromStorage('projectsList');
  if (projectsList) {
    for (const project of Object.values(projectsList)) {
      for (const domain of project.domains) {
        toProjectMap.set(domain, project);
      }
    }
  }
  const { hostname } = URI.parse(pageUrl);
  const projectData = hostname ? toProjectMap.get(hostname) : undefined;
  if (projectData) {
    const { pontoon_base_url: pontoonBaseUrl, locale_team: teamCode } =
      await getOptions(['pontoon_base_url', 'locale_team']);
    return {
      name: projectData.name,
      pageUrl: toPontoonTeamSpecificProjectUrl(
        pontoonBaseUrl,
        { code: teamCode },
        URI.joinPaths('/', 'projects', projectData.slug).toString(),
      ),
      translationUrl: toPontoonTeamSpecificProjectUrl(
        pontoonBaseUrl,
        { code: teamCode },
        URI.joinPaths(
          '/',
          'projects',
          projectData.slug,
          'all-resources',
        ).toString(),
      ),
    };
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
  const language: any = parseDOM(await response.text()).querySelector(
    '#homepage .language',
  );
  return language?.dataset['code'] || undefined;
}
