/* ==========================================================================
   DASHBOARD PAGE — greeting, today's progress, stat cards, today's focus,
   priority + upcoming tasks, recent notes.
   Styles: css/pages.css → "Dashboard"
   ========================================================================== */
import { actions } from '../core/store.js';
import { registerActions, registerSubmit } from '../core/events.js';
import { t } from '../core/i18n.js';
import { todayKey, addDays, greetingKey, formatDate, keyFromIso } from '../core/dates.js';
import {
  todayProgress, motivationKey, priorityTasks, upcomingTasks, recentNotes, streak, viewCounts, completionsByDay,
} from '../core/selectors.js';
import { setUi } from '../core/uiState.js';
import { navigate } from '../core/router.js';
import { esc, countUp, prefersReducedMotion } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { taskList } from '../ui/taskCard.js';
import { noteCard } from '../ui/noteCard.js';
import { emptyState, sectionHeader, button } from '../ui/components.js';
import { toast } from '../ui/toast.js';

const SEGMENTS_MAX = 12;
let lastPercent = 0;

function progressCard(p, mood) {
  // One segment per task (up to 12), so the bar reads like a beat count of the day
  const segCount = Math.min(Math.max(p.total, 1), SEGMENTS_MAX);
  const filled = p.total ? Math.round((p.done / p.total) * segCount) : 0;
  return `<section class="hero-card" aria-labelledby="progress-title">
    <div class="hero-card__glow" aria-hidden="true"></div>
    <div class="hero-card__top">
      <div>
        <h2 class="hero-card__label" id="progress-title">${esc(t('dashboard.todayProgress'))}</h2>
        <p class="hero-card__percent"><span data-count="${p.percent}" data-suffix="">${p.percent}</span><small>%</small></p>
      </div>
      <p class="hero-card__mood">${esc(t(mood))}</p>
    </div>
    <div class="hero-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p.percent}" aria-label="${esc(t('dashboard.todayProgress'))}">
      <div class="hero-bar__fill" data-fill="${p.percent}" data-fill-key="hero" style="width:${lastPercent}%"></div>
    </div>
    <div class="hero-beats" aria-hidden="true" ${p.total ? '' : 'hidden'}>${Array.from({ length: segCount }, (_, i) => `<span class="${i < filled ? 'is-on' : ''}" style="--i:${i}"></span>`).join('')}</div>
    <div class="hero-card__foot">
      <span>${icon('check', { size: 15 })}${esc(t('dashboard.completedCount', { n: p.done }))}</span>
      <span class="hero-card__sep" aria-hidden="true">•</span>
      <span>${esc(t('dashboard.remainingCount', { n: p.remaining }))}</span>
    </div>
  </section>`;
}

function statCard({ ic, label, value, suffix = '', trend = null, tone, sub = '' }) {
  return `<div class="stat-card stat-card--${tone}">
    <div class="stat-card__head"><span class="stat-card__icon">${icon(ic, { size: 17 })}</span><span class="stat-card__label">${esc(label)}</span></div>
    <p class="stat-card__value"><span data-count="${value}">${value}</span>${suffix ? `<small>${esc(suffix)}</small>` : ''}</p>
    ${trend !== null ? `<span class="trend ${trend >= 0 ? 'trend--up' : 'trend--down'}">${icon(trend >= 0 ? 'arrowUp' : 'arrowDown', { size: 13 })}${Math.abs(trend)}% <em>${esc(t('dashboard.vsYesterday'))}</em></span>` : `<span class="stat-card__sub">${esc(sub)}</span>`}
  </div>`;
}

export function render(state) {
  const today = todayKey();
  const p = todayProgress(state, today);
  const st = streak(state, today);
  const days = completionsByDay(state);
  const yesterday = days.get(addDays(today, -1)) || 0;
  const trend = yesterday ? Math.round(((st.doneToday - yesterday) / yesterday) * 100) : (st.doneToday ? 100 : null);
  const notesToday = state.notes.filter((n) => keyFromIso(n.createdAt) === today).length;
  const counts = viewCounts(state, today);
  const name = state.profile.name?.trim();
  const todayTasks = p.list.slice().sort((a, b) => Number(a.completed) - Number(b.completed) || (a.dueTime || '99').localeCompare(b.dueTime || '99'));
  const prio = priorityTasks(state, 4);
  const upcoming = upcomingTasks(state, 7, 5, today);
  const notes = recentNotes(state, 4);

  return `
  <div class="dashboard">
    <section class="greeting">
      <div>
        <p class="greeting__date">${esc(formatDate(today, { weekday: 'long', month: 'long', day: 'numeric' }))}</p>
        <h2 class="greeting__title">${esc(t(greetingKey()))}${name ? `, ${esc(name)}` : ''} <span class="wave" aria-hidden="true">👋</span></h2>
        <p class="greeting__sub">${esc(t('dashboard.tagline'))}</p>
      </div>
      <div class="greeting__actions">
        ${counts.overdue ? `<button type="button" class="overdue-pill" data-action="go-view" data-view="overdue">${icon('alert', { size: 15 })}${esc(t('dashboard.overdue', { n: counts.overdue }))}</button>` : ''}
        ${button({ label: t('task.new'), icon: 'plus', action: 'new-task', cls: 'hide-mobile' })}
      </div>
    </section>

    ${state.meta.sample ? `<div class="sample-banner" role="note">
      <span class="sample-banner__icon">${icon('sparkle', { size: 18 })}</span>
      <p><strong>${esc(t('sample.title'))}</strong> ${esc(t('sample.text'))}</p>
      <div class="sample-banner__actions">
        <button type="button" class="btn btn--ghost btn--sm" data-action="dismiss-sample">${esc(t('sample.keep'))}</button>
        <button type="button" class="btn btn--secondary btn--sm" data-action="clear-sample">${esc(t('sample.clear'))}</button>
      </div></div>` : ''}

    <div class="dash-top">
      ${progressCard(p, motivationKey(p.percent, p.total))}
      <div class="stat-grid stagger">
        ${statCard({ ic: 'check', label: t('stats.completedToday'), value: st.doneToday, trend, tone: 'success' })}
        ${statCard({ ic: 'target', label: t('stats.remaining'), value: p.remaining, sub: counts.overdue ? t('dashboard.overdueShort', { n: counts.overdue }) : t('dashboard.dueToday'), tone: 'primary' })}
        ${statCard({ ic: 'note', label: t('stats.notesToday'), value: notesToday, sub: t('dashboard.notesTotal', { n: state.notes.length }), tone: 'violet' })}
        ${statCard({ ic: 'flame', label: t('stats.streak'), value: st.current, suffix: t(st.current === 1 ? 'stats.day' : 'stats.days'), sub: t('stats.best', { n: st.best }), tone: 'amber' })}
      </div>
    </div>

    <div class="dash-grid">
      <section class="panel panel--focus">
        ${sectionHeader(t('dashboard.todayFocus'), { count: p.remaining, actionLabel: t('common.viewAll'), action: 'go-view', attrs: 'data-view="today"', ic: 'target' })}
        <form class="inline-add" data-submit="inline-add-task">
          <span class="inline-add__icon">${icon('plus', { size: 17 })}</span>
          <input type="text" name="title" id="dash-inline-add" placeholder="${esc(t('dashboard.inlineAdd'))}" autocomplete="off" aria-label="${esc(t('dashboard.inlineAdd'))}">
          <kbd>↵</kbd>
        </form>
        ${todayTasks.length ? taskList(todayTasks, state, { hideDate: true }) : emptyState({
          emoji: '🎉', title: t('empty.todayTitle'), text: t('empty.todayText'), actionLabel: t('task.new'), action: 'new-task', compact: true,
        })}
      </section>

      <div class="dash-side">
        <section class="panel">
          ${sectionHeader(t('dashboard.priority'), { count: prio.length, ic: 'flag' })}
          ${prio.length ? taskList(prio, state, { compact: true }) : `<p class="panel__empty">${esc(t('empty.priority'))}</p>`}
        </section>
        <section class="panel">
          ${sectionHeader(t('dashboard.upcoming'), { actionLabel: t('common.viewAll'), action: 'go-view', attrs: 'data-view="upcoming"', ic: 'calendar' })}
          ${upcoming.length ? taskList(upcoming, state, { compact: true }) : `<p class="panel__empty">${esc(t('empty.upcoming'))}</p>`}
        </section>
      </div>
    </div>

    <section class="panel panel--notes">
      ${sectionHeader(t('dashboard.recentNotes'), { actionLabel: t('common.viewAll'), action: 'go-notes' , ic: 'note' })}
      ${notes.length ? `<div class="notes-row stagger">${notes.map((n, i) => noteCard(n, state, { index: i, maxItems: 3 })).join('')}</div>`
        : emptyState({ emoji: '📝', title: t('empty.notesTitle'), text: t('empty.notesText'), actionLabel: t('note.new'), action: 'new-note', compact: true })}
    </section>
  </div>`;
}

/* Runs after the HTML is on screen */
export function mount(root, { entering, state }) {
  const p = todayProgress(state);
  if (entering) {
    root.querySelectorAll('[data-count]').forEach((n) => countUp(n, Number(n.dataset.count)));
    lastPercent = 0;
  }
  const fill = root.querySelector('.hero-bar__fill');
  if (fill) {
    const from = entering && !prefersReducedMotion() ? 0 : lastPercent;
    fill.style.width = `${from}%`;
    requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = `${p.percent}%`; }));
  }
  if (p.total && p.percent === 100 && lastPercent < 100 && !entering) {
    toast(t('motivation.100'), { icon: 'trophy', type: 'success' });
  }
  lastPercent = p.percent;
}

export const title = () => t('nav.dashboard');

registerActions({
  'go-view': (el) => { setUi({ taskView: el.dataset.view }); navigate('tasks'); },
  'go-notes': () => navigate('notes'),
  'dismiss-sample': () => actions.dismissSample(),
  'clear-sample': async () => {
    await actions.clearAll();
    toast(t('toast.sampleCleared'), { icon: 'sparkle', action: { label: t('common.undo'), onClick: async () => { await actions.restoreBackup(); } } });
  },
});

registerSubmit({
  'inline-add-task': (form) => {
    const input = form.querySelector('input');
    const title = input.value.trim();
    if (!title) return;
    actions.addTask({ title, dueDate: todayKey() });
    toast(t('toast.taskCreated'), { icon: 'check', type: 'success' });
    requestAnimationFrame(() => document.getElementById('dash-inline-add')?.focus());
  },
});
