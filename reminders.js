/* ==========================================================================
   REMINDERS — the reminder form, the checker that fires reminders on time,
   and browser notifications (when the user allows them).
   ========================================================================== */
import { getState, actions } from '../core/store.js';
import { registerActions } from '../core/events.js';
import { t } from '../core/i18n.js';
import { todayKey, addDays, toLocalDateTime, formatDateTime } from '../core/dates.js';
import { openModal } from '../ui/modal.js';
import { toast } from '../ui/toast.js';
import { esc } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { field } from '../ui/components.js';

const CHECK_EVERY_MS = 15000;
const TOO_LATE_MS = 12 * 3600 * 1000; // older missed reminders are marked done silently

/* ---------- Firing ---------- */
function beep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(880, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.18);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.4);
  } catch { /* sound is optional */ }
}

function fire(reminder, missed) {
  const { notifications } = getState().settings;
  toast(reminder.title, {
    title: missed ? t('reminder.missed') : t('reminder.title'), icon: 'bell', type: 'reminder', duration: 9000,
  });
  if (notifications.sound && !missed) beep();
  if (notifications.system && 'Notification' in window && Notification.permission === 'granted') {
    try { new Notification(`🔔 ${t('reminder.title')}`, { body: reminder.title, tag: reminder.id }); } catch { /* blocked */ }
  }
}

function check(onStart = false) {
  const state = getState();
  if (!state) return;
  const now = Date.now();
  for (const r of state.reminders) {
    if (r.fired || !r.at) continue;
    const at = new Date(r.at).getTime();
    if (at > now) continue;
    actions.markReminderFired(r.id);
    if (!state.settings.notifications.enabled) continue;
    if (now - at > TOO_LATE_MS) continue;
    fire(r, onStart && now - at > 120000);
  }
}

export function startReminderLoop() {
  setTimeout(() => check(true), 1200);
  setInterval(() => check(false), CHECK_EVERY_MS);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) check(false); });
}

export async function requestSystemNotifications() {
  if (!('Notification' in window)) return 'unsupported';
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

export function systemPermission() {
  return 'Notification' in window ? Notification.permission : 'unsupported';
}

/* ---------- Reminder form ---------- */
export function openReminderForm(defaults = {}) {
  const today = todayKey();
  const inHour = new Date(Date.now() + 3600000);
  inHour.setMinutes(Math.ceil(inHour.getMinutes() / 5) * 5, 0, 0);
  const [defDate, defTime] = toLocalDateTime(inHour).split('T');
  const state = getState();
  const openTasks = state.tasks.filter((x) => !x.completed).slice(0, 40);

  const quick = [
    { label: t('reminder.inHour'), value: toLocalDateTime(inHour) },
    { label: t('reminder.thisEvening'), value: `${today}T19:00` },
    { label: t('reminder.tomorrowMorning'), value: `${addDays(today, 1)}T09:00` },
  ];

  const body = `<form class="form" id="reminder-form" novalidate>
    <div class="reminder-hero" aria-hidden="true">${icon('bell', { size: 22 })}</div>
    ${field(t('reminder.what'), `<input class="input" id="rem-title" name="title" type="text" value="${esc(defaults.title || '')}" placeholder="${esc(t('reminder.placeholder'))}" required autofocus autocomplete="off">
      <p class="field__error" id="rem-title-error" hidden>${esc(t('form.titleRequired'))}</p>`, { id: 'rem-title' })}
    <div class="form__grid">
      ${field(t('form.dueDate'), `<input class="input" type="date" id="rem-date" name="date" value="${defaults.date || defDate}" required>`, { id: 'rem-date' })}
      ${field(t('form.time'), `<input class="input" type="time" id="rem-time" name="time" value="${defaults.time || defTime}" required>`, { id: 'rem-time' })}
    </div>
    <div class="chip-row">${quick.map((q) => `<button type="button" class="chip-btn" data-quick="${q.value}">${esc(q.label)}</button>`).join('')}</div>
    ${field(t('reminder.linkTask'), `<select class="input select" id="rem-task" name="taskId">
      <option value="">${esc(t('reminder.noTask'))}</option>
      ${openTasks.map((x) => `<option value="${x.id}">${esc(x.title)}</option>`).join('')}
    </select>`, { id: 'rem-task' })}
    <p class="field__error" id="rem-past-error" hidden>${esc(t('reminder.pastError'))}</p>
  </form>`;

  const footer = `<span class="modal__foot-spacer"></span>
    <button type="button" class="btn btn--secondary btn--md" data-close>${esc(t('common.cancel'))}</button>
    <button type="submit" form="reminder-form" class="btn btn--primary btn--md">${icon('bell', { size: 16 })}<span>${esc(t('reminder.create'))}</span></button>`;

  const modal = openModal({
    title: t('reminder.new'), body, footer, size: 'sm',
    onMount(root) {
      const form = root.querySelector('#reminder-form');
      root.querySelectorAll('[data-quick]').forEach((b) => b.addEventListener('click', () => {
        const [d, tm] = b.dataset.quick.split('T');
        form.date.value = d;
        form.time.value = tm;
      }));
      form.taskId.addEventListener('change', () => {
        const task = state.tasks.find((x) => x.id === form.taskId.value);
        if (task && !form.title.value.trim()) form.title.value = task.title;
      });
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = form.title.value.trim();
        if (!title) { root.querySelector('#rem-title-error').hidden = false; form.title.focus(); return; }
        const at = `${form.date.value}T${form.time.value}`;
        if (!form.date.value || !form.time.value || new Date(at) <= new Date()) {
          root.querySelector('#rem-past-error').hidden = false;
          return;
        }
        actions.addReminder({ title, at, taskId: form.taskId.value || null });
        modal.close(true);
        toast(`${title} · ${formatDateTime(at)}`, { title: t('toast.reminderCreated'), icon: 'bell', type: 'success' });
      });
    },
  });
}

registerActions({
  'new-reminder': () => openReminderForm(),
  'delete-reminder': (el) => {
    actions.deleteReminder(el.dataset.id);
    toast(t('toast.reminderDeleted'), { icon: 'trash' });
  },
});
