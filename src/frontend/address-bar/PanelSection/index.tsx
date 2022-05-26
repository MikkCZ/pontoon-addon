import React from 'react';

import type { Props as PanelListItemProps } from '../PanelListItem';
import { PanelListItem } from '../PanelListItem';

interface Props {
  items: PanelListItemProps[];
}

export const PanelSection: React.FC<Props> = ({ items }) => {
  return (
    <ul className="panel-section panel-section-list">
      {items.map((itemProps, index) => (
        <PanelListItem key={index} {...itemProps} />
      ))}
    </ul>
  );
};
