import React from 'react';
import ReactDOM from 'react-dom';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
import { Options } from '@pontoon-addon/commons/src/Options';
import { BackgroundPontoonClient } from '@pontoon-addon/commons/src/BackgroundPontoonClient';
import { browser } from '@pontoon-addon/commons/src/webExtensionsApi';

import { NotificationsList } from './components/NotificationsList';
import { TeamInfo } from './components/TeamInfo';
import '@pontoon-addon/commons/static/css/pontoon.css';
import './index.css';

async function render(): Promise<void> {
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
    <React.Fragment>
      <NotificationsList
        notificationsData={notificationsData}
        hideReadNotifications={hideReadNotifications}
        backgroundPontoonClient={backgroundPontoonClient}
      />
      <TeamInfo
        name={teamData?.name}
        code={teamData?.code}
        stringsData={teamData?.strings}
        latestActivity={latestTeamActivity}
        backgroundPontoonClient={backgroundPontoonClient}
      />
    </React.Fragment>,
    document.getElementById('toolbar-button-root')
  );
}

export default render();
