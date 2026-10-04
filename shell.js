/* ==========================================================================
   APP SHELL — sidebar (desktop/tablet), top header, bottom bar (mobile).
   Styles: css/layout.css
   renderShell() builds it once; updateShell() refreshes the parts that
   change (active link, counts, bell badge, page title).
   ========================================================================== */
import { getState, actions } from '../core/store.js';
import { registerActions } from '../core/events.js';
import { navigate } from '../core/router.js';
import { ui, setUi } from '../core/uiState.js';
import { t } from '../core/i18n.js';
import { applyTheme, resolvedTheme } from '../core/theme.js';
import { viewCounts, todayProgress } from '../core/selectors.js';
import { formatDateTime } from '../core/dates.js';
import { esc } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { avatar, progressBar } from '../ui/components.js';
import { openDropdown } from '../ui/dropdown.js';
import { quickAddHtml } from '../features/quickAdd.js';
import { openCategoryTasks } from '../features/categories.js';

export const NAV = [
  { route: 'dashboard', icon: 'home', key: 'nav.dashboard' },
  { route: 'tasks', icon: 'tasks', key: 'nav.tasks' },
  { route: 'notes', icon: 'note', key: 'nav.notes' },
  { route: 'calendar', icon: 'calendar', key: 'nav.calendar' },
  { route: 'analytics', icon: 'chart', key: 'nav.analytics' },
  { route: 'categories', icon: 'tag', key: 'nav.categories' },
  { route: 'settings', icon: 'settings', key: 'nav.settings' },
];

export function renderShell(app) {
  app.innerHTML = `
  <a class="skip-link" href="#main">${esc(t('a11y.skip'))}</a>
  <div class="shell" data-collapsed="${ui.sidebarCollapsed}">
    <aside class="sidebar" aria-label="${esc(t('a11y.mainNav'))}">
      <div class="sidebar__brand">
        <span class="logo" aria-hidden="true">${icon('logo', { size: 22 })}</span>
        <span class="sidebar__name">Tempo</span>
        <button type="button" class="icon-btn icon-btn--sm sidebar__toggle" data-action="toggle-sidebar" aria-label="${esc(t('a11y.toggleSidebar'))}">${icon('sidebar', { size: 17 })}</button>
      </div>
      <nav class="sidebar__nav" id="sidebar-nav"></nav>
      <div class="sidebar__section" id="sidebar-cats"></div>
      <div class="sidebar__foot" id="sidebar-foot"></div>
    </aside>
    <div class="sidebar-scrim" data-action="close-sidebar"></div>

    <div class="main-col">
      <header class="topbar">
        <button type="button" class="icon-btn topbar__menu" data-action="open-sidebar" aria-label="${esc(t('a11y.openMenu'))}">${icon('menu')}</button>
        <div class="topbar__title"><h1 id="page-title"></h1><p id="page-subtitle" class="topbar__subtitle"></p></div>
        <button type="button" class="search-trigger" data-action="open-search" aria-label="${esc(t('search.title'))}">
          ${icon('search', { size: 17 })}<span class="search-trigger__text">${esc(t('search.trigger'))}</span><kbd class="search-trigger__kbd" id="search-kbd">Ctrl K</kbd>
        </button>
        <div class="topbar__actions">
          <button type="button" class="icon-btn topbar__search-mobile" data-action="open-search" aria-label="${esc(t('search.title'))}">${icon('search')}</button>
          <button type="button" class="icon-btn has-badge" id="bell-btn" data-action="open-notifications" aria-haspopup="true" aria-expanded="false" aria-label="${esc(t('notifications.title'))}">${icon('bell')}<span class="dot-badge" hidden></span></button>
          <button type="button" class="icon-btn" id="theme-btn" data-action="toggle-theme" aria-label="${esc(t('settings.theme'))}"></button>
          <button type="button" class="avatar-btn" id="avatar-btn" data-action="open-profile-menu" aria-haspopup="menu" aria-expanded="false" aria-label="${esc(t('profile.menu'))}"></button>
        </div>
      </header>
      <main id="main" class="main" tabindex="-1"></main>
    </div>

    <nav class="bottom-nav" aria-label="${esc(t('a11y.mainNav'))}" id="bottom-nav"></nav>
    ${quickAddHtml()}
  </div>`;

  if (!/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) return;
  const kbd = app.querySelector('#search-kbd');
  if (kbd) kbd.textContent = '⌘K';
}

export function updateShell(route) {
  const state = getState();
  const counts = viewCounts(state);
  const progress = todayProgress(state);
  const shell = document.querySelector('.shell');
  shell.dataset.collapsed = String(ui.sidebarCollapsed);
  shell.dataset.open = String(ui.sidebarOpen);

  const badges = { tasks: counts.today || '', notes: state.notes.filter((n) => !n.archived).length || '' };
  document.getElementById('sidebar-nav').innerHTML = NAV.map((n) => `
    <a href="#${n.route}" class="nav-item ${route === n.route ? 'is-active' : ''}" ${route === n.route ? 'aria-current="page"' : ''} data-tip="${esc(t(n.key))}">
      ${icon(n.icon, { size: 19 })}<span class="nav-item__label">${esc(t(n.key))}</span>
      ${badges[n.route] ? `<span class="nav-item__badge">${badges[n.route]}</span>` : ''}
    </a>`).join('');

  const cats = state.categories.slice(0, 6);
  document.getElementById('sidebar-cats').innerHTML = cats.length ? `
    <div class="sidebar__heading"><span>${esc(t('nav.categories'))}</span>
      <button type="button" class="icon-btn icon-btn--xs" data-action="new-category" aria-label="${esc(t('category.new'))}">${icon('plus', { size: 14 })}</button></div>
    ${cats.map((c) => {
      const open = state.tasks.filter((x) => x.categoryId === c.id && !x.completed).length;
      return `<button type="button" class="side-cat" data-action="sidebar-category" data-id="${c.id}" style="--c: var(--c-${c.color})" data-tip="${esc(c.name)}">
        <span class="side-cat__icon">${esc(c.icon)}</span><span class="side-cat__name">${esc(c.name)}</span>${open ? `<span class="side-cat__count">${open}</span>` : ''}</button>`;
    }).join('')}` : '';

  document.getElementById('sidebar-foot').innerHTML = `
    <div class="mini-progress" data-tip="${esc(t('dashboard.todayProgress'))} ${progress.percent}%">
      <div class="mini-progress__row"><span>${esc(t('dashboard.today'))}</span><strong>${progress.done}/${progress.total}</strong></div>
      ${progressBar({ value: progress.percent, key: 'sidebar', label: t('dashboard.todayProgress') })}
    </div>`;

  // Bottom navigation (mobile): Home · Tasks · + · Notes · More
  const moreActive = ['calendar', 'analytics', 'categories', 'settings'].includes(route);
  const bn = (r, ic, key) => `<a href="#${r}" class="bottom-nav__item ${route === r ? 'is-active' : ''}" ${route === r ? 'aria-current="page"' : ''}>${icon(ic, { size: 22 })}<span>${esc(t(key))}</span></a>`;
  document.getElementById('bottom-nav').innerHTML = `
    ${bn('dashboard', 'home', 'nav.home')}${bn('tasks', 'tasks', 'nav.tasks')}
    <button type="button" class="bottom-nav__add" data-action="toggle-quick" aria-haspopup="menu" aria-expanded="false" aria-label="${esc(t('quick.title'))}">${icon('plus', { size: 26 })}</button>
    ${bn('notes', 'note', 'nav.notes')}
    <button type="button" class="bottom-nav__item ${moreActive ? 'is-active' : ''}" data-action="open-more" aria-haspopup="menu" aria-expanded="false">${icon('menu', { size: 22 })}<span>${esc(t('nav.more'))}</span></button>`;

  // Header
  const theme = resolvedTheme(state.settings.theme);
  document.getElementById('theme-btn').innerHTML = icon(theme === 'dark' ? 'sun' : 'moon');
  document.getElementById('theme-btn').setAttribute('aria-label', theme === 'dark' ? t('theme.switchLight') : t('theme.switchDark'));
  document.getElementById('avatar-btn').innerHTML = avatar(state.profile.name, 34);
  const unseen = state.reminders.filter((r) => r.fired && !r.seen).length;
  document.querySelector('#bell-btn .dot-badge').hidden = !unseen;
}

export function setPageTitle(title, subtitle = '') {
  document.getElementById('page-title').textContent = title;
  document.getElementById('page-subtitle').textContent = subtitle;
  document.title = `${title} · Tempo`;
}

/* ---------- Header menus ---------- */
function notificationsPanel(btn) {
  const state = getState();
  const now = Date.now();
  const upcoming = state.reminders.filter((r) => !r.fired && new Date(r.at).getTime() > now).sort((a, b) => a.at.localeCompare(b.at)).slice(0, 6);
  const past = state.reminders.filter((r) => r.fired).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 4);
  const row = (r, done) => `<div class="notif ${done ? 'is-past' : ''} ${done && !r.seen ? 'is-new' : ''}">
      <span class="notif__icon">${icon('bell', { size: 15 })}</span>
      <div class="notif__text"><strong>${esc(r.title)}</strong><span>${esc(formatDateTime(r.at))}</span></div>
      <button type="button" class="icon-btn icon-btn--xs" data-action="delete-reminder" data-id="${r.id}" aria-label="${esc(t('common.delete'))}">${icon('x', { size: 13 })}</button>
    </div>`;
  openDropdown(btn, {
    width: 330, cls: 'dropdown--panel',
    html: `<div class="notif-panel">
      <div class="notif-panel__head"><strong>${esc(t('notifications.title'))}</strong>
        <button type="button" class="link-btn" data-action="new-reminder">${icon('plus', { size: 14 })}${esc(t('reminder.new'))}</button></div>
      ${upcoming.length ? `<div class="notif-panel__label">${esc(t('notifications.upcoming'))}</div>${upcoming.map((r) => row(r, false)).join('')}` : ''}
      ${past.length ? `<div class="notif-panel__label">${esc(t('notifications.earlier'))}</div>${past.map((r) => row(r, true)).join('')}` : ''}
      ${!upcoming.length && !past.length ? `<div class="notif-panel__empty">🔕<p>${esc(t('notifications.empty'))}</p></div>` : ''}
      <a href="#settings" class="notif-panel__foot" data-action="go-settings-notifications">${icon('settings', { size: 14 })}${esc(t('notifications.settings'))}</a>
    </div>`,
  });
  setTimeout(() => actions.markRemindersSeen(), 1500);
}

registerActions({
  'toggle-sidebar': () => {
    if (window.innerWidth < 1024) setUi({ sidebarOpen: !ui.sidebarOpen });
    else setUi({ sidebarCollapsed: !ui.sidebarCollapsed });
  },
  'open-sidebar': () => setUi({ sidebarOpen: true }),
  'close-sidebar': () => setUi({ sidebarOpen: false }),
  'sidebar-category': (el) => { setUi({ sidebarOpen: false }); openCategoryTasks(el.dataset.id); },
  'toggle-theme': () => {
    const s = getState().settings;
    const next = resolvedTheme(s.theme) === 'dark' ? 'light' : 'dark';
    applyTheme(next, s.accent, { animate: true });
    actions.updateSettings({ theme: next });
  },
  'open-notifications': (el) => notificationsPanel(el),
  'go-settings-notifications': () => {
    navigate('settings');
    setTimeout(() => document.getElementById('settings-notifications')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 250);
  },
  'open-profile-menu': (el) => {
    const s = getState();
    openDropdown(el, {
      items: [
        { label: s.profile.name || t('profile.you'), icon: 'user', onClick: () => navigate('settings') },
        'divider',
        { label: t('nav.settings'), icon: 'settings', onClick: () => navigate('settings') },
        { label: t('theme.light'), icon: 'sun', onClick: () => { applyTheme('light', s.settings.accent, { animate: true }); actions.updateSettings({ theme: 'light' }); } },
        { label: t('theme.dark'), icon: 'moon', onClick: () => { applyTheme('dark', s.settings.accent, { animate: true }); actions.updateSettings({ theme: 'dark' }); } },
        { label: t('theme.system'), icon: 'monitor', onClick: () => { applyTheme('system', s.settings.accent, { animate: true }); actions.updateSettings({ theme: 'system' }); } },
        'divider',
        { label: t('search.title'), icon: 'search', hint: 'Ctrl K', onClick: () => document.querySelector('.search-trigger')?.click() },
      ],
    });
  },
  'open-more': (el) => openDropdown(el, {
    cls: 'dropdown--sheet',
    items: NAV.filter((n) => ['calendar', 'analytics', 'categories', 'settings'].includes(n.route))
      .map((n) => ({ label: t(n.key), icon: n.icon, onClick: () => navigate(n.route) })),
  }),
});
