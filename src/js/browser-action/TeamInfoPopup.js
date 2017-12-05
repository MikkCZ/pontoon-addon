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
     * @param cssClass
     * @param titleText
     * @param stringsCount
     * @returns {Element} team info strings status list item
     * @private
     * @static
     */
    static _createTeamStringStatusListItem(cssClass, titleText, stringsCount) {
        const listItem = document.createElement('li');
        listItem.classList.add(cssClass);
        const title = document.createElement('span');
        title.classList.add('title');
        title.textContent = titleText;
        listItem.appendChild(title);
        const count = document.createElement('span');
        count.classList.add('count');
        count.textContent = stringsCount;
        listItem.appendChild(count);
        return listItem;
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
                const title = document.createElement('span');
                title.classList.add('title');
                title.textContent = 'Activity';
                activityItem.appendChild(title);
                const text = document.createElement('span');
                text.classList.add('text');
                text.textContent = `${latestTeamActivity.user} ${latestTeamActivity.time}`;
                activityItem.appendChild(text);
                infoList.appendChild(activityItem);
            }

            [
                {class: 'translated', text: 'translated strings', dataProperty: 'approvedStrings'},
                {class: 'suggested', text: 'suggested strings', dataProperty: 'suggestedStrings'},
                {class: 'fuzzy', text: 'fuzzy strings', dataProperty: 'fuzzyStrings'},
                {class: 'missing', text: 'missing strings', dataProperty: 'missingStrings'},
                {class: 'all', text: 'all strings', dataProperty: 'totalStrings'}
            ].map((strings) =>
                TeamInfoPopup._createTeamStringStatusListItem(strings.class, strings.text, teamData.strings[strings.dataProperty])
            )
            .forEach((listItem) => {
                console.log(listItem.innerHTML);
                infoList.appendChild(listItem);
            });
        }
    }
}
