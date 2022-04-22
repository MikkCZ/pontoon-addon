import React, { CSSProperties } from 'react';
import styled from 'styled-components';

import closeIcon from '@assets/img/glyph-dismiss-16.svg';

const Button = styled.button`
  -moz-appearance: none;
  -webkit-appearance: none;
  appearance: none;
  display: inline-block;
  border: none;
  width: 16px;
  height: 16px;
  padding: 0.1em;
  cursor: pointer;
  background-color: transparent;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
`;

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
    <Button
      title={title}
      style={{ backgroundImage: `url(${icon})`, ...style }}
      onClick={() => onClick()}
    ></Button>
  );
};
