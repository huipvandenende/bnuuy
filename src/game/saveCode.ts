import type { GameState } from './types';
import { isValidGameState } from './validate';

export type DecodeResult = { ok: true; state: GameState } | { ok: false; error: 'invalid' | 'newer-version' };

export const SAVE_CODE_MESSAGES: Record<'invalid' | 'newer-version', string> = {
  invalid: "This save code doesn't work. Check that you copied all of it.",
  'newer-version': 'This save code was made with a newer version of bnuuy.',
};

const PREFIX = 'BNUUY1';
const INVALID: DecodeResult = { ok: false, error: 'invalid' };

export function encodeSaveCode(state: GameState): string {
  const payload = toBase64Url(new TextEncoder().encode(JSON.stringify(state)));
  return `${PREFIX}.${payload}.${fnv1a32(payload)}`;
}

export function decodeSaveCode(code: string): DecodeResult {
  const compact = code.replace(/\s/g, '');
  const versionMatch = /^BNUUY(\d+)\./.exec(compact);
  if (versionMatch && Number(versionMatch[1]) > 1) return { ok: false, error: 'newer-version' };

  const [prefix, payload, checksum, ...rest] = compact.split('.');
  if (prefix !== PREFIX || payload === undefined || checksum !== fnv1a32(payload) || rest.length > 0) return INVALID;

  try {
    const state: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(fromBase64Url(payload)));
    return isValidGameState(state) ? { ok: true, state } : INVALID;
  } catch {
    return INVALID;
  }
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(text: string): Uint8Array {
  const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function fnv1a32(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}
