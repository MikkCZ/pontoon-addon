'use strict';

const localeTeamSelect = document.querySelector('select[data-option-id=locale_team]');
// TODO: load from https://pontoon.mozilla.org/teams/ > [...document.querySelectorAll('.team-list .code')].map(it => it.textContent.trim())
const teamsInPontoon = ['ach', 'af', 'ak', 'sq', 'am', 'ar', 'an', 'hy-AM', 'as', 'ast', 'az', 'bm', 'eu', 'be', 'bn', 'bn-BD', 'bn-IN', 'bs', 'br', 'bg', 'my', 'ca', 'zh-CN', 'zh-HK', 'zh-TW', 'ny', 'hr', 'cs', 'da', 'nl', 'en-GB', 'en-ZA', 'eo', 'et', 'ee', 'fi', 'fr', 'fy-NL', 'fur', 'ff', 'gd', 'gl', 'lg', 'ka', 'de', 'el', 'gn', 'gu-IN', 'ht', 'ha', 'he', 'azz', 'hi-IN', 'hu', 'is', 'ig', 'ilo', 'id', 'ia', 'ga-IE', 'it', 'ja', 'kab', 'kn', 'cak', 'ks', 'csb', 'kk', 'km', 'ko', 'ses', 'ku', 'lo', 'ltg', 'lv', 'lij', 'ln', 'lt', 'mk', 'mai', 'mg', 'ms', 'ml', 'arn', 'mr', 'zam', 'meh', 'mix', 'mn', 'ne-NP', 'nso', 'nb-NO', 'nn-NO', 'oc', 'or', 'pai', 'fa', 'pl', 'pt-BR', 'pt-PT', 'pa-IN', 'tsz', 'quy', 'qvi', 'ro', 'rm', 'ru', 'sr', 'si', 'sk', 'sl', 'son', 'dsb', 'hsb', 'es', 'es-AR', 'es-CL', 'es-MX', 'es-ES', 'sw', 'sv-SE', 'tl', 'tg', 'ta', 'te', 'th', 'trs', 'tr', 'uk', 'ur', 'uz', 'vi', 'cy', 'wo', 'xh', 'yo', 'zu'];
teamsInPontoon
    .map((locale) => {
        const option = document.createElement('option');
        option.value = locale;
        option.text = locale;
        return option;
    })
    .forEach((option) => localeTeamSelect.appendChild(option));

const options = new Options();

// Load options values from storage.
options.loadAllFromLocalStorage();

// Watch for input changes and store the new values.
document.querySelectorAll('[data-option-id]').forEach((input) =>
    input.addEventListener('change', (e) => options.updateOptionFromInput(e.target))
);
