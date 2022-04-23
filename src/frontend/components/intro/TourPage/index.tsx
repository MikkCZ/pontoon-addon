import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import { browser } from '@commons/webExtensionsApi';
import joystickImage from '@assets/img/joystick.svg';

import { CloseButton } from '../CloseButton';
import { TourPageTile, Props as TileProps } from '../TourPageTile';

const Wrapper = styled.div`
  position: relative;
`;

const Title = styled.h2`
  text-align: center;
`;

const CloseButtonWrapper = styled.div`
  position: absolute;
  right: 2em;

  @media screen and (max-width: 640px) {
    display: none;
  }
`;

const TourPageTiles = styled.div`
  width: 90vw;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;

  @media screen and (max-width: 1024px) {
    width: 100%;
    margin: 0;
  }
`;

export const PrivacyPolicyLinkWrapper = styled.div`
  text-align: center;
`;

const EasterEggHint = styled.div<{ opacity?: number }>`
  ${({ opacity }) =>
    opacity
      ? css`
          opacity: ${opacity};
        `
      : css``}
  text-align: center;
  font-size: 0.8em;
  position: relative;
  top: -16px;
`;

function revealTheEasterEgg() {
  browser.tabs.create({
    url: browser.runtime.getURL('frontend/snake-game.html'),
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
    <Wrapper>
      <CloseButtonWrapper>
        {tilesToClick.size !== 0 ? (
          <CloseButton title="Close the tour" />
        ) : (
          <CloseButton
            title="Play a game"
            imageSrc={joystickImage}
            style={{ width: '32px', height: '32px' }}
            onClick={() => {
              revealTheEasterEgg();
            }}
          />
        )}
      </CloseButtonWrapper>
      <Title>{title}</Title>
      {tilesToClick.size !== 0 ? (
        <EasterEggHint opacity={1 - (tilesToClick.size + 2) / tiles.length}>
          Click all green buttons.
        </EasterEggHint>
      ) : (
        <EasterEggHint>See the top right corner.</EasterEggHint>
      )}
      <TourPageTiles>
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
      </TourPageTiles>
      <PrivacyPolicyLinkWrapper>
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
      </PrivacyPolicyLinkWrapper>
    </Wrapper>
  );
};
