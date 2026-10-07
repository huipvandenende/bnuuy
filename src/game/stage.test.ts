import { describe, expect, test } from 'vitest';
import { HOUR_MS, MINUTE_MS } from './constants';
import { adultVariantFromCare, ageMs, careScore, stageAt } from './stage';
import { makeBunny, T0 } from './testHelpers';

const bunny = makeBunny({ adoptedAt: T0 });
const careWithScore = (score: number) => ({ weightedSum: score * 1000, durationMs: 1000 });

describe('ageMs', () => {
  test('is the time since adoption', () => {
    expect(ageMs(bunny, T0 + 5 * HOUR_MS)).toBe(5 * HOUR_MS);
  });
});

describe('stageAt', () => {
  test.each([
    [0, 'baby'],
    [23 * HOUR_MS + 59 * MINUTE_MS, 'baby'],
    [24 * HOUR_MS, 'teen'],
    [95 * HOUR_MS + 59 * MINUTE_MS, 'teen'],
    [96 * HOUR_MS, 'adult'],
    [500 * HOUR_MS, 'adult'],
  ])('at age %i ms the bunny is a %s', (age, stage) => {
    expect(stageAt(bunny, T0 + age)).toBe(stage);
  });
});

describe('careScore', () => {
  test('is the weighted sum divided by the duration', () => {
    expect(careScore({ weightedSum: 150, durationMs: 2 })).toBe(75);
  });

  test('is null when no care was recorded', () => {
    expect(careScore({ weightedSum: 0, durationMs: 0 })).toBeNull();
  });
});

describe('adultVariantFromCare', () => {
  test.each([
    [100, 'fluffy'],
    [70, 'fluffy'],
    [69.9, 'normal'],
    [40, 'normal'],
    [39.9, 'scruffy'],
    [0, 'scruffy'],
  ])('care score %d gives %s', (score, variant) => {
    expect(adultVariantFromCare(careWithScore(score))).toBe(variant);
  });

  test('no recorded care gives normal', () => {
    expect(adultVariantFromCare({ weightedSum: 0, durationMs: 0 })).toBe('normal');
  });
});
