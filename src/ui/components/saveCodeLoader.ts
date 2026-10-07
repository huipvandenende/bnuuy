import { decodeSaveCode, SAVE_CODE_MESSAGES } from '../../game/saveCode';
import { navigate } from '../../router';
import { button, el } from '../dom';
import type { AppContext } from '../screen';
import { confirmDialog } from './dialog';

let nextId = 0;

export function createSaveCodeLoader(ctx: AppContext): HTMLElement {
  const id = `save-code-${nextId++}`;
  const textarea = el('textarea', { attrs: { id, rows: '4', spellcheck: 'false', autocomplete: 'off', placeholder: 'Paste your save code here' } });
  const error = el('p', { class: 'error', attrs: { role: 'alert' } });
  error.hidden = true;

  function showError(message: string): void {
    error.textContent = message;
    error.hidden = false;
  }

  async function load(): Promise<void> {
    error.hidden = true;
    const decoded = decodeSaveCode(textarea.value);
    if (!decoded.ok) return showError(SAVE_CODE_MESSAGES[decoded.error]);
    const current = ctx.store.getState().bunny;
    if (current) {
      const loadedName = decoded.state.bunny?.name ?? 'an empty save';
      const replace = await confirmDialog({ message: `Replace ${current.name} with ${loadedName}?`, confirmLabel: 'Replace', cancelLabel: 'Cancel' });
      if (!replace) return;
    }
    if (ctx.store.dispatch({ type: 'loadState', state: decoded.state }) !== 'ok') return showError(SAVE_CODE_MESSAGES.invalid);
    textarea.value = '';
    navigate('home');
  }

  return el('div', { class: 'stack' }, el('label', { text: 'Load a save code', attrs: { for: id } }), textarea, error, button('Load', () => void load()));
}
