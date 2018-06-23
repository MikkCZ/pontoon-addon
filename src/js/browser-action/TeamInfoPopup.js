/**
 * Display team information in the browser-action popup.
 */
class TeamInfoPopup {
    /**
     * Initialize instance, load team info from storage and watch future info updates.
     * @param options
     * @param remotePontoon
     */
    constructor(options, remotePontoon) {
        this._options = options;
        this._remotePontoon = remotePontoon;

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
        link.setAttribute('href', this._remotePontoon.getStringsWithStatusSearchUrl(status));
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
        let diff = Math.floor(Math.abs(Date.now() - date)/1000);
        if (isNaN(diff)) {
            return '―';
        }
        const diff_years = Math.floor( diff/(60*60*24*365) );
        diff = diff%(60*60*24*365);
        const diff_months = Math.floor( diff/(60*60*24*30) );
        diff = diff%(60*60*24*30);
        const diff_weeks = Math.floor( diff/(60*60*24*7) );
        diff = diff%(60*60*24*7);
        const diff_days = Math.floor( diff/(60*60*24) );
        diff = diff%(60*60*24);
        const diff_hrs = Math.floor( diff/(60*60) );
        diff = diff%(60*60);
        const diff_mins = Math.floor( diff/60 );
        const diff_secs = diff%60;

        if (diff_years > 0) {
            return `${diff_years} years, ${diff_months} months ago`;
        } else if (diff_months > 0) {
            return `${diff_months} months, ${diff_weeks} weeks ago`;
        } else if (diff_weeks > 0) {
            return `${diff_weeks} weeks, ${diff_days} days ago`;
        } else if (diff_days > 0) {
            return `${diff_days} days, ${diff_hrs} hours ago`;
        } else if (diff_hrs > 0) {
            return `${diff_hrs} hours ago`;
        } else if (diff_mins > 0) {
            return `${diff_mins} minutes ago`;
        } else {
            return `${diff_secs} seconds ago`;
        }
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
            const infoList = document.querySelector('#team-info ul');
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
                text.textContent = `${latestTeamActivity.user} ${TeamInfoPopup._timeAgo(latestTeamActivity.date)}`;
                activityItem.appendChild(text);
                infoList.appendChild(activityItem);
            }

            [
                {status: 'translated', text: 'translated strings', dataProperty: 'approvedStrings'},
                {status: 'fuzzy', text: 'fuzzy strings', dataProperty: 'fuzzyStrings'},
                {status: 'missing', text: 'missing strings', dataProperty: 'missingStrings'},
                {status: 'unreviewed', text: 'unreviewed strings', dataProperty: 'unreviewedStrings'},
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
