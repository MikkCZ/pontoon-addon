import {
  pontoonFxaSignIn,
  pontoonSettings,
  pontoonNotifications,
  toPontoonTeamSpecificProjectUrl,
} from '../webLinks';
import type { StorageContent } from '../webExtensionsApi';
import { browser } from '../webExtensionsApi';
import { getOneOption } from '../options';

export type BackgroundMessagesWithResponse = {
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
    response: {
      type:
        | BackgroundMessagesWithoutResponse['ENABLE_NOTIFICATIONS_BELL_SCRIPT']['message']['type']
        | BackgroundMessagesWithoutResponse['DISABLE_NOTIFICATIONS_BELL_SCRIPT']['message']['type'];
    };
  };
};

export type BackgroundMessagesWithoutResponse = {
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

export type BackgroundMessage = BackgroundMessagesWithResponse &
  BackgroundMessagesWithoutResponse;

async function sendMessage<T extends keyof BackgroundMessage>(
  message: BackgroundMessage[T]['message'],
): Promise<BackgroundMessage[T]['response']> {
  return await browser.runtime.sendMessage(message);
}

async function getTeam(): Promise<{ code: string }> {
  return {
    code: await getOneOption('locale_team'),
  };
}

async function getPontoonBaseUrl(): Promise<string> {
  return await getOneOption('pontoon_base_url');
}

export async function getNotificationsUrl(): Promise<string> {
  return pontoonNotifications(await getPontoonBaseUrl());
}

export async function getSettingsUrl(): Promise<string> {
  return pontoonSettings(await getPontoonBaseUrl());
}

export async function getTeamProjectUrl(projectUrl: string): Promise<string> {
  const [baseUrl, team] = await Promise.all([getPontoonBaseUrl(), getTeam()]);
  return toPontoonTeamSpecificProjectUrl(baseUrl, team, projectUrl);
}

export async function getSignInURL(): Promise<string> {
  return pontoonFxaSignIn(await getPontoonBaseUrl());
}

export async function updateTeamsList() {
  return await sendMessage<'UPDATE_TEAMS_LIST'>({
    type: 'update-teams-list',
  });
}

export async function getUsersTeamFromPontoon() {
  return await sendMessage<'GET_TEAM_FROM_PONTOON'>({
    type: 'get-team-from-pontoon',
  });
}

export async function getPontoonProjectForTheCurrentTab() {
  return await sendMessage<'GET_CURRENT_TAB_PROJECT'>({
    type: 'get-current-tab-project',
  });
}

export async function pageLoaded(documentHTML: string) {
  return await sendMessage<'PAGE_LOADED'>({
    type: 'pontoon-page-loaded',
    documentHTML,
  });
}

export async function markAllNotificationsAsRead() {
  return await sendMessage<'NOTIFICATIONS_READ'>({
    type: 'notifications-read',
  });
}

export async function searchTextInPontoon(text: string) {
  return await sendMessage<'SEARCH_TEXT_IN_PONTOON'>({
    type: 'search-text-in-pontoon',
    text,
  });
}

export async function reportTranslatedTextToBugzilla(text: string) {
  return await sendMessage<'REPORT_TRANSLATED_TEXT_TO_BUGZILLA'>({
    type: 'report-translated-text-to-bugzilla',
    text,
  });
}

export async function notificationBellIconScriptLoaded() {
  return await sendMessage<'NOTIFICATIONS_BELL_SCRIPT_LOADED'>({
    type: 'notifications-bell-script-loaded',
  });
}
