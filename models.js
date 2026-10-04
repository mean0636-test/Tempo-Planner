/* ==========================================================================
   DATA MODELS
   The shape of every Task, Note, Category and Reminder lives here.
   If you want to add a new field (e.g. "estimate" on tasks), add it to the
   matching create...() function and it will be filled in everywhere,
   including for data saved by older versions of the app (see migrate()).
   ========================================================================== */

export const SCHEMA_VERSION = 1;

export const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
export const PRIORITY_RANK = { urgent: 4, high: 3, medium: 2, low: 1 };

/* Colour keys map to CSS tokens: --c-indigo, --c-emerald, ... (css/tokens.css) */
export const COLOR_KEYS = ['indigo', 'violet', 'blue', 'cyan', 'emerald', 'amber', 'orange', 'rose', 'pink', 'slate'];
export const NOTE_COLORS = ['neutral', 'blue', 'purple', 'green', 'orange', 'pink'];
export const ACCENTS = ['indigo', 'violet', 'blue', 'emerald', 'rose'];
export const CATEGORY_EMOJIS = ['📚', '💼', '🏠', '💰', '🏋️', '🛒', '💡', '🎯', '✈️', '🎨', '🎵', '🧠', '🌱', '🍳', '🐾', '❤️', '🛠️', '📦', '🧾', '🗣️'];

export const uid = (prefix = 'id') =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const nowIso = () => new Date().toISOString();
const asArray = (v) => (Array.isArray(v) ? v : []);
const asString = (v, fallback = '') => (typeof v === 'string' ? v : fallback);

/* ---------- Task ---------- */
export function createTask(input = {}) {
  const now = nowIso();
  const task = {
    id: uid('t'),
    title: '',
    description: '',
    priority: 'medium',      // low | medium | high | urgent
    dueDate: null,           // 'YYYY-MM-DD' (local date) or null
    dueTime: null,           // 'HH:MM' (24h) or null
    categoryId: null,
    tags: [],                // ['English', 'Study']
    subtasks: [],            // [{ id, title, done }]
    completed: false,
    completedAt: null,       // ISO timestamp
    createdAt: now,
    updatedAt: now,
    ...input,
  };
  task.title = asString(task.title).trim();
  task.description = asString(task.description);
  if (!PRIORITIES.includes(task.priority)) task.priority = 'medium';
  task.tags = asArray(task.tags).map(String).filter(Boolean);
  task.subtasks = asArray(task.subtasks).map((s) => ({
    id: s.id || uid('s'),
    title: asString(s.title),
    done: Boolean(s.done),
  }));
  task.completed = Boolean(task.completed);
  return task;
}

/* ---------- Note ---------- */
export function createNote(input = {}) {
  const now = nowIso();
  const note = {
    id: uid('n'),
    title: '',
    content: '',
    checklist: [],           // [{ id, text, done }]
    tags: [],
    categoryId: null,
    color: 'neutral',        // see NOTE_COLORS
    pinned: false,
    favorite: false,
    archived: false,
    createdAt: now,
    updatedAt: now,
    ...input,
  };
  note.title = asString(note.title);
  note.content = asString(note.content);
  note.tags = asArray(note.tags).map(String).filter(Boolean);
  note.checklist = asArray(note.checklist).map((c) => ({
    id: c.id || uid('c'),
    text: asString(c.text),
    done: Boolean(c.done),
  }));
  if (!NOTE_COLORS.includes(note.color)) note.color = 'neutral';
  return note;
}

/* ---------- Category ---------- */
export function createCategory(input = {}) {
  const cat = {
    id: uid('cat'),
    name: 'New category',
    icon: '📁',
    color: 'indigo',         // see COLOR_KEYS
    createdAt: nowIso(),
    ...input,
  };
  if (!COLOR_KEYS.includes(cat.color)) cat.color = 'indigo';
  return cat;
}

/* ---------- Reminder ----------
   A reminder can stand alone ("Call mom at 6pm") or belong to a task
   (taskId set). `at` is a local date-time string: 'YYYY-MM-DDTHH:MM'. */
export function createReminder(input = {}) {
  return {
    id: uid('r'),
    title: '',
    at: null,
    taskId: null,
    offset: 0,               // minutes before the task's due time (task reminders)
    fired: false,
    seen: false,
    createdAt: nowIso(),
    ...input,
  };
}

/* ---------- Settings & profile ---------- */
export function defaultSettings() {
  return {
    theme: 'system',             // light | dark | system
    accent: 'indigo',            // see ACCENTS
    language: 'en',              // en | km
    defaultPriority: 'medium',
    weekStartsOn: 1,             // 0 = Sunday, 1 = Monday
    notifications: {
      enabled: true,             // in-app reminder toasts
      system: false,             // browser notifications (needs permission)
      sound: true,
      overdueAlerts: true,
    },
  };
}

export function defaultCategories() {
  return [
    { name: 'Study', icon: '📚', color: 'indigo' },
    { name: 'Work', icon: '💼', color: 'blue' },
    { name: 'Personal', icon: '🏠', color: 'violet' },
    { name: 'Finance', icon: '💰', color: 'emerald' },
    { name: 'Health', icon: '🏋️', color: 'rose' },
    { name: 'Shopping', icon: '🛒', color: 'amber' },
    { name: 'Ideas', icon: '💡', color: 'cyan' },
  ].map((c, i) => createCategory({ ...c, id: `cat_default_${i}` }));
}

export function createEmptyState() {
  const now = nowIso();
  return {
    meta: { schemaVersion: SCHEMA_VERSION, createdAt: now, updatedAt: now, sample: false },
    profile: { name: '' },
    settings: defaultSettings(),
    tasks: [],
    notes: [],
    categories: defaultCategories(),
    reminders: [],
  };
}

/* ---------- Migration / validation ----------
   Takes anything that came out of storage (or an imported file) and returns a
   clean, complete state object. Unknown fields are kept; missing ones are added. */
export function migrate(raw) {
  if (!raw || typeof raw !== 'object') throw new Error('Data is empty or not an object.');
  const base = createEmptyState();
  const settings = { ...base.settings, ...(raw.settings || {}) };
  settings.notifications = { ...base.settings.notifications, ...(raw.settings?.notifications || {}) };
  return {
    meta: { ...base.meta, ...(raw.meta || {}), schemaVersion: SCHEMA_VERSION },
    profile: { ...base.profile, ...(raw.profile || {}) },
    settings,
    tasks: asArray(raw.tasks).filter((t) => t && t.id).map((t) => createTask(t)),
    notes: asArray(raw.notes).filter((n) => n && n.id).map((n) => createNote(n)),
    categories: Array.isArray(raw.categories)
      ? raw.categories.filter((c) => c && c.id).map((c) => createCategory(c))
      : base.categories,
    reminders: asArray(raw.reminders).filter((r) => r && r.id).map((r) => createReminder(r)),
  };
}

/* Used by Settings → Import. Throws a readable error if the file is wrong. */
export function validateImport(obj) {
  if (!obj || typeof obj !== 'object') throw new Error('This file does not contain Tempo data.');
  const payload = obj.app === 'tempo' && obj.data ? obj.data : obj;
  if (!Array.isArray(payload.tasks) && !Array.isArray(payload.notes)) {
    throw new Error('No tasks or notes were found in this file.');
  }
  return migrate(payload);
}
