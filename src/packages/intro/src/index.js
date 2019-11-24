import React from 'react';
import ReactDOM from 'react-dom';
import { Options } from 'Commons/src/Options';
import { RemoteLinks } from 'Commons/src/RemoteLinks';
import { TourPage } from './TourPage';
import toolbarButtonImage from './static/img/toolbar-button.png';
import pageActionImage from './static/img/page-action.png';
import contextButtonsImage from './static/img/context-buttons.png';
import settingsImage from './static/img/settings.png';
import feedbackImage from './static/img/2-Lions.png';
import 'Commons/static/css/pontoon.css';
import './index.css';
if (!browser) { // eslint-disable-line no-use-before-define
  var browser = require('webextension-polyfill'); // eslint-disable-line no-var, no-inner-declarations
}

const title = 'Welcome to Pontoon Add-on';
document.title = title;

export default Options.create().then(async (options) => {
  const remoteLinks = new RemoteLinks();

  const tiles = [];
  tiles.push({
    title: 'Pontoon button',
    image: toolbarButtonImage,
    text: (
      <React.Fragment>
        Pontoon icon in the toolbar offers <strong>quick access to notifications</strong> and your localization team progress.
      </React.Fragment>
    ),
    button: {
      text: 'See the Pontoon button',
      onClick: () => browser.browserAction.openPopup(),
    },
  });
  tiles.push({
    title: 'System notifications',
    text: 'Pontoon Add-on can bring notifications directly into your system. Try it!',
    button: {
      text: 'Preview system notifications',
      onClick: () => {
        options.set('show_notifications', true);
        browser.notifications.create({
          type: 'basic',
          iconUrl: browser.runtime.getURL('packages/commons/static/img/pontoon-logo.svg'),
          title: 'Notification from Pontoon',
          message: 'Similar notifications will appear if there is something new in Pontoon. You can click them to open related project in Pontoon.',
        });
      },
    },
  });
  if (browser.pageAction !== undefined) {
    tiles.push({
      title: 'Address bar button',
      image: pageActionImage,
      text: (
        <React.Fragment>
          So called <em>page action</em> is a button in the address bar, that lets you <strong>open in Pontoon the project</strong>, which is related to the current page.
        </React.Fragment>
      ),
      button: {
        text: 'Try it on mozilla.org',
        onClick: () => browser.tabs.create({url: 'https://www.mozilla.org/'}),
      },
    });
  }
  tiles.push({
    title: 'Context buttons',
    image: contextButtonsImage,
    text: (
      <React.Fragment>
        <strong>Look up strings in Pontoon</strong> or <strong>report bugs</strong> on localizer version of Mozilla website. Just select the text and click the context button.
      </React.Fragment>
    ),
    button: {
      text: 'Try it on mozilla.org',
      onClick: () => browser.tabs.create({url: 'https://www.mozilla.org/'}),
    },
  });
  tiles.push({
    title: 'Add-on settings',
    image: settingsImage,
    text: (
      <React.Fragment>
        Pontoon button, notifications, ... all these features are <strong>configurable</strong>.
      </React.Fragment>
    ),
    button: {
      text: 'Open Pontoon Add-on settings',
      onClick: () => browser.runtime.openOptionsPage(),
    },
  });
  tiles.push({
    title: 'Feedback and more',
    image: feedbackImage,
    text: (
      <React.Fragment>
        This add-on won't exist and improve without you - Mozilla localizers. Please <strong>share your feedback</strong> and feel free to request new features.
      </React.Fragment>
    ),
    button: {
      text: 'Check the wiki',
      onClick: () => browser.tabs.create({url: remoteLinks.getPontoonToolsWikiUrl()}),
    },
  });

  return ReactDOM.render(
    <TourPage
      title={title}
      tiles={tiles}
    />,
    document.getElementById('root') || document.createElement('div')
  );

});
