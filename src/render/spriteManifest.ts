import { ADVENTURE_IDS, OUTFIT_IDS } from '../game/catalog';
import type { AdultVariant, AdventureId, Mood, OutfitId, Stage } from '../game/types';

export type BodyKey = 'baby' | 'teen' | 'adult-fluffy' | 'adult-normal' | 'adult-scruffy';
export const BODY_KEYS: readonly BodyKey[] = ['baby', 'teen', 'adult-fluffy', 'adult-normal', 'adult-scruffy'];
export const MOODS: readonly Mood[] = ['happy', 'content', 'sad', 'sick', 'sleeping'];

export type SpriteGroup = 'bunny' | 'outfit' | 'paws' | 'room' | 'scene' | 'item' | 'effect' | 'icon' | 'adventure' | 'app';

export interface SpriteSpec {
  key: string;
  file: string;
  width: number;
  height: number;
  group: SpriteGroup;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ADULT_FACE: Rect = { x: 20, y: 26, width: 24, height: 11 };

export const FACE_RECTS: Record<BodyKey, Rect> = {
  baby: { x: 23, y: 40, width: 18, height: 9 },
  teen: { x: 23, y: 34, width: 19, height: 9 },
  'adult-fluffy': ADULT_FACE,
  'adult-normal': ADULT_FACE,
  'adult-scruffy': ADULT_FACE,
};

export function bodyKeyFor(stage: Stage, variant: AdultVariant | null): BodyKey {
  if (stage === 'adult') {
    return `adult-${variant ?? 'normal'}`;
  }
  return stage;
}

export function bunnySpriteKey(body: BodyKey, mood: Mood): string {
  return `bunny-${body}-${mood}`;
}

export function outfitSizeFor(body: BodyKey): 'teen' | 'adult' | null {
  if (body === 'baby') {
    return null;
  }
  return body === 'teen' ? 'teen' : 'adult';
}

export function outfitSpriteKey(outfit: OutfitId, size: 'teen' | 'adult'): string {
  return `outfit-${outfit}-${size}`;
}

export function prayingBodySpriteKey(body: BodyKey): string {
  return `bunny-${body}-praying`;
}

export function prayPawsSpriteKey(body: BodyKey): string {
  return `pray-paws-${outfitSizeFor(body) ?? 'baby'}`;
}

export function adventureIconKey(id: AdventureId): string {
  return `adventure-${id}`;
}

export function adventureSceneKey(id: AdventureId): string {
  return `scene-${id}`;
}

function sprite(key: string, width: number, height: number, group: SpriteGroup): SpriteSpec {
  return { key, file: `${key}.png`, width, height, group };
}

const OUTFIT_SIZES = ['teen', 'adult'] as const;
const ITEMS = ['item-carrot', 'item-medicine', 'item-dropping'];
const EFFECTS = ['fx-heart', 'fx-sparkle', 'fx-zzz'];
const ICONS = ['icon-ball', 'icon-broom', 'icon-moon', 'icon-sun', 'icon-map', 'icon-hanger', 'icon-gear'];

export const SPRITES: readonly SpriteSpec[] = [
  ...BODY_KEYS.flatMap((body) => MOODS.map((mood) => sprite(bunnySpriteKey(body, mood), 64, 64, 'bunny'))),
  ...OUTFIT_IDS.flatMap((outfit) => OUTFIT_SIZES.map((size) => sprite(outfitSpriteKey(outfit, size), 64, 64, 'outfit'))),
  sprite('room', 128, 128, 'room'),
  ...ADVENTURE_IDS.map((id) => sprite(adventureSceneKey(id), 128, 128, 'scene')),
  ...ITEMS.map((key) => sprite(key, 16, 16, 'item')),
  ...EFFECTS.map((key) => sprite(key, 16, 16, 'effect')),
  sprite('fx-rain-cloud', 32, 16, 'effect'),
  ...ICONS.map((key) => sprite(key, 16, 16, 'icon')),
  ...ADVENTURE_IDS.map((id) => sprite(adventureIconKey(id), 32, 32, 'adventure')),
  sprite('app-icon', 64, 64, 'app'),
  sprite('room-church', 128, 128, 'room'),
  ...BODY_KEYS.map((body) => sprite(prayingBodySpriteKey(body), 64, 64, 'bunny')),
  ...(['baby', 'teen', 'adult'] as const).map((shape) => sprite(`pray-paws-${shape}`, 64, 64, 'paws')),
];

const SPRITES_BY_KEY = new Map(SPRITES.map((spec) => [spec.key, spec]));

export function getSpriteSpec(key: string): SpriteSpec {
  const spec = SPRITES_BY_KEY.get(key);
  if (!spec) {
    throw new Error(`Unknown sprite key: ${key}`);
  }
  return spec;
}
