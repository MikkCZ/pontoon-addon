import React from 'react';
import { createGlobalStyle } from 'styled-components';

import { browser } from '@commons/webExtensionsApi';
import { Options } from '@commons/Options';
import { RemoteLinks } from '@commons/RemoteLinks';
import { GlobalPontoonStyle } from '@commons/GlobalPontoonStyle';
import toolbarButtonImage from '@assets/img/toolbar-button.png';
import notificationsImage from '@assets/img/desktop-notification.svg';
import pageActionImage from '@assets/img/page-action.png';
import contextButtonsImage from '@assets/img/context-buttons.png';
import settingsImage from '@assets/img/settings.png';
import feedbackImage from '@assets/img/2-Lions.png';

import type { Props as TileProps } from '../TourPageTile';
import { TourPage } from '../TourPage';

const GlobalStyle = createGlobalStyle`
  body {
    background: #333941;
    font-family: sans-serif;
    font-size: 14px;
  }
`;

const pageTitle = 'Welcome to Pontoon Add-on';
const remoteLinks = new RemoteLinks();

export const App: React.FC = () => {
  document.title = pageTitle;

  const tiles: TileProps[] = [];
  tiles.push({
    title: 'Pontoon button',
    image: toolbarButtonImage,
    text: (
      <>
        Pontoon icon in the toolbar offers{' '}
        <strong>quick access to notifications</strong> and your localization
        team progress.
      </>
    ),
    button: {
      text: 'See the Pontoon button',
      onClick: () => browser.browserAction.openPopup(),
    },
  });
  tiles.push({
    title: 'System notifications',
    image: notificationsImage,
    text: 'Pontoon Add-on can bring notifications directly into your system. Try it!',
    button: {
      text: 'Preview system notifications',
      onClick: async () => {
        const options = await Options.create();
        options.set('show_notifications', true);
        browser.notifications.create({
          type: 'basic',
          iconUrl: browser.runtime.getURL('assets/img/pontoon-logo.svg'),
          title: 'Notification from Pontoon',
          message:
            'Similar notifications will appear if there is something new in Pontoon. You can click them to open related project in Pontoon.',
        });
      },
    },
  });
  if (browser.pageAction) {
    tiles.push({
      title: 'Address bar button',
      image: pageActionImage,
      text: (
        <>
          So called <em>page action</em> is a button in the address bar, that
          lets you <strong>open in Pontoon the project</strong>, which is
          related to the current page.
        </>
      ),
      button: {
        text: 'Try it on mozilla.org',
        onClick: () => browser.tabs.create({ url: 'https://www.mozilla.org/' }),
      },
    });
  }
  tiles.push({
    title: 'Context buttons',
    image: contextButtonsImage,
    text: (
      <>
        <strong>Look up strings in Pontoon</strong> or{' '}
        <strong>report bugs</strong> on localizer version of Mozilla website.
        Just select the text and click the context button.
      </>
    ),
    button: {
      text: 'Try it on mozilla.org',
      onClick: () => browser.tabs.create({ url: 'https://www.mozilla.org/' }),
    },
  });
  tiles.push({
    title: 'Add-on settings',
    image: settingsImage,
    text: (
      <>
        Pontoon button, notifications, ... all these features are{' '}
        <strong>configurable</strong>.
      </>
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
      <>
        This add-on won&apos;t exist and improve without you - Mozilla
        localizers. Please <strong>share your feedback</strong> and feel free to
        request new features.
      </>
    ),
    button: {
      text: 'Check the wiki',
      onClick: () =>
        browser.tabs.create({ url: remoteLinks.getPontoonAddonWikiUrl() }),
    },
  });

  return (
    <>
      <GlobalPontoonStyle />
      <GlobalStyle />
      <TourPage title={pageTitle} tiles={tiles} />
    </>
  );
};
