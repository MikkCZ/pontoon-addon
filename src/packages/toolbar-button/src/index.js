import React from 'react';
import ReactDOM from 'react-dom';
import { Options } from 'Commons/src/Options';
import { BackgroundPontoonClient } from 'Commons/src/BackgroundPontoonClient';
import { NotificationsList } from './NotificationsList';
import { TeamInfo } from './TeamInfo';
import { Error } from './Error';
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
    const backgroundPontoonClient = new BackgroundPontoonClient();

    return ReactDOM.render(
      <React.Fragment>
        <Error
          backgroundPontoonClient={backgroundPontoonClient}
        />
        <NotificationsList
          notificationsData={[]}
          backgroundPontoonClient={backgroundPontoonClient}
        />
        <TeamInfo
          name='NAME'
          code='co-de'
          backgroundPontoonClient={backgroundPontoonClient}
        />
      </React.Fragment>,
      document.getElementById('root') || document.createElement('div')
    );
});
