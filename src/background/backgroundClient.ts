import {
  pontoonFxaSignIn,
  pontoonSettings,
  pontoonTeam,
  pontoonNotifications,
  pontoonSearchStringsWithStatus,
  toPontoonTeamSpecificProjectUrl,
} from '@commons/webLinks';
import { browser } from '@commons/webExtensionsApi';
import { getOneOption } from '@commons/options';

import { BackgroundClientMessageType } from './BackgroundClientMessageType';

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

export async function getTeamPageUrl(): Promise<string> {
  const [baseUrl, team] = await Promise.all([getPontoonBaseUrl(), getTeam()]);
  return pontoonTeam(baseUrl, team);
}

export async function getTeamProjectUrl(projectUrl: string): Promise<string> {
  const [baseUrl, team] = await Promise.all([getPontoonBaseUrl(), getTeam()]);
  return toPontoonTeamSpecificProjectUrl(baseUrl, team, projectUrl);
}

export async function getStringsWithStatusSearchUrl(
  status: string,
): Promise<string> {
  const [baseUrl, team] = await Promise.all([getPontoonBaseUrl(), getTeam()]);
  return pontoonSearchStringsWithStatus(baseUrl, team, status);
}

export async function getSignInURL(): Promise<string> {
  return pontoonFxaSignIn(await getPontoonBaseUrl());
}

export async function updateTeamsList(): Promise<TeamsList> {
  return await browser.runtime.sendMessage({
    type: BackgroundClientMessageType.UPDATE_TEAMS_LIST,
  });
}

export async function getTeamFromPontoon(): Promise<string> {
  return await browser.runtime.sendMessage({
    type: BackgroundClientMessageType.GET_TEAM_FROM_PONTOON,
  });
}

export async function getPontoonProjectForTheCurrentTab(): Promise<Project> {
  return await browser.runtime.sendMessage({
    type: BackgroundClientMessageType.GET_CURRENT_TAB_PROJECT,
  });
}

export function pageLoaded(pageUrl: string, documentHTML: string): void {
  browser.runtime.sendMessage({
    type: BackgroundClientMessageType.PAGE_LOADED,
    url: pageUrl,
    value: documentHTML,
  });
}

export function markAllNotificationsAsRead(): void {
  browser.runtime.sendMessage({
    type: BackgroundClientMessageType.NOTIFICATIONS_READ,
  });
}

export function searchTextInPontoon(text: string): void {
  browser.runtime.sendMessage({
    type: BackgroundClientMessageType.SEARCH_TEXT_IN_PONTOON,
    text,
  });
}

export function reportTranslatedTextToBugzilla(text: string): void {
  browser.runtime.sendMessage({
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

export function listenToMessages(
  callback: (message: { type: BackgroundClientMessageType }) => void,
) {
  browser.runtime.onMessage.addListener(callback);
}
