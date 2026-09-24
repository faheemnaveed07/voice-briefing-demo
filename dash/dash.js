/* Dashboard engine for the out-of-scope ribbon tabs.
 *
 * The shell (index.html) renders <div data-dash-mount="<menu>-<tab>"> whenever a
 * spec is registered for that key. This file watches for those mounts and fills
 * them: KPI strip, AI insight, and a 12-column grid of cards (ECharts or HTML).
 *
 *   DASH.register('1-1', () => ({ kpis, insight, grid: [[card, card], [card]] }))
 */
(function () {
  const registry = new Map();
  window.__DASH = registry;

  // ── palette (matches the shell) ──
  const C = {
    bg: '#061220', card: '#0E1D38', border: '#142B55', deep: '#1E3A5F', grid: '#12264a',
    text: '#F1F5F9', body: '#CBD5E1', muted: '#94A3B8', dim: '#64748B',
    blue: '#3B82F6', cyan: '#06B6D4', violet: '#8B5CF6', green: '#10B981',
    amber: '#F59E0B', orange: '#F97316', red: '#EF4444', sky: '#60A5FA', pink: '#EC4899', teal: '#14B8A6',
  };
  const SERIES = [C.blue, C.cyan, C.violet, C.green, C.amber, C.orange, C.pink, C.teal, C.sky, C.red];
  const TONE = { blue: C.blue, cyan: C.cyan, violet: C.violet, green: C.green, amber: C.amber, orange: C.orange, red: C.red, slate: C.dim, pink: C.pink, teal: C.teal };
  const tone = t => TONE[t] || t || C.blue;
  const MONO = "'JetBrains Mono',monospace";

  // ── formatting ──
  const fmt = {
    n: (v, d = 0) => Number(v).toLocaleString('en-GB', { minimumFractionDigits: d, maximumFractionDigits: d }),
    // compact BWP: 54487102 -> "BWP 54.5M"
    bwp: v => {
      const a = Math.abs(v), s = v < 0 ? '−' : '';
      if (a >= 1e9) return `${s}BWP ${(a / 1e9).toFixed(2)}bn`;
      if (a >= 1e6) return `${s}BWP ${(a / 1e6).toFixed(1)}M`;
      if (a >= 1e3) return `${s}BWP ${(a / 1e3).toFixed(0)}K`;
      return `${s}BWP ${a.toFixed(0)}`;
    },
    m: v => (v / 1e6).toFixed(1),
    pct: (v, d = 0) => `${Number(v).toFixed(d)}%`,
  };

  // ── seeded random, so derived data is identical on every load ──
  function rng(seed) {
    let h = 1779033703 ^ String(seed).length;
    for (const ch of String(seed)) { h = Math.imul(h ^ ch.charCodeAt(0), 3432918353); h = (h << 13) | (h >>> 19); }
    let a = h >>> 0;
    const r = () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    r.int = (lo, hi) => Math.floor(lo + r() * (hi - lo + 1));
    r.num = (lo, hi) => lo + r() * (hi - lo);
    r.pick = arr => arr[Math.floor(r() * arr.length)];
    r.walk = (n, start, vol, drift = 0) => { let v = start; return Array.from({ length: n }, () => (v = Math.max(0, v * (1 + drift + (r() - 0.5) * vol)))); };
    return r;
  }

  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ── HTML pieces ──
  const label = (t, extra = '') => `<span style="font-family:${MONO};font-size:10px;letter-spacing:.1em;color:${C.muted};text-transform:uppercase;${extra}">${esc(t)}</span>`;

  function pill(text, t = 'slate') {
    const c = tone(t);
    return `<span style="display:inline-block;font-family:${MONO};font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;padding:2px 7px;border-radius:4px;color:${c};background:${c}1f;border:1px solid ${c}55;white-space:nowrap">${esc(text)}</span>`;
  }

  function kpiTile(k) {
    const c = tone(k.tone);
    const dc = k.deltaTone ? tone(k.deltaTone) : (/^[▲+]/.test(k.delta || '') ? C.green : /^[▼−-]/.test(k.delta || '') ? C.red : C.muted);
    const bar = k.pct != null ? `<div style="height:4px;border-radius:2px;background:${C.border};margin-top:10px;overflow:hidden"><div style="height:100%;width:${Math.min(100, k.pct)}%;background:${c}"></div></div>` : '';
    return `<div class="dx-kpi" style="padding:14px 16px;border-radius:10px;background:${C.card};border:1px solid ${C.border};position:relative;overflow:hidden;min-width:0">
      <div style="position:absolute;left:0;top:0;bottom:0;width:3px;background:${c}"></div>
      <div style="font-family:${MONO};font-size:9.5px;letter-spacing:.1em;color:${C.dim};text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(k.label)}</div>
      <div style="font-size:21px;font-weight:700;color:${C.text};font-variant-numeric:tabular-nums;letter-spacing:-.03em;margin-top:6px;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(k.value)}</div>
      <div style="display:flex;align-items:center;gap:8px;margin-top:6px;white-space:nowrap;overflow:hidden"><span style="font-family:${MONO};font-size:10.5px;color:${dc}">${esc(k.delta || '')}</span><span style="font-size:10.5px;color:${C.dim};overflow:hidden;text-overflow:ellipsis">${esc(k.sub || '')}</span></div>
      ${bar}</div>`;
  }

  function insightStrip(ins) {
    if (!ins) return '';
    const o = typeof ins === 'string' ? { finding: ins } : ins;
    const sev = tone(o.tone || 'amber');
    const actions = (o.actions || ['Explain finding', 'Drill down', 'Create task']).map((a, i) =>
      `<button class="dx-act" style="height:28px;padding:0 12px;border-radius:6px;font-size:11.5px;cursor:pointer;${i === 0 ? `background:${C.blue};border:1px solid ${C.blue};color:#fff;font-weight:600` : `background:transparent;border:1px solid ${C.border};color:${C.body}`}">${esc(a)}</button>`).join('');
    return `<div style="display:flex;gap:14px;align-items:center;padding:12px 16px;border-radius:10px;background:linear-gradient(100deg,#0d2144,#0E1D38 60%);border:1px solid #1a396b;position:relative;overflow:hidden">
      <div style="position:absolute;left:0;top:0;bottom:0;width:3px;background:${sev}"></div>
      <div style="flex:none;width:34px;height:34px;border-radius:9px;display:grid;place-items:center;background:#12284b;border:1px solid #1a396b">
        <svg viewBox="0 0 24 24" style="width:17px;height:17px;fill:none;stroke:${C.sky};stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 17l.8 2.2L22 20l-2.2.8L19 23l-.8-2.2L16 20l2.2-.8z"/></svg></div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:3px">${pill('AI finding', 'blue')}${o.severity ? pill(o.severity, o.tone || 'amber') : ''}</div>
        <div style="font-size:12.5px;color:${C.body};line-height:1.5">${o.finding}${o.recommendation ? ` <span style="color:${C.muted}">Recommendation:</span> <span style="color:${C.text}">${o.recommendation}</span>` : ''}</div>
      </div>
      <div style="flex:none;display:flex;gap:6px">${actions}</div></div>`;
  }

  function cardShell(card, inner) {
    const legend = card.legend ? `<span style="margin-left:auto;display:flex;gap:10px;font-size:10.5px;color:${C.dim};flex-wrap:wrap;justify-content:flex-end">${card.legend.map(([n, c]) => `<span style="display:flex;align-items:center;gap:5px"><i style="width:9px;height:9px;border-radius:2px;background:${tone(c)};display:inline-block"></i>${esc(n)}</span>`).join('')}</span>` : '';
    const badge = card.badge ? `<span style="margin-left:${card.legend ? '10px' : 'auto'}">${pill(card.badge[0], card.badge[1])}</span>` : '';
    return `<div style="grid-column:span ${card.span || 6};min-width:0;padding:14px;border-radius:10px;background:${C.card};border:1px solid ${C.border};display:flex;flex-direction:column;gap:10px">
      <div style="display:flex;align-items:center;gap:8px;min-height:18px">${label(card.title)}${legend}${badge}</div>
      ${card.note ? `<div style="font-size:11px;color:${C.dim};margin-top:-6px">${esc(card.note)}</div>` : ''}
      ${inner}</div>`;
  }

  // ── HTML card types ──
  function cell(v, col) {
    if (v == null) return '';
    if (typeof v === 'object') {
      if (v.pill) return pill(v.pill, v.tone);
      if (v.trend) {
        const up = v.trend === 'up', c = tone(v.tone || (up ? 'green' : 'red'));
        return `<span style="color:${c};font-family:${MONO}">${up ? '▲' : v.trend === 'down' ? '▼' : '▬'} ${esc(v.text || '')}</span>`;
      }
      if (v.bar != null) {
        const c = tone(v.tone || 'blue');
        return `<div style="display:flex;align-items:center;gap:8px"><div style="flex:1;height:6px;border-radius:3px;background:${C.border};overflow:hidden;min-width:50px"><div style="height:100%;width:${Math.min(100, v.bar)}%;background:${c}"></div></div><span style="font-family:${MONO};font-size:10.5px;color:${C.muted};min-width:34px;text-align:right">${esc(v.text ?? fmt.pct(v.bar))}</span></div>`;
      }
      if (v.dot) return `<span style="display:inline-flex;align-items:center;gap:6px"><i style="width:8px;height:8px;border-radius:50%;background:${tone(v.dot)};display:inline-block"></i>${esc(v.text || '')}</span>`;
      if (v.strong) return `<span style="color:${C.text};font-weight:600">${esc(v.strong)}</span>`;
    }
    return esc(v);
  }

  function tableCard(card) {
    const cols = card.columns;
    const head = cols.map(c => `<th style="position:sticky;top:0;background:#0c1a33;text-align:${c.align || 'left'};padding:8px 10px;font-family:${MONO};font-size:9.5px;letter-spacing:.08em;color:${C.dim};text-transform:uppercase;font-weight:500;border-bottom:1px solid ${C.border};white-space:nowrap">${esc(c.label)}</th>`).join('');
    const body = card.rows.map((r, i) => `<tr class="dx-row" data-name="${esc(r[cols[0].key])}" style="cursor:pointer;background:${i % 2 ? 'rgba(20,43,85,.25)' : 'transparent'}">${cols.map(c => {
      const v = r[c.key];
      const num = c.align === 'right';
      return `<td style="padding:8px 10px;border-bottom:1px solid #10213f;text-align:${c.align || 'left'};color:${C.body};font-size:12px;${num ? `font-family:${MONO};font-size:11px;font-variant-numeric:tabular-nums;` : ''}${c.nowrap !== false ? 'white-space:nowrap;' : ''}${c.width ? `width:${c.width};` : ''}">${cell(c.fmt && typeof v === 'number' ? c.fmt(v) : v, c)}</td>`;
    }).join('')}</tr>`).join('');
    return cardShell(card, `<div style="overflow:auto;max-height:${card.height || 320}px;margin:0 -4px"><table style="width:100%;border-collapse:collapse">${`<thead><tr>${head}</tr></thead>`}<tbody>${body}</tbody></table></div>`);
  }

  function listCard(card) {
    const items = card.items.map(it => `<div class="dx-row" data-name="${esc(it.title)}" style="display:flex;gap:10px;align-items:flex-start;padding:9px 10px;border-radius:8px;background:#0b1830;border:1px solid #11244a;cursor:pointer">
      <i style="flex:none;width:8px;height:8px;border-radius:50%;background:${tone(it.tone)};margin-top:5px;box-shadow:0 0 0 3px ${tone(it.tone)}22"></i>
      <div style="flex:1;min-width:0"><div style="font-size:12.5px;color:${C.text};line-height:1.35">${esc(it.title)}</div>${it.meta ? `<div style="font-size:11px;color:${C.dim};margin-top:3px">${esc(it.meta)}</div>` : ''}</div>
      ${it.value ? `<div style="flex:none;font-family:${MONO};font-size:11px;color:${C.muted};text-align:right">${esc(it.value)}</div>` : ''}${it.pill ? `<div style="flex:none">${pill(it.pill, it.tone)}</div>` : ''}</div>`).join('');
    return cardShell(card, `<div style="display:flex;flex-direction:column;gap:6px;overflow:auto;max-height:${card.height || 320}px">${items}</div>`);
  }

  function kanbanCard(card) {
    const cols = card.columns.map(col => `<div style="flex:1;min-width:170px;display:flex;flex-direction:column;gap:6px;padding:8px;border-radius:8px;background:#0a1730;border:1px solid #11244a">
      <div style="display:flex;align-items:center;gap:6px;padding:2px 2px 6px"><i style="width:8px;height:8px;border-radius:2px;background:${tone(col.tone)}"></i><span style="font-size:11.5px;font-weight:600;color:${C.text}">${esc(col.name)}</span><span style="margin-left:auto;font-family:${MONO};font-size:10px;color:${C.dim}">${col.items.length}</span></div>
      ${col.items.map(it => `<div class="dx-row" data-name="${esc(it.title)}" style="padding:9px 10px;border-radius:7px;background:${C.card};border:1px solid ${C.border};cursor:pointer">
        <div style="font-size:12px;color:${C.text};line-height:1.35">${esc(it.title)}</div>
        <div style="display:flex;align-items:center;gap:6px;margin-top:7px;font-size:10.5px;color:${C.dim}">${it.pill ? pill(it.pill, it.tone) : ''}<span style="margin-left:auto">${esc(it.meta || '')}</span></div></div>`).join('')}</div>`).join('');
    return cardShell(card, `<div style="display:flex;gap:10px;overflow:auto;max-height:${card.height || 380}px">${cols}</div>`);
  }

  function stepsCard(card) {
    const steps = card.steps.map((s, i) => {
      const c = s.state === 'done' ? C.green : s.state === 'current' ? C.blue : s.state === 'late' ? C.red : C.border;
      return `<div style="flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:6px;position:relative">
        ${i ? `<div style="position:absolute;top:13px;right:50%;width:100%;height:2px;background:${s.state === 'done' || s.state === 'current' ? C.green : C.border}"></div>` : ''}
        <div style="position:relative;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:${s.state === 'done' ? C.green : '#0b1830'};border:2px solid ${c};color:${s.state === 'done' ? '#061220' : C.text};font-size:11px;font-weight:700">${s.state === 'done' ? '✓' : i + 1}</div>
        <div style="font-size:11.5px;color:${C.text};text-align:center;line-height:1.3">${esc(s.name)}</div>
        <div style="font-family:${MONO};font-size:10px;color:${s.state === 'late' ? C.red : C.dim};text-align:center">${esc(s.meta || '')}</div></div>`;
    }).join('');
    return cardShell(card, `<div style="display:flex;gap:4px;padding:6px 0">${steps}</div>`);
  }

  function ganttCard(card) {
    const { start, end, tasks } = card;
    const span = end - start;
    const ticks = card.ticks || [];
    const rows = tasks.map(t => {
      const l = ((t.start - start) / span) * 100, w = Math.max(1.5, ((t.end - t.start) / span) * 100);
      const c = tone(t.tone || 'blue');
      return `<div class="dx-row" data-name="${esc(t.name)}" style="display:grid;grid-template-columns:${card.labelWidth || 200}px 1fr;gap:10px;align-items:center;cursor:pointer">
        <span style="font-size:11.5px;color:${C.body};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(t.name)}</span>
        <div style="position:relative;height:18px;background:#0b1830;border-radius:4px">
          <div style="position:absolute;top:0;bottom:0;left:${l}%;width:${w}%;border-radius:4px;background:${c}33;border:1px solid ${c}88;overflow:hidden"><div style="height:100%;width:${t.progress ?? 0}%;background:${c}"></div></div>
          ${t.label ? `<span style="position:absolute;left:calc(${l + w}% + 6px);top:1px;font-family:${MONO};font-size:10px;color:${C.muted};white-space:nowrap">${esc(t.label)}</span>` : ''}
        </div></div>`;
    }).join('');
    const today = card.today != null ? `<div style="position:absolute;top:0;bottom:0;left:calc(${card.labelWidth || 200}px + 10px + (100% - ${card.labelWidth || 200}px - 10px) * ${(card.today - start) / span});width:2px;background:${C.red};opacity:.8"><span style="position:absolute;top:-16px;left:-14px;font-family:${MONO};font-size:9px;color:${C.red}">TODAY</span></div>` : '';
    const axis = `<div style="display:grid;grid-template-columns:${card.labelWidth || 200}px 1fr;gap:10px"><span></span><div style="display:flex;justify-content:space-between;font-family:${MONO};font-size:9.5px;color:${C.dim}">${ticks.map(t => `<span>${esc(t)}</span>`).join('')}</div></div>`;
    return cardShell(card, `<div style="position:relative;display:flex;flex-direction:column;gap:7px;padding-top:14px;overflow:auto;max-height:${card.height || 360}px">${today}${rows}</div>${axis}`);
  }

  function statsCard(card) {
    const items = card.items.map(s => `<div style="padding:10px 12px;border-radius:8px;background:#0b1830;border:1px solid #11244a;min-width:0">
      <div style="font-family:${MONO};font-size:9px;letter-spacing:.1em;color:${C.dim};text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(s.label)}</div>
      <div style="font-size:17px;font-weight:700;color:${tone(s.tone || C.text)};margin-top:4px;font-variant-numeric:tabular-nums">${esc(s.value)}</div>
      ${s.sub ? `<div style="font-size:10.5px;color:${C.dim};margin-top:2px">${esc(s.sub)}</div>` : ''}</div>`).join('');
    return cardShell(card, `<div style="display:grid;grid-template-columns:repeat(${card.cols || 2},1fr);gap:8px">${items}</div>`);
  }

  function docCard(card) {
    return cardShell(card, `<div style="flex:1;overflow:auto;max-height:${card.height || 420}px;padding:14px;background:#0B1730;border-radius:8px"><div style="background:#fff;color:#111;font-family:'Times New Roman',serif;font-size:12.5px;line-height:1.55;padding:26px 30px;border-radius:2px;box-shadow:0 8px 24px #0006">${card.html}</div></div>`);
  }

  const HTML_TYPES = { table: tableCard, list: listCard, kanban: kanbanCard, steps: stepsCard, gantt: ganttCard, stats: statsCard, doc: docCard, html: card => cardShell(card, card.html) };

  // ── ECharts builders ──
  const axisStyle = {
    axisLine: { lineStyle: { color: C.border } }, axisTick: { show: false },
    axisLabel: { color: C.dim, fontSize: 10.5 }, splitLine: { lineStyle: { color: C.grid } },
  };
  const tooltip = { trigger: 'axis', backgroundColor: '#0b1830', borderColor: C.border, textStyle: { color: C.body, fontSize: 12 }, axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(59,130,246,.08)' } } };
  const legend = { top: 0, right: 0, icon: 'roundRect', itemWidth: 10, itemHeight: 8, textStyle: { color: C.muted, fontSize: 10.5 } };
  const grid = (extra = {}) => ({ left: 8, right: 12, top: 30, bottom: 4, containLabel: true, ...extra });

  function seriesList(card, type) {
    return card.series.map((s, i) => {
      const color = s.color ? tone(s.color) : SERIES[i % SERIES.length];
      const st = s.type || type;
      const base = { name: s.name, type: st === 'area' ? 'line' : st, data: s.data, stack: s.stack, yAxisIndex: s.axis || 0, itemStyle: { color, borderRadius: st === 'bar' ? (card.horizontal ? [0, 3, 3, 0] : [3, 3, 0, 0]) : 0 }, emphasis: { focus: 'series' } };
      if (st === 'bar') Object.assign(base, { barMaxWidth: card.barWidth || 22, label: s.label ? { show: true, position: card.horizontal ? 'right' : 'top', color: C.muted, fontSize: 10, formatter: s.labelFmt } : undefined });
      if (st === 'line' || st === 'area') Object.assign(base, { smooth: s.smooth !== false, symbol: s.symbol || 'circle', symbolSize: 5, lineStyle: { width: 2, type: s.dashed ? 'dashed' : 'solid', color }, areaStyle: st === 'area' || s.area ? { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: color + '66' }, { offset: 1, color: color + '05' }]) } : undefined });
      if (s.markLine) base.markLine = { symbol: 'none', silent: true, lineStyle: { color: tone(s.markLine.tone || 'red'), type: 'dashed' }, label: { color: C.muted, fontSize: 10, formatter: s.markLine.label }, data: [{ yAxis: s.markLine.value }] };
      return base;
    });
  }

  function cartesian(card, type) {
    const cat = { type: 'category', data: card.categories, ...axisStyle, axisLabel: { ...axisStyle.axisLabel, interval: 0, rotate: card.rotate || 0, formatter: v => (String(v).length > (card.labelMax || 14) ? String(v).slice(0, card.labelMax || 14) + '…' : v) }, splitLine: { show: false } };
    const val = { type: 'value', name: card.unit, nameTextStyle: { color: C.dim, fontSize: 10 }, ...axisStyle, max: card.max };
    const yAxes = card.y2 ? [val, { type: 'value', name: card.y2, nameTextStyle: { color: C.dim, fontSize: 10 }, ...axisStyle, splitLine: { show: false } }] : val;
    return {
      tooltip, legend: card.series.length > 1 ? legend : undefined, grid: grid({ left: card.rotate && !card.horizontal ? 44 : 8, ...card.gridOpt }),
      xAxis: card.horizontal ? val : cat, yAxis: card.horizontal ? { ...cat, inverse: true } : yAxes,
      series: seriesList(card, type),
    };
  }

  const BUILDERS = {
    bar: c => cartesian(c, 'bar'),
    line: c => cartesian(c, 'line'),
    area: c => cartesian(c, 'area'),
    donut: c => ({
      tooltip: { ...tooltip, trigger: 'item', formatter: p => `${p.name}<br><b>${c.valueFmt ? c.valueFmt(p.value) : fmt.n(p.value)}</b> (${p.percent}%)` },
      legend: { ...legend, orient: 'vertical', top: 'middle', right: 0, formatter: n => (n.length > 22 ? n.slice(0, 22) + '…' : n) },
      series: [{
        type: 'pie', radius: c.pie ? ['0%', '72%'] : ['52%', '76%'], center: [c.legendOff ? '50%' : '34%', '52%'], avoidLabelOverlap: true,
        itemStyle: { borderColor: C.card, borderWidth: 2 }, label: c.center ? { show: true, position: 'center', formatter: () => c.center, color: C.text, fontSize: 16, fontWeight: 700 } : { show: false },
        data: c.items.map((it, i) => ({ ...it, itemStyle: { color: (it.color ? tone(it.color) : SERIES[i % SERIES.length]) } })),
      }],
    }),
    waterfall: c => {
      let run = 0; const base = [], up = [], down = [], total = [];
      c.steps.forEach(s => {
        if (s.total) { base.push(0); total.push(s.value); up.push('-'); down.push('-'); run = s.value; return; }
        total.push('-');
        if (s.value >= 0) { base.push(run); up.push(s.value); down.push('-'); run += s.value; } else { run += s.value; base.push(run); down.push(-s.value); up.push('-'); }
      });
      const inc = tone(c.upTone || 'red'), dec = tone(c.downTone || 'green');
      return {
        tooltip: { ...tooltip, formatter: ps => { const p = ps.find(x => x.value !== '-' && x.seriesIndex > 0); return p ? `${p.name}<br><b>${p.seriesName === 'Decrease' ? '−' : ''}${fmt.n(p.value, 1)}</b>` : ''; } },
        grid: grid({ top: 16 }), xAxis: { type: 'category', data: c.steps.map(s => s.name), ...axisStyle, axisLabel: { ...axisStyle.axisLabel, interval: 0, rotate: c.rotate || 0 }, splitLine: { show: false } },
        yAxis: { type: 'value', name: c.unit, nameTextStyle: { color: C.dim, fontSize: 10 }, ...axisStyle, min: c.min },
        series: [
          { type: 'bar', stack: 'w', data: base, itemStyle: { color: 'transparent' }, silent: true },
          { name: 'Increase', type: 'bar', stack: 'w', data: up, barMaxWidth: 34, itemStyle: { color: inc, borderRadius: 2 }, label: { show: true, position: 'top', color: C.muted, fontSize: 10, formatter: p => (p.value === '-' ? '' : '+' + fmt.n(p.value, 1)) } },
          { name: 'Decrease', type: 'bar', stack: 'w', data: down, barMaxWidth: 34, itemStyle: { color: dec, borderRadius: 2 }, label: { show: true, position: 'bottom', color: C.muted, fontSize: 10, formatter: p => (p.value === '-' ? '' : '−' + fmt.n(p.value, 1)) } },
          { name: 'Total', type: 'bar', stack: 'w', data: total, barMaxWidth: 34, itemStyle: { color: C.blue, borderRadius: 2 }, label: { show: true, position: 'top', color: C.text, fontSize: 10.5, fontWeight: 600, formatter: p => (p.value === '-' ? '' : fmt.n(p.value, 1)) } },
        ],
      };
    },
    heatmap: c => ({
      tooltip: { ...tooltip, trigger: 'item', formatter: p => `${c.y[p.value[1]]} · ${c.x[p.value[0]]}<br><b>${c.valueFmt ? c.valueFmt(p.value[2]) : p.value[2]}</b>` },
      grid: grid({ top: 6, bottom: 40 }),
      xAxis: { type: 'category', data: c.x, ...axisStyle, axisLabel: { ...axisStyle.axisLabel, interval: 0, rotate: c.rotate || 0 }, splitArea: { show: false } },
      yAxis: { type: 'category', data: c.y, ...axisStyle, splitArea: { show: false } },
      visualMap: { min: c.min ?? 0, max: c.max ?? 100, calculable: false, orient: 'horizontal', left: 'center', bottom: 0, itemHeight: 120, itemWidth: 10, textStyle: { color: C.dim, fontSize: 10 }, inRange: { color: c.colors || ['#0f2a4d', '#1D4ED8', '#F59E0B', '#EF4444'] } },
      series: [{ type: 'heatmap', data: c.values, label: { show: c.labels !== false, color: '#E2E8F0', fontSize: 10, formatter: p => (c.cellFmt ? c.cellFmt(p.value[2]) : p.value[2]) }, itemStyle: { borderColor: C.card, borderWidth: 2, borderRadius: 3 } }],
    }),
    treemap: c => ({
      tooltip: { ...tooltip, trigger: 'item', formatter: p => `${p.name}<br><b>${c.valueFmt ? c.valueFmt(p.value) : fmt.n(p.value)}</b>` },
      series: [{
        type: 'treemap', roam: false, nodeClick: false, breadcrumb: { show: false }, width: '100%', height: '100%', top: 0, left: 0,
        itemStyle: { borderColor: C.card, borderWidth: 2, gapWidth: 2 }, label: { color: '#fff', fontSize: 11, formatter: p => `${p.name}\n${c.valueFmt ? c.valueFmt(p.value) : fmt.n(p.value)}` },
        data: c.items.map((it, i) => ({ ...it, itemStyle: { color: (it.color ? tone(it.color) : SERIES[i % SERIES.length]) } })),
      }],
    }),
    funnel: c => ({
      tooltip: { ...tooltip, trigger: 'item', formatter: p => `${p.name}<br><b>${fmt.n(p.value)}</b>` },
      series: [{
        type: 'funnel', left: '4%', right: '30%', top: 6, bottom: 6, sort: 'none', gap: 3, minSize: '18%',
        label: { position: 'right', color: C.body, fontSize: 11, formatter: p => `${p.name}  ${fmt.n(p.value)}` }, labelLine: { lineStyle: { color: C.border } },
        itemStyle: { borderWidth: 0 }, data: c.items.map((it, i) => ({ ...it, itemStyle: { color: (it.color ? tone(it.color) : SERIES[i % SERIES.length]) } })),
      }],
    }),
    gauge: c => {
      const gs = c.gauges || [c];
      const w = 100 / gs.length;
      return {
        series: gs.map((g, i) => {
          const col = tone(g.tone || (g.value >= (g.good ?? 80) ? 'green' : g.value >= (g.warn ?? 60) ? 'amber' : 'red'));
          return {
            type: 'gauge', center: [`${w * i + w / 2}%`, '58%'], radius: gs.length > 1 ? `${Math.round(92 / gs.length)}%` : '88%', startAngle: 210, endAngle: -30, min: 0, max: g.max || 100,
            progress: { show: true, width: 10, itemStyle: { color: col } }, axisLine: { lineStyle: { width: 10, color: [[1, C.border]] } },
            pointer: { show: false }, axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false },
            title: { offsetCenter: [0, '62%'], color: C.muted, fontSize: 11 }, detail: { offsetCenter: [0, '4%'], color: C.text, fontSize: 20, fontWeight: 700, formatter: g.fmt || (v => v + '%') },
            data: [{ value: g.value, name: g.name }],
          };
        }),
      };
    },
    radar: c => ({
      tooltip: { ...tooltip, trigger: 'item' }, legend: { ...legend, bottom: 0, top: 'auto', right: 'center' },
      radar: { indicator: c.indicators, radius: '64%', center: ['50%', '48%'], axisName: { color: C.muted, fontSize: 10.5 }, splitLine: { lineStyle: { color: C.grid } }, splitArea: { areaStyle: { color: ['transparent'] } }, axisLine: { lineStyle: { color: C.grid } } },
      series: [{ type: 'radar', data: c.series.map((s, i) => { const col = s.color ? tone(s.color) : SERIES[i]; return { name: s.name, value: s.values, lineStyle: { color: col, width: 2 }, itemStyle: { color: col }, areaStyle: { color: col + '33' } }; }) }],
    }),
    scatter: c => ({
      tooltip: { ...tooltip, trigger: 'item', formatter: p => `<b>${p.data.name}</b><br>${c.xName}: ${p.data.value[0]}<br>${c.yName}: ${p.data.value[1]}` },
      grid: grid({ top: 24, bottom: 24 }),
      xAxis: { type: 'value', name: c.xName, nameLocation: 'middle', nameGap: 24, nameTextStyle: { color: C.dim, fontSize: 10.5 }, ...axisStyle, min: c.xMin, max: c.xMax },
      yAxis: { type: 'value', name: c.yName, nameTextStyle: { color: C.dim, fontSize: 10.5 }, ...axisStyle, min: c.yMin, max: c.yMax },
      series: [{
        type: 'scatter', symbolSize: d => d[2] || 12,
        data: c.points.map(p => ({ name: p.name, value: [p.x, p.y, p.size || 12], itemStyle: { color: tone(p.tone || 'blue') + 'cc', borderColor: tone(p.tone || 'blue') } })),
        markLine: c.diagonal ? { symbol: 'none', silent: true, lineStyle: { color: C.dim, type: 'dashed' }, data: [[{ coord: [c.xMin || 0, c.yMin || 0] }, { coord: [c.xMax || 100, c.yMax || 100] }]] } : undefined,
        label: { show: c.labels, position: 'right', color: C.muted, fontSize: 10, formatter: p => p.data.name },
      }],
    }),
    sankey: c => ({
      tooltip: { ...tooltip, trigger: 'item' },
      series: [{
        type: 'sankey', left: 4, right: 120, top: 6, bottom: 6, nodeWidth: 12, nodeGap: 10, emphasis: { focus: 'adjacency' },
        label: { color: C.body, fontSize: 11 }, lineStyle: { color: 'gradient', opacity: 0.35, curveness: 0.5 },
        data: c.nodes.map((n, i) => ({ name: n, itemStyle: { color: SERIES[i % SERIES.length] } })), links: c.links,
      }],
    }),
    map: c => mapOption(c),
  };

  // ── Botswana outline (approximate, lon/lat) for GIS pins ──
  const BW = [[20.0, -22.0], [20.0, -24.8], [20.6, -25.4], [20.7, -26.9], [21.7, -26.8], [22.6, -26.0], [23.4, -25.3], [24.3, -25.7], [25.0, -25.75], [25.6, -25.5], [25.9, -24.75], [26.5, -24.6], [26.9, -23.7], [27.6, -23.2], [28.2, -22.6], [29.0, -22.25], [29.37, -22.19], [28.9, -21.8], [28.0, -21.5], [27.7, -20.5], [27.2, -20.1], [26.2, -19.6], [25.8, -18.8], [25.26, -17.79], [24.2, -17.5], [23.4, -18.0], [21.0, -18.3], [21.0, -22.0], [20.0, -22.0]];
  function mapOption(c) {
    return {
      tooltip: { ...tooltip, trigger: 'item', formatter: p => (p.seriesType === 'effectScatter' || p.seriesType === 'scatter' ? `<b>${p.data.name}</b><br>${p.data.meta || ''}` : '') },
      grid: { left: 0, right: 0, top: 0, bottom: 0 },
      xAxis: { type: 'value', min: 19.5, max: 29.8, show: false }, yAxis: { type: 'value', min: -27.2, max: -17.2, show: false },
      series: [
        { type: 'custom', data: [0], silent: true, renderItem: (params, api) => ({ type: 'polygon', shape: { points: BW.map(p => api.coord(p)) }, style: { fill: 'rgba(30,58,95,.35)', stroke: '#2b5a9a', lineWidth: 1.5 } }) },
        ...(c.regions || []).map(r => ({ type: 'custom', data: [0], silent: true, renderItem: (params, api) => ({ type: 'circle', shape: { cx: api.coord([r.lon, r.lat])[0], cy: api.coord([r.lon, r.lat])[1], r: r.r || 30 }, style: { fill: tone(r.tone || 'red') + '22', stroke: tone(r.tone || 'red') + '55' } }) })),
        { type: 'effectScatter', rippleEffect: { scale: 3, brushType: 'stroke' }, symbolSize: d => d[2] || 10,
          data: c.pins.map(p => ({ name: p.name, meta: p.meta, value: [p.lon, p.lat, p.size || 10], itemStyle: { color: tone(p.tone || 'cyan') } })),
          label: { show: c.labels !== false, position: 'right', color: C.body, fontSize: 10.5, formatter: p => p.data.name.split(' | ')[0] } },
      ],
    };
  }

  // ── drill-down drawer (L4 transactions for whatever was clicked) ──
  function openDrill(mount, spec, name) {
    closeDrill(mount);
    const rows = spec.drill ? spec.drill(name) : DASH.defaultDrill(name, mount.getAttribute('data-dash-mount'));
    const el = document.createElement('div');
    el.className = 'dx-drill';
    el.innerHTML = `<div class="dx-drill-bg" style="position:fixed;inset:0;background:rgba(3,8,15,.55);z-index:40"></div>
      <aside style="position:fixed;top:0;right:0;bottom:0;width:min(560px,92vw);z-index:50;background:${C.card};border-left:1px solid ${C.border};display:flex;flex-direction:column;box-shadow:-20px 0 60px #020611;animation:dxIn .18s ease-out">
        <div style="padding:16px 20px;border-bottom:1px solid ${C.border};display:flex;align-items:flex-start;gap:10px">
          <div style="flex:1;min-width:0"><div>${pill('L4 · Transaction investigation', 'cyan')}</div><div style="font-size:16px;font-weight:600;color:${C.text};margin-top:8px">${esc(name)}</div><div style="font-size:11.5px;color:${C.dim};margin-top:2px">${esc(rows.subtitle || 'Source transactions behind this figure')}</div></div>
          <button class="dx-close" style="width:30px;height:30px;border-radius:6px;border:1px solid ${C.border};background:transparent;color:${C.body};cursor:pointer;font-size:16px">×</button></div>
        <div style="flex:1;overflow:auto;padding:14px 20px">
          <table style="width:100%;border-collapse:collapse">${`<thead><tr>${rows.columns.map(c => `<th style="text-align:${c.align || 'left'};padding:7px 8px;font-family:${MONO};font-size:9.5px;letter-spacing:.08em;color:${C.dim};text-transform:uppercase;font-weight:500;border-bottom:1px solid ${C.border}">${esc(c.label)}</th>`).join('')}</tr></thead>`}
          <tbody>${rows.rows.map(r => `<tr>${rows.columns.map(c => `<td style="padding:8px;border-bottom:1px solid #10213f;font-size:11.5px;color:${C.body};text-align:${c.align || 'left'};${c.align === 'right' ? `font-family:${MONO};` : ''}white-space:nowrap">${cell(r[c.key])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
        <div style="padding:12px 20px;border-top:1px solid ${C.border};display:flex;gap:6px"><button style="height:30px;padding:0 12px;border-radius:6px;border:1px solid ${C.border};background:transparent;color:${C.body};font-size:12px">Open source document</button><button style="height:30px;padding:0 12px;border-radius:6px;border:1px solid ${C.border};background:transparent;color:${C.body};font-size:12px">Export Excel</button><div style="flex:1"></div><button style="height:30px;padding:0 12px;border-radius:6px;border:1px solid #7f5816;background:#201f1e;color:#FCD34D;font-size:12px;font-weight:600">Flag for review</button></div>
      </aside>`;
    el.querySelector('.dx-close').onclick = el.querySelector('.dx-drill-bg').onclick = () => closeDrill(mount);
    mount.appendChild(el);
  }
  function closeDrill(mount) { mount.querySelectorAll('.dx-drill').forEach(n => n.remove()); }

  // ── render ──
  const live = new Set();
  function dispose(mount) {
    (mount.__charts || []).forEach(ch => ch.dispose());
    mount.__charts = [];
    if (mount.__ro) mount.__ro.disconnect();
  }

  function render(mount, key) {
    dispose(mount);
    mount.__dashKey = key;
    const make = registry.get(key);
    if (!make) { mount.innerHTML = ''; return; }
    let spec;
    try { spec = make(); } catch (err) { console.error('[dash]', key, err); mount.innerHTML = `<div style="color:${C.red};font-family:${MONO};font-size:12px">Dashboard ${esc(key)} failed: ${esc(err.message)}</div>`; return; }

    const parts = [];
    if (spec.crumbs) parts.push(`<div style="display:flex;align-items:center;gap:6px;font-size:12px;margin-top:-6px;flex-wrap:wrap">${spec.crumbs.map((c, i) => `${i ? `<span style="color:#334155">›</span>` : ''}<span style="color:${i === spec.crumbs.length - 1 ? '#93C5FD' : C.dim};${i === spec.crumbs.length - 1 ? 'font-weight:600' : ''}">${esc(c)}</span>`).join('')}<span style="margin-left:12px;font-family:${MONO};font-size:9px;letter-spacing:.08em;text-transform:uppercase;padding:3px 8px;border-radius:4px;background:#082232;color:#67E8F9;border:1px solid #074b5f">Drill-down enabled | click any figure</span></div>`);
    if (spec.kpis) parts.push(`<div style="display:grid;grid-template-columns:repeat(${spec.kpis.length},minmax(0,1fr));gap:10px">${spec.kpis.map(kpiTile).join('')}</div>`);
    if (spec.insight) parts.push(insightStrip(spec.insight));
    const chartSlots = [];
    (spec.grid || []).forEach(row => {
      parts.push(`<div style="display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:12px">${row.map(card => {
        if (HTML_TYPES[card.type]) return HTML_TYPES[card.type](card);
        const id = chartSlots.push(card) - 1;
        return cardShell(card, `<div class="dx-chart" data-slot="${id}" style="height:${card.height || 240}px;min-width:0"></div>`);
      }).join('')}</div>`);
    });
    mount.innerHTML = parts.join('');

    if (!window.echarts) {
      mount.querySelectorAll('.dx-chart').forEach(n => { n.innerHTML = `<div style="height:100%;display:grid;place-items:center;color:${C.dim};font-size:12px">Chart library could not load</div>`; });
    } else {
      mount.querySelectorAll('.dx-chart').forEach(n => {
        const card = chartSlots[+n.dataset.slot];
        const ch = echarts.init(n, null, { renderer: 'canvas' });
        try { ch.setOption({ backgroundColor: 'transparent', textStyle: { fontFamily: 'Inter,system-ui,sans-serif' }, animationDuration: 600, ...BUILDERS[card.type](card) }); }
        catch (err) { console.error('[dash]', key, card.title, err); }
        ch.on('click', p => { if (p.name) openDrill(mount, spec, p.name); });
        mount.__charts.push(ch);
      });
      mount.__ro = new ResizeObserver(() => mount.__charts.forEach(ch => ch.resize()));
      mount.__ro.observe(mount);
    }
    mount.querySelectorAll('.dx-row').forEach(r => r.addEventListener('click', () => openDrill(mount, spec, r.dataset.name)));
    mount.querySelectorAll('.dx-kpi').forEach((r, i) => r.addEventListener('click', () => openDrill(mount, spec, spec.kpis[i].label)));
    live.add(mount);
  }

  function scan() {
    for (const m of live) if (!m.isConnected) { dispose(m); live.delete(m); }
    document.querySelectorAll('[data-dash-mount]').forEach(el => {
      const k = el.getAttribute('data-dash-mount');
      if (el.__dashKey !== k) render(el, k);
    });
  }
  let queued = false;
  new MutationObserver(() => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; scan(); }); } })
    .observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-dash-mount'] });

  const style = document.createElement('style');
  style.textContent = '@keyframes dxIn{from{transform:translateX(24px);opacity:0}to{transform:none;opacity:1}} .dx-row:hover{filter:brightness(1.25)} .dx-kpi{cursor:pointer} .dx-kpi:hover{border-color:#3B82F6!important} .dx-act:hover{filter:brightness(1.15)}';
  document.head.appendChild(style);

  window.DASH = {
    C, SERIES, fmt, rng, pill,
    register(key, make) { registry.set(key, make); },
    // Generic L4 drill rows; data.js replaces this with one that uses the shared entities.
    defaultDrill(name) {
      return { columns: [{ key: 'ref', label: 'Ref' }, { key: 'desc', label: 'Description' }, { key: 'amt', label: 'Amount', align: 'right' }], rows: [{ ref: '—', desc: name, amt: '—' }] };
    },
  };
})();
