import React, { useState } from 'react';
import { CloseButton } from '../CloseButton';
import { TourPageTile } from '../TourPageTile';
import './index.css';
import joystick from '@assets/img/joystick.svg'

function revealTheEasterEgg() {
  browser.tabs.create({url: browser.runtime.getURL('packages/snake/dist/index.html')});
}

/**
 * React component of the tour page.
 */
export const TourPage = (props) => {
  const { title='', tiles=[] } = props;

  const allTitles = tiles.map(tile => tile.title);
  const [tilesToClick, setTilesToClick] = useState(new Set(allTitles));

  return (
    <div className="TourPage">
      {
        tilesToClick.size !== 0
          ? <CloseButton title="Close the tour" />
          : <CloseButton title="Play a game" icon={joystick} style={{ width: '32px', height: '32px' }} onClick={() => { revealTheEasterEgg() }} />
      }
      <h2>{title}</h2>
      {
        tilesToClick.size !== 0
          ? <div className="easter-egg-hint" style={{ opacity:1-((tilesToClick.size+2)/tiles.length) }}>Click all green buttons.</div>
          : <div className="easter-egg-hint">See the top right corner.</div>
      }
      <div className="TourPageTiles">
        {
          tiles.map((tile, index) =>
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
                    tile.button.onClick();
                  },
                },
              }}
            />
          )
        }
      </div>
      <div className="privacy-policy"><a href="https://github.com/MikkCZ/pontoon-addon/wiki/Privacy-Policy">Privacy policy for Pontoon Add-on</a></div>
    </div>
  );
};
