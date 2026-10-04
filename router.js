/* ==========================================================================
   ROUTER — tiny hash router (#dashboard, #tasks, #notes, ...)
   To add a page: add its id to ROUTES and register it in js/pages/index.js
   ========================================================================== */
export const ROUTES = ['dashboard', 'tasks', 'notes', 'calendar', 'analytics', 'categories', 'settings'];
const DEFAULT = 'dashboard';

let current = null;
const listeners = new Set();

function parse() {
  const name = window.location.hash.replace(/^#\/?/, '');
  return ROUTES.includes(name) ? name : DEFAULT;
}

export function initRouter() {
  current = parse();
  window.addEventListener('hashchange', () => {
    const next = parse();
    if (next === current) return;
    current = next;
    listeners.forEach((fn) => fn(current));
  });
}

export const getRoute = () => current;
export const onRouteChange = (fn) => listeners.add(fn);

export function navigate(name) {
  if (!ROUTES.includes(name)) return;
  if (name === current) {
    listeners.forEach((fn) => fn(current));
    return;
  }
  window.location.hash = name;
}
