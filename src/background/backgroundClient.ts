import {
  pontoonFxaSignIn,
  pontoonSettings,
  pontoonNotifications,
  toPontoonTeamSpecificProjectUrl,
} from '@commons/webLinks';
import type { StorageContent } from '@commons/webExtensionsApi';
import { browser } from '@commons/webExtensionsApi';
import { getOneOption } from '@commons/options';

import { BackgroundClientMessageType } from './BackgroundClientMessageType';

async function getTeam(): Promise<{ code: string }> {
  return {
    code: await getOneOption('locale_team'),
  };
}

async function getPontoonBaseUrl(): Promise<string> {
  return getOneOption('pontoon_base_url');
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

export async function updateTeamsList(): Promise<StorageContent['teamsList']> {
  return await browser.runtime.sendMessage({
    type: BackgroundClientMessageType.UPDATE_TEAMS_LIST,
  });
}

export async function getUsersTeamFromPontoon(): Promise<string | undefined> {
  return await browser.runtime.sendMessage({
    type: BackgroundClientMessageType.GET_TEAM_FROM_PONTOON,
  });
}

export async function getPontoonProjectForTheCurrentTab(): Promise<
  StorageContent['projectsList'][string] | undefined
> {
  return await browser.runtime.sendMessage({
    type: BackgroundClientMessageType.GET_CURRENT_TAB_PROJECT,
  });
}

export async function pageLoaded(documentHTML: string) {
  await browser.runtime.sendMessage({
    type: BackgroundClientMessageType.PAGE_LOADED,
    documentHTML,
  });
}

export async function markAllNotificationsAsRead() {
  await browser.runtime.sendMessage({
    type: BackgroundClientMessageType.NOTIFICATIONS_READ,
  });
}

export async function searchTextInPontoon(text: string) {
  await browser.runtime.sendMessage({
    type: BackgroundClientMessageType.SEARCH_TEXT_IN_PONTOON,
    text,
  });
}

export async function reportTranslatedTextToBugzilla(text: string) {
  await browser.runtime.sendMessage({
    type: BackgroundClientMessageType.REPORT_TRANSLATED_TEXT_TO_BUGZILLA,
    text,
  });
}

export async function notificationBellIconScriptLoaded(): Promise<{
  type: BackgroundClientMessageType;
}> {
  return browser.runtime.sendMessage({
    type: BackgroundClientMessageType.NOTIFICATIONS_BELL_SCRIPT_LOADED,
  });
}
