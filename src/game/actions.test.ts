import { describe, expect, test } from 'vitest';
import {
  adopt,
  adventureBlocker,
  applyAction,
  clean,
  dismissEvent,
  equip,
  feed,
  loadState,
  medicine,
  play,
  setSound,
  sleep,
  startAdventure,
  startOver,
  unequip,
  wake,
} from './actions';
import { DAY_MS, HOUR_MS } from './constants';
import { advance } from './simulate';
import { makeBunny, makeState, stateWith, T0 } from './testHelpers';
import type { ActionOutcome, GameAction, GameState } from './types';

const TEEN_ADOPTED_AT = T0 - 2 * DAY_MS;
const away = { adoptedAt: TEEN_ADOPTED_AT, adventure: { id: 'space-mission' as const, startedAt: T0, endsAt: T0 + 12 * HOUR_MS } };

function refused(outcome: ActionOutcome) {
  return outcome.result === 'ok' ? null : outcome.result.refused;
}

function expectRefused(outcome: ActionOutcome, before: GameState, reason: string) {
  expect(outcome.result).toEqual({ refused: reason });
  expect(outcome.state).toEqual(before);
}

describe('adopt', () => {
  test('creates a bunny with a trimmed name and full needs', () => {
    const outcome = adopt(makeState(null, true), T0, '  Clover  ');
    expect(outcome.result).toBe('ok');
    expect(outcome.state).toEqual(makeState(makeBunny({ name: 'Clover', adoptedAt: T0, lastUpdatedAt: T0 }), true));
  });

  test('refused when a bunny exists, even with an invalid name', () => {
    expect(refused(adopt(makeState(), T0, 'Bun'))).toBe('has-bunny');
    expect(refused(adopt(makeState(), T0, ''))).toBe('has-bunny');
  });

  test('refused with an invalid name', () => {
    const state = makeState(null);
    expectRefused(adopt(state, T0, '   '), state, 'invalid-name');
    expect(refused(adopt(state, T0, 'a'.repeat(17)))).toBe('invalid-name');
  });
});

describe('actions without a bunny', () => {
  const actions: GameAction[] = [
    { type: 'feed' },
    { type: 'play' },
    { type: 'clean' },
    { type: 'sleep' },
    { type: 'wake' },
    { type: 'medicine' },
    { type: 'startAdventure', id: 'garden-stroll' },
    { type: 'equip', outfitId: 'sun-hat' },
    { type: 'unequip' },
    { type: 'dismissEvent' },
  ];

  test.each(actions)('$type is refused with no-bunny', (action) => {
    const state = makeState(null);
    expectRefused(applyAction(state, action, T0), state, 'no-bunny');
  });
});

describe('every action advances first', () => {
  test('feed applies to the needs at the current time', () => {
    const outcome = feed(stateWith({ needs: { hunger: 50 } }), T0 + HOUR_MS);
    expect(outcome.state.bunny!.lastUpdatedAt).toBe(T0 + HOUR_MS);
    expect(outcome.state.bunny!.needs.hunger).toBeCloseTo(67.5, 9);
  });

  test('a refusal returns the advanced state', () => {
    const state = makeState();
    const outcome = sleep(state, T0 + HOUR_MS);
    expectRefused(outcome, advance(state, T0 + HOUR_MS), 'not-sleepy');
  });

  test('actions do not mutate the input state', () => {
    const state = stateWith({ needs: { hunger: 10, energy: 50 }, sick: true, wardrobe: ['suit'], events: [{ type: 'grew-up', stage: 'teen' }] });
    const copy = structuredClone(state);
    for (const action of [feed, play, clean, medicine, sleep, dismissEvent, unequip]) action(state, T0);
    equip(state, T0, 'suit');
    expect(state).toEqual(copy);
  });
});

describe('feed', () => {
  test('adds 30 hunger and resets the hunger zero timer', () => {
    const outcome = feed(stateWith({ needs: { hunger: 0 }, zeroMs: { hunger: HOUR_MS, cleanliness: 5, happiness: 6 } }), T0);
    expect(outcome.result).toBe('ok');
    expect(outcome.state.bunny!.needs.hunger).toBe(30);
    expect(outcome.state.bunny!.zeroMs).toEqual({ hunger: 0, cleanliness: 5, happiness: 6 });
  });

  test('works at hunger 89 and stops at 100', () => {
    const outcome = feed(stateWith({ needs: { hunger: 89 } }), T0);
    expect(outcome.result).toBe('ok');
    expect(outcome.state.bunny!.needs.hunger).toBe(100);
  });

  test('refused at hunger 90', () => {
    const state = stateWith({ needs: { hunger: 90 } });
    expectRefused(feed(state, T0), state, 'full');
  });

  test('refused while away or asleep', () => {
    expect(refused(feed(stateWith({ ...away, needs: { hunger: 10 } }), T0))).toBe('away');
    expect(refused(feed(stateWith({ asleep: true, needs: { hunger: 10, energy: 10 } }), T0))).toBe('asleep');
  });
});

describe('play', () => {
  test('adds 25 happiness, costs 10 energy and resets the happiness zero timer', () => {
    const outcome = play(stateWith({ needs: { happiness: 0, energy: 10 }, zeroMs: { hunger: 5, cleanliness: 6, happiness: HOUR_MS } }), T0);
    expect(outcome.result).toBe('ok');
    expect(outcome.state.bunny!.needs).toEqual({ hunger: 100, happiness: 25, cleanliness: 100, energy: 0 });
    expect(outcome.state.bunny!.zeroMs).toEqual({ hunger: 5, cleanliness: 6, happiness: 0 });
  });

  test('happiness stops at 100', () => {
    expect(play(stateWith({ needs: { happiness: 90 } }), T0).state.bunny!.needs.happiness).toBe(100);
  });

  test('refused at energy 9', () => {
    const state = stateWith({ needs: { energy: 9 } });
    expectRefused(play(state, T0), state, 'tired');
  });

  test('ends depression only above 50 happiness', () => {
    expect(play(stateWith({ depressed: true, needs: { happiness: 25 } }), T0).state.bunny!.depressed).toBe(true);
    expect(play(stateWith({ depressed: true, needs: { happiness: 25.1 } }), T0).state.bunny!.depressed).toBe(false);
  });

  test('refused while away or asleep', () => {
    expect(refused(play(stateWith(away), T0))).toBe('away');
    expect(refused(play(stateWith({ asleep: true, needs: { energy: 50 } }), T0))).toBe('asleep');
  });
});

describe('clean', () => {
  test('sets cleanliness to 100 and resets its zero timer', () => {
    const outcome = clean(stateWith({ needs: { cleanliness: 0 }, zeroMs: { hunger: 5, cleanliness: HOUR_MS, happiness: 6 } }), T0);
    expect(outcome.result).toBe('ok');
    expect(outcome.state.bunny!.needs.cleanliness).toBe(100);
    expect(outcome.state.bunny!.zeroMs).toEqual({ hunger: 5, cleanliness: 0, happiness: 6 });
  });

  test('refused while away or asleep', () => {
    expect(refused(clean(stateWith(away), T0))).toBe('away');
    expect(refused(clean(stateWith({ asleep: true, needs: { energy: 50 } }), T0))).toBe('asleep');
  });
});

describe('sleep', () => {
  test('falls asleep at energy 89', () => {
    const outcome = sleep(stateWith({ needs: { energy: 89 } }), T0);
    expect(outcome.result).toBe('ok');
    expect(outcome.state.bunny!.asleep).toBe(true);
  });

  test('refused at energy 90', () => {
    const state = stateWith({ needs: { energy: 90 } });
    expectRefused(sleep(state, T0), state, 'not-sleepy');
  });

  test('refused while away or already asleep', () => {
    expect(refused(sleep(stateWith({ ...away, needs: { energy: 10 } }), T0))).toBe('away');
    expect(refused(sleep(stateWith({ asleep: true, needs: { energy: 10 } }), T0))).toBe('asleep');
  });
});

describe('wake', () => {
  test('wakes a sleeping bunny', () => {
    const outcome = wake(stateWith({ asleep: true, needs: { energy: 50 } }), T0);
    expect(outcome.result).toBe('ok');
    expect(outcome.state.bunny!.asleep).toBe(false);
  });

  test('refused when awake or away', () => {
    expect(refused(wake(makeState(), T0))).toBe('awake');
    expect(refused(wake(stateWith(away), T0))).toBe('away');
  });
});

describe('medicine', () => {
  test('cures sickness and resets the hunger and cleanliness zero timers', () => {
    const outcome = medicine(
      stateWith({ sick: true, needs: { hunger: 0, cleanliness: 0 }, zeroMs: { hunger: 3 * HOUR_MS, cleanliness: 2 * HOUR_MS, happiness: HOUR_MS } }),
      T0,
    );
    expect(outcome.result).toBe('ok');
    expect(outcome.state.bunny!.sick).toBe(false);
    expect(outcome.state.bunny!.zeroMs).toEqual({ hunger: 0, cleanliness: 0, happiness: HOUR_MS });
  });

  test('refused when not sick', () => {
    const state = makeState();
    expectRefused(medicine(state, T0), state, 'not-sick');
  });

  test('refused while away or asleep', () => {
    expect(refused(medicine(stateWith({ ...away, sick: true }), T0))).toBe('away');
    expect(refused(medicine(stateWith({ asleep: true, sick: true, needs: { energy: 50 } }), T0))).toBe('asleep');
  });
});

describe('startAdventure', () => {
  test('starts the adventure for a teen', () => {
    const outcome = startAdventure(stateWith({ adoptedAt: TEEN_ADOPTED_AT }), T0, 'beach-day');
    expect(outcome.result).toBe('ok');
    expect(outcome.state.bunny!.adventure).toEqual({ id: 'beach-day', startedAt: T0, endsAt: T0 + 2 * HOUR_MS });
  });

  test.each([
    ['away', away],
    ['baby', {}],
    ['asleep', { adoptedAt: TEEN_ADOPTED_AT, asleep: true, needs: { energy: 50 } }],
    ['sick', { adoptedAt: TEEN_ADOPTED_AT, sick: true }],
    ['depressed', { adoptedAt: TEEN_ADOPTED_AT, depressed: true, needs: { happiness: 10 } }],
  ])('refused when %s', (reason, overrides) => {
    const state = stateWith(overrides);
    expectRefused(startAdventure(state, T0, 'garden-stroll'), state, reason);
  });
});

describe('adventureBlocker', () => {
  test('is null for a healthy teen at home', () => {
    expect(adventureBlocker(makeBunny({ adoptedAt: TEEN_ADOPTED_AT }), T0)).toBeNull();
  });

  test('checks away, baby, asleep, sick and depressed in that order', () => {
    const all = { asleep: true, sick: true, depressed: true };
    expect(adventureBlocker(makeBunny({ ...all, adventure: away.adventure }), T0)).toBe('away');
    expect(adventureBlocker(makeBunny(all), T0)).toBe('baby');
    expect(adventureBlocker(makeBunny({ ...all, adoptedAt: TEEN_ADOPTED_AT }), T0)).toBe('asleep');
    expect(adventureBlocker(makeBunny({ sick: true, depressed: true, adoptedAt: TEEN_ADOPTED_AT }), T0)).toBe('sick');
  });

  test('a baby becomes a teen at 24 hours', () => {
    const bunny = makeBunny({ adoptedAt: T0 });
    expect(adventureBlocker(bunny, T0 + 24 * HOUR_MS - 1)).toBe('baby');
    expect(adventureBlocker(bunny, T0 + 24 * HOUR_MS)).toBeNull();
  });
});

describe('equip and unequip', () => {
  const dresser = { adoptedAt: TEEN_ADOPTED_AT, wardrobe: ['sun-hat' as const, 'suit' as const], equippedOutfit: 'sun-hat' as const };

  test('equips an owned outfit', () => {
    const outcome = equip(stateWith(dresser), T0, 'suit');
    expect(outcome.result).toBe('ok');
    expect(outcome.state.bunny!.equippedOutfit).toBe('suit');
  });

  test('equips while asleep', () => {
    expect(equip(stateWith({ ...dresser, asleep: true, needs: { energy: 50 } }), T0, 'suit').result).toBe('ok');
  });

  test('refuses an outfit that is not owned', () => {
    const state = stateWith(dresser);
    expectRefused(equip(state, T0, 'pirate-hat'), state, 'not-owned');
  });

  test('refuses equipping while away', () => {
    expect(refused(equip(stateWith({ ...dresser, ...away }), T0, 'suit'))).toBe('away');
  });

  test('unequip removes the outfit', () => {
    const outcome = unequip(stateWith(dresser), T0);
    expect(outcome.result).toBe('ok');
    expect(outcome.state.bunny!.equippedOutfit).toBeNull();
    expect(outcome.state.bunny!.wardrobe).toEqual(dresser.wardrobe);
  });

  test('refuses unequipping while away', () => {
    expect(refused(unequip(stateWith({ ...dresser, ...away }), T0))).toBe('away');
  });
});

describe('dismissEvent', () => {
  test('removes the first event', () => {
    const outcome = dismissEvent(
      stateWith({
        events: [
          { type: 'grew-up', stage: 'teen' },
          { type: 'returned', adventureId: 'garden-stroll', outfitFound: 'flower-crown' },
        ],
      }),
      T0,
    );
    expect(outcome.result).toBe('ok');
    expect(outcome.state.bunny!.events).toEqual([{ type: 'returned', adventureId: 'garden-stroll', outfitFound: 'flower-crown' }]);
  });

  test('refused when there are no events', () => {
    const state = makeState();
    expectRefused(dismissEvent(state, T0), state, 'no-event');
  });
});

describe('startOver', () => {
  test('removes the bunny and keeps the settings', () => {
    expect(startOver(makeState(makeBunny(), true), T0)).toEqual({ state: makeState(null, true), result: 'ok' });
  });

  test('works without a bunny', () => {
    expect(startOver(makeState(null), T0).result).toBe('ok');
  });
});

describe('setSound', () => {
  test('turns sound on and off', () => {
    const on = setSound(makeState(null), T0, true);
    expect(on).toEqual({ state: makeState(null, true), result: 'ok' });
    expect(setSound(on.state, T0, false).state.settings.soundOn).toBe(false);
  });
});

describe('loadState', () => {
  test('replaces the state and advances it to now', () => {
    const loaded = stateWith({ name: 'Pip', lastUpdatedAt: T0 - HOUR_MS });
    const outcome = loadState(makeState(), T0, loaded);
    expect(outcome.result).toBe('ok');
    expect(outcome.state).toEqual(advance(loaded, T0));
    expect(outcome.state.bunny!.name).toBe('Pip');
    expect(outcome.state.bunny!.lastUpdatedAt).toBe(T0);
  });

  test('rejects an invalid state and keeps the current one', () => {
    const current = makeState();
    const loaded = stateWith({ needs: { hunger: 150 } });
    expectRefused(loadState(current, T0 + HOUR_MS, loaded), advance(current, T0 + HOUR_MS), 'invalid-state');
  });
});

describe('applyAction', () => {
  test('dispatches to the matching action', () => {
    const state = stateWith({ adoptedAt: TEEN_ADOPTED_AT, needs: { hunger: 50, energy: 50 }, wardrobe: ['suit'] });
    const cases: [GameAction, ActionOutcome][] = [
      [{ type: 'adopt', name: 'Pip' }, adopt(state, T0, 'Pip')],
      [{ type: 'feed' }, feed(state, T0)],
      [{ type: 'play' }, play(state, T0)],
      [{ type: 'clean' }, clean(state, T0)],
      [{ type: 'sleep' }, sleep(state, T0)],
      [{ type: 'wake' }, wake(state, T0)],
      [{ type: 'medicine' }, medicine(state, T0)],
      [{ type: 'startAdventure', id: 'office-job' }, startAdventure(state, T0, 'office-job')],
      [{ type: 'equip', outfitId: 'suit' }, equip(state, T0, 'suit')],
      [{ type: 'unequip' }, unequip(state, T0)],
      [{ type: 'dismissEvent' }, dismissEvent(state, T0)],
      [{ type: 'startOver' }, startOver(state, T0)],
      [{ type: 'setSound', on: true }, setSound(state, T0, true)],
      [{ type: 'loadState', state: makeState(null) }, loadState(state, T0, makeState(null))],
    ];
    for (const [action, expected] of cases) expect(applyAction(state, action, T0)).toEqual(expected);
  });
});
