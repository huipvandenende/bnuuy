import { describe, expect, test } from 'vitest';
import { getAdventure } from './catalog';
import { ADULT_AGE_MS, DAY_MS, HOUR_MS, MINUTE_MS, TEEN_AGE_MS } from './constants';
import { advance } from './simulate';
import { makeBunny, makeState, stateWith, T0 } from './testHelpers';
import type { AdventureId, Bunny, GameState } from './types';

type Overrides = Parameters<typeof stateWith>[0];

function run(state: GameState, ms: number): GameState {
  return advance(state, state.bunny!.lastUpdatedAt + ms);
}

function bunnyAfter(overrides: Overrides, ms: number): Bunny {
  return run(stateWith(overrides), ms).bunny!;
}

function onAdventure(id: AdventureId, startedAt: number) {
  return { id, startedAt, endsAt: startedAt + getAdventure(id).durationMs };
}

const TEEN_ADOPTED_AT = T0 - 2 * DAY_MS;

describe('advance basics', () => {
  test('returns the same state when there is no bunny', () => {
    const state = makeState(null);
    expect(advance(state, T0 + HOUR_MS)).toBe(state);
  });

  test('sets lastUpdatedAt to now', () => {
    expect(bunnyAfter({}, 90_500).lastUpdatedAt).toBe(T0 + 90_500);
  });

  test('changes nothing when no time passed', () => {
    const state = stateWith({ needs: { hunger: 40 } });
    expect(advance(state, T0)).toEqual(state);
  });

  test('does not mutate the input state', () => {
    const state = stateWith({ adventure: onAdventure('garden-stroll', T0), adoptedAt: TEEN_ADOPTED_AT });
    const copy = structuredClone(state);
    advance(state, T0 + 3 * DAY_MS);
    expect(state).toEqual(copy);
  });

  test('a clock moving backwards changes only lastUpdatedAt', () => {
    const state = stateWith({
      needs: { hunger: 10, happiness: 20 },
      zeroMs: { hunger: 0, cleanliness: 0, happiness: 5 * MINUTE_MS },
      adoptedAt: TEEN_ADOPTED_AT,
      adventure: onAdventure('beach-day', T0 - HOUR_MS),
    });
    expect(advance(state, T0 - 3 * HOUR_MS)).toEqual({
      ...state,
      bunny: { ...state.bunny, lastUpdatedAt: T0 - 3 * HOUR_MS },
    });
  });
});

describe('awake decay', () => {
  test('exact needs after 1 hour', () => {
    const { needs, asleep } = bunnyAfter({}, HOUR_MS);
    expect(needs.hunger).toBeCloseTo(87.5, 9);
    expect(needs.happiness).toBeCloseTo(100 - 100 / 12, 9);
    expect(needs.cleanliness).toBeCloseTo(100 - 100 / 12, 9);
    expect(needs.energy).toBeCloseTo(93.75, 9);
    expect(asleep).toBe(false);
  });

  test('exact needs after 8 hours', () => {
    const { needs } = bunnyAfter({}, 8 * HOUR_MS);
    expect(needs.hunger).toBe(0);
    expect(needs.happiness).toBeCloseTo(100 / 3, 9);
    expect(needs.cleanliness).toBeCloseTo(100 / 3, 9);
    expect(needs.energy).toBeCloseTo(50, 9);
  });

  test('needs are clamped at 0', () => {
    const { needs } = bunnyAfter({ needs: { hunger: 5, cleanliness: 1 } }, 10 * HOUR_MS);
    expect(needs.hunger).toBe(0);
    expect(needs.cleanliness).toBe(0);
  });
});

describe('sleep', () => {
  test('other needs drop at half rate and energy refills', () => {
    const { needs, asleep } = bunnyAfter({ asleep: true, needs: { energy: 0 } }, HOUR_MS);
    expect(needs.hunger).toBeCloseTo(93.75, 9);
    expect(needs.happiness).toBeCloseTo(100 - 100 / 24, 9);
    expect(needs.cleanliness).toBeCloseTo(100 - 100 / 24, 9);
    expect(needs.energy).toBeCloseTo(12.5, 9);
    expect(asleep).toBe(true);
  });

  test('wakes up by itself when energy reaches 100', () => {
    const sleepy = { asleep: true, needs: { energy: 50 } };
    expect(bunnyAfter(sleepy, 4 * HOUR_MS - MINUTE_MS).asleep).toBe(true);
    const woken = bunnyAfter(sleepy, 4 * HOUR_MS);
    expect(woken.asleep).toBe(false);
    expect(woken.needs.energy).toBe(100);
  });

  test('needs drop at the awake rate after waking up', () => {
    const { needs, asleep } = bunnyAfter({ asleep: true, needs: { energy: 87.5 } }, 2 * HOUR_MS);
    expect(asleep).toBe(false);
    expect(needs.hunger).toBeCloseTo(100 - 6.25 - 12.5, 9);
    expect(needs.energy).toBeCloseTo(93.75, 9);
  });

  test('falls asleep by itself when energy reaches 0', () => {
    const tired = { needs: { energy: 6.25 } };
    expect(bunnyAfter(tired, HOUR_MS - MINUTE_MS).asleep).toBe(false);
    const asleep = bunnyAfter(tired, HOUR_MS);
    expect(asleep.asleep).toBe(true);
    expect(asleep.needs.energy).toBe(0);
  });

  test('energy refills after falling asleep', () => {
    const { needs, asleep } = bunnyAfter({ needs: { energy: 6.25 } }, 2 * HOUR_MS);
    expect(asleep).toBe(true);
    expect(needs.energy).toBeCloseTo(12.5, 9);
  });
});

describe('sickness', () => {
  test.each(['hunger', 'cleanliness'] as const)('sick after exactly 2 hours at zero %s', (need) => {
    const bunny = bunnyAfter({ needs: { [need]: 0 } }, 2 * HOUR_MS);
    expect(bunny.sick).toBe(true);
    expect(bunny.zeroMs[need]).toBe(2 * HOUR_MS);
  });

  test.each(['hunger', 'cleanliness'] as const)('not sick after 1 h 59 min at zero %s', (need) => {
    const bunny = bunnyAfter({ needs: { [need]: 0 } }, 2 * HOUR_MS - MINUTE_MS);
    expect(bunny.sick).toBe(false);
    expect(bunny.zeroMs[need]).toBe(2 * HOUR_MS - MINUTE_MS);
  });

  test('the zero timer resets when the need is above zero', () => {
    const bunny = bunnyAfter({ zeroMs: { hunger: HOUR_MS, cleanliness: HOUR_MS, happiness: HOUR_MS } }, MINUTE_MS);
    expect(bunny.zeroMs).toEqual({ hunger: 0, cleanliness: 0, happiness: 0 });
  });

  test('sickness does not end by itself', () => {
    expect(bunnyAfter({ sick: true }, HOUR_MS).sick).toBe(true);
  });
});

describe('depression', () => {
  test('depressed after 2 hours at zero happiness', () => {
    expect(bunnyAfter({ needs: { happiness: 0 } }, 2 * HOUR_MS).depressed).toBe(true);
  });

  test('not depressed after 1 h 59 min at zero happiness', () => {
    expect(bunnyAfter({ needs: { happiness: 0 } }, 2 * HOUR_MS - MINUTE_MS).depressed).toBe(false);
  });

  test('ends when happiness is above 50', () => {
    expect(bunnyAfter({ depressed: true, needs: { happiness: 80 } }, MINUTE_MS).depressed).toBe(false);
  });

  test('stays while happiness is 50 or less', () => {
    expect(bunnyAfter({ depressed: true, needs: { happiness: 50 } }, MINUTE_MS).depressed).toBe(true);
  });
});

describe('care', () => {
  test('adds the average of the needs after the step', () => {
    const { care, needs } = bunnyAfter({}, MINUTE_MS);
    const average = (needs.hunger + needs.happiness + needs.cleanliness + needs.energy) / 4;
    expect(care.durationMs).toBe(MINUTE_MS);
    expect(care.weightedSum).toBeCloseTo(average * MINUTE_MS, 6);
  });

  test('is not counted while away', () => {
    const care = { weightedSum: 1234, durationMs: 56 };
    const bunny = bunnyAfter({ adoptedAt: TEEN_ADOPTED_AT, care, adventure: onAdventure('space-mission', T0) }, 6 * HOUR_MS);
    expect(bunny.care).toEqual(care);
  });

  test('is not counted for adults', () => {
    const care = { weightedSum: 1234, durationMs: 56 };
    expect(bunnyAfter({ adoptedAt: T0 - 5 * DAY_MS, care }, HOUR_MS).care).toEqual(care);
  });

  test('counts the step that ends on the adult birthday, then stops', () => {
    const bunny = bunnyAfter({ adoptedAt: T0 - ADULT_AGE_MS + MINUTE_MS }, 2 * MINUTE_MS);
    expect(bunny.care.durationMs).toBe(MINUTE_MS);
    expect(bunny.adultVariant).toBe('fluffy');
  });
});

describe('birthdays', () => {
  test('queues one teen event when crossing 24 hours', () => {
    expect(bunnyAfter({}, 30 * HOUR_MS).events).toEqual([{ type: 'grew-up', stage: 'teen' }]);
  });

  test('queues one teen event when crossing 24 hours in many small advances', () => {
    let state = stateWith({ adoptedAt: T0 - TEEN_AGE_MS + HOUR_MS });
    for (let time = T0; time <= T0 + 2 * HOUR_MS; time += 7 * MINUTE_MS) state = advance(state, time);
    expect(state.bunny!.events).toEqual([{ type: 'grew-up', stage: 'teen' }]);
  });

  test('queues teen then adult events and sets the adult variant once', () => {
    const bunny = bunnyAfter({}, 5 * DAY_MS);
    expect(bunny.adultVariant).not.toBeNull();
    expect(bunny.events).toEqual([
      { type: 'grew-up', stage: 'teen' },
      { type: 'grew-up', stage: 'adult', variant: bunny.adultVariant },
    ]);
  });

  test('does not grow up again after the clock moves back past a birthday', () => {
    const adult = advance(makeState(), T0 + 100 * HOUR_MS);
    const variant = adult.bunny!.adultVariant;
    const rewound = advance(advance(adult, T0 + 20 * HOUR_MS), T0 + 100 * HOUR_MS);
    expect(rewound.bunny!.events).toEqual(adult.bunny!.events);
    expect(rewound.bunny!.adultVariant).toBe(variant);
  });

  test('grows up while asleep', () => {
    const bunny = bunnyAfter({ adoptedAt: T0 - TEEN_AGE_MS + HOUR_MS, asleep: true, needs: { energy: 0 } }, 2 * HOUR_MS);
    expect(bunny.asleep).toBe(true);
    expect(bunny.events).toEqual([{ type: 'grew-up', stage: 'teen' }]);
  });

  test.each([
    [70, 'fluffy'],
    [69.9, 'normal'],
    [40, 'normal'],
    [39.9, 'scruffy'],
  ])('grows up while away with care score %d into %s', (score, variant) => {
    const care = { weightedSum: score * HOUR_MS, durationMs: HOUR_MS };
    const bunny = bunnyAfter(
      { adoptedAt: T0 - ADULT_AGE_MS + HOUR_MS, care, adventure: onAdventure('space-mission', T0) },
      2 * HOUR_MS,
    );
    expect(bunny.care).toEqual(care);
    expect(bunny.adultVariant).toBe(variant);
    expect(bunny.events).toEqual([{ type: 'grew-up', stage: 'adult', variant }]);
    expect(bunny.adventure).not.toBeNull();
  });
});

describe('adventures', () => {
  const teen = { adoptedAt: TEEN_ADOPTED_AT };

  test('needs, zero timers and conditions are paused while away', () => {
    const before = makeBunny({
      ...teen,
      needs: { hunger: 0, happiness: 0, cleanliness: 30, energy: 40 },
      zeroMs: { hunger: HOUR_MS, cleanliness: 0, happiness: HOUR_MS },
      adventure: onAdventure('space-mission', T0),
    });
    const after = run(makeState(before), 6 * HOUR_MS).bunny!;
    expect(after).toEqual({ ...before, lastUpdatedAt: T0 + 6 * HOUR_MS });
  });

  test('still away one minute before the end', () => {
    expect(bunnyAfter({ ...teen, adventure: onAdventure('garden-stroll', T0) }, HOUR_MS - MINUTE_MS).adventure).not.toBeNull();
  });

  test('first return adds the outfit, equips it and queues an event', () => {
    const bunny = bunnyAfter({ ...teen, needs: { happiness: 30 }, adventure: onAdventure('garden-stroll', T0) }, HOUR_MS);
    expect(bunny.adventure).toBeNull();
    expect(bunny.wardrobe).toEqual(['flower-crown']);
    expect(bunny.equippedOutfit).toBe('flower-crown');
    expect(bunny.completedAdventures).toEqual(['garden-stroll']);
    expect(bunny.events).toEqual([{ type: 'returned', adventureId: 'garden-stroll', outfitFound: 'flower-crown' }]);
    expect(bunny.needs.happiness).toBe(30);
  });

  test('first return replaces the outfit being worn', () => {
    const bunny = bunnyAfter(
      { ...teen, wardrobe: ['sun-hat'], equippedOutfit: 'sun-hat', adventure: onAdventure('garden-stroll', T0) },
      HOUR_MS,
    );
    expect(bunny.wardrobe).toEqual(['sun-hat', 'flower-crown']);
    expect(bunny.equippedOutfit).toBe('flower-crown');
  });

  test('repeat return fills happiness and finds no outfit', () => {
    const bunny = bunnyAfter(
      {
        ...teen,
        needs: { happiness: 30 },
        wardrobe: ['flower-crown'],
        completedAdventures: ['garden-stroll'],
        adventure: onAdventure('garden-stroll', T0),
      },
      HOUR_MS,
    );
    expect(bunny.needs.happiness).toBe(100);
    expect(bunny.wardrobe).toEqual(['flower-crown']);
    expect(bunny.equippedOutfit).toBeNull();
    expect(bunny.completedAdventures).toEqual(['garden-stroll']);
    expect(bunny.events).toEqual([{ type: 'returned', adventureId: 'garden-stroll', outfitFound: null }]);
  });

  test('needs drop again after the return', () => {
    const bunny = bunnyAfter({ ...teen, adventure: onAdventure('garden-stroll', T0) }, 2 * HOUR_MS);
    expect(bunny.needs.hunger).toBeCloseTo(87.5, 9);
  });

  test('an adventure that ended before lastUpdatedAt finishes on the next advance', () => {
    const bunny = bunnyAfter({ ...teen, adventure: { id: 'beach-day', startedAt: T0 - 3 * HOUR_MS, endsAt: T0 - HOUR_MS } }, 1);
    expect(bunny.adventure).toBeNull();
    expect(bunny.wardrobe).toEqual(['sun-hat']);
  });

  test('events are queued in the order they happen', () => {
    const adoptedAt = T0 - ADULT_AGE_MS + 2 * HOUR_MS;
    const bunny = bunnyAfter({ adoptedAt, adventure: onAdventure('garden-stroll', T0) }, 3 * HOUR_MS);
    expect(bunny.events.map((event) => event.type)).toEqual(['returned', 'grew-up']);
  });

  test('a birthday at the same instant as the return comes first', () => {
    const adoptedAt = T0 - ADULT_AGE_MS + HOUR_MS;
    const bunny = bunnyAfter({ adoptedAt, adventure: onAdventure('garden-stroll', T0) }, 3 * HOUR_MS);
    expect(bunny.events.map((event) => event.type)).toEqual(['grew-up', 'returned']);
  });
});

describe('catch-up', () => {
  test('one advance over 7 days equals many 10-minute advances', () => {
    const startedAt = T0 - 1234;
    const start = stateWith({
      adoptedAt: T0 - 30 * HOUR_MS - 12_345,
      needs: { hunger: 70, happiness: 55, cleanliness: 40, energy: 30 },
      care: { weightedSum: 60 * 30 * HOUR_MS, durationMs: 30 * HOUR_MS },
      adventure: onAdventure('office-job', startedAt),
    });
    const end = T0 + 7 * DAY_MS;

    let stepped = start;
    for (let time = T0 + 10 * MINUTE_MS; time <= end; time += 10 * MINUTE_MS) stepped = advance(stepped, time);
    const once = advance(start, end);

    expect(stepped).toEqual(once);
    expect(once.bunny!.lastUpdatedAt).toBe(end);
    expect(once.bunny!.sick).toBe(true);
    expect(once.bunny!.depressed).toBe(true);
    expect(once.bunny!.events.map((event) => event.type)).toEqual(['returned', 'grew-up']);
  });
});
