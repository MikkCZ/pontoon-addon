import React from 'react';
import ReactDOM from 'react-dom';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';

import { BackgroundPontoonClient } from '@background/BackgroundPontoonClient';
import { Options } from '@commons/Options';
import { RemoteLinks } from '@commons/RemoteLinks';
import { browser } from '@commons/webExtensionsApi';

import { AddressBarRoot } from './components/address-bar/AddressBarRoot';
import { TourRoot } from './components/intro/TourRoot';
import { PrivacyPolicyRoot } from './components/privacy-policy/PrivacyPolicyRoot';
import { SnakeGameRoot } from './components/snake/SnakeGameRoot';
import { ToolbarButtonRoot } from './components/toolbar-button/ToolbarButtonRoot';

import '@commons/pontoon.css';

const addressBarRoot = document.getElementById('address-bar-root');
const tourRoot = document.getElementById('tour-root');
const privacyPolicyRoot = document.getElementById('privacy-policy-root');
const snakeRoot = document.getElementById('snake-root');
const toolbarButtonRoot = document.getElementById('toolbar-button-root');

async function renderAddressBarRoot(element: HTMLElement): Promise<void> {
  const backgroundPontoonClient = new BackgroundPontoonClient();
  const project =
    await backgroundPontoonClient.getPontoonProjectForTheCurrentTab();
  ReactDOM.render(<AddressBarRoot project={project} />, element);
}

async function renderTourRoot(element: HTMLElement): Promise<void> {
  const title = 'Welcome to Pontoon Add-on';
  document.title = title;

  const options = await Options.create();
  const remoteLinks = new RemoteLinks();

  ReactDOM.render(
    <TourRoot
      title={title}
      enableNotifications={() => options.set('show_notifications', true)}
      openWiki={() =>
        browser.tabs.create({ url: remoteLinks.getPontoonAddonWikiUrl() })
      }
    />,
    element,
  );
}

async function renderPrivacyPolicyRoot(element: HTMLElement): Promise<void> {
  ReactDOM.render(<PrivacyPolicyRoot />, element);
}

async function renderSnakeRoot(element: HTMLElement): Promise<void> {
  ReactDOM.render(<SnakeGameRoot />, element);
}

async function renderToolbarButtonRoot(element: HTMLElement): Promise<void> {
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
    <ToolbarButtonRoot
      notificationsData={notificationsData}
      hideReadNotifications={hideReadNotifications}
      backgroundPontoonClient={backgroundPontoonClient}
      teamData={teamData}
      latestTeamActivity={latestTeamActivity}
    />,
    element,
  );
}

async function render(): Promise<void> {
  addressBarRoot && (await renderAddressBarRoot(addressBarRoot));
  tourRoot && (await renderTourRoot(tourRoot));
  privacyPolicyRoot && (await renderPrivacyPolicyRoot(privacyPolicyRoot));
  snakeRoot && (await renderSnakeRoot(snakeRoot));
  toolbarButtonRoot && (await renderToolbarButtonRoot(toolbarButtonRoot));
}

export default render();
