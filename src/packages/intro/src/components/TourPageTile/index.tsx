import React from 'react';

import './index.css';

export interface Props {
  title: string;
  image: string | null;
  text: React.ReactNode | string;
  button: {
    text: string;
    onClick: () => void;
  };
}

export const TourPageTile: React.FC<Props> = ({
  title,
  image,
  text,
  button,
}) => {
  return (
    <section className="TourPageTile">
      <div className="TourPageTile-row-1">
        <h3>{title}</h3>
      </div>
      <div className="TourPageTile-row-2">
        {image && <img src={image} alt="" />}
      </div>
      <div className="TourPageTile-row-3">
        <p>{text}</p>
      </div>
      <div className="TourPageTile-row-4">
        <button className="pontoon-style" onClick={button.onClick}>
          {button.text}
        </button>
      </div>
    </section>
  );
};
