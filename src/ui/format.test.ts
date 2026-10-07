import { describe, expect, test } from 'vitest';
import { DAY_MS, HOUR_MS, MINUTE_MS } from '../game/constants';
import { formatCountdown, formatDuration } from './format';

describe('formatDuration', () => {
  test('shows the two largest units and drops zero parts', () => {
    expect(formatDuration(2 * DAY_MS + 4 * HOUR_MS + 30 * MINUTE_MS)).toBe('2 d 4 h');
    expect(formatDuration(3 * HOUR_MS + 12 * MINUTE_MS)).toBe('3 h 12 min');
    expect(formatDuration(HOUR_MS)).toBe('1 h');
    expect(formatDuration(DAY_MS)).toBe('1 d');
    expect(formatDuration(59 * 1000)).toBe('0 min');
  });
});

describe('formatCountdown', () => {
  test('rounds up to whole minutes, at least one', () => {
    expect(formatCountdown(3 * HOUR_MS + 11 * MINUTE_MS + 1)).toBe('3 h 12 min');
    expect(formatCountdown(10_000)).toBe('1 min');
    expect(formatCountdown(0)).toBe('1 min');
  });
});
