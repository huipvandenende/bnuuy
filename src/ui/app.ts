import { clock } from '../clock';
import type { GameState } from '../game/types';
import { parseRoute } from '../router';
import type { Store } from '../store';
import { mountDevPanel } from './components/devPanel';
import { el } from './dom';
import type { AppContext, Screen } from './screen';
import { createAdoptScreen } from './screens/adopt';
import { createAdventuresScreen } from './screens/adventures';
import { createBrokenSaveScreen } from './screens/brokenSave';
import { createDevSpritesScreen } from './screens/devSprites';
import { createHomeScreen } from './screens/home';
import { createSettingsScreen } from './screens/settings';
import { createWardrobeScreen } from './screens/wardrobe';

type ScreenKey = 'broken' | 'adopt' | 'home' | 'adventures' | 'wardrobe' | 'settings' | 'dev-sprites';

const FACTORIES: Record<ScreenKey, (ctx: AppContext) => Screen> = {
  broken: createBrokenSaveScreen,
  adopt: createAdoptScreen,
  home: createHomeScreen,
  adventures: createAdventuresScreen,
  wardrobe: createWardrobeScreen,
  settings: createSettingsScreen,
  'dev-sprites': createDevSpritesScreen,
};

function screenKeyFor(ctx: AppContext, state: GameState): ScreenKey {
  const route = parseRoute(location.hash);
  if (route === 'dev-sprites' && ctx.dev) return 'dev-sprites';
  if (ctx.store.isSaveBroken()) return 'broken';
  if (!state.bunny) return 'adopt';
  return route === 'dev-sprites' ? 'home' : route;
}

export function startApp(root: HTMLElement, store: Store, dev: boolean): void {
  const ctx: AppContext = { store, now: () => clock.now(), dev };
  const banner = el('p', { class: 'banner', text: 'Your browser is blocking saving. Your bunny will be lost when you close this tab.', attrs: { role: 'alert' } });
  let current: { key: ScreenKey; screen: Screen } | null = null;

  function render(): void {
    const state = store.getState();
    const key = screenKeyFor(ctx, state);
    if (current?.key !== key) {
      current?.screen.destroy?.();
      const screen = FACTORIES[key](ctx);
      root.replaceChildren(banner, screen.element);
      root.classList.toggle('wide', key === 'dev-sprites');
      current = { key, screen };
      window.scrollTo(0, 0);
    }
    banner.hidden = store.isStorageAvailable();
    current.screen.update(state);
  }

  store.subscribe(render);
  window.addEventListener('hashchange', render);
  render();
  if (dev) mountDevPanel(store, clock);
}
