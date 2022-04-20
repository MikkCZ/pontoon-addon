import React, { createContext, useContext, useCallback, useMemo } from 'react';
import type { IGame } from 'react-game-snake/lib/model/Game';

import type { StateRef } from '@commons/useStateRef';
import { useStateRef } from '@commons/useStateRef';
import { patchState } from '@commons/patchState';

import type { GameFunctions } from '../gameFunctions';
import { buildGameFunctions } from '../gameFunctions';

export interface GameModel {
  readonly game: {
    readonly points: number;
  };
  readonly updateGame: (game: Pick<IGame, 'pause'>) => void;
}

export enum GameState {
  NOT_STARTED,
  RUNNING,
  PAUSED,
  LOST,
}

export interface State {
  readonly gameModel?: GameModel;
  readonly gameState: GameState;
  readonly score: number;
}

interface SnakeGameContext {
  readonly stateRef: StateRef<State>;
  readonly gameFunctions: GameFunctions;
}

export const SnakeGameReactContext = createContext<
  SnakeGameContext | undefined
>(undefined);

export function useSnakeGameContext(): SnakeGameContext {
  const context = useContext(SnakeGameReactContext);
  if (!context) {
    throw new Error(
      '"useSnakeGameContext" hook may only be used inside "SnakeGameContextProvider".'
    );
  }
  return context;
}

export const SnakeGameContextProvider: React.FC = ({ children }) => {
  const [stateRef, _setStateRef] = useStateRef({
    gameState: GameState.NOT_STARTED,
    score: 0,
  });

  const patchStateRef = useCallback(
    (update: Partial<State>) => patchState(update, _setStateRef),
    [_setStateRef]
  );

  const gameFunctions = useMemo(
    // (!) hack: the game does not survive re-renders, ensure it gets never re-rendered
    () => buildGameFunctions(stateRef, patchStateRef),
    [stateRef, patchStateRef]
  );

  return (
    <SnakeGameReactContext.Provider
      value={{
        stateRef,
        gameFunctions,
      }}
    >
      {children}
    </SnakeGameReactContext.Provider>
  );
};
