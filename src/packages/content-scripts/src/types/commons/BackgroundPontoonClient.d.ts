declare module '@pontoon-addon/commons/src/BackgroundPontoonClient' {
  export class BackgroundPontoonClient {
    constructor();
    pageLoaded(pageUrl: string, documentHTML: string): void;
    markAllNotificationsAsRead(): void;
    subscribeToNotificationsChange(
      callback: (update: { newValue: NotificationsData }) => void
    ): void;
    unsubscribeFromNotificationsChange(
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
