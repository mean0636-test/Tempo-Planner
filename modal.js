/* ==========================================================================
   MODAL — dialogs with blur backdrop, fade + scale animation, focus trap,
   Esc to close. Used by every form (tasks, notes, categories, reminders).

   const m = openModal({ title, body, footer, size: 'md', onMount(root){}, beforeClose(){} })
   m.close()
   confirmDialog({ title, message, confirmLabel, danger }) → Promise<boolean>
   ========================================================================== */
import { esc, el, $$ } from './dom.js';
import { icon } from './icons.js';
import { t } from '../core/i18n.js';

const stack = [];
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])';

export const hasOpenModal = () => stack.length > 0;

export function openModal({ title = '', body = '', footer = '', size = 'md', cls = '', onMount, beforeClose, onClose, label } = {}) {
  const previousFocus = document.activeElement;
  const titleId = `modal-title-${Date.now()}`;
  const root = el(`<div class="modal-layer ${cls}">
    <div class="modal-backdrop" data-close></div>
    <div class="modal modal--${size}" role="dialog" aria-modal="true" ${title ? `aria-labelledby="${titleId}"` : `aria-label="${esc(label || 'Dialog')}"`}>
      ${title ? `<header class="modal__head"><h2 class="modal__title" id="${titleId}">${esc(title)}</h2>
        <button type="button" class="icon-btn" data-close aria-label="${esc(t('common.close'))}">${icon('x')}</button></header>` : ''}
      <div class="modal__body">${body}</div>
      ${footer ? `<footer class="modal__foot">${footer}</footer>` : ''}
    </div>
  </div>`);

  let closed = false;
  const api = {
    root,
    async close(force = false) {
      if (closed) return;
      if (!force && beforeClose && (await beforeClose()) === false) return;
      closed = true;
      document.removeEventListener('keydown', onKey, true);
      stack.splice(stack.indexOf(api), 1);
      root.classList.add('is-leaving');
      const done = () => {
        root.remove();
        if (!stack.length) document.body.classList.remove('modal-open');
        previousFocus?.focus?.({ preventScroll: true });
        onClose?.();
      };
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) done();
      else setTimeout(done, 180);
    },
  };

  function onKey(e) {
    if (stack[stack.length - 1] !== api) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      api.close();
    } else if (e.key === 'Tab') {
      const items = $$(FOCUSABLE, root).filter((n) => n.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) api.close();
  });
  document.addEventListener('keydown', onKey, true);
  document.body.appendChild(root);
  document.body.classList.add('modal-open');
  stack.push(api);
  onMount?.(root, api);
  requestAnimationFrame(() => {
    const target = root.querySelector('[autofocus]') || root.querySelector(FOCUSABLE);
    target?.focus({ preventScroll: true });
  });
  return api;
}

export function confirmDialog({ title, message = '', confirmLabel = t('common.delete'), danger = true, emoji = '🗑️' }) {
  return new Promise((resolve) => {
    let answer = false;
    const m = openModal({
      size: 'sm',
      cls: 'modal-layer--confirm',
      label: title,
      body: `<div class="confirm">
        <div class="confirm__icon ${danger ? 'is-danger' : ''}" aria-hidden="true">${emoji}</div>
        <h2 class="confirm__title">${esc(title)}</h2>
        ${message ? `<p class="confirm__text">${esc(message)}</p>` : ''}
        <div class="confirm__actions">
          <button type="button" class="btn btn--secondary btn--md" data-close>${esc(t('common.cancel'))}</button>
          <button type="button" class="btn ${danger ? 'btn--danger' : 'btn--primary'} btn--md" data-confirm autofocus>${esc(confirmLabel)}</button>
        </div></div>`,
      onMount(root) {
        root.querySelector('[data-confirm]').addEventListener('click', () => {
          answer = true;
          m.close(true);
        });
      },
      onClose: () => resolve(answer),
    });
  });
}
