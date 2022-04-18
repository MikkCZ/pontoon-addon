declare module '@pontoon-addon/commons/src/BackgroundPontoonClient' {
  export class BackgroundPontoonClient {
    constructor();
    async getBaseUrl(): Promise<string>;
    async getSignInURL(): Promise<string>;
    async getTeamProjectUrl(projectUrl: string): Promise<string>;
    async getNotificationsUrl(): Promise<string>;
    async getTeamPageUrl(): Promise<string>;
    async getStringsWithStatusSearchUrl(status: string): Promise<string>;
    markAllNotificationsAsRead(): void;
    subscribeToNotificationsChange(
      callback: (update: { newValue: NotificationsData }) => void
    ): void;
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
}
