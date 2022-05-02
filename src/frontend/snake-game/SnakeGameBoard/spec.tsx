import React from 'react';
import { act } from 'react-dom/test-utils';
import { SnakeGame } from 'react-game-snake';

import { mountWithSnakeGameContext } from '../test/SnakeGameContextMock';
import { GameState } from '../SnakeGameContext';

import { SnakeGameBoard } from '.';

jest.mock('@commons/webExtensionsApi');

describe('SnakeGameBoard', () => {
  it('shows start screen before first start', () => {
    const wrapper = mountWithSnakeGameContext({
      children: <SnakeGameBoard />,
      gameState: GameState.NOT_STARTED,
    });

    expect(wrapper.find('h3').text()).toBe('Snake');
    expect(wrapper.find('button').text()).toBe('START GAME');
    expect(wrapper.find(SnakeGame)).toHaveLength(0);
  });

  it('start game button starts the game', () => {
    const startGame = jest.fn();
    const wrapper = mountWithSnakeGameContext({
      children: <SnakeGameBoard />,
      gameState: GameState.NOT_STARTED,
      startGame,
    });

    act(() => {
      wrapper.find('button').simulate('click');
    });

    expect(startGame).toHaveBeenCalled();
  });

  it('shows score after game is lost', () => {
    const score = 42;
    const wrapper = mountWithSnakeGameContext({
      children: <SnakeGameBoard />,
      gameState: GameState.LOST,
      score,
    });

    expect(wrapper.find('h3').text()).toBe('GAMEOVER'); // <br> in the middle
    expect(wrapper.find('h4').text()).toBe(`You scored ${score} points.`);
    expect(wrapper.find('button').first().text()).toBe('TRY AGAIN');
    expect(wrapper.find(SnakeGame)).toHaveLength(0);
  });

  it('try again button restarts the game', () => {
    const restartGame = jest.fn();
    const wrapper = mountWithSnakeGameContext({
      children: <SnakeGameBoard />,
      gameState: GameState.LOST,
      restartGame,
    });

    act(() => {
      wrapper.find('button').first().simulate('click');
    });

    expect(restartGame).toHaveBeenCalled();
  });

  it('render game in progress', () => {
    const wrapper = mountWithSnakeGameContext({
      children: <SnakeGameBoard />,
      gameState: GameState.RUNNING,
    });

    expect(wrapper.find(SnakeGame)).toHaveLength(1);
  });
});
