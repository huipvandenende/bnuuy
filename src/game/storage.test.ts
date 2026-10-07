import { describe, expect, test } from 'vitest';
import { BROKEN_SAVE_KEY, createInitialState, DEV_OFFSET_KEY, loadGame, SAVE_KEY, saveGame } from './storage';
import { createMemoryStorage, createThrowingStorage, makeState } from './testHelpers';

describe('storage keys', () => {
  test('match the spec', () => {
    expect([SAVE_KEY, BROKEN_SAVE_KEY, DEV_OFFSET_KEY]).toEqual(['bnuuy:save', 'bnuuy:save-broken', 'bnuuy:dev-time-offset']);
  });
});

describe('createInitialState', () => {
  test('has no bunny and sound off', () => {
    expect(createInitialState()).toEqual({ version: 1, bunny: null, settings: { soundOn: false } });
  });
});

describe('loadGame', () => {
  test('loads a saved state', () => {
    const state = makeState();
    const storage = createMemoryStorage({ [SAVE_KEY]: JSON.stringify(state) });
    expect(loadGame(storage)).toEqual({ status: 'ok', state });
  });

  test('reports empty when nothing is saved', () => {
    expect(loadGame(createMemoryStorage())).toEqual({ status: 'empty' });
  });

  test.each([
    ['invalid JSON', '{"version":1,'],
    ['an invalid state', JSON.stringify({ ...makeState(), version: 2 })],
  ])('copies %s to the broken save key', (_, raw) => {
    const storage = createMemoryStorage({ [SAVE_KEY]: raw });
    expect(loadGame(storage)).toEqual({ status: 'broken' });
    expect(storage.getItem(BROKEN_SAVE_KEY)).toBe(raw);
    expect(storage.getItem(SAVE_KEY)).toBe(raw);
  });

  test('reports broken even when the copy cannot be written', () => {
    const storage = createMemoryStorage({ [SAVE_KEY]: 'nope' });
    storage.setItem = () => {
      throw new Error('full');
    };
    expect(loadGame(storage)).toEqual({ status: 'broken' });
  });

  test('reports unavailable without storage', () => {
    expect(loadGame(null)).toEqual({ status: 'unavailable' });
  });

  test('reports unavailable when storage throws', () => {
    expect(loadGame(createThrowingStorage())).toEqual({ status: 'unavailable' });
  });
});

describe('saveGame', () => {
  test('writes the state as JSON and loads it back', () => {
    const storage = createMemoryStorage();
    const state = makeState(undefined, true);
    expect(saveGame(storage, state)).toBe(true);
    expect(JSON.parse(storage.getItem(SAVE_KEY)!)).toEqual(state);
    expect(loadGame(storage)).toEqual({ status: 'ok', state });
  });

  test('returns false without storage', () => {
    expect(saveGame(null, makeState())).toBe(false);
  });

  test('returns false when writing fails', () => {
    expect(saveGame(createThrowingStorage(), makeState())).toBe(false);
  });
});
