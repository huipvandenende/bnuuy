import { afterEach, describe, expect, test, vi } from 'vitest';
import { clock, createClock } from './clock';
import { DEV_OFFSET_KEY } from './game/storage';
import { createMemoryStorage, createThrowingStorage } from './game/testHelpers';

const SYSTEM_NOW = 1_000_000;
const systemNow = () => SYSTEM_NOW;

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createClock', () => {
  test('uses the system time when no offset is stored', () => {
    const testClock = createClock(createMemoryStorage(), systemNow);
    expect(testClock.now()).toBe(SYSTEM_NOW);
    expect(testClock.getOffset()).toBe(0);
  });

  test('adds the stored offset', () => {
    const testClock = createClock(createMemoryStorage({ [DEV_OFFSET_KEY]: '3600000' }), systemNow);
    expect(testClock.getOffset()).toBe(3_600_000);
    expect(testClock.now()).toBe(SYSTEM_NOW + 3_600_000);
  });

  test.each(['abc', 'Infinity', 'NaN'])('ignores a stored offset of %s', (raw) => {
    const testClock = createClock(createMemoryStorage({ [DEV_OFFSET_KEY]: raw }), systemNow);
    expect(testClock.now()).toBe(SYSTEM_NOW);
  });

  test('addOffset adds to the stored offset and saves it', () => {
    const storage = createMemoryStorage({ [DEV_OFFSET_KEY]: '1000' });
    const testClock = createClock(storage, systemNow);
    testClock.addOffset(500);
    testClock.addOffset(250);
    expect(storage.getItem(DEV_OFFSET_KEY)).toBe('1750');
    expect(testClock.now()).toBe(SYSTEM_NOW + 1750);
  });

  test('a new clock reads the offset saved by another clock', () => {
    const storage = createMemoryStorage();
    createClock(storage, systemNow).addOffset(60_000);
    expect(createClock(storage, systemNow).now()).toBe(SYSTEM_NOW + 60_000);
  });

  test('works in memory without storage', () => {
    const testClock = createClock(null, systemNow);
    expect(testClock.now()).toBe(SYSTEM_NOW);
    testClock.addOffset(42);
    expect(testClock.now()).toBe(SYSTEM_NOW + 42);
  });

  test('works in memory when storage throws', () => {
    const testClock = createClock(createThrowingStorage(), systemNow);
    expect(testClock.now()).toBe(SYSTEM_NOW);
    expect(() => testClock.addOffset(42)).not.toThrow();
    expect(testClock.getOffset()).toBe(42);
    expect(testClock.now()).toBe(SYSTEM_NOW + 42);
  });

  test('defaults to Date.now', () => {
    vi.spyOn(Date, 'now').mockReturnValue(123_456);
    expect(createClock(null).now()).toBe(123_456);
  });
});

describe('clock', () => {
  test('works without a browser', () => {
    vi.spyOn(Date, 'now').mockReturnValue(123_456);
    expect(clock.now()).toBe(123_456);
  });
});
