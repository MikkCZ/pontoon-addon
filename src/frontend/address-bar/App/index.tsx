import React, { useEffect, useState } from 'react';

import { openNewTab } from '@commons/webExtensionsApi';
import {
  getPontoonProjectForTheCurrentTab,
  Project,
} from '@background/backgroundClient';

import { PanelSection } from '../PanelSection';

export const App: React.FC = () => {
  const [project, setProject] = useState<Project | undefined>();

  useEffect(() => {
    (async () => {
      setProject(await getPontoonProjectForTheCurrentTab());
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
