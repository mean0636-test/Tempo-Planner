/* ==========================================================================
   NOTE CARD — one note in the Notes grid and on the dashboard.
   The card colour comes from note.color → css class note--blue, note--pink...
   (colours defined in css/tokens.css → "Note colours").
   ========================================================================== */
import { esc, cx } from './dom.js';
import { icon } from './icons.js';
import { tagList, categoryChip } from './components.js';
import { categoryById } from '../core/selectors.js';
import { timeAgo } from '../core/dates.js';
import { t } from '../core/i18n.js';

export function noteCard(note, state, { index = 0, maxItems = 4 } = {}) {
  const cat = categoryById(state, note.categoryId);
  const items = note.checklist.slice(0, maxItems);
  const doneCount = note.checklist.filter((c) => c.done).length;

  return `<article class="${cx('note-card', `note--${note.color}`, note.pinned && 'is-pinned', note.archived && 'is-archived')}"
      style="--i:${index}" data-action="open-note" data-id="${note.id}" tabindex="0" data-keyboard-click
      aria-label="${esc(note.title || t('note.untitled'))}">
    <header class="note-card__head">
      <h3 class="note-card__title">${note.pinned ? `<span class="note-card__pin" title="${esc(t('note.pinned'))}">${icon('pin', { size: 14 })}</span>` : ''}${esc(note.title || t('note.untitled'))}</h3>
      <div class="note-card__tools">
        <button type="button" class="icon-btn icon-btn--sm ${note.favorite ? 'is-active-star' : ''}" data-action="note-favorite" data-id="${note.id}"
          aria-pressed="${note.favorite}" aria-label="${esc(note.favorite ? t('note.unfavorite') : t('note.favorite'))}">${icon('star', { size: 15 })}</button>
        <button type="button" class="icon-btn icon-btn--sm" data-action="note-menu" data-id="${note.id}" aria-haspopup="menu" aria-expanded="false" aria-label="${esc(t('common.moreActions'))}">${icon('more', { size: 15 })}</button>
      </div>
    </header>
    ${note.content ? `<p class="note-card__content">${esc(note.content)}</p>` : ''}
    ${items.length ? `<ul class="note-card__checklist">${items.map((c) => `
      <li><button type="button" class="mini-check ${c.done ? 'is-done' : ''}" role="checkbox" aria-checked="${c.done}"
            data-action="note-item" data-id="${note.id}" data-item="${c.id}" aria-label="${esc(c.text)}">${icon('check', { size: 11 })}</button>
          <span class="${c.done ? 'is-done' : ''}">${esc(c.text)}</span></li>`).join('')}
      ${note.checklist.length > maxItems ? `<li class="note-card__more">+${note.checklist.length - maxItems} ${esc(t('note.moreItems'))}</li>` : ''}
    </ul>` : ''}
    <footer class="note-card__foot">
      ${tagList(note.tags, { max: 3 })}
      <div class="note-card__meta">
        ${cat ? categoryChip(cat) : ''}
        ${note.checklist.length ? `<span class="note-card__count">${doneCount}/${note.checklist.length}</span>` : ''}
        <span class="note-card__time">${esc(t('note.updated'))} ${esc(timeAgo(note.updatedAt))}</span>
      </div>
    </footer>
  </article>`;
}
