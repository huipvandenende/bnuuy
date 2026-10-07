type Child = Node | string | null | undefined | false;

interface Props {
  class?: string;
  text?: string;
  attrs?: Record<string, string>;
  on?: Partial<Record<keyof HTMLElementEventMap, (event: Event) => void>>;
}

export function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Props = {}, ...children: Child[]): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (props.class) element.className = props.class;
  if (props.text !== undefined) element.textContent = props.text;
  for (const [name, value] of Object.entries(props.attrs ?? {})) element.setAttribute(name, value);
  for (const [name, handler] of Object.entries(props.on ?? {})) element.addEventListener(name, handler);
  for (const child of children) {
    if (child) element.append(child);
  }
  return element;
}

export function button(label: string, onClick: () => void, className = 'button'): HTMLButtonElement {
  return el('button', { class: className, text: label, attrs: { type: 'button' }, on: { click: onClick } });
}

export function setText(element: HTMLElement, text: string): void {
  if (element.textContent !== text) element.textContent = text;
}

export function setHidden(element: HTMLElement, hidden: boolean): void {
  if (element.hidden !== hidden) element.hidden = hidden;
}
