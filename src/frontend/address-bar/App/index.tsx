import React, { useEffect, useState } from 'react';

import { openNewTab } from '@commons/webExtensionsApi';
import {
  BackgroundPontoonClient,
  Project,
} from '@background/BackgroundPontoonClient';

import { PanelSection } from '../PanelSection';

const backgroundPontoonClient = new BackgroundPontoonClient();

export const App: React.FC = () => {
  const [project, setProject] = useState<Project | undefined>();

  useEffect(() => {
    (async () => {
      setProject(
        await backgroundPontoonClient.getPontoonProjectForTheCurrentTab(),
      );
    })();
  }, []);

  return project ? (
    <PanelSection
      items={[
        {
          text: `Open ${project.name} project page`,
          onClick: () => openNewTab(project.pageUrl),
        },
        {
          text: `Open ${project.name} translation view`,
          onClick: () => openNewTab(project.translationUrl),
        },
      ]}
    />
  ) : (
    <></>
  );
};
