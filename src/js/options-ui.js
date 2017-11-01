'use strict';

// Fill team options
const localeTeamSelect = document.querySelector('select[data-option-id=locale_team]');
// TODO: https://github.com/MikkCZ/pontoon-tools/issues/33
const teamsInPontoon = ['af', 'ach', 'ak', 'am', 'an', 'ar', 'arn', 'as', 'ast', 'az', 'azz', 'be', 'bg', 'bm', 'bn', 'bn-BD', 'bn-IN', 'br', 'bs', 'ca', 'cak', 'cs', 'csb', 'cy', 'da', 'de', 'dsb', 'ee', 'el', 'en-GB', 'en-ZA', 'eo', 'es', 'es-AR', 'es-CL', 'es-ES', 'es-MX', 'et', 'eu', 'fa', 'ff', 'fi', 'fr', 'fur', 'fy-NL', 'ga-IE', 'gd', 'gl', 'gn', 'gu-IN', 'ha', 'he', 'hi-IN', 'hr', 'hsb', 'ht', 'hu', 'hy-AM', 'ia', 'id', 'ig', 'ilo', 'is', 'it', 'ja', 'ka', 'kab', 'kk', 'km', 'kn', 'ko', 'ks', 'ku', 'lg', 'lij', 'ln', 'lo', 'lt', 'ltg', 'lv', 'mai', 'meh', 'mg', 'mix', 'mk', 'ml', 'mn', 'mr', 'ms', 'my', 'nb-NO', 'ne-NP', 'nl', 'nn-NO', 'nso', 'ny', 'oc', 'or', 'pa-IN', 'pai', 'pl', 'pt-BR', 'pt-PT', 'quy', 'qvi', 'rm', 'ro', 'ru', 'ses', 'si', 'sk', 'sl', 'son', 'sq', 'sr', 'sv-SE', 'sw', 'ta', 'te', 'tg', 'th', 'tl', 'tr', 'trs', 'tsz', 'uk', 'ur', 'uz', 'vi', 'wo', 'xh', 'yo', 'zam', 'zh-CN', 'zh-HK', 'zh-TW', 'zu'];
teamsInPontoon
    .map((locale) => {
        const option = document.createElement('option');
        option.value = locale;
        option.text = locale;
        return option;
    })
    .forEach((option) => localeTeamSelect.appendChild(option));

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

// Load options values from storage.
options.loadAllFromLocalStorage();

// Watch for input changes and store the new values.
document.querySelectorAll('[data-option-id]').forEach((input) =>
    input.addEventListener('change', (e) => options.updateOptionFromInput(e.target))
);

function withRemotePontoon(remotePontoon) {
    // Load locale from Pontoon
    document.getElementById('load_locale_team').addEventListener('click', () =>
        remotePontoon.getTeamFromPontoon(
            (localeTeam) => {
                localeTeamSelect.value = localeTeam;
                options.updateOptionFromInput(localeTeamSelect);
            }
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

const pontoonBaseUrlOptionKey = 'pontoon_base_url';
const localeTeamOptionKey = 'locale_team';
options.get([pontoonBaseUrlOptionKey, localeTeamOptionKey], (items) => {
  const remotePontoon = new RemotePontoon(items[pontoonBaseUrlOptionKey], items[localeTeamOptionKey], options);
  withRemotePontoon(remotePontoon);
});
