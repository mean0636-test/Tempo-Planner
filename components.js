/* ==========================================================================
   REUSABLE UI COMPONENTS
   Each function returns an HTML string. Styles are in css/components.css.
   ========================================================================== */
import { esc, cx } from './dom.js';
import { icon } from './icons.js';
import { t } from '../core/i18n.js';

/* ---------- Button ----------
   variant: primary | secondary | ghost | danger     size: sm | md | lg */
export function button({ label, icon: ic, variant = 'primary', size = 'md', action, attrs = '', type = 'button', cls = '' }) {
  return `<button type="${type}" class="${cx('btn', `btn--${variant}`, `btn--${size}`, cls)}" ${action ? `data-action="${action}"` : ''} ${attrs}>
    ${ic ? icon(ic, { size: size === 'sm' ? 15 : 17 }) : ''}<span>${esc(label)}</span></button>`;
}

export function iconButton({ icon: ic, label, action, attrs = '', cls = '', size = 18 }) {
  return `<button type="button" class="${cx('icon-btn', cls)}" aria-label="${esc(label)}" title="${esc(label)}" ${action ? `data-action="${action}"` : ''} ${attrs}>${icon(ic, { size })}</button>`;
}

/* ---------- Badges ---------- */
export function priorityBadge(priority, { compact = false } = {}) {
  return `<span class="prio-badge prio-badge--${priority}" title="${esc(t(`priority.${priority}`))}">
    <span class="prio-dot"></span>${compact ? '' : `<span>${esc(t(`priority.${priority}`))}</span>`}</span>`;
}

export function categoryChip(cat, { action = false } = {}) {
  if (!cat) return '';
  const attrs = action ? `data-action="filter-category" data-id="${cat.id}"` : '';
  const tag = action ? 'button type="button"' : 'span';
  return `<${tag} class="cat-chip" style="--c: var(--c-${cat.color})" ${attrs}><span class="cat-chip__icon">${esc(cat.icon)}</span>${esc(cat.name)}</${action ? 'button' : 'span'}>`;
}

export function tagList(tags = [], { max = 3 } = {}) {
  if (!tags.length) return '';
  const shown = tags.slice(0, max).map((tg) => `<span class="tag">#${esc(tg)}</span>`).join('');
  const more = tags.length > max ? `<span class="tag tag--more">+${tags.length - max}</span>` : '';
  return `<span class="tag-list">${shown}${more}</span>`;
}

export function metaChip(ic, text, cls = '') {
  return `<span class="${cx('meta-chip', cls)}">${icon(ic, { size: 13 })}<span>${esc(text)}</span></span>`;
}

/* ---------- Progress ----------
   `from` lets the bar animate from its previous value after a re-render. */
export function progressBar({ value, from = value, label = '', cls = '', key = '' }) {
  const v = Math.max(0, Math.min(100, value));
  return `<div class="${cx('progress', cls)}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${v}" ${label ? `aria-label="${esc(label)}"` : ''}>
    <div class="progress__fill" data-fill="${v}" data-fill-key="${key}" style="width:${from}%"></div></div>`;
}

export function progressRing({ value, size = 64, stroke = 7, label = '', cls = '', showValue = true }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return `<div class="${cx('ring', cls)}" style="--size:${size}px" role="img" aria-label="${esc(label || `${v}%`)}">
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle class="ring__track" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}" fill="none"/>
      <circle class="ring__value" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}" fill="none"
        stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${(c * (1 - v / 100)).toFixed(2)}" style="--circ:${c.toFixed(2)}"
        transform="rotate(-90 ${size / 2} ${size / 2})" stroke-linecap="round"/>
    </svg>${showValue ? `<span class="ring__label">${v}<small>%</small></span>` : ''}</div>`;
}

/* ---------- Empty state ---------- */
export function emptyState({ emoji = '✨', title, text, actionLabel, action, attrs = '', compact = false }) {
  return `<div class="${cx('empty', compact && 'empty--compact')}">
    <div class="empty__art" aria-hidden="true"><span>${emoji}</span></div>
    <h3 class="empty__title">${esc(title)}</h3>
    ${text ? `<p class="empty__text">${esc(text)}</p>` : ''}
    ${actionLabel ? button({ label: actionLabel, icon: 'plus', action, attrs, size: 'sm' }) : ''}
  </div>`;
}

/* ---------- Skeleton (loading placeholder) ---------- */
export function skeleton(lines = [70, 45, 85]) {
  return `<div class="skeleton-card">${lines.map((w) => `<div class="skeleton" style="width:${w}%"></div>`).join('')}</div>`;
}

/* ---------- Avatar ---------- */
export function avatar(name = '', size = 34) {
  const initials = (name.trim() || 'You').split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  return `<span class="avatar" style="--size:${size}px" aria-hidden="true">${esc(initials)}</span>`;
}

/* ---------- Section header used on cards ---------- */
export function sectionHeader(title, { count, actionLabel, action, attrs = '', ic } = {}) {
  return `<div class="section-head">
    <h2 class="section-head__title">${ic ? icon(ic, { size: 17 }) : ''}${esc(title)}${count !== undefined ? `<span class="count-pill">${count}</span>` : ''}</h2>
    ${actionLabel ? `<button type="button" class="link-btn" data-action="${action}" ${attrs}>${esc(actionLabel)}${icon('arrowRight', { size: 14 })}</button>` : ''}
  </div>`;
}

/* ---------- Form field helpers ---------- */
export function field(label, control, { hint = '', id = '' } = {}) {
  return `<div class="field">${label ? `<label class="field__label" ${id ? `for="${id}"` : ''}>${esc(label)}</label>` : ''}${control}${hint ? `<p class="field__hint">${esc(hint)}</p>` : ''}</div>`;
}

export function toggle({ id, checked, label, desc = '', change = '', attrs = '' }) {
  return `<label class="toggle-row" for="${id}">
    <span class="toggle-row__text"><span class="toggle-row__label">${esc(label)}</span>${desc ? `<span class="toggle-row__desc">${esc(desc)}</span>` : ''}</span>
    <span class="switch"><input type="checkbox" id="${id}" ${checked ? 'checked' : ''} ${change ? `data-change="${change}"` : ''} ${attrs}><span class="switch__track"><span class="switch__thumb"></span></span></span>
  </label>`;
}

export function segmented({ name, options, value, change = '', cls = '' }) {
  return `<div class="${cx('segmented', cls)}" role="radiogroup">${options.map((o) => `
    <label class="segmented__opt ${o.cls || ''}">
      <input type="radio" name="${name}" value="${o.value}" ${o.value === value ? 'checked' : ''} ${change ? `data-change="${change}"` : ''}>
      <span>${o.icon ? icon(o.icon, { size: 15 }) : ''}${o.dot ? '<span class="prio-dot"></span>' : ''}${esc(o.label)}</span>
    </label>`).join('')}</div>`;
}
