import React from 'react';

import { useSnakeGameContext, GameState } from '../../context/SnakeGameContext';
import '@pontoon-addon/commons/static/css/pontoon.css';
import './index.css';

export const SnakeGameInfo: React.FC = () => {
  const context = useSnakeGameContext();
  const { gameState, score } = context.stateRef.current;
  const controlFunctions = context.gameFunctions.controlFunctions;

  const gameInProgress =
    gameState === GameState.RUNNING || gameState === GameState.PAUSED;

  return (
    <div className="SnakeGameInfo">
      {gameState !== GameState.LOST && (
        <div className="controlsInfo">Controls: arrows or WASD</div>
      )}
      {gameInProgress && <div className="score">Your score: {score}</div>}
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
    </div>
  );
};
