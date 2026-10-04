/* Page registry: route name → page module.
   Each page exports render(state) → HTML string, title(), and optionally mount(root, ctx). */
import * as dashboard from './dashboard.js';
import * as tasks from './tasks.js';
import * as notes from './notes.js';
import * as calendar from './calendar.js';
import * as analytics from './analytics.js';
import * as categories from './categories.js';
import * as settings from './settings.js';

export const pages = { dashboard, tasks, notes, calendar, analytics, categories, settings };
