import type { SoundName } from '../../audio/sfx';
import { playSound } from '../../audio/sfx';
import { getAdventure } from '../../game/catalog';
import { ageMs, stageAt } from '../../game/stage';
import type { ActionResult, Bunny, GameAction, GameState, Needs, RefusalReason } from '../../game/types';
import type { OneShotAnimation } from '../../render/scene';
import { createScene, describeScene, sceneViewOf } from '../../render/scene';
import { routeHash, type Route } from '../../router';
import { showBubble } from '../components/bubble';
import { showEventCard } from '../components/eventCard';
import { createNeedBar } from '../components/needBar';
import { el, setHidden, setText } from '../dom';
import { capitalize, formatCountdown, formatDuration } from '../format';
import { spriteCanvas } from '../pixelCanvas';
import type { AppContext, Screen } from '../screen';

let eventCardOpen = false;

function refusalText(reason: RefusalReason, name: string): string | null {
  switch (reason) {
    case 'full':
      return `${name} is full!`;
    case 'tired':
      return `${name} is too tired to play.`;
    case 'not-sleepy':
      return `${name} isn't sleepy.`;
    case 'not-sick':
      return `${name} isn't sick.`;
    default:
      return null;
  }
}

export function stageLabel(bunny: Bunny, now: number): string {
  const stage = stageAt(bunny, now);
  return stage === 'adult' ? `Adult (${capitalize(bunny.adultVariant ?? 'normal')})` : capitalize(stage);
}

function navLink(label: string, icon: string, route: Route): HTMLAnchorElement {
  return el('a', { class: 'icon-button', attrs: { href: routeHash(route) } }, spriteCanvas(icon, 32), el('span', { text: label }));
}

function actionButton(label: string, icon: string, onClick: () => void): HTMLButtonElement {
  return el('button', { class: 'icon-button', attrs: { type: 'button' }, on: { click: onClick } }, spriteCanvas(icon, 32), el('span', { text: label }));
}

export function createHomeScreen(ctx: AppContext): Screen {
  const name = el('h1');
  const subtitle = el('p');
  const header = el(
    'header',
    { class: 'home-header' },
    el('div', { class: 'home-title' }, name, subtitle),
    el('nav', { class: 'nav', attrs: { 'aria-label': 'Menu' } }, navLink('Adventures', 'icon-map', 'adventures'), navLink('Wardrobe', 'icon-hanger', 'wardrobe'), navLink('Settings', 'icon-gear', 'settings')),
  );

  const sleepingChip = el('span', { class: 'chip', text: 'Sleeping' });
  const sickChip = el('span', { class: 'chip sick', text: 'Sick: give medicine' });
  const downChip = el('span', { class: 'chip down', text: 'Feeling down: play to cheer up' });
  const chips = el('div', { class: 'chips' }, sleepingChip, sickChip, downChip);

  const canvas = el('canvas', { class: 'pixel', attrs: { role: 'img' } });
  const awayText = el('p');
  const awayCard = el('div', { class: 'panel away-card' }, awayText);
  const sceneWrap = el('div', { class: 'scene-wrap' }, canvas, awayCard);
  const scene = createScene(canvas);

  const bars: Record<keyof Needs, ReturnType<typeof createNeedBar>> = {
    hunger: createNeedBar('Tummy', 'tummy'),
    happiness: createNeedBar('Happy', 'happy'),
    cleanliness: createNeedBar('Clean', 'clean'),
    energy: createNeedBar('Energy', 'energy'),
  };
  const needs = el('section', { class: 'needs', attrs: { 'aria-label': 'Needs' } }, ...Object.values(bars).map((bar) => bar.element));

  function act(action: GameAction, sound: SoundName, animation?: OneShotAnimation): void {
    if (animation === 'clean') scene.play('clean');
    const result: ActionResult = ctx.store.dispatch(action);
    if (result === 'ok') {
      if (animation && animation !== 'clean') scene.play(animation);
      playSound(sound);
      return;
    }
    scene.play('refuse');
    playSound('refuse');
    const bunny = ctx.store.getState().bunny;
    const text = bunny && refusalText(result.refused, bunny.name);
    if (text) showBubble(sceneWrap, text);
  }

  const feedButton = actionButton('Feed', 'item-carrot', () => act({ type: 'feed' }, 'feed', 'feed'));
  const playButton = actionButton('Play', 'icon-ball', () => act({ type: 'play' }, 'play', 'play'));
  const cleanButton = actionButton('Clean', 'icon-broom', () => act({ type: 'clean' }, 'clean', 'clean'));
  const moonIcon = spriteCanvas('icon-moon', 32);
  const sunIcon = spriteCanvas('icon-sun', 32);
  const sleepLabel = el('span', { text: 'Sleep' });
  const sleepButton = el(
    'button',
    {
      class: 'icon-button',
      attrs: { type: 'button' },
      on: { click: () => (ctx.store.getState().bunny?.asleep ? act({ type: 'wake' }, 'wake') : act({ type: 'sleep' }, 'sleep')) },
    },
    moonIcon,
    sunIcon,
    sleepLabel,
  );
  const medicineButton = actionButton('Medicine', 'item-medicine', () => act({ type: 'medicine' }, 'medicine', 'medicine'));
  const actions = el('nav', { class: 'actions', attrs: { 'aria-label': 'Care' } }, feedButton, playButton, cleanButton, sleepButton, medicineButton);

  const element = el('main', { class: 'screen home' }, header, chips, sceneWrap, needs, actions);

  function showNextEvent(bunny: Bunny, now: number): void {
    const event = bunny.events[0];
    if (!event || eventCardOpen) return;
    eventCardOpen = true;
    playSound(event.type === 'grew-up' ? 'growUp' : 'fanfare');
    void showEventCard(event, bunny, now).then(() => {
      eventCardOpen = false;
      ctx.store.dispatch({ type: 'dismissEvent' });
    });
  }

  return {
    element,
    update(state: GameState) {
      const bunny = state.bunny;
      if (!bunny) return;
      const now = ctx.now();
      const away = bunny.adventure !== null;

      setText(name, bunny.name);
      setText(subtitle, `${stageLabel(bunny, now)} · ${formatDuration(ageMs(bunny, now))}`);

      setHidden(sleepingChip, !bunny.asleep);
      setHidden(sickChip, !bunny.sick);
      setHidden(downChip, !bunny.depressed);
      setHidden(chips, !bunny.asleep && !bunny.sick && !bunny.depressed);

      scene.setView(sceneViewOf(bunny, now));
      canvas.setAttribute('aria-label', describeScene(bunny, now));
      setHidden(awayCard, !away);
      if (bunny.adventure) {
        setText(awayText, `${bunny.name} is on ${getAdventure(bunny.adventure.id).name}. Back in ${formatCountdown(bunny.adventure.endsAt - now)}.`);
      }

      for (const key of Object.keys(bars) as (keyof Needs)[]) bars[key].update(bunny.needs[key], away);

      for (const button of [feedButton, playButton, cleanButton, medicineButton]) button.disabled = away || bunny.asleep;
      sleepButton.disabled = away;
      setText(sleepLabel, bunny.asleep ? 'Wake' : 'Sleep');
      setHidden(moonIcon, bunny.asleep);
      setHidden(sunIcon, !bunny.asleep);

      showNextEvent(bunny, now);
    },
    destroy() {
      scene.destroy();
    },
  };
}
