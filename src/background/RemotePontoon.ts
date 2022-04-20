import type { Storage } from 'webextension-polyfill';

import type { Options } from '@commons/Options';
import { browser } from '@commons/webExtensionsApi';

import { BackgroundPontoonMessageType } from './BackgroundPontoonMessageType';
import { DataFetcher } from './DataFetcher';

export class RemotePontoon {
  private baseUrl: string;
  private baseUrlChangeListeners: Set<() => void>;
  private team: string;
  private readonly options: Options;
  private readonly domParser: DOMParser;
  private readonly dataFetcher: DataFetcher;

  // TODO: get rid of the 'team' parameter and use options to fetch is when needed
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

  private getSettingsUrl(utm_source?: string): string {
    if (utm_source !== undefined) {
      return `${this.baseUrl}/settings/?utm_source=${utm_source}`;
    }
    return `${this.baseUrl}/settings/`;
  }

  public getTeamPageUrl(): string {
    return `${this.baseUrl}/${this.team}/?utm_source=pontoon-addon`;
  }

  public getTeamInsightsUrl(): string {
    return `${this.baseUrl}/${this.team}/insights/?utm_source=pontoon-addon`;
  }

  // TODO: add 'utm_source'
  // see https://github.com/MikkCZ/pontoon-addon/pull/76#discussion_r195809548
  public getTeamBugsUrl(): string {
    return `${this.baseUrl}/${this.team}/bugs/`;
  }

  public getTeamProjectUrl(projectUrl: string): string {
    const teamProjectUrl = `${this.baseUrl}${projectUrl.replace(
      '/projects/',
      `/${this.team}/`
    )}`;
    if (teamProjectUrl.includes('?')) {
      return `${teamProjectUrl}&utm_source=pontoon-addon`;
    } else {
      return `${teamProjectUrl}?utm_source=pontoon-addon`;
    }
  }

  public getSearchInProjectUrl(
    projectSlug: string,
    textToSearch?: string
  ): string {
    if (textToSearch !== undefined) {
      return `${this.baseUrl}/${
        this.team
      }/${projectSlug}/all-resources/?search="${textToSearch
        .trim()
        .replace(/ /g, '+')}"&utm_source=pontoon-addon`;
    }
    return `${this.baseUrl}/${this.team}/${projectSlug}/all-resources/?utm_source=pontoon-addon`;
  }

  public getSearchInAllProjectsUrl(textToSearch?: string): string {
    return this.getSearchInProjectUrl('all-projects', textToSearch);
  }

  private getStringsWithStatusSearchUrl(status: string): string {
    return `${this.baseUrl}/${this.team}/all-projects/all-resources/?status=${status}&utm_source=pontoon-addon`;
  }

  public getTeamsListUrl(utm_source?: string): string {
    if (utm_source !== undefined) {
      return `${this.baseUrl}/teams/?utm_source=${utm_source}`;
    }
    return `${this.baseUrl}/teams/`;
  }

  private getQueryURL(query: string): string {
    return `${this.baseUrl}/graphql?query=${query}`;
  }

  private updateNotificationsIfThereAreNew(pageContent: string): void {
    const page = this.domParser.parseFromString(pageContent, 'text/html');
    if (page.querySelector('header #notifications')) {
      const dataKey = 'notificationsData';
      Promise.all([
        browser.storage.local.get(dataKey),
        Array.from(page.querySelectorAll('header .notification-item')).map(
          (n: any) => n.dataset.id
        ),
      ]).then(([storageItem, notificationsIdsFromPage]) => {
        const notificationsInStorage = storageItem[dataKey];
        if (
          !notificationsInStorage ||
          !notificationsIdsFromPage.every((id) => id in notificationsInStorage)
        ) {
          this.updateNotificationsData();
        }
      });
    }
  }

  private subscribeToDataChange<T>(
    dataKey: string,
    callback: (update: { newValue: T }) => void
  ): void {
    browser.storage.onChanged.addListener((changes, _areaName) => {
      if (changes[dataKey] !== undefined) {
        callback(changes[dataKey] as { newValue: T });
      }
    });
  }

  public subscribeToNotificationsChange(
    callback: (update: { newValue: NotificationsData }) => void
  ): void {
    this.subscribeToDataChange<NotificationsData>(
      'notificationsData',
      callback
    );
  }

  public subscribeToBaseUrlChange(callback: () => void): void {
    this.baseUrlChangeListeners.add(callback);
  }

  public updateNotificationsData(): void {
    this.dataFetcher
      .fetchFromPontoonSession(
        `${this.baseUrl}/user-data/?utm_source=pontoon-addon-automation`
      )
      .then((response) => {
        return response.json() as Promise<UserDataApiResponse>;
      })
      .then((userData) => {
        const notificationsDataObj: NotificationsData = {};
        userData.notifications.notifications.forEach(
          (n) => (notificationsDataObj[n.id] = n)
        );
        return notificationsDataObj;
      })
      .then((nData) => {
        return browser.storage.local.set({
          notificationsData: nData,
        } as NotificationsDataInStorage);
      })
      .catch((_error) => {
        browser.storage.local.set({
          notificationsData: undefined,
        } as NotificationsDataInStorage);
      });
  }

  public updateLatestTeamActivity(): void {
    this.dataFetcher
      .fetch(this.getTeamsListUrl('pontoon-addon-automation'))
      .then((response) => {
        return response.text();
      })
      .then((allTeamsPageContent) => {
        const latestActivityObj: { [key: string]: any } = {};
        const allTeamsPage = this.domParser.parseFromString(
          allTeamsPageContent,
          'text/html'
        );
        Array.from(allTeamsPage.querySelectorAll('.team-list tbody tr'))
          .map((row) => {
            const latestActivityTime = row.querySelector(
              '.latest-activity time'
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
    return await Promise.all([
      this.dataFetcher
        .fetch(
          this.getQueryURL(
            '{locales{code,name,approvedStrings,pretranslatedStrings,stringsWithWarnings,stringsWithErrors,missingStrings,unreviewedStrings,totalStrings}}'
          )
        )
        .then(
          (response) =>
            response.json() as Promise<{ data: TeamsListGqlResponse }>
        ),
      this.dataFetcher
        .fetch('https://flod.org/mozilla-l10n-query/?bugzilla=product')
        .then(
          (response) => response.json() as Promise<{ [code: string]: string }>
        ),
    ]).then(([pontoonData, bz_components]) => {
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
    });
  }

  public subscribeToProjectsListChange(
    callback: (change: { newValue: ProjectsList }) => void
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
    const tmpLink = document.createElement('a');
    tmpLink.href = pageUrl;
    const toProjectMap = new Map<string, Project>();
    const dataKey = 'projectsList';
    await browser.storage.local
      .get(dataKey)
      .then((storageResponse: unknown) => {
        const projectsList = (
          storageResponse as ProjectsListInStorage | undefined
        )?.projectsList;
        if (projectsList) {
          Object.values(projectsList).forEach((project) =>
            project.domains.forEach((domain) =>
              toProjectMap.set(domain, project)
            )
          );
        }
      });
    const projectData = toProjectMap.get(tmpLink.hostname);
    if (projectData) {
      return {
        name: projectData.name,
        pageUrl: this.getTeamProjectUrl(`/projects/${projectData.slug}/`),
        translationUrl: this.getTeamProjectUrl(
          `/projects/${projectData.slug}/all-resources/`
        ),
      };
    } else {
      return undefined;
    }
  }

  public subscribeToTeamsListChange(
    callback: (update: { newValue: TeamsList }) => void
  ): void {
    this.subscribeToDataChange<TeamsList>('teamsList', callback);
  }

  public async updateProjectsList(): Promise<{ [key: string]: any }> {
    return await Promise.all([
      this.dataFetcher
        .fetch(this.getQueryURL('{projects{slug,name}}'))
        .then(
          (response) =>
            response.json() as Promise<{ data: ProjectsListGqlResponse }>
        ),
      fetch(browser.runtime.getURL('assets/data/projects-list.json')).then(
        (response) => response.json() as Promise<ProjectsListJson>
      ),
    ]).then(([pontoonData, projectsListJson]) => {
      const partialProjectsMap = new Map<string, ProjectGqlReponse>();
      pontoonData.data.projects.forEach((project) =>
        partialProjectsMap.set(project.slug, project)
      );
      const projectsListObj: ProjectsList = {};
      projectsListJson
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
    });
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
        case BackgroundPontoonMessageType.TO_BACKGROUND.GET_NOTIFICATIONS_URL:
          return Promise.resolve(
            `${this.baseUrl}/notifications/?utm_source=pontoon-addon`
          );
        case BackgroundPontoonMessageType.TO_BACKGROUND.GET_SETTINGS_URL:
          return Promise.resolve(this.getSettingsUrl('pontoon-addon'));
        case BackgroundPontoonMessageType.TO_BACKGROUND.GET_SIGN_IN_URL:
          return Promise.resolve(
            `${this.baseUrl}/accounts/fxa/login/?scope=profile%3Auid+profile%3Aemail+profile%3Adisplay_name`
          );
        case BackgroundPontoonMessageType.TO_BACKGROUND.GET_TEAM_PAGE_URL:
          return Promise.resolve(this.getTeamPageUrl());
        case BackgroundPontoonMessageType.TO_BACKGROUND.GET_TEAM_PROJECT_URL:
          return Promise.resolve(this.getTeamProjectUrl(request.args[0]));
        case BackgroundPontoonMessageType.TO_BACKGROUND
          .GET_STRINGS_WITH_STATUS_SEARCH_URL:
          return Promise.resolve(
            this.getStringsWithStatusSearchUrl(request.args[0])
          );
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
            browser.tabs.sendMessage(tab.id!, message)
          )
        );
    });
  }

  private watchOptionsUpdates(): void {
    this.options.subscribeToOptionChange(
      'pontoon_base_url',
      (change: Storage.StorageChange) => {
        this.baseUrl = change.newValue.replace(/\/$/, '');
        this.baseUrlChangeListeners.forEach((callback) => callback());
      }
    );
    this.options.subscribeToOptionChange(
      'locale_team',
      (change: Storage.StorageChange) => {
        this.team = change.newValue;
      }
    );
  }

  private markAllNotificationsAsRead(): void {
    const dataKey = 'notificationsData';
    Promise.all([
      this.dataFetcher.fetchFromPontoonSession(
        `${this.baseUrl}/notifications/mark-all-as-read/?utm_source=pontoon-addon-automation`
      ),
      browser.storage.local.get(dataKey) as Promise<NotificationsDataInStorage>,
    ]).then(([response, storageItem]) => {
      if (response.ok) {
        Object.values(storageItem.notificationsData!).forEach(
          (n) => (n.unread = false)
        );
        browser.storage.local.set({
          notificationsData: storageItem[dataKey],
        } as NotificationsDataInStorage);
      }
    });
  }

  async getTeamFromPontoon(): Promise<string | undefined> {
    const response = await this.dataFetcher.fetchFromPontoonSession(
      this.getSettingsUrl('pontoon-addon-automation')
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
  date_iso: string;
  actor: {
    anchor: string;
    url: string;
  } | null;
  verb: string;
  target: {
    anchor: string;
    url: string;
  } | null;
  message: string | undefined;
  description: {
    content: string | null;
    is_comment: boolean;
  };
}

interface UserDataApiResponse {
  notifications: {
    has_unread: boolean;
    notifications: NotificationApiResponse[];
  };
}

export type NotificationsData = { [id: number]: NotificationApiResponse };

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

export interface TeamsListInStorage {
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

export interface ProjectsListInStorage {
  projectsList: ProjectsList;
}

interface ProjectGqlReponse {
  slug: string;
  name: string;
}

interface ProjectsListGqlResponse {
  projects: ProjectGqlReponse[];
}

type ProjectsListJson = Array<{
  slug: string;
  domains: string[];
}>;
