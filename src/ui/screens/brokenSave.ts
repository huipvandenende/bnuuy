import { createSaveCodeLoader } from '../components/saveCodeLoader';
import { button, el } from '../dom';
import type { AppContext, Screen } from '../screen';

export function createBrokenSaveScreen(ctx: AppContext): Screen {
  const loader = createSaveCodeLoader(ctx);
  loader.hidden = true;
  const element = el(
    'main',
    { class: 'screen broken' },
    el('h1', { text: 'bnuuy' }),
    el(
      'div',
      { class: 'panel stack' },
      el('p', { text: "Your save couldn't be read." }),
      el(
        'div',
        { class: 'row' },
        button('Load a save code', () => {
          loader.hidden = false;
          loader.querySelector('textarea')?.focus();
        }),
        button('Start over', () => ctx.store.dispatch({ type: 'startOver' }), 'button quiet'),
      ),
    ),
    loader,
  );
  return { element, update() {} };
}
