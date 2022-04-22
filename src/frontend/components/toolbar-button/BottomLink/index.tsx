import React from 'react';
import styled from 'styled-components';

const Button = styled.button`
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  display: block;
  width: 100%;
  background: transparent;
  border: none;
  border-top: 1px solid #525a65;
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
  text: string;
  onClick: () => void;
}

export const BottomLink: React.FC<Props> = ({ text, onClick }) => {
  return <Button onClick={onClick}>{text}</Button>;
};
