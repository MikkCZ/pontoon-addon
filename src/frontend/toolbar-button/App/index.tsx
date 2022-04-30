import React from 'react';
import { createGlobalStyle } from 'styled-components';

import { BackgroundPontoonClient } from '@background/BackgroundPontoonClient';
import { GlobalPontoonStyle } from '@commons/GlobalPontoonStyle';

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

interface Props {
  notificationsData: any;
  hideReadNotifications?: boolean;
  backgroundPontoonClient: BackgroundPontoonClient;
  teamData?: {
    name?: string;
    code?: string;
    strings?: any;
  };
  latestTeamActivity?: {
    user: string;
    date_iso?: string;
  };
}

export const App: React.FC<Props> = ({
  notificationsData,
  hideReadNotifications,
  backgroundPontoonClient,
  teamData,
  latestTeamActivity,
}) => {
  return (
    <>
      <GlobalPontoonStyle />
      <GlobalStyle />
      <NotificationsList
        notificationsData={notificationsData}
        hideReadNotifications={hideReadNotifications}
        backgroundPontoonClient={backgroundPontoonClient}
      />
      <TeamInfo
        name={teamData?.name}
        code={teamData?.code}
        stringsData={teamData?.strings}
        latestActivity={latestTeamActivity}
        backgroundPontoonClient={backgroundPontoonClient}
      />
    </>
  );
};
