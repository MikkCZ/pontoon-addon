class TeamInfoPopup {
    /**
     * Initialize instance, load team info from storage and watch future info updates.
     * @param options
     * @param remotePontoon
     */
    constructor(options, remotePontoon) {
        this._options = options;
        this._remotePontoon = remotePontoon;

        this._watchStorageChanges();
        this._loadTeamDataFromStorage();
    }

    /**
     * Update team info when data change in storage.
     * @private
     */
    _watchStorageChanges() {
        chrome.storage.onChanged.addListener((changes, areaName) => {
            if (changes['teamData'] !== undefined) {
                this._loadTeamDataFromStorage(changes['teamData'].newValue);
            }
        });
    }

    /**
     * Create team info strings status list item from data object.
     * @param data data object
     * @returns {Element} team info strings status list item
     * @private
     */
    static _createTeamStringStatusListItem(data) {
        const listItem = document.createElement('li');
        listItem.classList.add(data.status);
        const title = document.createElement('span');
        title.classList.add('title');
        title.textContent = data.title;
        listItem.appendChild(title);
        const count = document.createElement('span');
        count.classList.add('count');
        count.textContent = data.count;
        listItem.appendChild(count);
        return listItem;
    }

    /**
     * Display team info from data from storage.
     * @param teamData from storage
     * @private
     */
    _displayTeamInfo(teamData) {
        const optionKey = 'options.hide_team_info_in_popup';
        this._options.get(optionKey, (item) => {
            if(!item[optionKey] && teamData) {
                document.querySelector('#team-info h1 .name').textContent = teamData.teamName;
                document.querySelector('#team-info h1 .code').textContent = this._remotePontoon.getTeamCode();
                const infoList = document.querySelector('#team-info ul');
                while (infoList.lastChild) {
                    infoList.removeChild(infoList.lastChild);
                }
                Object.keys(teamData.strings)
                    .map((iKey) => teamData.strings[iKey])
                    .map((dataItem) => TeamInfoPopup._createTeamStringStatusListItem(dataItem))
                    .forEach((listItem) => infoList.appendChild(listItem));
            }
        });
    }

    /**
     * Load team info from storage and update the popup.
     * @private
     */
    _loadTeamDataFromStorage() {
        const dataKey = 'teamData';
        chrome.storage.local.get(dataKey, (item) => this._displayTeamInfo(item[dataKey]));
    }
}
