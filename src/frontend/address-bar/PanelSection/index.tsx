import React from 'react';

import { PanelListItem } from '../PanelListItem';

interface Props {
  items: React.ComponentProps<typeof PanelListItem>[];
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
