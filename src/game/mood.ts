import { CLEANLINESS_PER_DROPPING, HAPPY_NEEDS_AT_LEAST, LOW_NEED_BELOW, MAX_DROPPINGS, NEED_MAX } from './constants';
import type { Bunny, Mood } from './types';

export function moodOf(bunny: Bunny): Mood {
  const { hunger, happiness, cleanliness, energy } = bunny.needs;
  const needs = [hunger, happiness, cleanliness, energy];
  if (bunny.asleep) return 'sleeping';
  if (bunny.sick) return 'sick';
  if (bunny.depressed || needs.some((value) => value < LOW_NEED_BELOW)) return 'sad';
  if (needs.every((value) => value >= HAPPY_NEEDS_AT_LEAST)) return 'happy';
  return 'content';
}

export function droppingsCount(cleanliness: number): number {
  const count = Math.floor((NEED_MAX - cleanliness) / CLEANLINESS_PER_DROPPING);
  return Math.max(0, Math.min(MAX_DROPPINGS, count));
}
