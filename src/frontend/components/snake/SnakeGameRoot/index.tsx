import React from 'react';

import { SnakeGameContextProvider } from '../SnakeGameContext';
import { SnakeGameBoard } from '../SnakeGameBoard';
import { SnakeGameInfo } from '../SnakeGameInfo';

import './index.css';

export const SnakeGameRoot: React.FC = () => {
  return (
    <div className="SnakeGameRoot">
      <h2>Thank you for using Pontoon Add-on.</h2>
      <h3>Enjoy the game.</h3>
      <SnakeGameContextProvider>
        <SnakeGameBoard />
        <SnakeGameInfo />
      </SnakeGameContextProvider>
    </div>
  );
};
