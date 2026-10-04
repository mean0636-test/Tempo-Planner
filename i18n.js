/* ==========================================================================
   TRANSLATIONS — every visible word in the app comes from here.
   t('nav.tasks') → "Tasks" (or "ភារកិច្ច" in Khmer)
   t('tasks.summary', { n: 4 }) fills {n}.
   To add a language: copy the `en` block, translate it, and add it to DICTS
   and to the language picker in js/pages/settings.js.
   Missing keys fall back to English automatically.
   ========================================================================== */

const en = {
  'a11y.skip': 'Skip to content', 'a11y.mainNav': 'Main navigation', 'a11y.openMenu': 'Open menu', 'a11y.toggleSidebar': 'Collapse or expand sidebar',

  'nav.dashboard': 'Dashboard', 'nav.home': 'Home', 'nav.tasks': 'Tasks', 'nav.notes': 'Notes', 'nav.calendar': 'Calendar',
  'nav.analytics': 'Analytics', 'nav.categories': 'Categories', 'nav.settings': 'Settings', 'nav.more': 'More',

  'greeting.morning': 'Good morning', 'greeting.afternoon': 'Good afternoon', 'greeting.evening': 'Good evening',

  'date.today': 'Today', 'date.tomorrow': 'Tomorrow', 'date.yesterday': 'Yesterday', 'date.nextWeek': 'Next week',
  'date.noDate': 'No date', 'date.justNow': 'just now',

  'common.cancel': 'Cancel', 'common.close': 'Close', 'common.copy': 'Copy', 'common.delete': 'Delete', 'common.edit': 'Edit',
  'common.moreActions': 'More actions', 'common.save': 'Save changes', 'common.undo': 'Undo', 'common.view': 'View', 'common.viewAll': 'View all',

  'priority.low': 'Low', 'priority.medium': 'Medium', 'priority.high': 'High', 'priority.urgent': 'Urgent',

  'dashboard.tagline': "Let's make today productive.", 'dashboard.todayProgress': "Today's progress", 'dashboard.today': 'Today',
  'dashboard.completedCount': '{n} completed', 'dashboard.remainingCount': '{n} remaining', 'dashboard.vsYesterday': 'vs yesterday',
  'dashboard.overdue': '{n} overdue', 'dashboard.overdueShort': '{n} overdue from before', 'dashboard.dueToday': 'Due today',
  'dashboard.notesTotal': '{n} notes in total', 'dashboard.todayFocus': "Today's focus", 'dashboard.inlineAdd': 'Add a task for today and press Enter',
  'dashboard.priority': 'Priority tasks', 'dashboard.upcoming': 'Next 7 days', 'dashboard.recentNotes': 'Recent notes',

  'motivation.empty': 'Plan your day: add your first task', 'motivation.0': "Let's get started 🚀", 'motivation.21': "You're making progress 💪",
  'motivation.51': 'Great work! Keep going 🔥', 'motivation.81': 'Almost there! 🎯', 'motivation.100': 'Perfect day! You did it! 🎉',

  'stats.completedToday': 'Completed', 'stats.remaining': 'Remaining', 'stats.notesToday': 'Notes today', 'stats.streak': 'Streak',
  'stats.day': 'day', 'stats.days': 'days', 'stats.best': 'Best: {n} days', 'stats.daysCount': '{n} days',

  'sample.title': 'Sample data loaded.', 'sample.text': 'Explore with example tasks and notes, then start fresh when you are ready.',
  'sample.keep': 'Keep examples', 'sample.clear': 'Start fresh',

  'task.new': 'New task', 'task.add': 'Add task', 'task.edit': 'Edit task', 'task.complete': 'Complete', 'task.done': 'Done',
  'task.markComplete': 'Mark complete', 'task.markIncomplete': 'Mark not done', 'task.untitled': 'Untitled task',
  'task.moveTomorrow': 'Move to tomorrow', 'task.duplicate': 'Duplicate', 'task.hasReminder': 'Reminder set', 'task.addOn': 'Add task on {date}',

  'view.today': 'Today', 'view.tomorrow': 'Tomorrow', 'view.upcoming': 'Upcoming', 'view.overdue': 'Overdue', 'view.completed': 'Completed', 'view.all': 'All tasks',
  'tasks.views': 'Task views', 'tasks.summary': '{n} tasks', 'tasks.todaySummary': '{done} of {total} done today',
  'tasks.filterPlaceholder': 'Filter tasks…', 'tasks.earlier': 'Earlier', 'tasks.showMore': 'Show {n} more',
  'tasks.swipeHint': 'Tip: swipe a task right to complete it, left to delete.',
  'filters.allCategories': 'All categories', 'filters.allPriorities': 'All priorities', 'filters.allTags': 'All tags', 'filters.anyStatus': 'Any status',
  'filters.open': 'Open', 'filters.done': 'Done', 'filters.status': 'Status', 'filters.clear': 'Clear filters',
  'sort.label': 'Sort', 'sort.date': 'Due date', 'sort.priority': 'Priority', 'sort.created': 'Newest', 'sort.title': 'Name',

  'note.new': 'New note', 'note.add': 'Save note', 'note.edit': 'Edit note', 'note.newChecklist': 'New checklist', 'note.untitled': 'Untitled note',
  'note.pin': 'Pin', 'note.unpin': 'Unpin', 'note.pinned': 'Pinned', 'note.favorite': 'Favorite', 'note.unfavorite': 'Remove favorite',
  'note.archive': 'Archive', 'note.unarchive': 'Restore from archive', 'note.created': 'Created', 'note.updated': 'Updated', 'note.moreItems': 'more',
  'notes.summary': '{n} notes', 'notes.searchPlaceholder': 'Search notes, tags, checklist items…', 'notes.pinned': 'Pinned', 'notes.others': 'Everything else',
  'notes.tab.all': 'All', 'notes.tab.pinned': 'Pinned', 'notes.tab.favorites': 'Favorites', 'notes.tab.archived': 'Archive',

  'color.neutral': 'Neutral', 'color.blue': 'Blue', 'color.purple': 'Purple', 'color.green': 'Green', 'color.orange': 'Orange', 'color.pink': 'Pink',
  'accent.indigo': 'Indigo', 'accent.violet': 'Violet', 'accent.blue': 'Blue', 'accent.emerald': 'Emerald', 'accent.rose': 'Rose',

  'form.title': 'Title', 'form.taskTitlePlaceholder': 'What needs to be done?', 'form.titleRequired': 'Give it a title so you can find it later.',
  'form.description': 'Description', 'form.descriptionPlaceholder': 'Add details (optional)', 'form.priority': 'Priority',
  'form.dueDate': 'Date', 'form.time': 'Time', 'form.category': 'Category', 'form.noCategory': 'No category', 'form.reminder': 'Reminder',
  'form.reminderNeedsDate': 'Pick a date first: reminders are set relative to the due time.', 'form.tags': 'Tags',
  'form.tagsPlaceholder': 'Type a tag and press Enter', 'form.removeTag': 'Remove tag', 'form.subtasks': 'Subtasks', 'form.addSubtask': 'Add a subtask',
  'form.addItem': 'Add an item', 'form.addChecklistItem': 'Add a checklist item', 'form.toggleItem': 'Toggle item', 'form.itemText': 'Item text', 'form.removeItem': 'Remove item',
  'form.checklist': 'Checklist', 'form.content': 'Content', 'form.noteTitlePlaceholder': 'Note title', 'form.noteContentPlaceholder': 'Start writing…',
  'form.color': 'Colour', 'form.name': 'Name', 'form.nameRequired': 'Enter a name.', 'form.icon': 'Icon',
  'form.saveHint': 'Ctrl + Enter to save', 'form.discardTitle': 'Discard changes?', 'form.discardText': 'Your edits to this item have not been saved.', 'form.discard': 'Discard',

  'reminder.none': 'No reminder', 'reminder.atTime': 'At due time', 'reminder.10min': '10 minutes before', 'reminder.30min': '30 minutes before',
  'reminder.1hour': '1 hour before', 'reminder.1day': '1 day before', 'reminder.title': 'Reminder', 'reminder.missed': 'Missed reminder',
  'reminder.new': 'New reminder', 'reminder.create': 'Set reminder', 'reminder.what': 'Remind me to…', 'reminder.placeholder': 'Call the bank',
  'reminder.inHour': 'In 1 hour', 'reminder.thisEvening': 'This evening', 'reminder.tomorrowMorning': 'Tomorrow 9:00',
  'reminder.linkTask': 'Link to a task (optional)', 'reminder.noTask': 'No linked task', 'reminder.pastError': 'Choose a time in the future.',

  'quick.title': 'Quick add', 'quick.task': 'New task', 'quick.note': 'New note', 'quick.checklist': 'Checklist', 'quick.reminder': 'Reminder',

  'search.title': 'Search', 'search.trigger': 'Search tasks, notes, tags…', 'search.placeholder': 'Search anything…', 'search.results': 'Search results',
  'search.recent': 'Recent searches', 'search.quickActions': 'Quick actions', 'search.tags': 'Tags', 'search.navigate': 'to move', 'search.open': 'to open',
  'search.noResults': 'Nothing matches "{q}"', 'search.noResultsHint': 'Try a shorter word or a tag like #English.',
  'search.openCategory': 'Show tasks in this category', 'search.tagCount': 'Used {count} times',
  'search.kind.task': 'Task', 'search.kind.note': 'Note', 'search.kind.category': 'Category', 'search.kind.tag': 'Tag', 'search.kind.recent': 'Recent', 'search.kind.action': 'Action',

  'calendar.prev': 'Previous month', 'calendar.next': 'Next month', 'calendar.taskCount': '{n} tasks', 'calendar.monthCount': '{n} tasks this month',
  'calendar.addHere': 'Add task', 'calendar.daySummary': '{open} open of {total}', 'calendar.emptyTitle': 'Nothing planned',
  'calendar.emptyText': 'Add a task to this day, or double-click any date.', 'calendar.tip': 'Double-click a date to add a task. Arrow keys move between days.',

  'analytics.today': 'Completed today', 'analytics.week': 'This week', 'analytics.month': 'This month', 'analytics.vsLastWeek': 'vs last week',
  'analytics.weekly': 'Weekly productivity', 'analytics.thisWeek': 'Tasks completed per day', 'analytics.rate': 'Completion rate',
  'analytics.rate30': 'Due in last 30 days', 'analytics.rateAll': 'All time', 'analytics.bestDay': 'Best weekday', 'analytics.bestStreak': 'Longest streak',
  'analytics.daily': 'Daily completions', 'analytics.last30': 'Last 30 days', 'analytics.byCategory': 'Tasks by category', 'analytics.tasks': 'tasks',
  'analytics.noData': 'No tasks yet.', 'analytics.productiveDays': 'Most productive days', 'analytics.insight': 'You finish the most tasks on {day}. Plan important work then.',
  'analytics.consistency': 'Consistency', 'analytics.weeks16': 'Last 16 weeks', 'analytics.less': 'Less', 'analytics.more': 'More', 'analytics.doneCount': '{n} done',

  'categories.summary': '{n} categories', 'categories.sub': 'Group tasks and notes by area of life.', 'categories.open': 'open tasks', 'categories.notes': 'notes',
  'categories.done': '{pct}% done · {done} of {total}',
  'category.new': 'New category', 'category.edit': 'Edit category', 'category.create': 'Create category', 'category.namePlaceholder': 'e.g. Study',
  'category.viewTasks': 'View tasks', 'category.deleteTitle': 'Delete "{name}"?', 'category.deleteText': 'Its tasks and notes stay, they just lose this category.',

  'empty.todayTitle': 'No tasks today 🎉', 'empty.todayText': 'Your schedule is clear. Enjoy your free time!',
  'empty.tomorrowTitle': 'Tomorrow is open', 'empty.tomorrowText': 'Plan ahead by adding a task for tomorrow.',
  'empty.upcomingTitle': 'Nothing coming up', 'empty.upcomingText': 'Tasks with a future date will appear here.',
  'empty.overdueTitle': 'Nothing overdue', 'empty.overdueText': 'You are fully caught up. Nice.',
  'empty.completedTitle': 'No completed tasks yet', 'empty.completedText': 'Finish a task and it will show up here.',
  'empty.allTitle': 'No tasks yet', 'empty.allText': 'Create your first task to get going.',
  'empty.filteredTitle': 'No matches', 'empty.filteredText': 'Try removing a filter or searching for something else.',
  'empty.notesTitle': 'No notes yet.', 'empty.notesText': 'Capture your first idea.', 'empty.notesFiltered': 'No notes match this search.',
  'empty.archiveTitle': 'Archive is empty', 'empty.archiveText': 'Archived notes are kept here, out of your way.',
  'empty.priority': 'No high-priority tasks open.', 'empty.upcoming': 'Nothing due in the next 7 days.',
  'empty.categoriesTitle': 'No categories', 'empty.categoriesText': 'Create one to group your tasks.',

  'notifications.title': 'Notifications', 'notifications.upcoming': 'Upcoming reminders', 'notifications.earlier': 'Earlier',
  'notifications.empty': 'No reminders yet.', 'notifications.settings': 'Notification settings',
  'profile.menu': 'Profile menu', 'profile.you': 'Your profile',
  'theme.light': 'Light', 'theme.dark': 'Dark', 'theme.system': 'System', 'theme.switchLight': 'Switch to light mode', 'theme.switchDark': 'Switch to dark mode',

  'settings.profile': 'Profile', 'settings.profileDesc': 'How Tempo greets you.', 'settings.displayName': 'Display name', 'settings.namePlaceholder': 'Your name',
  'settings.nameHint': 'Shown in the dashboard greeting.', 'settings.appearance': 'Appearance', 'settings.appearanceDesc': 'Theme and accent colour.',
  'settings.theme': 'Theme', 'settings.themeDesc': 'System follows your device setting.', 'settings.accent': 'Accent colour', 'settings.accentDesc': 'Used for buttons, links and charts.',
  'settings.notifications': 'Notifications', 'settings.notificationsDesc': 'Reminders and alerts.', 'settings.inApp': 'Reminder pop-ups',
  'settings.inAppDesc': 'Show a message in the app when a reminder is due.', 'settings.sound': 'Sound', 'settings.soundDesc': 'Play a soft chime with reminders.',
  'settings.overdue': 'Overdue alert', 'settings.overdueDesc': 'Tell me about overdue tasks when I open the app.',
  'settings.system': 'Device notifications', 'settings.systemDesc': 'Also notify through your browser or phone.',
  'settings.systemDenied': 'Blocked in your browser settings.', 'settings.systemUnsupported': 'Not available in this browser.',
  'settings.taskDefaults': 'Tasks', 'settings.taskDefaultsDesc': 'Defaults for new tasks.', 'settings.defaultPriority': 'Default priority',
  'settings.defaultPriorityDesc': 'New tasks start with this priority.', 'settings.weekStart': 'Week starts on', 'settings.monday': 'Monday', 'settings.sunday': 'Sunday',
  'settings.language': 'Language', 'settings.languageDesc': 'Interface language and date format.',
  'settings.data': 'Data & backup', 'settings.dataDesc': 'Everything is saved automatically on this device.',
  'settings.storageOk': 'Saved on this device. Works offline.', 'settings.storageMemory': 'This browser blocks storage. Changes last until you close the tab, so export a backup.',
  'settings.dataSize': '{tasks} tasks · {notes} notes · {kb} KB',
  'settings.export': 'Export data', 'settings.exportDesc': 'Download a JSON backup', 'settings.exportModal': 'Your backup file is downloading. If nothing downloaded, copy the text below and save it as a .json file.',
  'settings.downloadAgain': 'Download', 'settings.import': 'Import data', 'settings.importDesc': 'Restore from a .json file',
  'settings.importPaste': 'Paste backup', 'settings.importPasteDesc': 'Import from copied text', 'settings.importPasteModal': 'Paste the contents of a Tempo backup file.',
  'settings.importConfirm': 'Replace your data?', 'settings.importConfirmText': 'This backup has {tasks} tasks and {notes} notes. Your current data is backed up first so you can undo.',
  'settings.restore': 'Restore backup', 'settings.restoreDesc': 'Snapshot from {when}', 'settings.noBackup': 'No backup yet',
  'settings.restoreConfirm': 'Restore the last backup?', 'settings.restoreConfirmText': 'Your current data will be swapped with the snapshot taken before your last import or clear.',
  'settings.sample': 'Load sample data', 'settings.sampleDesc': 'Example tasks and notes', 'settings.sampleConfirm': 'Load sample data?',
  'settings.sampleConfirmText': 'This replaces your tasks and notes with examples. A backup is made first.', 'settings.sampleLoad': 'Load examples',
  'settings.clear': 'Clear all data', 'settings.clearDesc': 'Delete every task and note', 'settings.clearConfirm': 'Delete all tasks and notes?',
  'settings.clearConfirmText': 'A backup is kept so you can restore it from this page.', 'settings.footer': 'Your data stays on this device.',

  'toast.taskCreated': 'Task created', 'toast.taskSaved': 'Task saved', 'toast.taskCompleted': 'Task completed', 'toast.taskDeleted': 'Task deleted',
  'toast.taskRestored': 'Task restored', 'toast.taskDuplicated': 'Task duplicated', 'toast.movedTomorrow': 'Moved to tomorrow',
  'toast.reminderSet': 'Reminder set', 'toast.reminderCreated': 'Reminder created', 'toast.reminderDeleted': 'Reminder removed',
  'toast.noteSaved': 'Note saved', 'toast.noteDeleted': 'Note deleted', 'toast.noteRestored': 'Note restored', 'toast.noteEmpty': 'Write something first.',
  'toast.notePinned': 'Note pinned', 'toast.noteUnpinned': 'Note unpinned', 'toast.noteArchived': 'Note archived', 'toast.noteUnarchived': 'Note restored',
  'toast.noteFavorited': 'Added to favorites', 'toast.noteUnfavorited': 'Removed from favorites',
  'toast.categoryCreated': 'Category created', 'toast.categorySaved': 'Category saved', 'toast.categoryDeleted': 'Category deleted',
  'toast.copied': 'Copied to clipboard', 'toast.selectToCopy': 'Text selected. Press Ctrl+C to copy.', 'toast.imported': 'Data imported',
  'toast.importFailed': 'Import failed', 'toast.importBadJson': 'This is not valid JSON. Check that you copied the whole file.',
  'toast.restored': 'Backup restored', 'toast.cleared': 'All data cleared', 'toast.sampleCleared': 'Examples removed. Fresh start!',
  'toast.sampleLoaded': 'Sample data loaded', 'toast.accent': 'Accent colour updated', 'toast.saved': 'Saved',
  'toast.systemOn': 'Device notifications on', 'toast.systemBlocked': 'Notifications were blocked. Allow them in your browser settings.',
  'toast.saveFailed': 'Could not save to this device (storage may be full). Export a backup to keep your data.',
  'toast.overdueAlert': 'You have {n} overdue task(s).',

  'error.title': 'This page could not load', 'error.text': 'Your data is safe. Reload to try again.', 'error.reload': 'Reload',
};

const km = {
  'a11y.skip': 'រំលងទៅមាតិកា', 'a11y.mainNav': 'ម៉ឺនុយមេ', 'a11y.openMenu': 'បើកម៉ឺនុយ', 'a11y.toggleSidebar': 'បង្រួម ឬពង្រីករបារចំហៀង',
  'nav.dashboard': 'ផ្ទាំងគ្រប់គ្រង', 'nav.home': 'ទំព័រដើម', 'nav.tasks': 'ភារកិច្ច', 'nav.notes': 'កំណត់ត្រា', 'nav.calendar': 'ប្រតិទិន',
  'nav.analytics': 'ស្ថិតិ', 'nav.categories': 'ប្រភេទ', 'nav.settings': 'ការកំណត់', 'nav.more': 'ច្រើនទៀត',
  'greeting.morning': 'អរុណសួស្តី', 'greeting.afternoon': 'ទិវាសួស្តី', 'greeting.evening': 'សាយណ្ហសួស្តី',
  'date.today': 'ថ្ងៃនេះ', 'date.tomorrow': 'ថ្ងៃស្អែក', 'date.yesterday': 'ម្សិលមិញ', 'date.nextWeek': 'សប្តាហ៍ក្រោយ', 'date.noDate': 'គ្មានកាលបរិច្ឆេទ', 'date.justNow': 'មុននេះបន្តិច',
  'common.cancel': 'បោះបង់', 'common.close': 'បិទ', 'common.copy': 'ចម្លង', 'common.delete': 'លុប', 'common.edit': 'កែប្រែ',
  'common.moreActions': 'សកម្មភាពផ្សេងទៀត', 'common.save': 'រក្សាទុក', 'common.undo': 'មិនធ្វើវិញ', 'common.view': 'មើល', 'common.viewAll': 'មើលទាំងអស់',
  'priority.low': 'ទាប', 'priority.medium': 'មធ្យម', 'priority.high': 'ខ្ពស់', 'priority.urgent': 'បន្ទាន់',
  'dashboard.tagline': 'តោះធ្វើឱ្យថ្ងៃនេះមានផលិតភាព។', 'dashboard.todayProgress': 'វឌ្ឍនភាពថ្ងៃនេះ', 'dashboard.today': 'ថ្ងៃនេះ',
  'dashboard.completedCount': 'បានបញ្ចប់ {n}', 'dashboard.remainingCount': 'នៅសល់ {n}', 'dashboard.vsYesterday': 'ធៀបនឹងម្សិលមិញ',
  'dashboard.overdue': 'ហួសកំណត់ {n}', 'dashboard.overdueShort': 'ហួសកំណត់ {n}', 'dashboard.dueToday': 'ត្រូវធ្វើថ្ងៃនេះ',
  'dashboard.notesTotal': 'កំណត់ត្រាសរុប {n}', 'dashboard.todayFocus': 'ការងារថ្ងៃនេះ', 'dashboard.inlineAdd': 'បន្ថែមភារកិច្ចថ្ងៃនេះ ហើយចុច Enter',
  'dashboard.priority': 'ភារកិច្ចអាទិភាព', 'dashboard.upcoming': '៧ ថ្ងៃខាងមុខ', 'dashboard.recentNotes': 'កំណត់ត្រាថ្មីៗ',
  'motivation.empty': 'រៀបចំថ្ងៃរបស់អ្នក៖ បន្ថែមភារកិច្ចដំបូង', 'motivation.0': 'តោះចាប់ផ្តើម 🚀', 'motivation.21': 'អ្នកកំពុងមានវឌ្ឍនភាព 💪',
  'motivation.51': 'ល្អណាស់! បន្តទៅមុខ 🔥', 'motivation.81': 'ជិតហើយ! 🎯', 'motivation.100': 'ថ្ងៃដ៏ល្អឥតខ្ចោះ! អ្នកធ្វើបានហើយ! 🎉',
  'stats.completedToday': 'បានបញ្ចប់', 'stats.remaining': 'នៅសល់', 'stats.notesToday': 'កំណត់ត្រាថ្ងៃនេះ', 'stats.streak': 'ជាប់ៗគ្នា',
  'stats.day': 'ថ្ងៃ', 'stats.days': 'ថ្ងៃ', 'stats.best': 'ល្អបំផុត៖ {n} ថ្ងៃ', 'stats.daysCount': '{n} ថ្ងៃ',
  'sample.title': 'ទិន្នន័យគំរូ។', 'sample.text': 'សាកល្បងជាមួយភារកិច្ច និងកំណត់ត្រាគំរូ រួចចាប់ផ្តើមថ្មីនៅពេលអ្នករួចរាល់។', 'sample.keep': 'រក្សាគំរូ', 'sample.clear': 'ចាប់ផ្តើមថ្មី',
  'task.new': 'ភារកិច្ចថ្មី', 'task.add': 'បន្ថែមភារកិច្ច', 'task.edit': 'កែភារកិច្ច', 'task.complete': 'បញ្ចប់', 'task.done': 'រួចរាល់',
  'task.markComplete': 'សម្គាល់ថាបានបញ្ចប់', 'task.markIncomplete': 'សម្គាល់ថាមិនទាន់រួច', 'task.untitled': 'ភារកិច្ចគ្មានចំណងជើង',
  'task.moveTomorrow': 'ផ្លាស់ទៅថ្ងៃស្អែក', 'task.duplicate': 'ចម្លង', 'task.hasReminder': 'មានការរំលឹក', 'task.addOn': 'បន្ថែមភារកិច្ចនៅ {date}',
  'view.today': 'ថ្ងៃនេះ', 'view.tomorrow': 'ថ្ងៃស្អែក', 'view.upcoming': 'ខាងមុខ', 'view.overdue': 'ហួសកំណត់', 'view.completed': 'បានបញ្ចប់', 'view.all': 'ទាំងអស់',
  'tasks.views': 'ទិដ្ឋភាពភារកិច្ច', 'tasks.summary': 'ភារកិច្ច {n}', 'tasks.todaySummary': 'រួច {done} ក្នុងចំណោម {total} ថ្ងៃនេះ',
  'tasks.filterPlaceholder': 'ស្វែងរកភារកិច្ច…', 'tasks.earlier': 'មុននេះ', 'tasks.showMore': 'បង្ហាញ {n} ទៀត', 'tasks.swipeHint': 'អូសភារកិច្ចទៅស្តាំដើម្បីបញ្ចប់ ទៅឆ្វេងដើម្បីលុប។',
  'filters.allCategories': 'គ្រប់ប្រភេទ', 'filters.allPriorities': 'គ្រប់អាទិភាព', 'filters.allTags': 'គ្រប់ស្លាក', 'filters.anyStatus': 'គ្រប់ស្ថានភាព',
  'filters.open': 'មិនទាន់រួច', 'filters.done': 'រួចរាល់', 'filters.status': 'ស្ថានភាព', 'filters.clear': 'សម្អាតតម្រង',
  'sort.label': 'តម្រៀប', 'sort.date': 'កាលបរិច្ឆេទ', 'sort.priority': 'អាទិភាព', 'sort.created': 'ថ្មីបំផុត', 'sort.title': 'ឈ្មោះ',
  'note.new': 'កំណត់ត្រាថ្មី', 'note.add': 'រក្សាទុកកំណត់ត្រា', 'note.edit': 'កែកំណត់ត្រា', 'note.newChecklist': 'បញ្ជីត្រួតពិនិត្យថ្មី', 'note.untitled': 'គ្មានចំណងជើង',
  'note.pin': 'ខ្ទាស់', 'note.unpin': 'ដកខ្ទាស់', 'note.pinned': 'បានខ្ទាស់', 'note.favorite': 'ចូលចិត្ត', 'note.unfavorite': 'ដកចេញពីចូលចិត្ត',
  'note.archive': 'ទុកក្នុងបណ្ណសារ', 'note.unarchive': 'យកចេញពីបណ្ណសារ', 'note.created': 'បង្កើត', 'note.updated': 'កែចុងក្រោយ', 'note.moreItems': 'ទៀត',
  'notes.summary': 'កំណត់ត្រា {n}', 'notes.searchPlaceholder': 'ស្វែងរកកំណត់ត្រា ស្លាក…', 'notes.pinned': 'បានខ្ទាស់', 'notes.others': 'ផ្សេងទៀត',
  'notes.tab.all': 'ទាំងអស់', 'notes.tab.pinned': 'បានខ្ទាស់', 'notes.tab.favorites': 'ចូលចិត្ត', 'notes.tab.archived': 'បណ្ណសារ',
  'form.title': 'ចំណងជើង', 'form.taskTitlePlaceholder': 'តើត្រូវធ្វើអ្វី?', 'form.titleRequired': 'សូមដាក់ចំណងជើង។', 'form.description': 'ការពិពណ៌នា',
  'form.descriptionPlaceholder': 'បន្ថែមព័ត៌មានលម្អិត', 'form.priority': 'អាទិភាព', 'form.dueDate': 'កាលបរិច្ឆេទ', 'form.time': 'ម៉ោង', 'form.category': 'ប្រភេទ',
  'form.noCategory': 'គ្មានប្រភេទ', 'form.reminder': 'ការរំលឹក', 'form.tags': 'ស្លាក', 'form.tagsPlaceholder': 'វាយស្លាក ហើយចុច Enter', 'form.subtasks': 'ភារកិច្ចរង',
  'form.addSubtask': 'បន្ថែមភារកិច្ចរង', 'form.checklist': 'បញ្ជីត្រួតពិនិត្យ', 'form.addChecklistItem': 'បន្ថែមធាតុ', 'form.noteTitlePlaceholder': 'ចំណងជើងកំណត់ត្រា',
  'form.noteContentPlaceholder': 'ចាប់ផ្តើមសរសេរ…', 'form.color': 'ពណ៌', 'form.name': 'ឈ្មោះ', 'form.icon': 'រូបតំណាង', 'form.saveHint': 'Ctrl + Enter ដើម្បីរក្សាទុក',
  'form.discardTitle': 'បោះបង់ការកែប្រែ?', 'form.discardText': 'ការកែប្រែរបស់អ្នកមិនទាន់បានរក្សាទុកទេ។', 'form.discard': 'បោះបង់',
  'reminder.none': 'គ្មានការរំលឹក', 'reminder.atTime': 'ទាន់ម៉ោង', 'reminder.10min': '១០ នាទីមុន', 'reminder.30min': '៣០ នាទីមុន', 'reminder.1hour': '១ ម៉ោងមុន',
  'reminder.1day': '១ ថ្ងៃមុន', 'reminder.title': 'ការរំលឹក', 'reminder.new': 'ការរំលឹកថ្មី', 'reminder.create': 'កំណត់ការរំលឹក', 'reminder.what': 'រំលឹកខ្ញុំឱ្យ…',
  'quick.title': 'បន្ថែមរហ័ស', 'quick.task': 'ភារកិច្ចថ្មី', 'quick.note': 'កំណត់ត្រាថ្មី', 'quick.checklist': 'បញ្ជីត្រួតពិនិត្យ', 'quick.reminder': 'ការរំលឹក',
  'search.title': 'ស្វែងរក', 'search.trigger': 'ស្វែងរកភារកិច្ច កំណត់ត្រា…', 'search.placeholder': 'ស្វែងរកអ្វីក៏បាន…', 'search.recent': 'ការស្វែងរកថ្មីៗ', 'search.quickActions': 'សកម្មភាពរហ័ស',
  'calendar.addHere': 'បន្ថែមភារកិច្ច', 'calendar.emptyTitle': 'មិនមានគម្រោង', 'calendar.monthCount': 'ភារកិច្ច {n} ក្នុងខែនេះ',
  'analytics.today': 'បញ្ចប់ថ្ងៃនេះ', 'analytics.week': 'សប្តាហ៍នេះ', 'analytics.month': 'ខែនេះ', 'analytics.weekly': 'ផលិតភាពប្រចាំសប្តាហ៍', 'analytics.rate': 'អត្រាបញ្ចប់',
  'analytics.daily': 'ការបញ្ចប់ប្រចាំថ្ងៃ', 'analytics.byCategory': 'ភារកិច្ចតាមប្រភេទ', 'analytics.productiveDays': 'ថ្ងៃដែលមានផលិតភាពបំផុត', 'analytics.consistency': 'ភាពទៀងទាត់',
  'categories.summary': 'ប្រភេទ {n}', 'category.new': 'ប្រភេទថ្មី', 'category.edit': 'កែប្រភេទ', 'category.create': 'បង្កើតប្រភេទ',
  'empty.todayTitle': 'គ្មានភារកិច្ចថ្ងៃនេះ 🎉', 'empty.todayText': 'កាលវិភាគរបស់អ្នកទំនេរ។ រីករាយនឹងពេលទំនេរ!', 'empty.notesTitle': 'មិនទាន់មានកំណត់ត្រា។', 'empty.notesText': 'កត់ត្រាគំនិតដំបូងរបស់អ្នក។',
  'notifications.title': 'ការជូនដំណឹង', 'notifications.upcoming': 'ការរំលឹកខាងមុខ', 'notifications.empty': 'មិនទាន់មានការរំលឹក។',
  'theme.light': 'ភ្លឺ', 'theme.dark': 'ងងឹត', 'theme.system': 'តាមប្រព័ន្ធ',
  'settings.profile': 'ប្រវត្តិរូប', 'settings.displayName': 'ឈ្មោះបង្ហាញ', 'settings.appearance': 'រូបរាង', 'settings.theme': 'ស្បែក', 'settings.accent': 'ពណ៌សំខាន់',
  'settings.notifications': 'ការជូនដំណឹង', 'settings.taskDefaults': 'ភារកិច្ច', 'settings.defaultPriority': 'អាទិភាពលំនាំដើម', 'settings.language': 'ភាសា',
  'settings.data': 'ទិន្នន័យ និងការបម្រុងទុក', 'settings.export': 'នាំចេញទិន្នន័យ', 'settings.import': 'នាំចូលទិន្នន័យ', 'settings.clear': 'លុបទិន្នន័យទាំងអស់',
  'settings.storageOk': 'បានរក្សាទុកលើឧបករណ៍នេះ។ ដំណើរការក្រៅបណ្តាញ។',
  'toast.taskCreated': 'បានបង្កើតភារកិច្ច', 'toast.taskSaved': 'បានរក្សាទុកភារកិច្ច', 'toast.taskCompleted': 'បានបញ្ចប់ភារកិច្ច', 'toast.taskDeleted': 'បានលុបភារកិច្ច',
  'toast.taskRestored': 'បានស្តារភារកិច្ច', 'toast.noteSaved': 'បានរក្សាទុកកំណត់ត្រា', 'toast.noteDeleted': 'បានលុបកំណត់ត្រា', 'toast.reminderCreated': 'បានបង្កើតការរំលឹក',
};

const DICTS = { en, km };
let lang = 'en';

export function setLanguage(next) {
  lang = DICTS[next] ? next : 'en';
  document.documentElement.lang = lang;
}
export const getLanguage = () => lang;
export const getLocale = () => (lang === 'km' ? 'km-KH' : 'en-US');

export function t(key, vars = {}) {
  const template = DICTS[lang][key] ?? en[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
}
