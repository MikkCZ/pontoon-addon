class RemoteLinks {
    constructor(team) {
        this._team = team;
        this._watchOptionsUpdates();
    }

    getTransvisionUrl() {
        return `https://transvision.mozfr.org/?locale=${this._team}`;
    }

    getMozillaStyleGuidesUrl() {
        return `https://mozilla-l10n.github.io/styleguides/${this._team}/`;
    }

    getElmoDashboardUrl() {
        return `https://l10n.mozilla.org/teams/${this._team}`;
    }

    getWebDashboardUrl() {
        return `https://l10n.mozilla-community.org/webdashboard/?locale=${this._team}`;
    }

    getMozillaWikiL10nTeamUrl() {
        return `https://wiki.mozilla.org/L10n:Teams:${this._team}`;
    }

    getCambridgeDictionaryUrl() {
        return 'https://dictionary.cambridge.org/translate/';
    }

    getAmaGamaUrl() {
        return 'https://amagama-live.translatehouse.org/';
    }

    getMicrosoftTerminologySearchUrl() {
        return 'https://www.microsoft.com/Language/en-US/Search.aspx';
    }

    getBuzillaReportUrlForSelectedTextOnPage(selectedText, pageUrl) {
        return `https://bugzilla.mozilla.org/enter_bug.cgi?product=Mozilla Localizations&status_whiteboard=[pontoon-tools-feedback]&bug_file_loc=${pageUrl}&short_desc=[${this._team}] Translation update proposed for "${selectedText}" on ${pageUrl}&comment=The translation:%0A${selectedText}%0A%0AShould be:%0A`;
    }

    _watchOptionsUpdates() {
        chrome.storage.onChanged.addListener(function(changes, areaName) {
            if (changes['options.locale_team'] !== undefined) {
                this._team = changes['options.locale_team'].newValue;
            }
        }.bind(this));
    }
}
