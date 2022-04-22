import type { IGameLogicEvents } from 'react-game-snake';

import type { StateRef } from '@commons/useStateRef';

import type { State, GameModel } from './SnakeGameContext';
import { GameState } from './SnakeGameContext';

export interface EventListeners extends Omit<IGameLogicEvents, 'onWin'> {
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onLoose: () => void;
  onRestart: () => void;
}

export interface ControlFunctions {
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  restartGame: () => void;
}

export interface GameFunctions {
  eventListeners: EventListeners;
  controlFunctions: ControlFunctions;
}

function buildEventGameListeners(
  stateRef: StateRef<State>,
  patchStateRef: (update: Partial<State>) => void,
): EventListeners {
  return {
    onLoopStart: (gameModel: GameModel) => {
      const gameInProgress =
        stateRef.current.gameState === GameState.RUNNING ||
        stateRef.current.gameState === GameState.PAUSED;
      if (!gameInProgress) {
        // prevent auto-start
        gameModel.updateGame({ pause: true });
      }
      if (stateRef.current.gameModel !== gameModel) {
        patchStateRef({ gameModel });
      }
    },
    onLoopFinish: (gameModel: GameModel) => {
      const gameInProgress =
        stateRef.current.gameState === GameState.RUNNING ||
        stateRef.current.gameState === GameState.PAUSED;
      // to keep score from previous game
      const shouldUpdateScore =
        gameInProgress && gameModel.game.points !== stateRef.current.score;
      if (shouldUpdateScore) {
        patchStateRef({ score: gameModel.game.points });
      }
    },
    onStart: () => patchStateRef({ gameState: GameState.RUNNING }),
    onPause: () => patchStateRef({ gameState: GameState.PAUSED }),
    onResume: () => patchStateRef({ gameState: GameState.RUNNING }),
    onLoose: () => patchStateRef({ gameState: GameState.LOST }),
    onRestart: () => patchStateRef({ gameState: GameState.RUNNING }),
  };
}

function buildGameControlFunctions(
  stateRef: StateRef<State>,
  eventListeners: EventListeners,
): ControlFunctions {
  return {
    startGame: () => {
      stateRef.current.gameModel?.updateGame({ pause: false });
      eventListeners.onStart();
    },
    pauseGame: () => {
      stateRef.current.gameModel?.updateGame({ pause: true });
      eventListeners.onPause();
    },
    resumeGame: () => {
      stateRef.current.gameModel?.updateGame({ pause: false });
      eventListeners.onResume();
    },
    // (!) hack: the game does not survive restart, ensure everything get reloaded instead
    restartGame: () => window.location.reload(),
  };
}

export function buildGameFunctions(
  stateRef: StateRef<State>,
  patchStateRef: (update: Partial<State>) => void,
): GameFunctions {
  const eventListeners = buildEventGameListeners(stateRef, patchStateRef);
  const controlFunctions = buildGameControlFunctions(stateRef, eventListeners);
  return {
    eventListeners,
    controlFunctions,
  };
}
