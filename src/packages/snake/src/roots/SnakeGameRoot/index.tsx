import React from 'react';

import { SnakeGameContextProvider } from '../../context/SnakeGameContext';
import { SnakeGameBoard } from '../../components/SnakeGameBoard';
import { SnakeGameInfo } from '../../components/SnakeGameInfo';
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
