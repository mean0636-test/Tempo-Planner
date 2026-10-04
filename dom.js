/* Small DOM helpers used everywhere. */

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
/** Always escape user text before putting it inside an HTML string. */
export const esc = (value = '') => String(value ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** Join class names, skipping falsy ones: cx('a', on && 'b') */
export const cx = (...names) => names.filter(Boolean).join(' ');

/** Turn an HTML string into a DOM element. */
export function el(html) {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  return tpl.content.firstElementChild;
}

export function debounce(fn, ms = 200) {
  let id;
  return (...args) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), ms);
  };
}

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Parse "english, study #Speaking" → ['english', 'study', 'Speaking'] */
export function parseTags(text) {
  return [...new Set(String(text || '').split(/[,\s]+/).map((t) => t.replace(/^#/, '').trim()).filter(Boolean))];
}

/** Count a number up from 0 for a nice dashboard effect. */
export function countUp(node, to, duration = 700) {
  if (prefersReducedMotion() || !Number.isFinite(to)) return;
  const suffix = node.dataset.suffix || '';
  const start = performance.now();
  const step = (now) => {
    const p = Math.min(1, (now - start) / duration);
    const eased = 1 - (1 - p) ** 3;
    node.textContent = `${Math.round(to * eased)}${suffix}`;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
