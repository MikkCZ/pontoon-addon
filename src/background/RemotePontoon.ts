import URI from 'urijs';

import {
  deleteFromStorage,
  getActiveTab,
  getOneFromStorage,
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
  markAllNotificationsAsRead,
  pontoonGraphQL,
  pontoonUserData,
  bugzillaTeamComponents,
} from './apiEndpoints';
import { BackgroundClientMessageType } from './BackgroundClientMessageType';
import { HttpClient } from './HttpClient';
import { projectsListData } from './data/projectsListData';
import { listenToMessages, ProjectForCurrentTab } from './backgroundClient';

interface NotificationApiResponse {
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
}

interface UserDataApiResponse {
  notifications: {
    has_unread: boolean;
    notifications: NotificationApiResponse[];
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

type TeamsList = StorageContent['teamsList'];

type ProjectsList = StorageContent['projectsList'];

type Project = ProjectsList['slug'];

interface ProjectGqlReponse {
  slug: string;
  name: string;
}

interface ProjectsListGqlResponse {
  projects: ProjectGqlReponse[];
}

type LatestActivity = StorageContent['latestTeamsActivity'][string];

export class RemotePontoon {
  private readonly domParser: DOMParser;
  private readonly httpClient: HttpClient;

  constructor() {
    this.domParser = new DOMParser();
    this.httpClient = new HttpClient();

    this.listenToMessagesFromClients();
  }

  private async updateNotificationsIfThereAreNew(
    pageContent: string,
  ): Promise<void> {
    const page = this.domParser.parseFromString(pageContent, 'text/html');
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
        this.updateNotificationsData();
      }
    }
  }

  public async updateNotificationsData(): Promise<void> {
    try {
      const reponse = await this.httpClient.fetchFromPontoonSession(
        pontoonUserData(await getOneOption('pontoon_base_url')),
      );
      const userData = (await reponse.json()) as UserDataApiResponse;
      const notificationsDataObj: StorageContent['notificationsData'] = {};
      userData.notifications.notifications.forEach(
        (n) => (notificationsDataObj[n.id] = n),
      );
      await saveToStorage({ notificationsData: notificationsDataObj });
    } catch (error) {
      await deleteFromStorage('notificationsData');
      console.error(error);
    }
  }

  public async updateLatestTeamActivity(): Promise<void> {
    const reponse = await this.httpClient.fetch(
      pontoonTeamsList(
        await getOneOption('pontoon_base_url'),
        AUTOMATION_UTM_SOURCE,
      ),
    );
    const allTeamsPageContent = await reponse.text();
    const latestActivityObj: StorageContent['latestTeamsActivity'] = {};
    const allTeamsPage = this.domParser.parseFromString(
      allTeamsPageContent,
      'text/html',
    );
    Array.from(allTeamsPage.querySelectorAll('.team-list tbody tr'))
      .map((row): LatestActivity => {
        const latestActivityTime = row.querySelector(
          '.latest-activity time',
        ) as any;
        return {
          team: row.querySelector('.code a')?.textContent || '',
          user: latestActivityTime?.dataset?.userName || '',
          date_iso:
            latestActivityTime?.attributes?.datetime?.value || undefined,
        };
      })
      .forEach((teamActivity) => {
        latestActivityObj[teamActivity.team] = teamActivity;
      });
    if (Object.keys(latestActivityObj).length > 0) {
      await saveToStorage({ latestTeamsActivity: latestActivityObj });
    } else {
      await deleteFromStorage('latestTeamsActivity');
    }
  }

  public async updateTeamsList(): Promise<TeamsList> {
    const [pontoonDataResponse, bugzillaComponentsResponse] = await Promise.all(
      [
        this.httpClient.fetch(
          pontoonGraphQL(
            await getOneOption('pontoon_base_url'),
            '{locales{code,name,approvedStrings,pretranslatedStrings,stringsWithWarnings,stringsWithErrors,missingStrings,unreviewedStrings,totalStrings}}',
          ),
        ),
        this.httpClient.fetch(bugzillaTeamComponents()),
      ],
    );
    const pontoonData = (await pontoonDataResponse.json()) as {
      data: TeamsListGqlResponse;
    };
    const bugzillaComponents = (await bugzillaComponentsResponse.json()) as {
      [code: string]: string;
    };
    const teamsListObj: TeamsList = {};
    pontoonData.data.locales
      .filter((team) => team.totalStrings > 0)
      .sort((team1, team2) => team1.code.localeCompare(team2.code))
      .forEach((team) => {
        teamsListObj[team.code] = {
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
      });
    await saveToStorage({ teamsList: teamsListObj });
    return teamsListObj;
  }

  public async getPontoonProjectForPageUrl(
    pageUrl: string,
  ): Promise<ProjectForCurrentTab | undefined> {
    const toProjectMap = new Map<Project['domains'][number], Project>();
    const projectsList = await getOneFromStorage('projectsList');
    if (projectsList) {
      Object.values(projectsList).forEach((project) =>
        project.domains.forEach((domain) => toProjectMap.set(domain, project)),
      );
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

  public async updateProjectsList(): Promise<StorageContent['projectsList']> {
    const pontoonDataResponse = await this.httpClient.fetch(
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
    pontoonData.data.projects.forEach((project) =>
      partialProjectsMap.set(project.slug, project),
    );
    const projectsListObj: ProjectsList = {};
    projectsListData
      .map((project) => ({
        ...project,
        ...partialProjectsMap.get(project.slug)!,
      }))
      .forEach((project) => {
        projectsListObj[project.slug] = project;
      });
    await saveToStorage({ projectsList: projectsListObj });
    return projectsListObj;
  }

  private listenToMessagesFromClients(): void {
    listenToMessages(
      (message: {
        type: BackgroundClientMessageType;
        documentHTML?: string;
      }) => {
        switch (message.type) {
          case BackgroundClientMessageType.PAGE_LOADED:
            this.updateNotificationsIfThereAreNew(message.documentHTML!);
            break;
          case BackgroundClientMessageType.NOTIFICATIONS_READ:
            this.markAllNotificationsAsRead();
            break;
          case BackgroundClientMessageType.UPDATE_TEAMS_LIST:
            return this.updateTeamsList();
          case BackgroundClientMessageType.GET_TEAM_FROM_PONTOON:
            return this.getTeamFromPontoon();
          case BackgroundClientMessageType.GET_CURRENT_TAB_PROJECT:
            return getActiveTab().then((tab) =>
              this.getPontoonProjectForPageUrl(tab.url!),
            );
        }
      },
    );
  }

  private async markAllNotificationsAsRead(): Promise<void> {
    const [response, notificationsData] = await Promise.all([
      this.httpClient.fetchFromPontoonSession(
        markAllNotificationsAsRead(await getOneOption('pontoon_base_url')),
      ),
      getOneFromStorage('notificationsData'),
    ]);
    if (response.ok && typeof notificationsData !== 'undefined') {
      Object.values(notificationsData).forEach((n) => (n.unread = false));
      await saveToStorage({ notificationsData });
    }
  }

  private async getTeamFromPontoon(): Promise<string | undefined> {
    const response = await this.httpClient.fetchFromPontoonSession(
      pontoonSettings(
        await getOneOption('pontoon_base_url'),
        AUTOMATION_UTM_SOURCE,
      ),
    );
    const text = await response.text();
    const language: any = this.domParser
      .parseFromString(text, 'text/html')
      .querySelector('#homepage .language');
    return language?.dataset['code'] || undefined;
  }
}
