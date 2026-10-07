import { OUTFITS, getAdventure, getOutfit } from '../../game/catalog';
import { moodOf } from '../../game/mood';
import { stageAt } from '../../game/stage';
import type { GameState, OutfitId } from '../../game/types';
import { bodyKeyFor, outfitSizeFor, outfitSpriteKey } from '../../render/spriteManifest';
import { getSilhouette } from '../../render/sprites';
import { navigate } from '../../router';
import { button, el, setHidden, setText } from '../dom';
import { bunnyCanvas, drawBunnyInto, spriteCanvas } from '../pixelCanvas';
import type { AppContext, Screen } from '../screen';
import { topBar } from './adventures';

const SILHOUETTE_COLOUR = 'rgba(74, 59, 79, 0.25)';

export function createWardrobeScreen(ctx: AppContext): Screen {
  const message = el('p', { class: 'banner', attrs: { role: 'status' } });
  const adventuresButton = button('Adventures', () => navigate('adventures'));
  const preview = el('canvas', { class: 'pixel wardrobe-preview', attrs: { role: 'img' } });
  const takeOff = button('Take off', () => {
    const worn = ctx.store.getState().bunny?.equippedOutfit;
    ctx.store.dispatch({ type: 'unequip' });
    grid.querySelector<HTMLElement>(`[data-outfit="${worn}"]`)?.focus();
  }, 'button secondary');
  const grid = el('div', { class: 'outfit-grid' });
  let gridSignature = '';

  function renderGrid(state: GameState): void {
    const bunny = state.bunny!;
    const now = ctx.now();
    const body = bodyKeyFor(stageAt(bunny, now), bunny.adultVariant);
    const mood = moodOf(bunny);
    const away = bunny.adventure !== null;
    const signature = [body, mood, away, bunny.equippedOutfit, ...bunny.wardrobe].join('|');
    if (signature === gridSignature) return;
    gridSignature = signature;

    const focusedOutfit = document.activeElement instanceof HTMLElement ? document.activeElement.dataset.outfit : undefined;
    drawBunnyInto(preview, body, mood, bunny.equippedOutfit, 192);
    const size = outfitSizeFor(body) ?? 'teen';
    grid.replaceChildren(
      ...OUTFITS.map((outfit) => {
        if (!bunny.wardrobe.includes(outfit.id)) {
          const silhouetteKey = outfitSpriteKey(outfit.id, size);
          return el(
            'div',
            { class: 'outfit-slot', attrs: { 'aria-label': `Not found yet. Found on ${getAdventure(outfit.adventureId).name}.` } },
            spriteCanvas(silhouetteKey, 80, getSilhouette(silhouetteKey, SILHOUETTE_COLOUR)),
            el('span', { text: '???' }),
            el('span', { text: `Found on ${getAdventure(outfit.adventureId).name}` }),
          );
        }
        const worn = bunny.equippedOutfit === outfit.id;
        const slot = el(
          'button',
          {
            class: worn ? 'outfit-slot owned selected' : 'outfit-slot owned',
            attrs: { type: 'button', 'aria-pressed': String(worn), 'data-outfit': outfit.id },
            on: { click: () => wear(outfit.id) },
          },
          bunnyCanvas(body, mood, outfit.id, 80),
          el('span', { text: outfit.name }),
        );
        slot.disabled = away;
        return slot;
      }),
    );
    if (focusedOutfit) grid.querySelector<HTMLElement>(`[data-outfit="${focusedOutfit}"]`)?.focus();
  }

  function wear(outfitId: OutfitId): void {
    ctx.store.dispatch({ type: 'equip', outfitId });
  }

  const element = el('main', { class: 'screen wardrobe' }, topBar('Wardrobe'), message, adventuresButton, preview, takeOff, grid);

  return {
    element,
    update(state: GameState) {
      const bunny = state.bunny;
      if (!bunny) return;
      const now = ctx.now();
      const away = bunny.adventure !== null;
      const noOutfits = bunny.wardrobe.length === 0;

      let text: string | null = null;
      if (away) text = `${bunny.name} is away. Change outfits when ${bunny.name} is home.`;
      else if (stageAt(bunny, now) === 'baby') text = `Outfits fit once ${bunny.name} is a teen.`;
      else if (noOutfits) text = `No outfits yet. Send ${bunny.name} on an adventure to find some!`;
      setHidden(message, text === null);
      if (text) setText(message, text);
      setHidden(adventuresButton, away || !noOutfits || stageAt(bunny, now) === 'baby');

      preview.setAttribute('aria-label', bunny.equippedOutfit ? `${bunny.name} is wearing the ${getOutfit(bunny.equippedOutfit).name.toLowerCase()}.` : `${bunny.name} is not wearing an outfit.`);
      setHidden(takeOff, bunny.equippedOutfit === null);
      takeOff.disabled = away;
      renderGrid(state);
    },
  };
}
