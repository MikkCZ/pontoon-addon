import React from 'react';
import ReactDOM from 'react-dom';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';

import { BackgroundPontoonClient } from '@background/BackgroundPontoonClient';
import { Options } from '@commons/Options';
import { browser } from '@commons/webExtensionsApi';

import { App as AddressBarApp } from './components/address-bar/App';
import { App as IntroApp } from './components/intro/App';
import { App as PrivacyPolicyApp } from './components/privacy-policy/App';
import { App as SnakeGameApp } from './components/snake-game/App';
import { App as ToolbarButtonApp } from './components/toolbar-button/App';

async function renderToolbarButtonApp(rootElement: HTMLElement): Promise<void> {
  TimeAgo.addLocale(en);
  const options = await Options.create();
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

async function render(): Promise<void> {
  const addressBarRoot = document.getElementById('address-bar-root');
  const introRoot = document.getElementById('intro-root');
  const privacyPolicyRoot = document.getElementById('privacy-policy-root');
  const snakeGameRoot = document.getElementById('snake-game-root');
  const toolbarButtonRoot = document.getElementById('toolbar-button-root');

  addressBarRoot && ReactDOM.render(<AddressBarApp />, addressBarRoot);
  introRoot && ReactDOM.render(<IntroApp />, introRoot);
  privacyPolicyRoot && ReactDOM.render(<PrivacyPolicyApp />, privacyPolicyRoot);
  snakeGameRoot && ReactDOM.render(<SnakeGameApp />, snakeGameRoot);
  toolbarButtonRoot && (await renderToolbarButtonApp(toolbarButtonRoot));
}

export default render();
