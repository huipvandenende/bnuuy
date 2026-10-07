export interface Point {
  x: number;
  y: number;
}

export interface Particle extends Point {
  alpha: number;
}

export interface Float {
  rise: number;
  alpha: number;
}

export const BOB_STEP_MS = 600;
export const CLOUD_STEP_MS = 800;

export const FEED_MS = 900;
const CARROT_SIZES = [16, 10, 4];

export const HOP_MS = 800;
const HOP_COUNT = 2;
const HOP_HEIGHT = 6;

const HEART_FLOAT_MS = 900;
const HEART_RISE = 20;
const HEARTS = [
  { dx: -16, delayMs: 0 },
  { dx: 12, delayMs: 250 },
  { dx: -2, delayMs: 500 },
];
export const PLAY_MS = 500 + HEART_FLOAT_MS;

export const CLEAN_FADE_MS = 600;
export const CLEAN_SPARKLE_MS = 800;

export const BOTTLE_MS = 600;
export const MEDICINE_SPARKLE_MS = 800;
export const MEDICINE_MS = BOTTLE_MS + MEDICINE_SPARKLE_MS;

export const SHAKE_MS = 600;
const SHAKE_COUNT = 6;

export const ZZZ_LOOP_MS = 2000;
const ZZZ_RISE = 8;

export const HAPPY_SPARKLE_EVERY_MS = 3000;
export const HAPPY_SPARKLE_MS = 400;

function isRunning(elapsedMs: number, durationMs: number): boolean {
  return elapsedMs >= 0 && elapsedMs < durationMs;
}

function stepBob(timeMs: number, stepMs: number): number {
  return Math.floor(timeMs / stepMs) % 2 === 0 ? 0 : -1;
}

export function bobOffset(timeMs: number): number {
  return stepBob(timeMs, BOB_STEP_MS);
}

export function cloudOffset(timeMs: number): number {
  return stepBob(timeMs, CLOUD_STEP_MS);
}

export function hopHeight(elapsedMs: number): number {
  if (!isRunning(elapsedMs, HOP_MS)) {
    return 0;
  }
  const hopMs = HOP_MS / HOP_COUNT;
  const progress = (elapsedMs % hopMs) / hopMs;
  return Math.round(HOP_HEIGHT * 4 * progress * (1 - progress));
}

export function shakeOffset(elapsedMs: number): number {
  if (!isRunning(elapsedMs, SHAKE_MS)) {
    return 0;
  }
  return Math.floor(elapsedMs / (SHAKE_MS / SHAKE_COUNT)) % 2 === 0 ? 1 : -1;
}

export function carrotSize(elapsedMs: number): number {
  if (!isRunning(elapsedMs, FEED_MS)) {
    return 0;
  }
  return CARROT_SIZES[Math.floor(elapsedMs / (FEED_MS / CARROT_SIZES.length))];
}

export function fadeOut(elapsedMs: number, durationMs: number): number {
  return Math.min(1, Math.max(0, 1 - elapsedMs / durationMs));
}

export function pulse(elapsedMs: number, durationMs: number): number {
  if (!isRunning(elapsedMs, durationMs)) {
    return 0;
  }
  return 1 - Math.abs((2 * elapsedMs) / durationMs - 1);
}

export function floatUp(elapsedMs: number, durationMs: number, distance: number): Float | null {
  if (!isRunning(elapsedMs, durationMs)) {
    return null;
  }
  const progress = elapsedMs / durationMs;
  return { rise: Math.round(distance * progress), alpha: 1 - progress };
}

export function floatingHearts(elapsedMs: number, origin: Point): Particle[] {
  return HEARTS.flatMap(({ dx, delayMs }) => {
    const float = floatUp(elapsedMs - delayMs, HEART_FLOAT_MS, HEART_RISE);
    return float ? [{ x: origin.x + dx, y: origin.y - float.rise, alpha: float.alpha }] : [];
  });
}

export function zzzFloat(timeMs: number): Float {
  const progress = (timeMs % ZZZ_LOOP_MS) / ZZZ_LOOP_MS;
  return { rise: Math.floor(progress * ZZZ_RISE), alpha: Math.min(1, (1 - progress) * 3) };
}

export function happySparkle(timeMs: number, spots: readonly Point[]): Point | null {
  if (timeMs % HAPPY_SPARKLE_EVERY_MS >= HAPPY_SPARKLE_MS) {
    return null;
  }
  return spots[Math.floor(timeMs / HAPPY_SPARKLE_EVERY_MS) % spots.length];
}
