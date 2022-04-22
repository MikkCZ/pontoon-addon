import type { ContextualIdentities } from 'webextension-polyfill';

import {
  BackgroundPontoonClient,
  TeamsList,
  TeamsListInStorage,
} from '@background/BackgroundPontoonClient';
import { Options } from '@commons/Options';
import { RemoteLinks } from '@commons/RemoteLinks';
import { browser } from '@commons/webExtensionsApi';

import '@commons/pontoon.css';
import './index-options.css';

Options.create().then((options) => {
  const backgroundPontoonClient = new BackgroundPontoonClient();
  const teamsListDataKey = 'teamsList';
  const dataUpdateSelect = document.querySelector(
    'select[data-option-id=data_update_interval]',
  )! as HTMLSelectElement;
  const localeTeamSelect = document.querySelector(
    'select[data-option-id=locale_team]',
  )! as HTMLSelectElement;
  const containerSelect = document.querySelector(
    'select[data-option-id=contextual_identity]',
  )! as HTMLSelectElement;

  // Fill update interval options
  [5, 15, 30, 60, 120]
    .map((interval) => {
      const option = document.createElement('option');
      option.value = `${interval}`;
      option.text = `${interval} min`;
      return option;
    })
    .forEach((option) => dataUpdateSelect.appendChild(option));

  // Fill select with Firefox containers
  if (browser.contextualIdentities !== undefined) {
    browser.contextualIdentities.query({}).then((containers) => {
      const containersInfo = containers as Pick<
        ContextualIdentities.ContextualIdentity,
        'cookieStoreId' | 'name'
      >[];
      containersInfo.unshift({
        cookieStoreId: 'firefox-default',
        name: 'Default (no container)',
      });
      containersInfo
        .map((container) => {
          const option = document.createElement('option');
          option.value = container.cookieStoreId;
          option.text = container.name;
          return option;
        })
        .forEach((option) => containerSelect.appendChild(option));
    });

    document
      .getElementById('edit_contextual_identity')!
      .addEventListener('click', () => {
        if (
          window.confirm(
            'If you do not login to Pontoon in a container tab, it’s better to keep this option to default. Do you really want to change it?',
          )
        ) {
          containerSelect.removeAttribute('disabled');
        }
      });
  } else {
    containerSelect.parentNode!.parentNode!.removeChild(
      containerSelect.parentNode!,
    );
  }

  // Handle reset button
  document.getElementById('reset_defaults')!.addEventListener('click', () => {
    if (
      window.confirm(
        'Do you really want to reset all Pontoon Add-on settings to default?',
      )
    ) {
      options.resetDefaults().then(() => options.loadAllFromLocalStorage());
    }
  });

  /**
   * Recreate the list of team offered in the options
   * @param teamsInPontoon list of teams in Pontoon
   * @param localeTeam the team that should be selected
   */
  function updateTeamsList(teamsInPontoon: TeamsList, localeTeam = '') {
    while (localeTeamSelect.lastChild) {
      localeTeamSelect.removeChild(localeTeamSelect.lastChild);
    }
    Object.entries(teamsInPontoon)
      .map(([locale, teamData]) => {
        const option = document.createElement('option');
        option.value = locale;
        option.text = `${teamData.name} (${locale})`;
        return option;
      })
      .forEach((option) => localeTeamSelect.appendChild(option));
    localeTeamSelect.value = localeTeam;
  }

  /**
   * With the necessary options and data from storage, fill the options and select the current values.
   */
  browser.storage.local
    .get(teamsListDataKey)
    .then((storageItem) => {
      // Prepare list of teams
      updateTeamsList((storageItem as TeamsListInStorage)[teamsListDataKey]);
      // Watch for input changes and store the new values.
      document
        .querySelectorAll('[data-option-id]')
        .forEach((input) =>
          input.addEventListener('change', () =>
            options.updateOptionFromInput(
              input as HTMLInputElement | HTMLSelectElement,
            ),
          ),
        );
    })
    .then(() =>
      // Load options values from storage.
      options.loadAllFromLocalStorage(),
    );

  // Links
  const remoteLinks = new RemoteLinks();
  document.querySelectorAll('a.open_tour').forEach((tourLink) =>
    tourLink.addEventListener('click', () =>
      browser.tabs.create({
        url: browser.runtime.getURL('frontend/intro.html'),
      }),
    ),
  );
  document
    .querySelectorAll('a.open_wiki')
    .forEach((wikiLink) =>
      wikiLink.addEventListener('click', () =>
        browser.tabs.create({ url: remoteLinks.getPontoonAddonWikiUrl() }),
      ),
    );
  document.querySelectorAll('a.open_privacy_policy').forEach((tourLink) =>
    tourLink.addEventListener('click', () =>
      browser.tabs.create({
        url: browser.runtime.getURL('frontend/privacy-policy.html'),
      }),
    ),
  );
  backgroundPontoonClient
    .getSettingsUrl()
    .then((settingsUrl) =>
      document
        .querySelector('a.pontoon_settings')!
        .setAttribute('href', settingsUrl),
    );

  // Handle reload button
  document.getElementById('load_locale_team')!.addEventListener('click', () => {
    localeTeamSelect.value = '';
    Promise.all([
      backgroundPontoonClient.updateTeamsList(),
      backgroundPontoonClient.getTeamFromPontoon(),
      options.get('locale_team').then((item) => item['locale_team']),
    ]).then(
      ([teamsInPontoon, localeTeamFromPontoon, localeTeamFromOptions]) => {
        updateTeamsList(
          teamsInPontoon as TeamsList,
          (localeTeamFromPontoon as string) ||
            (localeTeamFromOptions as string),
        );
        if (
          localeTeamFromPontoon &&
          localeTeamFromPontoon !== localeTeamFromOptions
        ) {
          options.updateOptionFromInput(localeTeamSelect);
        }
      },
    );
  });

  // Allow remote Pontoon URL change
  document
    .getElementById('edit_pontoon_base_url')!
    .addEventListener('click', () => {
      if (
        window.confirm(
          'Changing Pontoon URL is for developers only. I know what I am doing!',
        )
      ) {
        const pontoonBaseUrlInput = document.getElementById(
          'pontoon_base_url',
        )! as HTMLInputElement;
        pontoonBaseUrlInput.removeAttribute('disabled');
        pontoonBaseUrlInput.addEventListener('change', () =>
          browser.permissions.request({
            origins: [`${pontoonBaseUrlInput.value}/*`],
          }),
        );
      }
    });
});
