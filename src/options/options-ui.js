/**
 * This is the main script for the options custom page and updating the options.
 * @requires commons/js/Options.js, commons/js/BackgroundPontoonClient.js
 */
'use strict';

const options = new Options();
const backgroundPontoonClient = new BackgroundPontoonClient();
const teamsListDataKey = 'teamsList';
const dataUpdateSelect = document.querySelector('select[data-option-id=data_update_interval]');
const localeTeamSelect = document.querySelector('select[data-option-id=locale_team]');

// Fill update interval options
[5, 15, 30, 60, 120]
    .map((interval) => {
        const option = document.createElement('option');
        option.value = interval;
        option.text = interval;
        return option;
    })
    .forEach((option) => dataUpdateSelect.appendChild(option));

// Handle reset button
document.getElementById('reset_defaults').addEventListener('click', () =>
    options.resetDefaults().then(
        () => options.loadAllFromLocalStorage()
    )
);

/**
 * Recreate the list of team offered in the options
 * @param teamsInPontoon list of teams in Pontoon
 * @param localeTeam the team that should be selected
 */
function updateTeamsList(teamsInPontoon, localeTeam) {
    while (localeTeamSelect.lastChild) {
        localeTeamSelect.removeChild(localeTeamSelect.lastChild);
    }
    Object.keys(teamsInPontoon)
        .map((locale) => {
            const option = document.createElement('option');
            option.value = locale;
            option.text = locale;
            return option;
        })
        .forEach((option) => localeTeamSelect.appendChild(option));
    localeTeamSelect.value = localeTeam;
}

/**
 * With the necessary options and data from storage, fill the options and select the current values.
 */
browser.storage.local.get(teamsListDataKey).then((storageItem) => {
    // Prepare list of teams
    updateTeamsList(storageItem[teamsListDataKey]);
    // Watch for input changes and store the new values.
    document.querySelectorAll('[data-option-id]').forEach((input) =>
        input.addEventListener('change', (e) => options.updateOptionFromInput(e.target))
    );
}).then(() =>
    // Load options values from storage.
    options.loadAllFromLocalStorage()
);

// Open Pontoon Tools tour
document.getElementById('open_tour').addEventListener('click', () => browser.tabs.create({url: browser.runtime.getURL('intro/index.html')}));

// Handle reload button
document.getElementById('load_locale_team').addEventListener('click', () => {
    localeTeamSelect.value = undefined;
    Promise.all([
        backgroundPontoonClient.updateTeamsList(),
        backgroundPontoonClient.getTeamFromPontoon(),
        options.get('locale_team').then((item) => item['locale_team']),
    ]).then(([teamsInPontoon, localeTeamFromPontoon, localeTeamFromOptions]) => {
        updateTeamsList(teamsInPontoon, localeTeamFromPontoon || localeTeamFromOptions);
        if (localeTeamFromPontoon && localeTeamFromPontoon !== localeTeamFromOptions) {
            options.updateOptionFromInput(localeTeamSelect);
        }
    });
});

// Allow remote Pontoon URL change
document.getElementById('edit_pontoon_base_url').addEventListener('click', () => {
    if (window.confirm('Changing Pontoon URL is for developers only. I know what I am doing!')) {
        document.getElementById('pontoon_base_url').removeAttribute('disabled');
        document.getElementById('pontoon_base_url').addEventListener('change', (e) =>
            browser.permissions.request({origins: [e.target.value+'/*']})
        );
    }
});
