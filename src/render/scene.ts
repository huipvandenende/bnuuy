import { getAdventure } from '../game/catalog';
import { droppingsCount, moodOf } from '../game/mood';
import { stageAt } from '../game/stage';
import type { Bunny, Mood, OutfitId, Stage } from '../game/types';
import {
  BOTTLE_MS,
  CLEAN_FADE_MS,
  CLEAN_SPARKLE_MS,
  FEED_MS,
  MEDICINE_MS,
  MEDICINE_SPARKLE_MS,
  PLAY_MS,
  SHAKE_MS,
  bobOffset,
  carrotSize,
  cloudOffset,
  fadeOut,
  floatingHearts,
  happySparkle,
  hopHeight,
  pulse,
  shakeOffset,
  zzzFloat,
  type Point,
} from './animations';
import { addRenderer } from './loop';
import { bodyKeyFor, bunnySpriteKey, outfitSizeFor, outfitSpriteKey, type BodyKey } from './spriteManifest';
import { getSprite } from './sprites';

export type OneShotAnimation = 'feed' | 'play' | 'clean' | 'medicine' | 'refuse';

export interface SceneView {
  body: BodyKey;
  mood: Mood;
  outfit: OutfitId | null;
  droppings: number;
  asleep: boolean;
  depressed: boolean;
  away: boolean;
}

export interface Scene {
  setView(view: SceneView): void;
  play(animation: OneShotAnimation): void;
  render(timeMs: number): void;
  destroy(): void;
}

const SCENE_SIZE = 128;
const BUNNY: Point = { x: 32, y: 56 };
const BUNNY_SIZE = 64;
const FEET_ROW = 60;
const BODY_HEIGHTS: Record<BodyKey, number> = {
  baby: 32,
  teen: 44,
  'adult-fluffy': 56,
  'adult-normal': 56,
  'adult-scruffy': 56,
};
const DROPPING_SLOTS: readonly Point[] = [
  { x: 6, y: 100 },
  { x: 106, y: 100 },
  { x: 14, y: 112 },
  { x: 98, y: 112 },
];
const CARROT: Point = { x: 56, y: 84 };
const BOTTLE: Point = { x: 56, y: 40 };
const SMALL_SPRITE = 16;
const CLOUD_WIDTH = 32;
const SLEEP_OVERLAY = 'rgba(40, 30, 70, 0.55)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const ANIMATION_MS: Record<OneShotAnimation, number> = {
  feed: FEED_MS,
  play: PLAY_MS,
  clean: CLEAN_SPARKLE_MS,
  medicine: MEDICINE_MS,
  refuse: SHAKE_MS,
};

const STAGE_PHRASES: Record<Stage, string> = {
  baby: 'a baby',
  teen: 'a teen',
  adult: 'an adult',
};

interface ActiveAnimation {
  name: OneShotAnimation;
  startMs: number | null;
  droppings: number;
}

function headTop(body: BodyKey): number {
  return BUNNY.y + FEET_ROW - BODY_HEIGHTS[body];
}

function bunnyCentreX(): number {
  return BUNNY.x + BUNNY_SIZE / 2;
}

function sparkleSpots(body: BodyKey): Point[] {
  const top = headTop(body);
  const middle = Math.round((top + BUNNY.y + FEET_ROW) / 2);
  const halfWidth = Math.round(BODY_HEIGHTS[body] * 0.35);
  const left = bunnyCentreX() - halfWidth - SMALL_SPRITE - 2;
  const right = bunnyCentreX() + halfWidth + 2;
  return [
    { x: left, y: top + 2 },
    { x: right, y: middle - 8 },
    { x: left + 4, y: middle + 4 },
    { x: right - 4, y: top - 4 },
  ];
}

function drawSprite(ctx: CanvasRenderingContext2D, key: string, point: Point, alpha = 1): void {
  ctx.globalAlpha = alpha;
  ctx.drawImage(getSprite(key), point.x, point.y);
  ctx.globalAlpha = 1;
}

export function drawBunny(
  ctx: CanvasRenderingContext2D,
  body: BodyKey,
  mood: Mood,
  outfit: OutfitId | null,
  x: number,
  y: number,
): void {
  ctx.drawImage(getSprite(bunnySpriteKey(body, mood)), x, y);
  const size = outfitSizeFor(body);
  if (outfit && size) {
    ctx.drawImage(getSprite(outfitSpriteKey(outfit, size)), x, y);
  }
}

export function fitCanvas(
  canvas: HTMLCanvasElement,
  logicalWidth: number,
  logicalHeight: number,
  cssWidth: number,
): number {
  const pixelRatio = window.devicePixelRatio || 1;
  const scale = Math.max(1, Math.floor((cssWidth * pixelRatio) / logicalWidth));
  const width = logicalWidth * scale;
  const height = logicalHeight * scale;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  canvas.style.width = `${width / pixelRatio}px`;
  canvas.style.height = `${height / pixelRatio}px`;
  canvas.style.imageRendering = 'pixelated';
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.imageSmoothingEnabled = false;
  }
  return scale;
}

export function createScene(canvas: HTMLCanvasElement): Scene {
  const ctx = canvas.getContext('2d')!;
  const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
  let scale = fitCanvas(canvas, SCENE_SIZE, SCENE_SIZE, canvas.parentElement?.clientWidth ?? SCENE_SIZE);
  let view: SceneView | null = null;
  let active: ActiveAnimation | null = null;

  const observer = new ResizeObserver(([entry]) => {
    scale = fitCanvas(canvas, SCENE_SIZE, SCENE_SIZE, entry.contentRect.width);
  });
  if (canvas.parentElement) {
    observer.observe(canvas.parentElement);
  }

  function elapsedFor(timeMs: number): number {
    if (!active) {
      return 0;
    }
    active.startMs ??= timeMs;
    const elapsed = timeMs - active.startMs;
    if (elapsed >= ANIMATION_MS[active.name]) {
      active = null;
    }
    return elapsed;
  }

  function drawDroppings(current: SceneView, elapsed: number, motion: boolean): void {
    DROPPING_SLOTS.slice(0, current.droppings).forEach((slot) => drawSprite(ctx, 'item-dropping', slot));
    if (active?.name === 'clean' && motion) {
      const alpha = fadeOut(elapsed, CLEAN_FADE_MS);
      DROPPING_SLOTS.slice(current.droppings, active.droppings).forEach((slot) =>
        drawSprite(ctx, 'item-dropping', slot, alpha),
      );
    }
  }

  function drawOneShotEffects(current: SceneView, elapsed: number, motion: boolean): void {
    if (!active) {
      return;
    }
    if (active.name === 'feed') {
      const size = motion ? carrotSize(elapsed) : SMALL_SPRITE;
      const inset = (SMALL_SPRITE - size) / 2;
      ctx.drawImage(getSprite('item-carrot'), CARROT.x + inset, CARROT.y + inset, size, size);
    }
    if (active.name === 'play' && motion) {
      const origin = { x: bunnyCentreX() - SMALL_SPRITE / 2, y: headTop(current.body) - SMALL_SPRITE };
      floatingHearts(elapsed, origin).forEach((heart) => drawSprite(ctx, 'fx-heart', heart, heart.alpha));
    }
    if (active.name === 'clean') {
      const alpha = motion ? pulse(elapsed, CLEAN_SPARKLE_MS) : 1;
      DROPPING_SLOTS.slice(0, active.droppings).forEach((slot) => drawSprite(ctx, 'fx-sparkle', slot, alpha));
    }
    if (active.name === 'medicine') {
      if (elapsed < BOTTLE_MS) {
        drawSprite(ctx, 'item-medicine', BOTTLE);
      } else {
        const alpha = motion ? pulse(elapsed - BOTTLE_MS, MEDICINE_SPARKLE_MS) : 1;
        sparkleSpots(current.body).forEach((spot) => drawSprite(ctx, 'fx-sparkle', spot, alpha));
      }
    }
  }

  function drawMoodEffects(current: SceneView, timeMs: number, motion: boolean): void {
    const top = headTop(current.body);
    if (current.depressed && !current.asleep) {
      const bob = motion ? cloudOffset(timeMs) : 0;
      drawSprite(ctx, 'fx-rain-cloud', { x: bunnyCentreX() - CLOUD_WIDTH / 2, y: top - 20 + bob });
    }
    if (current.mood === 'happy' && motion) {
      const spot = happySparkle(timeMs, sparkleSpots(current.body));
      if (spot) {
        drawSprite(ctx, 'fx-sparkle', spot);
      }
    }
  }

  function drawSleep(current: SceneView, timeMs: number, motion: boolean): void {
    ctx.fillStyle = SLEEP_OVERLAY;
    ctx.fillRect(0, 0, SCENE_SIZE, SCENE_SIZE);
    const float = motion ? zzzFloat(timeMs) : { rise: 0, alpha: 1 };
    const position = { x: bunnyCentreX() + 6, y: headTop(current.body) - SMALL_SPRITE - float.rise };
    drawSprite(ctx, 'fx-zzz', position, float.alpha);
  }

  function render(timeMs: number): void {
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, SCENE_SIZE, SCENE_SIZE);
    ctx.drawImage(getSprite('room'), 0, 0);
    if (!view) {
      return;
    }
    const motion = !reducedMotion.matches;
    const animation = active?.name;
    const elapsed = elapsedFor(timeMs);
    drawDroppings(view, elapsed, motion);
    if (view.away) {
      return;
    }
    const dx = motion && animation === 'refuse' ? shakeOffset(elapsed) : 0;
    const hop = motion && animation === 'play' ? hopHeight(elapsed) : 0;
    const dy = motion ? bobOffset(timeMs) - hop : 0;
    drawBunny(ctx, view.body, view.mood, view.outfit, BUNNY.x + dx, BUNNY.y + dy);
    drawOneShotEffects(view, elapsed, motion);
    drawMoodEffects(view, timeMs, motion);
    if (view.asleep) {
      drawSleep(view, timeMs, motion);
    }
  }

  const removeRenderer = addRenderer(render);

  return {
    setView(next) {
      view = next;
    },
    play(animation) {
      active = { name: animation, startMs: null, droppings: view?.droppings ?? 0 };
    },
    render,
    destroy() {
      removeRenderer();
      observer.disconnect();
    },
  };
}

export function sceneViewOf(bunny: Bunny, now: number): SceneView {
  return {
    body: bodyKeyFor(stageAt(bunny, now), bunny.adultVariant),
    mood: moodOf(bunny),
    outfit: bunny.equippedOutfit,
    droppings: droppingsCount(bunny.needs.cleanliness),
    asleep: bunny.asleep,
    depressed: bunny.depressed,
    away: bunny.adventure !== null,
  };
}

function floorSentence(droppings: number): string {
  if (droppings === 0) {
    return 'The floor is clean.';
  }
  return droppings === 1 ? '1 dropping on the floor.' : `${droppings} droppings on the floor.`;
}

export function describeScene(bunny: Bunny, now: number): string {
  if (bunny.adventure) {
    return `The room is empty. ${bunny.name} is on ${getAdventure(bunny.adventure.id).name}.`;
  }
  const who = `${bunny.name}, ${STAGE_PHRASES[stageAt(bunny, now)]} bunny,`;
  const mood = moodOf(bunny);
  const doing = mood === 'sleeping' ? `${who} is sleeping.` : `${who} looks ${mood}.`;
  return `${doing} ${floorSentence(droppingsCount(bunny.needs.cleanliness))}`;
}
