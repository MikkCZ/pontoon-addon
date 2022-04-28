import React, { useMemo } from 'react';
import styled from 'styled-components';
import type { IOptions } from 'react-game-snake';
import { SnakeGame } from 'react-game-snake';

import { browser } from '@commons/webExtensionsApi';

import type { EventListeners } from '../gameFunctions';
import { useSnakeGameContext, GameState } from '../SnakeGameContext';

const Wrapper = styled.div`
  position: relative;
  margin: 0 auto;
  border: 3px solid #7bc876;
  display: inline-block;

  & > * {
    position: relative;
    margin: 0;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
`;

const Link = styled.button`
  appearance: none;
  display: inline-block;
  background: transparent;
  border: none;
  margin: 0;
  padding: 0;
  font-size: inherit;
  color: #7bc876;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    color: inherit;
  }
`;

const gameSpeed = 7;

const gameOptions: IOptions = {
  colors: {
    field: '#333941',
    snake: '#7bc876',
    food: '#7bc876',
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

export const SnakeGameBoard: React.FC = () => {
  const context = useSnakeGameContext();
  const { gameState, score } = context.stateRef.current;
  const eventListeners = context.gameFunctions.eventListeners;
  const controlFunctions = context.gameFunctions.controlFunctions;

  const beforeFirstGameStarted = gameState === GameState.NOT_STARTED;
  const gameInProgress =
    gameState === GameState.RUNNING || gameState === GameState.PAUSED;
  const gameOver = gameState === GameState.LOST;

  const boardWithListeners = useBoardWith(eventListeners);

  return (
    <Wrapper
      style={{
        width: finalBoardWidth,
        height: finalBoardHeight,
      }}
    >
      {beforeFirstGameStarted && (
        <div>
          <h3>Snake</h3>
          <button
            className="pontoon-style"
            onClick={controlFunctions.startGame}
          >
            START GAME
          </button>
        </div>
      )}
      {gameInProgress && <>{boardWithListeners}</>}
      {gameOver && (
        <div>
          <h3>
            GAME
            <br />
            OVER
          </h3>
          <h4>
            {score === 1 ? (
              <>You scored one point.</>
            ) : (
              <>You scored {score} points.</>
            )}
          </h4>
          <button
            className="pontoon-style"
            onClick={controlFunctions.restartGame}
          >
            TRY AGAIN
          </button>
          <div>or</div>
          <div>
            <Link
              onClick={() => {
                let reviewLink;
                if (browser.runtime.getURL('/').startsWith('moz-extension:')) {
                  reviewLink =
                    'https://addons.mozilla.org/firefox/addon/pontoon-tools/';
                } else {
                  reviewLink =
                    'https://chrome.google.com/webstore/detail/pontoon-add-on/gnbfbnpjncpghhjmmhklfhcglbopagbb';
                }
                browser.tabs.create({ url: reviewLink });
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
