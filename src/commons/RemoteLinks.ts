/**
 * Provides all links to remote sources or websites outside of Pontoon.
 */
export class RemoteLinks {
  getTransvisionUrl(team: string): string {
    return `https://transvision.mozfr.org/?locale=${team}&utm_source=pontoon-addon`;
  }

  getMozillaStyleGuidesUrl(team: string): string {
    return `https://mozilla-l10n.github.io/styleguides/${team}/?utm_source=pontoon-addon`;
  }

  getMozillaWikiL10nTeamUrl(team: string): string {
    return `https://wiki.mozilla.org/L10n:Teams:${team}`;
  }

  getMicrosoftTerminologySearchUrl(): string {
    return 'https://www.microsoft.com/language/';
  }

  getBugzillaReportUrlForSelectedTextOnPage(
    selectedText: string,
    pageUrl: string,
    team: string,
    teamComponent: string
  ): string {
    return `https://bugzilla.mozilla.org/enter_bug.cgi?product=Mozilla Localizations&component=${teamComponent}&status_whiteboard=[pontoon-addon-feedback]&bug_file_loc=${pageUrl}&short_desc=[${team}] Translation update proposed for "${selectedText.trim()}" on ${pageUrl}&comment=The translation:%0A${selectedText.trim()}%0A%0AShould be:%0A`;
  }

  getPontoonAddonWikiUrl(): string {
    return 'https://github.com/MikkCZ/pontoon-addon/wiki';
  }
}
