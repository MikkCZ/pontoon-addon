import React, { useState } from 'react';

import { browser } from '@commons/webExtensionsApi';
import joystick from '@assets/img/joystick.svg';

import { CloseButton } from '../CloseButton';
import { TourPageTile, Props as TileProps } from '../TourPageTile';

import './index.css';

function revealTheEasterEgg() {
  browser.tabs.create({
    url: browser.runtime.getURL('frontend/snake.html'),
  });
}

interface Props {
  title?: string;
  tiles?: TileProps[];
}

export const TourPage: React.FC<Props> = ({ title = '', tiles = [] }) => {
  const allTitles = tiles.map((tile) => tile.title);
  const [tilesToClick, setTilesToClick] = useState(new Set(allTitles));

  return (
    <div className="TourPage">
      {tilesToClick.size !== 0 ? (
        <CloseButton title="Close the tour" />
      ) : (
        <CloseButton
          title="Play a game"
          icon={joystick}
          style={{ width: '32px', height: '32px' }}
          onClick={() => {
            revealTheEasterEgg();
          }}
        />
      )}
      <h2>{title}</h2>
      {tilesToClick.size !== 0 ? (
        <div
          className="easter-egg-hint"
          style={{ opacity: 1 - (tilesToClick.size + 2) / tiles.length }}
        >
          Click all green buttons.
        </div>
      ) : (
        <div className="easter-egg-hint">See the top right corner.</div>
      )}
      <div className="TourPageTiles">
        {tiles.map((tile, index) => (
          <TourPageTile
            key={`tile-${index}`}
            {...{
              ...tile,
              button: {
                ...tile.button,
                onClick: () => {
                  if (tilesToClick.has(tile.title)) {
                    const tilesToClickCopy = new Set(tilesToClick);
                    tilesToClickCopy.delete(tile.title);
                    setTilesToClick(tilesToClickCopy);
                  }
                  tile.button?.onClick();
                },
              },
            }}
          />
        ))}
      </div>
      <div className="privacy-policy">
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <a
          onClick={() =>
            browser.tabs.create({
              url: browser.runtime.getURL('frontend/privacy-policy.html'),
            })
          }
        >
          Privacy policy
        </a>
      </div>
    </div>
  );
};
