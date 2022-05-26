import type { PropsWithChildren } from 'react';
import React from 'react';
import type { ReactWrapper } from 'enzyme';
import { mount } from 'enzyme';

import type { GameFunctions } from '../gameFunctions';
import { GameState, SnakeGameReactContext } from '../SnakeGameContext';

interface MockProps {
  gameState?: GameState;
  score?: number;
  startGame?: () => void;
  pauseGame?: () => void;
  resumeGame?: () => void;
  restartGame?: () => void;
}

type SnakeGameContextMockValues = PropsWithChildren<MockProps>;

function mockPropsToContext({
  gameState = GameState.NOT_STARTED,
  score = 13,
  startGame = jest.fn(),
  pauseGame = jest.fn(),
  resumeGame = jest.fn(),
  restartGame = jest.fn(),
}: MockProps) {
  return {
    stateRef: { current: { gameState, score } },
    gameFunctions: {
      controlFunctions: { startGame, pauseGame, resumeGame, restartGame },
    } as unknown as GameFunctions,
  };
}

export const snakeGameContextDefaultMockValue = mockPropsToContext({});

export const SnakeGameContextProviderMock: React.FC<MockProps> = ({
  children,
  ...mockProps
}) => {
  return (
    <SnakeGameReactContext.Provider value={mockPropsToContext(mockProps)}>
      {children}
    </SnakeGameReactContext.Provider>
  );
};

export function mountWithSnakeGameContext({
  children,
  ...mockProps
}: SnakeGameContextMockValues): ReactWrapper<
  typeof SnakeGameReactContext.Provider
> {
  return mount(
    <SnakeGameContextProviderMock {...mockProps}>
      {children}
    </SnakeGameContextProviderMock>,
  );
}
