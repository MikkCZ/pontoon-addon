import React, { useMemo } from 'react';
import { css } from '@emotion/react';
import type { IOptions } from 'react-game-snake';
import { SnakeGame } from 'react-game-snake';

import {
  browserFamily,
  BrowserFamily,
  openNewTab,
} from '@commons/webExtensionsApi';
import {
  pontoonAddonAmoPage,
  pontoonAddonChromeWebStorePage,
} from '@commons/webLinks';
import { colors } from '@frontend/commons/const';
import { Heading3 } from '@frontend/commons/components/pontoon/Heading3';
import { Button } from '@frontend/commons/components/pontoon/Button';
import { Link } from '@frontend/commons/components/pontoon/Link';

import type { EventListeners } from '../gameFunctions';
import { useSnakeGameContext, GameState } from '../SnakeGameContext';

const Wrapper: React.FC<React.ComponentProps<'div'>> = (props) => (
  <div
    css={css([
      {
        position: 'relative',
        margin: '0 auto',
        border: `3px solid ${colors.interactive.green}`,
        display: 'inline-block',
      },
      {
        '& > *': {
          position: 'relative',
          margin: '0',
          width: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
        },
      },
    ])}
    {...props}
  />
);

const gameSpeed = 7;

const gameOptions: IOptions = {
  colors: {
    field: colors.background.light,
    snake: colors.interactive.green,
    food: colors.interactive.green,
  },
  countOfHorizontalFields: 40, // board width
  countOfVerticalFields: 30, // board height
  fieldSize: 16,
  loopTime: Math.round(1000 / gameSpeed),
  pauseAllowed: false,
  restartAllowed: false,
};

const finalBoardWidth =
  gameOptions.fieldSize * gameOptions.countOfHorizontalFields;
const finalBoardHeight =
  gameOptions.fieldSize * gameOptions.countOfVerticalFields;

function useBoardWith(eventListeners: EventListeners): JSX.Element {
  // (!) hack: the game does not survive re-renders, ensure it gets never re-rendered
  return useMemo(
    () => <SnakeGame {...gameOptions} {...eventListeners} />,
    [eventListeners],
  );
}

export const SnakeGameBoard: React.FC<React.ComponentProps<typeof Wrapper>> = (
  props,
) => {
  const {
    stateRef,
    gameFunctions: { eventListeners, controlFunctions },
  } = useSnakeGameContext();
  const { gameState, score } = stateRef.current;

  const beforeFirstGameStarted = gameState === GameState.NOT_STARTED;
  const gameInProgress =
    gameState === GameState.RUNNING || gameState === GameState.PAUSED;
  const gameOver = gameState === GameState.LOST;

  const boardWithListeners = useBoardWith(eventListeners);

  return (
    <Wrapper
      data-testid="snake-game-board"
      css={css({
        width: `${finalBoardWidth}px`,
        height: `${finalBoardHeight}px`,
      })}
      {...props}
    >
      {beforeFirstGameStarted && (
        <div>
          <Heading3>Snake</Heading3>
          <Button onClick={controlFunctions.startGame}>START GAME</Button>
        </div>
      )}
      {gameInProgress && <>{boardWithListeners}</>}
      {gameOver && (
        <div>
          <Heading3>
            GAME
            <br />
            OVER
          </Heading3>
          <h4>
            {score === 1 ? (
              <>You scored one point.</>
            ) : (
              <>You scored {score} points.</>
            )}
          </h4>
          <Button onClick={controlFunctions.restartGame}>TRY AGAIN</Button>
          <div>or</div>
          <div>
            <Link
              onClick={() => {
                switch (browserFamily()) {
                  case BrowserFamily.MOZILLA:
                    openNewTab(pontoonAddonAmoPage());
                    break;
                  case BrowserFamily.CHROMIUM:
                    openNewTab(pontoonAddonChromeWebStorePage());
                    break;
                }
              }}
            >
              Let us know how you like Pontoon Add-on
            </Link>
          </div>
        </div>
      )}
    </Wrapper>
  );
};
