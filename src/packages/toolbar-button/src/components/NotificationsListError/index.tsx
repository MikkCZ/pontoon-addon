import React from 'react';

import type { BackgroundPontoonClient } from '@pontoon-addon/commons/src/BackgroundPontoonClient';

import { browser } from '../../util/webExtensionsApi';
import '@pontoon-addon/commons/static/css/pontoon.css';
import './index.css';

interface Props {
  backgroundPontoonClient: BackgroundPontoonClient;
}

export const NotificationsListError: React.FC<Props> = ({
  backgroundPontoonClient,
}) => {
  return (
    <section className="NotificationsListError">
      <p className="NotificationsListError-title">Error</p>
      <p className="NotificationsListError-description">
        There was an error fetching data from Pontoon. Please check, if you are{' '}
        <button
          className="NotificationsListError-sign-in link"
          onClick={async () => {
            const signInUrl = await backgroundPontoonClient.getSignInURL();
            await browser.tabs.create({ url: signInUrl });
            window.close();
          }}
        >
          signed in
        </button>
        .
      </p>
    </section>
  );
};
