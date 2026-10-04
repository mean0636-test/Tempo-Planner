/* ==========================================================================
   GLOBAL SEARCH — command palette opened with Ctrl/Cmd + K or "/".
   Searches tasks, notes, categories and tags as you type.
   ↑ ↓ to move, Enter to open, Esc to close.
   ========================================================================== */
import { getState } from '../core/store.js';
import { registerActions } from '../core/events.js';
import { navigate } from '../core/router.js';
import { setUi, ui } from '../core/uiState.js';
import { prefs } from '../core/storage.js';
import { t } from '../core/i18n.js';
import { searchAll, categoryById } from '../core/selectors.js';
import { relativeDay } from '../core/dates.js';
import { openModal, hasOpenModal } from '../ui/modal.js';
import { esc } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { openTaskForm } from './tasks.js';
import { openNoteForm } from './notes.js';
import { openCategoryTasks } from './categories.js';

const RECENT_KEY = 'recentSearches';
let isOpen = false;

function highlight(text, q) {
  const safe = esc(text);
  if (!q) return safe;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return safe;
  return `${esc(text.slice(0, i))}<mark>${esc(text.slice(i, i + q.length))}</mark>${esc(text.slice(i + q.length))}`;
}

function rememberSearch(q) {
  if (!q.trim()) return;
  const list = [q.trim(), ...prefs.get(RECENT_KEY, []).filter((x) => x !== q.trim())].slice(0, 5);
  prefs.set(RECENT_KEY, list);
}

export function openSearch() {
  if (isOpen) return;
  isOpen = true;
  let results = [];
  let activeIndex = 0;

  const body = `<div class="search">
    <div class="search__bar">
      ${icon('search', { size: 20 })}
      <input type="text" class="search__input" id="global-search" placeholder="${esc(t('search.placeholder'))}" autocomplete="off" spellcheck="false"
        role="combobox" aria-expanded="true" aria-controls="search-results" aria-autocomplete="list" autofocus>
      <kbd class="search__esc">Esc</kbd>
    </div>
    <div class="search__results" id="search-results" role="listbox" aria-label="${esc(t('search.results'))}"></div>
    <div class="search__foot"><span><kbd>↑</kbd><kbd>↓</kbd> ${esc(t('search.navigate'))}</span><span><kbd>↵</kbd> ${esc(t('search.open'))}</span><span><kbd>Esc</kbd> ${esc(t('common.close'))}</span></div>
  </div>`;

  const modal = openModal({
    body, size: 'search', cls: 'modal-layer--search', label: t('search.title'),
    onClose: () => { isOpen = false; },
    onMount(root) {
      const input = root.querySelector('#global-search');
      const box = root.querySelector('#search-results');

      const item = (r, i, q) => `<button type="button" class="search__item ${i === activeIndex ? 'is-active' : ''}" role="option" aria-selected="${i === activeIndex}" data-index="${i}" id="sr-${i}">
          <span class="search__icon search__icon--${r.kind}">${r.iconHtml}</span>
          <span class="search__text"><span class="search__title">${highlight(r.title, q)}</span>${r.sub ? `<span class="search__sub">${esc(r.sub)}</span>` : ''}</span>
          <span class="search__kind">${esc(t(`search.kind.${r.kind}`))}</span>
        </button>`;

      const group = (label, list, q, offset) => (list.length
        ? `<div class="search__group"><div class="search__group-label">${esc(label)}</div>${list.map((r, i) => item(r, i + offset, q)).join('')}</div>` : '');

      function draw() {
        const q = input.value.trim();
        const state = getState();
        if (!q) {
          const recent = prefs.get(RECENT_KEY, []);
          results = [
            ...recent.map((r) => ({ kind: 'recent', title: r, iconHtml: icon('clock', { size: 16 }), run: () => { input.value = r; draw(); return false; } })),
            { kind: 'action', title: t('task.new'), iconHtml: icon('plus', { size: 16 }), run: () => openTaskForm() },
            { kind: 'action', title: t('note.new'), iconHtml: icon('note', { size: 16 }), run: () => openNoteForm() },
            { kind: 'action', title: t('nav.calendar'), iconHtml: icon('calendar', { size: 16 }), run: () => navigate('calendar') },
            { kind: 'action', title: t('nav.analytics'), iconHtml: icon('chart', { size: 16 }), run: () => navigate('analytics') },
          ];
          const recentList = results.filter((r) => r.kind === 'recent');
          const actionList = results.filter((r) => r.kind === 'action');
          box.innerHTML = group(t('search.recent'), recentList, '', 0) + group(t('search.quickActions'), actionList, '', recentList.length);
          return;
        }
        const found = searchAll(state, q);
        const tasks = found.tasks.map((x) => ({
          kind: 'task', title: x.title,
          sub: [x.completed ? t('task.done') : '', x.dueDate ? relativeDay(x.dueDate) : '', categoryById(state, x.categoryId)?.name].filter(Boolean).join(' · '),
          iconHtml: icon(x.completed ? 'check' : 'tasks', { size: 16 }), run: () => openTaskForm(x),
        }));
        const notes = found.notes.map((n) => ({
          kind: 'note', title: n.title || t('note.untitled'), sub: (n.content || n.checklist.map((c) => c.text).join(', ')).slice(0, 80),
          iconHtml: icon('note', { size: 16 }), run: () => openNoteForm(n),
        }));
        const cats = found.categories.map((c) => ({
          kind: 'category', title: c.name, sub: t('search.openCategory'),
          iconHtml: `<span>${esc(c.icon)}</span>`, run: () => openCategoryTasks(c.id),
        }));
        const tags = found.tags.map(({ tag, count }) => ({
          kind: 'tag', title: `#${tag}`, sub: t('search.tagCount', { count }),
          iconHtml: icon('tag', { size: 16 }), run: () => {
            setUi({ taskView: 'all', taskFilters: { ...ui.taskFilters, tag, categoryId: '', priority: '', status: '' } });
            navigate('tasks');
          },
        }));
        results = [...tasks, ...notes, ...cats, ...tags];
        activeIndex = Math.min(activeIndex, Math.max(0, results.length - 1));
        if (!results.length) {
          box.innerHTML = `<div class="search__empty"><span>🔍</span><strong>${esc(t('search.noResults', { q }))}</strong><p>${esc(t('search.noResultsHint'))}</p></div>`;
          return;
        }
        let offset = 0;
        let html = '';
        [[t('nav.tasks'), tasks], [t('nav.notes'), notes], [t('nav.categories'), cats], [t('search.tags'), tags]].forEach(([label, list]) => {
          html += group(label, list, q, offset);
          offset += list.length;
        });
        box.innerHTML = html;
      }

      function choose(i) {
        const r = results[i];
        if (!r) return;
        if (r.kind !== 'recent' && r.kind !== 'action') rememberSearch(input.value);
        modal.close(true);
        setTimeout(() => r.run(), 120);
      }

      input.addEventListener('input', () => { activeIndex = 0; draw(); });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          if (!results.length) return;
          activeIndex = (activeIndex + (e.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length;
          draw();
          root.querySelector(`#sr-${activeIndex}`)?.scrollIntoView({ block: 'nearest' });
          input.setAttribute('aria-activedescendant', `sr-${activeIndex}`);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const r = results[activeIndex];
          if (r?.kind === 'recent') { input.value = r.title; activeIndex = 0; draw(); return; }
          choose(activeIndex);
        }
      });
      box.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-index]');
        if (!btn) return;
        const r = results[Number(btn.dataset.index)];
        if (r?.kind === 'recent') { input.value = r.title; activeIndex = 0; draw(); input.focus(); return; }
        choose(Number(btn.dataset.index));
      });
      draw();
    },
  });
}

/* Keyboard shortcuts: Ctrl/Cmd+K or "/" opens search */
export function initSearchShortcuts() {
  document.addEventListener('keydown', (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (!isOpen) openSearch();
    } else if (e.key === '/' && !typing && !hasOpenModal()) {
      e.preventDefault();
      openSearch();
    }
  });
}

registerActions({ 'open-search': () => openSearch() });
