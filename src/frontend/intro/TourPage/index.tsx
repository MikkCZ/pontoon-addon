import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import { openPrivacyPolicy, openSnakeGame } from '@commons/webExtensionsApi';
import joystickImage from '@assets/img/joystick.svg';

import { CloseButton } from '../CloseButton';
import type { Props as TileProps } from '../TourPageTile';
import { TourPageTile } from '../TourPageTile';

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
    typeof opacity !== 'undefined'
      ? css`
          opacity: ${opacity};
        `
      : css``}
  text-align: center;
  font-size: 0.8em;
  position: relative;
  top: -16px;
`;

interface Props {
  title?: string;
  tiles?: TileProps[];
}

export const TourPage: React.FC<Props> = ({ title = '', tiles = [] }) => {
  const [tilesToClick, setTilesToClick] = useState(
    new Set(tiles.map((tile) => tile.title)),
  );

  return (
    <Wrapper>
      <CloseButtonWrapper>
        {tilesToClick.size !== 0 ? (
          <CloseButton title="Close the tour" />
        ) : (
          <CloseButton
            title="Play a game"
            imageSrc={joystickImage}
            style={{
              width: '32px',
              height: '32px',
              border: '1px solid #5e6475',
              boxShadow: '0 0 16px #5e6475',
            }}
            onClick={() => openSnakeGame()}
          />
        )}
      </CloseButtonWrapper>
      <Title>{title}</Title>
      {tilesToClick.size !== 0 ? (
        <EasterEggHint opacity={1 - tilesToClick.size / tiles.length}>
          It&apos;s?
        </EasterEggHint>
      ) : (
        <EasterEggHint>Don&apos;t stand there gawping!</EasterEggHint>
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
        <button className="pontoon-style" onClick={() => openPrivacyPolicy()}>
          Privacy policy
        </button>
      </PrivacyPolicyLinkWrapper>
    </Wrapper>
  );
};
