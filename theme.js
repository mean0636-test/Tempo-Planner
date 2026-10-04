/* ==========================================================================
   THEME — light / dark / system, plus the accent colour.
   The actual colours live in css/tokens.css. This file only sets
   data-theme="light|dark" and data-accent="indigo|violet|..." on <html>.
   ========================================================================== */
const root = document.documentElement;
const media = window.matchMedia('(prefers-color-scheme: dark)');
let currentMode = 'system';

export function resolvedTheme(mode = currentMode) {
  if (mode === 'system') return media.matches ? 'dark' : 'light';
  return mode;
}

function setMeta(theme) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#0B0F19' : '#F3F4F9');
}

export function applyTheme(mode, accent, { animate = false } = {}) {
  currentMode = mode;
  if (animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.add('theme-transition');
    window.setTimeout(() => root.classList.remove('theme-transition'), 400);
  }
  // "system" sets no attribute, so the CSS media query decides.
  if (mode === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', mode);
  root.setAttribute('data-accent', accent || 'indigo');
  setMeta(resolvedTheme(mode));
}

export function watchSystemTheme(onChange) {
  media.addEventListener('change', () => {
    if (currentMode === 'system') {
      setMeta(resolvedTheme());
      onChange?.();
    }
  });
}
