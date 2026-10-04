/* Service worker: caches the app so it opens offline once visited.
   Bump CACHE when you change files so users get the new version. */
const CACHE = 'tempo-v1';
const FILES = [
  './', './index.html', './manifest.webmanifest', './icon.svg',
  './css/tokens.css', './css/base.css', './css/layout.css', './css/components.css', './css/pages.css', './css/animations.css',
  './js/main.js',
  './js/core/models.js', './js/core/dates.js', './js/core/storage.js', './js/core/store.js', './js/core/seed.js', './js/core/selectors.js',
  './js/core/router.js', './js/core/theme.js', './js/core/events.js', './js/core/uiState.js', './js/core/i18n.js',
  './js/ui/dom.js', './js/ui/icons.js', './js/ui/components.js', './js/ui/toast.js', './js/ui/modal.js', './js/ui/dropdown.js',
  './js/ui/taskCard.js', './js/ui/noteCard.js', './js/ui/charts.js', './js/ui/formParts.js', './js/ui/swipe.js',
  './js/features/tasks.js', './js/features/notes.js', './js/features/categories.js', './js/features/reminders.js',
  './js/features/search.js', './js/features/quickAdd.js', './js/layout/shell.js',
  './js/pages/index.js', './js/pages/dashboard.js', './js/pages/tasks.js', './js/pages/notes.js', './js/pages/calendar.js',
  './js/pages/analytics.js', './js/pages/categories.js', './js/pages/settings.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
/* Network first for app files (so updates show up), cache as fallback when offline */
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok && new URL(e.request.url).origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then((hit) => hit || caches.match('./index.html'))),
  );
});
