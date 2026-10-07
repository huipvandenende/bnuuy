import { getAdventure, getOutfit } from '../../game/catalog';
import { stageAt } from '../../game/stage';
import type { AdultVariant, Bunny, GameEvent } from '../../game/types';
import { bodyKeyFor } from '../../render/spriteManifest';
import { button, el } from '../dom';
import { bunnyCanvas } from '../pixelCanvas';
import { openDialog } from './dialog';

const VARIANT_TEXT: Record<AdultVariant, string> = {
  fluffy: 'Fluffy and shiny',
  normal: 'Soft and cozy',
  scruffy: 'A little scruffy, but loved',
};

function withArticle(noun: string): string {
  return /^[aeiou]/i.test(noun) ? `an ${noun}` : `a ${noun}`;
}

export function eventLines(event: GameEvent, name: string): string[] {
  if (event.type === 'grew-up') {
    if (event.stage === 'teen') return [`${name} grew into a teen! Adventures are now open.`];
    return [`${name} is all grown up!`, VARIANT_TEXT[event.variant ?? 'normal']];
  }
  const adventure = getAdventure(event.adventureId).name;
  if (event.outfitFound) {
    const outfit = getOutfit(event.outfitFound).name.toLowerCase();
    return [`${name} is back from ${adventure} and found ${withArticle(outfit)}! ${name} is wearing it now.`];
  }
  return [`${name} is back from ${adventure} and had a wonderful time! Happiness is full.`];
}

function previewCanvas(event: GameEvent, bunny: Bunny, now: number): HTMLCanvasElement {
  if (event.type === 'grew-up') {
    const body = bodyKeyFor(event.stage, event.variant ?? null);
    return bunnyCanvas(body, 'happy', event.stage === 'teen' ? null : bunny.equippedOutfit, 128);
  }
  const body = bodyKeyFor(stageAt(bunny, now), bunny.adultVariant);
  return bunnyCanvas(body, 'happy', event.outfitFound ?? bunny.equippedOutfit, 128);
}

export function showEventCard(event: GameEvent, bunny: Bunny, now: number): Promise<void> {
  return new Promise((resolve) => {
    const lines = eventLines(event, bunny.name).map((text) => el('p', { text }));
    const yay = button('Yay!', () => dialog.close());
    const dialog = openDialog(el('div', { class: 'stack event-card' }, previewCanvas(event, bunny, now), ...lines, yay), lines[0], resolve);
  });
}
