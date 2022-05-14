import React from 'react';
import { createGlobalStyle } from 'styled-components';

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

interface Props {
  notificationsData: any;
  hideReadNotifications?: boolean;
}

export const App: React.FC<Props> = ({
  notificationsData,
  hideReadNotifications,
}: Props) => {
  return (
    <>
      <GlobalPontoonStyle />
      <GlobalStyle />
      <NotificationsList
        notificationsData={notificationsData}
        hideReadNotifications={hideReadNotifications}
      />
      <TeamInfo />
    </>
  );
};
