import type { PropsWithChildren } from 'react';
import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { render } from '@testing-library/react';

import type { GameFunctions } from '../gameFunctions';
import { GameState, SnakeGameReactContext } from '../SnakeGameContext';

interface MockProps
  extends Pick<
    React.ComponentProps<typeof SnakeGameReactContext.Provider>,
    'children'
  > {
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

export function renderInSnakeGameContext({
  children,
  ...mockProps
}: SnakeGameContextMockValues): RenderResult {
  return render(
    <SnakeGameContextProviderMock {...mockProps}>
      {children}
    </SnakeGameContextProviderMock>,
  );
}
