/**
 * Encapsulate all links to remote sources or websites, except those to Pontoon.
 */
class RemoteLinks {
    /**
     * Initialize instance and watch for options updates.
     * @param options
     */
    constructor(options) {
        this._options = options;
    }

    /**
     * Get the Transvision URL for the team.
     * @param team locale
     * @returns {string}
     * @public
     */
    getTransvisionUrl(team) {
        return `https://transvision.mozfr.org/?locale=${team}&utm_source=pontoon-tools`;
    }

    /**
     * Get the mozilla-l10n.github.io/styleguides URL for the team.
     * @param team locale
     * @returns {string}
     * @public
     */
    getMozillaStyleGuidesUrl(team) {
        return `https://mozilla-l10n.github.io/styleguides/${team}/?utm_source=pontoon-tools`;
    }

    /**
     * Get l10n.mozilla.org dashboard URL for the team.
     * @param team locale
     * @returns {string}
     * @public
     */
    getElmoDashboardUrl(team) {
        return `https://l10n.mozilla.org/teams/${team}?utm_source=pontoon-tools`;
    }

    /**
     * Get Web Dashboard URL for the team.
     * @param team locale
     * @returns {string}
     * @public
     */
    getWebDashboardUrl(team) {
        return `https://l10n.mozilla-community.org/webdashboard/?locale=${team}&utm_source=pontoon-tools`;
    }

    /**
     * Get Mozilla Wiki L10n:Teams page URL.
     * @param team locale
     * @returns {string}
     * @public
     */
    getMozillaWikiL10nTeamUrl(team) {
        return `https://wiki.mozilla.org/L10n:Teams:${team}`;
    }

    /**
     * Get Cambridge dictionary URL (not team specific).
     * @returns {string}
     * @public
     */
    getCambridgeDictionaryUrl() {
        return 'https://dictionary.cambridge.org/translate/';
    }

    /**
     * Get amaGama search page URL (not team specific).
     * @returns {string}
     * @public
     */
    getAmaGamaUrl() {
        return 'https://amagama-live.translatehouse.org/';
    }

    /**
     * Get Microsoft Terminology search URL (not team specific).
     * @returns {string}
     * @public
     */
    getMicrosoftTerminologySearchUrl() {
        return 'https://www.microsoft.com/Language/en-US/Search.aspx';
    }

    /**
     * Get Bugzilla URL for reporting localization bus.
     * @param selectedText to report bug in
     * @param pageUrl to report bug for
     * @param team locale
     * @param teamComponent name of the Bugzilla component to report to
     * @returns {string}
     * @public
     */
    getBugzillaReportUrlForSelectedTextOnPage(selectedText, pageUrl, team, teamComponent) {
        return `https://bugzilla.mozilla.org/enter_bug.cgi?product=Mozilla Localizations&component=${teamComponent}&status_whiteboard=[pontoon-tools-feedback]&bug_file_loc=${pageUrl}&short_desc=[${team}] Translation update proposed for "${selectedText}" on ${pageUrl}&comment=The translation:%0A${selectedText}%0A%0AShould be:%0A`;
    }
}
