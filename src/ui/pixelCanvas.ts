import type { BodyKey } from '../render/spriteManifest';
import { getSpriteSpec } from '../render/spriteManifest';
import { drawBunny, fitCanvas } from '../render/scene';
import { getSprite } from '../render/sprites';
import type { Mood, OutfitId } from '../game/types';
import { el } from './dom';

export function spriteCanvas(key: string, cssWidth: number, source: CanvasImageSource = getSprite(key)): HTMLCanvasElement {
  const { width, height } = getSpriteSpec(key);
  const canvas = el('canvas', { class: 'pixel', attrs: { 'aria-hidden': 'true' } });
  fitCanvas(canvas, width, height, cssWidth);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export function bunnyCanvas(body: BodyKey, mood: Mood, outfit: OutfitId | null, cssWidth: number): HTMLCanvasElement {
  const canvas = el('canvas', { class: 'pixel', attrs: { 'aria-hidden': 'true' } });
  drawBunnyInto(canvas, body, mood, outfit, cssWidth);
  return canvas;
}

export function drawBunnyInto(canvas: HTMLCanvasElement, body: BodyKey, mood: Mood, outfit: OutfitId | null, cssWidth: number): void {
  const scale = fitCanvas(canvas, 64, 64, cssWidth);
  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, 64, 64);
  drawBunny(ctx, body, mood, outfit, 0, 0);
}
