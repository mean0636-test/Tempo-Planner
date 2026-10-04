/* ==========================================================================
   CALENDAR PAGE — month grid with task dots coloured by category, a day
   panel listing that day's tasks, and "add task on this date".
   Styles: css/pages.css → "Calendar"
   ========================================================================== */
import { registerActions } from '../core/events.js';
import { t } from '../core/i18n.js';
import { todayKey, monthGrid, weekdayNames, monthLabel, formatDate, fromKey } from '../core/dates.js';
import { categoryById, sortTasks } from '../core/selectors.js';
import { ui, setUi } from '../core/uiState.js';
import { esc } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { taskList } from '../ui/taskCard.js';
import { emptyState, iconButton, button } from '../ui/components.js';
import { openTaskForm } from '../features/tasks.js';

function tasksByDate(state) {
  const map = new Map();
  for (const task of state.tasks) {
    if (!task.dueDate) continue;
    if (!map.has(task.dueDate)) map.set(task.dueDate, []);
    map.get(task.dueDate).push(task);
  }
  return map;
}

export function render(state) {
  const today = todayKey();
  const { year, month, direction } = ui.calendar;
  const selected = ui.calendar.selected || today;
  const weekStart = state.settings.weekStartsOn;
  // Drop the 6th week when it belongs entirely to the next month
  const grid = monthGrid(year, month, weekStart);
  const cells = grid.slice(35).some((c) => c.inMonth) ? grid : grid.slice(0, 35);
  const byDate = tasksByDate(state);
  const dayTasks = sortTasks(byDate.get(selected) || [], 'date');
  const openCount = (key) => (byDate.get(key) || []).filter((x) => !x.completed).length;
  const monthTasks = cells.filter((c) => c.inMonth).reduce((n, c) => n + (byDate.get(c.key) || []).length, 0);

  const cell = (c) => {
    const items = byDate.get(c.key) || [];
    const dots = items.slice(0, 3).map((task) => {
      const cat = categoryById(state, task.categoryId);
      return `<span class="cal-dot ${task.completed ? 'is-done' : ''}" style="--c: var(--c-${cat?.color || 'slate'})"></span>`;
    }).join('');
    const label = `${formatDate(c.key, { weekday: 'long', month: 'long', day: 'numeric' })}${items.length ? `, ${t('calendar.taskCount', { n: items.length })}` : ''}`;
    const isPast = c.key < today;
    const allDone = items.length && items.every((x) => x.completed);
    return `<button type="button" class="cal-cell ${c.inMonth ? '' : 'is-outside'} ${c.key === today ? 'is-today' : ''} ${c.key === selected ? 'is-selected' : ''} ${isPast ? 'is-past' : ''} ${allDone ? 'is-all-done' : ''}"
      data-action="cal-select" data-date="${c.key}" aria-label="${esc(label)}" aria-pressed="${c.key === selected}">
      <span class="cal-cell__num">${c.day}</span>
      ${items.length ? `<span class="cal-cell__dots">${dots}${items.length > 3 ? `<span class="cal-more">+${items.length - 3}</span>` : ''}</span>` : ''}
      ${items.length ? `<span class="cal-cell__titles">${items.slice(0, 2).map((x) => `<span class="${x.completed ? 'is-done' : ''}" style="--c: var(--c-${categoryById(state, x.categoryId)?.color || 'slate'})">${esc(x.title)}</span>`).join('')}</span>` : ''}
    </button>`;
  };

  const sel = fromKey(selected);
  return `<div class="calendar-page">
    <section class="cal-card">
      <header class="cal-head">
        <div>
          <h2 class="cal-head__month">${esc(monthLabel(year, month))}</h2>
          <p class="cal-head__sub">${esc(t('calendar.monthCount', { n: monthTasks }))}</p>
        </div>
        <div class="cal-head__nav">
          ${iconButton({ icon: 'chevronLeft', label: t('calendar.prev'), action: 'cal-prev' })}
          <button type="button" class="btn btn--secondary btn--sm" data-action="cal-today">${esc(t('date.today'))}</button>
          ${iconButton({ icon: 'chevronRight', label: t('calendar.next'), action: 'cal-next' })}
        </div>
      </header>
      <div class="cal-weekdays" aria-hidden="true">${weekdayNames(weekStart).map((d) => `<span>${esc(d)}</span>`).join('')}</div>
      <div class="cal-grid ${direction > 0 ? 'slide-next' : direction < 0 ? 'slide-prev' : ''}" role="grid" aria-label="${esc(monthLabel(year, month))}">
        ${cells.map(cell).join('')}
      </div>
      <p class="cal-tip">${icon('info', { size: 13 })}${esc(t('calendar.tip'))}</p>
    </section>

    <aside class="cal-day" aria-live="polite">
      <header class="cal-day__head">
        <div class="cal-day__date">
          <span class="cal-day__dow">${esc(formatDate(selected, { weekday: 'long' }))}</span>
          <span class="cal-day__num">${sel.getDate()}</span>
          <span class="cal-day__month">${esc(formatDate(selected, { month: 'long', year: 'numeric' }))}</span>
        </div>
        ${button({ label: t('calendar.addHere'), icon: 'plus', size: 'sm', action: 'new-task', attrs: `data-date="${selected}"` })}
      </header>
      ${dayTasks.length ? `<p class="cal-day__summary">${esc(t('calendar.daySummary', { open: openCount(selected), total: dayTasks.length }))}</p>${taskList(dayTasks, state, { hideDate: true, compact: true })}`
        : emptyState({ emoji: selected < today ? '🌙' : '☀️', title: t('calendar.emptyTitle'), text: t('calendar.emptyText'), compact: true })}
    </aside>
  </div>`;
}

export const title = () => t('nav.calendar');

/* The slide animation should play once per month change, not on every re-render */
export function mount() {
  ui.calendar.direction = 0;
}

function shift(delta) {
  let { year, month } = ui.calendar;
  month += delta;
  if (month < 0) { month = 11; year--; }
  if (month > 11) { month = 0; year++; }
  setUi({ calendar: { ...ui.calendar, year, month, direction: delta } });
}

let lastTap = { key: null, time: 0 };
registerActions({
  'cal-prev': () => shift(-1),
  'cal-next': () => shift(1),
  'cal-today': () => {
    const now = new Date();
    const delta = (now.getFullYear() - ui.calendar.year) * 12 + now.getMonth() - ui.calendar.month;
    setUi({ calendar: { year: now.getFullYear(), month: now.getMonth(), selected: todayKey(), direction: Math.sign(delta) } });
  },
  'cal-select': (el) => {
    const key = el.dataset.date;
    const now = Date.now();
    // Double-click / double-tap a date to add a task on it
    if (lastTap.key === key && now - lastTap.time < 400) {
      lastTap = { key: null, time: 0 };
      openTaskForm(null, { dueDate: key });
      return;
    }
    lastTap = { key, time: now };
    const d = fromKey(key);
    const delta = (d.getFullYear() - ui.calendar.year) * 12 + d.getMonth() - ui.calendar.month;
    setUi({ calendar: { ...ui.calendar, selected: key, year: d.getFullYear(), month: d.getMonth(), direction: delta } });
    if (window.innerWidth < 1024) {
      requestAnimationFrame(() => document.querySelector('.cal-day')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  },
});

// Arrow keys move between days when a date is focused
document.addEventListener('keydown', (e) => {
  const cellEl = e.target.closest?.('.cal-cell');
  if (!cellEl) return;
  const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
  if (!step) return;
  e.preventDefault();
  const d = fromKey(cellEl.dataset.date);
  d.setDate(d.getDate() + step);
  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const delta = (d.getFullYear() - ui.calendar.year) * 12 + d.getMonth() - ui.calendar.month;
  setUi({ calendar: { selected: key, year: d.getFullYear(), month: d.getMonth(), direction: delta } });
  requestAnimationFrame(() => document.querySelector(`.cal-cell[data-date="${key}"]`)?.focus());
});

