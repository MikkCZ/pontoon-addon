import { MutableRefObject } from 'react';
import { Context } from 'react-game-snake';

import { setLocation } from '../test/setLocation';
import type { StateRef } from '../util/useStateRef';

import { State, GameState } from './SnakeGameContext';
import { GameFunctions, buildGameFunctions } from './gameFunctions';

const defaultState: State = {
  gameState: GameState.NOT_STARTED,
  score: 0,
};

let stateRef: MutableRefObject<State>;
const patchStateRef = jest.fn();
let gameFunctions: GameFunctions;
const updateGame = jest.fn();

beforeEach(() => {
  stateRef = { current: defaultState } as StateRef<State>;
  gameFunctions = buildGameFunctions(
    stateRef as StateRef<State>,
    patchStateRef
  );
});

afterEach(() => {
  patchStateRef.mockReset();
  updateGame.mockReset();
});

describe('gameFunctions', () => {
  describe('eventListeners', () => {
    it('onLoopStart sets gameModel', () => {
      expect(patchStateRef).not.toHaveBeenCalled();
      const gameModel = ({ updateGame } as unknown) as Context;

      gameFunctions.eventListeners.onLoopStart(gameModel);

      expect(patchStateRef).toHaveBeenCalledTimes(1);
      expect(patchStateRef.mock.calls[0]).toHaveLength(1);
      expect(patchStateRef.mock.calls[0][0].gameModel).toBe(gameModel);
    });

    it('onLoopStart pauses game before start', () => {
      expect(updateGame).not.toHaveBeenCalled();
      stateRef.current = { ...defaultState, gameState: GameState.NOT_STARTED };

      gameFunctions.eventListeners.onLoopStart(({
        updateGame,
      } as unknown) as Context);

      expect(updateGame).toHaveBeenCalledTimes(1);
      expect(updateGame.mock.calls[0]).toHaveLength(1);
      expect(updateGame.mock.calls[0][0].pause).toBeTruthy();
    });

    it('onLoopStart lets the game run', () => {
      expect(updateGame).not.toHaveBeenCalled();
      stateRef.current = { ...defaultState, gameState: GameState.RUNNING };

      gameFunctions.eventListeners.onLoopStart(({
        updateGame,
      } as unknown) as Context);

      expect(updateGame).not.toHaveBeenCalled();
    });

    it('onLoopFinish updates score for running game', () => {
      expect(patchStateRef).not.toHaveBeenCalled();
      const gameModel = ({ game: { points: 42 } } as unknown) as Context;
      stateRef.current = { gameState: GameState.RUNNING, score: 13 };

      gameFunctions.eventListeners.onLoopFinish(gameModel);

      expect(patchStateRef).toHaveBeenCalledTimes(1);
      expect(patchStateRef.mock.calls[0]).toHaveLength(1);
      expect(patchStateRef.mock.calls[0][0].score).toBe(42);
    });

    it('onLoopFinish preserves score from the game after it lost', () => {
      expect(patchStateRef).not.toHaveBeenCalled();
      const gameModel = ({ game: { points: 42 } } as unknown) as Context;
      stateRef.current = { gameState: GameState.LOST, score: 13 };

      gameFunctions.eventListeners.onLoopFinish(gameModel);

      expect(patchStateRef).not.toHaveBeenCalled();
    });

    it('onStart updates gameState', () => {
      expect(patchStateRef).not.toHaveBeenCalled();

      gameFunctions.eventListeners.onStart();

      expect(patchStateRef).toHaveBeenCalledTimes(1);
      expect(patchStateRef.mock.calls[0]).toHaveLength(1);
      expect(patchStateRef.mock.calls[0][0].gameState).toBe(GameState.RUNNING);
    });

    it('onPause updates gameState', () => {
      expect(patchStateRef).not.toHaveBeenCalled();

      gameFunctions.eventListeners.onPause();

      expect(patchStateRef).toHaveBeenCalledTimes(1);
      expect(patchStateRef.mock.calls[0]).toHaveLength(1);
      expect(patchStateRef.mock.calls[0][0].gameState).toBe(GameState.PAUSED);
    });

    it('onResume updates gameState', () => {
      expect(patchStateRef).not.toHaveBeenCalled();

      gameFunctions.eventListeners.onResume();

      expect(patchStateRef).toHaveBeenCalledTimes(1);
      expect(patchStateRef.mock.calls[0]).toHaveLength(1);
      expect(patchStateRef.mock.calls[0][0].gameState).toBe(GameState.RUNNING);
    });

    it('onLoose updates gameState', () => {
      expect(patchStateRef).not.toHaveBeenCalled();

      gameFunctions.eventListeners.onLoose();

      expect(patchStateRef).toHaveBeenCalledTimes(1);
      expect(patchStateRef.mock.calls[0]).toHaveLength(1);
      expect(patchStateRef.mock.calls[0][0].gameState).toBe(GameState.LOST);
    });

    it('onRestart updates gameState', () => {
      expect(patchStateRef).not.toHaveBeenCalled();

      gameFunctions.eventListeners.onRestart();

      expect(patchStateRef).toHaveBeenCalledTimes(1);
      expect(patchStateRef.mock.calls[0]).toHaveLength(1);
      expect(patchStateRef.mock.calls[0][0].gameState).toBe(GameState.RUNNING);
    });
  });

  describe('controlFunctions', () => {
    it('startGame starts the game and updates gameState', () => {
      expect(updateGame).not.toHaveBeenCalled();
      expect(patchStateRef).not.toHaveBeenCalled();
      const gameModel = ({ updateGame } as unknown) as Context;
      stateRef.current = { ...defaultState, gameModel };

      gameFunctions.controlFunctions.startGame();

      expect(updateGame).toHaveBeenCalledTimes(1);
      expect(updateGame.mock.calls[0]).toHaveLength(1);
      expect(updateGame.mock.calls[0][0].pause).toBeFalsy();
      expect(patchStateRef).toHaveBeenCalledTimes(1);
      expect(patchStateRef.mock.calls[0]).toHaveLength(1);
      expect(patchStateRef.mock.calls[0][0].gameState).toBe(GameState.RUNNING);
    });

    it('pauseGame pauses the game and updates gameState', () => {
      expect(updateGame).not.toHaveBeenCalled();
      expect(patchStateRef).not.toHaveBeenCalled();
      const gameModel = ({ updateGame } as unknown) as Context;
      stateRef.current = { ...defaultState, gameModel };

      gameFunctions.controlFunctions.pauseGame();

      expect(updateGame).toHaveBeenCalledTimes(1);
      expect(updateGame.mock.calls[0]).toHaveLength(1);
      expect(updateGame.mock.calls[0][0].pause).toBeTruthy();
      expect(patchStateRef).toHaveBeenCalledTimes(1);
      expect(patchStateRef.mock.calls[0]).toHaveLength(1);
      expect(patchStateRef.mock.calls[0][0].gameState).toBe(GameState.PAUSED);
    });

    it('resumeGame starts the game and updates gameState', () => {
      expect(updateGame).not.toHaveBeenCalled();
      expect(patchStateRef).not.toHaveBeenCalled();
      const gameModel = ({ updateGame } as unknown) as Context;
      stateRef.current = { ...defaultState, gameModel };

      gameFunctions.controlFunctions.resumeGame();

      expect(updateGame).toHaveBeenCalledTimes(1);
      expect(updateGame.mock.calls[0]).toHaveLength(1);
      expect(updateGame.mock.calls[0][0].pause).toBeFalsy();
      expect(patchStateRef).toHaveBeenCalledTimes(1);
      expect(patchStateRef.mock.calls[0]).toHaveLength(1);
      expect(patchStateRef.mock.calls[0][0].gameState).toBe(GameState.RUNNING);
    });

    it('restartGame reloads the page', () => {
      const reload = jest.fn();
      setLocation('moz-extension://foo-bar', { reload });

      gameFunctions.controlFunctions.restartGame();

      expect(reload).toHaveBeenCalled();
    });
  });
});
