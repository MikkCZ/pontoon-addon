import React from 'react';
import ReactDOM from 'react-dom';
import { PanelSection } from './PanelSection';
import { BackgroundPontoonClient } from 'Commons/js/BackgroundPontoonClient';
if (!browser) { // eslint-disable-line no-use-before-define
  var browser = require('webextension-polyfill'); // eslint-disable-line no-var, no-inner-declarations
}

const backgroundPontoonClient = new BackgroundPontoonClient();
backgroundPontoonClient.getPontoonProjectForTheCurrentTab().then((response) => {
  ReactDOM.render(
    <PanelSection items={[
      {
        id: 'open-project-page',
        text: `Open ${response.name} project page`,
        onClick: () => browser.tabs.create({url: response.pageUrl}),
      },
      {
        id: 'open-translation-view',
        text: `Open ${response.name} translation view`,
        onClick: () => browser.tabs.create({url: response.translationUrl}),
      }
    ]} />,
    document.getElementById('root')
  );
});
