import { describe, expect, test } from 'vitest';
import { droppingsCount, moodOf } from './mood';
import { makeBunny } from './testHelpers';

describe('moodOf', () => {
  test('sleeping comes first', () => {
    expect(moodOf(makeBunny({ asleep: true, sick: true, depressed: true, needs: { hunger: 0 } }))).toBe('sleeping');
  });

  test('sick comes before sad', () => {
    expect(moodOf(makeBunny({ sick: true, depressed: true, needs: { hunger: 0 } }))).toBe('sick');
  });

  test('depressed is sad even with full needs', () => {
    expect(moodOf(makeBunny({ depressed: true }))).toBe('sad');
  });

  test('any need below 25 is sad', () => {
    expect(moodOf(makeBunny({ needs: { cleanliness: 24.9 } }))).toBe('sad');
    expect(moodOf(makeBunny({ needs: { energy: 24.9 } }))).toBe('sad');
  });

  test('all needs at 60 or more is happy', () => {
    expect(moodOf(makeBunny({ needs: { hunger: 60, happiness: 60, cleanliness: 60, energy: 60 } }))).toBe('happy');
  });

  test('otherwise content', () => {
    expect(moodOf(makeBunny({ needs: { hunger: 59.9 } }))).toBe('content');
    expect(moodOf(makeBunny({ needs: { hunger: 25, happiness: 25, cleanliness: 25, energy: 25 } }))).toBe('content');
  });
});

describe('droppingsCount', () => {
  test.each([
    [100, 0],
    [75, 1],
    [74, 1],
    [50, 2],
    [1, 3],
    [0, 4],
  ])('cleanliness %d gives %d droppings', (cleanliness, count) => {
    expect(droppingsCount(cleanliness)).toBe(count);
  });

  test('is never negative or above 4', () => {
    expect(droppingsCount(120)).toBe(0);
    expect(droppingsCount(-50)).toBe(4);
  });
});
