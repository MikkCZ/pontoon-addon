/* eslint-disable jest/expect-expect */
import type { MockzillaDeep } from 'mockzilla';

import {
  mockBrowser,
  mockBrowserNode,
} from '@commons/test/mockWebExtensionsApi';
import { getOneOption } from '@commons/options';

import {
  getNotificationsUrl,
  getPontoonProjectForTheCurrentTab,
  getSettingsUrl,
  getSignInURL,
  getStringsWithStatusSearchUrl,
  getTeamFromPontoon,
  getTeamPageUrl,
  getTeamProjectUrl,
  listenToMessages,
  markAllNotificationsAsRead,
  notificationBellIconScriptLoaded,
  pageLoaded,
  reportTranslatedTextToBugzilla,
  searchTextInPontoon,
  updateTeamsList,
} from './backgroundClient';
import { BackgroundClientMessageType } from './BackgroundClientMessageType';

jest.mock('@commons/options');

beforeEach(() => {
  mockBrowserNode.enable();
  (getOneOption as jest.Mock).mockImplementation((key: string) => {
    switch (key) {
      case 'locale_team':
        return 'cs';
      case 'pontoon_base_url':
        return 'https://localhost';
      default:
        throw new Error(`Missing mock value for option '${key}'.`);
    }
  });
});

afterEach(() => {
  mockBrowserNode.disable();
  (getOneOption as jest.Mock).mockReset();
});

function mockBrowserSendMessage() {
  return mockBrowser.runtime.sendMessage as unknown as MockzillaDeep<{
    (message: {
      type: BackgroundClientMessageType;
      [key: string]: unknown;
    }): Promise<unknown>;
  }>;
}

function mockBrowserSendMessageVoid() {
  return mockBrowser.runtime.sendMessage as unknown as MockzillaDeep<{
    (message: {
      type: BackgroundClientMessageType;
      [key: string]: unknown;
    }): Promise<void>;
  }>;
}

describe('backgroundClient', () => {
  it('getNotificationsUrl', async () => {
    const url = await getNotificationsUrl();

    expect(url).toBe(
      'https://localhost/notifications?utm_source=pontoon-addon',
    );
  });

  it('getSettingsUrl', async () => {
    const url = await getSettingsUrl();

    expect(url).toBe('https://localhost/settings/?utm_source=pontoon-addon');
  });

  it('getTeamPageUrl', async () => {
    const url = await getTeamPageUrl();

    expect(url).toBe('https://localhost/cs?utm_source=pontoon-addon');
  });

  it('getTeamProjectUrl', async () => {
    const url = await getTeamProjectUrl('/projects/firefox');

    expect(url).toBe('https://localhost/cs/firefox?utm_source=pontoon-addon');
  });

  it('getStringsWithStatusSearchUrl', async () => {
    const url = await getStringsWithStatusSearchUrl('translated');

    expect(url).toBe(
      'https://localhost/cs/all-projects/all-resources?status=translated&utm_source=pontoon-addon',
    );
  });

  it('getSignInURL', async () => {
    const url = await getSignInURL();

    expect(url).toBe('https://localhost/accounts/fxa/login');
  });

  it('updateTeamsList', async () => {
    mockBrowserSendMessage()
      .expect({ type: BackgroundClientMessageType.UPDATE_TEAMS_LIST })
      .andResolve({ cs: { name: 'Czech' } });

    const teams = await updateTeamsList();

    expect(teams).toStrictEqual({ cs: { name: 'Czech' } });
    mockBrowserNode.verify();
  });

  it('getTeamFromPontoon', async () => {
    mockBrowserSendMessage()
      .expect({ type: BackgroundClientMessageType.GET_TEAM_FROM_PONTOON })
      .andResolve('cs');

    const team = await getTeamFromPontoon();

    expect(team).toBe('cs');
    mockBrowserNode.verify();
  });

  it('getPontoonProjectForTheCurrentTab', async () => {
    mockBrowserSendMessage()
      .expect({ type: BackgroundClientMessageType.GET_CURRENT_TAB_PROJECT })
      .andResolve({
        name: 'firefox',
        pageUrl: '/pageUrl',
        translationUrl: '/translationsUrl',
      });

    const project = await getPontoonProjectForTheCurrentTab();

    expect(project!.name).toBe('firefox');
    mockBrowserNode.verify();
  });

  it('pageLoaded', async () => {
    mockBrowserSendMessageVoid()
      .expect({
        type: BackgroundClientMessageType.PAGE_LOADED,
        documentHTML: '<html></html>',
      })
      .andResolve();

    await pageLoaded('<html></html>');

    mockBrowserNode.verify();
  });

  it('markAllNotificationsAsRead', async () => {
    mockBrowserSendMessageVoid()
      .expect({ type: BackgroundClientMessageType.NOTIFICATIONS_READ })
      .andResolve();

    await markAllNotificationsAsRead();

    mockBrowserNode.verify();
  });

  it('searchTextInPontoon', async () => {
    mockBrowserSendMessageVoid()
      .expect({
        type: BackgroundClientMessageType.SEARCH_TEXT_IN_PONTOON,
        text: 'foo bar',
      })
      .andResolve();

    await searchTextInPontoon('foo bar');

    mockBrowserNode.verify();
  });

  it('reportTranslatedTextToBugzilla', async () => {
    mockBrowserSendMessageVoid()
      .expect({
        type: BackgroundClientMessageType.REPORT_TRANSLATED_TEXT_TO_BUGZILLA,
        text: 'foo bar',
      })
      .andResolve();

    await reportTranslatedTextToBugzilla('foo bar');

    mockBrowserNode.verify();
  });

  it('notificationBellIconScriptLoaded', async () => {
    mockBrowserSendMessage()
      .expect({
        type: BackgroundClientMessageType.NOTIFICATIONS_BELL_SCRIPT_LOADED,
      })
      .andResolve({
        type: BackgroundClientMessageType.ENABLE_NOTIFICATIONS_BELL_SCRIPT,
      });

    const response = await notificationBellIconScriptLoaded();

    expect(response.type).toBe(
      BackgroundClientMessageType.ENABLE_NOTIFICATIONS_BELL_SCRIPT,
    );
    mockBrowserNode.verify();
  });

  it('listenToMessages', () => {
    const listener = jest.fn();
    mockBrowser.runtime.onMessage.addListener.expect(listener).andReturn();

    listenToMessages(listener);

    mockBrowserNode.verify();
  });
});
