import React, { useEffect, useState } from 'react';

import type { OptionsContent } from '@commons/data/defaultOptions';
import { getOptions } from '@commons/options';
import type { StorageContent } from '@commons/webExtensionsApi';
import {
  listenToStorageChange,
  getOneFromStorage,
} from '@commons/webExtensionsApi';
import { doAsync } from '@commons/utils';

import { GlobalBodyStyle } from '../../GlobalBodyStyle';
import { NotificationsList } from '../NotificationsList';
import { TeamInfo } from '../TeamInfo';

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
    doAsync(async () => {
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
    });
  }, []);

  return loaded ? (
    <>
      <GlobalBodyStyle
        extra={{
          width: 'fit-content',
          minWidth: '350px',

          '*': {
            textAlign: 'left',
          },
        }}
      />
      <NotificationsList
        notificationsData={notificationsData}
        hideReadNotifications={hideReadNotifications!} // eslint-disable-line @typescript-eslint/no-non-null-assertion
        pontoonBaseUrl={pontoonBaseUrl!} // eslint-disable-line @typescript-eslint/no-non-null-assertion
      />
      <TeamInfo />
    </>
  ) : (
    <></>
  );
};
