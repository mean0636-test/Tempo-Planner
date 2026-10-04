/* ==========================================================================
   UI STATE — temporary view settings (which tab is open, active filters...).
   This is NOT your saved data; it only remembers a few preferences.
   Call setUi({...}) to change it — the page re-renders automatically.
   ========================================================================== */
import { prefs } from './storage.js';

const now = new Date();
const listeners = new Set();

export const ui = {
  taskView: prefs.get('taskView', 'today'),
  taskFilters: { query: '', categoryId: '', priority: '', tag: '', status: '' },
  taskSort: prefs.get('taskSort', 'date'),
  notesTab: 'all',            // all | pinned | favorites | archived
  notesQuery: '',
  notesTag: '',
  calendar: { year: now.getFullYear(), month: now.getMonth(), selected: null, direction: 0 },
  sidebarCollapsed: prefs.get('sidebarCollapsed', false),
  sidebarOpen: false,         // tablet "peek" state
  quickMenuOpen: false,
};

const PERSISTED = ['taskView', 'taskSort', 'sidebarCollapsed'];

export function setUi(patch) {
  Object.assign(ui, patch);
  PERSISTED.forEach((k) => { if (k in patch) prefs.set(k, patch[k]); });
  listeners.forEach((fn) => fn(ui));
}

export const onUiChange = (fn) => listeners.add(fn);
