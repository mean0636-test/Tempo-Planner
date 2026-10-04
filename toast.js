/* ==========================================================================
   TOASTS — small messages in the bottom-right (bottom-centre on mobile).
   toast('Task completed', { icon: 'check', type: 'success',
                            action: { label: 'Undo', onClick: () => ... } })
   ========================================================================== */
import { esc, el } from './dom.js';
import { icon } from './icons.js';

const MAX = 3;
let region = null;

function getRegion() {
  if (!region) {
    region = el('<div class="toast-region" role="status" aria-live="polite"></div>');
    document.body.appendChild(region);
  }
  return region;
}

export function toast(message, { icon: ic = 'check', type = 'default', title = '', action = null, duration = 3800 } = {}) {
  const r = getRegion();
  const node = el(`<div class="toast toast--${type}">
    <span class="toast__icon">${icon(ic, { size: 16 })}</span>
    <div class="toast__body">${title ? `<strong>${esc(title)}</strong>` : ''}<span>${esc(message)}</span></div>
    ${action ? `<button type="button" class="toast__action">${esc(action.label)}</button>` : ''}
    <button type="button" class="toast__close" aria-label="Dismiss">${icon('x', { size: 14 })}</button>
  </div>`);

  let timer;
  const close = () => {
    clearTimeout(timer);
    node.classList.add('is-leaving');
    node.addEventListener('animationend', () => node.remove(), { once: true });
    setTimeout(() => node.remove(), 400); // fallback when animations are off
  };
  node.querySelector('.toast__close').addEventListener('click', close);
  if (action) {
    node.querySelector('.toast__action').addEventListener('click', () => {
      action.onClick();
      close();
    });
  }
  // Pause the timer while the pointer is over the toast
  const start = () => { timer = setTimeout(close, duration); };
  node.addEventListener('mouseenter', () => clearTimeout(timer));
  node.addEventListener('mouseleave', start);

  r.appendChild(node);
  while (r.children.length > MAX) r.firstElementChild.remove();
  start();
  return close;
}
