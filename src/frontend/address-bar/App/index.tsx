import React from 'react';

import { GlobalBodyStyle } from '../../GlobalBodyStyle';
import { ProjectLinks } from '../ProjectLinks';

export const App: React.FC = () => {
  return (
    <>
      <GlobalBodyStyle
        extra={{
          width: 'fit-content',

          '*': {
            textAlign: 'left',
          },
        }}
      />
      <ProjectLinks />
    </>
  );
};
