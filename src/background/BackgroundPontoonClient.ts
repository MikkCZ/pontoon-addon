import {
  pontoonFxaSignIn,
  pontoonSettings,
  pontoonTeam,
  pontoonNotifications,
  pontoonSearchStringsWithStatus,
  toPontoonTeamSpecificProjectUrl,
} from '@commons/webLinks';
import { browser } from '@commons/webExtensionsApi';

import { BackgroundPontoonMessageType } from './BackgroundPontoonMessageType';

export interface Project {
  name: string;
  pageUrl: string;
  translationUrl: string;
}

interface Team {
  name: string;
}

export interface TeamsList {
  [slug: string]: Team;
}

export class BackgroundPontoonClient {
  async getBaseUrl(): Promise<string> {
    return await browser.runtime.sendMessage({
      type: BackgroundPontoonMessageType.TO_BACKGROUND.GET_BASE_URL,
    });
  }

  private async getTeam(): Promise<{ code: string }> {
    return await browser.runtime.sendMessage({
      type: BackgroundPontoonMessageType.TO_BACKGROUND.GET_TEAM,
    });
  }

  async getNotificationsUrl(): Promise<string> {
    return pontoonNotifications(await this.getBaseUrl());
  }

  async getSettingsUrl(): Promise<string> {
    return pontoonSettings(await this.getBaseUrl());
  }

  async getTeamPageUrl(): Promise<string> {
    const [baseUrl, team] = await Promise.all([
      this.getBaseUrl(),
      this.getTeam(),
    ]);
    return pontoonTeam(baseUrl, team);
  }

  async getTeamProjectUrl(projectUrl: string): Promise<string> {
    const [baseUrl, team] = await Promise.all([
      this.getBaseUrl(),
      this.getTeam(),
    ]);
    return toPontoonTeamSpecificProjectUrl(baseUrl, team, projectUrl);
  }

  async getStringsWithStatusSearchUrl(status: string): Promise<string> {
    const [baseUrl, team] = await Promise.all([
      this.getBaseUrl(),
      this.getTeam(),
    ]);
    return pontoonSearchStringsWithStatus(baseUrl, team, status);
  }

  async getSignInURL(): Promise<string> {
    return pontoonFxaSignIn(await this.getBaseUrl());
  }

  async updateTeamsList(): Promise<TeamsList> {
    return await browser.runtime.sendMessage({
      type: BackgroundPontoonMessageType.TO_BACKGROUND.UPDATE_TEAMS_LIST,
    });
  }

  async getTeamFromPontoon(): Promise<string> {
    return await browser.runtime.sendMessage({
      type: BackgroundPontoonMessageType.TO_BACKGROUND.GET_TEAM_FROM_PONTOON,
    });
  }

  async getPontoonProjectForTheCurrentTab(): Promise<Project> {
    return await browser.runtime.sendMessage({
      type: BackgroundPontoonMessageType.TO_BACKGROUND.GET_CURRENT_TAB_PROJECT,
    });
  }

  pageLoaded(pageUrl: string, documentHTML: string): void {
    browser.runtime.sendMessage({
      type: BackgroundPontoonMessageType.TO_BACKGROUND.PAGE_LOADED,
      url: pageUrl,
      value: documentHTML,
    });
  }

  markAllNotificationsAsRead(): void {
    browser.runtime.sendMessage({
      type: BackgroundPontoonMessageType.TO_BACKGROUND.NOTIFICATIONS_READ,
    });
  }
}
