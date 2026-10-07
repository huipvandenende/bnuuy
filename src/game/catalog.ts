import { HOUR_MS } from './constants';
import type { AdventureId, OutfitId } from './types';

export interface AdventureInfo {
  id: AdventureId;
  name: string;
  durationMs: number;
  flavour: string;
  outfitId: OutfitId;
}

export interface OutfitInfo {
  id: OutfitId;
  name: string;
  adventureId: AdventureId;
}

export const ADVENTURES: readonly AdventureInfo[] = [
  { id: 'garden-stroll', name: 'Garden Stroll', durationMs: 1 * HOUR_MS, flavour: 'A sunny wander among the tulips.', outfitId: 'flower-crown' },
  { id: 'beach-day', name: 'Beach Day', durationMs: 2 * HOUR_MS, flavour: 'Sand, waves and a very big sandcastle.', outfitId: 'sun-hat' },
  { id: 'bakery-shift', name: 'Bakery Shift', durationMs: 3 * HOUR_MS, flavour: 'Kneading dough and sampling carrot cake.', outfitId: 'chef-hat' },
  { id: 'office-job', name: 'Office Job', durationMs: 4 * HOUR_MS, flavour: 'Spreadsheets, meetings and free coffee.', outfitId: 'suit' },
  { id: 'wizard-school', name: 'Wizard School', durationMs: 6 * HOUR_MS, flavour: 'Learning to turn carrots into more carrots.', outfitId: 'wizard-hat' },
  { id: 'pirate-voyage', name: 'Pirate Voyage', durationMs: 8 * HOUR_MS, flavour: 'Sailing the seven seas for buried treasure.', outfitId: 'pirate-hat' },
  { id: 'epic-quest', name: 'Epic Quest', durationMs: 10 * HOUR_MS, flavour: 'A long journey to toss a ring into a volcano.', outfitId: 'hobbit-cloak' },
  { id: 'space-mission', name: 'Space Mission', durationMs: 12 * HOUR_MS, flavour: 'One small hop for a bunny.', outfitId: 'astronaut-helmet' },
];

const OUTFIT_NAMES: Record<OutfitId, string> = {
  'flower-crown': 'Flower crown',
  'sun-hat': 'Straw sun hat',
  'chef-hat': "Chef's hat",
  suit: 'Suit and tie',
  'wizard-hat': 'Wizard hat',
  'pirate-hat': 'Pirate hat',
  'hobbit-cloak': 'Hobbit cloak',
  'astronaut-helmet': 'Astronaut helmet',
};

export const OUTFITS: readonly OutfitInfo[] = ADVENTURES.map((adventure) => ({
  id: adventure.outfitId,
  name: OUTFIT_NAMES[adventure.outfitId],
  adventureId: adventure.id,
}));

export const ADVENTURE_IDS: readonly AdventureId[] = ADVENTURES.map((adventure) => adventure.id);
export const OUTFIT_IDS: readonly OutfitId[] = OUTFITS.map((outfit) => outfit.id);

export function getAdventure(id: AdventureId): AdventureInfo {
  return ADVENTURES.find((adventure) => adventure.id === id)!;
}

export function getOutfit(id: OutfitId): OutfitInfo {
  return OUTFITS.find((outfit) => outfit.id === id)!;
}
