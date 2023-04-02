/* eslint-disable jest/expect-expect */
import type { MockzillaDeep } from 'mockzilla';
import 'mockzilla-webextension';

import { getOneOption } from '@commons/options';

import {
  getNotificationsUrl,
  getPontoonProjectForTheCurrentTab,
  getSettingsUrl,
  getSignInURL,
  getUsersTeamFromPontoon,
  getTeamProjectUrl,
  markAllNotificationsAsRead,
  notificationBellIconScriptLoaded,
  pageLoaded,
  reportTranslatedTextToBugzilla,
  searchTextInPontoon,
  updateTeamsList,
} from './backgroundClient';
import { BackgroundClientMessageType } from './BackgroundClientMessageType';

jest.mock('@commons/webExtensionsApi/browser');
jest.mock('@commons/options');

beforeEach(() => {
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

  it('getTeamProjectUrl', async () => {
    const url = await getTeamProjectUrl('/projects/firefox');

    expect(url).toBe('https://localhost/cs/firefox?utm_source=pontoon-addon');
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
  });

  it('getUsersTeamFromPontoon', async () => {
    mockBrowserSendMessage()
      .expect({ type: BackgroundClientMessageType.GET_TEAM_FROM_PONTOON })
      .andResolve('cs');

    const team = await getUsersTeamFromPontoon();

    expect(team).toBe('cs');
  });

  it('getPontoonProjectForTheCurrentTab', async () => {
    mockBrowserSendMessage()
      .expect({ type: BackgroundClientMessageType.GET_CURRENT_TAB_PROJECT })
      .andResolve({ slug: 'firefox' });

    const project = await getPontoonProjectForTheCurrentTab();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(project!.slug).toBe('firefox');
  });

  it('pageLoaded', async () => {
    mockBrowserSendMessageVoid()
      .expect({
        type: BackgroundClientMessageType.PAGE_LOADED,
        documentHTML: '<html></html>',
      })
      .andResolve();

    await pageLoaded('<html></html>');
  });

  it('markAllNotificationsAsRead', async () => {
    mockBrowserSendMessageVoid()
      .expect({ type: BackgroundClientMessageType.NOTIFICATIONS_READ })
      .andResolve();

    await markAllNotificationsAsRead();
  });

  it('searchTextInPontoon', async () => {
    mockBrowserSendMessageVoid()
      .expect({
        type: BackgroundClientMessageType.SEARCH_TEXT_IN_PONTOON,
        text: 'foo bar',
      })
      .andResolve();

    await searchTextInPontoon('foo bar');
  });

  it('reportTranslatedTextToBugzilla', async () => {
    mockBrowserSendMessageVoid()
      .expect({
        type: BackgroundClientMessageType.REPORT_TRANSLATED_TEXT_TO_BUGZILLA,
        text: 'foo bar',
      })
      .andResolve();

    await reportTranslatedTextToBugzilla('foo bar');
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
  });
});
