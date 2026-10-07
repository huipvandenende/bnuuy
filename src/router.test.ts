import { expect, test } from 'vitest';
import { parseRoute } from './router';

test('parses known hashes and falls back to home', () => {
  expect(parseRoute('#/adventures')).toBe('adventures');
  expect(parseRoute('#/dev/sprites')).toBe('dev-sprites');
  expect(parseRoute('')).toBe('home');
  expect(parseRoute('#/nope')).toBe('home');
});
