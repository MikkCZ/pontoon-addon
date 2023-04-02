import React, { useEffect, useState } from 'react';
import { createGlobalStyle } from 'styled-components';

import type { OptionsContent } from '@commons/data/defaultOptions';
import { getOptions } from '@commons/options';
import type { StorageContent } from '@commons/webExtensionsApi';
import {
  listenToStorageChange,
  getOneFromStorage,
} from '@commons/webExtensionsApi';

import { GlobalPontoonStyle } from '../../GlobalPontoonStyle';
import { NotificationsList } from '../NotificationsList';
import { TeamInfo } from '../TeamInfo';

const GlobalStyle = createGlobalStyle`
  body {
    width: fit-content;
    min-width: 350px;
    font: caption;
    font-size: 14px;
  }

  body * {
    text-align: left;
  }
`;

export const App: React.FC = () => {
  const [notificationsData, setNotificationsData] =
    useState<StorageContent['notificationsData']>();
  const [hideReadNotifications, setHideReadNotifications] =
    useState<
      OptionsContent['toolbar_button_popup_always_hide_read_notifications']
    >();
  const [pontoonBaseUrl, setPontoonBaseUrl] =
    useState<OptionsContent['pontoon_base_url']>();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const baseHref = pontoonBaseUrl ?? '';
    const headTag = document.getElementsByTagName('head')[0];
    const existingBaseTag = headTag.getElementsByTagName('base')[0];
    if (existingBaseTag) {
      existingBaseTag.href = baseHref;
    } else {
      const baseTag = document.createElement('base');
      baseTag.href = baseHref;
      document.getElementsByTagName('head')[0].appendChild(baseTag);
    }
  }, [pontoonBaseUrl]);

  useEffect(() => {
    (async () => {
      const [
        {
          toolbar_button_popup_always_hide_read_notifications:
            hideReadNotifications,
          pontoon_base_url: pontoonBaseUrl,
        },
        notificationsData,
      ] = await Promise.all([
        getOptions([
          'toolbar_button_popup_always_hide_read_notifications',
          'pontoon_base_url',
        ]),
        getOneFromStorage('notificationsData'),
      ]);

      setNotificationsData(notificationsData);
      setHideReadNotifications(hideReadNotifications);
      setPontoonBaseUrl(pontoonBaseUrl);
      setLoaded(true);

      listenToStorageChange('notificationsData', ({ newValue }) =>
        setNotificationsData(newValue),
      );
    })();
  }, []);

  return loaded ? (
    <>
      <GlobalPontoonStyle />
      <GlobalStyle />
      <NotificationsList
        notificationsData={notificationsData}
        hideReadNotifications={hideReadNotifications!}
        pontoonBaseUrl={pontoonBaseUrl!}
      />
      <TeamInfo />
    </>
  ) : (
    <></>
  );
};
