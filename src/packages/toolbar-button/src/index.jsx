import React from 'react';
import ReactDOM from 'react-dom';
import JavascriptTimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { Options } from '@pontoon-addon/commons/src/Options';
import { BackgroundPontoonClient } from '@pontoon-addon/commons/src/BackgroundPontoonClient';
import { NotificationsList } from './components/NotificationsList';
import { TeamInfo } from './components/TeamInfo';
import '@pontoon-addon/commons/static/css/pontoon.css';
import './index.css';
if (!browser) { // eslint-disable-line no-use-before-define
    var browser = require('webextension-polyfill'); // eslint-disable-line no-var, no-inner-declarations
}

/**
 * This is the main script for the content of the toolbar button popup. Registers handlers for actions and initiates
 * objects taking care of the content.
 */

export default Options.create().then(async (options) => {
  JavascriptTimeAgo.locale(en);
  const backgroundPontoonClient = new BackgroundPontoonClient();

  const hideReadNotificationsKey = 'toolbar_button_popup_always_hide_read_notifications';
  const localeTeamOptionKey = 'locale_team';
  const notificationsDataKey = 'notificationsData';
  const teamsListKey = 'teamsList';
  const latestTeamsActivityKey = 'latestTeamsActivity';
  const [notificationsData, hideReadNotifications, teamData, latestTeamActivity] = await Promise.all([
    options.get([hideReadNotificationsKey, localeTeamOptionKey]),
    browser.storage.local.get([notificationsDataKey, teamsListKey, latestTeamsActivityKey]),
  ]).then(([optionsItems, storageItems]) => [
    storageItems[notificationsDataKey],
    optionsItems[hideReadNotificationsKey],
    storageItems[teamsListKey][optionsItems[localeTeamOptionKey]],
    storageItems[latestTeamsActivityKey][optionsItems[localeTeamOptionKey]],
  ]);

  return ReactDOM.render(
    <React.Fragment>
      <NotificationsList
        notificationsData={notificationsData}
        hideReadNotifications={hideReadNotifications}
        backgroundPontoonClient={backgroundPontoonClient}
      />
      <TeamInfo
        name={teamData.name}
        code={teamData.code}
        stringsData={teamData.strings}
        latestActivity={latestTeamActivity}
        backgroundPontoonClient={backgroundPontoonClient}
      />
    </React.Fragment>,
    document.getElementById('root') || document.createElement('div')
  );
});
