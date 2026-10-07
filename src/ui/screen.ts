import type { GameState } from '../game/types';
import type { Store } from '../store';

export interface Screen {
  element: HTMLElement;
  update(state: GameState): void;
  destroy?(): void;
}

export interface AppContext {
  store: Store;
  now: () => number;
  dev: boolean;
}
