import { playSound } from '../../audio/sfx';
import { adventureBlocker } from '../../game/actions';
import type { AdventureInfo } from '../../game/catalog';
import { ADVENTURES, getAdventure, getOutfit } from '../../game/catalog';
import { TEEN_AGE_MS } from '../../game/constants';
import { ageMs } from '../../game/stage';
import type { Bunny, GameState } from '../../game/types';
import { adventureIconKey } from '../../render/spriteManifest';
import { navigate, routeHash } from '../../router';
import { confirmDialog } from '../components/dialog';
import { button, el, setHidden, setText } from '../dom';
import { formatCountdown, formatDuration } from '../format';
import { spriteCanvas } from '../pixelCanvas';
import type { AppContext, Screen } from '../screen';

function blockerText(bunny: Bunny, now: number): string | null {
  switch (adventureBlocker(bunny, now)) {
    case 'away':
      return `${bunny.name} is on ${getAdventure(bunny.adventure!.id).name}. Back in ${formatCountdown(bunny.adventure!.endsAt - now)}.`;
    case 'baby':
      return `Adventures unlock when ${bunny.name} is a teen (in ${formatCountdown(TEEN_AGE_MS - ageMs(bunny, now))}).`;
    case 'asleep':
      return `${bunny.name} is asleep.`;
    case 'sick':
      return `${bunny.name} is sick.`;
    case 'depressed':
      return `${bunny.name} is feeling down.`;
    case null:
      return null;
  }
}

export function topBar(title: string): HTMLElement {
  return el('header', { class: 'top-bar' }, el('a', { class: 'button quiet', text: '‹ Back', attrs: { href: routeHash('home') } }), el('h1', { text: title }));
}

export function createAdventuresScreen(ctx: AppContext): Screen {
  const banner = el('p', { class: 'banner' });
  const list = el('div', { class: 'adventure-list' });

  async function start(adventure: AdventureInfo): Promise<void> {
    const bunny = ctx.store.getState().bunny;
    if (!bunny) return;
    const send = await confirmDialog({
      message: `Send ${bunny.name} on ${adventure.name}? Back in ${formatDuration(adventure.durationMs)}. Needs pause while ${bunny.name} is away.`,
      confirmLabel: 'Send',
      cancelLabel: 'Not now',
    });
    if (!send || ctx.store.dispatch({ type: 'startAdventure', id: adventure.id }) !== 'ok') return;
    playSound('fanfare');
    navigate('home');
  }

  const cards = ADVENTURES.map((adventure) => {
    const reward = el('p');
    const startButton = button('Start', () => void start(adventure));
    startButton.setAttribute('aria-label', `Start ${adventure.name}`);
    const icon = spriteCanvas(adventureIconKey(adventure.id), 64);
    icon.classList.add('icon');
    const card = el(
      'article',
      { class: 'panel adventure-card' },
      icon,
      el('h2', { text: adventure.name }),
      el('p', { text: adventure.flavour }),
      el('p', { text: `Takes ${formatDuration(adventure.durationMs)}` }),
      reward,
      startButton,
    );
    list.append(card);
    return { adventure, reward, startButton };
  });

  const element = el('main', { class: 'screen adventures' }, topBar('Adventures'), banner, list);

  return {
    element,
    update(state: GameState) {
      const bunny = state.bunny;
      if (!bunny) return;
      const now = ctx.now();
      const text = blockerText(bunny, now);
      setHidden(banner, text === null);
      if (text) setText(banner, text);
      list.classList.toggle('dimmed', adventureBlocker(bunny, now) === 'baby');
      for (const { adventure, reward, startButton } of cards) {
        const found = bunny.wardrobe.includes(adventure.outfitId);
        setText(reward, found ? 'Found ✓ · Happiness boost' : `Reward: ${getOutfit(adventure.outfitId).name}`);
        startButton.disabled = text !== null;
      }
    },
  };
}
