/* ==========================================================================
   NOTES PAGE — search, tabs (All / Pinned / Favorites / Archived),
   tag filter, pinned notes first, masonry-style grid.
   Styles: css/pages.css → "Notes page"
   ========================================================================== */
import { registerActions, registerInput } from '../core/events.js';
import { t } from '../core/i18n.js';
import { ui, setUi } from '../core/uiState.js';
import { esc } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { noteCard } from '../ui/noteCard.js';
import { emptyState, button } from '../ui/components.js';

const TABS = [
  { id: 'all', icon: 'note' },
  { id: 'pinned', icon: 'pin' },
  { id: 'favorites', icon: 'star' },
  { id: 'archived', icon: 'archive' },
];

function matches(note, q) {
  if (!q) return true;
  const hay = `${note.title} ${note.content} ${note.tags.join(' ')} ${note.checklist.map((c) => c.text).join(' ')}`.toLowerCase();
  return hay.includes(q.toLowerCase().replace(/^#/, ''));
}

export function render(state) {
  const tab = ui.notesTab;
  const q = ui.notesQuery.trim();
  const byTab = state.notes.filter((n) => {
    if (tab === 'archived') return n.archived;
    if (n.archived) return false;
    if (tab === 'pinned') return n.pinned;
    if (tab === 'favorites') return n.favorite;
    return true;
  });
  const list = byTab
    .filter((n) => matches(n, q) && (!ui.notesTag || n.tags.includes(ui.notesTag)))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt));
  const pinned = list.filter((n) => n.pinned);
  const others = list.filter((n) => !n.pinned);
  const tags = [...new Set(state.notes.filter((n) => !n.archived).flatMap((n) => n.tags))].sort();
  const count = (id) => state.notes.filter((n) => (id === 'archived' ? n.archived : !n.archived && (id === 'all' || (id === 'pinned' ? n.pinned : n.favorite)))).length;

  let i = 0;
  const grid = (items) => `<div class="notes-grid stagger">${items.map((n) => noteCard(n, state, { index: i++ })).join('')}</div>`;

  let content;
  if (!list.length) {
    content = q || ui.notesTag
      ? emptyState({ emoji: '🔎', title: t('empty.filteredTitle'), text: t('empty.notesFiltered') })
      : tab === 'archived'
        ? emptyState({ emoji: '🗄️', title: t('empty.archiveTitle'), text: t('empty.archiveText') })
        : emptyState({ emoji: '📝', title: t('empty.notesTitle'), text: t('empty.notesText'), actionLabel: t('note.new'), action: 'new-note' });
  } else if (pinned.length && others.length && tab === 'all') {
    content = `<h3 class="notes-section">${icon('pin', { size: 14 })}${esc(t('notes.pinned'))}</h3>${grid(pinned)}
      <h3 class="notes-section">${esc(t('notes.others'))}</h3>${grid(others)}`;
  } else content = grid(list);

  return `<div class="notes-page">
    <div class="page-head">
      <div class="page-head__text">
        <p class="page-head__eyebrow">${icon('note', { size: 14 })}${esc(t('nav.notes'))}</p>
        <h2 class="page-head__title">${esc(t('notes.summary', { n: count('all') }))}</h2>
      </div>
      <div class="page-head__actions">
        ${button({ label: t('note.newChecklist'), icon: 'checklist', variant: 'secondary', action: 'new-checklist', cls: 'hide-mobile' })}
        ${button({ label: t('note.new'), icon: 'plus', action: 'new-note' })}
      </div>
    </div>
    <div class="notes-toolbar">
      <label class="toolbar__search toolbar__search--wide">${icon('search', { size: 16 })}
        <span class="sr-only">${esc(t('notes.searchPlaceholder'))}</span>
        <input type="search" id="notes-q" placeholder="${esc(t('notes.searchPlaceholder'))}" value="${esc(ui.notesQuery)}" data-input="notes-query" autocomplete="off">
      </label>
      <div class="view-tabs view-tabs--compact" role="tablist">${TABS.map((tb) => `
        <button type="button" role="tab" class="view-tab ${tb.id === tab ? 'is-active' : ''}" aria-selected="${tb.id === tab}" data-action="notes-tab" data-tab="${tb.id}">
          ${icon(tb.icon, { size: 15 })}<span>${esc(t(`notes.tab.${tb.id}`))}</span><span class="view-tab__count">${count(tb.id)}</span></button>`).join('')}</div>
    </div>
    ${tags.length ? `<div class="tag-filter" aria-label="${esc(t('form.tags'))}">
      <button type="button" class="tag-pill ${!ui.notesTag ? 'is-active' : ''}" data-action="notes-tag" data-tag="">${esc(t('filters.allTags'))}</button>
      ${tags.map((tg) => `<button type="button" class="tag-pill ${ui.notesTag === tg ? 'is-active' : ''}" data-action="notes-tag" data-tag="${esc(tg)}">#${esc(tg)}</button>`).join('')}
    </div>` : ''}
    ${content}
  </div>`;
}

export const title = () => t('nav.notes');

registerActions({
  'notes-tab': (el) => setUi({ notesTab: el.dataset.tab }),
  'notes-tag': (el) => setUi({ notesTag: ui.notesTag === el.dataset.tag ? '' : el.dataset.tag }),
});
registerInput({ 'notes-query': (el) => setUi({ notesQuery: el.value }) });
