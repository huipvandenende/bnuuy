import { button, el } from '../dom';

interface ConfirmOptions {
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean;
}

let nextLabelId = 0;

export function openDialog(content: HTMLElement, label: HTMLElement, onClose: () => void): HTMLDialogElement {
  label.id ||= `dialog-label-${nextLabelId++}`;
  const dialog = el('dialog', { attrs: { 'aria-labelledby': label.id } }, content);
  dialog.addEventListener('close', () => {
    dialog.remove();
    onClose();
  });
  document.body.append(dialog);
  dialog.showModal();
  return dialog;
}

export function confirmDialog({ message, confirmLabel, cancelLabel, danger = false }: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    let confirmed = false;
    const cancel = button(cancelLabel, () => dialog.close(), 'button quiet');
    const confirm = button(
      confirmLabel,
      () => {
        confirmed = true;
        dialog.close();
      },
      danger ? 'button danger' : 'button',
    );
    cancel.autofocus = true;
    const text = el('p', { text: message });
    const dialog = openDialog(el('div', { class: 'stack' }, text, el('div', { class: 'row' }, cancel, confirm)), text, () => resolve(confirmed));
  });
}
