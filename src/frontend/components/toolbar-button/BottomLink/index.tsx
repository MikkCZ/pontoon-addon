import React, { ButtonHTMLAttributes } from 'react';

import './index.css';

interface Props
  extends Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  text: string;
  onClick: () => void;
}

export const BottomLink: React.FC<Props> = ({ text, onClick, className }) => {
  return (
    <button
      className={`BottomLink ${className ? className : ''}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
};
