import React from 'react';

interface Props {
  text: React.ComponentProps<'li'>['children'];
  onClick: () => void;
}

export const PanelListItem: React.FC<Props> = ({ text, onClick }) => {
  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <li className="panel-list-item" onClick={onClick}>
      {text}
    </li>
  );
};
