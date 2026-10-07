import { afterEach, describe, expect, test, vi } from 'vitest';
import { getBrowserStorage } from './browserStorage';
import { createMemoryStorage, createThrowingStorage } from './game/testHelpers';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getBrowserStorage', () => {
  test('returns null when there is no window', () => {
    expect(getBrowserStorage()).toBeNull();
  });

  test('returns localStorage when it works and leaves no probe behind', () => {
    const localStorage = createMemoryStorage();
    vi.stubGlobal('window', { localStorage });
    expect(getBrowserStorage()).toBe(localStorage);
    expect(localStorage.length).toBe(0);
  });

  test('returns null when localStorage throws', () => {
    vi.stubGlobal('window', { localStorage: createThrowingStorage() });
    expect(getBrowserStorage()).toBeNull();
  });

  test('returns null when localStorage is missing', () => {
    vi.stubGlobal('window', {});
    expect(getBrowserStorage()).toBeNull();
  });
});
