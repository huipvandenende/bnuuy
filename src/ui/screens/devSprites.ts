import { ADVENTURES, OUTFITS } from '../../game/catalog';
import type { Mood, OutfitId } from '../../game/types';
import type { OneShotAnimation, Scene, SceneView } from '../../render/scene';
import { createScene } from '../../render/scene';
import type { BodyKey } from '../../render/spriteManifest';
import { BODY_KEYS, MOODS, SPRITES, bunnySpriteKey, outfitSizeFor, outfitSpriteKey, prayingBodySpriteKey, prayPawsSpriteKey } from '../../render/spriteManifest';
import { isPlaceholder } from '../../render/sprites';
import { button, el } from '../dom';
import { bunnyCanvas, prayingBunnyCanvas, spriteCanvas } from '../pixelCanvas';
import type { Screen } from '../screen';

const SCENE_VIEWS: SceneView[] = [
  { body: 'adult-normal', mood: 'happy', outfit: null, droppings: 4, asleep: false, depressed: false, adventure: null, church: false },
  { body: 'teen', mood: 'sad', outfit: 'wizard-hat', droppings: 2, asleep: false, depressed: true, adventure: null, church: false },
  { body: 'baby', mood: 'sleeping', outfit: null, droppings: 1, asleep: true, depressed: false, adventure: null, church: false },
  { body: 'adult-fluffy', mood: 'sick', outfit: 'astronaut-helmet', droppings: 0, asleep: false, depressed: false, adventure: null, church: false },
];

const ANIMATIONS: OneShotAnimation[] = ['feed', 'play', 'clean', 'medicine', 'refuse'];

const CHURCH_OUTFITS: Record<BodyKey, OutfitId | null> = {
  baby: null,
  teen: 'suit',
  'adult-fluffy': 'wizard-hat',
  'adult-normal': 'hobbit-cloak',
  'adult-scruffy': 'flower-crown',
};

function caption(text: string, missing: boolean): HTMLElement {
  return el('span', { class: missing ? 'missing' : '', text: missing ? `${text} (missing)` : text });
}

function bunnyItem(body: BodyKey, mood: Mood, outfit: (typeof OUTFITS)[number] | null): HTMLElement {
  const size = outfitSizeFor(body);
  const keys = [bunnySpriteKey(body, mood), ...(outfit && size ? [outfitSpriteKey(outfit.id, size)] : [])];
  const missing = keys.some(isPlaceholder);
  return el('figure', { class: 'gallery-item' }, bunnyCanvas(body, mood, outfit?.id ?? null, 128), caption(`${body} ${mood}`, missing));
}

function prayingItem(body: BodyKey, outfit: OutfitId | null): HTMLElement {
  const size = outfitSizeFor(body);
  const keys = [prayingBodySpriteKey(body), prayPawsSpriteKey(body), ...(outfit && size ? [outfitSpriteKey(outfit, size)] : [])];
  return el('figure', { class: 'gallery-item' }, prayingBunnyCanvas(body, outfit, 128), caption(`${body} praying${outfit ? ` in ${outfit}` : ''}`, keys.some(isPlaceholder)));
}

function section(title: string, ...children: HTMLElement[]): HTMLElement {
  return el('section', { class: 'stack' }, el('h2', { text: title }), el('div', { class: 'gallery-grid' }, ...children));
}

export function createDevSpritesScreen(): Screen {
  const allSprites = SPRITES.map((sprite) =>
    el('figure', { class: 'gallery-item' }, spriteCanvas(sprite.key, sprite.width * 4), caption(`${sprite.key} · ${sprite.width}×${sprite.height}`, isPlaceholder(sprite.key))),
  );

  const faces = BODY_KEYS.flatMap((body) => MOODS.map((mood) => bunnyItem(body, mood, null)));

  const outfits = OUTFITS.flatMap((outfit) =>
    BODY_KEYS.filter((body) => outfitSizeFor(body) !== null).flatMap((body) => MOODS.map((mood) => bunnyItem(body, mood, outfit))),
  );

  const scenes: Scene[] = [];
  const sceneItems = SCENE_VIEWS.map((view) => {
    const canvas = el('canvas', { class: 'pixel' });
    const wrap = el('div', { class: 'scene-wrap', attrs: { style: 'width: 256px' } }, canvas);
    const scene = createScene(canvas);
    scene.setView(view);
    scenes.push(scene);
    return el('figure', { class: 'gallery-item' }, wrap, caption(`${view.body} ${view.mood}${view.asleep ? ' asleep' : ''}${view.depressed ? ' depressed' : ''}`, false));
  });
  const adventureScenes = ADVENTURES.map((adventure, index) => {
    const canvas = el('canvas', { class: 'pixel' });
    const wrap = el('div', { class: 'scene-wrap', attrs: { style: 'width: 256px' } }, canvas);
    const scene = createScene(canvas);
    const body: BodyKey = index % 2 === 0 ? 'adult-normal' : 'teen';
    scene.setView({ body, mood: 'happy', outfit: adventure.outfitId, droppings: 0, asleep: false, depressed: false, adventure: adventure.id, church: false });
    scenes.push(scene);
    return el('figure', { class: 'gallery-item' }, wrap, caption(`${adventure.name} (${body})`, isPlaceholder(`scene-${adventure.id}`)));
  });
  const churchScenes = BODY_KEYS.map((body) => {
    const canvas = el('canvas', { class: 'pixel' });
    const wrap = el('div', { class: 'scene-wrap', attrs: { style: 'width: 256px' } }, canvas);
    const scene = createScene(canvas);
    scene.setView({ body, mood: 'happy', outfit: CHURCH_OUTFITS[body], droppings: 1, asleep: false, depressed: false, adventure: null, church: true });
    scenes.push(scene);
    return el('figure', { class: 'gallery-item' }, wrap, caption(`Church (${body})`, isPlaceholder('room-church')));
  });
  const prayerPoses = BODY_KEYS.flatMap((body) => [
    prayingItem(body, null),
    ...(outfitSizeFor(body) ? OUTFITS.map((outfit) => prayingItem(body, outfit.id)) : []),
  ]);
  const animationButtons = el(
    'div',
    { class: 'row' },
    ...ANIMATIONS.map((animation) => button(animation, () => scenes.forEach((scene) => scene.play(animation)), 'button secondary')),
  );

  const element = el(
    'main',
    { class: 'screen gallery' },
    el('header', { class: 'top-bar' }, el('a', { class: 'button quiet', text: '‹ Back', attrs: { href: '#/' } }), el('h1', { text: 'Sprite gallery' })),
    section('All sprites (4×)', ...allSprites),
    section('Bodies × faces', ...faces),
    section('Outfits on every body and face', ...outfits),
    el('section', { class: 'stack' }, el('h2', { text: 'Items, effects, icons and room in the scene' }), animationButtons, el('div', { class: 'gallery-grid' }, ...sceneItems)),
    section('Adventure scenes', ...adventureScenes),
    section('Sunday: church (prays for 2 s every 7 s)', ...churchScenes),
    section('Sunday: prayer pose with every outfit', ...prayerPoses),
  );

  return {
    element,
    update() {},
    destroy() {
      scenes.forEach((scene) => scene.destroy());
    },
  };
}
