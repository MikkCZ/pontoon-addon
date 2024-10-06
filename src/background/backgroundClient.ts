import {
  pontoonFxaSignIn,
  pontoonSettings,
  pontoonNotifications,
  toPontoonTeamSpecificProjectUrl,
} from '@commons/webLinks';
import { browser } from '@commons/webExtensionsApi';
import { getOneOption } from '@commons/options';
import type { BackgroundClientMessage } from '@commons/BackgroundClientMessageType';

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

async function sendMessage<T extends keyof BackgroundClientMessage>(
  message: BackgroundClientMessage[T]['message'],
): Promise<BackgroundClientMessage[T]['response']> {
  return await browser.runtime.sendMessage(message);
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
