import { describe, expect, test } from 'vitest';
import { HOUR_MS } from './constants';
import { decodeSaveCode, encodeSaveCode, SAVE_CODE_MESSAGES } from './saveCode';
import { makeBunny, makeState, stateWith, T0 } from './testHelpers';

function fnv1a32(text: string): string {
  let hash = 0x811c9dc5;
  for (const char of text) hash = Math.imul(hash ^ char.charCodeAt(0), 0x01000193) >>> 0;
  return hash.toString(16).padStart(8, '0');
}

function codeForJson(json: string): string {
  const payload = Buffer.from(json, 'utf8').toString('base64url');
  return `BNUUY1.${payload}.${fnv1a32(payload)}`;
}

const state = makeState(
  makeBunny({
    name: 'Clöver 🐰✨',
    adoptedAt: T0 - 30 * HOUR_MS,
    needs: { hunger: 12.345678901234, happiness: 0, cleanliness: 99.99, energy: 50 },
    wardrobe: ['flower-crown'],
    equippedOutfit: 'flower-crown',
    completedAdventures: ['garden-stroll'],
    adventure: { id: 'beach-day', startedAt: T0, endsAt: T0 + 2 * HOUR_MS },
    events: [{ type: 'returned', adventureId: 'garden-stroll', outfitFound: 'flower-crown' }],
  }),
  true,
);

describe('test helper', () => {
  test('fnv1a32 matches the published test vectors', () => {
    expect(fnv1a32('')).toBe('811c9dc5');
    expect(fnv1a32('a')).toBe('e40c292c');
    expect(fnv1a32('foobar')).toBe('bf9cf968');
  });
});

describe('encodeSaveCode', () => {
  test('has the BNUUY1 prefix, a base64url payload and an 8 character hex checksum', () => {
    expect(encodeSaveCode(state)).toMatch(/^BNUUY1\.[A-Za-z0-9_-]+\.[0-9a-f]{8}$/);
  });

  test('matches an independently built code', () => {
    expect(encodeSaveCode(state)).toBe(codeForJson(JSON.stringify(state)));
  });
});

describe('decodeSaveCode', () => {
  test('round trips a state with an emoji name', () => {
    expect(decodeSaveCode(encodeSaveCode(state))).toEqual({ ok: true, state });
  });

  test('round trips a state without a bunny', () => {
    const empty = makeState(null);
    expect(decodeSaveCode(encodeSaveCode(empty))).toEqual({ ok: true, state: empty });
  });

  test('ignores spaces, tabs and line breaks', () => {
    const code = encodeSaveCode(state);
    const messy = `  ${code.slice(0, 10)}\n${code.slice(10, 30)} \t${code.slice(30)}\r\n`;
    expect(decodeSaveCode(messy)).toEqual({ ok: true, state });
  });

  test('rejects a wrong checksum', () => {
    const code = encodeSaveCode(state);
    const wrong = code.endsWith('0') ? `${code.slice(0, -1)}1` : `${code.slice(0, -1)}0`;
    expect(decodeSaveCode(wrong)).toEqual({ ok: false, error: 'invalid' });
  });

  test('rejects a changed payload', () => {
    const [prefix, payload, checksum] = encodeSaveCode(state).split('.');
    const changed = `${prefix}.${payload.slice(0, -2)}AA.${checksum}`;
    expect(decodeSaveCode(changed)).toEqual({ ok: false, error: 'invalid' });
  });

  test.each(['BNUUX1.', 'bnuuy1.', 'BNUUY.', ''])('rejects the prefix %j', (prefix) => {
    const code = encodeSaveCode(state).replace('BNUUY1.', prefix);
    expect(decodeSaveCode(code)).toEqual({ ok: false, error: 'invalid' });
  });

  test.each(['', 'hello', 'BNUUY1', 'BNUUY1..', 'BNUUY1.a.b.c'])('rejects %j', (code) => {
    expect(decodeSaveCode(code)).toEqual({ ok: false, error: 'invalid' });
  });

  test.each(['BNUUY2.', 'BNUUY10.'])('reports a newer version for %s', (prefix) => {
    const code = encodeSaveCode(state).replace('BNUUY1.', prefix);
    expect(decodeSaveCode(code)).toEqual({ ok: false, error: 'newer-version' });
  });

  test('rejects invalid JSON with a valid checksum', () => {
    expect(decodeSaveCode(codeForJson('{"version":1,"bunny":'))).toEqual({ ok: false, error: 'invalid' });
  });

  test('rejects invalid UTF-8 with a valid checksum', () => {
    const payload = Buffer.from([0xff, 0xfe, 0x7b]).toString('base64url');
    expect(decodeSaveCode(`BNUUY1.${payload}.${fnv1a32(payload)}`)).toEqual({ ok: false, error: 'invalid' });
  });

  test('rejects out-of-range values with a valid checksum', () => {
    const code = encodeSaveCode(stateWith({ needs: { hunger: 150 } }));
    expect(decodeSaveCode(code)).toEqual({ ok: false, error: 'invalid' });
  });

  test('rejects valid JSON that is not a game state', () => {
    expect(decodeSaveCode(codeForJson('[1,2,3]'))).toEqual({ ok: false, error: 'invalid' });
  });
});

describe('SAVE_CODE_MESSAGES', () => {
  test('has the user messages', () => {
    expect(SAVE_CODE_MESSAGES).toEqual({
      invalid: "This save code doesn't work. Check that you copied all of it.",
      'newer-version': 'This save code was made with a newer version of bnuuy.',
    });
  });
});
