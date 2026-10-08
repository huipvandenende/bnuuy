import { describe, expect, test } from 'vitest';
import {
  BODY_KEYS,
  FACE_RECTS,
  SPRITES,
  bodyKeyFor,
  bunnySpriteKey,
  getSpriteSpec,
  outfitSizeFor,
  outfitSpriteKey,
  prayingBodySpriteKey,
  prayPawsSpriteKey,
} from './spriteManifest';

describe('spriteManifest', () => {
  test('lists all 82 sprites with unique keys', () => {
    expect(SPRITES).toHaveLength(82);
    expect(new Set(SPRITES.map((sprite) => sprite.key)).size).toBe(82);
    expect(SPRITES.every((sprite) => sprite.file === `${sprite.key}.png`)).toBe(true);
  });

  test('has the expected sizes', () => {
    expect(getSpriteSpec('bunny-adult-normal-content')).toMatchObject({ width: 64, height: 64, group: 'bunny' });
    expect(getSpriteSpec('outfit-astronaut-helmet-teen')).toMatchObject({ width: 64, height: 64, group: 'outfit' });
    expect(getSpriteSpec('room')).toMatchObject({ width: 128, height: 128 });
    expect(getSpriteSpec('fx-rain-cloud')).toMatchObject({ width: 32, height: 16 });
    expect(getSpriteSpec('adventure-space-mission')).toMatchObject({ width: 32, height: 32 });
    expect(getSpriteSpec('icon-gear')).toMatchObject({ width: 16, height: 16 });
    expect(getSpriteSpec('room-church')).toMatchObject({ width: 128, height: 128, group: 'room' });
    expect(getSpriteSpec('pray-paws-teen')).toMatchObject({ width: 64, height: 64, group: 'paws' });
    expect(getSpriteSpec('bunny-adult-scruffy-praying')).toMatchObject({ width: 64, height: 64, group: 'bunny' });
  });

  test('throws on an unknown key', () => {
    expect(() => getSpriteSpec('nope')).toThrow('Unknown sprite key: nope');
  });

  test('maps stage and variant to a body', () => {
    expect(bodyKeyFor('baby', null)).toBe('baby');
    expect(bodyKeyFor('teen', null)).toBe('teen');
    expect(bodyKeyFor('adult', 'fluffy')).toBe('adult-fluffy');
    expect(bodyKeyFor('adult', null)).toBe('adult-normal');
  });

  test('builds sprite keys', () => {
    expect(bunnySpriteKey('adult-scruffy', 'sick')).toBe('bunny-adult-scruffy-sick');
    expect(outfitSpriteKey('sun-hat', 'adult')).toBe('outfit-sun-hat-adult');
    expect(BODY_KEYS.map(outfitSizeFor)).toEqual([null, 'teen', 'adult', 'adult', 'adult']);
    expect(prayingBodySpriteKey('teen')).toBe('bunny-teen-praying');
    expect(BODY_KEYS.map(prayPawsSpriteKey)).toEqual([
      'pray-paws-baby',
      'pray-paws-teen',
      'pray-paws-adult',
      'pray-paws-adult',
      'pray-paws-adult',
    ]);
  });

  test('face rectangles fit inside the 64 x 64 sprite', () => {
    for (const rect of Object.values(FACE_RECTS)) {
      expect(rect.x + rect.width).toBeLessThanOrEqual(64);
      expect(rect.y + rect.height).toBeLessThanOrEqual(64);
    }
  });
});
