import React, { useMemo } from 'react';
import type { IOptions } from 'react-game-snake';
import { SnakeGame } from 'react-game-snake';
import { browser } from '@pontoon-addon/commons/src/webExtensionsApi';

import type { EventListeners } from '../../context/gameFunctions';
import { useSnakeGameContext, GameState } from '../../context/SnakeGameContext';
import '@pontoon-addon/commons/static/css/pontoon.css';
import './index.css';

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
    [eventListeners]
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

  let reviewLink;
  if (browser.runtime.getURL('/').startsWith('moz-extension:')) {
    reviewLink = 'https://addons.mozilla.org/firefox/addon/pontoon-tools/';
  } else {
    reviewLink =
      'https://chrome.google.com/webstore/detail/pontoon-add-on/gnbfbnpjncpghhjmmhklfhcglbopagbb';
  }

  return (
    <div
      className="SnakeGameBoard"
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
          <div className="shareScore">
            <a target="_blank" rel="noreferrer" href={reviewLink}>
              Let us know how you like Pontoon Add-on
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
