import React from 'react';

import { browser } from '@commons/webExtensionsApi';
import { Project } from '@background/BackgroundPontoonClient';

import { PanelSection } from '../PanelSection';

interface Props {
  project: Project;
}

export const AddressBarRoot: React.FC<Props> = ({ project }) => {
  return (
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
  );
};
