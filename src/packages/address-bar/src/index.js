import React from 'react';
import ReactDOM from 'react-dom';
import { PanelSection } from './PanelSection';
import { BackgroundPontoonClient } from 'Commons/src/BackgroundPontoonClient';
if (!browser) { // eslint-disable-line no-use-before-define
  var browser = require('webextension-polyfill'); // eslint-disable-line no-var, no-inner-declarations
}

const backgroundPontoonClient = new BackgroundPontoonClient();
backgroundPontoonClient.getPontoonProjectForTheCurrentTab().then((response) => {
  ReactDOM.render(
    <PanelSection items={[
      {
        text: `Open ${response.name} project page`,
        onClick: () => browser.tabs.create({url: response.pageUrl}),
      },
      {
        text: `Open ${response.name} translation view`,
        onClick: () => browser.tabs.create({url: response.translationUrl}),
      }
    ]} />,
    document.getElementById('root')
  );
});
