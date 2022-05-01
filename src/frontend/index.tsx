import React from 'react';
import ReactDOM from 'react-dom';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';

import { BackgroundPontoonClient } from '@background/BackgroundPontoonClient';
import { getFromStorage } from '@commons/webExtensionsApi';
import { getOptions } from '@commons/options';

import { App as AddressBarApp } from './address-bar/App';
import { App as IntroApp } from './intro/App';
import { App as OptionsApp } from './options/App';
import { App as PrivacyPolicyApp } from './privacy-policy/App';
import { App as SnakeGameApp } from './snake-game/App';
import { App as ToolbarButtonApp } from './toolbar-button/App';

async function renderToolbarButtonApp(rootElement: HTMLElement): Promise<void> {
  TimeAgo.addLocale(en);
  const backgroundPontoonClient = new BackgroundPontoonClient();

  const [
    {
      toolbar_button_popup_always_hide_read_notifications:
        hideReadNotifications,
      locale_team: teamCode,
    },
    { notificationsData, teamsList, latestTeamsActivity },
  ] = await Promise.all([
    getOptions([
      'toolbar_button_popup_always_hide_read_notifications',
      'locale_team',
    ]),
    getFromStorage(['notificationsData', 'teamsList', 'latestTeamsActivity']),
  ]);
  const teamData = teamsList![teamCode];
  const latestTeamActivity = latestTeamsActivity![teamCode];

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
