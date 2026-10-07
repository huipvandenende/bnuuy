import { getAdventure } from './catalog';
import {
  DEPRESSION_ENDS_ABOVE_HAPPINESS,
  FEED_HUNGER,
  FEED_REFUSED_AT_HUNGER,
  NEED_MAX,
  PLAY_ENERGY_COST,
  PLAY_HAPPINESS,
  PLAY_REFUSED_BELOW_ENERGY,
  SLEEP_REFUSED_AT_ENERGY,
} from './constants';
import { advance } from './simulate';
import { stageAt } from './stage';
import type { ActionOutcome, AdventureId, Bunny, GameAction, GameState, OutfitId, RefusalReason } from './types';
import { isValidGameState, validateName } from './validate';

type BunnyChange = RefusalReason | Partial<Bunny>;

export function adopt(state: GameState, now: number, name: string): ActionOutcome {
  const advanced = advance(state, now);
  if (advanced.bunny) return refuse(advanced, 'has-bunny');
  const check = validateName(name);
  if (!check.ok) return refuse(advanced, 'invalid-name');
  return ok({ ...advanced, bunny: newBunny(check.name, now) });
}

export function feed(state: GameState, now: number): ActionOutcome {
  return changeBunny(state, now, (bunny) => {
    const blocker = homeAndAwakeBlocker(bunny);
    if (blocker) return blocker;
    if (bunny.needs.hunger >= FEED_REFUSED_AT_HUNGER) return 'full';
    return {
      needs: { ...bunny.needs, hunger: Math.min(NEED_MAX, bunny.needs.hunger + FEED_HUNGER) },
      zeroMs: { ...bunny.zeroMs, hunger: 0 },
    };
  });
}

export function play(state: GameState, now: number): ActionOutcome {
  return changeBunny(state, now, (bunny) => {
    const blocker = homeAndAwakeBlocker(bunny);
    if (blocker) return blocker;
    if (bunny.needs.energy < PLAY_REFUSED_BELOW_ENERGY) return 'tired';
    const happiness = Math.min(NEED_MAX, bunny.needs.happiness + PLAY_HAPPINESS);
    return {
      needs: { ...bunny.needs, happiness, energy: Math.max(0, bunny.needs.energy - PLAY_ENERGY_COST) },
      zeroMs: { ...bunny.zeroMs, happiness: 0 },
      depressed: bunny.depressed && happiness <= DEPRESSION_ENDS_ABOVE_HAPPINESS,
    };
  });
}

export function clean(state: GameState, now: number): ActionOutcome {
  return changeBunny(state, now, (bunny) => {
    const blocker = homeAndAwakeBlocker(bunny);
    if (blocker) return blocker;
    return {
      needs: { ...bunny.needs, cleanliness: NEED_MAX },
      zeroMs: { ...bunny.zeroMs, cleanliness: 0 },
    };
  });
}

export function sleep(state: GameState, now: number): ActionOutcome {
  return changeBunny(state, now, (bunny) => {
    const blocker = homeAndAwakeBlocker(bunny);
    if (blocker) return blocker;
    if (bunny.needs.energy >= SLEEP_REFUSED_AT_ENERGY) return 'not-sleepy';
    return { asleep: true };
  });
}

export function wake(state: GameState, now: number): ActionOutcome {
  return changeBunny(state, now, (bunny) => {
    if (bunny.adventure) return 'away';
    if (!bunny.asleep) return 'awake';
    return { asleep: false };
  });
}

export function medicine(state: GameState, now: number): ActionOutcome {
  return changeBunny(state, now, (bunny) => {
    const blocker = homeAndAwakeBlocker(bunny);
    if (blocker) return blocker;
    if (!bunny.sick) return 'not-sick';
    return { sick: false, zeroMs: { ...bunny.zeroMs, hunger: 0, cleanliness: 0 } };
  });
}

export function startAdventure(state: GameState, now: number, id: AdventureId): ActionOutcome {
  return changeBunny(state, now, (bunny) => {
    const blocker = adventureBlocker(bunny, now);
    if (blocker) return blocker;
    return { adventure: { id, startedAt: now, endsAt: now + getAdventure(id).durationMs } };
  });
}

export function equip(state: GameState, now: number, outfitId: OutfitId): ActionOutcome {
  return changeBunny(state, now, (bunny) => {
    if (bunny.adventure) return 'away';
    if (!bunny.wardrobe.includes(outfitId)) return 'not-owned';
    return { equippedOutfit: outfitId };
  });
}

export function unequip(state: GameState, now: number): ActionOutcome {
  return changeBunny(state, now, (bunny) => (bunny.adventure ? 'away' : { equippedOutfit: null }));
}

export function dismissEvent(state: GameState, now: number): ActionOutcome {
  return changeBunny(state, now, (bunny) => (bunny.events.length === 0 ? 'no-event' : { events: bunny.events.slice(1) }));
}

export function startOver(state: GameState, now: number): ActionOutcome {
  return ok({ ...advance(state, now), bunny: null });
}

export function setSound(state: GameState, now: number, on: boolean): ActionOutcome {
  return ok({ ...advance(state, now), settings: { ...state.settings, soundOn: on } });
}

export function loadState(state: GameState, now: number, loaded: GameState): ActionOutcome {
  if (!isValidGameState(loaded)) return refuse(advance(state, now), 'invalid-state');
  return ok(advance(loaded, now));
}

export function applyAction(state: GameState, action: GameAction, now: number): ActionOutcome {
  switch (action.type) {
    case 'adopt':
      return adopt(state, now, action.name);
    case 'feed':
      return feed(state, now);
    case 'play':
      return play(state, now);
    case 'clean':
      return clean(state, now);
    case 'sleep':
      return sleep(state, now);
    case 'wake':
      return wake(state, now);
    case 'medicine':
      return medicine(state, now);
    case 'startAdventure':
      return startAdventure(state, now, action.id);
    case 'equip':
      return equip(state, now, action.outfitId);
    case 'unequip':
      return unequip(state, now);
    case 'dismissEvent':
      return dismissEvent(state, now);
    case 'startOver':
      return startOver(state, now);
    case 'setSound':
      return setSound(state, now, action.on);
    case 'loadState':
      return loadState(state, now, action.state);
  }
}

export function adventureBlocker(bunny: Bunny, now: number): 'away' | 'baby' | 'asleep' | 'sick' | 'depressed' | null {
  if (bunny.adventure) return 'away';
  if (stageAt(bunny, now) === 'baby') return 'baby';
  if (bunny.asleep) return 'asleep';
  if (bunny.sick) return 'sick';
  if (bunny.depressed) return 'depressed';
  return null;
}

function homeAndAwakeBlocker(bunny: Bunny): 'away' | 'asleep' | null {
  if (bunny.adventure) return 'away';
  if (bunny.asleep) return 'asleep';
  return null;
}

function changeBunny(state: GameState, now: number, change: (bunny: Bunny) => BunnyChange): ActionOutcome {
  const advanced = advance(state, now);
  if (!advanced.bunny) return refuse(advanced, 'no-bunny');
  const result = change(advanced.bunny);
  if (typeof result === 'string') return refuse(advanced, result);
  return ok({ ...advanced, bunny: { ...advanced.bunny, ...result } });
}

function ok(state: GameState): ActionOutcome {
  return { state, result: 'ok' };
}

function refuse(state: GameState, reason: RefusalReason): ActionOutcome {
  return { state, result: { refused: reason } };
}

function newBunny(name: string, now: number): Bunny {
  return {
    name,
    adoptedAt: now,
    lastUpdatedAt: now,
    needs: { hunger: NEED_MAX, happiness: NEED_MAX, cleanliness: NEED_MAX, energy: NEED_MAX },
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
  };
}
