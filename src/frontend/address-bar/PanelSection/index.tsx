import React from 'react';

import { PanelListItem } from '../PanelListItem';

interface Props {
  items: Array<
    React.ComponentProps<typeof PanelListItem> & {
      text: React.ComponentProps<'li'>['children'];
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
