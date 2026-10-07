import { createScene } from '../../render/scene';
import { navigate } from '../../router';
import { createSaveCodeLoader } from '../components/saveCodeLoader';
import { el } from '../dom';
import type { AppContext, Screen } from '../screen';

export function createAdoptScreen(ctx: AppContext): Screen {
  const canvas = el('canvas', { class: 'pixel', attrs: { role: 'img', 'aria-label': 'A baby bunny waits for a name.' } });
  const sceneWrap = el('div', { class: 'scene-wrap' }, canvas);
  const scene = createScene(canvas);
  scene.setView({ body: 'baby', mood: 'content', outfit: null, droppings: 0, asleep: false, depressed: false, away: false });

  const input = el('input', {
    attrs: { type: 'text', id: 'bunny-name', placeholder: 'Name your bunny', autocomplete: 'off', enterkeyhint: 'done', 'aria-describedby': 'name-error' },
  });
  const nameError = el('p', { class: 'error', text: 'Pick a name of 1 to 16 characters.', attrs: { id: 'name-error', role: 'alert' } });
  nameError.hidden = true;

  const form = el(
    'form',
    { class: 'stack', attrs: { novalidate: '' } },
    el('label', { text: 'Name', attrs: { for: 'bunny-name', class: 'muted' } }),
    input,
    nameError,
    el('button', { class: 'button', text: 'Adopt', attrs: { type: 'submit' } }),
  );
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const adopted = ctx.store.dispatch({ type: 'adopt', name: input.value }) === 'ok';
    nameError.hidden = adopted;
    if (adopted) navigate('home');
  });

  const loader = createSaveCodeLoader(ctx);
  loader.hidden = true;
  const toggle = el('button', {
    class: 'link',
    text: 'Have a save code?',
    attrs: { type: 'button', 'aria-expanded': 'false' },
    on: {
      click: () => {
        loader.hidden = !loader.hidden;
        toggle.setAttribute('aria-expanded', String(!loader.hidden));
      },
    },
  });

  const element = el('main', { class: 'screen adopt' }, el('h1', { text: 'bnuuy' }), sceneWrap, form, toggle, loader);

  return {
    element,
    update() {},
    destroy() {
      scene.destroy();
    },
  };
}
