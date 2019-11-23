import React from 'react';
import ReactDOM from 'react-dom';
import { Options } from 'Commons/src/Options';
import { RemoteLinks } from 'Commons/src/RemoteLinks';
import { TourDialog } from './TourDialog';
import toolbarButtonImage from './static/img/toolbar-button.png';
import pageActionImage from './static/img/page-action.png';
import contextButtonsImage from './static/img/context-buttons.png';
import settingsImage from './static/img/settings.png';
import feedbackImage from './static/img/2-Lions.png';
import './index.css';
if (!browser) { // eslint-disable-line no-use-before-define
  var browser = require('webextension-polyfill'); // eslint-disable-line no-var, no-inner-declarations
}

const title = 'Welcome to Pontoon Tools';
document.title = title;

export default Options.create().then(async (options) => {
  const remoteLinks = new RemoteLinks();

  const localeTeamOption = 'locale_team';
  const localeTeam = await options.get(localeTeamOption).then((item) => item[localeTeamOption]);

  const sections = [];
  sections.push({
    id: 'toolbarButton',
    title: 'Toolbar button',
    text: `After installation is complete, a Pontoon icon will appear in your browser toolbar. When there are new notifications for
            you, a red badge will appear in its corner. Simply click the icon to see the list of notifications.
            Below the list there is also an overview of your localization team progress.`,
    image: toolbarButtonImage,
    imageClass: 'right',
    buttonText: 'Open toolbar button popup',
    buttonOnClick: () => browser.browserAction.openPopup(),
  });
  sections.push({
    id: 'notifications',
    title: 'System notifications',
    text: `The toolbar button and its popup are not the only way to get notified about something new and interesting
            in Pontoon. Pontoon Tools can also display system notifications to inform you about new notifications
            in Pontoon. Of course these notifications are configurable in the add-on settings. If you would like to
            preview Pontoon notifications in the system area, click the button below.`,
    buttonText: 'Preview system notifications',
    buttonOnClick: (e) => {
      options.set('show_notifications', true);
      browser.notifications.create({
        type: 'basic',
        iconUrl: browser.runtime.getURL('packages/commons/static/img/pontoon-logo.svg'),
        title: 'Pontoon notification',
        message: 'Similar notification will appear if there is something new in Pontoon. If you click it, related ' +
                'project or your Pontoon team page will open.',
      });
    },
  });
  if (browser.pageAction !== undefined) {
    sections.push({
      id: 'pageAction',
      title: 'Page action',
      text: `Page action is a small icon that will appear in your browser address bar on websites that are available
              for translation on Pontoon. Clicking it will display a list of options to open the project overview
              in Pontoon or jump to translation view directly.`,
      image: pageActionImage,
      imageClass: 'bottom',
    });
  }
  sections.push({
    id: 'contextButtons',
    title: 'Context buttons',
    text: `Context buttons are a quick way to resolve localization issues as you spot them. Highlight the text
            on a page with you mouse and two icons will appear. You can choose between searching the text in Pontoon
            or reporting it to your team into Bugzilla.`,
    image: contextButtonsImage,
    imageClass: 'bottom',
  });
  sections.push({
    id: 'addonSettings',
    title: 'Add-on settings',
    text: (
      <React.Fragment>
        No default settings can fit everyone. Please take a moment to <strong>select your localization team</strong>,
        interval to check for new notifications and more.
      </React.Fragment>
    ),
    image: settingsImage,
    imageClass: 'bottom',
    buttonText: 'Open Pontoon Tools settings',
    buttonOnClick: () => browser.runtime.openOptionsPage(),
  });
  sections.push({
    id: 'feedback',
    title: 'Feedback and more',
    text: (
      <React.Fragment>
        This add-on won't exist and improve without you - Mozilla localizers. I would like to ask you for feedback
        on how Pontoon Tools helps you, or how can it help you even more. Please <strong>check the wiki</strong>
        for more information about Pontoon Tools features and how to share your feedback and request new features.
      </React.Fragment>
    ),
    image: feedbackImage,
    imageClass: 'bottom',
    buttonText: 'Check Pontoon Tools wiki',
    buttonOnClick: () => browser.tabs.create({url: remoteLinks.getPontoonToolsWikiUrl()}),
  });

  return ReactDOM.render(
    <TourDialog
      title={title}
      localeTeam={localeTeam}
      sections={sections}
    />,
    document.getElementById('root') || document.createElement('div')
  );

});
