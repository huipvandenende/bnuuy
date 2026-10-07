import { getAdventure } from './catalog';
import {
  ADULT_AGE_MS,
  ASLEEP_DROP_FACTOR,
  CLEANLINESS_DROP_PER_MS,
  DEPRESSED_AFTER_ZERO_MS,
  DEPRESSION_ENDS_ABOVE_HAPPINESS,
  ENERGY_DROP_PER_MS,
  ENERGY_REFILL_PER_MS,
  HAPPINESS_DROP_PER_MS,
  HUNGER_DROP_PER_MS,
  MAX_STEP_MS,
  NEED_MAX,
  SICK_AFTER_ZERO_MS,
  TEEN_AGE_MS,
} from './constants';
import { adultVariantFromCare, stageAt } from './stage';
import type { Adventure, Bunny, GameState } from './types';

const SNAP_DISTANCE = 1e-9;

export function advance(state: GameState, now: number): GameState {
  if (!state.bunny) return state;
  if (now < state.bunny.lastUpdatedAt) return { ...state, bunny: { ...state.bunny, lastUpdatedAt: now } };

  const bunny = structuredClone(state.bunny);
  let stepStart = bunny.lastUpdatedAt;
  let nextFullStep = stepStart + MAX_STEP_MS;
  while (stepStart < now) {
    const stepEnd = Math.min(nextFullStep, now, ...upcomingBoundaries(bunny, stepStart));
    simulateStep(bunny, stepStart, stepEnd);
    if (stepEnd === nextFullStep) nextFullStep += MAX_STEP_MS;
    stepStart = stepEnd;
  }
  bunny.lastUpdatedAt = now;
  return { ...state, bunny };
}

function upcomingBoundaries(bunny: Bunny, after: number): number[] {
  const boundaries = [bunny.adoptedAt + TEEN_AGE_MS, bunny.adoptedAt + ADULT_AGE_MS];
  if (bunny.adventure) boundaries.push(bunny.adventure.endsAt);
  return boundaries.filter((time) => time > after);
}

function simulateStep(bunny: Bunny, start: number, end: number): void {
  const dt = end - start;
  if (!bunny.adventure) {
    updateNeeds(bunny, dt);
    updateConditions(bunny, dt);
    if (stageAt(bunny, start) !== 'adult') addCare(bunny, dt);
  }

  if (end === bunny.adoptedAt + TEEN_AGE_MS && bunny.adultVariant === null) {
    bunny.events.push({ type: 'grew-up', stage: 'teen' });
  }
  if (end === bunny.adoptedAt + ADULT_AGE_MS && bunny.adultVariant === null) {
    const variant = adultVariantFromCare(bunny.care);
    bunny.adultVariant = variant;
    bunny.events.push({ type: 'grew-up', stage: 'adult', variant });
  }
  if (bunny.adventure && end >= bunny.adventure.endsAt) {
    finishAdventure(bunny, bunny.adventure);
  }
}

function updateNeeds(bunny: Bunny, dt: number): void {
  const { needs } = bunny;
  const dropFactor = bunny.asleep ? ASLEEP_DROP_FACTOR : 1;
  needs.hunger = toNeedRange(needs.hunger - HUNGER_DROP_PER_MS * dropFactor * dt);
  needs.happiness = toNeedRange(needs.happiness - HAPPINESS_DROP_PER_MS * dropFactor * dt);
  needs.cleanliness = toNeedRange(needs.cleanliness - CLEANLINESS_DROP_PER_MS * dropFactor * dt);

  if (bunny.asleep) {
    needs.energy = toNeedRange(needs.energy + ENERGY_REFILL_PER_MS * dt);
    if (needs.energy === NEED_MAX) bunny.asleep = false;
  } else {
    needs.energy = toNeedRange(needs.energy - ENERGY_DROP_PER_MS * dt);
    if (needs.energy === 0) bunny.asleep = true;
  }
}

function toNeedRange(value: number): number {
  if (value <= SNAP_DISTANCE) return 0;
  if (value >= NEED_MAX - SNAP_DISTANCE) return NEED_MAX;
  return value;
}

function updateConditions(bunny: Bunny, dt: number): void {
  const { needs, zeroMs } = bunny;
  zeroMs.hunger = needs.hunger === 0 ? zeroMs.hunger + dt : 0;
  zeroMs.cleanliness = needs.cleanliness === 0 ? zeroMs.cleanliness + dt : 0;
  zeroMs.happiness = needs.happiness === 0 ? zeroMs.happiness + dt : 0;

  if (zeroMs.hunger >= SICK_AFTER_ZERO_MS || zeroMs.cleanliness >= SICK_AFTER_ZERO_MS) bunny.sick = true;
  if (zeroMs.happiness >= DEPRESSED_AFTER_ZERO_MS) bunny.depressed = true;
  if (needs.happiness > DEPRESSION_ENDS_ABOVE_HAPPINESS) bunny.depressed = false;
}

function addCare(bunny: Bunny, dt: number): void {
  const { hunger, happiness, cleanliness, energy } = bunny.needs;
  const average = (hunger + happiness + cleanliness + energy) / 4;
  bunny.care.weightedSum += average * dt;
  bunny.care.durationMs += dt;
}

function finishAdventure(bunny: Bunny, adventure: Adventure): void {
  const { outfitId } = getAdventure(adventure.id);
  const foundNewOutfit = !bunny.wardrobe.includes(outfitId);
  if (foundNewOutfit) {
    bunny.wardrobe.push(outfitId);
    bunny.equippedOutfit = outfitId;
  } else {
    bunny.needs.happiness = NEED_MAX;
  }
  bunny.events.push({ type: 'returned', adventureId: adventure.id, outfitFound: foundNewOutfit ? outfitId : null });
  if (!bunny.completedAdventures.includes(adventure.id)) bunny.completedAdventures.push(adventure.id);
  bunny.adventure = null;
}
