import React from 'react';
import './index.css';

interface Props {
  text: string;
  onClick: () => void;
}

export const BottomLink: React.FC<Props> = ({ text, onClick }) => {
  return (
    <button className="BottomLink" onClick={onClick}>
      {text}
    </button>
  );
};
