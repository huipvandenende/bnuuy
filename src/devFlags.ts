import { getBrowserStorage } from './browserStorage';
import { DEV_FORCE_SUNDAY_KEY } from './game/storage';

const storage = getBrowserStorage();

export function isSundayForced(): boolean {
  try {
    return storage?.getItem(DEV_FORCE_SUNDAY_KEY) === '1';
  } catch {
    return false;
  }
}

export function setSundayForced(on: boolean): void {
  try {
    if (on) storage?.setItem(DEV_FORCE_SUNDAY_KEY, '1');
    else storage?.removeItem(DEV_FORCE_SUNDAY_KEY);
  } catch {}
}
