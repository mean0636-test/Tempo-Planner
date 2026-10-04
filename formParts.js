/* ==========================================================================
   FORM PARTS shared by the task and note forms:
   - tag input (type, press Enter or comma → chip)
   - checklist editor (subtasks for tasks, checklist for notes)
   Each returns { html } to place in the form and mount(root) → { get() }.
   ========================================================================== */
import { esc, parseTags } from './dom.js';
import { icon } from './icons.js';
import { uid } from '../core/models.js';
import { t } from '../core/i18n.js';

/* ---------- Tag input ---------- */
export function tagInput({ id, tags = [], suggestions = [] }) {
  let current = [...tags];
  const html = `<div class="tag-input" data-tag-input="${id}">
    <div class="tag-input__chips"></div>
    <input class="tag-input__field" id="${id}" type="text" placeholder="${esc(t('form.tagsPlaceholder'))}" autocomplete="off" list="${id}-list">
    <datalist id="${id}-list">${suggestions.map((s) => `<option value="${esc(s)}"></option>`).join('')}</datalist>
  </div>`;

  function mount(root) {
    const wrap = root.querySelector(`[data-tag-input="${id}"]`);
    const chips = wrap.querySelector('.tag-input__chips');
    const input = wrap.querySelector('input');
    const draw = () => {
      chips.innerHTML = current.map((tg, i) => `<span class="tag tag--removable">#${esc(tg)}
        <button type="button" data-remove="${i}" aria-label="${esc(t('form.removeTag'))} ${esc(tg)}">${icon('x', { size: 11 })}</button></span>`).join('');
    };
    const commitText = () => {
      const added = parseTags(input.value);
      if (!added.length) return;
      added.forEach((tg) => { if (!current.some((c) => c.toLowerCase() === tg.toLowerCase())) current.push(tg); });
      input.value = '';
      draw();
    };
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        commitText();
      } else if (e.key === 'Backspace' && !input.value && current.length) {
        current.pop();
        draw();
      }
    });
    input.addEventListener('blur', commitText);
    input.addEventListener('change', commitText);
    chips.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-remove]');
      if (!btn) return;
      current.splice(Number(btn.dataset.remove), 1);
      draw();
      input.focus();
    });
    wrap.addEventListener('click', (e) => { if (e.target === wrap) input.focus(); });
    draw();
    return { get: () => { commitText(); return [...current]; } };
  }
  return { html, mount };
}

/* ---------- Checklist editor ----------
   items: [{ id, text|title, done }]; textKey says which property holds the text */
export function checklistEditor({ id, items = [], textKey = 'text', placeholder }) {
  let list = items.map((it) => ({ ...it }));
  const html = `<div class="checklist-editor" data-checklist="${id}">
    <ul class="checklist-editor__list"></ul>
    <div class="checklist-editor__add">
      <span class="checklist-editor__plus">${icon('plus', { size: 15 })}</span>
      <input type="text" id="${id}" class="checklist-editor__new" placeholder="${esc(placeholder || t('form.addItem'))}" autocomplete="off">
    </div>
  </div>`;

  function mount(root) {
    const wrap = root.querySelector(`[data-checklist="${id}"]`);
    const ul = wrap.querySelector('ul');
    const input = wrap.querySelector('.checklist-editor__new');
    const draw = (focusIndex = -1) => {
      ul.innerHTML = list.map((it, i) => `<li class="checklist-editor__item ${it.done ? 'is-done' : ''}" data-index="${i}">
        <button type="button" class="mini-check ${it.done ? 'is-done' : ''}" role="checkbox" aria-checked="${it.done}" data-toggle="${i}" aria-label="${esc(t('form.toggleItem'))}">${icon('check', { size: 11 })}</button>
        <input type="text" value="${esc(it[textKey])}" data-edit="${i}" aria-label="${esc(t('form.itemText'))}">
        <button type="button" class="icon-btn icon-btn--sm" data-del="${i}" aria-label="${esc(t('form.removeItem'))}">${icon('x', { size: 14 })}</button>
      </li>`).join('');
      if (focusIndex >= 0) ul.querySelector(`[data-edit="${focusIndex}"]`)?.focus();
    };
    const add = () => {
      const text = input.value.trim();
      if (!text) return;
      list.push({ id: uid(textKey === 'title' ? 's' : 'c'), [textKey]: text, done: false });
      input.value = '';
      draw();
    };
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); add(); }
    });
    input.addEventListener('blur', add);
    ul.addEventListener('input', (e) => {
      const i = e.target.dataset.edit;
      if (i !== undefined) list[Number(i)][textKey] = e.target.value;
    });
    ul.addEventListener('keydown', (e) => {
      const i = e.target.dataset.edit;
      if (i === undefined) return;
      if (e.key === 'Enter') { e.preventDefault(); input.focus(); }
      if (e.key === 'Backspace' && !e.target.value) {
        e.preventDefault();
        list.splice(Number(i), 1);
        draw(Math.max(0, Number(i) - 1));
        if (!list.length) input.focus();
      }
    });
    ul.addEventListener('click', (e) => {
      const tg = e.target.closest('[data-toggle]');
      const del = e.target.closest('[data-del]');
      if (tg) { const it = list[Number(tg.dataset.toggle)]; it.done = !it.done; draw(); }
      if (del) { list.splice(Number(del.dataset.del), 1); draw(); input.focus(); }
    });
    draw();
    return {
      get: () => { add(); return list.filter((it) => String(it[textKey]).trim()).map((it) => ({ ...it, [textKey]: String(it[textKey]).trim() })); },
      focusNew: () => input.focus(),
    };
  }
  return { html, mount };
}
