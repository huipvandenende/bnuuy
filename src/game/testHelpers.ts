import type { Bunny, GameState, Needs } from './types';

export const T0 = Date.UTC(2026, 0, 1);

type BunnyOverrides = Partial<Omit<Bunny, 'needs'>> & { needs?: Partial<Needs> };

export function makeBunny({ needs, ...rest }: BunnyOverrides = {}): Bunny {
  return {
    name: 'Clover',
    adoptedAt: T0,
    lastUpdatedAt: T0,
    needs: { hunger: 100, happiness: 100, cleanliness: 100, energy: 100, ...needs },
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
    ...rest,
  };
}

export function makeState(bunny: Bunny | null = makeBunny(), soundOn = false): GameState {
  return { version: 1, bunny, settings: { soundOn } };
}

export function stateWith(overrides: BunnyOverrides): GameState {
  return makeState(makeBunny(overrides));
}

export function createMemoryStorage(initial: Record<string, string> = {}): Storage {
  const items = new Map(Object.entries(initial));
  return {
    get length() {
      return items.size;
    },
    clear: () => items.clear(),
    getItem: (key: string) => items.get(key) ?? null,
    key: (index: number) => [...items.keys()][index] ?? null,
    removeItem: (key: string) => {
      items.delete(key);
    },
    setItem: (key: string, value: string) => {
      items.set(key, String(value));
    },
  };
}

export function createThrowingStorage(): Storage {
  const fail = () => {
    throw new Error('Storage is blocked');
  };
  return { length: 0, clear: fail, getItem: fail, key: fail, removeItem: fail, setItem: fail };
}
