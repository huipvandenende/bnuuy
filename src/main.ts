import '@fontsource/pixelify-sans/400.css';
import '@fontsource/pixelify-sans/700.css';
import './styles/main.css';
import { playSound, setSoundEnabled, unlockAudioOnFirstGesture } from './audio/sfx';
import { getBrowserStorage } from './browserStorage';
import { clock } from './clock';
import { SAVE_KEY } from './game/storage';
import { startRenderLoop } from './render/loop';
import { preloadSprites } from './render/sprites';
import { registerSW } from 'virtual:pwa-register';
import { createStore } from './store';
import { startApp } from './ui/app';
import { button, el } from './ui/dom';

registerSW({ immediate: true });

const root = document.querySelector<HTMLElement>('#app')!;

function showLoadError(): void {
  root.replaceChildren(
    el('div', { class: 'fatal' }, el('p', { text: "Couldn't load bnuuy. Check your connection and reload." }), button('Reload', () => location.reload())),
  );
}

async function start(): Promise<void> {
  root.replaceChildren(el('p', { class: 'loading', text: 'Loading…' }));
  try {
    await preloadSprites();
  } catch {
    showLoadError();
    return;
  }

  const dev = new URLSearchParams(location.search).get('dev') === '1';
  const store = createStore(getBrowserStorage(), () => clock.now());
  setSoundEnabled(store.getState().settings.soundOn);
  store.subscribe((state) => setSoundEnabled(state.settings.soundOn));
  unlockAudioOnFirstGesture();

  startApp(root, store, dev);
  startRenderLoop();

  window.setInterval(() => store.tick(), 1000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') store.tick();
  });
  window.addEventListener('storage', (event) => {
    if (event.key === SAVE_KEY) store.reload();
  });
  void navigator.storage?.persist?.();

  if (dev) Object.assign(window, { bnuuy: { store, clock, playSound } });
}

void start();
