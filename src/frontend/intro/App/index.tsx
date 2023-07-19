import React, { useEffect } from 'react';

import toolbarButtonImage from '@assets/img/toolbar-button.png';
import notificationsImage from '@assets/img/desktop-notification.svg';
import pontoonLogo from '@assets/img/pontoon-logo.svg';
import addressBarImage from '@assets/img/address-bar.png';
import contextMenuImage from '@assets/img/context-menu.png';
import contextButtonsImage from '@assets/img/context-buttons.png';
import settingsImage from '@assets/img/settings.svg';
import feedbackImage from '@assets/img/2-Lions.png';
import { pontoonAddonWiki, mozillaOrg } from '@commons/webLinks';
import { setOption } from '@commons/options';
import {
  createNotification,
  openNewTab,
  openOptions,
  openToolbarButtonPopup,
  supportsAddressBar,
} from '@commons/webExtensionsApi';

import type { TourPageTile } from '../TourPageTile';
import { TourPage } from '../TourPage';

const pageTitle = 'Welcome to Pontoon Add-on';

const addressBarTile: React.ComponentProps<typeof TourPageTile> = {
  title: 'Address bar button',
  imageSrc: addressBarImage,
  text: (
    <>
      Pontoon <strong>icon in the address bar</strong> indicates if the current
      website is localized in Pontoon. Click it for quick access to the{' '}
      <strong>website localization</strong>.
    </>
  ),
  button: {
    text: 'Try it on mozilla.org',
    onClick: () => openNewTab(mozillaOrg()),
  },
};

const contextButtonsTile: React.ComponentProps<typeof TourPageTile> = {
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

const contextMenuTile: React.ComponentProps<typeof TourPageTile> = {
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

const tiles: React.ComponentProps<typeof TourPageTile>[] = [
  {
    title: 'Pontoon button',
    imageSrc: toolbarButtonImage,
    text: (
      <>
        Pontoon icon in the toolbar offers quick access to{' '}
        <strong>notifications</strong>, your <strong>team progress</strong> and
        the open <strong>website localization</strong>.
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
        This add-on brings <strong>updates from Pontoon one click away</strong>.
        Try how notifications look directly in your system!
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
        localizers. Please <strong>share your feedback</strong> and request new
        features.
      </>
    ),
    button: {
      text: 'Check the wiki',
      onClick: () => openNewTab(pontoonAddonWiki()),
    },
  },
];

export const App: React.FC = () => {
  useEffect(() => {
    document.title = pageTitle;
  }, []);

  return <TourPage title={pageTitle} tiles={tiles} />;
};
