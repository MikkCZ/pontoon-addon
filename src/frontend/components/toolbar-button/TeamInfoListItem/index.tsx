import React, { CSSProperties } from 'react';
import styled from 'styled-components';

export const Square = styled.span`
  display: inline-block;
  content: '';
  width: 0.9em;
  height: 0.9em;
  margin-right: 0.5em;
  border-radius: 0.1em;
`;

export const Label = styled.span`
  margin-right: 1em;
  text-transform: uppercase;
`;

export const Value = styled.span`
  float: right;
`;

export const ItemLink = styled.button.attrs({ className: 'link' })`
  && {
    display: inline-block;
    width: 100%;
    color: #ebebeb;

    &:hover {
      color: #7bc876;
    }
  }
`;

interface Props {
  squareStyle?: CSSProperties;
  label: string;
  value: React.ReactNode | string;
  onClick?: () => void;
}

export const TeamInfoListItem: React.FC<Props> = ({
  squareStyle,
  label,
  value,
  onClick,
}) => {
  const children = (
    <>
      <Square style={squareStyle} />
      <Label>{label}</Label>
      <Value>{value}</Value>
    </>
  );
  return (
    <li>
      {onClick ? <ItemLink onClick={onClick}>{children}</ItemLink> : children}
    </li>
  );
};
