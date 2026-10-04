/* ==========================================================================
   ANALYTICS PAGE — completions today/week/month, completion rate, streaks,
   weekly bars, 30-day trend, category donut, best weekday, 16-week heatmap.
   Charts: js/ui/charts.js     Styles: css/pages.css → "Analytics"
   ========================================================================== */
import { t } from '../core/i18n.js';
import { todayKey, addDays, fromKey, formatDate, weekdayNames } from '../core/dates.js';
import {
  streak, countCompletedBetween, lastNDays, weekdayTotals, categoryDistribution, completionsByDay,
} from '../core/selectors.js';
import { esc, countUp } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { progressRing } from '../ui/components.js';
import { barList, areaChart, donut, heatmap } from '../ui/charts.js';

function kpi({ ic, label, value, suffix = '', sub = '', tone = 'primary' }) {
  return `<div class="kpi kpi--${tone}">
    <span class="kpi__icon">${icon(ic, { size: 17 })}</span>
    <span class="kpi__label">${esc(label)}</span>
    <span class="kpi__value"><span data-count="${value}">${value}</span>${suffix ? `<small>${esc(suffix)}</small>` : ''}</span>
    ${sub ? `<span class="kpi__sub">${sub}</span>` : ''}
  </div>`;
}

export function render(state) {
  const today = todayKey();
  const weekStart = state.settings.weekStartsOn;
  const todayDate = fromKey(today);
  const offset = (todayDate.getDay() - weekStart + 7) % 7;
  const weekFrom = addDays(today, -offset);
  const monthFrom = `${today.slice(0, 7)}-01`;

  const st = streak(state, today);
  const week = countCompletedBetween(state, weekFrom, today);
  const lastWeek = countCompletedBetween(state, addDays(weekFrom, -7), addDays(today, -7));
  const month = countCompletedBetween(state, monthFrom, today);

  // Completion rate: tasks due in the last 30 days that got done
  const from30 = addDays(today, -29);
  const due30 = state.tasks.filter((x) => x.dueDate && x.dueDate >= from30 && x.dueDate <= today);
  const rate = due30.length ? Math.round((due30.filter((x) => x.completed).length / due30.length) * 100) : 0;
  const allRate = state.tasks.length ? Math.round((state.tasks.filter((x) => x.completed).length / state.tasks.length) * 100) : 0;

  // This week, day by day
  const map = completionsByDay(state);
  const names = weekdayNames(weekStart, 'short');
  const weekRows = names.map((label, i) => {
    const key = addDays(weekFrom, i);
    return { label, value: map.get(key) || 0, current: key === today };
  });

  // 30-day trend
  const days30 = lastNDays(state, 30, today);
  const trendLabels = [days30[0], days30[10], days30[20], days30[29]].map((d) => formatDate(d.key, { month: 'short', day: 'numeric' }));

  // Weekday totals → best day
  const totals = weekdayTotals(state);
  const longNames = weekdayNames(0, 'long');
  const shortNames = weekdayNames(0, 'short');
  const order = Array.from({ length: 7 }, (_, i) => (i + weekStart) % 7);
  const bestIdx = totals.indexOf(Math.max(...totals));
  const dayRows = order.map((i) => ({ label: shortNames[i], value: totals[i] }));

  // Categories
  const dist = categoryDistribution(state).slice(0, 6).map((d) => ({
    label: d.category ? `${d.category.icon} ${d.category.name}` : t('form.noCategory'),
    value: d.value,
    color: `var(--c-${d.category?.color || 'slate'})`,
  }));

  // 16-week heatmap aligned to week columns
  const startCol = addDays(weekFrom, -15 * 7);
  const weeks = Array.from({ length: 16 }, (_, w) => Array.from({ length: 7 }, (__, d) => {
    const key = addDays(startCol, w * 7 + d);
    const value = map.get(key) || 0;
    return { key, value, future: key > today, label: `${formatDate(key, { month: 'short', day: 'numeric' })}: ${t('analytics.doneCount', { n: value })}` };
  }));

  const weekDelta = lastWeek ? Math.round(((week - lastWeek) / lastWeek) * 100) : null;

  return `<div class="analytics">
    <div class="kpi-grid stagger">
      ${kpi({ ic: 'check', label: t('analytics.today'), value: st.doneToday, tone: 'success' })}
      ${kpi({ ic: 'calendar', label: t('analytics.week'), value: week, tone: 'primary',
        sub: weekDelta === null ? '' : `<span class="trend ${weekDelta >= 0 ? 'trend--up' : 'trend--down'}">${icon(weekDelta >= 0 ? 'arrowUp' : 'arrowDown', { size: 12 })}${Math.abs(weekDelta)}%</span> ${esc(t('analytics.vsLastWeek'))}` })}
      ${kpi({ ic: 'chart', label: t('analytics.month'), value: month, tone: 'violet' })}
      ${kpi({ ic: 'flame', label: t('stats.streak'), value: st.current, suffix: t(st.current === 1 ? 'stats.day' : 'stats.days'), sub: esc(t('stats.best', { n: st.best })), tone: 'amber' })}
    </div>

    <div class="an-grid">
      <section class="panel an-week">
        <div class="section-head"><h2 class="section-head__title">${icon('chart', { size: 17 })}${esc(t('analytics.weekly'))}</h2>
          <span class="section-head__meta">${esc(t('analytics.thisWeek'))}</span></div>
        ${barList(weekRows)}
      </section>

      <section class="panel an-rate">
        <div class="section-head"><h2 class="section-head__title">${icon('target', { size: 17 })}${esc(t('analytics.rate'))}</h2></div>
        <div class="rate">
          ${progressRing({ value: rate, size: 148, stroke: 13, label: t('analytics.rate'), cls: 'ring--lg' })}
          <dl class="rate__list">
            <div><dt>${esc(t('analytics.rate30'))}</dt><dd>${rate}%</dd></div>
            <div><dt>${esc(t('analytics.rateAll'))}</dt><dd>${allRate}%</dd></div>
            <div><dt>${esc(t('analytics.bestDay'))}</dt><dd>${esc(totals[bestIdx] ? longNames[bestIdx] : '—')}</dd></div>
            <div><dt>${esc(t('analytics.bestStreak'))}</dt><dd>${esc(t('stats.daysCount', { n: st.best }))}</dd></div>
          </dl>
        </div>
      </section>

      <section class="panel an-trend">
        <div class="section-head"><h2 class="section-head__title">${icon('repeat', { size: 17 })}${esc(t('analytics.daily'))}</h2>
          <span class="section-head__meta">${esc(t('analytics.last30'))}</span></div>
        ${areaChart(days30, { labels: trendLabels })}
      </section>

      <section class="panel an-cats">
        <div class="section-head"><h2 class="section-head__title">${icon('tag', { size: 17 })}${esc(t('analytics.byCategory'))}</h2></div>
        ${dist.length ? donut(dist, { centerValue: String(state.tasks.length), centerLabel: t('analytics.tasks') }) : `<p class="panel__empty">${esc(t('analytics.noData'))}</p>`}
      </section>

      <section class="panel an-days">
        <div class="section-head"><h2 class="section-head__title">${icon('trophy', { size: 17 })}${esc(t('analytics.productiveDays'))}</h2></div>
        ${barList(dayRows)}
        ${totals[bestIdx] ? `<p class="insight">${icon('sparkle', { size: 15 })}<span>${esc(t('analytics.insight', { day: longNames[bestIdx] }))}</span></p>` : ''}
      </section>

      <section class="panel an-heat">
        <div class="section-head"><h2 class="section-head__title">${icon('flame', { size: 17 })}${esc(t('analytics.consistency'))}</h2>
          <span class="section-head__meta">${esc(t('analytics.weeks16'))}</span></div>
        <div class="heat-scroll">${heatmap(weeks, { dayLabels: names })}</div>
        <div class="heat-legend"><span>${esc(t('analytics.less'))}</span>${[0, 1, 2, 3, 4].map((l) => `<span class="heatmap__cell lvl-${l}"></span>`).join('')}<span>${esc(t('analytics.more'))}</span></div>
      </section>
    </div>
  </div>`;
}

export function mount(root, { entering }) {
  if (entering) root.querySelectorAll('[data-count]').forEach((n) => countUp(n, Number(n.dataset.count)));
}

export const title = () => t('nav.analytics');
