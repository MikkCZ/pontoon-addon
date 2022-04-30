import React from 'react';
import { createGlobalStyle } from 'styled-components';

import {
  createNotification,
  openNewTab,
  openOptions,
  openToolbarButtonPopup,
  supportsAddressBar,
} from '@commons/webExtensionsApi';
import { Options } from '@commons/Options';
import { pontoonAddonWiki, mozillaOrg } from '@commons/webLinks';
import { GlobalPontoonStyle } from '@commons/GlobalPontoonStyle';
import toolbarButtonImage from '@assets/img/toolbar-button.png';
import notificationsImage from '@assets/img/desktop-notification.svg';
import pontoonLogo from '@assets/img/pontoon-logo.svg';
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

export const App: React.FC = () => {
  document.title = pageTitle;

  const tiles: TileProps[] = [];
  tiles.push({
    title: 'Pontoon button',
    imageSrc: toolbarButtonImage,
    text: (
      <>
        Pontoon icon in the toolbar offers{' '}
        <strong>quick access to notifications</strong> and your localization
        team progress.
      </>
    ),
    button: {
      text: 'See the Pontoon button',
      onClick: () => openToolbarButtonPopup(),
    },
  });
  tiles.push({
    title: 'System notifications',
    imageSrc: notificationsImage,
    text: 'Pontoon Add-on can bring notifications directly into your system. Try it!',
    button: {
      text: 'Preview system notifications',
      onClick: () => {
        new Options().set('show_notifications', true);
        createNotification({
          type: 'basic',
          iconUrl: pontoonLogo,
          title: 'Notification from Pontoon',
          message:
            'Similar notifications will appear if there is something new in Pontoon. You can click them to open related project in Pontoon.',
        });
      },
    },
  });
  if (supportsAddressBar()) {
    tiles.push({
      title: 'Address bar button',
      imageSrc: pageActionImage,
      text: (
        <>
          So called <em>page action</em> is a button in the address bar, that
          lets you <strong>open in Pontoon the project</strong>, which is
          related to the current page.
        </>
      ),
      button: {
        text: 'Try it on mozilla.org',
        onClick: () => openNewTab(mozillaOrg()),
      },
    });
  }
  tiles.push({
    title: 'Context buttons',
    imageSrc: contextButtonsImage,
    text: (
      <>
        <strong>Look up strings in Pontoon</strong> or{' '}
        <strong>report bugs</strong> on localizer version of Mozilla website.
        Just select the text and click the context button.
      </>
    ),
    button: {
      text: 'Try it on mozilla.org',
      onClick: () => openNewTab(mozillaOrg()),
    },
  });
  tiles.push({
    title: 'Add-on settings',
    imageSrc: settingsImage,
    text: (
      <>
        Pontoon button, notifications, ... all these features are{' '}
        <strong>configurable</strong>.
      </>
    ),
    button: {
      text: 'Open Pontoon Add-on settings',
      onClick: () => openOptions(),
    },
  });
  tiles.push({
    title: 'Feedback and more',
    imageSrc: feedbackImage,
    text: (
      <>
        This add-on won&apos;t exist and improve without you - Mozilla
        localizers. Please <strong>share your feedback</strong> and feel free to
        request new features.
      </>
    ),
    button: {
      text: 'Check the wiki',
      onClick: () => openNewTab(pontoonAddonWiki()),
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
