import React from 'react';

import { PanelListItem } from '../PanelListItem';

interface Props {
  items: Array<
    Omit<React.ComponentProps<typeof PanelListItem>, 'children'> & {
      text: React.ComponentProps<typeof PanelListItem>['children'];
    }
  >;
}

export const PanelSection: React.FC<Props> = ({ items }) => {
  return (
    <ul className="panel-section panel-section-list">
      {items.map(({ text, onClick }, index) => (
        <PanelListItem key={index} onClick={onClick}>
          {text}
        </PanelListItem>
      ))}
    </ul>
  );
};
