import { describe, expect, test } from 'vitest';
import { HOUR_MS } from './constants';
import { makeBunny, makeState, T0 } from './testHelpers';
import { isValidGameState, validateName } from './validate';

describe('validateName', () => {
  test.each([
    ['', false],
    ['   ', false],
    ['a', true],
    ['a'.repeat(16), true],
    ['a'.repeat(17), false],
    [`  ${'a'.repeat(16)}  `, true],
    [` ${'a'.repeat(17)} `, false],
  ])('%j valid: %s', (raw, valid) => {
    expect(validateName(raw).ok).toBe(valid);
  });

  test('returns the trimmed name', () => {
    expect(validateName('  Clover \n')).toEqual({ ok: true, name: 'Clover' });
  });

  test('counts an emoji as one character', () => {
    expect(validateName('🐰'.repeat(16))).toEqual({ ok: true, name: '🐰'.repeat(16) });
    expect(validateName('🐰'.repeat(17)).ok).toBe(false);
  });

  test('keeps HTML characters as they are', () => {
    expect(validateName('<b>Bun</b>')).toEqual({ ok: true, name: '<b>Bun</b>' });
  });
});

describe('isValidGameState', () => {
  const valid = makeState(
    makeBunny({
      adoptedAt: T0 - 100 * HOUR_MS,
      needs: { hunger: 0, happiness: 50.5, cleanliness: 100, energy: 12.25 },
      sick: true,
      zeroMs: { hunger: HOUR_MS, cleanliness: 0, happiness: 0 },
      care: { weightedSum: 123456, durationMs: 7890 },
      adultVariant: 'fluffy',
      adventure: { id: 'office-job', startedAt: T0, endsAt: T0 + 4 * HOUR_MS },
      completedAdventures: ['garden-stroll', 'beach-day'],
      wardrobe: ['flower-crown', 'sun-hat'],
      equippedOutfit: 'sun-hat',
      events: [
        { type: 'grew-up', stage: 'teen' },
        { type: 'grew-up', stage: 'adult', variant: 'fluffy' },
        { type: 'returned', adventureId: 'beach-day', outfitFound: 'sun-hat' },
        { type: 'returned', adventureId: 'beach-day', outfitFound: null },
      ],
    }),
    true,
  );

  const withBunny = (changes: Record<string, unknown>) => ({ ...valid, bunny: { ...valid.bunny, ...changes } });

  test('accepts a full valid state', () => {
    expect(isValidGameState(valid)).toBe(true);
  });

  test('accepts a state without a bunny', () => {
    expect(isValidGameState(makeState(null))).toBe(true);
  });

  test('accepts a state that went through JSON', () => {
    expect(isValidGameState(JSON.parse(JSON.stringify(valid)))).toBe(true);
  });

  test.each([null, undefined, 'state', 42, [], [valid]])('rejects %j', (value) => {
    expect(isValidGameState(value)).toBe(false);
  });

  test('rejects a wrong version', () => {
    expect(isValidGameState({ ...valid, version: 2 })).toBe(false);
    expect(isValidGameState({ ...valid, version: '1' })).toBe(false);
  });

  test('rejects missing or wrong settings', () => {
    expect(isValidGameState({ version: 1, bunny: null })).toBe(false);
    expect(isValidGameState({ ...valid, settings: {} })).toBe(false);
    expect(isValidGameState({ ...valid, settings: { soundOn: 'yes' } })).toBe(false);
  });

  test('rejects a missing bunny field', () => {
    expect(isValidGameState({ version: 1, settings: { soundOn: false } })).toBe(false);
  });

  test.each(Object.keys(valid.bunny!))('rejects a bunny without %s', (key) => {
    const bunny: Record<string, unknown> = { ...valid.bunny };
    delete bunny[key];
    expect(isValidGameState({ ...valid, bunny })).toBe(false);
  });

  test.each([
    ['name', 42],
    ['adoptedAt', String(T0)],
    ['lastUpdatedAt', null],
    ['needs', null],
    ['needs', [1, 2, 3, 4]],
    ['needs', { hunger: '1', happiness: 1, cleanliness: 1, energy: 1 }],
    ['asleep', 'no'],
    ['sick', 1],
    ['depressed', null],
    ['zeroMs', []],
    ['zeroMs', { hunger: 0, cleanliness: 0 }],
    ['care', { weightedSum: '1', durationMs: 0 }],
    ['adultVariant', 1],
    ['adventure', 'office-job'],
    ['adventure', { id: 'office-job', startedAt: T0 }],
    ['completedAdventures', 'garden-stroll'],
    ['wardrobe', null],
    ['equippedOutfit', 3],
    ['events', {}],
    ['events', [null]],
  ])('rejects %s with value %j', (key, value) => {
    expect(isValidGameState(withBunny({ [key]: value }))).toBe(false);
  });

  test.each([
    ['hunger', -0.1],
    ['happiness', 100.1],
    ['cleanliness', Number.NaN],
    ['energy', Number.POSITIVE_INFINITY],
  ])('rejects %s of %d', (need, value) => {
    expect(isValidGameState(withBunny({ needs: { ...valid.bunny!.needs, [need]: value } }))).toBe(false);
  });

  test('accepts needs exactly at 0 and 100', () => {
    expect(isValidGameState(withBunny({ needs: { hunger: 0, happiness: 100, cleanliness: 0, energy: 100 } }))).toBe(true);
  });

  test('rejects negative or non-finite timers and care', () => {
    expect(isValidGameState(withBunny({ zeroMs: { hunger: -1, cleanliness: 0, happiness: 0 } }))).toBe(false);
    expect(isValidGameState(withBunny({ care: { weightedSum: 0, durationMs: -5 } }))).toBe(false);
    expect(isValidGameState(withBunny({ care: { weightedSum: Number.POSITIVE_INFINITY, durationMs: 0 } }))).toBe(false);
  });

  test('rejects a non-finite timestamp', () => {
    expect(isValidGameState(withBunny({ adoptedAt: Number.NaN }))).toBe(false);
  });

  test('rejects an invalid name', () => {
    expect(isValidGameState(withBunny({ name: '  ' }))).toBe(false);
    expect(isValidGameState(withBunny({ name: 'a'.repeat(17) }))).toBe(false);
  });

  test.each([
    ['adultVariant', 'shiny'],
    ['adventure', { id: 'moon-trip', startedAt: T0, endsAt: T0 + 1 }],
    ['completedAdventures', ['garden-stroll', 'moon-trip']],
    ['wardrobe', ['sun-hat', 'crown']],
    ['events', [{ type: 'grew-up', stage: 'elder' }]],
    ['events', [{ type: 'grew-up', stage: 'adult', variant: 'shiny' }]],
    ['events', [{ type: 'returned', adventureId: 'moon-trip', outfitFound: null }]],
    ['events', [{ type: 'returned', adventureId: 'beach-day', outfitFound: 'crown' }]],
    ['events', [{ type: 'birthday' }]],
  ])('rejects an unknown id in %s: %j', (key, value) => {
    expect(isValidGameState(withBunny({ [key]: value }))).toBe(false);
  });

  test('rejects duplicate ids', () => {
    expect(isValidGameState(withBunny({ completedAdventures: ['beach-day', 'beach-day'] }))).toBe(false);
    expect(isValidGameState(withBunny({ wardrobe: ['sun-hat', 'sun-hat'] }))).toBe(false);
  });

  test('rejects an equipped outfit that is not in the wardrobe', () => {
    expect(isValidGameState(withBunny({ equippedOutfit: 'suit' }))).toBe(false);
  });

  test('accepts no equipped outfit', () => {
    expect(isValidGameState(withBunny({ equippedOutfit: null }))).toBe(true);
  });

  test('rejects an adventure that ends before it starts', () => {
    expect(isValidGameState(withBunny({ adventure: { id: 'office-job', startedAt: T0, endsAt: T0 - 1 } }))).toBe(false);
  });

  test('rejects an adventure whose length does not match the catalogue', () => {
    expect(isValidGameState(withBunny({ adventure: { id: 'office-job', startedAt: T0, endsAt: T0 + 4 * HOUR_MS } }))).toBe(true);
    expect(isValidGameState(withBunny({ adventure: { id: 'office-job', startedAt: T0, endsAt: 8.64e15 } }))).toBe(false);
  });

  test.each([Date.UTC(2019, 11, 31), Date.UTC(2100, 0, 2), -8.64e15])('rejects the timestamp %d', (time) => {
    expect(isValidGameState(withBunny({ lastUpdatedAt: time }))).toBe(false);
    expect(isValidGameState(withBunny({ adoptedAt: time }))).toBe(false);
  });
});
