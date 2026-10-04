/* ==========================================================================
   SELECTORS — read-only helpers that compute things from the state
   (today's progress, task views, streaks, search results...).
   Pages call these instead of filtering arrays themselves.
   ========================================================================== */
import { PRIORITY_RANK } from './models.js';
import { todayKey, addDays, keyFromIso, diffDays, fromKey } from './dates.js';

export const categoryById = (state, id) => state.categories.find((c) => c.id === id) || null;

/* ---------- Task views ---------- */
export const TASK_VIEWS = ['today', 'tomorrow', 'upcoming', 'overdue', 'completed', 'all'];

export function isOverdue(task, today = todayKey()) {
  // Tasks due earlier today stay in "Today"; they become overdue from tomorrow.
  return !task.completed && Boolean(task.dueDate) && task.dueDate < today;
}

export function tasksForView(state, view, today = todayKey()) {
  const tomorrow = addDays(today, 1);
  const { tasks } = state;
  switch (view) {
    case 'today':
      return tasks.filter((t) => t.dueDate === today || (t.completed && keyFromIso(t.completedAt) === today && !t.dueDate));
    case 'tomorrow':
      return tasks.filter((t) => t.dueDate === tomorrow);
    case 'upcoming':
      return tasks.filter((t) => !t.completed && t.dueDate && t.dueDate > today);
    case 'overdue':
      return tasks.filter((t) => isOverdue(t, today));
    case 'completed':
      return tasks.filter((t) => t.completed);
    default:
      return tasks.slice();
  }
}

export function viewCounts(state, today = todayKey()) {
  const counts = {};
  for (const v of TASK_VIEWS) {
    const list = tasksForView(state, v, today);
    counts[v] = v === 'completed' || v === 'all' ? list.length : list.filter((t) => !t.completed).length;
  }
  return counts;
}

export function applyTaskFilters(list, f = {}) {
  const q = (f.query || '').trim().toLowerCase();
  return list.filter((t) => {
    if (f.categoryId && t.categoryId !== f.categoryId) return false;
    if (f.priority && t.priority !== f.priority) return false;
    if (f.tag && !t.tags.includes(f.tag)) return false;
    if (f.status === 'open' && t.completed) return false;
    if (f.status === 'done' && !t.completed) return false;
    if (q && !`${t.title} ${t.description} ${t.tags.join(' ')}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

const dueValue = (t) => `${t.dueDate || '9999-99-99'}T${t.dueTime || '99:99'}`;

export function sortTasks(list, sortBy = 'date') {
  const sorted = list.slice();
  const cmp = {
    date: (a, b) => dueValue(a).localeCompare(dueValue(b)) || PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority],
    priority: (a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority] || dueValue(a).localeCompare(dueValue(b)),
    created: (a, b) => b.createdAt.localeCompare(a.createdAt),
    title: (a, b) => a.title.localeCompare(b.title),
  }[sortBy] || (() => 0);
  sorted.sort((a, b) => Number(a.completed) - Number(b.completed) || cmp(a, b));
  return sorted;
}

/* ---------- Dashboard ---------- */
export function todayProgress(state, today = todayKey()) {
  const list = tasksForView(state, 'today', today);
  const done = list.filter((t) => t.completed).length;
  const total = list.length;
  return { done, total, remaining: total - done, percent: total ? Math.round((done / total) * 100) : 0, list };
}

export function motivationKey(percent, total) {
  if (!total) return 'motivation.empty';
  if (percent >= 100) return 'motivation.100';
  if (percent > 80) return 'motivation.81';
  if (percent > 50) return 'motivation.51';
  if (percent > 20) return 'motivation.21';
  return 'motivation.0';
}

export function priorityTasks(state, limit = 5) {
  return sortTasks(state.tasks.filter((t) => !t.completed && (t.priority === 'urgent' || t.priority === 'high')), 'priority').slice(0, limit);
}

export function upcomingTasks(state, days = 7, limit = 6, today = todayKey()) {
  const end = addDays(today, days);
  return sortTasks(state.tasks.filter((t) => !t.completed && t.dueDate && t.dueDate > today && t.dueDate <= end), 'date').slice(0, limit);
}

export function recentNotes(state, limit = 4) {
  return state.notes.filter((n) => !n.archived).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, limit);
}

/* ---------- Statistics ---------- */
export function completionsByDay(state) {
  const map = new Map();
  for (const t of state.tasks) {
    if (!t.completed || !t.completedAt) continue;
    const key = keyFromIso(t.completedAt);
    map.set(key, (map.get(key) || 0) + 1);
  }
  return map;
}

export function streak(state, today = todayKey()) {
  const days = completionsByDay(state);
  // current: count back from today (or yesterday if nothing done yet today)
  let cursor = days.get(today) ? today : addDays(today, -1);
  let current = 0;
  while (days.get(cursor)) { current++; cursor = addDays(cursor, -1); }
  // best: longest run in history
  const keys = [...days.keys()].sort();
  let best = 0; let run = 0; let prev = null;
  for (const k of keys) {
    run = prev && diffDays(k, prev) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = k;
  }
  return { current, best: Math.max(best, current), doneToday: days.get(today) || 0 };
}

export function countCompletedBetween(state, fromKey_, toKey_) {
  let n = 0;
  for (const [k, v] of completionsByDay(state)) if (k >= fromKey_ && k <= toKey_) n += v;
  return n;
}

export function lastNDays(state, n, today = todayKey()) {
  const map = completionsByDay(state);
  return Array.from({ length: n }, (_, i) => {
    const key = addDays(today, i - n + 1);
    return { key, value: map.get(key) || 0 };
  });
}

export function weekdayTotals(state) {
  const totals = Array(7).fill(0);
  for (const [k, v] of completionsByDay(state)) totals[fromKey(k).getDay()] += v;
  return totals; // index 0 = Sunday
}

export function categoryDistribution(state) {
  const counts = new Map();
  for (const t of state.tasks) counts.set(t.categoryId || null, (counts.get(t.categoryId || null) || 0) + 1);
  return [...counts.entries()]
    .map(([id, value]) => ({ category: categoryById(state, id), value }))
    .sort((a, b) => b.value - a.value);
}

/* ---------- Tags & search ---------- */
export function allTags(state) {
  const counts = new Map();
  for (const item of [...state.tasks, ...state.notes]) for (const tag of item.tags) counts.set(tag, (counts.get(tag) || 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([tag, count]) => ({ tag, count }));
}

export function searchAll(state, query, limit = 6) {
  const q = query.trim().toLowerCase().replace(/^#/, '');
  if (!q) return { tasks: [], notes: [], categories: [], tags: [] };
  const has = (s) => (s || '').toLowerCase().includes(q);
  const score = (title) => (title.toLowerCase().startsWith(q) ? 0 : 1);
  return {
    tasks: state.tasks
      .filter((t) => has(t.title) || has(t.description) || t.tags.some(has) || t.subtasks.some((s) => has(s.title)))
      .sort((a, b) => Number(a.completed) - Number(b.completed) || score(a.title) - score(b.title))
      .slice(0, limit),
    notes: state.notes
      .filter((n) => has(n.title) || has(n.content) || n.tags.some(has) || n.checklist.some((c) => has(c.text)))
      .sort((a, b) => score(a.title) - score(b.title))
      .slice(0, limit),
    categories: state.categories.filter((c) => has(c.name)).slice(0, limit),
    tags: allTags(state).filter(({ tag }) => has(tag)).slice(0, limit),
  };
}
