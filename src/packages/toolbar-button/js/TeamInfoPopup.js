var moment = require('moment'); // eslint-disable-line no-var
var momentDurationFormatSetup = require('moment-duration-format'); // eslint-disable-line no-var
if (!browser) {
    var browser = require('webextension-polyfill'); // eslint-disable-line no-var, no-inner-declarations
}
momentDurationFormatSetup(moment);

/**
 * Display team information in the browser-action popup.
 */
export class TeamInfoPopup {
    /**
     * Initialize instance, load team info from storage and watch future info updates.
     * @param options
     * @param backgroundPontoonClient
     */
    constructor(options, backgroundPontoonClient) {
        this._options = options;
        this._backgroundPontoonClient = backgroundPontoonClient;

        this._loadTeamDataFromStorage();
    }

    /**
     * Load team info from storage and update the popup.
     * @private
     */
    _loadTeamDataFromStorage() {
        const teamDataKey = 'teamsList';
        const latestTeamsActivityKey = 'latestTeamsActivity';
        Promise.all([
            this._options.get('locale_team').then((item) => item['locale_team']),
            browser.storage.local.get(teamDataKey).then((item) => item[teamDataKey]),
            browser.storage.local.get(latestTeamsActivityKey).then((item) => item[latestTeamsActivityKey]),
        ]).then(([
            locale_team,
            teamsList,
            latestTeamsActivity
        ]) => {
            this._displayTeamInfo(teamsList[locale_team], latestTeamsActivity[locale_team]);
        });
    }

    /**
     * Create team info strings status list item from data object.
     * @param status
     * @param titleText
     * @param stringsCount
     * @returns {Element} team info strings status list item
     * @private
     */
    _createTeamStringStatusListItem(status, titleText, stringsCount) {
        const listItem = document.createElement('li');
        listItem.classList.add(status);
        const link = document.createElement('a');
        this._backgroundPontoonClient.getStringsWithStatusSearchUrl(status).then((searchUrl) =>
            link.setAttribute('href', searchUrl)
        );
        const title = document.createElement('span');
        title.classList.add('title');
        title.textContent = titleText;
        link.appendChild(title);
        const count = document.createElement('span');
        count.classList.add('count');
        count.textContent = stringsCount;
        link.appendChild(count);
        listItem.appendChild(link);
        return listItem;
    }

    /**
     * Return string of how much is the given date in past.
     * @param date
     * @returns {String}
     * @private
     * @static
     */
    static _timeAgo(date) {
        const dateMoment = moment.utc(date);
        if (!date || !dateMoment.isValid()) {
            return '―';
        }
        const duration = moment.duration(moment.utc().diff(dateMoment));
        const durationString = duration.format({
            template: 'Y __, M __, W __, D __, h __, m __, s __',
            largest: 2,
            minValue: 60,
        });
        return `${durationString} ago`;
    }

    /**
     * Display team info from data from storage.
     * @param teamData from storage
     * @param latestTeamActivity
     * @private
     */
    _displayTeamInfo(teamData, latestTeamActivity) {
        if (teamData) {
            document.querySelector('#team-info h1 .name').textContent = teamData.name;
            document.querySelector('#team-info h1 .code').textContent = teamData.code;
            const infoList = document.getElementById('team-info-list');
            while (infoList.lastChild) {
                infoList.removeChild(infoList.lastChild);
            }

            if (latestTeamActivity) {
                const activityItem = document.createElement('li');
                activityItem.classList.add('activity');
                const title = document.createElement('span');
                title.classList.add('title');
                title.textContent = 'Activity';
                activityItem.appendChild(title);
                const text = document.createElement('span');
                text.classList.add('text');
                text.textContent = `${latestTeamActivity.user} ${TeamInfoPopup._timeAgo(new Date(latestTeamActivity.date_iso))}`;
                activityItem.appendChild(text);
                infoList.appendChild(activityItem);
            }

            [
                {status: 'translated', text: 'translated', dataProperty: 'approvedStrings'},
                {status: 'fuzzy', text: 'fuzzy', dataProperty: 'fuzzyStrings'},
                {status: 'warnings', text: 'warnings', dataProperty: 'stringsWithWarnings'},
                {status: 'errors', text: 'errors', dataProperty: 'stringsWithErrors'},
                {status: 'missing', text: 'missing', dataProperty: 'missingStrings'},
                {status: 'unreviewed', text: 'unreviewed', dataProperty: 'unreviewedStrings'},
                {status: 'all', text: 'all strings', dataProperty: 'totalStrings'}
            ]
                .map((strings) =>
                    this._createTeamStringStatusListItem(strings.status, strings.text, teamData.strings[strings.dataProperty])
                )
                .forEach((listItem) => {
                    infoList.appendChild(listItem);
                });
        }
    }
}
