import { applyAction } from './game/actions';
import { advance } from './game/simulate';
import { createInitialState, loadGame, saveGame } from './game/storage';
import type { ActionResult, GameAction, GameState } from './game/types';

type Listener = (state: GameState) => void;

export interface Store {
  getState(): GameState;
  dispatch(action: GameAction): ActionResult;
  tick(): void;
  subscribe(listener: Listener): () => void;
  reload(): void;
  isStorageAvailable(): boolean;
  isSaveBroken(): boolean;
}

export function createStore(storage: Storage | null, now: () => number): Store {
  const loaded = loadGame(storage);
  let state = loaded.status === 'ok' ? advance(loaded.state, now()) : createInitialState();
  let storageAvailable = loaded.status !== 'unavailable';
  let saveBroken = loaded.status === 'broken';
  const listeners = new Set<Listener>();

  function commit(next: GameState): void {
    state = next;
    if (!saveBroken) storageAvailable = saveGame(storage, state);
    for (const listener of listeners) listener(state);
  }

  return {
    getState: () => state,
    dispatch(action) {
      const outcome = applyAction(state, action, now());
      if (outcome.result === 'ok' && (action.type === 'startOver' || action.type === 'loadState')) saveBroken = false;
      commit(outcome.state);
      return outcome.result;
    },
    tick() {
      commit(advance(state, now()));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    reload() {
      const reloaded = loadGame(storage);
      if (reloaded.status !== 'ok') return;
      saveBroken = false;
      state = advance(reloaded.state, now());
      for (const listener of listeners) listener(state);
    },
    isStorageAvailable: () => storageAvailable,
    isSaveBroken: () => saveBroken,
  };
}
