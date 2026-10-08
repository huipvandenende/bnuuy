import { describe, expect, test } from 'vitest';
import {
  bobOffset,
  bowOffset,
  carrotSize,
  cloudOffset,
  fadeOut,
  floatUp,
  floatingHearts,
  happySparkle,
  hopHeight,
  prayerCycle,
  prayerElapsed,
  pulse,
  shakeOffset,
  showsPrayerSparkle,
  zzzFloat,
} from './animations';

describe('animations', () => {
  test('idle bob alternates 0 and -1 every 600 ms', () => {
    expect([0, 599, 600, 1199, 1200].map(bobOffset)).toEqual([0, 0, -1, -1, 0]);
  });

  test('rain cloud bobs between 0 and -1', () => {
    expect([0, 800, 1600].map(cloudOffset)).toEqual([0, -1, 0]);
  });

  test('play makes two hops of 6 px over 800 ms', () => {
    expect([0, 200, 400, 600, 800].map(hopHeight)).toEqual([0, 6, 0, 6, 0]);
    expect(hopHeight(-1)).toBe(0);
  });

  test('refusal shakes 6 times over 600 ms', () => {
    expect([0, 100, 200, 300, 400, 500, 600].map(shakeOffset)).toEqual([1, -1, 1, -1, 1, -1, 0]);
  });

  test('the carrot shrinks in 3 steps over 900 ms', () => {
    expect([0, 299, 300, 600, 899, 900].map(carrotSize)).toEqual([16, 16, 10, 4, 4, 0]);
  });

  test('fadeOut goes from 1 to 0 and stays clamped', () => {
    expect([-100, 0, 300, 600, 900].map((ms) => fadeOut(ms, 600))).toEqual([1, 1, 0.5, 0, 0]);
  });

  test('pulse fades in then out', () => {
    expect([-1, 0, 200, 400, 600, 800].map((ms) => pulse(ms, 800))).toEqual([0, 0, 0.5, 1, 0.5, 0]);
  });

  test('floatUp rises and fades, then ends', () => {
    expect(floatUp(450, 900, 20)).toEqual({ rise: 10, alpha: 0.5 });
    expect(floatUp(900, 900, 20)).toBeNull();
    expect(floatUp(-1, 900, 20)).toBeNull();
  });

  test('hearts start one after another and float up', () => {
    const origin = { x: 56, y: 50 };
    expect(floatingHearts(0, origin)).toEqual([{ x: 40, y: 50, alpha: 1 }]);
    expect(floatingHearts(500, origin)).toHaveLength(3);
    expect(floatingHearts(1400, origin)).toEqual([]);
  });

  test('Zzz rises 8 px per 2 s loop and fades near the end', () => {
    expect(zzzFloat(0)).toEqual({ rise: 0, alpha: 1 });
    expect(zzzFloat(1000)).toEqual({ rise: 4, alpha: 1 });
    expect(zzzFloat(1999).rise).toBe(7);
    expect(zzzFloat(1999).alpha).toBeLessThan(0.01);
    expect(zzzFloat(2000)).toEqual(zzzFloat(0));
  });

  test('happy sparkle shows briefly every 3 s at the next spot', () => {
    const spots = [
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ];
    expect(happySparkle(0, spots)).toEqual({ x: 1, y: 1 });
    expect(happySparkle(400, spots)).toBeNull();
    expect(happySparkle(3100, spots)).toEqual({ x: 2, y: 2 });
    expect(happySparkle(6000, spots)).toEqual({ x: 1, y: 1 });
  });

  test('the bunny prays for the last 2 s of every 7 s', () => {
    expect([0, 4999, 5000, 6999, 7000, 12000].map(prayerElapsed)).toEqual([null, null, 0, 1999, null, 0]);
    expect([0, 6999, 7000, 14000].map(prayerCycle)).toEqual([0, 0, 1, 2]);
  });

  test('the prayer bows from 300 ms to 1700 ms and sparkles from 600 ms to 1400 ms', () => {
    expect([0, 299, 300, 1699, 1700].map(bowOffset)).toEqual([0, 0, 1, 1, 0]);
    expect([599, 600, 1399, 1400].map(showsPrayerSparkle)).toEqual([false, true, true, false]);
  });
});
