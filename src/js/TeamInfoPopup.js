function TeamInfoPopup(remotePontoon) {
    this._remotePontoon = remotePontoon;

    this._init();
}

TeamInfoPopup.prototype = {
    _init: function() {
        this._watchStorageChanges();
        this._loadTeamDataFromStorage();
    },

    _watchStorageChanges: function() {
        chrome.storage.onChanged.addListener(function(changes, areaName) {
            if (changes['teamData'] !== undefined) {
                this._loadTeamDataFromStorage(changes['teamData'].newValue);
            }
        }.bind(this));
    },

    _displayTeamInfo: function(teamData) {
        if (teamData) {
            var infoList = document.querySelector('#team-info ul');
            while (infoList.lastChild) {
                infoList.removeChild(infoList.lastChild);
            }
            for (const iKey of Object.keys(teamData)) {
                var dataItem = teamData[iKey];
                var listItem = document.createElement('li');
                listItem.classList.add(dataItem.status);
                var text = document.createElement('span');
                text.classList.add('text');
                text.textContent = dataItem.text;
                listItem.appendChild(text);
                var count = document.createElement('span');
                count.classList.add('count');
                count.textContent = dataItem.value;
                listItem.appendChild(count);
                infoList.appendChild(listItem);
            }
        }
    },

    _loadTeamDataFromStorage: function() {
        var dataKey = 'teamData';
        chrome.storage.local.get(dataKey, function(item) {
            this._displayTeamInfo(item[dataKey]);
        }.bind(this));
    },
}
