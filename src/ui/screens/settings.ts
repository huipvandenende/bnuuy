import { encodeSaveCode } from '../../game/saveCode';
import type { GameState } from '../../game/types';
import { navigate } from '../../router';
import { confirmDialog } from '../components/dialog';
import { createSaveCodeLoader } from '../components/saveCodeLoader';
import { button, el, setText } from '../dom';
import type { AppContext, Screen } from '../screen';
import { topBar } from './adventures';

export function createSettingsScreen(ctx: AppContext): Screen {
  const soundInput = el('input', { attrs: { type: 'checkbox', role: 'switch' } });
  soundInput.addEventListener('change', () => ctx.store.dispatch({ type: 'setSound', on: soundInput.checked }));
  const soundSwitch = el('label', { class: 'switch' }, el('span', { text: 'Sound effects' }), soundInput, el('span', { class: 'switch-track', attrs: { 'aria-hidden': 'true' } }));

  const codeArea = el('textarea', { attrs: { readonly: '', rows: '5', 'aria-label': 'Your save code', spellcheck: 'false' } });
  const copyStatus = el('p', { attrs: { role: 'status' } });
  const copyButton = button('Copy', () => void copy());
  const codeBox = el('div', { class: 'stack' }, codeArea, copyButton, copyStatus);
  codeBox.hidden = true;
  const showButton = button(
    'Show save code',
    () => {
      codeArea.value = encodeSaveCode(ctx.store.getState());
      copyStatus.textContent = '';
      codeBox.hidden = false;
    },
    'button secondary',
  );

  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(codeArea.value);
      copyStatus.textContent = 'Copied!';
    } catch {
      codeArea.focus();
      codeArea.select();
      copyStatus.textContent = 'Select the code and copy it.';
    }
  }

  const goodbyeButton = button('Start over', () => void startOver(), 'button danger');

  async function startOver(): Promise<void> {
    const name = ctx.store.getState().bunny?.name ?? 'your bunny';
    const confirmed = await confirmDialog({
      message: `Say goodbye to ${name}? This can't be undone. Copy your save code first if you might want ${name} back.`,
      confirmLabel: 'Start over',
      cancelLabel: 'Cancel',
      danger: true,
    });
    if (!confirmed) return;
    ctx.store.dispatch({ type: 'startOver' });
    navigate('home');
  }

  const element = el(
    'main',
    { class: 'screen settings' },
    topBar('Settings'),
    el('section', { class: 'panel stack' }, el('h2', { text: 'Sound' }), soundSwitch),
    el('section', { class: 'panel stack' }, el('h2', { text: 'Save code' }), showButton, codeBox, createSaveCodeLoader(ctx)),
    el('section', { class: 'panel stack' }, el('h2', { text: 'Start over' }), goodbyeButton),
    el('p', { class: 'footer muted', text: `bnuuy v${__APP_VERSION__}` }),
  );
  const startOverText = el('p');
  goodbyeButton.before(startOverText);

  return {
    element,
    update(state: GameState) {
      soundInput.checked = state.settings.soundOn;
      setText(startOverText, state.bunny ? `Say goodbye to ${state.bunny.name} and adopt a new bunny.` : 'Adopt a new bunny.');
    },
  };
}
