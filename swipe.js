/* ==========================================================================
   SWIPE GESTURES for task cards on touch screens.
   Swipe right → complete    Swipe left → delete (with undo toast)
   ========================================================================== */
import { toggleTaskAnimated, deleteTaskWithUndo } from '../features/tasks.js';

const THRESHOLD = 88;

export function initSwipe() {
  let start = null;

  document.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch') return;
    const wrap = e.target.closest('.task-swipe');
    if (!wrap || e.target.closest('button.check, .icon-btn')) return;
    start = { x: e.clientX, y: e.clientY, wrap, card: wrap.querySelector('.task-card'), dx: 0, locked: null };
  }, { passive: true });

  document.addEventListener('pointermove', (e) => {
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (start.locked === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      start.locked = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    }
    if (start.locked !== 'x') return;
    start.dx = Math.max(-140, Math.min(140, dx));
    start.card.style.transition = 'none';
    start.card.style.transform = `translateX(${start.dx}px)`;
    start.wrap.dataset.swipe = start.dx > 0 ? 'right' : 'left';
    start.wrap.classList.toggle('is-armed', Math.abs(start.dx) > THRESHOLD);
  }, { passive: true });

  const end = () => {
    if (!start) return;
    const { dx, card, wrap, locked } = start;
    start = null;
    card.style.transition = '';
    card.style.transform = '';
    wrap.classList.remove('is-armed');
    if (locked !== 'x') return;
    // stop the click that follows the swipe from opening the task
    const block = (ev) => { ev.stopPropagation(); ev.preventDefault(); };
    window.addEventListener('click', block, { capture: true, once: true });
    setTimeout(() => window.removeEventListener('click', block, { capture: true }), 50);
    const id = wrap.dataset.id;
    if (dx > THRESHOLD) toggleTaskAnimated(id, card);
    else if (dx < -THRESHOLD) deleteTaskWithUndo(id, card);
    setTimeout(() => { delete wrap.dataset.swipe; }, 250);
  };
  document.addEventListener('pointerup', end);
  document.addEventListener('pointercancel', end);
}
