/* ==========================================================================
   MAIN — starts the app.
   1. load saved data   2. apply theme + language   3. draw the shell
   4. render the current page, and re-render whenever data or UI state change
   ========================================================================== */
import { initStore, getState, subscribe, onSaveError } from './core/store.js';
import { initRouter, getRoute, onRouteChange, navigate } from './core/router.js';
import { applyTheme, watchSystemTheme } from './core/theme.js';
import { setLanguage, t } from './core/i18n.js';
import { initEvents } from './core/events.js';
import { ui, setUi, onUiChange } from './core/uiState.js';
import { viewCounts } from './core/selectors.js';
import { renderShell, updateShell, setPageTitle } from './layout/shell.js';
import { pages } from './pages/index.js';
import { initSwipe } from './ui/swipe.js';
import { toast } from './ui/toast.js';
import { hasOpenModal } from './ui/modal.js';
import { closeDropdown } from './ui/dropdown.js';
import { startReminderLoop } from './features/reminders.js';
import { initSearchShortcuts } from './features/search.js';
import { openTaskForm } from './features/tasks.js';
import './features/notes.js';
import './features/categories.js';
import './features/quickAdd.js';

let lastRenderedRoute = null;
let frame = 0;

/* Re-render on the next animation frame (several changes → one render) */
function requestRender() {
  if (frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    render();
  });
}

/* Keep focus + cursor in a text field when the page re-renders around it */
function captureFocus() {
  const a = document.activeElement;
  if (!a?.id || !document.getElementById('main')?.contains(a)) return null;
  return { id: a.id, start: a.selectionStart, end: a.selectionEnd };
}
function restoreFocus(saved) {
  if (!saved) return;
  const node = document.getElementById(saved.id);
  if (!node) return;
  node.focus({ preventScroll: true });
  try { if (saved.start !== null && saved.start !== undefined) node.setSelectionRange(saved.start, saved.end); } catch { /* not a text input */ }
}

function render() {
  const state = getState();
  const route = getRoute();
  const page = pages[route];
  const entering = route !== lastRenderedRoute;
  const main = document.getElementById('main');
  const focus = entering ? null : captureFocus();
  const scrollY = window.scrollY;

  try {
    main.innerHTML = `<div class="page page--${route} ${entering ? 'page-enter' : ''}">${page.render(state)}</div>`;
  } catch (err) {
    console.error('[render] page failed', err);
    main.innerHTML = `<div class="page"><div class="empty"><div class="empty__art"><span>⚠️</span></div>
      <h3 class="empty__title">${t('error.title')}</h3><p class="empty__text">${t('error.text')}</p>
      <button type="button" class="btn btn--primary btn--md" onclick="location.reload()">${t('error.reload')}</button></div></div>`;
  }
  updateShell(route);
  setPageTitle(page.title(), '');
  page.mount?.(main, { entering, state });

  if (entering) {
    lastRenderedRoute = route;
    window.scrollTo({ top: 0 });
    // Stagger animations only play on page entry; remove the class afterwards
    setTimeout(() => main.querySelector('.page-enter')?.classList.remove('page-enter'), 900);
  } else {
    window.scrollTo({ top: scrollY });
    restoreFocus(focus);
  }
}

function initShortcuts() {
  document.addEventListener('keydown', (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName);
    if (typing || hasOpenModal() || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'n' || e.key === 'N') { e.preventDefault(); openTaskForm(); }
    const jump = { 1: 'dashboard', 2: 'tasks', 3: 'notes', 4: 'calendar', 5: 'analytics', 6: 'categories', 7: 'settings' }[e.key];
    if (jump) navigate(jump);
  });
}

function registerServiceWorker() {
  // Offline support when the app is served from your own site (not inside sandboxed previews)
  if (!('serviceWorker' in navigator) || window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') return;
  navigator.serviceWorker.register('sw.js').catch(() => { /* not allowed here; app still works */ });
}

async function start() {
  const state = await initStore();
  applyTheme(state.settings.theme, state.settings.accent);
  setLanguage(state.settings.language);
  initRouter();
  initEvents();
  renderShell(document.getElementById('app'));
  render();

  subscribe(requestRender);
  onUiChange(requestRender);
  onRouteChange(() => {
    closeDropdown();
    if (ui.sidebarOpen) setUi({ sidebarOpen: false });
    requestRender();
  });
  watchSystemTheme(requestRender);
  onSaveError(() => toast(t('toast.saveFailed'), { icon: 'alert', type: 'error', duration: 8000 }));

  initSwipe();
  initSearchShortcuts();
  initShortcuts();
  startReminderLoop();
  registerServiceWorker();

  // Language changes need the static shell text redrawn too
  let lang = state.settings.language;
  subscribe((s) => {
    if (s.settings.language !== lang) {
      lang = s.settings.language;
      renderShell(document.getElementById('app'));
      lastRenderedRoute = null;
      requestRender();
    }
  });

  const counts = viewCounts(state);
  if (state.settings.notifications.overdueAlerts && counts.overdue) {
    setTimeout(() => toast(t('toast.overdueAlert', { n: counts.overdue }), {
      icon: 'alert', type: 'warning', duration: 7000,
      action: { label: t('common.view'), onClick: () => { setUi({ taskView: 'overdue' }); navigate('tasks'); } },
    }), 900);
  }
}

start().catch((err) => {
  console.error(err);
  document.getElementById('app').innerHTML = `<div class="boot-error"><h1>Tempo couldn't start</h1><p>${String(err.message || err)}</p><button onclick="location.reload()">Reload</button></div>`;
});
