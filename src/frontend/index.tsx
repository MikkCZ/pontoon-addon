import React from 'react';
import ReactDOM from 'react-dom';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';

import { BackgroundPontoonClient } from '@background/BackgroundPontoonClient';
import { Options } from '@commons/Options';
import { browser } from '@commons/webExtensionsApi';

import { App as AddressBarApp } from './address-bar/App';
import { App as IntroApp } from './intro/App';
import { App as OptionsApp } from './options/App';
import { App as PrivacyPolicyApp } from './privacy-policy/App';
import { App as SnakeGameApp } from './snake-game/App';
import { App as ToolbarButtonApp } from './toolbar-button/App';

async function renderToolbarButtonApp(rootElement: HTMLElement): Promise<void> {
  TimeAgo.addLocale(en);
  const options = new Options();
  const backgroundPontoonClient = new BackgroundPontoonClient();

  const hideReadNotificationsKey =
    'toolbar_button_popup_always_hide_read_notifications';
  const localeTeamOptionKey = 'locale_team';
  const notificationsDataKey = 'notificationsData';
  const teamsListKey = 'teamsList';
  const latestTeamsActivityKey = 'latestTeamsActivity';
  const [
    notificationsData,
    hideReadNotifications,
    teamData,
    latestTeamActivity,
  ] = await Promise.all([
    options.get([hideReadNotificationsKey, localeTeamOptionKey]),
    browser.storage.local.get([
      notificationsDataKey,
      teamsListKey,
      latestTeamsActivityKey,
    ]),
  ]).then(([optionsItems, storageItems]) => [
    storageItems[notificationsDataKey],
    optionsItems[hideReadNotificationsKey],
    storageItems[teamsListKey][optionsItems[localeTeamOptionKey] as string],
    storageItems[latestTeamsActivityKey][
      optionsItems[localeTeamOptionKey] as string
    ],
  ]);

  const pontoonBaseUrl = await backgroundPontoonClient.getBaseUrl();
  const baseTag = document.createElement('base');
  baseTag.href = pontoonBaseUrl;
  document.getElementsByTagName('head')[0].appendChild(baseTag);

  ReactDOM.render(
    <ToolbarButtonApp
      notificationsData={notificationsData}
      hideReadNotifications={hideReadNotifications}
      backgroundPontoonClient={backgroundPontoonClient}
      teamData={teamData}
      latestTeamActivity={latestTeamActivity}
    />,
    rootElement,
  );
}

export async function render(): Promise<void> {
  const addressBarRoot = document.getElementById('address-bar-root');
  const introRoot = document.getElementById('intro-root');
  const optionsRoot = document.getElementById('options-root');
  const privacyPolicyRoot = document.getElementById('privacy-policy-root');
  const snakeGameRoot = document.getElementById('snake-game-root');
  const toolbarButtonRoot = document.getElementById('toolbar-button-root');

  addressBarRoot && ReactDOM.render(<AddressBarApp />, addressBarRoot);
  introRoot && ReactDOM.render(<IntroApp />, introRoot);
  optionsRoot && ReactDOM.render(<OptionsApp />, optionsRoot);
  privacyPolicyRoot && ReactDOM.render(<PrivacyPolicyApp />, privacyPolicyRoot);
  snakeGameRoot && ReactDOM.render(<SnakeGameApp />, snakeGameRoot);
  toolbarButtonRoot && (await renderToolbarButtonApp(toolbarButtonRoot));
}

render();
