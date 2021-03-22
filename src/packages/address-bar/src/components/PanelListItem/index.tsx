import React from 'react';

export interface Props {
  text: string;
  onClick: () => void;
}

export const PanelListItem: React.FC<Props> = ({ text, onClick }) => {
  return (
    <li className="panel-list-item" onClick={onClick}>
      {text}
    </li>
  );
};
