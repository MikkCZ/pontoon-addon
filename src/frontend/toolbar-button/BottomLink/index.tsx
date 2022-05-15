import React from 'react';
import styled from 'styled-components';

const Link = styled.button`
  appearance: none;
  display: block;
  width: 100%;
  background: transparent;
  border: none;
  padding: 0.5em;
  text-align: center;
  font-size: 14px;
  color: #aaa;
  cursor: pointer;

  &:hover {
    background-color: #3f4752;
    color: #fff;
  }
`;

interface Props {
  onClick: () => void;
}

export const BottomLink: React.FC<Props> = ({ onClick, children }) => {
  return <Link onClick={onClick}>{children}</Link>;
};
