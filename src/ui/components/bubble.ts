import { el } from '../dom';

const BUBBLE_MS = 2000;
const timers = new WeakMap<HTMLElement, number>();

export function showBubble(container: HTMLElement, text: string): void {
  let bubble = container.querySelector<HTMLElement>('.bubble');
  if (!bubble) {
    bubble = el('p', { class: 'bubble', attrs: { role: 'status' } });
    container.append(bubble);
  }
  bubble.textContent = text;
  bubble.hidden = false;
  clearTimeout(timers.get(container));
  const shown = bubble;
  timers.set(
    container,
    window.setTimeout(() => {
      shown.hidden = true;
    }, BUBBLE_MS),
  );
}
