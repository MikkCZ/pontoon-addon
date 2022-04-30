import type { Storage } from 'webextension-polyfill';
import URI from 'urijs';

import type { Options } from '@commons/Options';
import { browser, getOneFromStorage } from '@commons/webExtensionsApi';
import {
  pontoonSettings,
  toPontoonTeamSpecificProjectUrl,
  pontoonTeamsList,
} from '@commons/webLinks';

import {
  AUTOMATION_UTM_SOURCE,
  markAllNotificationsAsRead,
  pontoonGraphQL,
  pontoonUserData,
  bugzillaTeamComponents,
} from './apiEndpoints';
import { BackgroundPontoonMessageType } from './BackgroundPontoonMessageType';
import { DataFetcher } from './DataFetcher';
import { projectsListData } from './data/projectsListData';

const pontoonBaseUrlOptionKey = 'pontoon_base_url';
const localeTeamOptionKey = 'locale_team';

export class RemotePontoon {
  private baseUrl: string;
  private baseUrlChangeListeners: Set<() => void>;
  private team: string;
  private readonly options: Options;
  private readonly domParser: DOMParser;
  private readonly dataFetcher: DataFetcher;

  constructor(baseUrl: string, team: string, options: Options) {
    this.baseUrl = baseUrl;
    this.baseUrlChangeListeners = new Set();
    this.team = team;
    this.options = options;
    this.domParser = new DOMParser();
    this.dataFetcher = new DataFetcher(this.options, this);

    this.listenToMessagesFromClients();
    this.watchOptionsUpdates();
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public getTeam(): { code: string } {
    return { code: this.team };
  }

  private async updateNotificationsIfThereAreNew(
    pageContent: string,
  ): Promise<void> {
    const page = this.domParser.parseFromString(pageContent, 'text/html');
    if (page.querySelector('header #notifications')) {
      const [notificationsData, notificationsIdsFromPage] = await Promise.all([
        getOneFromStorage<NotificationsData>('notificationsData'),
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

  private subscribeToDataChange<T>(
    dataKey: string,
    callback: (update: { newValue: T }) => void,
  ): void {
    browser.storage.onChanged.addListener((changes, _areaName) => {
      if (changes[dataKey] !== undefined) {
        callback(changes[dataKey] as { newValue: T });
      }
    });
  }

  public subscribeToNotificationsChange(
    callback: (update: { newValue: NotificationsData }) => void,
  ): void {
    this.subscribeToDataChange<NotificationsData>(
      'notificationsData',
      callback,
    );
  }

  public subscribeToBaseUrlChange(callback: () => void): void {
    this.baseUrlChangeListeners.add(callback);
  }

  public updateNotificationsData(): void {
    this.dataFetcher
      .fetchFromPontoonSession(pontoonUserData(this.baseUrl))
      .then((response) => {
        return response.json() as Promise<UserDataApiResponse>;
      })
      .then((userData) => {
        const notificationsDataObj: NotificationsData = {};
        userData.notifications.notifications.forEach(
          (n) => (notificationsDataObj[n.id] = n),
        );
        return notificationsDataObj;
      })
      .then((nData) => {
        return browser.storage.local.set({
          notificationsData: nData,
        } as NotificationsDataInStorage);
      })
      .catch((error) => {
        browser.storage.local.set({
          notificationsData: undefined,
        } as NotificationsDataInStorage);
        console.error(error);
      });
  }

  public updateLatestTeamActivity(): void {
    this.dataFetcher
      .fetch(pontoonTeamsList(this.baseUrl, AUTOMATION_UTM_SOURCE))
      .then((response) => {
        return response.text();
      })
      .then((allTeamsPageContent) => {
        const latestActivityObj: { [key: string]: any } = {};
        const allTeamsPage = this.domParser.parseFromString(
          allTeamsPageContent,
          'text/html',
        );
        Array.from(allTeamsPage.querySelectorAll('.team-list tbody tr'))
          .map((row) => {
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
          browser.storage.local.set({ latestTeamsActivity: latestActivityObj });
        } else {
          browser.storage.local.remove('latestTeamsActivity');
        }
      });
  }

  public async updateTeamsList(): Promise<TeamsList> {
    const [pontoonData, bz_components] = await Promise.all([
      this.dataFetcher
        .fetch(
          pontoonGraphQL(
            this.baseUrl,
            '{locales{code,name,approvedStrings,pretranslatedStrings,stringsWithWarnings,stringsWithErrors,missingStrings,unreviewedStrings,totalStrings}}',
          ),
        )
        .then(
          (response) =>
            response.json() as Promise<{ data: TeamsListGqlResponse }>,
        ),
      this.dataFetcher
        .fetch(bugzillaTeamComponents())
        .then(
          (response) => response.json() as Promise<{ [code: string]: string }>,
        ),
    ]);
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
          bz_component: bz_components[team.code],
        };
      });
    browser.storage.local.set({
      teamsList: teamsListObj,
    } as TeamsListInStorage);
    return teamsListObj;
  }

  public subscribeToProjectsListChange(
    callback: (change: { newValue: ProjectsList }) => void,
  ): void {
    this.subscribeToDataChange<ProjectsList>('projectsList', callback);
  }

  public async getPontoonProjectForPageUrl(pageUrl: string): Promise<
    | {
        name: string;
        pageUrl: string;
        translationUrl: string;
      }
    | undefined
  > {
    const toProjectMap = new Map<string, Project>();
    const projectsList = await getOneFromStorage<ProjectsList>('projectsList');
    if (projectsList) {
      Object.values(projectsList).forEach((project) =>
        project.domains.forEach((domain) => toProjectMap.set(domain, project)),
      );
    }
    const { hostname } = URI.parse(pageUrl);
    const projectData = hostname ? toProjectMap.get(hostname) : undefined;
    if (projectData) {
      return {
        name: projectData.name,
        pageUrl: toPontoonTeamSpecificProjectUrl(
          this.baseUrl,
          { code: this.team },
          URI.joinPaths('/', 'projects', projectData.slug).toString(),
        ),
        translationUrl: toPontoonTeamSpecificProjectUrl(
          this.baseUrl,
          { code: this.team },
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

  public subscribeToTeamsListChange(
    callback: (update: { newValue: TeamsList }) => void,
  ): void {
    this.subscribeToDataChange<TeamsList>('teamsList', callback);
  }

  public async updateProjectsList(): Promise<{ [key: string]: any }> {
    const pontoonData = await this.dataFetcher
      .fetch(pontoonGraphQL(this.baseUrl, '{projects{slug,name}}'))
      .then(
        (response) =>
          response.json() as Promise<{ data: ProjectsListGqlResponse }>,
      );
    const partialProjectsMap = new Map<string, ProjectGqlReponse>();
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
    browser.storage.local.set({
      projectsList: projectsListObj,
    } as ProjectsListInStorage);
    return projectsListObj;
  }

  private listenToMessagesFromClients(): void {
    browser.runtime.onMessage.addListener((request, _sender) => {
      switch (request.type) {
        case BackgroundPontoonMessageType.TO_BACKGROUND.PAGE_LOADED:
          this.updateNotificationsIfThereAreNew(request.value);
          break;
        case BackgroundPontoonMessageType.TO_BACKGROUND.NOTIFICATIONS_READ:
          this.markAllNotificationsAsRead();
          break;
        case BackgroundPontoonMessageType.TO_BACKGROUND.GET_BASE_URL:
          return Promise.resolve(this.baseUrl);
        case BackgroundPontoonMessageType.TO_BACKGROUND.GET_TEAM:
          return Promise.resolve({ code: this.team });
        case BackgroundPontoonMessageType.TO_BACKGROUND.UPDATE_TEAMS_LIST:
          return this.updateTeamsList();
        case BackgroundPontoonMessageType.TO_BACKGROUND.GET_TEAM_FROM_PONTOON:
          return this.getTeamFromPontoon();
        case BackgroundPontoonMessageType.TO_BACKGROUND.GET_CURRENT_TAB_PROJECT:
          return browser.tabs
            .query({ currentWindow: true, active: true })
            .then((tab) => this.getPontoonProjectForPageUrl(tab[0].url!));
      }
    });
    this.subscribeToNotificationsChange((change) => {
      const message = {
        type: BackgroundPontoonMessageType.FROM_BACKGROUND
          .NOTIFICATIONS_UPDATED,
        data: change,
      };
      browser.runtime.sendMessage(message);
      browser.tabs
        .query({ url: `${this.getBaseUrl()}/*` })
        .then((pontoonTabs) =>
          pontoonTabs.forEach((tab) =>
            browser.tabs.sendMessage(tab.id!, message),
          ),
        );
    });
  }

  private watchOptionsUpdates(): void {
    this.options.subscribeToOptionChange(
      pontoonBaseUrlOptionKey,
      (change: Storage.StorageChange) => {
        this.baseUrl = change.newValue.replace(/\/$/, '');
        this.baseUrlChangeListeners.forEach((callback) => callback());
      },
    );
    this.options.subscribeToOptionChange(
      localeTeamOptionKey,
      (change: Storage.StorageChange) => {
        this.team = change.newValue;
      },
    );
  }

  private async markAllNotificationsAsRead(): Promise<void> {
    const [response, notificationsData] = await Promise.all([
      this.dataFetcher.fetchFromPontoonSession(
        markAllNotificationsAsRead(this.baseUrl),
      ),
      getOneFromStorage<NotificationsData>('notificationsData'),
    ]);
    if (response.ok) {
      Object.values(notificationsData!).forEach((n) => (n.unread = false));
      browser.storage.local.set({
        notificationsData,
      } as NotificationsDataInStorage);
    }
  }

  private async getTeamFromPontoon(): Promise<string | undefined> {
    const response = await this.dataFetcher.fetchFromPontoonSession(
      pontoonSettings(this.baseUrl, AUTOMATION_UTM_SOURCE),
    );
    const text = await response.text();
    const language: any = this.domParser
      .parseFromString(text, 'text/html')
      .querySelector('#homepage .language');
    return language?.dataset['code'] || undefined;
  }
}

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

export interface NotificationsData {
  [id: number]: NotificationApiResponse;
}

interface NotificationsDataInStorage {
  notificationsData: NotificationsData | undefined;
}

interface TeamGqlResponse {
  code: string;
  name: string;
  approvedStrings: number;
  pretranslatedStrings: number;
  stringsWithWarnings: number;
  stringsWithErrors: number;
  missingStrings: number;
  unreviewedStrings: number;
  totalStrings: number;
}

interface TeamsListGqlResponse {
  locales: TeamGqlResponse[];
}

export interface Team {
  code: string;
  name: string;
  strings: {
    approvedStrings: number;
    pretranslatedStrings: number;
    stringsWithWarnings: number;
    stringsWithErrors: number;
    missingStrings: number;
    unreviewedStrings: number;
    totalStrings: number;
  };
  bz_component: string;
}

export interface TeamsList {
  [slug: string]: Team;
}

interface TeamsListInStorage {
  teamsList: TeamsList;
}

interface Project {
  slug: string;
  name: string;
  domains: string[];
}

export interface ProjectsList {
  [slug: string]: Project;
}

interface ProjectsListInStorage {
  projectsList: ProjectsList;
}

interface ProjectGqlReponse {
  slug: string;
  name: string;
}

interface ProjectsListGqlResponse {
  projects: ProjectGqlReponse[];
}
