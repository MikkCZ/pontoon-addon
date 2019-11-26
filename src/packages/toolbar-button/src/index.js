import React from 'react';
import ReactDOM from 'react-dom';
import JavascriptTimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { Options } from 'Commons/src/Options';
import { BackgroundPontoonClient } from 'Commons/src/BackgroundPontoonClient';
import { NotificationsList } from './NotificationsList';
import { TeamInfo } from './TeamInfo';
import { NotificationsListError } from './NotificationsListError';
import 'Commons/static/css/pontoon.css';
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

  const localeTeamOptionKey = 'locale_team';
  const teamsListKey = 'teamsList';
  const latestTeamsActivityKey = 'latestTeamsActivity';
  const [teamData, latestTeamActivity] = await Promise.all([
    options.get(localeTeamOptionKey).then((item) => item[localeTeamOptionKey]),
    browser.storage.local.get(teamsListKey).then((item) => item[teamsListKey]),
    browser.storage.local.get(latestTeamsActivityKey).then((item) => item[latestTeamsActivityKey]),
  ]).then(([
    localeTeam,
    teamsList,
    latestTeamsActivity,
  ]) => [
    teamsList[localeTeam],
    latestTeamsActivity[localeTeam],
  ]);

  return ReactDOM.render(
    <React.Fragment>
      <NotificationsListError
        backgroundPontoonClient={backgroundPontoonClient}
      />
      <NotificationsList
        notificationsData={[]}
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
