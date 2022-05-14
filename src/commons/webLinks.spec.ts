import {
  newLocalizationBug,
  pontoonFxaSignIn,
  pontoonNotifications,
  pontoonProjectTranslationView,
  pontoonSearchStringsWithStatus,
  pontoonSettings,
  pontoonTeam,
  pontoonTeamBugs,
  pontoonTeamInsights,
  pontoonTeamsList,
  pontoonTeamsProject,
  toPontoonTeamSpecificProjectUrl,
} from './webLinks';

describe('webLinks', () => {
  it('pontoonFxaSignIn', () => {
    const url = pontoonFxaSignIn('https://localhost');

    expect(url).toBe('https://localhost/accounts/fxa/login');
  });

  it('pontoonNotifications', () => {
    const url = pontoonNotifications('https://localhost');

    expect(url).toBe(
      'https://localhost/notifications?utm_source=pontoon-addon',
    );
  });

  it('pontoonSettings', () => {
    expect(pontoonSettings('https://localhost')).toBe(
      'https://localhost/settings/?utm_source=pontoon-addon',
    );
    expect(pontoonSettings('https://localhost', 'foo')).toBe(
      'https://localhost/settings/?utm_source=foo',
    );
  });

  it('pontoonTeam', () => {
    const url = pontoonTeam('https://localhost', { code: 'cs' });

    expect(url).toBe('https://localhost/cs?utm_source=pontoon-addon');
  });

  it('pontoonTeamInsights', () => {
    const url = pontoonTeamInsights('https://localhost', { code: 'cs' });

    expect(url).toBe('https://localhost/cs/insights?utm_source=pontoon-addon');
  });

  it('pontoonTeamBugs', () => {
    const url = pontoonTeamBugs('https://localhost', { code: 'cs' });

    expect(url).toBe('https://localhost/cs/bugs');
  });

  it('pontoonTeamsProject', () => {
    const url = pontoonTeamsProject(
      'https://localhost',
      { code: 'cs' },
      { slug: 'firefox' },
    );

    expect(url).toBe('https://localhost/cs/firefox?utm_source=pontoon-addon');
  });

  it('pontoonProjectTranslationView', () => {
    const url = pontoonProjectTranslationView(
      'https://localhost',
      { code: 'cs' },
      { slug: 'firefox' },
      'search this',
    );

    expect(url).toBe(
      'https://localhost/cs/firefox/all-resources?search=search%20this&utm_source=pontoon-addon',
    );
  });

  it('pontoonSearchStringsWithStatus', () => {
    const url = pontoonSearchStringsWithStatus(
      'https://localhost',
      { code: 'cs' },
      'translated',
    );

    expect(url).toBe(
      'https://localhost/cs/all-projects/all-resources?status=translated&utm_source=pontoon-addon',
    );
  });

  it('pontoonTeamsList', () => {
    expect(pontoonTeamsList('https://localhost')).toBe(
      'https://localhost/teams/?utm_source=pontoon-addon',
    );
    expect(pontoonTeamsList('https://localhost', 'foo')).toBe(
      'https://localhost/teams/?utm_source=foo',
    );
  });

  it('toPontoonTeamSpecificProjectUrl', () => {
    const url = toPontoonTeamSpecificProjectUrl(
      'https://localhost',
      { code: 'cs' },
      '/projects/firefox?foo=bar',
    );

    expect(url).toBe(
      'https://localhost/cs/firefox?foo=bar&utm_source=pontoon-addon',
    );
  });

  it('newLocalizationBug', () => {
    const url = newLocalizationBug({
      team: { code: 'cs', bz_component: 'Czech L10N' },
      selectedText: '   report this ',
      url: 'https://localhost?foo=bar',
    });

    expect(url).toBe(
      `https://bugzilla.mozilla.org/enter_bug.cgi?product=${encodeURIComponent(
        'Mozilla Localizations',
      )}&component=${encodeURIComponent(
        'Czech L10N',
      )}&status_whiteboard=${encodeURIComponent(
        '[pontoon-addon-feedback]',
      )}&bug_file_loc=${encodeURIComponent(
        'https://localhost?foo=bar',
      )}&short_desc=${encodeURIComponent(
        '[cs] Translation update proposed for "report this" on https://localhost?foo=bar',
      )}&comment=${encodeURIComponent(
        'The translation:\nreport this\n\nShould be:\n',
      )}`,
    );
  });

  it('newLocalizationBug without selected text', () => {
    const url = newLocalizationBug({
      team: { code: 'cs', bz_component: 'Czech L10N' },
      url: 'https://localhost?foo=bar',
    });

    expect(url).toBe(
      `https://bugzilla.mozilla.org/enter_bug.cgi?product=${encodeURIComponent(
        'Mozilla Localizations',
      )}&component=${encodeURIComponent(
        'Czech L10N',
      )}&status_whiteboard=${encodeURIComponent(
        '[pontoon-addon-feedback]',
      )}&bug_file_loc=${encodeURIComponent(
        'https://localhost?foo=bar',
      )}&short_desc=${encodeURIComponent(
        '[cs] Translation update proposed on https://localhost?foo=bar',
      )}`,
    );
  });
});
