/* eslint-disable jest/expect-expect */
import { getOneOption } from '../options';

import type { BackgroundMessage } from '.';
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
} from '.';

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

describe('messagingClient', () => {
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
    const mockTeamsList: BackgroundMessage['UPDATE_TEAMS_LIST']['response'] = {
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
    };
    (browser.runtime.sendMessage as jest.Mock).mockResolvedValueOnce(
      mockTeamsList,
    );

    const teams = await updateTeamsList();

    expect(teams).toStrictEqual(mockTeamsList);
    expect(browser.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'update-teams-list',
    });
  });

  it('getUsersTeamFromPontoon', async () => {
    (browser.runtime.sendMessage as jest.Mock).mockResolvedValueOnce('cs');

    const team = await getUsersTeamFromPontoon();

    expect(team).toBe('cs');
    expect(browser.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'get-team-from-pontoon',
    });
  });

  it('getPontoonProjectForTheCurrentTab', async () => {
    const mockProject: BackgroundMessage['GET_CURRENT_TAB_PROJECT']['response'] =
      {
        slug: 'firefox',
        name: 'Firefox',
        domains: [],
      };
    (browser.runtime.sendMessage as jest.Mock).mockResolvedValueOnce(
      mockProject,
    );

    const project = await getPontoonProjectForTheCurrentTab();

    expect(project).toStrictEqual(mockProject);
    expect(browser.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'get-current-tab-project',
    });
  });

  it('pageLoaded', async () => {
    (browser.runtime.sendMessage as jest.Mock).mockResolvedValueOnce(undefined);

    await pageLoaded('<html></html>');

    expect(browser.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'pontoon-page-loaded',
      documentHTML: '<html></html>',
    });
  });

  it('markAllNotificationsAsRead', async () => {
    (browser.runtime.sendMessage as jest.Mock).mockResolvedValueOnce(undefined);

    await markAllNotificationsAsRead();

    expect(browser.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'notifications-read',
    });
  });

  it('searchTextInPontoon', async () => {
    (browser.runtime.sendMessage as jest.Mock).mockResolvedValueOnce(undefined);

    await searchTextInPontoon('foo bar');

    expect(browser.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'search-text-in-pontoon',
      text: 'foo bar',
    });
  });

  it('reportTranslatedTextToBugzilla', async () => {
    (browser.runtime.sendMessage as jest.Mock).mockResolvedValueOnce(undefined);

    await reportTranslatedTextToBugzilla('foo bar');

    expect(browser.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'report-translated-text-to-bugzilla',
      text: 'foo bar',
    });
  });

  it('notificationBellIconScriptLoaded', async () => {
    (browser.runtime.sendMessage as jest.Mock).mockResolvedValueOnce({
      type: 'enable-notifications-bell-script',
    });

    const response = await notificationBellIconScriptLoaded();

    expect(response).toStrictEqual({
      type: 'enable-notifications-bell-script',
    });
    expect(browser.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'notifications-bell-script-loaded',
    });
  });
});
