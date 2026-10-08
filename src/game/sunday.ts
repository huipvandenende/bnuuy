export function isSunday(now: number): boolean {
  return new Date(now).getDay() === 0;
}

export function isChurchDay(now: number, forced: boolean): boolean {
  return forced || isSunday(now);
}
