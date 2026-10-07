import { describe, expect, test } from 'vitest';
import { ADULT_AGE_MS, HOUR_MS, TEEN_AGE_MS } from '../game/constants';
import type { Bunny } from '../game/types';
import { describeScene, sceneViewOf } from './scene';

const ADOPTED_AT = 1_000_000;

function makeBunny(overrides: Partial<Bunny> = {}): Bunny {
  return {
    name: 'Clover',
    adoptedAt: ADOPTED_AT,
    lastUpdatedAt: ADOPTED_AT,
    needs: { hunger: 100, happiness: 100, cleanliness: 100, energy: 100 },
    asleep: false,
    sick: false,
    depressed: false,
    zeroMs: { hunger: 0, cleanliness: 0, happiness: 0 },
    care: { weightedSum: 0, durationMs: 0 },
    adultVariant: null,
    adventure: null,
    completedAdventures: [],
    wardrobe: [],
    equippedOutfit: null,
    events: [],
    ...overrides,
  };
}

const teenTime = ADOPTED_AT + TEEN_AGE_MS;
const adultTime = ADOPTED_AT + ADULT_AGE_MS;

describe('describeScene', () => {
  test('describes mood and droppings', () => {
    const bunny = makeBunny({ needs: { hunger: 100, happiness: 100, cleanliness: 50, energy: 100 } });
    expect(describeScene(bunny, teenTime)).toBe('Clover, a teen bunny, looks content. 2 droppings on the floor.');
    expect(describeScene(makeBunny(), teenTime)).toBe('Clover, a teen bunny, looks happy. The floor is clean.');
  });

  test('uses singular for one dropping and says when the floor is clean', () => {
    const oneDropping = makeBunny({ needs: { hunger: 50, happiness: 50, cleanliness: 75, energy: 50 } });
    expect(describeScene(oneDropping, ADOPTED_AT)).toBe('Clover, a baby bunny, looks content. 1 dropping on the floor.');
    expect(describeScene(makeBunny({ sick: true }), ADOPTED_AT)).toBe(
      'Clover, a baby bunny, looks sick. The floor is clean.',
    );
  });

  test('says the bunny is sleeping', () => {
    const bunny = makeBunny({ asleep: true, adultVariant: 'fluffy' });
    expect(describeScene(bunny, adultTime)).toBe('Clover, an adult bunny, is sleeping. The floor is clean.');
  });

  test('describes the adventure while away', () => {
    const bunny = makeBunny({ adventure: { id: 'garden-stroll', startedAt: teenTime, endsAt: teenTime + HOUR_MS } });
    expect(describeScene(bunny, teenTime)).toBe('Clover is on Garden Stroll, wearing the flower crown and looking happy.');
  });
});

describe('sceneViewOf', () => {
  test('builds the view from the bunny', () => {
    const bunny = makeBunny({
      needs: { hunger: 10, happiness: 0, cleanliness: 0, energy: 50 },
      depressed: true,
      adultVariant: 'scruffy',
      equippedOutfit: 'suit',
      wardrobe: ['suit'],
    });
    expect(sceneViewOf(bunny, adultTime)).toEqual({
      body: 'adult-scruffy',
      mood: 'sad',
      outfit: 'suit',
      droppings: 4,
      asleep: false,
      depressed: true,
      adventure: null,
    });
  });

  test('shows the bunny happy in the reward outfit during an adventure', () => {
    const bunny = makeBunny({
      adventure: { id: 'beach-day', startedAt: teenTime, endsAt: teenTime + HOUR_MS },
      needs: { hunger: 30, happiness: 30, cleanliness: 30, energy: 30 },
      wardrobe: ['suit'],
      equippedOutfit: 'suit',
    });
    expect(sceneViewOf(bunny, teenTime)).toMatchObject({ body: 'teen', mood: 'happy', outfit: 'sun-hat', adventure: 'beach-day' });
  });
});
