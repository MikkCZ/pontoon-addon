import React from 'react';
import { createGlobalStyle } from 'styled-components';

import {
  createNotification,
  openNewTab,
  openOptions,
  openToolbarButtonPopup,
  supportsAddressBar,
} from '@commons/webExtensionsApi';
import { setOption } from '@commons/options';
import { pontoonAddonWiki, mozillaOrg } from '@commons/webLinks';
import toolbarButtonImage from '@assets/img/toolbar-button.png';
import notificationsImage from '@assets/img/desktop-notification.svg';
import pontoonLogo from '@assets/img/pontoon-logo.svg';
import addressBarImage from '@assets/img/address-bar.png';
import contextMenuImage from '@assets/img/context-menu.png';
import contextButtonsImage from '@assets/img/context-buttons.png';
import settingsImage from '@assets/img/settings.svg';
import feedbackImage from '@assets/img/2-Lions.png';

import { GlobalPontoonStyle } from '../../GlobalPontoonStyle';
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

  const addressBarTile: TileProps = {
    title: 'Address bar button',
    imageSrc: addressBarImage,
    text: (
      <>
        Pontoon <strong>icon in the address bar</strong> indicates if the
        current website is localized in Pontoon. Click it for quick access to
        the <strong>website localization</strong>.
      </>
    ),
    button: {
      text: 'Try it on mozilla.org',
      onClick: () => openNewTab(mozillaOrg()),
    },
  };

  const contextButtonsTile: TileProps = {
    title: 'Context buttons',
    imageSrc: contextButtonsImage,
    text: (
      <>
        On a website localized in Pontoon, select any text to{' '}
        <strong>find it quickly in Pontoon</strong> or{' '}
        <strong>propose an improvement</strong>.
      </>
    ),
    button: {
      text: 'Try it on mozilla.org',
      onClick: () => openNewTab(mozillaOrg()),
    },
  };

  const contextMenuTile: TileProps = {
    title: 'Context menu',
    imageSrc: contextMenuImage,
    text: (
      <>
        On a website localized in Pontoon, right-click anywhere for quick access
        to the <strong>website localization</strong>.
      </>
    ),
    button: {
      text: 'Try it on mozilla.org',
      onClick: () => openNewTab(mozillaOrg()),
    },
  };

  const tiles: TileProps[] = [
    {
      title: 'Pontoon button',
      imageSrc: toolbarButtonImage,
      text: (
        <>
          Pontoon icon in the toolbar offers quick access to{' '}
          <strong>notifications</strong>, your <strong>team progress</strong>{' '}
          and the open <strong>website localization</strong>.
        </>
      ),
      button: {
        text: 'Preview the Pontoon button',
        onClick: () => openToolbarButtonPopup(),
      },
    },
    {
      title: 'System notifications',
      imageSrc: notificationsImage,
      text: (
        <>
          This add-on brings{' '}
          <strong>updates from Pontoon one click away</strong>. Try how
          notifications look directly in your system!
        </>
      ),
      button: {
        text: 'Preview system notifications',
        onClick: () => {
          setOption('show_notifications', true);
          createNotification({
            type: 'basic',
            iconUrl: pontoonLogo,
            title: 'Notification from Pontoon',
            message:
              'Similar notifications will appear if there is something new in Pontoon. Click them to open related project in Pontoon.',
          });
        },
      },
    },
    {
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
    },
    ...(supportsAddressBar()
      ? [addressBarTile, contextButtonsTile]
      : [contextButtonsTile, contextMenuTile]),
    {
      title: 'Feedback and more',
      imageSrc: feedbackImage,
      text: (
        <>
          This add-on won&apos;t exist and improve without you - Mozilla
          localizers. Please <strong>share your feedback</strong> and request
          new features.
        </>
      ),
      button: {
        text: 'Check the wiki',
        onClick: () => openNewTab(pontoonAddonWiki()),
      },
    },
  ];

  return (
    <>
      <GlobalPontoonStyle />
      <GlobalStyle />
      <TourPage title={pageTitle} tiles={tiles} />
    </>
  );
};
