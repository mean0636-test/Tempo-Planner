/* ==========================================================================
   STORAGE ADAPTER
   The store never talks to localStorage directly; it calls this adapter.
   To add cloud sync later (Supabase, Firebase, your own API), write another
   adapter with the same four async methods — load, save, backup, loadBackup —
   and export it as `storage` instead. Nothing else in the app has to change.
   ========================================================================== */

const DATA_KEY = 'tempo:data:v1';
const BACKUP_KEY = 'tempo:backup:v1';
const PREFS_KEY = 'tempo:prefs:v1';

/* localStorage can throw (private mode, blocked site data). We test it once
   and fall back to memory so the app always works for the current session. */
function detectLocalStorage() {
  try {
    const k = '__tempo_test__';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

const memory = new Map();
const persistent = detectLocalStorage();

function read(key) {
  try {
    const raw = persistent ? window.localStorage.getItem(key) : memory.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn('[storage] could not read', key, err);
    return null;
  }
}

function write(key, value) {
  const raw = JSON.stringify(value);
  if (persistent) window.localStorage.setItem(key, raw); // may throw QuotaExceededError
  else memory.set(key, raw);
}

export const storage = {
  /** true when data survives a page refresh */
  persistent,
  async load() {
    return read(DATA_KEY);
  },
  async save(state) {
    write(DATA_KEY, state);
  },
  /** Snapshot taken before risky operations (import, clear). */
  async backup(state) {
    write(BACKUP_KEY, { savedAt: new Date().toISOString(), data: state });
  },
  async loadBackup() {
    return read(BACKUP_KEY);
  },
};

/* Small UI preferences (sidebar collapsed, last task view, recent searches).
   Not part of your exported data. */
export const prefs = {
  get(name, fallback) {
    const all = read(PREFS_KEY) || {};
    return name in all ? all[name] : fallback;
  },
  set(name, value) {
    try {
      const all = read(PREFS_KEY) || {};
      all[name] = value;
      write(PREFS_KEY, all);
    } catch { /* preferences are optional */ }
  },
};
