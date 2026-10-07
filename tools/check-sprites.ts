import { existsSync, readFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { SPRITES, type SpriteSpec } from '../src/render/spriteManifest';

type Problem = 'missing' | 'unreadable' | 'wrong size';

const spritesDir = new URL('../src/assets/sprites/', import.meta.url);

function problemOf(sprite: SpriteSpec): { problem: Problem; detail: string } | null {
  const url = new URL(sprite.file, spritesDir);
  if (!existsSync(url)) {
    return { problem: 'missing', detail: '' };
  }
  let png: PNG;
  try {
    png = PNG.sync.read(readFileSync(url));
  } catch {
    return { problem: 'unreadable', detail: '' };
  }
  if (png.width !== sprite.width || png.height !== sprite.height) {
    return {
      problem: 'wrong size',
      detail: ` (${png.width} x ${png.height}, expected ${sprite.width} x ${sprite.height})`,
    };
  }
  return null;
}

const counts: Record<Problem | 'ok', number> = { missing: 0, unreadable: 0, 'wrong size': 0, ok: 0 };

for (const sprite of SPRITES) {
  const result = problemOf(sprite);
  if (result) {
    console.log(`${result.problem}: ${sprite.file}${result.detail}`);
    counts[result.problem]++;
  } else {
    counts.ok++;
  }
}

console.log(
  `${counts.missing} missing, ${counts['wrong size']} wrong size, ${counts.unreadable} unreadable, ${counts.ok} ok`,
);

if (counts.ok !== SPRITES.length) {
  process.exit(1);
}
