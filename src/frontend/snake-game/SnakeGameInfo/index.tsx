import React from 'react';
import { css } from '@emotion/react';

import { Button } from '@frontend/commons/components/pontoon/Button';

import { useSnakeGameContext, GameState } from '../SnakeGameContext';

export const Wrapper: React.FC<React.ComponentProps<'div'>> = (props) => (
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

export const ControlsInfo: React.FC<React.ComponentProps<'div'>> = (props) => (
  <div {...props} />
);

export const Score: React.FC<React.ComponentProps<'div'>> = (props) => (
  <div {...props} />
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
    <Wrapper>
      {gameState !== GameState.LOST && (
        <ControlsInfo>Controls: arrows or WASD</ControlsInfo>
      )}
      {gameInProgress && <Score>Your score: {score}</Score>}
      {gameState === GameState.RUNNING && (
        <Button onClick={controlFunctions.pauseGame}>PAUSE</Button>
      )}
      {gameState === GameState.PAUSED && (
        <Button onClick={controlFunctions.resumeGame}>RESUME</Button>
      )}
    </Wrapper>
  );
};
