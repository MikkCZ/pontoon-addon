import React from 'react';

import { Project } from '@pontoon-addon/commons/src/BackgroundPontoonClient';

import { browser } from '../../util/webExtensionsApi';
import { PanelSection } from '../../components/PanelSection';

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
