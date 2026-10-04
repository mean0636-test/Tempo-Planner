/* ==========================================================================
   DROPDOWN — small menus anchored to a button (task ⋮ menu, profile menu,
   notifications panel). Closes on outside click / Esc. Arrow keys move focus.

   openDropdown(anchorButton, {
     items: [{ label, icon, onClick, danger }, 'divider'],
     // or: html: '<div>custom content</div>', onMount(root){}
   })
   ========================================================================== */
import { esc, el, $$ } from './dom.js';
import { icon } from './icons.js';

let active = null;

export function closeDropdown() {
  if (!active) return;
  const { node, anchor, cleanup } = active;
  active = null;
  cleanup();
  anchor.setAttribute('aria-expanded', 'false');
  node.classList.add('is-leaving');
  setTimeout(() => node.remove(), 140);
}

export function openDropdown(anchor, { items = [], html = '', align = 'end', width, onMount, cls = '' }) {
  const wasSame = active?.anchor === anchor;
  closeDropdown();
  if (wasSame) return null; // clicking the same button toggles it closed

  const node = el(`<div class="dropdown ${cls}" role="menu" ${width ? `style="width:${width}px"` : ''}>
    ${html || items.map((item, i) => (item === 'divider'
      ? '<div class="dropdown__divider" role="separator"></div>'
      : `<button type="button" role="menuitem" class="dropdown__item ${item.danger ? 'is-danger' : ''}" data-index="${i}">
          ${item.icon ? icon(item.icon, { size: 16 }) : ''}<span>${esc(item.label)}</span>${item.hint ? `<kbd>${esc(item.hint)}</kbd>` : ''}</button>`)).join('')}
  </div>`);
  document.body.appendChild(node);

  // Position under (or above) the anchor, kept inside the viewport
  const r = anchor.getBoundingClientRect();
  const w = node.offsetWidth;
  const h = node.offsetHeight;
  let left = align === 'end' ? r.right - w : r.left;
  left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
  let top = r.bottom + 6;
  if (top + h > window.innerHeight - 8) top = Math.max(8, r.top - h - 6);
  node.style.left = `${left}px`;
  node.style.top = `${top}px`;
  anchor.setAttribute('aria-expanded', 'true');

  node.addEventListener('click', (e) => {
    const btn = e.target.closest('.dropdown__item[data-index]');
    if (!btn) return;
    const item = items[Number(btn.dataset.index)];
    closeDropdown();
    item?.onClick?.();
  });

  const onDocClick = (e) => {
    if (!node.contains(e.target) && !anchor.contains(e.target)) closeDropdown();
  };
  const onKey = (e) => {
    if (e.key === 'Escape') {
      closeDropdown();
      anchor.focus();
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const list = $$('.dropdown__item', node);
      if (!list.length) return;
      e.preventDefault();
      const i = list.indexOf(document.activeElement);
      const next = e.key === 'ArrowDown' ? (i + 1) % list.length : (i - 1 + list.length) % list.length;
      list[next].focus();
    }
  };
  // Close when the page really scrolls (ignore tiny/momentum scrolls right after opening)
  const openedAt = performance.now();
  const startY = window.scrollY;
  const onScroll = (e) => {
    if (e?.type === 'scroll' && (performance.now() - openedAt < 250 || Math.abs(window.scrollY - startY) < 40)) return;
    closeDropdown();
  };
  setTimeout(() => document.addEventListener('click', onDocClick), 0);
  document.addEventListener('keydown', onKey);
  window.addEventListener('resize', onScroll);
  window.addEventListener('scroll', onScroll, { passive: true });

  active = {
    node, anchor,
    cleanup() {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('scroll', onScroll);
    },
  };
  onMount?.(node);
  node.querySelector('.dropdown__item')?.focus({ preventScroll: true });
  return node;
}
