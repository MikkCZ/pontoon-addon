import React from 'react';

import { BackgroundPontoonClient } from '@background/BackgroundPontoonClient';

import { NotificationsList } from '../NotificationsList';
import { TeamInfo } from '../TeamInfo';

import './index.css';

interface Props {
  notificationsData: any;
  hideReadNotifications: boolean;
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

export const ToolbarButtonRoot: React.FC<Props> = ({
  notificationsData,
  hideReadNotifications,
  backgroundPontoonClient,
  teamData,
  latestTeamActivity,
}) => {
  return (
    <>
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
