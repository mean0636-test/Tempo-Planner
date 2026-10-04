/* ==========================================================================
   CATEGORIES PAGE — each category with its icon, colour, open/total tasks,
   notes count and completion bar. Click a card to see its tasks.
   Styles: css/pages.css → "Categories"
   ========================================================================== */
import { t } from '../core/i18n.js';
import { esc } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { button, progressBar, emptyState } from '../ui/components.js';

export function render(state) {
  const cards = state.categories.map((c, i) => {
    const tasks = state.tasks.filter((x) => x.categoryId === c.id);
    const done = tasks.filter((x) => x.completed).length;
    const open = tasks.length - done;
    const notes = state.notes.filter((n) => n.categoryId === c.id && !n.archived).length;
    const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
    return `<article class="cat-card" style="--c: var(--c-${c.color}); --i:${i}" data-action="filter-category" data-id="${c.id}" tabindex="0" data-keyboard-click aria-label="${esc(c.name)}">
      <header class="cat-card__head">
        <span class="cat-card__icon" aria-hidden="true">${esc(c.icon)}</span>
        <button type="button" class="icon-btn icon-btn--sm" data-action="category-menu" data-id="${c.id}" aria-haspopup="menu" aria-expanded="false" aria-label="${esc(t('common.moreActions'))}">${icon('more', { size: 16 })}</button>
      </header>
      <h3 class="cat-card__name">${esc(c.name)}</h3>
      <p class="cat-card__stats"><span><strong>${open}</strong> ${esc(t('categories.open'))}</span><span><strong>${notes}</strong> ${esc(t('categories.notes'))}</span></p>
      ${progressBar({ value: pct, cls: 'progress--cat', label: `${c.name} ${pct}%` })}
      <p class="cat-card__pct">${esc(t('categories.done', { pct, done, total: tasks.length }))}</p>
    </article>`;
  }).join('');

  return `<div class="categories-page">
    <div class="page-head">
      <div class="page-head__text">
        <p class="page-head__eyebrow">${icon('tag', { size: 14 })}${esc(t('nav.categories'))}</p>
        <h2 class="page-head__title">${esc(t('categories.summary', { n: state.categories.length }))}</h2>
        <p class="page-head__sub">${esc(t('categories.sub'))}</p>
      </div>
      ${button({ label: t('category.new'), icon: 'plus', action: 'new-category' })}
    </div>
    ${state.categories.length ? `<div class="cat-grid stagger">${cards}
      <button type="button" class="cat-card cat-card--add" data-action="new-category">${icon('plus', { size: 22 })}<span>${esc(t('category.new'))}</span></button>
    </div>` : emptyState({ emoji: '🏷️', title: t('empty.categoriesTitle'), text: t('empty.categoriesText'), actionLabel: t('category.new'), action: 'new-category' })}
  </div>`;
}

export const title = () => t('nav.categories');
