import { describe, expect, test } from 'vitest';
import { HOUR_MS } from './game/constants';
import { BROKEN_SAVE_KEY, SAVE_KEY } from './game/storage';
import { T0 } from './game/testHelpers';
import type { GameState } from './game/types';
import { createStore } from './store';

function fakeStorage(initial: Record<string, string> = {}): Storage {
  const data = new Map(Object.entries(initial));
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => void data.delete(key),
    setItem: (key, value) => void data.set(key, value),
  };
}

function savedState(storage: Storage): GameState {
  return JSON.parse(storage.getItem(SAVE_KEY)!);
}

describe('store', () => {
  test('dispatch advances time before the action and saves the result', () => {
    const storage = fakeStorage();
    let time = T0;
    const store = createStore(storage, () => time);
    store.dispatch({ type: 'adopt', name: 'Clover' });

    time += 4 * HOUR_MS;
    expect(store.dispatch({ type: 'feed' })).toBe('ok');

    const saved = savedState(storage);
    expect(saved.bunny!.lastUpdatedAt).toBe(time);
    expect(saved.bunny!.needs.hunger).toBeCloseTo(80);
    expect(store.getState()).toEqual(saved);
  });

  test('tick advances to now, saves and notifies listeners', () => {
    const storage = fakeStorage();
    let time = T0;
    const store = createStore(storage, () => time);
    store.dispatch({ type: 'adopt', name: 'Clover' });
    const seen: number[] = [];
    store.subscribe((state) => seen.push(state.bunny!.lastUpdatedAt));

    time = T0 + 5_000;
    store.tick();

    expect(seen).toEqual([T0 + 5_000]);
    expect(savedState(storage).bunny!.lastUpdatedAt).toBe(T0 + 5_000);
  });

  test('a broken save is kept until the player starts over', () => {
    const storage = fakeStorage({ [SAVE_KEY]: '{not json' });
    const store = createStore(storage, () => 0);
    expect(store.isSaveBroken()).toBe(true);
    expect(storage.getItem(BROKEN_SAVE_KEY)).toBe('{not json');

    store.tick();
    expect(storage.getItem(SAVE_KEY)).toBe('{not json');

    store.dispatch({ type: 'startOver' });
    expect(store.isSaveBroken()).toBe(false);
    expect(savedState(storage).bunny).toBeNull();
  });

  test('runs in memory when storage is unavailable', () => {
    const store = createStore(null, () => 0);
    expect(store.isStorageAvailable()).toBe(false);
    expect(store.dispatch({ type: 'adopt', name: 'Clover' })).toBe('ok');
    expect(store.getState().bunny!.name).toBe('Clover');
  });

  test('reload picks up a save written by another tab', () => {
    const storage = fakeStorage();
    const store = createStore(storage, () => T0);
    const other = createStore(storage, () => T0);
    other.dispatch({ type: 'adopt', name: 'Pip' });

    store.reload();
    expect(store.getState().bunny!.name).toBe('Pip');
  });

  test('reload clears a broken save that another tab fixed', () => {
    const storage = fakeStorage({ [SAVE_KEY]: '{not json' });
    const store = createStore(storage, () => T0);
    const other = createStore(storage, () => T0);
    other.dispatch({ type: 'startOver' });
    other.dispatch({ type: 'adopt', name: 'Pip' });

    store.reload();
    expect(store.isSaveBroken()).toBe(false);
    expect(store.getState().bunny!.name).toBe('Pip');
  });
});
