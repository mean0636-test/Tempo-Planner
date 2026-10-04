/* ==========================================================================
   STORE — the single source of truth
   - getState() returns all data (tasks, notes, categories, reminders, settings)
   - actions.* are the ONLY functions that change data
   - every change is saved automatically (debounced) and re-renders the UI
   ========================================================================== */
import { storage } from './storage.js';
import {
  createEmptyState, migrate, createTask, createNote, createCategory, createReminder, uid,
} from './models.js';
import { buildSampleState } from './seed.js';
import { addDays, toLocalDateTime } from './dates.js';

let state = null;
const listeners = new Set();
const errorListeners = new Set();
let saveTimer = null;
let lastSaveOk = true;

const nowIso = () => new Date().toISOString();
const byId = (list, id) => list.find((x) => x.id === id);

export async function initStore() {
  let raw = null;
  try {
    raw = await storage.load();
    state = raw ? migrate(raw) : buildSampleState();
  } catch (err) {
    console.error('[store] saved data was unreadable, trying backup', err);
    const backup = await storage.loadBackup().catch(() => null);
    state = backup?.data ? migrate(backup.data) : buildSampleState();
  }
  if (!raw) persistNow();

  // Save immediately if the tab is hidden or closed before the debounce fires.
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => document.hidden && flush());
  return state;
}

export const getState = () => state;
export const isPersistent = () => storage.persistent;
export const lastSaveSucceeded = () => lastSaveOk;

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
export function onSaveError(fn) {
  errorListeners.add(fn);
}

function commit(mutate) {
  mutate(state);
  state.meta.updatedAt = nowIso();
  listeners.forEach((fn) => fn(state));
  clearTimeout(saveTimer);
  saveTimer = setTimeout(persistNow, 250);
}

function persistNow() {
  clearTimeout(saveTimer);
  saveTimer = null;
  storage.save(state).then(
    () => { lastSaveOk = true; },
    (err) => {
      lastSaveOk = false;
      console.error('[store] save failed', err);
      errorListeners.forEach((fn) => fn(err));
    },
  );
}

function flush() {
  if (saveTimer) persistNow();
}

/* Reminder time for a task: due date + due time (default 09:00) - offset minutes */
function reminderTimeFor(task, offset) {
  const d = new Date(`${task.dueDate}T${task.dueTime || '09:00'}`);
  d.setMinutes(d.getMinutes() - offset);
  return toLocalDateTime(d);
}

export const actions = {
  /* ---------------- Tasks ---------------- */
  addTask(input) {
    const task = createTask({ priority: state.settings.defaultPriority, ...input });
    commit((s) => s.tasks.unshift(task));
    return task;
  },
  updateTask(id, patch) {
    commit((s) => {
      const task = byId(s.tasks, id);
      if (task) Object.assign(task, patch, { updatedAt: nowIso() });
    });
  },
  toggleTask(id) {
    let done = false;
    commit((s) => {
      const task = byId(s.tasks, id);
      if (!task) return;
      task.completed = !task.completed;
      task.completedAt = task.completed ? nowIso() : null;
      task.updatedAt = nowIso();
      done = task.completed;
      // No need to remind about a finished task
      s.reminders.forEach((r) => { if (r.taskId === id && done) r.fired = true; });
    });
    return done;
  },
  toggleSubtask(taskId, subId) {
    commit((s) => {
      const sub = byId(byId(s.tasks, taskId)?.subtasks || [], subId);
      if (sub) sub.done = !sub.done;
    });
  },
  deleteTask(id) {
    let removed = null;
    commit((s) => {
      const index = s.tasks.findIndex((x) => x.id === id);
      if (index < 0) return;
      removed = { task: s.tasks[index], index, reminders: s.reminders.filter((r) => r.taskId === id) };
      s.tasks.splice(index, 1);
      s.reminders = s.reminders.filter((r) => r.taskId !== id);
    });
    return removed;
  },
  restoreTask(removed) {
    if (!removed) return;
    commit((s) => {
      s.tasks.splice(Math.min(removed.index, s.tasks.length), 0, removed.task);
      s.reminders.push(...removed.reminders);
    });
  },
  duplicateTask(id) {
    const src = byId(state.tasks, id);
    if (!src) return null;
    const copy = createTask({
      ...structuredClone(src), id: undefined, completed: false, completedAt: null,
      createdAt: nowIso(), updatedAt: nowIso(),
    });
    copy.id = uid('t');
    copy.subtasks = copy.subtasks.map((st) => ({ ...st, id: uid('s'), done: false }));
    commit((s) => s.tasks.unshift(copy));
    return copy;
  },
  moveTaskToTomorrow(id, today) {
    this.updateTask(id, { dueDate: addDays(today, 1) });
  },
  /** offset = minutes before due time, or null to remove the reminder */
  setTaskReminder(taskId, offset) {
    commit((s) => {
      const task = byId(s.tasks, taskId);
      s.reminders = s.reminders.filter((r) => r.taskId !== taskId);
      if (!task || offset === null || offset === undefined || !task.dueDate) return;
      const at = reminderTimeFor(task, offset);
      s.reminders.push(createReminder({
        title: task.title, taskId, offset, at,
        fired: task.completed || new Date(at) <= new Date(),
      }));
    });
  },

  /* ---------------- Notes ---------------- */
  addNote(input) {
    const note = createNote(input);
    commit((s) => s.notes.unshift(note));
    return note;
  },
  updateNote(id, patch) {
    commit((s) => {
      const note = byId(s.notes, id);
      if (note) Object.assign(note, patch, { updatedAt: nowIso() });
    });
  },
  toggleNoteFlag(id, flag) {
    let value = false;
    commit((s) => {
      const note = byId(s.notes, id);
      if (!note) return;
      note[flag] = !note[flag];
      value = note[flag];
      if (flag === 'archived' && value) note.pinned = false;
    });
    return value;
  },
  toggleNoteItem(noteId, itemId) {
    commit((s) => {
      const item = byId(byId(s.notes, noteId)?.checklist || [], itemId);
      if (item) item.done = !item.done;
    });
  },
  deleteNote(id) {
    let removed = null;
    commit((s) => {
      const index = s.notes.findIndex((x) => x.id === id);
      if (index < 0) return;
      removed = { note: s.notes[index], index };
      s.notes.splice(index, 1);
    });
    return removed;
  },
  restoreNote(removed) {
    if (!removed) return;
    commit((s) => s.notes.splice(Math.min(removed.index, s.notes.length), 0, removed.note));
  },

  /* ---------------- Categories ---------------- */
  addCategory(input) {
    const cat = createCategory(input);
    commit((s) => s.categories.push(cat));
    return cat;
  },
  updateCategory(id, patch) {
    commit((s) => {
      const cat = byId(s.categories, id);
      if (cat) Object.assign(cat, patch);
    });
  },
  deleteCategory(id) {
    let removed = null;
    commit((s) => {
      const index = s.categories.findIndex((c) => c.id === id);
      if (index < 0) return;
      removed = {
        category: s.categories[index], index,
        taskIds: s.tasks.filter((x) => x.categoryId === id).map((x) => x.id),
        noteIds: s.notes.filter((x) => x.categoryId === id).map((x) => x.id),
      };
      s.categories.splice(index, 1);
      s.tasks.forEach((x) => { if (x.categoryId === id) x.categoryId = null; });
      s.notes.forEach((x) => { if (x.categoryId === id) x.categoryId = null; });
    });
    return removed;
  },
  restoreCategory(removed) {
    if (!removed) return;
    commit((s) => {
      s.categories.splice(removed.index, 0, removed.category);
      s.tasks.forEach((x) => { if (removed.taskIds.includes(x.id)) x.categoryId = removed.category.id; });
      s.notes.forEach((x) => { if (removed.noteIds.includes(x.id)) x.categoryId = removed.category.id; });
    });
  },

  /* ---------------- Reminders ---------------- */
  addReminder(input) {
    const reminder = createReminder(input);
    commit((s) => s.reminders.push(reminder));
    return reminder;
  },
  deleteReminder(id) {
    commit((s) => { s.reminders = s.reminders.filter((r) => r.id !== id); });
  },
  markReminderFired(id) {
    commit((s) => {
      const r = byId(s.reminders, id);
      if (r) r.fired = true;
    });
  },
  markRemindersSeen() {
    if (!state.reminders.some((r) => r.fired && !r.seen)) return;
    commit((s) => s.reminders.forEach((r) => { if (r.fired) r.seen = true; }));
  },

  /* ---------------- Settings & profile ---------------- */
  updateSettings(patch) {
    commit((s) => {
      const { notifications, ...rest } = patch;
      Object.assign(s.settings, rest);
      if (notifications) Object.assign(s.settings.notifications, notifications);
    });
  },
  updateProfile(patch) {
    commit((s) => Object.assign(s.profile, patch));
  },
  dismissSample() {
    commit((s) => { s.meta.sample = false; });
  },

  /* ---------------- Whole-data operations (backed up first) ---------------- */
  async replaceAll(newState) {
    await storage.backup(state).catch(() => {});
    commit((s) => Object.assign(s, newState));
  },
  async clearAll() {
    await storage.backup(state).catch(() => {});
    const empty = createEmptyState();
    empty.profile = { ...state.profile };
    empty.settings = { ...state.settings };
    commit((s) => Object.assign(s, empty));
  },
  async loadSample() {
    await storage.backup(state).catch(() => {});
    const sample = buildSampleState();
    sample.profile = { ...state.profile };
    sample.settings = { ...state.settings };
    commit((s) => Object.assign(s, sample));
  },
  async restoreBackup() {
    const backup = await storage.loadBackup();
    if (!backup?.data) return false;
    const data = migrate(backup.data);
    await storage.backup(state).catch(() => {});
    commit((s) => Object.assign(s, data));
    return backup.savedAt;
  },
};

export function getBackupInfo() {
  return storage.loadBackup().then((b) => b?.savedAt || null).catch(() => null);
}
