import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';

type Color = [number, number, number, number];

const PINK: Color = [0xf7, 0xb6, 0xc8, 255];
const PLUM: Color = [0x4a, 0x3b, 0x4f, 255];
const ICON_SIZE = 64;
const MASKABLE_SIZE = 512;
const LETTER_B: [number, number, number, number][] = [
  [20, 12, 8, 40],
  [20, 28, 24, 8],
  [36, 28, 8, 24],
  [20, 44, 24, 8],
];

const sourceUrl = new URL('../src/assets/sprites/app-icon.png', import.meta.url);
const outDir = new URL('../public/icons/', import.meta.url);

function fillRect(png: PNG, x: number, y: number, width: number, height: number, color: Color): void {
  for (let row = y; row < y + height; row++) {
    for (let column = x; column < x + width; column++) {
      png.data.set(color, (row * png.width + column) * 4);
    }
  }
}

function solid(size: number, color: Color): PNG {
  const png = new PNG({ width: size, height: size });
  fillRect(png, 0, 0, size, size, color);
  return png;
}

function placeholderIcon(): PNG {
  const icon = solid(ICON_SIZE, PLUM);
  fillRect(icon, 1, 1, ICON_SIZE - 2, ICON_SIZE - 2, PINK);
  LETTER_B.forEach(([x, y, width, height]) => fillRect(icon, x, y, width, height, PLUM));
  return icon;
}

function loadAppIcon(): PNG {
  if (!existsSync(sourceUrl)) {
    console.warn('Warning: src/assets/sprites/app-icon.png is missing, so the icons use a placeholder.');
    return placeholderIcon();
  }
  const icon = PNG.sync.read(readFileSync(sourceUrl));
  if (icon.width !== ICON_SIZE || icon.height !== ICON_SIZE) {
    throw new Error(`app-icon.png must be ${ICON_SIZE} x ${ICON_SIZE}, not ${icon.width} x ${icon.height}`);
  }
  return icon;
}

function upscale(source: PNG, factor: number): PNG {
  const result = new PNG({ width: source.width * factor, height: source.height * factor });
  for (let y = 0; y < result.height; y++) {
    for (let x = 0; x < result.width; x++) {
      const from = (Math.floor(y / factor) * source.width + Math.floor(x / factor)) * 4;
      source.data.copy(result.data, (y * result.width + x) * 4, from, from + 4);
    }
  }
  return result;
}

function drawOver(target: PNG, image: PNG, left: number, top: number): void {
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      const from = (y * image.width + x) * 4;
      const to = ((top + y) * target.width + left + x) * 4;
      const alpha = image.data[from + 3] / 255;
      for (let channel = 0; channel < 3; channel++) {
        target.data[to + channel] = Math.round(
          image.data[from + channel] * alpha + target.data[to + channel] * (1 - alpha),
        );
      }
    }
  }
}

function maskableIcon(icon: PNG): PNG {
  const background = solid(MASKABLE_SIZE, PINK);
  const bunny = upscale(icon, 6);
  const offset = (MASKABLE_SIZE - bunny.width) / 2;
  drawOver(background, bunny, offset, offset);
  return background;
}

const icon = loadAppIcon();
const outputs: Record<string, PNG> = {
  'pwa-192x192.png': upscale(icon, 3),
  'pwa-512x512.png': upscale(icon, 8),
  'pwa-maskable-512x512.png': maskableIcon(icon),
  'apple-touch-icon.png': upscale(icon, 3),
};

mkdirSync(outDir, { recursive: true });
for (const [file, png] of Object.entries(outputs)) {
  writeFileSync(new URL(file, outDir), PNG.sync.write(png));
  console.log(`Wrote public/icons/${file} (${png.width} x ${png.height})`);
}
