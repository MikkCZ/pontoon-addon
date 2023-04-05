import React from 'react';
import styled from 'styled-components';

import { useSnakeGameContext, GameState } from '../SnakeGameContext';

export const Wrapper = styled.div`
  & > * {
    margin-top: 0.5em;
  }
`;

export const ControlsInfo = styled.div`
  /* just a named div */
`;

export const Score = styled.div`
  /* just a named div */
`;

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
        <button className="pontoon-style" onClick={controlFunctions.pauseGame}>
          PAUSE
        </button>
      )}
      {gameState === GameState.PAUSED && (
        <button className="pontoon-style" onClick={controlFunctions.resumeGame}>
          RESUME
        </button>
      )}
    </Wrapper>
  );
};
