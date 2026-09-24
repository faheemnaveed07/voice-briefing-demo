/* Menu 2: Budget Spending Analytics (tab 0 "Overview" is hand-built in index.html). */
(function () {
  const { register, fmt, rng } = DASH;
  const { MONTHS, MONTH_NOW, MINISTRIES, CATEGORIES, DEPTS, APPROVED, COMMITTED, ACTUAL, M } = DASH.data;
  const K = n => `1-${n}`;
  const crumbs = ['All Ministries', 'Ministry of Health'];
  const m1 = v => +(v / M).toFixed(2);
  const top = (arr, key, n) => [...arr].sort((a, b) => b[key] - a[key]).slice(0, n);
  const cats10 = top(CATEGORIES, 'approved', 10);
  const expectedPct = (MONTH_NOW / 12) * 100;
  const cum = arr => arr.reduce((acc, v, i) => (acc.push((acc[i - 1] || 0) + (v ?? 0)), acc), []);

  // Monthly totals across all categories
  const planM = MONTHS.map((_, i) => CATEGORIES.reduce((s, c) => s + c.plan[i], 0));
  const actM = MONTHS.map((_, i) => (i < MONTH_NOW ? CATEGORIES.reduce((s, c) => s + c.monthly[i], 0) : null));
  const scale = ACTUAL / actM.slice(0, MONTH_NOW).reduce((a, b) => a + b, 0);
  const actMs = actM.map(v => (v == null ? null : v * scale));

  // ── 1 Budget vs Actual ──
  register(K(1), () => ({
    crumbs,
    kpis: [
      { label: 'Approved budget', value: fmt.bwp(APPROVED), delta: 'FY 2026-27', sub: '27 categories', tone: 'blue', pct: 100 },
      { label: 'Actual spent', value: fmt.bwp(ACTUAL), delta: '54%', sub: 'of approved', tone: 'violet', pct: 54 },
      { label: 'Expected by phasing', value: fmt.bwp(APPROVED * expectedPct / 100), delta: '50%', sub: 'month 6 of 12', tone: 'cyan', pct: 50 },
      { label: 'Ahead of phasing', value: fmt.bwp(ACTUAL - APPROVED / 2), delta: '▲ 4 pts', sub: 'spend above plan', tone: 'amber', pct: 8 },
      { label: 'Categories over 70%', value: '3 of 27', delta: '▲ 1 vs Aug', deltaTone: 'red', sub: 'red flag threshold', tone: 'red', pct: 11 },
    ],
    insight: { finding: 'Capital Projects has used <b>75%</b> of its allocation at the half-year point, against an expected 50%. Salaries and Wages is tracking below plan at 57%.', recommendation: 'Freeze new capital commitments until the Q3 review and re-phase BWP 1.4M into Q4.', severity: 'High', tone: 'orange' },
    grid: [
      [
        { span: 8, type: 'bar', title: 'Budget vs actual by category | top 10 (BWP M)', height: 300, categories: cats10.map(c => c.name), rotate: 30, labelMax: 16,
          series: [{ name: 'Approved', data: cats10.map(c => m1(c.approved)), color: '#1E3A5F' }, { name: 'Actual', data: cats10.map(c => m1(c.actual)), color: 'blue' }, { name: 'Utilisation %', type: 'line', axis: 1, data: cats10.map(c => +c.util.toFixed(0)), color: 'amber', markLine: { value: 50, label: 'Phasing 50%', tone: 'cyan' } }], y2: '%' },
        { span: 4, type: 'gauge', title: 'Utilisation vs phasing', height: 300, gauges: [{ name: 'Actual', value: 54, good: 101, warn: 45 }, { name: 'Committed', value: 70, good: 101, warn: 60 }] },
      ],
      [
        { span: 12, type: 'table', title: 'Budget vs actual | all 27 categories', height: 300,
          columns: [{ key: 'no', label: '#' }, { key: 'name', label: 'Category' }, { key: 'approved', label: 'Approved', align: 'right', fmt: v => fmt.n(v) }, { key: 'actual', label: 'Actual', align: 'right', fmt: v => fmt.n(v) }, { key: 'var', label: 'Variance vs phasing', align: 'right' }, { key: 'util', label: 'Utilisation' }, { key: 'flag', label: 'Status' }],
          rows: CATEGORIES.map(c => { const v = c.actual - c.approved / 2; return { no: c.no, name: c.name, approved: Math.round(c.approved), actual: Math.round(c.actual), var: { trend: v > 0 ? 'up' : 'down', text: fmt.n(Math.abs(v)), tone: v > 0 ? 'red' : 'green' }, util: { bar: c.util, tone: c.util > 70 ? 'red' : c.util < 35 ? 'amber' : 'blue' }, flag: c.util > 70 ? { pill: 'Overspend risk', tone: 'red' } : c.util < 35 ? { pill: 'Underspend', tone: 'amber' } : { pill: 'On track', tone: 'green' } }; }) },
      ],
    ],
  }));

  // ── 2 Spend by Ministry & Department ──
  register(K(2), () => ({
    crumbs: ['All Ministries'],
    kpis: [
      { label: 'Ministries', value: '8', sub: 'reporting this month', tone: 'blue' },
      { label: 'National approved', value: `BWP ${fmt.n(MINISTRIES.reduce((s, m) => s + m.approved, 0))}M`, sub: 'development + recurrent', tone: 'blue', pct: 100 },
      { label: 'National actual', value: `BWP ${fmt.n(MINISTRIES.reduce((s, m) => s + m.actual, 0))}M`, delta: '73%', sub: 'of approved', tone: 'violet', pct: 73 },
      { label: 'Highest utilisation', value: 'Transport 87%', delta: '▲ over plan', deltaTone: 'red', sub: 'A1 road works', tone: 'red', pct: 87 },
      { label: 'Lowest utilisation', value: 'ICT 57%', delta: '▼ under plan', deltaTone: 'amber', sub: 'data centre slippage', tone: 'amber', pct: 57 },
    ],
    insight: { finding: 'Transport is at <b>87%</b> utilisation with half the year left; ICT and Agriculture are the two ministries most likely to return funds.', recommendation: 'Consider a mid-year virement of BWP 20M from Agriculture to Transport.', severity: 'Medium', tone: 'amber' },
    grid: [
      [
        { span: 7, type: 'bar', title: 'Approved vs committed vs actual by ministry (BWP M)', height: 290, categories: MINISTRIES.map(m => m.name),
          series: [{ name: 'Approved', data: MINISTRIES.map(m => m.approved), color: '#1E3A5F' }, { name: 'Committed', data: MINISTRIES.map(m => m.committed), color: 'cyan' }, { name: 'Actual', data: MINISTRIES.map(m => m.actual), color: 'blue' }] },
        { span: 5, type: 'treemap', title: 'Share of national spend', height: 290, valueFmt: v => `BWP ${v}M`, items: MINISTRIES.map(m => ({ name: m.name, value: m.actual })) },
      ],
      [
        { span: 6, type: 'bar', title: 'Ministry of Health | spend by department (BWP M)', height: 260, horizontal: true, categories: DEPTS.map(d => d.label), labelMax: 26,
          series: [{ name: 'Actual', data: DEPTS.map(d => m1(d.actual)), stack: 's', color: 'blue' }, { name: 'Committed, unpaid', data: DEPTS.map(d => m1(d.committed - d.actual)), stack: 's', color: 'cyan' }, { name: 'Uncommitted', data: DEPTS.map(d => m1(d.approved - d.committed)), stack: 's', color: '#1E3A5F' }] },
        { span: 6, type: 'table', title: 'Ministry league table', height: 260,
          columns: [{ key: 'rank', label: '#' }, { key: 'name', label: 'Ministry' }, { key: 'approved', label: 'Approved (M)', align: 'right' }, { key: 'actual', label: 'Actual (M)', align: 'right' }, { key: 'util', label: 'Utilisation' }],
          rows: top(MINISTRIES, 'actual', 8).map((m, i) => { const u = (m.actual / m.approved) * 100; return { rank: i + 1, name: m.full, approved: fmt.n(m.approved), actual: fmt.n(m.actual), util: { bar: u, tone: u > 85 ? 'red' : u < 65 ? 'amber' : 'green' } }; }) },
      ],
    ],
  }));

  // ── 3 Spend by Category ──
  register(K(3), () => ({
    crumbs,
    kpis: [
      { label: 'Budget categories', value: '27', sub: '211 line items', tone: 'blue' },
      { label: 'Top 2 share', value: '49%', sub: 'Salaries + Capital', tone: 'violet', pct: 49 },
      { label: 'Recurrent', value: fmt.bwp(APPROVED * 0.62), sub: '62% of budget', tone: 'cyan', pct: 62 },
      { label: 'Development', value: fmt.bwp(APPROVED * 0.38), sub: '38% of budget', tone: 'green', pct: 38 },
      { label: 'Zero-spend categories', value: '2', delta: 'R&D, Grants', deltaTone: 'amber', sub: 'no transactions', tone: 'amber' },
    ],
    insight: 'Two categories (Salaries and Wages, Capital Projects) account for <b>49%</b> of the approved budget and <b>60%</b> of spend to date. Seventeen smaller categories together hold 7%.',
    grid: [
      [
        { span: 5, type: 'donut', title: 'Approved budget by category', height: 300, center: 'BWP 54.5M', valueFmt: fmt.bwp, items: [...cats10.slice(0, 7).map(c => ({ name: c.name, value: Math.round(c.approved) })), { name: 'Other 20 categories', value: Math.round(APPROVED - cats10.slice(0, 7).reduce((s, c) => s + c.approved, 0)), color: '#334155' }] },
        { span: 7, type: 'treemap', title: 'Actual spend | 27 categories', height: 300, valueFmt: fmt.bwp, items: CATEGORIES.map(c => ({ name: c.name, value: Math.round(c.actual) })) },
      ],
      [
        { span: 12, type: 'bar', title: 'Utilisation by category (%) | sorted', height: 260, rotate: 40, labelMax: 18, categories: top(CATEGORIES, 'util', 27).map(c => c.name),
          series: [{ name: 'Utilisation %', data: top(CATEGORIES, 'util', 27).map(c => ({ value: +c.util.toFixed(0), itemStyle: { color: c.util > 70 ? '#EF4444' : c.util < 35 ? '#F59E0B' : '#3B82F6' } })), markLine: { value: 50, label: 'Phasing 50%', tone: 'cyan' } }] },
      ],
    ],
  }));

  // ── 4 Monthly Trend & Burn Rate ──
  const burn = ACTUAL / MONTH_NOW;
  register(K(4), () => ({
    crumbs,
    kpis: [
      { label: 'Monthly burn rate', value: fmt.bwp(burn), delta: '▲ 9% vs plan', deltaTone: 'amber', sub: 'average Apr–Sep', tone: 'violet' },
      { label: 'Planned monthly', value: fmt.bwp(APPROVED / 12), sub: 'flat phasing', tone: 'cyan' },
      { label: 'Peak month', value: 'Aug ' + fmt.bwp(Math.max(...actMs.filter(Boolean))), sub: 'capital certificates', tone: 'orange' },
      { label: 'Months of runway', value: ((APPROVED - ACTUAL) / burn).toFixed(1), delta: 'at current burn', sub: '6 months left', tone: 'green' },
      { label: 'Cash released', value: fmt.bwp(APPROVED * 0.58), sub: 'by Treasury', tone: 'blue', pct: 58 },
    ],
    insight: { finding: `At the current burn rate of <b>${fmt.bwp(burn)}</b> a month, the ministry will exhaust its allocation in <b>${((APPROVED - ACTUAL) / burn).toFixed(1)} months</b>, slightly before year end.`, recommendation: 'Hold Q4 discretionary spend at plan.', severity: 'Medium', tone: 'amber' },
    grid: [
      [
        { span: 8, type: 'bar', title: 'Monthly spend vs plan (BWP M) with cumulative', height: 300, categories: MONTHS, y2: 'Cumulative M',
          series: [{ name: 'Plan', data: planM.map(m1), color: '#1E3A5F' }, { name: 'Actual', data: actMs.map(v => (v == null ? null : m1(v))), color: 'blue' }, { name: 'Cumulative plan', type: 'line', axis: 1, data: cum(planM).map(m1), color: 'cyan', dashed: true }, { name: 'Cumulative actual', type: 'line', axis: 1, data: cum(actMs).slice(0, MONTH_NOW).map(m1), color: 'amber' }] },
        { span: 4, type: 'gauge', title: 'Burn rate index (actual ÷ plan)', height: 300, gauges: [{ name: 'Burn index', value: 108, max: 150, fmt: v => (v / 100).toFixed(2) + '×', good: 999, warn: 105 }] },
      ],
      [
        { span: 12, type: 'area', title: 'Monthly spend by top 5 categories (BWP M)', height: 240, categories: MONTHS.slice(0, MONTH_NOW),
          series: cats10.slice(0, 5).map(c => ({ name: c.name, stack: 'a', data: c.monthly.slice(0, MONTH_NOW).map(m1) })) },
      ],
    ],
  }));

  // ── 5 Committed vs Paid ──
  const pipeline = [['Purchase orders raised', 38.1], ['Goods / services received', 33.6], ['Invoices captured', 31.8], ['Invoices verified', 30.5], ['Paid', 29.4]];
  register(K(5), () => ({
    crumbs,
    kpis: [
      { label: 'Committed', value: fmt.bwp(COMMITTED), delta: '70%', sub: 'of approved', tone: 'cyan', pct: 70 },
      { label: 'Paid', value: fmt.bwp(ACTUAL), delta: '77%', sub: 'of committed', tone: 'blue', pct: 77 },
      { label: 'Committed, unpaid', value: fmt.bwp(COMMITTED - ACTUAL), sub: 'open POs + accruals', tone: 'amber', pct: 23 },
      { label: 'Invoices over 30 days', value: '46', delta: 'BWP 2.1M', deltaTone: 'red', sub: 'Resolution 4 breach', tone: 'red' },
      { label: 'Avg days to pay', value: '34', delta: '▲ 6 days', deltaTone: 'red', sub: 'target 30', tone: 'orange' },
    ],
    insight: { finding: '<b>46 verified invoices</b> worth BWP 2.1M are older than 30 days, breaching Board Resolution 4 (90% paid within contract period).', recommendation: 'Run an age-prioritised payment batch this week; Director Finance to report on Friday.', severity: 'High', tone: 'red', actions: ['Explain finding', 'Open ageing list', 'Notify Director Finance'] },
    grid: [
      [
        { span: 4, type: 'funnel', title: 'Commitment to payment pipeline (BWP M)', height: 280, items: pipeline.map(([name, value]) => ({ name, value })) },
        { span: 8, type: 'bar', title: 'Committed vs paid by category | top 10 (BWP M)', height: 280, rotate: 30, labelMax: 16, categories: cats10.map(c => c.name),
          series: [{ name: 'Paid', data: cats10.map(c => m1(c.actual)), stack: 'c', color: 'blue' }, { name: 'Committed, unpaid', data: cats10.map(c => m1(c.committed - c.actual)), stack: 'c', color: 'amber' }] },
      ],
      [
        { span: 6, type: 'bar', title: 'Unpaid invoice ageing (count)', height: 220, categories: ['0–15 days', '16–30 days', '31–60 days', '61–90 days', '90+ days'],
          series: [{ name: 'Invoices', label: true, data: [{ value: 88, itemStyle: { color: '#10B981' } }, { value: 61, itemStyle: { color: '#3B82F6' } }, { value: 29, itemStyle: { color: '#F59E0B' } }, { value: 11, itemStyle: { color: '#F97316' } }, { value: 6, itemStyle: { color: '#EF4444' } }] }] },
        { span: 6, type: 'table', title: 'Oldest unpaid verified invoices', height: 220,
          columns: [{ key: 'inv', label: 'Invoice' }, { key: 'sup', label: 'Supplier' }, { key: 'amt', label: 'Amount', align: 'right' }, { key: 'age', label: 'Age', align: 'right' }, { key: 'st', label: 'Status' }],
          rows: (() => { const r = rng('inv'); return Array.from({ length: 8 }, (_, i) => ({ inv: `INV-26-${r.int(20000, 99999)}`, sup: r.pick(DASH.data.SUPPLIERS), amt: fmt.n(r.int(40, 420) * 1000), age: `${118 - i * 11} d`, st: i < 3 ? { pill: '90+ days', tone: 'red' } : { pill: 'Overdue', tone: 'orange' } })); })() },
      ],
    ],
  }));

  // ── 6 Variance Analysis ──
  register(K(6), () => ({
    crumbs,
    kpis: [
      { label: 'Approved', value: 'BWP 54.5M', sub: 'original estimate', tone: 'blue' },
      { label: 'Forecast outturn', value: 'BWP 51.3M', delta: '▼ 3.2M', deltaTone: 'green', sub: 'under budget', tone: 'cyan' },
      { label: 'Adverse variances', value: '2', delta: 'Capital, Transport', deltaTone: 'red', sub: '+BWP 2.2M', tone: 'red' },
      { label: 'Favourable variances', value: '4', delta: 'Salaries, ICT …', deltaTone: 'green', sub: '−BWP 5.4M', tone: 'green' },
      { label: 'Variance vs last year', value: '−8%', sub: 'income sheet trend', tone: 'amber' },
    ],
    insight: 'Year-end outturn is forecast at <b>BWP 51.3M</b>, BWP 3.2M under budget. Savings on salaries (vacancies) and ICT (slipped data-centre works) more than offset overruns on capital and transport.',
    grid: [
      [
        { span: 8, type: 'waterfall', title: 'Budget to forecast bridge (BWP M)', height: 300, min: 44,
          steps: [{ name: 'Approved', value: 54.5, total: true }, { name: 'Salaries', value: -2.2 }, { name: 'Capital', value: 1.4 }, { name: 'ICT', value: -1.6 }, { name: 'Transport', value: 0.8 }, { name: 'Utilities', value: -0.5 }, { name: 'Prof. services', value: -1.1 }, { name: 'Forecast', value: 51.3, total: true }] },
        { span: 4, type: 'bar', title: 'Variance % by category | top 10', height: 300, horizontal: true, categories: cats10.map(c => c.name), labelMax: 18,
          series: [{ name: 'Variance vs phasing %', data: cats10.map(c => { const v = +(c.util - 50).toFixed(0); return { value: v, itemStyle: { color: v > 0 ? '#EF4444' : '#10B981' } }; }) }] },
      ],
      [
        { span: 12, type: 'table', title: 'Variance sheet | current month vs budget and last year', height: 260,
          columns: [{ key: 'line', label: 'Line' }, { key: 'b', label: 'Budgeted (month)', align: 'right' }, { key: 'a', label: 'Actual (month)', align: 'right' }, { key: 'v', label: 'Variance', align: 'right' }, { key: 'ly', label: 'Last year', align: 'right' }, { key: 't', label: 'Trend' }],
          rows: cats10.map((c, i) => { const r = rng('var' + i); const b = c.approved / 12, a = b * r.num(0.7, 1.35), ly = a * r.num(0.85, 1.1); return { line: c.name, b: fmt.n(b), a: fmt.n(a), v: { trend: a > b ? 'up' : 'down', text: fmt.pct(((a - b) / b) * 100), tone: a > b ? 'red' : 'green' }, ly: fmt.n(ly), t: { trend: a > ly ? 'up' : 'down', text: 'vs LY', tone: 'slate' } }; }) },
      ],
    ],
  }));

  // ── 7 Cost Centre Heat Map ──
  register(K(7), () => {
    const r = rng('heat');
    const cats = cats10.slice(0, 8);
    const values = [];
    DEPTS.forEach((d, y) => cats.forEach((c, x) => values.push([x, y, Math.round(r.num(28, 92))])));
    values[7][2] = 96; values[18][2] = 91; values[29][2] = 22;
    return {
      crumbs: [...crumbs, 'Department', 'Cost centre'],
      kpis: [
        { label: 'Cost centres', value: '40', sub: '5 departments × 8', tone: 'blue' },
        { label: 'Red cells (> 85%)', value: String(values.filter(v => v[2] > 85).length), delta: 'overspend risk', deltaTone: 'red', sub: '', tone: 'red' },
        { label: 'Amber cells (< 35%)', value: String(values.filter(v => v[2] < 35).length), delta: 'underspend', deltaTone: 'amber', sub: '', tone: 'amber' },
        { label: 'Median utilisation', value: '58%', sub: 'all cost centres', tone: 'violet', pct: 58 },
      ],
      insight: 'Dept A (Clinical Services) administrative costs are at <b>96%</b> of the annual allocation by month 6, the hottest cost centre in the ministry.',
      grid: [
        [{ span: 12, type: 'heatmap', title: 'Utilisation % | department × category', height: 330, x: cats.map(c => c.name), y: DEPTS.map(d => d.label), values, cellFmt: v => v + '%', valueFmt: v => v + '%', rotate: 20 }],
        [
          { span: 6, type: 'list', title: 'Hot spots', items: values.filter(v => v[2] > 85).map(v => ({ title: `${DEPTS[v[1]].label} · ${cats[v[0]].name}`, meta: 'Utilisation at month 6', value: v[2] + '%', tone: 'red' })) },
          { span: 6, type: 'list', title: 'Cold spots', items: values.filter(v => v[2] < 35).map(v => ({ title: `${DEPTS[v[1]].label} · ${cats[v[0]].name}`, meta: 'Possible delayed procurement', value: v[2] + '%', tone: 'amber' })) },
        ],
      ],
    };
  });

  // ── 8 Top Cost Drivers ──
  const drivers = [['Contractor certificates | Clinic', 4.1, 'Capital Projects'], ['Nurse overtime', 1.9, 'Salaries and Wages'], ['Fuel and fleet hire', 1.4, 'Transport & Fleet Management'], ['Consultancy | hospital design', 1.2, 'Professional Services'], ['Electricity | Maun hospital', 0.9, 'Utilities'], ['Software licences', 0.8, 'ICT Expenditure'], ['Generator repairs', 0.6, 'Maintenance'], ['Security guarding', 0.5, 'Security'], ['Courier and freight', 0.4, 'Procurement & Supply Chain'], ['Conference venues', 0.3, 'Meetings']];
  register(K(8), () => ({
    crumbs,
    kpis: [
      { label: 'Top 10 drivers', value: 'BWP 12.1M', sub: '41% of spend', tone: 'blue', pct: 41 },
      { label: 'Largest driver', value: 'BWP 4.1M', sub: 'Clinic certificates', tone: 'violet' },
      { label: 'Fastest growing', value: 'Nurse overtime', delta: '▲ 38% vs LY', deltaTone: 'red', sub: '', tone: 'red' },
      { label: 'Supplier concentration', value: '3 suppliers', sub: 'hold 44% of spend', tone: 'amber', pct: 44 },
    ],
    insight: { finding: 'Nurse overtime has grown <b>38%</b> year on year and is now the second-largest cost driver, linked to 42 vacant nursing posts.', recommendation: 'Accelerate recruitment for the 42 posts; overtime cap at 20 hours per nurse per month.', severity: 'Medium', tone: 'amber' },
    grid: [
      [
        { span: 7, type: 'bar', title: 'Top 10 cost drivers (BWP M)', height: 300, horizontal: true, categories: drivers.map(d => d[0]), labelMax: 30, series: [{ name: 'Spend', data: drivers.map(d => d[1]), color: 'blue', label: true }] },
        { span: 5, type: 'sankey', title: 'Spend flow | category → driver', height: 300,
          nodes: [...new Set(drivers.slice(0, 7).map(d => d[2]))].concat(drivers.slice(0, 7).map(d => d[0])),
          links: drivers.slice(0, 7).map(d => ({ source: d[2], target: d[0], value: d[1] })) },
      ],
      [{ span: 12, type: 'line', title: 'Top 4 drivers | monthly trend (BWP K)', height: 220, categories: MONTHS.slice(0, MONTH_NOW),
        series: drivers.slice(0, 4).map((d, i) => ({ name: d[0], data: rng('drv' + i).walk(MONTH_NOW, (d[1] * 1000) / 6, 0.35, i === 1 ? 0.06 : 0).map(v => Math.round(v)) })) }],
    ],
  }));

  // ── 9 Year-End Forecast ──
  register(K(9), () => {
    const fc = cum(actMs).slice(0, MONTH_NOW).map(m1);
    const last = fc[MONTH_NOW - 1];
    const proj = MONTHS.map((_, i) => (i < MONTH_NOW - 1 ? null : +(last + (i - MONTH_NOW + 1) * (51.3 - last) / (12 - MONTH_NOW)).toFixed(2)));
    const hi = proj.map((v, i) => (v == null ? null : +(v * (1 + 0.012 * (i - MONTH_NOW + 1))).toFixed(2)));
    return {
      crumbs,
      kpis: [
        { label: 'Forecast outturn', value: 'BWP 51.3M', delta: '94%', sub: 'of approved', tone: 'cyan', pct: 94 },
        { label: 'Projected unspent', value: 'BWP 3.2M', delta: 'lapse risk', deltaTone: 'amber', sub: 'returns to Treasury', tone: 'amber' },
        { label: 'Confidence band', value: '± BWP 1.4M', sub: '80% interval', tone: 'violet' },
        { label: 'Capital at risk of lapse', value: 'BWP 2.6M', delta: 'Ghanzi labs', deltaTone: 'red', sub: 'procurement delay', tone: 'red' },
      ],
      insight: { finding: 'At the current rate, approximately <b>BWP 3.2M (6%)</b> of the allocation may remain unspent at year end, mostly in capital projects delayed at procurement.', recommendation: 'Re-phase or vire BWP 2.6M before the Q3 revision deadline (15 Oct).', severity: 'Medium', tone: 'amber' },
      grid: [
        [
          { span: 8, type: 'line', title: 'Cumulative spend and year-end projection (BWP M)', height: 300, categories: MONTHS,
            series: [{ name: 'Budget line', data: cum(planM).map(m1), color: '#475569', dashed: true, symbol: 'none' }, { name: 'Actual', data: fc, color: 'blue', area: true }, { name: 'Projection', data: proj, color: 'cyan', dashed: true }, { name: 'Upper band', data: hi, color: 'violet', dashed: true, symbol: 'none' }] },
          { span: 4, type: 'donut', title: 'Year-end position', height: 300, center: '94%', valueFmt: v => `BWP ${v}M`, items: [{ name: 'Spent to date', value: 29.4, color: 'blue' }, { name: 'Projected H2', value: 21.9, color: 'cyan' }, { name: 'Unspent', value: 3.2, color: 'amber' }] },
        ],
        [{ span: 12, type: 'table', title: 'Forecast by category', height: 240,
          columns: [{ key: 'n', label: 'Category' }, { key: 'a', label: 'Approved', align: 'right' }, { key: 'f', label: 'Forecast', align: 'right' }, { key: 'g', label: 'Gap', align: 'right' }, { key: 's', label: 'Outlook' }],
          rows: cats10.map(c => { const g = c.approved - c.forecast; return { n: c.name, a: fmt.n(c.approved), f: fmt.n(c.forecast), g: { trend: g < 0 ? 'up' : 'down', text: fmt.n(Math.abs(g)), tone: g < 0 ? 'red' : 'amber' }, s: g < 0 ? { pill: 'Overrun', tone: 'red' } : g > c.approved * 0.1 ? { pill: 'Lapse risk', tone: 'amber' } : { pill: 'On budget', tone: 'green' } }; }) }],
      ],
    };
  });

  // ── 10 Abnormal Spending Alerts ──
  const alerts = [
    ['Payment without supporting documents', 'PV-26-44812 · Lesedi Security Services', 'BWP 1,240,000', 'Critical', 'red'],
    ['Split purchase below tender threshold', '4 POs to Serowe Hardware in 6 days', 'BWP 396,000', 'High', 'orange'],
    ['Duplicate invoice number', 'INV-7781 billed twice · Mokgosi Logistics', 'BWP 58,300', 'High', 'orange'],
    ['Weekend payment release', 'Sat 13 Sep · 3 vouchers', 'BWP 212,500', 'Medium', 'amber'],
    ['Spend spike vs 6-month average', 'Conference venues · 4.2× average', 'BWP 88,000', 'Medium', 'amber'],
    ['Invoice before delivery (GRN)', 'Okavango Medical Supplies', 'BWP 146,900', 'High', 'orange'],
    ['Round-sum payment', 'Consultancy · BWP 500,000.00', 'BWP 500,000', 'Low', 'blue'],
  ];
  register(K(10), () => {
    const r = rng('anom');
    const days = Array.from({ length: 30 }, (_, i) => Math.round(r.num(180, 320)));
    [7, 16, 21, 27].forEach(i => (days[i] = Math.round(r.num(560, 780))));
    return {
      crumbs,
      kpis: [
        { label: 'Open alerts', value: '23', delta: '▲ 5 this week', deltaTone: 'red', sub: '', tone: 'red' },
        { label: 'Critical', value: '3', sub: 'needs PS attention', tone: 'red' },
        { label: 'Value flagged', value: 'BWP 2.64M', sub: '9% of spend', tone: 'orange', pct: 9 },
        { label: 'Confirmed false positives', value: '12%', sub: 'last 90 days', tone: 'green', pct: 12 },
        { label: 'Avg time to close', value: '6.4 days', delta: '▼ 1.1 days', sub: 'vs Q1', tone: 'blue' },
      ],
      insight: { finding: 'Four daily spend spikes in September exceed <b>2.5×</b> the 30-day average; three coincide with payment vouchers missing delivery notes.', recommendation: 'Refer PV-26-44812 to Internal Audit.', severity: 'Critical', tone: 'red', actions: ['Explain finding', 'Refer to audit', 'Assign officer'] },
      grid: [
        [
          { span: 8, type: 'bar', title: 'Daily payments with anomaly detection (BWP K)', height: 260, categories: days.map((_, i) => `${i + 1} Sep`), rotate: 0, barWidth: 14,
            series: [{ name: 'Daily payments', data: days.map(v => ({ value: v, itemStyle: { color: v > 500 ? '#EF4444' : '#1D4ED8' } })), markLine: { value: 520, label: 'Control limit', tone: 'red' } }] },
          { span: 4, type: 'donut', title: 'Alerts by rule', height: 260, items: [{ name: 'Missing documents', value: 7 }, { name: 'Split purchases', value: 5 }, { name: 'Duplicates', value: 4 }, { name: 'Timing', value: 4 }, { name: 'Spikes', value: 3 }] },
        ],
        [{ span: 12, type: 'table', title: 'Alert queue', height: 260,
          columns: [{ key: 'rule', label: 'Rule triggered' }, { key: 'ctx', label: 'Transaction' }, { key: 'amt', label: 'Amount', align: 'right' }, { key: 'sev', label: 'Severity' }, { key: 'own', label: 'Assigned to' }],
          rows: alerts.map(([rule, ctx, amt, sev, t], i) => ({ rule: { strong: rule }, ctx, amt, sev: { pill: sev, tone: t }, own: DASH.data.OFFICERS[(i + 3) % 12] })) }],
      ],
    };
  });

  // ── 11 Performance Audit ──
  const pillars = ['Economy', 'Efficiency', 'Effectiveness', 'Compliance', 'Value for money', 'Timeliness'];
  register(K(11), () => ({
    crumbs,
    kpis: [
      { label: 'Programmes audited', value: '9', sub: 'FY 2026-27 plan', tone: 'blue' },
      { label: 'Overall score', value: '71 / 100', delta: '▲ 4 vs FY25', sub: '', tone: 'green', pct: 71 },
      { label: 'Output targets met', value: '62%', sub: '34 of 55 outputs', tone: 'amber', pct: 62 },
      { label: 'Cost per output', value: '▲ 11%', deltaTone: 'red', delta: 'vs budget', sub: '', tone: 'red' },
      { label: 'Open audit findings', value: '14', sub: '5 high risk', tone: 'orange' },
    ],
    insight: 'Spend is ahead of outputs: the ministry has used <b>54%</b> of its budget but delivered <b>41%</b> of planned outputs. The Primary Health Care programme has the widest gap.',
    grid: [
      [
        { span: 4, type: 'radar', title: 'Performance scorecard', height: 290, indicators: pillars.map(n => ({ name: n, max: 100 })), series: [{ name: 'FY 2026-27', values: [74, 66, 61, 82, 69, 58], color: 'blue' }, { name: 'FY 2025-26', values: [70, 63, 60, 77, 64, 61], color: 'amber' }] },
        { span: 8, type: 'scatter', title: 'Programmes | budget used vs outputs delivered (%)', height: 290, xName: 'Budget used %', yName: 'Outputs delivered %', xMin: 0, xMax: 100, yMin: 0, yMax: 100, diagonal: true, labels: true,
          points: [['Primary Health Care', 68, 35, 'red'], ['Hospital Services', 57, 52, 'blue'], ['Disease Control', 49, 55, 'green'], ['Maternal Health', 52, 47, 'blue'], ['Health Infrastructure', 74, 43, 'red'], ['Pharmaceuticals', 61, 64, 'green'], ['HR for Health', 44, 30, 'amber'], ['Health Information', 38, 41, 'green'], ['Corporate Services', 55, 50, 'blue']].map(([name, x, y, tone]) => ({ name, x, y, tone, size: 16 })) },
      ],
      [{ span: 12, type: 'table', title: 'Programme performance', height: 260,
        columns: [{ key: 'p', label: 'Programme' }, { key: 'b', label: 'Budget used' }, { key: 'o', label: 'Outputs' }, { key: 'e', label: 'Efficiency', align: 'right' }, { key: 'r', label: 'Rating' }],
        rows: [['Primary Health Care', 68, 35], ['Health Infrastructure', 74, 43], ['HR for Health', 44, 30], ['Hospital Services', 57, 52], ['Maternal Health', 52, 47], ['Corporate Services', 55, 50], ['Disease Control', 49, 55], ['Pharmaceuticals', 61, 64], ['Health Information', 38, 41]]
          .map(([p, b, o]) => { const e = o / b; return { p, b: { bar: b, tone: 'violet' }, o: { bar: o, tone: 'cyan' }, e: e.toFixed(2), r: e < 0.7 ? { pill: 'Poor', tone: 'red' } : e < 0.95 ? { pill: 'Fair', tone: 'amber' } : { pill: 'Good', tone: 'green' } }; }) }],
    ],
  }));
})();
