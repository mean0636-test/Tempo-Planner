/* ==========================================================================
   CHARTS — lightweight SVG/HTML charts, no library needed.
   They "draw in" when a page opens (css/animations.css → .page-enter rules).
   ========================================================================== */
import { esc } from './dom.js';

/* Horizontal bars, like:  Mon ███████ 7 */
export function barList(rows, { highlightMax = true } = {}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return `<div class="barlist">${rows.map((r, i) => {
    const isMax = highlightMax && r.value === max && r.value > 0;
    return `<div class="barlist__row ${isMax ? 'is-max' : ''} ${r.current ? 'is-current' : ''}" style="--i:${i}">
      <span class="barlist__label">${esc(r.label)}</span>
      <span class="barlist__track"><span class="barlist__bar" style="width:${(r.value / max) * 100}%; ${r.color ? `--bar:${r.color}` : ''}"></span></span>
      <span class="barlist__value">${r.value}</span>
    </div>`;
  }).join('')}</div>`;
}

/* Vertical columns with labels underneath */
export function columnChart(rows, { height = 180 } = {}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  const ticks = niceTicks(max);
  const top = ticks[ticks.length - 1];
  return `<div class="colchart" style="--h:${height}px">
    <div class="colchart__grid">${ticks.slice().reverse().map((tk) => `<div class="colchart__tick"><span>${tk}</span></div>`).join('')}</div>
    <div class="colchart__cols">${rows.map((r, i) => `
      <div class="colchart__col ${r.current ? 'is-current' : ''}" style="--i:${i}">
        <div class="colchart__bar-wrap"><div class="colchart__bar" style="height:${(r.value / top) * 100}%" title="${esc(r.title || `${r.label}: ${r.value}`)}">
          <span class="colchart__val">${r.value || ''}</span></div></div>
        <span class="colchart__label">${esc(r.label)}</span>
      </div>`).join('')}</div>
  </div>`;
}

function niceTicks(max) {
  const step = max <= 4 ? 1 : max <= 10 ? 2 : max <= 25 ? 5 : Math.ceil(max / 5 / 5) * 5;
  const ticks = [];
  for (let v = 0; v <= max + step - 1; v += step) {
    ticks.push(v);
    if (v >= max) break;
  }
  return ticks;
}

/* Area chart for a daily series. Endpoint is drawn as an HTML dot so the
   SVG can stretch to any width without distorting it. */
export function areaChart(points, { height = 160, labels = [] } = {}) {
  const w = 600;
  const h = 100;
  const max = Math.max(1, ...points.map((p) => p.value));
  const step = points.length > 1 ? w / (points.length - 1) : w;
  const xy = points.map((p, i) => [i * step, h - (p.value / max) * (h - 8) - 4]);
  const line = xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${w},${h} L0,${h} Z`;
  const last = xy[xy.length - 1] || [0, h];
  const lastVal = points[points.length - 1]?.value ?? 0;
  return `<div class="area-chart" style="--h:${height}px">
    <div class="area-chart__plot">
      <div class="area-chart__grid"><span></span><span></span><span></span><span></span></div>
      <span class="area-chart__max">${max}</span>
      <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
        <defs><linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="var(--primary)" stop-opacity=".32"/><stop offset="100%" stop-color="var(--primary)" stop-opacity="0"/>
        </linearGradient></defs>
        <path class="area-chart__area" d="${area}" fill="url(#areaFill)"/>
        <path class="area-chart__line" d="${line}" fill="none" stroke="var(--primary)" stroke-width="2.5" vector-effect="non-scaling-stroke" pathLength="1"/>
      </svg>
      <span class="area-chart__dot" style="left:${(last[0] / w) * 100}%; top:${(last[1] / h) * 100}%"><span>${lastVal}</span></span>
    </div>
    <div class="area-chart__labels">${labels.map((l) => `<span>${esc(l)}</span>`).join('')}</div>
  </div>`;
}

/* Donut with a legend */
export function donut(segments, { size = 168, stroke = 22, centerLabel = '', centerValue = '' } = {}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const gap = segments.length > 1 ? 3 : 0;
  const arcs = segments.map((seg, i) => {
    const len = (seg.value / total) * c;
    const dash = Math.max(0, len - gap);
    const arc = `<circle class="donut__seg" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${seg.color}" stroke-width="${stroke}"
      stroke-dasharray="${dash.toFixed(2)} ${(c - dash).toFixed(2)}" stroke-dashoffset="${(-offset).toFixed(2)}" style="--i:${i}"
      transform="rotate(-90 ${size / 2} ${size / 2})"><title>${esc(seg.label)}: ${seg.value}</title></circle>`;
    offset += len;
    return arc;
  }).join('');
  return `<div class="donut-wrap">
    <div class="donut" style="--size:${size}px">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${esc(centerLabel)}">
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--surface-2)" stroke-width="${stroke}"/>${arcs}
      </svg>
      <div class="donut__center"><strong>${esc(centerValue)}</strong><span>${esc(centerLabel)}</span></div>
    </div>
    <ul class="legend">${segments.map((seg) => `<li><span class="legend__swatch" style="background:${seg.color}"></span>
      <span class="legend__label">${esc(seg.label)}</span><span class="legend__value">${seg.value}<small>${Math.round((seg.value / total) * 100)}%</small></span></li>`).join('')}</ul>
  </div>`;
}

/* GitHub-style heatmap. `weeks` = array of 7-day arrays [{key, value, label}] */
export function heatmap(weeks, { dayLabels = [] } = {}) {
  const max = Math.max(1, ...weeks.flat().map((d) => d?.value || 0));
  const level = (v) => (!v ? 0 : Math.min(4, Math.ceil((v / max) * 4)));
  return `<div class="heatmap">
    <div class="heatmap__days">${dayLabels.map((l, i) => `<span>${i % 2 === 0 ? esc(l) : ''}</span>`).join('')}</div>
    <div class="heatmap__grid">${weeks.map((week) => `<div class="heatmap__col">${week.map((d) => (d
      ? `<span class="heatmap__cell lvl-${level(d.value)} ${d.future ? 'is-future' : ''}" title="${esc(d.label)}"></span>`
      : '<span class="heatmap__cell is-empty"></span>')).join('')}</div>`).join('')}</div>
  </div>`;
}
