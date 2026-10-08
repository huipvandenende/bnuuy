import type { GameState } from './types';
import { isValidGameState } from './validate';

export const SAVE_KEY = 'bnuuy:save';
export const BROKEN_SAVE_KEY = 'bnuuy:save-broken';
export const DEV_OFFSET_KEY = 'bnuuy:dev-time-offset';
export const DEV_FORCE_SUNDAY_KEY = 'bnuuy:dev-force-sunday';

export type LoadResult =
  | { status: 'ok'; state: GameState }
  | { status: 'empty' }
  | { status: 'broken' }
  | { status: 'unavailable' };

export function createInitialState(): GameState {
  return { version: 1, bunny: null, settings: { soundOn: false } };
}

export function loadGame(storage: Storage | null): LoadResult {
  if (!storage) return { status: 'unavailable' };
  let raw: string | null;
  try {
    raw = storage.getItem(SAVE_KEY);
  } catch {
    return { status: 'unavailable' };
  }
  if (raw === null) return { status: 'empty' };

  const state = parseJson(raw);
  if (isValidGameState(state)) return { status: 'ok', state };

  try {
    storage.setItem(BROKEN_SAVE_KEY, raw);
  } catch {}
  return { status: 'broken' };
}

export function saveGame(storage: Storage | null, state: GameState): boolean {
  if (!storage) return false;
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}
