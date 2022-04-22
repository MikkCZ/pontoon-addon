import React, { useEffect, useState } from 'react';

import { browser } from '@commons/webExtensionsApi';
import {
  BackgroundPontoonClient,
  Project,
} from '@background/BackgroundPontoonClient';

import { PanelSection } from '../PanelSection';

const backgroundPontoonClient = new BackgroundPontoonClient();

export const App: React.FC = () => {
  const [project, setProject] = useState<Project | undefined>();

  useEffect(() => {
    backgroundPontoonClient
      .getPontoonProjectForTheCurrentTab()
      .then(setProject);
  }, []);

  return project ? (
    <PanelSection
      items={[
        {
          text: `Open ${project.name} project page`,
          onClick: () => browser.tabs.create({ url: project.pageUrl }),
        },
        {
          text: `Open ${project.name} translation view`,
          onClick: () => browser.tabs.create({ url: project.translationUrl }),
        },
      ]}
    />
  ) : (
    <></>
  );
};
