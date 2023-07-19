import React, { useState } from 'react';
import { css } from '@emotion/react';

import closeIcon from '@assets/img/glyph-dismiss-16.svg';
import joystickImage from '@assets/img/joystick.svg';
import { openPrivacyPolicy, openSnakeGame } from '@commons/webExtensionsApi';
import { sizes } from '@frontend/commons/const';
import { Page } from '@frontend/commons/components/pontoon/Page';
import { Heading1 } from '@frontend/commons/components/pontoon/Heading1';
import { Button } from '@frontend/commons/components/pontoon/Button';

import { TourPageTile } from '../TourPageTile';

const Wrapper: React.FC<React.ComponentProps<'div'>> = (props) => (
  <div
    css={css({
      position: 'relative',
    })}
    {...props}
  />
);

const TourPageTiles: React.FC<React.ComponentProps<'div'>> = (props) => (
  <div
    css={css([
      {
        width: '90vw',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      {
        '@media screen and (width <= 1024px)': {
          width: '100%',
          margin: '0',
        },
      },
    ])}
    {...props}
  />
);

const PrivacyPolicyLinkWrapper: React.FC<React.ComponentProps<'div'>> = (
  props,
) => (
  <div
    css={css({
      textAlign: 'center',
    })}
    {...props}
  />
);

const CloseIcon: React.FC<React.ComponentProps<'span'>> = (props) => (
  <span
    data-testid="close-icon"
    css={css({
      display: 'inline-block',
      width: '16px',
      height: '16px',
      padding: '0.1em',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'contain',
      backgroundImage: `url(${closeIcon})`,
    })}
    {...props}
  />
);

const EasterEggIcon: React.FC<React.ComponentProps<'span'>> = (props) => (
  <span
    css={css({
      display: 'inline-block',
      width: '30px',
      height: '30px',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'contain',
      backgroundImage: `url(${joystickImage})`,
    })}
    {...props}
  />
);

const EasterEggHint: React.FC<React.ComponentProps<'div'>> = (props) => (
  <div
    css={css({
      position: 'absolute',
      bottom: '-18px',
      width: '100%',
      textAlign: 'center',
      fontSize: sizes.font.xSmall,
    })}
    {...props}
  />
);

interface Props {
  title: React.ComponentProps<typeof Heading1>['children'];
  tiles: React.ComponentProps<typeof TourPageTile>[];
}

export const TourPage: React.FC<Props> = ({ title = '', tiles = [] }) => {
  const [tilesToClick, setTilesToClick] = useState(
    new Set(tiles.map((tile) => tile.title)),
  );

  return (
    <Page
      bodyBackgroundColor="light"
      headerLinks={
        tilesToClick.size !== 0
          ? [
              {
                text: <CloseIcon title="Close the tour" />,
                onClick: () => window.close(),
              },
            ]
          : [
              {
                text: <EasterEggIcon title="Play a game" />,
                onClick: () => openSnakeGame(),
              },
            ]
      }
      heading={
        <div
          css={css({
            position: 'relative',
          })}
        >
          <Heading1>{title}</Heading1>
          {tilesToClick.size !== 0 ? (
            <EasterEggHint
              css={css({
                opacity: `${1 - tilesToClick.size / tiles.length}`,
              })}
            >
              It&apos;s?
            </EasterEggHint>
          ) : (
            <EasterEggHint>Don&apos;t stand there gawping!</EasterEggHint>
          )}
        </div>
      }
    >
      <Wrapper>
        <TourPageTiles>
          {tiles.map((tile, index) => (
            <TourPageTile
              key={index}
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
          <Button onClick={() => openPrivacyPolicy()}>Privacy policy</Button>
        </PrivacyPolicyLinkWrapper>
      </Wrapper>
    </Page>
  );
};
