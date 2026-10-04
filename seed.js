/* ==========================================================================
   SAMPLE DATA
   Loaded on the very first visit so the app doesn't open empty.
   A banner on the dashboard lets you clear it with one click.
   ========================================================================== */
import { createEmptyState, createTask, createNote, createReminder } from './models.js';
import { todayKey, addDays, fromKey } from './dates.js';

/* Deterministic pseudo-random so the sample history looks the same each time */
function rng(seed) {
  let x = seed;
  return () => {
    x = (x * 16807) % 2147483647;
    return (x - 1) / 2147483646;
  };
}

function isoAt(key, hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const d = fromKey(key);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

export function buildSampleState() {
  const state = createEmptyState();
  state.meta.sample = true;
  state.profile.name = 'Sok Mean';

  const [study, work, personal, finance, health, shopping, ideas] = state.categories.map((c) => c.id);
  const today = todayKey();
  const d = (n) => addDays(today, n);
  const tasks = [];
  const T = (input) => {
    const task = createTask(input);
    tasks.push(task);
    return task;
  };

  /* ----- Today ----- */
  const speaking = T({
    title: 'Practice English speaking', description: '30 minutes of shadowing, then record a 2-minute summary.',
    priority: 'high', dueDate: today, dueTime: '19:00', categoryId: study, tags: ['English', 'Speaking'],
    subtasks: [
      { title: 'Shadow one podcast episode', done: true },
      { title: 'Record a 2-minute summary', done: false },
      { title: 'Note 5 new phrases', done: false },
    ],
  });
  T({ title: 'Review pending valuation declarations', priority: 'urgent', dueDate: today, dueTime: '10:00', categoryId: work, tags: ['Office'], completed: true, completedAt: isoAt(today, '10:40') });
  T({ title: 'Morning run, 5 km', priority: 'low', dueDate: today, dueTime: '06:30', categoryId: health, completed: true, completedAt: isoAt(today, '07:05') });
  T({ title: 'Learn 15 new vocabulary words', priority: 'medium', dueDate: today, categoryId: study, tags: ['English', 'Vocabulary'], completed: true, completedAt: isoAt(today, '08:15') });
  T({ title: 'Pay electricity bill', priority: 'high', dueDate: today, dueTime: '12:00', categoryId: finance, completed: true, completedAt: isoAt(today, '11:20') });
  T({ title: 'Reply to team messages', priority: 'medium', dueDate: today, categoryId: work, completed: true, completedAt: isoAt(today, '09:10') });
  T({ title: 'Lesson plan: present perfect', description: 'Warm-up, PPP stages, and a short speaking task.', priority: 'medium', dueDate: today, dueTime: '21:00', categoryId: study, tags: ['Teaching'] });

  /* ----- Coming up ----- */
  T({ title: 'Weekly team meeting', priority: 'medium', dueDate: d(1), dueTime: '09:00', categoryId: work });
  T({ title: 'Read chapter 4: input hypothesis', priority: 'medium', dueDate: d(1), dueTime: '20:00', categoryId: study, tags: ['SLA'] });
  T({ title: 'Buy groceries', priority: 'low', dueDate: d(1), dueTime: '18:00', categoryId: shopping, subtasks: [{ title: 'Rice' }, { title: 'Vegetables' }, { title: 'Coffee' }] });
  T({ title: 'Submit monthly report', description: 'Attach the summary table and send before noon.', priority: 'high', dueDate: d(3), dueTime: '11:30', categoryId: work, tags: ['Report'] });
  T({ title: 'Car service appointment', priority: 'medium', dueDate: d(5), dueTime: '08:00', categoryId: personal });
  T({ title: 'Plan weekend trip to Kampot', priority: 'low', dueDate: d(9), categoryId: ideas, tags: ['Travel'] });
  T({ title: 'Back up laptop files', priority: 'medium', dueDate: d(-1), dueTime: '20:00', categoryId: personal });
  T({ title: 'Try a new recipe', priority: 'low', categoryId: ideas });

  /* ----- History (gives Analytics and the streak something to show) ----- */
  const rand = rng(42);
  const pool = [
    ['Vocabulary review', study], ['Listening practice', study], ['Process declarations batch', work],
    ['Inbox zero', work], ['Gym session', health], ['Budget check-in', finance], ['Tidy desk', personal],
    ['Read 20 pages', study], ['Walk 8,000 steps', health], ['Sketch app idea', ideas],
  ];
  for (let back = 1; back <= 62; back++) {
    const key = d(-back);
    const weekday = fromKey(key).getDay();
    // a 6-day streak right before today, lighter weekends, a few gaps further back
    let count = back <= 6 ? 2 + Math.floor(rand() * 4) : Math.floor(rand() * 6);
    if (back === 7) count = 0;
    if ((weekday === 0 || weekday === 6) && back > 6) count = Math.floor(count / 2);
    for (let i = 0; i < count; i++) {
      const [title, cat] = pool[Math.floor(rand() * pool.length)];
      const hour = 7 + Math.floor(rand() * 13);
      T({
        title, categoryId: cat, priority: ['low', 'medium', 'medium', 'high'][Math.floor(rand() * 4)],
        dueDate: key, completed: true, completedAt: isoAt(key, `${String(hour).padStart(2, '0')}:${rand() > 0.5 ? '15' : '45'}`),
        createdAt: isoAt(key, '06:00'),
      });
    }
  }
  state.tasks = tasks;

  /* ----- Reminder for tonight's speaking practice ----- */
  const at = `${today}T18:50`;
  state.reminders.push(createReminder({ title: speaking.title, taskId: speaking.id, offset: 10, at, fired: new Date(at) <= new Date() }));

  /* ----- Notes ----- */
  const hoursAgo = (h) => new Date(Date.now() - h * 3600000).toISOString();
  state.notes = [
    createNote({
      title: 'English Study Plan', color: 'blue', pinned: true, favorite: true, categoryId: study,
      content: 'Daily routine to reach B2 speaking by December.',
      checklist: [
        { text: 'Vocabulary: 15 words with example sentences', done: true },
        { text: 'Speaking: 30 minutes shadowing', done: false },
        { text: 'Listening: one podcast episode', done: true },
        { text: 'Weekly: record and review a monologue', done: false },
      ],
      tags: ['English', 'Study'], createdAt: hoursAgo(240), updatedAt: hoursAgo(2),
    }),
    createNote({
      title: 'Meeting notes: Monday', color: 'purple', categoryId: work,
      content: 'Agreed to move the report deadline to Thursday.\nNew checklist for document attachments starts next week.\nAsk IT about the slow upload page.',
      tags: ['Meeting'], createdAt: hoursAgo(30), updatedAt: hoursAgo(26),
    }),
    createNote({
      title: 'App ideas', color: 'orange', favorite: true, categoryId: ideas,
      content: 'A flashcard mode for vocabulary with spaced repetition.\nVoice notes that turn into tasks.\nWeekly review screen every Sunday evening.',
      tags: ['Ideas', 'Apps'], createdAt: hoursAgo(120), updatedAt: hoursAgo(50),
    }),
    createNote({
      title: 'Shopping list', color: 'green', categoryId: shopping,
      checklist: [{ text: 'Jasmine rice', done: false }, { text: 'Eggs', done: true }, { text: 'Green tea', done: false }, { text: 'Notebook (A5, dotted)', done: false }],
      tags: ['Home'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }),
    createNote({
      title: 'Teaching: error correction', color: 'pink', categoryId: study, pinned: true,
      content: 'Delayed correction for fluency tasks; immediate correction for accuracy drills. Recasts work best with lower levels.',
      tags: ['Teaching', 'SLA'], createdAt: hoursAgo(70), updatedAt: hoursAgo(9),
    }),
    createNote({
      title: 'Quotes worth keeping', color: 'neutral', categoryId: personal,
      content: '"Small daily improvements are the key to staggering long-term results."',
      tags: ['Inspiration'], createdAt: hoursAgo(400), updatedAt: hoursAgo(300),
    }),
    createNote({
      title: 'Old travel checklist', color: 'neutral', archived: true, categoryId: personal,
      checklist: [{ text: 'Passport', done: true }, { text: 'Chargers', done: true }],
      createdAt: hoursAgo(900), updatedAt: hoursAgo(800),
    }),
  ];
  return state;
}
