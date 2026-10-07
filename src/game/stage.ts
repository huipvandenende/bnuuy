import { ADULT_AGE_MS, FLUFFY_MIN_CARE, NORMAL_MIN_CARE, TEEN_AGE_MS } from './constants';
import type { AdultVariant, Bunny, Stage } from './types';

export function ageMs(bunny: Bunny, now: number): number {
  return now - bunny.adoptedAt;
}

export function stageAt(bunny: Bunny, now: number): Stage {
  const age = ageMs(bunny, now);
  if (age >= ADULT_AGE_MS) return 'adult';
  if (age >= TEEN_AGE_MS) return 'teen';
  return 'baby';
}

export function careScore(care: Bunny['care']): number | null {
  return care.durationMs === 0 ? null : care.weightedSum / care.durationMs;
}

export function adultVariantFromCare(care: Bunny['care']): AdultVariant {
  const score = careScore(care);
  if (score === null) return 'normal';
  if (score >= FLUFFY_MIN_CARE) return 'fluffy';
  if (score >= NORMAL_MIN_CARE) return 'normal';
  return 'scruffy';
}
