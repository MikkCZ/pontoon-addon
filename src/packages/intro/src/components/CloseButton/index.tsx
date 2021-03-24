import React, { CSSProperties } from 'react';

import closeIcon from '@assets/img/glyph-dismiss-16.svg';

import './index.css';

function closeCurrentTab(): void {
  window.close();
}

interface Props {
  title?: string;
  icon?: string;
  onClick?: () => void;
  style?: CSSProperties;
}

export const CloseButton: React.FC<Props> = ({
  title = '',
  icon = closeIcon,
  onClick = () => {
    closeCurrentTab();
  },
  style = {},
}) => {
  return (
    <button
      className="CloseButton"
      title={title}
      style={{ backgroundImage: `url(${icon})`, ...style }}
      onClick={() => onClick()}
    ></button>
  );
};
