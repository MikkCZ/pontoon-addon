import type { TeamsList, Project, NotificationsChangeCallback } from "../BackgroundPontoonClient";

export class BackgroundPontoonClient {
  getBaseUrl: () => Promise<string>;
  getNotificationsUrl: () => Promise<string>;
  getSettingsUrl: () => Promise<string>;
  getTeamPageUrl: () => Promise<string>;
  getTeamProjectUrl: (projectUrl: string) => Promise<string>;
  getStringsWithStatusSearchUrl: (status: string) => Promise<string>;
  getSignInURL: () => Promise<string>;
  updateTeamsList: () => Promise<TeamsList>;
  getTeamFromPontoon: () => Promise<string>;
  getPontoonProjectForTheCurrentTab: () => Promise<Project>;
  pageLoaded: (pageUrl: string, documentHTML: string) => void;
  markAllNotificationsAsRead: () => void
  subscribeToNotificationsChange: (callback: NotificationsChangeCallback) => void;
  unsubscribeFromNotificationsChange: (callback: NotificationsChangeCallback) => void;

  constructor() {
    this.getBaseUrl = jest.fn();
    this.getNotificationsUrl = jest.fn();
    this.getSettingsUrl = jest.fn();
    this.getTeamPageUrl = jest.fn();
    this.getTeamProjectUrl = jest.fn();
    this.getStringsWithStatusSearchUrl = jest.fn();
    this.getSignInURL = jest.fn();
    this.updateTeamsList = jest.fn();
    this.getTeamFromPontoon = jest.fn();
    this.getPontoonProjectForTheCurrentTab = jest.fn();
    this.pageLoaded = jest.fn();
    this.markAllNotificationsAsRead = jest.fn();
    this.subscribeToNotificationsChange = jest.fn();
    this.unsubscribeFromNotificationsChange = jest.fn();
  }
}
