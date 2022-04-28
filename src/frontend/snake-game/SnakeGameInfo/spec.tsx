import React from 'react';
import { act } from 'react-dom/test-utils';

import { mountWithSnakeGameContext } from '../test/SnakeGameContextMock';
import { GameState } from '../SnakeGameContext';

import { SnakeGameInfo, Wrapper, ControlsInfo, Score } from '.';

describe('SnakeGameInfo', () => {
  it('renders score and pause button when the game is running', () => {
    const score = 42;
    const wrapper = mountWithSnakeGameContext({
      children: <SnakeGameInfo />,
      gameState: GameState.RUNNING,
      score,
    });

    expect(wrapper.find(ControlsInfo).text()).toBe('Controls: arrows or WASD');
    expect(wrapper.find(Score).text()).toBe(`Your score: ${score}`);
    expect(wrapper.find('button')).toHaveLength(1);
    expect(wrapper.find('button').text()).toBe('PAUSE');
  });

  it('pause button pauses the game', () => {
    const pauseGame = jest.fn();
    const wrapper = mountWithSnakeGameContext({
      children: <SnakeGameInfo />,
      gameState: GameState.RUNNING,
      pauseGame,
    });

    act(() => {
      wrapper.find('button').simulate('click');
    });

    expect(pauseGame).toHaveBeenCalled();
  });

  it('renders score and resume button when the game is paused', () => {
    const score = 42;
    const wrapper = mountWithSnakeGameContext({
      children: <SnakeGameInfo />,
      gameState: GameState.PAUSED,
      score,
    });

    expect(wrapper.find(ControlsInfo).text()).toBe('Controls: arrows or WASD');
    expect(wrapper.find(Score).text()).toBe(`Your score: ${score}`);
    expect(wrapper.find('button')).toHaveLength(1);
    expect(wrapper.find('button').text()).toBe('RESUME');
  });

  it('resume button resumes the game', () => {
    const resumeGame = jest.fn();
    const wrapper = mountWithSnakeGameContext({
      children: <SnakeGameInfo />,
      gameState: GameState.PAUSED,
      resumeGame,
    });

    act(() => {
      wrapper.find('button').simulate('click');
    });

    expect(resumeGame).toHaveBeenCalled();
  });

  it('renders controls info before the game starts', () => {
    const wrapper = mountWithSnakeGameContext({
      children: <SnakeGameInfo />,
      gameState: GameState.NOT_STARTED,
    });

    expect(wrapper.find(ControlsInfo).text()).toBe('Controls: arrows or WASD');
    expect(wrapper.find(Score)).toHaveLength(0);
    expect(wrapper.find('button')).toHaveLength(0);
  });

  it('renders nothing when the game is lost', () => {
    const wrapper = mountWithSnakeGameContext({
      children: <SnakeGameInfo />,
      gameState: GameState.LOST,
    });

    expect(wrapper.find(Wrapper).text()).toBe('');
  });
});
