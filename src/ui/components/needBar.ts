import { LOW_NEED_BELOW } from '../../game/constants';
import { el, setHidden } from '../dom';

export interface NeedBar {
  element: HTMLElement;
  update(value: number, paused: boolean): void;
}

const SEGMENTS = 10;

export function createNeedBar(label: string, className: string): NeedBar {
  const segments = Array.from({ length: SEGMENTS }, () => el('span', { class: 'need-segment' }));
  const meter = el('div', { class: 'need-bar', attrs: { role: 'meter', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-label': label } }, ...segments);
  const paused = el('span', { class: 'muted', text: 'Paused' });
  const element = el('div', { class: `need ${className}` }, el('div', { class: 'need-label' }, el('span', { text: label }), paused), meter);

  return {
    element,
    update(value, isPaused) {
      const rounded = Math.round(value);
      meter.setAttribute('aria-valuenow', String(rounded));
      meter.setAttribute('aria-valuetext', isPaused ? `${rounded} of 100, paused` : `${rounded} of 100`);
      const filled = Math.ceil(rounded / (100 / SEGMENTS));
      segments.forEach((segment, index) => segment.classList.toggle('filled', index < filled));
      element.classList.toggle('low', value < LOW_NEED_BELOW);
      setHidden(paused, !isPaused);
    },
  };
}
