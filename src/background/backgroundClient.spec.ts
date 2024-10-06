/* eslint-disable jest/expect-expect */
import type { MockzillaDeep } from 'mockzilla';
import 'mockzilla-webextension';

import { getOneOption } from '@commons/options';
import type { BackgroundClientMessage } from '@commons/BackgroundClientMessageType';

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

jest.mock('@commons/webExtensionsApi/browser');
jest.mock('@commons/options');

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

afterEach(() => {
  jest.clearAllMocks();
});

function mockBrowserSendMessage<T extends keyof BackgroundClientMessage>() {
  return mockBrowser.runtime.sendMessage as unknown as MockzillaDeep<{
    (
      message: BackgroundClientMessage[T]['message'],
    ): Promise<BackgroundClientMessage[T]['response']>;
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
    mockBrowserSendMessage<'UPDATE_TEAMS_LIST'>()
      .expect({ type: 'update-teams-list' })
      .andResolve({
        cs: {
          code: 'cs',
          name: 'Czech',
          bz_component: 'BZ / Czech',
          strings: {
            approvedStrings: 0,
            pretranslatedStrings: 0,
            stringsWithWarnings: 0,
            stringsWithErrors: 0,
            missingStrings: 0,
            unreviewedStrings: 0,
            totalStrings: 0,
          },
        },
      });

    const teams = await updateTeamsList();

    expect(teams).toStrictEqual({ cs: { name: 'Czech' } });
  });

  it('getUsersTeamFromPontoon', async () => {
    mockBrowserSendMessage<'GET_TEAM_FROM_PONTOON'>()
      .expect({ type: 'get-team-from-pontoon' })
      .andResolve('cs');

    const team = await getUsersTeamFromPontoon();

    expect(team).toBe('cs');
  });

  it('getPontoonProjectForTheCurrentTab', async () => {
    mockBrowserSendMessage<'GET_CURRENT_TAB_PROJECT'>()
      .expect({ type: 'get-current-tab-project' })
      .andResolve({ slug: 'firefox', name: 'Firefox', domains: [] });

    const project = await getPontoonProjectForTheCurrentTab();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(project?.slug).toBe('firefox');
  });

  it('pageLoaded', async () => {
    mockBrowserSendMessage<'PAGE_LOADED'>()
      .expect({
        type: 'pontoon-page-loaded',
        documentHTML: '<html></html>',
      })
      .andResolve();

    await pageLoaded('<html></html>');
  });

  it('markAllNotificationsAsRead', async () => {
    mockBrowserSendMessage<'NOTIFICATIONS_READ'>()
      .expect({ type: 'notifications-read' })
      .andResolve();

    await markAllNotificationsAsRead();
  });

  it('searchTextInPontoon', async () => {
    mockBrowserSendMessage<'SEARCH_TEXT_IN_PONTOON'>()
      .expect({
        type: 'search-text-in-pontoon',
        text: 'foo bar',
      })
      .andResolve();

    await searchTextInPontoon('foo bar');
  });

  it('reportTranslatedTextToBugzilla', async () => {
    mockBrowserSendMessage<'REPORT_TRANSLATED_TEXT_TO_BUGZILLA'>()
      .expect({
        type: 'report-translated-text-to-bugzilla',
        text: 'foo bar',
      })
      .andResolve();

    await reportTranslatedTextToBugzilla('foo bar');
  });

  it('notificationBellIconScriptLoaded', async () => {
    mockBrowserSendMessage<'NOTIFICATIONS_BELL_SCRIPT_LOADED'>()
      .expect({
        type: 'notifications-bell-script-loaded',
      })
      .andResolve({
        type: 'enable-notifications-bell-script',
      });

    const response = await notificationBellIconScriptLoaded();

    expect(response.type).toBe('enable-notifications-bell-script');
  });
});
