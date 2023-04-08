import React from 'react';
import { screen, within, act } from '@testing-library/react';

import { renderInSnakeGameContext } from '../test/SnakeGameContextMock';
import { GameState } from '../SnakeGameContext';

import { SnakeGameBoard } from '.';

jest.mock('@commons/webExtensionsApi');

const WRAPPER_TEST_ID = 'snake-game-board';

function wrapper() {
  return screen.getByTestId(WRAPPER_TEST_ID);
}

describe('SnakeGameBoard', () => {
  it('renders with test id', () => {
    renderInSnakeGameContext({
      children: <SnakeGameBoard />,
      gameState: GameState.NOT_STARTED,
    });

    expect(wrapper()).toBeInTheDocument();
  });

  it('shows start screen before first start', () => {
    renderInSnakeGameContext({
      children: <SnakeGameBoard />,
      gameState: GameState.NOT_STARTED,
    });

    expect(
      within(wrapper()).getByRole('heading', { level: 3 }),
    ).toHaveTextContent('Snake');
    expect(within(wrapper()).getByRole('button')).toHaveTextContent(
      'START GAME',
    );
    expect(
      within(wrapper()).queryByTestId('react-snake-game'),
    ).not.toBeInTheDocument();
  });

  it('start game button starts the game', () => {
    const startGame = jest.fn();
    renderInSnakeGameContext({
      children: <SnakeGameBoard />,
      gameState: GameState.NOT_STARTED,
      startGame,
    });

    act(() => {
      within(wrapper()).getByText('START GAME').click();
    });

    expect(startGame).toHaveBeenCalled();
  });

  it('shows score after game is lost', () => {
    const score = 42;
    renderInSnakeGameContext({
      children: <SnakeGameBoard />,
      gameState: GameState.LOST,
      score,
    });

    expect(
      within(wrapper()).getByRole('heading', { level: 3 }),
    ).toHaveTextContent('GAMEOVER'); // <br> in the middle
    expect(
      within(wrapper()).getByRole('heading', { level: 4 }),
    ).toHaveTextContent(`You scored ${score} points.`);
    expect(within(wrapper()).getByRole('button')).toHaveTextContent(
      'TRY AGAIN',
    );
    expect(
      within(wrapper()).queryByTestId('react-snake-game'),
    ).not.toBeInTheDocument();
  });

  it('try again button restarts the game', () => {
    const restartGame = jest.fn();
    renderInSnakeGameContext({
      children: <SnakeGameBoard />,
      gameState: GameState.LOST,
      restartGame,
    });

    act(() => {
      within(wrapper()).getByText('TRY AGAIN').click();
    });

    expect(restartGame).toHaveBeenCalled();
  });

  it('renders game in progress', () => {
    renderInSnakeGameContext({
      children: <SnakeGameBoard />,
      gameState: GameState.RUNNING,
    });

    // eslint-disable-next-line testing-library/no-node-access
    expect(wrapper().getElementsByTagName('canvas')).toHaveLength(1);
  });
});
