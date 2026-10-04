/* ==========================================================================
   EVENTS — one listener for the whole app (event delegation).
   In HTML write:  <button data-action="toggle-task" data-id="t_1">
   In JS register: registerActions({ 'toggle-task': (el, event) => {...} })
   The same works for data-change="..." (selects, checkboxes),
   data-input="..." (typing) and data-submit="..." (forms).
   ========================================================================== */
const handlers = { action: {}, change: {}, input: {}, submit: {} };

export function registerActions(map) { Object.assign(handlers.action, map); }
export function registerChange(map) { Object.assign(handlers.change, map); }
export function registerInput(map) { Object.assign(handlers.input, map); }
export function registerSubmit(map) { Object.assign(handlers.submit, map); }

function run(kind, attr, event) {
  const el = event.target.closest(`[data-${attr}]`);
  if (!el) return;
  const fn = handlers[kind][el.dataset[attr]];
  if (!fn) return;
  try {
    fn(el, event);
  } catch (err) {
    console.error(`[events] ${attr}="${el.dataset[attr]}" failed`, err);
  }
}

export function initEvents() {
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (el?.tagName === 'A') e.preventDefault();
    run('action', 'action', e);
  });
  document.addEventListener('change', (e) => run('change', 'change', e));
  document.addEventListener('input', (e) => run('input', 'input', e));
  document.addEventListener('submit', (e) => {
    if (e.target.closest('[data-submit]')) e.preventDefault();
    run('submit', 'submit', e);
  });
  // Cards that open on click can also open with Enter/Space from the keyboard
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-action][data-keyboard-click]')) {
      e.preventDefault();
      e.target.click();
    }
  });
}
