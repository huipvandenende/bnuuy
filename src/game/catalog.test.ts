import { describe, expect, test } from 'vitest';
import { ADVENTURES, OUTFITS } from './catalog';
import { HOUR_MS } from './constants';

describe('catalog', () => {
  test('has eight adventures with the specified durations', () => {
    expect(ADVENTURES).toHaveLength(8);
    expect(ADVENTURES.map((a) => a.durationMs / HOUR_MS)).toEqual([1, 2, 3, 4, 6, 8, 10, 12]);
  });

  test('every adventure has a unique outfit', () => {
    const outfitIds = new Set(ADVENTURES.map((a) => a.outfitId));
    expect(outfitIds.size).toBe(8);
    expect(OUTFITS.map((o) => o.id)).toEqual(ADVENTURES.map((a) => a.outfitId));
  });
});
