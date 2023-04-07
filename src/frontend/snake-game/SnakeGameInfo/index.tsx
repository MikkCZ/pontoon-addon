import React from 'react';
import { css } from '@emotion/react';

import { Button } from '@frontend/commons/components/pontoon/Button';

import { useSnakeGameContext, GameState } from '../SnakeGameContext';

const Wrapper: React.FC<React.ComponentProps<'div'>> = (props) => (
  <div
    css={css([
      {
        '& > *': {
          marginTop: '0.5em',
        },
      },
    ])}
    {...props}
  />
);

export const SnakeGameInfo: React.FC = () => {
  const {
    stateRef,
    gameFunctions: { controlFunctions },
  } = useSnakeGameContext();
  const { gameState, score } = stateRef.current;

  const gameInProgress =
    gameState === GameState.RUNNING || gameState === GameState.PAUSED;

  return (
    <Wrapper data-testid="snake-game-info">
      {gameState !== GameState.LOST && (
        <div data-testid="controls-info">Controls: arrows or WASD</div>
      )}
      {gameInProgress && <div data-testid="score">Your score: {score}</div>}
      {gameState === GameState.RUNNING && (
        <Button onClick={controlFunctions.pauseGame}>PAUSE</Button>
      )}
      {gameState === GameState.PAUSED && (
        <Button onClick={controlFunctions.resumeGame}>RESUME</Button>
      )}
    </Wrapper>
  );
};
