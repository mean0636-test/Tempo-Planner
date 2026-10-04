# Tempo — Notes & Daily Tasks

A fast, offline-first personal planner: tasks with priorities, subtasks and reminders,
colourful notes with checklists, a calendar, analytics, categories, light/dark themes,
and English/Khmer interface text.

Plain HTML + CSS + JavaScript modules. **No build step, no frameworks, no npm.**

## Run it

Browsers don't load JavaScript modules from `file://`, so serve the folder:

```bash
cd tempo
python3 -m http.server 8000
# open http://localhost:8000
```

Any static host works too (Firebase Hosting, Netlify, GitHub Pages). On HTTPS or
localhost the service worker (`sw.js`) caches the app so it opens offline and can be
installed as a PWA.

## Folder map: where to change what

```
tempo/
├── index.html              Page skeleton, font links, loading skeleton
├── css/
│   ├── tokens.css          ★ COLOURS, fonts, radius, shadows, spacing, animation speed, DARK MODE
│   ├── base.css            Reset, typography, focus rings, utilities
│   ├── layout.css          ★ RESPONSIVE LAYOUT: sidebar, header, mobile bottom bar, breakpoints
│   ├── components.css      ★ TASK CARDS, note cards, buttons, inputs, modals, toasts, quick-add, search, charts
│   ├── pages.css           Page layouts: dashboard, tasks, notes, calendar, analytics, categories, settings
│   └── animations.css      ★ ALL ANIMATIONS (keyframes, page transitions, reduced-motion)
├── js/
│   ├── main.js             Starts the app, renders pages, keyboard shortcuts
│   ├── core/               Data and logic (no HTML)
│   │   ├── models.js       ★ DATA MODELS: Task, Note, Category, Reminder, Settings
│   │   ├── store.js        ★ The only place data changes (actions.addTask, ...) + autosave
│   │   ├── storage.js      localStorage adapter (swap this for cloud sync later)
│   │   ├── selectors.js    Calculations: today's progress, streak, filters, search
│   │   ├── dates.js        Date helpers (local dates, "Today", "Tomorrow", calendar grid)
│   │   ├── i18n.js         ★ ALL TEXT in English and Khmer
│   │   ├── theme.js        Applies light/dark/system and accent colour
│   │   ├── router.js       #dashboard, #tasks, ... navigation
│   │   ├── events.js       data-action="..." click handling
│   │   ├── uiState.js      Current tab, filters, sidebar state
│   │   └── seed.js         Sample data shown on first launch
│   ├── ui/                 Reusable building blocks
│   │   ├── components.js   Button, Badge, ProgressBar, ProgressRing, EmptyState, Skeleton, Avatar...
│   │   ├── taskCard.js     ★ How a task looks
│   │   ├── noteCard.js     ★ How a note looks
│   │   ├── charts.js       Bar list, area chart, donut, heatmap (SVG, no library)
│   │   ├── modal.js        Dialogs + confirmDialog()
│   │   ├── dropdown.js     ⋮ menus, profile menu, notifications panel
│   │   ├── toast.js        Bottom notifications with Undo
│   │   ├── formParts.js    Tag input, checklist/subtask editor
│   │   ├── swipe.js        Swipe right = complete, left = delete (touch)
│   │   ├── icons.js        Icon set (add new icons here)
│   │   └── dom.js          Helpers (escape text, debounce, count-up)
│   ├── features/           Things you do: forms and their actions
│   │   ├── tasks.js        Task form, complete with animation, delete with undo
│   │   ├── notes.js        Note editor, pin, favourite, archive
│   │   ├── categories.js   Category form
│   │   ├── reminders.js    Reminder form + the timer that fires reminders
│   │   ├── search.js       Ctrl/Cmd + K command palette
│   │   └── quickAdd.js     Floating "+" menu
│   ├── layout/shell.js     ★ NAVIGATION: sidebar, header, bottom bar
│   └── pages/              ★ One file per screen (dashboard.js, tasks.js, notes.js, ...)
├── sw.js, manifest.webmanifest, icon.svg   Offline + install as app
```

## Common changes

| I want to… | Edit |
|---|---|
| Change the brand colour | `css/tokens.css` → `--primary-solid` and `--brand-2` (or pick an accent in Settings) |
| Change dark mode colours | `css/tokens.css` → the two dark blocks (keep them identical) |
| Change fonts | `index.html` font link + `--font-display` / `--font-body` in `tokens.css` |
| Change corner roundness / shadows | `--radius-*` and `--shadow-*` in `tokens.css` |
| Make animations faster/slower | `--dur-fast`, `--dur`, `--dur-slow` in `tokens.css` |
| Change the dashboard | `js/pages/dashboard.js` (HTML) + "Dashboard" section of `css/pages.css` |
| Change task card look | `js/ui/taskCard.js` + "Task card" in `css/components.css` |
| Change note card look | `js/ui/noteCard.js` + "Note card" in `css/components.css` |
| Add a field to tasks | `createTask()` in `js/core/models.js`, then the form in `js/features/tasks.js` |
| Rename a button or message | `js/core/i18n.js` |
| Change breakpoints / mobile layout | `css/layout.css` (shell) and the "Responsive" part of `css/pages.css` |
| Add a page | create `js/pages/mypage.js`, add it to `js/pages/index.js`, `ROUTES` in `router.js`, `NAV` in `layout/shell.js` |

## How data works

- Everything lives in one object (see `createEmptyState()` in `models.js`):
  `{ meta, profile, settings, tasks[], notes[], categories[], reminders[] }`.
- Pages never change data directly. They call `actions.*` in `store.js`, which saves
  automatically 250 ms later (and immediately if the tab is closed).
- Before Import, Clear, or Load sample, a backup snapshot is saved. Settings → Data →
  *Restore backup* brings it back. Deletes show an **Undo** toast.
- **Cloud sync later:** write an adapter with `load()`, `save(state)`, `backup(state)`,
  `loadBackup()` (e.g. using Supabase or Firebase) and export it as `storage` from
  `js/core/storage.js`. Every task/note already has an `id`, `createdAt` and `updatedAt`
  for merging.

## Keyboard shortcuts

`Ctrl/Cmd + K` or `/` search · `N` new task · `1`–`7` switch page · `Ctrl + Enter` save a form ·
`Esc` close · arrow keys move between calendar days.
