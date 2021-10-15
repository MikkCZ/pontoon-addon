declare module '@pontoon-addon/commons/src/BackgroundPontoonMessageType' {
  export class BackgroundPontoonMessageType {
    static TO_BACKGROUND: {
      PAGE_LOADED: 'pontoon-page-loaded';
      NOTIFICATIONS_READ: 'notifications-read';
      GET_NOTIFICATIONS_URL: 'get-notifications-url';
      GET_SETTINGS_URL: 'get-settings-url';
      GET_SIGN_IN_URL: 'get-sign-in-url';
      GET_TEAM_PAGE_URL: 'get-team-page-url';
      GET_TEAM_PROJECT_URL: 'get-team-project-url';
      GET_STRINGS_WITH_STATUS_SEARCH_URL: 'get-strings-with-status-search-url';
      UPDATE_TEAMS_LIST: 'update-teams-list';
      GET_TEAM_FROM_PONTOON: 'get-team-from-pontoon';
      GET_CURRENT_TAB_PROJECT: 'get-current-tab-project';
    };
    static FROM_BACKGROUND: {
      NOTIFICATIONS_UPDATED: 'notifications-updated';
    };
  }
}
