const PROBE_KEY = 'bnuuy:probe';

export function getBrowserStorage(): Storage | null {
  try {
    const storage = window.localStorage;
    storage.setItem(PROBE_KEY, '1');
    storage.removeItem(PROBE_KEY);
    return storage;
  } catch {
    return null;
  }
}
