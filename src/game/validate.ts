import { ADVENTURE_IDS, OUTFIT_IDS, getAdventure } from './catalog';
import { NAME_MAX_LENGTH, NAME_MIN_LENGTH, NEED_MAX } from './constants';
import type { AdventureId, GameState } from './types';

export type NameCheck = { ok: true; name: string } | { ok: false };

const ADULT_VARIANTS = ['fluffy', 'normal', 'scruffy'];
const GROWN_UP_STAGES = ['teen', 'adult'];
const EARLIEST_TIME = Date.UTC(2020, 0, 1);
const LATEST_TIME = Date.UTC(2100, 0, 1);

export function validateName(raw: string): NameCheck {
  const name = raw.trim();
  const length = [...name].length;
  return length >= NAME_MIN_LENGTH && length <= NAME_MAX_LENGTH ? { ok: true, name } : { ok: false };
}

export function isValidGameState(value: unknown): value is GameState {
  return (
    isRecord(value) &&
    value.version === 1 &&
    isRecord(value.settings) &&
    typeof value.settings.soundOn === 'boolean' &&
    (value.bunny === null || isBunny(value.bunny))
  );
}

function isBunny(value: unknown): boolean {
  if (!isRecord(value)) return false;
  const { name, needs, zeroMs, care, wardrobe, equippedOutfit, events } = value;
  return (
    typeof name === 'string' &&
    validateName(name).ok &&
    isTime(value.adoptedAt) &&
    isTime(value.lastUpdatedAt) &&
    isRecord(needs) &&
    [needs.hunger, needs.happiness, needs.cleanliness, needs.energy].every(isNeed) &&
    [value.asleep, value.sick, value.depressed].every((flag) => typeof flag === 'boolean') &&
    isRecord(zeroMs) &&
    [zeroMs.hunger, zeroMs.cleanliness, zeroMs.happiness].every(isNonNegative) &&
    isRecord(care) &&
    [care.weightedSum, care.durationMs].every(isNonNegative) &&
    (value.adultVariant === null || isOneOf(value.adultVariant, ADULT_VARIANTS)) &&
    (value.adventure === null || isAdventure(value.adventure)) &&
    isIdList(value.completedAdventures, ADVENTURE_IDS) &&
    isIdList(wardrobe, OUTFIT_IDS) &&
    (equippedOutfit === null || (Array.isArray(wardrobe) && wardrobe.includes(equippedOutfit))) &&
    Array.isArray(events) &&
    events.every(isEvent)
  );
}

function isAdventure(value: unknown): boolean {
  return (
    isRecord(value) &&
    isOneOf(value.id, ADVENTURE_IDS) &&
    isTime(value.startedAt) &&
    isFiniteNumber(value.endsAt) &&
    value.endsAt - value.startedAt === getAdventure(value.id as AdventureId).durationMs
  );
}

function isEvent(value: unknown): boolean {
  if (!isRecord(value)) return false;
  if (value.type === 'grew-up') {
    return isOneOf(value.stage, GROWN_UP_STAGES) && (value.variant === undefined || isOneOf(value.variant, ADULT_VARIANTS));
  }
  if (value.type === 'returned') {
    return isOneOf(value.adventureId, ADVENTURE_IDS) && (value.outfitFound === null || isOneOf(value.outfitFound, OUTFIT_IDS));
  }
  return false;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isTime(value: unknown): value is number {
  return isFiniteNumber(value) && value >= EARLIEST_TIME && value <= LATEST_TIME;
}

function isNeed(value: unknown): boolean {
  return isFiniteNumber(value) && value >= 0 && value <= NEED_MAX;
}

function isNonNegative(value: unknown): boolean {
  return isFiniteNumber(value) && value >= 0;
}

function isOneOf(value: unknown, options: readonly unknown[]): boolean {
  return options.includes(value);
}

function isIdList(value: unknown, knownIds: readonly unknown[]): boolean {
  return Array.isArray(value) && value.every((id) => isOneOf(id, knownIds)) && new Set(value).size === value.length;
}
