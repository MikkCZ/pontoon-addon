import React from 'react';
import { screen, within } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

import { renderInSnakeGameContext } from '../test/SnakeGameContextMock';
import { GameState } from '../SnakeGameContext';

import { SnakeGameInfo } from '.';

const WRAPPER_TEST_ID = 'snake-game-info';

function wrapper() {
  return screen.getByTestId(WRAPPER_TEST_ID);
}

describe('SnakeGameInfo', () => {
  it('renders with test id', () => {
    renderInSnakeGameContext({
      children: <SnakeGameInfo />,
      gameState: GameState.RUNNING,
    });

    expect(wrapper()).toBeInTheDocument();
  });

  it('renders score and pause button when the game is running', () => {
    const score = 42;
    renderInSnakeGameContext({
      children: <SnakeGameInfo />,
      gameState: GameState.RUNNING,
      score,
    });

    expect(within(wrapper()).getByTestId('controls-info')).toHaveTextContent(
      'Controls: arrows or WASD',
    );
    expect(within(wrapper()).getByTestId('score')).toHaveTextContent(
      `Your score: ${score}`,
    );
    expect(within(wrapper()).getByTestId('button')).toHaveTextContent('PAUSE');
  });

  it('pause button pauses the game', () => {
    const pauseGame = jest.fn();
    renderInSnakeGameContext({
      children: <SnakeGameInfo />,
      gameState: GameState.RUNNING,
      pauseGame,
    });

    act(() => {
      within(wrapper()).getByText('PAUSE').click();
    });

    expect(pauseGame).toHaveBeenCalled();
  });

  it('renders score and resume button when the game is paused', () => {
    const score = 42;
    renderInSnakeGameContext({
      children: <SnakeGameInfo />,
      gameState: GameState.PAUSED,
      score,
    });

    expect(within(wrapper()).getByTestId('controls-info')).toHaveTextContent(
      'Controls: arrows or WASD',
    );
    expect(within(wrapper()).getByTestId('score')).toHaveTextContent(
      `Your score: ${score}`,
    );
    expect(within(wrapper()).getByTestId('button')).toHaveTextContent('RESUME');
  });

  it('resume button resumes the game', () => {
    const resumeGame = jest.fn();
    renderInSnakeGameContext({
      children: <SnakeGameInfo />,
      gameState: GameState.PAUSED,
      resumeGame,
    });

    act(() => {
      within(wrapper()).getByText('RESUME').click();
    });

    expect(resumeGame).toHaveBeenCalled();
  });

  it('renders controls info before the game starts', () => {
    renderInSnakeGameContext({
      children: <SnakeGameInfo />,
      gameState: GameState.NOT_STARTED,
    });

    expect(within(wrapper()).getByTestId('controls-info')).toHaveTextContent(
      'Controls: arrows or WASD',
    );
    expect(within(wrapper()).queryByTestId('score')).not.toBeInTheDocument();
    expect(within(wrapper()).queryByTestId('button')).not.toBeInTheDocument();
  });

  it('renders nothing when the game is lost', () => {
    renderInSnakeGameContext({
      children: <SnakeGameInfo />,
      gameState: GameState.LOST,
    });

    expect(
      within(wrapper()).queryByTestId('controls-info'),
    ).not.toBeInTheDocument();
    expect(within(wrapper()).queryByTestId('score')).not.toBeInTheDocument();
    expect(within(wrapper()).queryByTestId('button')).not.toBeInTheDocument();
  });
});
