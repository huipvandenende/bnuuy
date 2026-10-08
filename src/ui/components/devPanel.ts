import type { Clock } from '../../clock';
import { isSundayForced, setSundayForced } from '../../devFlags';
import { DAY_MS, HOUR_MS, MINUTE_MS } from '../../game/constants';
import { droppingsCount, moodOf } from '../../game/mood';
import { stageAt } from '../../game/stage';
import type { Bunny, GameState } from '../../game/types';
import { routeHash } from '../../router';
import type { Store } from '../../store';
import { button, el } from '../dom';
import { formatDuration } from '../format';

const SKIPS: [string, number][] = [
  ['+10 min', 10 * MINUTE_MS],
  ['+1 h', HOUR_MS],
  ['+6 h', 6 * HOUR_MS],
  ['+1 day', DAY_MS],
  ['+4 days', 4 * DAY_MS],
];

function yesNo(value: boolean): string {
  return value ? 'yes' : 'no';
}

function readout(state: GameState, clock: Clock): string {
  const now = clock.now();
  const lines = [`Clock: ${new Date(now).toLocaleString()}`, `Offset: ${formatDuration(clock.getOffset())}`];
  const bunny = state.bunny;
  if (!bunny) return [...lines, 'No bunny'].join('\n');
  const { hunger, happiness, cleanliness, energy } = bunny.needs;
  const adventure = bunny.adventure ? `${bunny.adventure.id}, ${formatDuration(bunny.adventure.endsAt - now)} left` : 'none';
  return [
    ...lines,
    `Tummy ${Math.round(hunger)} · Happy ${Math.round(happiness)} · Clean ${Math.round(cleanliness)} · Energy ${Math.round(energy)}`,
    `Stage ${stageAt(bunny, now)} · Mood ${moodOf(bunny)} · Droppings ${droppingsCount(bunny.needs.cleanliness)}`,
    `Asleep ${yesNo(bunny.asleep)} · Sick ${yesNo(bunny.sick)} · Depressed ${yesNo(bunny.depressed)}`,
    `Adventure: ${adventure}`,
  ].join('\n');
}

function healthy(bunny: Bunny): Bunny {
  return {
    ...bunny,
    needs: { hunger: 100, happiness: 100, cleanliness: 100, energy: 100 },
    asleep: false,
    sick: false,
    depressed: false,
    zeroMs: { hunger: 0, cleanliness: 0, happiness: 0 },
  };
}

function emptied(bunny: Bunny): Bunny {
  return { ...bunny, needs: { hunger: 0, happiness: 0, cleanliness: 0, energy: 0 } };
}

export function mountDevPanel(store: Store, clock: Clock): void {
  const output = el('pre', { attrs: { 'aria-live': 'off' } });

  function replaceBunny(change: (bunny: Bunny) => Bunny): void {
    const state = store.getState();
    if (state.bunny) store.dispatch({ type: 'loadState', state: { ...state, bunny: change(state.bunny) } });
  }

  const sundayInput = el('input', { attrs: { type: 'checkbox', role: 'switch' } });
  sundayInput.checked = isSundayForced();
  sundayInput.addEventListener('change', () => {
    setSundayForced(sundayInput.checked);
    store.tick();
  });
  const sundaySwitch = el('label', { class: 'switch' }, el('span', { text: 'Force Sunday' }), sundayInput, el('span', { class: 'switch-track', attrs: { 'aria-hidden': 'true' } }));

  const panel = el(
    'aside',
    { class: 'panel stack dev-panel', attrs: { 'aria-label': 'Developer tools' } },
    output,
    el(
      'div',
      { class: 'row' },
      ...SKIPS.map(([label, ms]) =>
        button(
          label,
          () => {
            clock.addOffset(ms);
            store.tick();
          },
          'button secondary',
        ),
      ),
    ),
    el('div', { class: 'row' }, button('Make healthy', () => replaceBunny(healthy), 'button secondary'), button('Empty needs', () => replaceBunny(emptied), 'button secondary')),
    sundaySwitch,
    el('a', { class: 'link', text: 'Sprite gallery', attrs: { href: routeHash('dev-sprites') } }),
  );
  panel.hidden = true;

  const toggle = el('button', {
    class: 'dev-button',
    text: 'DEV',
    attrs: { type: 'button', 'aria-expanded': 'false' },
    on: {
      click: () => {
        panel.hidden = !panel.hidden;
        toggle.setAttribute('aria-expanded', String(!panel.hidden));
      },
    },
  });

  const render = (state: GameState) => {
    if (!panel.hidden) output.textContent = readout(state, clock);
  };
  toggle.addEventListener('click', () => render(store.getState()));
  store.subscribe(render);
  document.body.append(toggle, panel);
}
