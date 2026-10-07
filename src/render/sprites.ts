import { getSpriteSpec } from './spriteManifest';

const PINK = '#F7B6C8';
const PLUM = '#4A3B4F';

const spriteUrls = import.meta.glob<string>('../assets/sprites/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

const loaded = new Map<string, HTMLImageElement>();
const placeholders = new Map<string, HTMLCanvasElement>();
const silhouettes = new Map<string, HTMLCanvasElement>();

function keyOfPath(path: string): string {
  return path.slice(path.lastIndexOf('/') + 1, -'.png'.length);
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = url;
  await image.decode();
  return image;
}

export async function preloadSprites(): Promise<void> {
  await Promise.all(
    Object.entries(spriteUrls).map(async ([path, url]) => {
      loaded.set(keyOfPath(path), await loadImage(url));
    }),
  );
}

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function drawPlaceholder(key: string): HTMLCanvasElement {
  const { width, height } = getSpriteSpec(key);
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = PLUM;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = PINK;
  ctx.fillRect(1, 1, width - 2, height - 2);
  ctx.fillStyle = PLUM;
  ctx.font = `bold ${Math.round(Math.min(width, height) * 0.6)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(key[0].toUpperCase(), width / 2, height / 2 + 1);
  return canvas;
}

export function getSprite(key: string): CanvasImageSource {
  const image = loaded.get(key);
  if (image) {
    return image;
  }
  let placeholder = placeholders.get(key);
  if (!placeholder) {
    placeholder = drawPlaceholder(key);
    placeholders.set(key, placeholder);
  }
  return placeholder;
}

export function isPlaceholder(key: string): boolean {
  return !loaded.has(key);
}

export function getSilhouette(key: string, color: string): CanvasImageSource {
  const cacheKey = `${key}|${color}`;
  let silhouette = silhouettes.get(cacheKey);
  if (!silhouette) {
    const { width, height } = getSpriteSpec(key);
    silhouette = createCanvas(width, height);
    const ctx = silhouette.getContext('2d')!;
    ctx.drawImage(getSprite(key), 0, 0);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
    silhouettes.set(cacheKey, silhouette);
  }
  return silhouette;
}
