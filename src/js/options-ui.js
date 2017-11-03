'use strict';

// Fill update interval options
const dataUpdateSelect = document.querySelector('select[data-option-id=data_update_interval]');
[5, 15, 30, 60, 120]
    .map((interval) => {
        const option = document.createElement('option');
        option.value = interval;
        option.text = interval;
        return option;
    })
    .forEach((option) => dataUpdateSelect.appendChild(option));

const options = new Options();

// Handle reset button
document.getElementById('reset_defaults').addEventListener('click', () =>
    options.resetDefaults(() => options.loadAllFromLocalStorage())
);

// Fill team options
const localeTeamSelect = document.querySelector('select[data-option-id=locale_team]');
function updateTeamsList(teamsInPontoon) {
    while (localeTeamSelect.lastChild) {
        localeTeamSelect.removeChild(localeTeamSelect.lastChild);
    }
    teamsInPontoon
        .map((locale) => {
            const option = document.createElement('option');
            option.value = locale;
            option.text = locale;
            return option;
        })
        .forEach((option) => localeTeamSelect.appendChild(option));
}
const teamsListDataKey = 'teamsList';
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (changes[teamsListDataKey] !== undefined) {
        updateTeamsList(changes[teamsListDataKey].newValue);
    }
});
browser.storage.local.get(teamsListDataKey).then((items) =>
        updateTeamsList(items[teamsListDataKey])
    ).then(() => {
        // Load options values from storage.
        options.loadAllFromLocalStorage();
        // Watch for input changes and store the new values.
        document.querySelectorAll('[data-option-id]').forEach((input) =>
            input.addEventListener('change', (e) => options.updateOptionFromInput(e.target))
        );
    }).then(() => {
        const pontoonBaseUrlOptionKey = 'pontoon_base_url';
        const localeTeamOptionKey = 'locale_team';
        options.get([pontoonBaseUrlOptionKey, localeTeamOptionKey], (items) => {
            const remotePontoon = new RemotePontoon(items[pontoonBaseUrlOptionKey], items[localeTeamOptionKey], options);
            withRemotePontoon(remotePontoon);
        });
    }
);

function withRemotePontoon(remotePontoon) {
    // Load locale from Pontoon
    document.getElementById('load_locale_team').addEventListener('click', () =>
        remotePontoon.updateTeamsList().then(() =>
            remotePontoon.getTeamFromPontoon(
                (localeTeam) => {
                    localeTeamSelect.value = localeTeam;
                    options.updateOptionFromInput(localeTeamSelect);
                }
            )
        )
    );
}

// Allow remote Pontoon URL change
document.getElementById('edit_pontoon_base_url').addEventListener('click', () => {
    if (window.confirm('Changing Pontoon URL is for developers only. I know what I am doing!')) {
        document.getElementById('pontoon_base_url').removeAttribute('disabled');
        document.getElementById('pontoon_base_url').addEventListener('change', (e) =>
            browser.permissions.request({origins: [e.target.value+'/*']})
        );
    }
});
