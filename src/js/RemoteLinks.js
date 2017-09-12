class RemoteLinks {
    /**
     * Initialize instance and watch for options updates.
     * @param team locale
     */
    constructor(team) {
        this._team = team;
        this._watchOptionsUpdates();
    }

    /**
     * Get the Transvision URL for the team.
     * @returns {string}
     */
    getTransvisionUrl() {
        return `https://transvision.mozfr.org/?locale=${this._team}`;
    }

    /**
     * Get the mozilla-l10n.github.io/styleguides URL for the team.
     * @returns {string}
     */
    getMozillaStyleGuidesUrl() {
        return `https://mozilla-l10n.github.io/styleguides/${this._team}/`;
    }

    /**
     * Get l10n.mozilla.org dashboard URL for the team.
     * @returns {string}
     */
    getElmoDashboardUrl() {
        return `https://l10n.mozilla.org/teams/${this._team}`;
    }

    /**
     * Get Web Dashboard URL for the team.
     * @returns {string}
     */
    getWebDashboardUrl() {
        return `https://l10n.mozilla-community.org/webdashboard/?locale=${this._team}`;
    }

    /**
     * Get Mozilla Wiki L10n:Teams page URL.
     * @returns {string}
     */
    getMozillaWikiL10nTeamUrl() {
        return `https://wiki.mozilla.org/L10n:Teams:${this._team}`;
    }

    /**
     * Get Cambridge dictionary URL (not team specific).
     * @returns {string}
     */
    getCambridgeDictionaryUrl() {
        return 'https://dictionary.cambridge.org/translate/';
    }

    /**
     * Get amaGama search page URL (not team specific).
     * @returns {string}
     */
    getAmaGamaUrl() {
        return 'https://amagama-live.translatehouse.org/';
    }

    /**
     * Get Microsoft Terminology search URL (not team specific).
     * @returns {string}
     */
    getMicrosoftTerminologySearchUrl() {
        return 'https://www.microsoft.com/Language/en-US/Search.aspx';
    }

    /**
     * Get Bugzilla URL for reporting localization bus.
     * @param selectedText to report bug in
     * @param pageUrl to report bug for
     * @returns {string}
     */
    getBuzillaReportUrlForSelectedTextOnPage(selectedText, pageUrl) {
        return `https://bugzilla.mozilla.org/enter_bug.cgi?product=Mozilla Localizations&status_whiteboard=[pontoon-tools-feedback]&bug_file_loc=${pageUrl}&short_desc=[${this._team}] Translation update proposed for "${selectedText}" on ${pageUrl}&comment=The translation:%0A${selectedText}%0A%0AShould be:%0A`;
    }

    /**
     * Keep the team locale in sync with the options.
     * @private
     */
    _watchOptionsUpdates() {
        chrome.storage.onChanged.addListener((changes, areaName) => {
            if (changes['options.locale_team'] !== undefined) {
                this._team = changes['options.locale_team'].newValue;
            }
        });
    }
}
