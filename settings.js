/* ==========================================================================
   SETTINGS PAGE — profile, appearance (theme + accent), notifications,
   task defaults, language, and data (export / import / backup / clear).
   Styles: css/pages.css → "Settings"
   ========================================================================== */
import { getState, actions, isPersistent, getBackupInfo } from '../core/store.js';
import { registerActions, registerChange, registerInput } from '../core/events.js';
import { t, setLanguage } from '../core/i18n.js';
import { applyTheme } from '../core/theme.js';
import { validateImport, PRIORITIES, ACCENTS } from '../core/models.js';
import { formatDateTime, toLocalDateTime } from '../core/dates.js';
import { esc, debounce } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { avatar, toggle, segmented } from '../ui/components.js';
import { openModal, confirmDialog } from '../ui/modal.js';
import { toast } from '../ui/toast.js';
import { requestSystemNotifications, systemPermission } from '../features/reminders.js';

let backupInfo = null;
getBackupInfo().then((v) => { backupInfo = v; });

function section(id, ic, title, desc, body) {
  return `<section class="settings-section" id="${id}">
    <header class="settings-section__head"><span class="settings-section__icon">${icon(ic, { size: 18 })}</span>
      <div><h2>${esc(title)}</h2><p>${esc(desc)}</p></div></header>
    <div class="settings-section__body">${body}</div>
  </section>`;
}

function row(label, desc, control) {
  return `<div class="setting-row"><div class="setting-row__text"><span class="setting-row__label">${esc(label)}</span>${desc ? `<span class="setting-row__desc">${esc(desc)}</span>` : ''}</div>
    <div class="setting-row__control">${control}</div></div>`;
}

export function render(state) {
  const s = state.settings;
  const perm = systemPermission();
  const upcoming = state.reminders.filter((r) => !r.fired).sort((a, b) => a.at.localeCompare(b.at));
  const size = new Blob([JSON.stringify(state)]).size;

  return `<div class="settings">
    <nav class="settings-nav" aria-label="${esc(t('nav.settings'))}">
      ${[['settings-profile', 'user', 'settings.profile'], ['settings-appearance', 'palette', 'settings.appearance'], ['settings-notifications', 'bell', 'settings.notifications'],
        ['settings-tasks', 'tasks', 'settings.taskDefaults'], ['settings-language', 'globe', 'settings.language'], ['settings-data', 'database', 'settings.data']]
        .map(([id, ic, key]) => `<a href="#settings" data-action="settings-jump" data-target="${id}" class="settings-nav__item">${icon(ic, { size: 16 })}${esc(t(key))}</a>`).join('')}
    </nav>

    <div class="settings-main">
      ${section('settings-profile', 'user', t('settings.profile'), t('settings.profileDesc'), `
        <div class="profile-row">
          ${avatar(state.profile.name, 56)}
          <div class="field profile-row__field">
            <label class="field__label" for="profile-name">${esc(t('settings.displayName'))}</label>
            <input class="input" id="profile-name" type="text" maxlength="40" value="${esc(state.profile.name)}" placeholder="${esc(t('settings.namePlaceholder'))}" data-input="profile-name" autocomplete="name">
            <p class="field__hint">${esc(t('settings.nameHint'))}</p>
          </div>
        </div>`)}

      ${section('settings-appearance', 'palette', t('settings.appearance'), t('settings.appearanceDesc'), `
        ${row(t('settings.theme'), t('settings.themeDesc'), segmented({
          name: 'theme', value: s.theme, change: 'set-theme',
          options: [{ value: 'light', label: t('theme.light'), icon: 'sun' }, { value: 'dark', label: t('theme.dark'), icon: 'moon' }, { value: 'system', label: t('theme.system'), icon: 'monitor' }],
        }))}
        ${row(t('settings.accent'), t('settings.accentDesc'), `<div class="swatches" role="radiogroup" aria-label="${esc(t('settings.accent'))}">${ACCENTS.map((a) => `
          <label class="swatch swatch--accent swatch--${a}" title="${esc(t(`accent.${a}`))}"><input type="radio" name="accent" value="${a}" ${a === s.accent ? 'checked' : ''} data-change="set-accent" aria-label="${esc(t(`accent.${a}`))}"><span></span></label>`).join('')}</div>`)}
      `)}

      ${section('settings-notifications', 'bell', t('settings.notifications'), t('settings.notificationsDesc'), `
        ${toggle({ id: 'n-enabled', checked: s.notifications.enabled, label: t('settings.inApp'), desc: t('settings.inAppDesc'), change: 'notif-enabled' })}
        ${toggle({ id: 'n-sound', checked: s.notifications.sound, label: t('settings.sound'), desc: t('settings.soundDesc'), change: 'notif-sound' })}
        ${toggle({ id: 'n-overdue', checked: s.notifications.overdueAlerts, label: t('settings.overdue'), desc: t('settings.overdueDesc'), change: 'notif-overdue' })}
        ${toggle({ id: 'n-system', checked: s.notifications.system && perm === 'granted', label: t('settings.system'), desc: perm === 'unsupported' ? t('settings.systemUnsupported') : perm === 'denied' ? t('settings.systemDenied') : t('settings.systemDesc'), change: 'notif-system', attrs: perm === 'unsupported' || perm === 'denied' ? 'disabled' : '' })}
        <div class="reminder-list">
          <div class="reminder-list__head"><span>${esc(t('notifications.upcoming'))}</span>
            <button type="button" class="link-btn" data-action="new-reminder">${icon('plus', { size: 14 })}${esc(t('reminder.new'))}</button></div>
          ${upcoming.length ? upcoming.slice(0, 8).map((r) => `<div class="reminder-item">${icon('bell', { size: 15 })}
            <span class="reminder-item__title">${esc(r.title)}</span><span class="reminder-item__time">${esc(formatDateTime(r.at))}</span>
            <button type="button" class="icon-btn icon-btn--xs" data-action="delete-reminder" data-id="${r.id}" aria-label="${esc(t('common.delete'))}">${icon('x', { size: 13 })}</button></div>`).join('')
            : `<p class="panel__empty">${esc(t('notifications.empty'))}</p>`}
        </div>
      `)}

      ${section('settings-tasks', 'tasks', t('settings.taskDefaults'), t('settings.taskDefaultsDesc'), `
        ${row(t('settings.defaultPriority'), t('settings.defaultPriorityDesc'), segmented({
          name: 'default-priority', value: s.defaultPriority, change: 'set-default-priority', cls: 'segmented--priority',
          options: PRIORITIES.map((p) => ({ value: p, label: t(`priority.${p}`), dot: true, cls: `prio--${p}` })),
        }))}
        ${row(t('settings.weekStart'), '', segmented({
          name: 'week-start', value: String(s.weekStartsOn), change: 'set-week-start',
          options: [{ value: '1', label: t('settings.monday') }, { value: '0', label: t('settings.sunday') }],
        }))}
      `)}

      ${section('settings-language', 'globe', t('settings.language'), t('settings.languageDesc'), `
        ${row(t('settings.language'), '', segmented({
          name: 'language', value: s.language, change: 'set-language',
          options: [{ value: 'en', label: 'English' }, { value: 'km', label: 'ខ្មែរ' }],
        }))}
      `)}

      ${section('settings-data', 'database', t('settings.data'), t('settings.dataDesc'), `
        <div class="storage-status ${isPersistent() ? 'is-ok' : 'is-warn'}">
          ${icon(isPersistent() ? 'check' : 'alert', { size: 16 })}
          <span>${esc(isPersistent() ? t('settings.storageOk') : t('settings.storageMemory'))}</span>
          <span class="storage-status__meta">${esc(t('settings.dataSize', { tasks: state.tasks.length, notes: state.notes.length, kb: Math.max(1, Math.round(size / 1024)) }))}</span>
        </div>
        <div class="data-actions">
          <button type="button" class="data-btn" data-action="export-data">${icon('download')}<span><strong>${esc(t('settings.export'))}</strong><small>${esc(t('settings.exportDesc'))}</small></span></button>
          <label class="data-btn" for="import-file">${icon('upload')}<span><strong>${esc(t('settings.import'))}</strong><small>${esc(t('settings.importDesc'))}</small></span>
            <input type="file" id="import-file" accept="application/json,.json" class="sr-only" data-change="import-file"></label>
          <button type="button" class="data-btn" data-action="import-paste">${icon('copy')}<span><strong>${esc(t('settings.importPaste'))}</strong><small>${esc(t('settings.importPasteDesc'))}</small></span></button>
          <button type="button" class="data-btn" data-action="restore-backup" ${backupInfo ? '' : 'disabled'}>${icon('undo')}<span><strong>${esc(t('settings.restore'))}</strong><small>${esc(backupInfo ? t('settings.restoreDesc', { when: formatDateTime(toLocalDateTime(new Date(backupInfo))) }) : t('settings.noBackup'))}</small></span></button>
          <button type="button" class="data-btn" data-action="load-sample">${icon('sparkle')}<span><strong>${esc(t('settings.sample'))}</strong><small>${esc(t('settings.sampleDesc'))}</small></span></button>
          <button type="button" class="data-btn data-btn--danger" data-action="clear-data">${icon('trash')}<span><strong>${esc(t('settings.clear'))}</strong><small>${esc(t('settings.clearDesc'))}</small></span></button>
        </div>
      `)}
      <p class="settings-foot">Tempo · ${esc(t('settings.footer'))}</p>
    </div>
  </div>`;
}

export const title = () => t('nav.settings');

/* ---------- Export / import ---------- */
function exportPayload() {
  return JSON.stringify({ app: 'tempo', version: 1, exportedAt: new Date().toISOString(), data: getState() }, null, 2);
}

function tryDownload(text) {
  try {
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tempo-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  } catch { /* some embedded viewers block downloads; the copy box still works */ }
}

function openExport() {
  const text = exportPayload();
  tryDownload(text);
  const m = openModal({
    title: t('settings.export'), size: 'md',
    body: `<p class="modal__lead">${esc(t('settings.exportModal'))}</p>
      <textarea class="input textarea code-box" id="export-box" readonly rows="10" aria-label="${esc(t('settings.export'))}">${esc(text)}</textarea>`,
    footer: `<span class="modal__foot-spacer"></span>
      <button type="button" class="btn btn--secondary btn--md" data-dl>${icon('download', { size: 16 })}<span>${esc(t('settings.downloadAgain'))}</span></button>
      <button type="button" class="btn btn--primary btn--md" data-copy>${icon('copy', { size: 16 })}<span>${esc(t('common.copy'))}</span></button>`,
    onMount(root) {
      const box = root.querySelector('#export-box');
      root.querySelector('[data-dl]').addEventListener('click', () => tryDownload(text));
      root.querySelector('[data-copy]').addEventListener('click', () => {
        const fallback = () => { box.focus(); box.select(); toast(t('toast.selectToCopy'), { icon: 'info' }); };
        if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(() => toast(t('toast.copied'), { icon: 'copy', type: 'success' }), fallback);
        else fallback();
      });
    },
  });
  return m;
}

async function importText(text) {
  let data;
  try {
    data = validateImport(JSON.parse(text));
  } catch (err) {
    toast(err instanceof SyntaxError ? t('toast.importBadJson') : err.message, { icon: 'alert', type: 'error', title: t('toast.importFailed'), duration: 6000 });
    return false;
  }
  const ok = await confirmDialog({
    title: t('settings.importConfirm'), message: t('settings.importConfirmText', { tasks: data.tasks.length, notes: data.notes.length }),
    confirmLabel: t('settings.import'), danger: false, emoji: '📥',
  });
  if (!ok) return false;
  await actions.replaceAll(data);
  applyTheme(data.settings.theme, data.settings.accent);
  setLanguage(data.settings.language);
  backupInfo = new Date().toISOString();
  toast(t('toast.imported'), { icon: 'upload', type: 'success', action: { label: t('common.undo'), onClick: () => actions.restoreBackup() } });
  return true;
}

const saveName = debounce((value) => actions.updateProfile({ name: value.trim() }), 350);

registerActions({
  'settings-jump': (el) => document.getElementById(el.dataset.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
  'export-data': () => openExport(),
  'import-paste': () => {
    const m = openModal({
      title: t('settings.importPaste'), size: 'md',
      body: `<p class="modal__lead">${esc(t('settings.importPasteModal'))}</p>
        <textarea class="input textarea code-box" id="import-box" rows="10" placeholder='{ "app": "tempo", ... }' autofocus aria-label="${esc(t('settings.importPaste'))}"></textarea>`,
      footer: `<span class="modal__foot-spacer"></span><button type="button" class="btn btn--secondary btn--md" data-close>${esc(t('common.cancel'))}</button>
        <button type="button" class="btn btn--primary btn--md" data-go>${icon('upload', { size: 16 })}<span>${esc(t('settings.import'))}</span></button>`,
      onMount(root) {
        root.querySelector('[data-go]').addEventListener('click', async () => {
          const ok = await importText(root.querySelector('#import-box').value);
          if (ok) m.close(true);
        });
      },
    });
  },
  'restore-backup': async () => {
    const ok = await confirmDialog({ title: t('settings.restoreConfirm'), message: t('settings.restoreConfirmText'), confirmLabel: t('settings.restore'), danger: false, emoji: '↩️' });
    if (!ok) return;
    const when = await actions.restoreBackup();
    const s = getState().settings;
    applyTheme(s.theme, s.accent);
    setLanguage(s.language);
    toast(when ? t('toast.restored') : t('settings.noBackup'), { icon: 'undo' });
  },
  'load-sample': async () => {
    const ok = await confirmDialog({ title: t('settings.sampleConfirm'), message: t('settings.sampleConfirmText'), confirmLabel: t('settings.sampleLoad'), danger: false, emoji: '✨' });
    if (!ok) return;
    await actions.loadSample();
    backupInfo = new Date().toISOString();
    toast(t('toast.sampleLoaded'), { icon: 'sparkle', action: { label: t('common.undo'), onClick: () => actions.restoreBackup() } });
  },
  'clear-data': async () => {
    const ok = await confirmDialog({ title: t('settings.clearConfirm'), message: t('settings.clearConfirmText'), confirmLabel: t('settings.clear') });
    if (!ok) return;
    await actions.clearAll();
    backupInfo = new Date().toISOString();
    toast(t('toast.cleared'), { icon: 'trash', duration: 7000, action: { label: t('common.undo'), onClick: () => actions.restoreBackup() } });
  },
});

registerChange({
  'set-theme': (el) => { applyTheme(el.value, getState().settings.accent, { animate: true }); actions.updateSettings({ theme: el.value }); },
  'set-accent': (el) => { applyTheme(getState().settings.theme, el.value, { animate: true }); actions.updateSettings({ accent: el.value }); toast(t('toast.accent'), { icon: 'palette' }); },
  'set-default-priority': (el) => { actions.updateSettings({ defaultPriority: el.value }); toast(t('toast.saved'), { icon: 'check' }); },
  'set-week-start': (el) => actions.updateSettings({ weekStartsOn: Number(el.value) }),
  'set-language': (el) => { setLanguage(el.value); actions.updateSettings({ language: el.value }); },
  'notif-enabled': (el) => actions.updateSettings({ notifications: { enabled: el.checked } }),
  'notif-sound': (el) => actions.updateSettings({ notifications: { sound: el.checked } }),
  'notif-overdue': (el) => actions.updateSettings({ notifications: { overdueAlerts: el.checked } }),
  'notif-system': async (el) => {
    if (!el.checked) { actions.updateSettings({ notifications: { system: false } }); return; }
    const result = await requestSystemNotifications();
    if (result === 'granted') {
      actions.updateSettings({ notifications: { system: true } });
      toast(t('toast.systemOn'), { icon: 'bell', type: 'success' });
    } else {
      el.checked = false;
      actions.updateSettings({ notifications: { system: false } });
      toast(t('toast.systemBlocked'), { icon: 'alert', type: 'error', duration: 6000 });
    }
  },
  'import-file': (el) => {
    const file = el.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => importText(String(reader.result));
    reader.onerror = () => toast(t('toast.importFailed'), { icon: 'alert', type: 'error' });
    reader.readAsText(file);
    el.value = '';
  },
});

registerInput({ 'profile-name': (el) => saveName(el.value) });
