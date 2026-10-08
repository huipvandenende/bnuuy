import { describe, expect, test } from 'vitest';
import { isChurchDay, isSunday } from './sunday';

const at = (day: number, hours: number, minutes: number) => new Date(2026, 9, day, hours, minutes).getTime();

describe('isSunday', () => {
  test('follows the local date from Sunday 00:00 to 23:59', () => {
    expect(isSunday(at(10, 23, 59))).toBe(false);
    expect(isSunday(at(11, 0, 0))).toBe(true);
    expect(isSunday(at(11, 23, 59))).toBe(true);
    expect(isSunday(at(12, 0, 0))).toBe(false);
  });
});

describe('isChurchDay', () => {
  test('is true on Sundays or when forced', () => {
    expect(isChurchDay(at(11, 12, 0), false)).toBe(true);
    expect(isChurchDay(at(8, 12, 0), false)).toBe(false);
    expect(isChurchDay(at(8, 12, 0), true)).toBe(true);
  });
});
