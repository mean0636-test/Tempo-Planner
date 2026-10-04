/* ==========================================================================
   TASK CARD — how one task looks everywhere (dashboard, tasks, calendar).
   Styles: css/components.css → "Task card".
   Clicking the circle → data-action="toggle-task" (js/features/taskActions.js)
   Clicking the card   → data-action="open-task"   (opens the edit form)
   On touch screens: swipe right = complete, swipe left = delete (js/ui/swipe.js)
   ========================================================================== */
import { esc, cx } from './dom.js';
import { icon } from './icons.js';
import { priorityBadge, categoryChip, tagList, metaChip } from './components.js';
import { categoryById, isOverdue } from '../core/selectors.js';
import { relativeDay, formatTime, todayKey } from '../core/dates.js';
import { t } from '../core/i18n.js';

export function taskCard(task, state, { compact = false, hideDate = false, index = 0 } = {}) {
  const cat = categoryById(state, task.categoryId);
  const overdue = isOverdue(task, todayKey());
  const subDone = task.subtasks.filter((s) => s.done).length;
  const hasReminder = state.reminders.some((r) => r.taskId === task.id && !r.fired);

  const meta = [
    compact ? priorityBadge(task.priority, { compact: true }) : priorityBadge(task.priority),
    task.dueDate && !hideDate ? metaChip('calendar', relativeDay(task.dueDate), overdue ? 'is-overdue' : '') : '',
    task.dueTime ? metaChip('clock', formatTime(task.dueTime)) : '',
    task.subtasks.length ? metaChip('checklist', `${subDone}/${task.subtasks.length}`, subDone === task.subtasks.length ? 'is-complete' : '') : '',
    hasReminder ? `<span class="meta-chip meta-chip--icon" title="${esc(t('task.hasReminder'))}">${icon('bell', { size: 13 })}</span>` : '',
    cat ? categoryChip(cat) : '',
    !compact ? tagList(task.tags) : '',
  ].filter(Boolean).join('');

  return `<div class="task-swipe" data-id="${task.id}" style="--i:${index}">
    <div class="task-swipe__bg task-swipe__bg--done" aria-hidden="true">${icon('check')}<span>${esc(t('task.complete'))}</span></div>
    <div class="task-swipe__bg task-swipe__bg--delete" aria-hidden="true"><span>${esc(t('common.delete'))}</span>${icon('trash')}</div>
    <article class="${cx('task-card', `prio--${task.priority}`, task.completed && 'is-done', compact && 'task-card--compact', overdue && 'is-overdue')}"
      data-action="open-task" data-id="${task.id}">
      <button type="button" class="check" role="checkbox" aria-checked="${task.completed}" data-action="toggle-task" data-id="${task.id}"
        aria-label="${esc(task.completed ? t('task.markIncomplete') : t('task.markComplete'))}: ${esc(task.title)}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 12.5l3.5 3.5 7.5-8"/></svg>
      </button>
      <div class="task-card__body">
        <div class="task-card__top">
          <button type="button" class="task-card__title" data-action="open-task" data-id="${task.id}"><span class="strike">${esc(task.title || t('task.untitled'))}</span></button>
          <div class="task-card__actions">
            <button type="button" class="icon-btn icon-btn--sm" data-action="task-menu" data-id="${task.id}" aria-label="${esc(t('common.moreActions'))}" aria-haspopup="menu" aria-expanded="false">${icon('more', { size: 16 })}</button>
          </div>
        </div>
        ${task.description && !compact ? `<p class="task-card__desc">${esc(task.description)}</p>` : ''}
        <div class="task-card__meta">${meta}</div>
      </div>
    </article>
  </div>`;
}

export function taskList(tasks, state, opts = {}) {
  return `<div class="task-list stagger">${tasks.map((task, i) => taskCard(task, state, { ...opts, index: i })).join('')}</div>`;
}
