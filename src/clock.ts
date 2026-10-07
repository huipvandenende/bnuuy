import { getBrowserStorage } from './browserStorage';
import { DEV_OFFSET_KEY } from './game/storage';

export interface Clock {
  now(): number;
  getOffset(): number;
  addOffset(ms: number): void;
}

export function createClock(storage: Storage | null, systemNow: () => number = () => Date.now()): Clock {
  let memoryOffset = 0;
  const getOffset = () => readStoredOffset(storage) ?? memoryOffset;

  return {
    now: () => systemNow() + getOffset(),
    getOffset,
    addOffset(ms: number) {
      memoryOffset = getOffset() + ms;
      try {
        storage?.setItem(DEV_OFFSET_KEY, String(memoryOffset));
      } catch {}
    },
  };
}

function readStoredOffset(storage: Storage | null): number | null {
  try {
    const raw = storage?.getItem(DEV_OFFSET_KEY);
    if (raw === null || raw === undefined) return null;
    const offset = Number(raw);
    return Number.isFinite(offset) ? offset : null;
  } catch {
    return null;
  }
}

export const clock: Clock = createClock(getBrowserStorage());
