import { PNG } from 'pngjs';
import { describe, expect, test } from 'vitest';
import { extractLayer } from './extract-layer';

type Pixel = [number, number, number, number];

function image(pixels: Pixel[]): PNG {
  const png = new PNG({ width: pixels.length, height: 1 });
  pixels.forEach((pixel, index) => png.data.set(pixel, index * 4));
  return png;
}

function pixelsOf(png: PNG): Pixel[] {
  return Array.from({ length: png.width * png.height }, (_, index) => {
    const [r, g, b, a] = png.data.subarray(index * 4, index * 4 + 4);
    return [r, g, b, a];
  });
}

describe('extractLayer', () => {
  test('identical pixels become transparent and changed pixels are kept', () => {
    const base = image([
      [255, 246, 236, 255],
      [74, 59, 79, 255],
      [0, 0, 0, 0],
      [247, 182, 200, 255],
    ]);
    const dressed = image([
      [255, 246, 236, 255],
      [200, 40, 40, 255],
      [10, 120, 60, 255],
      [247, 182, 200, 254],
    ]);

    expect(pixelsOf(extractLayer(base, dressed))).toEqual([
      [0, 0, 0, 0],
      [200, 40, 40, 255],
      [10, 120, 60, 255],
      [247, 182, 200, 254],
    ]);
  });

  test('a dressed image equal to the base gives a fully transparent layer', () => {
    const base = image([
      [1, 2, 3, 255],
      [4, 5, 6, 128],
    ]);

    expect(pixelsOf(extractLayer(base, image(pixelsOf(base))))).toEqual([
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
  });

  test('keeps the image size', () => {
    const base = new PNG({ width: 64, height: 64 });
    const layer = extractLayer(base, new PNG({ width: 64, height: 64 }));

    expect([layer.width, layer.height]).toEqual([64, 64]);
  });

  test('throws when the sizes differ', () => {
    expect(() => extractLayer(new PNG({ width: 64, height: 64 }), new PNG({ width: 32, height: 64 }))).toThrow(
      'Size mismatch',
    );
  });
});
