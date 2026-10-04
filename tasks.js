/* ==========================================================================
   TASKS PAGE — views (Today, Tomorrow, Upcoming, Overdue, Completed, All),
   filters (category, priority, tag, status, text) and sorting.
   Styles: css/pages.css → "Tasks page"
   ========================================================================== */
import { registerActions, registerChange, registerInput } from '../core/events.js';
import { t } from '../core/i18n.js';
import { todayKey, relativeDay, keyFromIso, addDays } from '../core/dates.js';
import { TASK_VIEWS, tasksForView, applyTaskFilters, sortTasks, viewCounts, allTags } from '../core/selectors.js';
import { PRIORITIES } from '../core/models.js';
import { ui, setUi } from '../core/uiState.js';
import { esc } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { taskCard } from '../ui/taskCard.js';
import { emptyState, button } from '../ui/components.js';

const PAGE_SIZE = 60;
let limit = PAGE_SIZE;

const VIEW_ICONS = { today: 'target', tomorrow: 'sun', upcoming: 'calendar', overdue: 'alert', completed: 'check', all: 'list' };

const EMPTY = {
  today: { emoji: '🎉', title: 'empty.todayTitle', text: 'empty.todayText' },
  tomorrow: { emoji: '🌤️', title: 'empty.tomorrowTitle', text: 'empty.tomorrowText' },
  upcoming: { emoji: '🗓️', title: 'empty.upcomingTitle', text: 'empty.upcomingText' },
  overdue: { emoji: '✅', title: 'empty.overdueTitle', text: 'empty.overdueText' },
  completed: { emoji: '🌱', title: 'empty.completedTitle', text: 'empty.completedText' },
  all: { emoji: '✨', title: 'empty.allTitle', text: 'empty.allText' },
};

function groupKey(task, view) {
  if (view === 'completed') return keyFromIso(task.completedAt) || 'none';
  return task.dueDate || 'none';
}

function groupLabel(key, view) {
  if (key === 'none') return view === 'completed' ? t('tasks.earlier') : t('date.noDate');
  return relativeDay(key);
}

function select(id, change, value, options, label) {
  return `<label class="filter-select ${value ? 'is-set' : ''}">
    <span class="sr-only">${esc(label)}</span>
    <select id="${id}" class="input select select--sm" data-change="${change}">${options.map((o) => `<option value="${esc(o.value)}" ${o.value === value ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}</select>
  </label>`;
}

export function render(state) {
  const today = todayKey();
  const view = TASK_VIEWS.includes(ui.taskView) ? ui.taskView : 'today';
  const f = ui.taskFilters;
  const counts = viewCounts(state, today);
  const base = tasksForView(state, view, today);
  let list = sortTasks(applyTaskFilters(base, f), ui.taskSort);
  if (view === 'completed') list = list.sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''));
  const filtersActive = Boolean(f.categoryId || f.priority || f.tag || f.status || f.query);
  const total = list.length;
  const shown = list.slice(0, limit);

  const tabs = `<div class="view-tabs" role="tablist" aria-label="${esc(t('tasks.views'))}">${TASK_VIEWS.map((v) => `
    <button type="button" role="tab" class="view-tab ${v === view ? 'is-active' : ''} ${v === 'overdue' && counts.overdue ? 'has-alert' : ''}" aria-selected="${v === view}"
      data-action="set-task-view" data-view="${v}">${icon(VIEW_ICONS[v], { size: 15 })}<span>${esc(t(`view.${v}`))}</span>${counts[v] ? `<span class="view-tab__count">${counts[v]}</span>` : ''}</button>`).join('')}</div>`;

  const toolbar = `<div class="toolbar">
    <label class="toolbar__search">${icon('search', { size: 16 })}
      <span class="sr-only">${esc(t('tasks.filterPlaceholder'))}</span>
      <input type="search" id="task-filter-q" placeholder="${esc(t('tasks.filterPlaceholder'))}" value="${esc(f.query)}" data-input="task-filter-query" autocomplete="off">
    </label>
    <div class="toolbar__filters">
      ${select('flt-cat', 'task-filter-category', f.categoryId, [{ value: '', label: t('filters.allCategories') }, ...state.categories.map((c) => ({ value: c.id, label: `${c.icon} ${c.name}` }))], t('form.category'))}
      ${select('flt-prio', 'task-filter-priority', f.priority, [{ value: '', label: t('filters.allPriorities') }, ...PRIORITIES.slice().reverse().map((p) => ({ value: p, label: t(`priority.${p}`) }))], t('form.priority'))}
      ${select('flt-tag', 'task-filter-tag', f.tag, [{ value: '', label: t('filters.allTags') }, ...allTags(state).map(({ tag }) => ({ value: tag, label: `#${tag}` }))], t('form.tags'))}
      ${view === 'all' || view === 'today' || view === 'tomorrow' ? select('flt-status', 'task-filter-status', f.status, [{ value: '', label: t('filters.anyStatus') }, { value: 'open', label: t('filters.open') }, { value: 'done', label: t('filters.done') }], t('filters.status')) : ''}
      ${select('flt-sort', 'task-sort', ui.taskSort, ['date', 'priority', 'created', 'title'].map((s) => ({ value: s, label: `${t('sort.label')}: ${t(`sort.${s}`)}` })), t('sort.label'))}
      ${filtersActive ? `<button type="button" class="link-btn" data-action="clear-task-filters">${icon('x', { size: 14 })}${esc(t('filters.clear'))}</button>` : ''}
    </div>
  </div>`;

  let content;
  if (!total) {
    const e = filtersActive ? { emoji: '🔎', title: 'empty.filteredTitle', text: 'empty.filteredText' } : EMPTY[view];
    content = emptyState({
      emoji: e.emoji, title: t(e.title), text: t(e.text),
      actionLabel: filtersActive ? '' : t('task.new'), action: 'new-task',
      attrs: view === 'tomorrow' ? `data-date="${addDays(today, 1)}"` : '',
    });
  } else if (['upcoming', 'all', 'completed'].includes(view) && ui.taskSort === 'date') {
    const groups = new Map();
    shown.forEach((task) => {
      const k = groupKey(task, view);
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(task);
    });
    let i = 0;
    content = [...groups.entries()].map(([k, items]) => `<section class="task-group">
      <h3 class="task-group__title"><span>${esc(groupLabel(k, view))}</span><span class="task-group__count">${items.length}</span>
        ${k !== 'none' && view !== 'completed' ? `<button type="button" class="icon-btn icon-btn--xs" data-action="new-task" data-date="${k}" aria-label="${esc(t('task.addOn', { date: groupLabel(k, view) }))}">${icon('plus', { size: 14 })}</button>` : ''}</h3>
      <div class="task-list stagger">${items.map((task) => taskCard(task, state, { hideDate: true, index: i++ })).join('')}</div>
    </section>`).join('');
  } else {
    content = `<div class="task-list stagger">${shown.map((task, i) => taskCard(task, state, { index: i, hideDate: view === 'today' || view === 'tomorrow' })).join('')}</div>`;
  }

  const doneInView = base.filter((x) => x.completed).length;
  return `<div class="tasks-page">
    <div class="page-head">
      <div class="page-head__text">
        <p class="page-head__eyebrow">${icon(VIEW_ICONS[view], { size: 14 })}${esc(t(`view.${view}`))}</p>
        <h2 class="page-head__title">${esc(t('tasks.summary', { n: total }))}</h2>
        ${view === 'today' && base.length ? `<p class="page-head__sub">${esc(t('tasks.todaySummary', { done: doneInView, total: base.length }))}</p>` : ''}
      </div>
      ${button({ label: t('task.new'), icon: 'plus', action: 'new-task', attrs: view === 'tomorrow' ? `data-date="${addDays(today, 1)}"` : '' })}
    </div>
    ${tabs}
    ${toolbar}
    <div class="tasks-content" role="tabpanel">${content}</div>
    ${total > limit ? `<div class="load-more"><button type="button" class="btn btn--secondary btn--md" data-action="tasks-more">${esc(t('tasks.showMore', { n: total - limit }))}</button></div>` : ''}
    <p class="hint-line hide-desktop">${icon('info', { size: 14 })}${esc(t('tasks.swipeHint'))}</p>
  </div>`;
}

export const title = () => t('nav.tasks');

const setFilter = (patch) => { limit = PAGE_SIZE; setUi({ taskFilters: { ...ui.taskFilters, ...patch } }); };

registerActions({
  'set-task-view': (el) => { limit = PAGE_SIZE; setUi({ taskView: el.dataset.view }); },
  'clear-task-filters': () => setFilter({ query: '', categoryId: '', priority: '', tag: '', status: '' }),
  'tasks-more': () => { limit += PAGE_SIZE; setUi({}); },
});
registerChange({
  'task-filter-category': (el) => setFilter({ categoryId: el.value }),
  'task-filter-priority': (el) => setFilter({ priority: el.value }),
  'task-filter-tag': (el) => setFilter({ tag: el.value }),
  'task-filter-status': (el) => setFilter({ status: el.value }),
  'task-sort': (el) => setUi({ taskSort: el.value }),
});
registerInput({
  'task-filter-query': (el) => setFilter({ query: el.value }),
});
