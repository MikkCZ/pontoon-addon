import { Runtime } from 'webextension-polyfill';

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

interface Notification {
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

export type NotificationsData = { [id: number]: Notification };

interface Team {
  name: string;
}

export interface TeamsList {
  [slug: string]: Team;
}

interface NotificationsChange {
  newValue: NotificationsData;
}

export type NotificationsChangeCallback = (update: NotificationsChange) => void;

/**
 * Client to communicate with background/RemotePontoon.js. Should be used in all contexts outside of background itself.
 */
export class BackgroundPontoonClient {
  private readonly notificationsChangeCallbacks: Set<NotificationsChangeCallback>;
  private readonly notificationsChangeListener: (
    message: { type: string; data: unknown },
    sender: Runtime.MessageSender,
  ) => void;

  constructor() {
    this.notificationsChangeCallbacks = new Set();
    this.notificationsChangeListener = (message, _sender) =>
      this.backgroundMessage(message);
  }

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

  subscribeToNotificationsChange(callback: NotificationsChangeCallback): void {
    this.notificationsChangeCallbacks.add(callback);
    if (
      !browser.runtime.onMessage.hasListener(this.notificationsChangeListener)
    ) {
      browser.runtime.onMessage.addListener(this.notificationsChangeListener);
    }
  }

  unsubscribeFromNotificationsChange(
    callback: NotificationsChangeCallback,
  ): void {
    const deleted = this.notificationsChangeCallbacks.delete(callback);
    if (deleted && this.notificationsChangeCallbacks.size === 0) {
      browser.runtime.onMessage.removeListener(
        this.notificationsChangeListener,
      );
    }
  }

  private backgroundMessage(message: { type: string; data: unknown }): void {
    if (
      message.type ===
      BackgroundPontoonMessageType.FROM_BACKGROUND.NOTIFICATIONS_UPDATED
    ) {
      this.notificationsChangeCallbacks.forEach((callback) =>
        callback(message.data as NotificationsChange),
      );
    }
  }
}
