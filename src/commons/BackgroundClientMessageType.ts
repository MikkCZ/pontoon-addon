import type { StorageContent } from './webExtensionsApi';

export type BackgroundClientMessageWithResponse = {
  UPDATE_TEAMS_LIST: {
    message: {
      type: 'update-teams-list';
    };
    response: StorageContent['teamsList'];
  };
  GET_TEAM_FROM_PONTOON: {
    message: {
      type: 'get-team-from-pontoon';
    };
    response: string | undefined;
  };
  GET_CURRENT_TAB_PROJECT: {
    message: {
      type: 'get-current-tab-project';
    };
    response: StorageContent['projectsList'][string] | undefined;
  };
  NOTIFICATIONS_BELL_SCRIPT_LOADED: {
    message: {
      type: 'notifications-bell-script-loaded';
    };
    response:
      | BackgroundClientMessageWithoutResponse['ENABLE_NOTIFICATIONS_BELL_SCRIPT']['message']
      | BackgroundClientMessageWithoutResponse['DISABLE_NOTIFICATIONS_BELL_SCRIPT']['message'];
  };
};

export type BackgroundClientMessageWithoutResponse = {
  PAGE_LOADED: {
    message: {
      type: 'pontoon-page-loaded';
      documentHTML: string;
    };
    response: void;
  };
  NOTIFICATIONS_READ: {
    message: {
      type: 'notifications-read';
    };
    response: void;
  };
  SEARCH_TEXT_IN_PONTOON: {
    message: {
      type: 'search-text-in-pontoon';
      text: string;
    };
    response: void;
  };
  REPORT_TRANSLATED_TEXT_TO_BUGZILLA: {
    message: {
      type: 'report-translated-text-to-bugzilla';
      text: string;
    };
    response: void;
  };
  ENABLE_NOTIFICATIONS_BELL_SCRIPT: {
    message: {
      type: 'enable-notifications-bell-script';
    };
    response: void;
  };
  DISABLE_NOTIFICATIONS_BELL_SCRIPT: {
    message: {
      type: 'disable-notifications-bell-script';
    };
    response: void;
  };
};

export type BackgroundClientMessage = BackgroundClientMessageWithResponse &
  BackgroundClientMessageWithoutResponse;
