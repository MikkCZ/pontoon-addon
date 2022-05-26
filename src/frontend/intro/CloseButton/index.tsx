import type { CSSProperties } from 'react';
import React from 'react';
import styled from 'styled-components';

import closeIcon from '@assets/img/glyph-dismiss-16.svg';

const Link = styled.button`
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
  imageSrc?: string;
  onClick?: () => void;
  style?: CSSProperties;
}

export const CloseButton: React.FC<Props> = ({
  title = '',
  imageSrc = closeIcon,
  onClick = () => {
    closeCurrentTab();
  },
  style = {},
}) => {
  return (
    <Link
      title={title}
      style={{ backgroundImage: `url(${imageSrc})`, ...style }}
      onClick={() => onClick()}
    ></Link>
  );
};
