/* ==========================================================================
   DATE HELPERS
   All dates are stored as local 'YYYY-MM-DD' keys so a task due "today"
   stays today no matter the time zone. Never use toISOString() for a date key.
   ========================================================================== */
import { getLocale, t } from './i18n.js';

const pad = (n) => String(n).padStart(2, '0');
const DAY = 86400000;

export const toKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayKey = () => toKey(new Date());
export const fromKey = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const addDays = (key, n) => {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
};
/** Whole days from b to a (a - b). */
export const diffDays = (a, b) => Math.round((fromKey(a) - fromKey(b)) / DAY);
export const keyFromIso = (iso) => (iso ? toKey(new Date(iso)) : null);

export function formatDate(key, opts = { weekday: 'short', month: 'short', day: 'numeric' }) {
  return new Intl.DateTimeFormat(getLocale(), opts).format(fromKey(key));
}

/** "Today", "Tomorrow", "Yesterday", "Friday", or "Mon, Oct 12". */
export function relativeDay(key) {
  if (!key) return '';
  const d = diffDays(key, todayKey());
  if (d === 0) return t('date.today');
  if (d === 1) return t('date.tomorrow');
  if (d === -1) return t('date.yesterday');
  if (d > 1 && d < 7) return formatDate(key, { weekday: 'long' });
  const sameYear = fromKey(key).getFullYear() === new Date().getFullYear();
  return formatDate(key, sameYear ? { weekday: 'short', month: 'short', day: 'numeric' } : { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatTime(hhmm) {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return new Intl.DateTimeFormat(getLocale(), { hour: 'numeric', minute: '2-digit' }).format(d);
}

export function formatDateTime(local) {
  if (!local) return '';
  const [key, time] = local.split('T');
  return `${relativeDay(key)} · ${formatTime(time)}`;
}

export function timeAgo(iso) {
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat(getLocale(), { numeric: 'auto' });
  const abs = Math.abs(diff);
  if (abs < 60) return t('date.justNow');
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
  if (abs < 86400 * 30) return rtf.format(Math.round(diff / 86400), 'day');
  return formatDate(keyFromIso(iso), { month: 'short', day: 'numeric', year: 'numeric' });
}

export function greetingKey(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return 'greeting.morning';
  if (h < 17) return 'greeting.afternoon';
  return 'greeting.evening';
}

/** 42 cells (6 weeks) for a month view. */
export function monthGrid(year, month, weekStart = 1) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() - weekStart + 7) % 7;
  const start = new Date(year, month, 1 - offset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    return { key: toKey(d), day: d.getDate(), inMonth: d.getMonth() === month };
  });
}

export function weekdayNames(weekStart = 1, style = 'short') {
  const fmt = new Intl.DateTimeFormat(getLocale(), { weekday: style });
  // 2023-01-01 was a Sunday
  return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2023, 0, 1 + ((i + weekStart) % 7))));
}

export function monthLabel(year, month) {
  return new Intl.DateTimeFormat(getLocale(), { month: 'long', year: 'numeric' }).format(new Date(year, month, 1));
}

/** Local 'YYYY-MM-DDTHH:MM' → Date. */
export const parseLocal = (local) => (local ? new Date(local) : null);
export const toLocalDateTime = (d) => `${toKey(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
