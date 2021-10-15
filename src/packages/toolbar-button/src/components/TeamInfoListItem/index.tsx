import React, { CSSProperties } from 'react';
import './index.css';

interface Props {
  labelBeforeStyle?: CSSProperties;
  label: string;
  value: React.ReactNode | string;
  onClick?: () => void;
}

export const TeamInfoListItem: React.FC<Props> = ({
  labelBeforeStyle,
  label,
  value,
  onClick,
}) => {
  const children = (
    <>
      <span
        className="TeamInfoListItem-label-before"
        style={labelBeforeStyle}
      ></span>
      <span className="TeamInfoListItem-label">{label}</span>
      <span className="TeamInfoListItem-value">{value}</span>
    </>
  );
  return (
    <li className="TeamInfoListItem">
      {onClick ? (
        <button className="link" onClick={onClick}>
          {children}
        </button>
      ) : (
        children
      )}
    </li>
  );
};
