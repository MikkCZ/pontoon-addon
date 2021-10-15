import React from 'react';
import ReactDOM from 'react-dom';
import { Options } from '@pontoon-addon/commons/src/Options';
import { RemoteLinks } from '@pontoon-addon/commons/src/RemoteLinks';

import { browser } from './util/webExtensionsApi';
import { TourRoot } from './root/TourRoot';
import '@pontoon-addon/commons/static/css/pontoon.css';
import './index.css';

const title = 'Welcome to Pontoon Add-on';
document.title = title;

async function render(): Promise<void> {
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
    document.getElementById('tour-root')
  );
}

export default render();
