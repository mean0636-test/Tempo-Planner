/* ==========================================================================
   QUICK ADD — the floating "+" button (desktop/tablet) and the centre "+"
   in the mobile bottom bar. Both open the same menu.
   Styles: css/components.css → "Quick add".
   ========================================================================== */
import { registerActions } from '../core/events.js';
import { t } from '../core/i18n.js';
import { esc } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { openTaskForm } from './tasks.js';
import { openNoteForm } from './notes.js';
import { openReminderForm } from './reminders.js';

const ITEMS = [
  { id: 'task', icon: 'tasks', key: 'quick.task', hint: 'N', run: () => openTaskForm() },
  { id: 'note', icon: 'note', key: 'quick.note', run: () => openNoteForm() },
  { id: 'checklist', icon: 'checklist', key: 'quick.checklist', run: () => openNoteForm(null, { checklist: true }) },
  { id: 'reminder', icon: 'bell', key: 'quick.reminder', run: () => openReminderForm() },
];

export function quickAddHtml() {
  return `<div class="quick" data-open="false">
    <div class="quick__scrim" data-action="close-quick"></div>
    <div class="quick__menu" id="quick-menu" role="menu" aria-label="${esc(t('quick.title'))}">
      ${ITEMS.map((it, i) => `<button type="button" class="quick__item quick__item--${it.id}" role="menuitem" data-action="quick-item" data-item="${it.id}" style="--i:${ITEMS.length - 1 - i}">
        <span class="quick__label">${esc(t(it.key))}</span><span class="quick__icon">${icon(it.icon, { size: 19 })}</span></button>`).join('')}
    </div>
    <button type="button" class="fab" data-action="toggle-quick" aria-haspopup="menu" aria-expanded="false" aria-controls="quick-menu" aria-label="${esc(t('quick.title'))}">
      ${icon('plus', { size: 26 })}
    </button>
  </div>`;
}

function setOpen(open) {
  const root = document.querySelector('.quick');
  if (!root) return;
  root.dataset.open = String(open);
  document.querySelectorAll('[data-action="toggle-quick"]').forEach((b) => b.setAttribute('aria-expanded', String(open)));
  if (open) root.querySelector('.quick__item')?.focus({ preventScroll: true });
}

export const isQuickOpen = () => document.querySelector('.quick')?.dataset.open === 'true';

registerActions({
  'toggle-quick': () => setOpen(!isQuickOpen()),
  'close-quick': () => setOpen(false),
  'quick-item': (el) => {
    setOpen(false);
    ITEMS.find((it) => it.id === el.dataset.item)?.run();
  },
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isQuickOpen()) {
    setOpen(false);
    document.querySelector('.fab')?.focus();
  }
});
