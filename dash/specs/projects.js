/* Menu 4: Projects Analytics (all 12 tabs, 3-0 … 3-11).
 * Built on DASH.data.PROJECTS so portfolio totals, statuses and the Construction of Clinic
 * anchor (approved 25.0M, committed 18.0M, spent 15.5M) agree with the rest of the mockup.
 * Lifecycle: planning > procurement > award > mobilisation > implementation > milestones >
 * payment > completion > handover > defects > disposal/closure > performance audit.
 */
(function () {
  const { register, fmt, rng, C } = DASH;
  const { MONTHS, MONTH_NOW, PROJECTS, OFFICERS, M } = DASH.data;
  const K = n => `3-${n}`;
  const crumbs = ['All Ministries', 'Development portfolio', 'FY 2026-27'];
  const P = PROJECTS;
  const m1 = v => +(v / M).toFixed(1);
  const sum = (a, f) => a.reduce((s, x) => s + f(x), 0);
  const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
  const by = (arr, f, dir = -1) => [...arr].sort((a, b) => dir * (f(a) - f(b)));

  // Portfolio totals
  const TOT = { approved: sum(P, p => p.approved), committed: sum(P, p => p.committed), spent: sum(P, p => p.spent) };
  const wPhys = sum(P, p => p.physical * p.approved) / TOT.approved;
  const wPlan = sum(P, p => p.planned * p.approved) / TOT.approved;
  const wFin = (TOT.spent / TOT.approved) * 100;
  const ST = { Critical: 'red', 'At risk': 'amber', 'On track': 'green', 'Near completion': 'cyan' };
  const statusPill = p => ({ pill: p.status, tone: ST[p.status] });
  const SHORT = {
    'Construction of Clinic': 'Molepolole Clinic', 'Maun District Hospital Wing': 'Maun Hospital Wing', 'Francistown Referral Theatre': 'Francistown Theatre',
    'Kasane Health Post Upgrade': 'Kasane Health Post', 'Serowe Primary School Blocks': 'Serowe School Blocks', 'Ghanzi Senior School Labs': 'Ghanzi School Labs',
    'A1 Palapye–Mahalapye Rehab': 'A1 Road Rehab', 'Kazungula Link Road': 'Kazungula Road', 'Tsabong Water Treatment': 'Tsabong Water',
    'Selebi-Phikwe Pipeline': 'Phikwe Pipeline', 'Hukuntsi Solar Mini-grid': 'Hukuntsi Solar', 'Letlhakane Substation': 'Letlhakane Substation',
    'e-Government Data Centre': 'e-Gov Data Centre', 'Shakawe Agric Demo Farm': 'Shakawe Demo Farm', 'Lobatse Abattoir Upgrade': 'Lobatse Abattoir', 'Jwaneng Police Housing': 'Jwaneng Housing',
  };
  const sn = p => SHORT[p.name] || p.name;
  const MINS = [...new Set(P.map(p => p.ministry))];
  const count = s => P.filter(p => p.status === s).length;
  const atRisk = P.filter(p => p.status === 'Critical' || p.status === 'At risk');
  const maun = P.find(p => p.name === 'Maun District Hospital Wing');
  const clinic = P.find(p => p.name === 'Construction of Clinic');
  const sv = p => p.physical - p.planned; // schedule variance, pts
  const cpi = p => (p.physical / 100) * p.approved / p.spent; // earned ÷ actual
  const voPct = p => (p.variationValue / p.approved) * 100;
  const gapTone = g => (g > 20 ? 'red' : g > 10 ? 'orange' : g < -8 ? 'cyan' : 'green');

  // ── 0 Portfolio Overview ──
  register(K(0), () => ({
    crumbs,
    kpis: [
      { label: 'Portfolio value', value: fmt.bwp(TOT.approved), delta: `${P.length} projects`, deltaTone: 'blue', sub: `${MINS.length} ministries`, tone: 'blue', pct: 100 },
      { label: 'Committed', value: fmt.bwp(TOT.committed), delta: fmt.pct((TOT.committed / TOT.approved) * 100), sub: 'contracts + POs', tone: 'cyan', pct: (TOT.committed / TOT.approved) * 100 },
      { label: 'Spent to date', value: fmt.bwp(TOT.spent), delta: fmt.pct(wFin), sub: 'financial progress', tone: 'violet', pct: wFin },
      { label: 'Physical progress', value: fmt.pct(wPhys), delta: `▼ ${(wFin - wPhys).toFixed(0)} pts`, deltaTone: 'amber', sub: 'behind spend (value-weighted)', tone: 'green', pct: wPhys },
      { label: 'At risk / critical', value: `${atRisk.length} of ${P.length}`, delta: fmt.bwp(sum(atRisk, p => p.approved)), deltaTone: 'red', sub: 'portfolio value', tone: 'red', pct: (atRisk.length / P.length) * 100 },
    ],
    insight: { finding: `Spend is running ahead of delivery: the portfolio is <b>${fmt.pct(wFin)}</b> paid but only <b>${fmt.pct(wPhys)}</b> physically complete. Maun District Hospital Wing alone is 45% built against 78% paid.`, recommendation: 'Withhold further Maun certificates until an independent site measurement is done.', severity: 'High', tone: 'orange' },
    grid: [
      [
        { span: 7, type: 'bar', title: 'Approved vs committed vs spent by ministry (BWP M)', height: 280, categories: MINS,
          series: [
            { name: 'Approved', data: MINS.map(n => m1(sum(P.filter(p => p.ministry === n), p => p.approved))), color: '#1E3A5F' },
            { name: 'Committed', data: MINS.map(n => m1(sum(P.filter(p => p.ministry === n), p => p.committed))), color: 'cyan' },
            { name: 'Spent', data: MINS.map(n => m1(sum(P.filter(p => p.ministry === n), p => p.spent))), color: 'blue' },
          ] },
        { span: 5, type: 'donut', title: 'Projects by status', height: 280, center: `${P.length} projects`,
          items: ['On track', 'Near completion', 'At risk', 'Critical'].map(s => ({ name: s, value: count(s), color: ST[s] })) },
      ],
      [
        { span: 8, type: 'table', title: 'Project portfolio | all projects', height: 300,
          columns: [{ key: 'id', label: 'ID' }, { key: 'name', label: 'Project' }, { key: 'min', label: 'Ministry' }, { key: 'appr', label: 'Approved (M)', align: 'right' }, { key: 'spent', label: 'Spent (M)', align: 'right' }, { key: 'phys', label: 'Physical' }, { key: 'fin', label: 'Financial' }, { key: 'st', label: 'Status' }],
          rows: by(P, p => p.approved).map(p => ({ id: p.id, name: { strong: p.name }, min: p.ministry, appr: fmt.m(p.approved), spent: fmt.m(p.spent), phys: { bar: p.physical, tone: 'green' }, fin: { bar: p.financial, tone: p.gap > 10 ? 'red' : 'violet' }, st: statusPill(p) })) },
        { span: 4, type: 'list', title: 'Executive watchlist', height: 300,
          items: by(atRisk, p => p.gap).map(p => ({ title: p.name, meta: `${p.town} · ${p.contractor} · physical ${p.physical}% vs paid ${p.financial}%`, pill: p.status, tone: ST[p.status] })) },
      ],
    ],
  }));

  // ── 1 Planning & Sourcing ──
  const STAGES = ['Concept note', 'Feasibility', 'Design', 'Budget approval', 'Procurement plan', 'Tender'];
  const PIPE = [
    ['Mahalapye District Hospital Phase II', 'Health', 142.0, 2, 'Open tender'], ['Gaborone Bus Rapid Transit Study', 'Transport', 8.5, 1, 'Selective tender'],
    ['Tutume Senior Secondary School', 'Education', 36.0, 3, 'Open tender'], ['Bobonong Water Reticulation', 'Water', 24.8, 4, 'Open tender'],
    ['Ghanzi–Charles Hill Road Resealing', 'Transport', 61.2, 5, 'Open tender'], ['Kanye Clinic Maternity Wing', 'Health', 18.4, 4, 'Open tender'],
    ['National Fibre Backbone Phase 3', 'ICT', 55.0, 2, 'International tender'], ['Mochudi Agro-processing Hub', 'Agriculture', 12.3, 0, 'Selective tender'],
    ['Palapye Solar PV 20MW', 'Energy', 128.0, 1, 'PPP'], ['Maun Police Station Rebuild', 'Defence', 21.7, 3, 'Open tender'],
    ['Letlhakane Primary Classrooms', 'Education', 9.8, 5, 'Direct appointment'], ['Serowe Sewer Ponds', 'Water', 16.6, 0, 'Open tender'],
    ['Francistown Nurses Hostel', 'Health', 27.3, 2, 'Open tender'], ['Kasane Border Post ICT', 'ICT', 6.9, 4, 'Selective tender'],
  ].map(([name, ministry, cost, stage, method], i) => { const r = rng('pipe' + i); return { name, ministry, cost, stage, method, days: r.int(40, 260), ready: r.int(35, 95) }; });
  register(K(1), () => ({
    crumbs,
    kpis: [
      { label: 'Pipeline projects', value: String(PIPE.length), sub: 'FY 2027-28 candidates', tone: 'blue' },
      { label: 'Pipeline value', value: `BWP ${fmt.n(sum(PIPE, p => p.cost), 1)}M`, sub: 'estimated capital cost', tone: 'violet' },
      { label: 'Ready for tender', value: String(PIPE.filter(p => p.stage >= 4).length), delta: `BWP ${fmt.n(sum(PIPE.filter(p => p.stage >= 4), p => p.cost), 1)}M`, deltaTone: 'green', sub: 'procurement plan done', tone: 'green' },
      { label: 'Stuck > 180 days', value: String(PIPE.filter(p => p.days > 180).length), delta: '▲ 2 vs Q1', deltaTone: 'red', sub: 'in one stage', tone: 'red' },
      { label: 'Feasibility approved', value: '71%', sub: 'first-time pass rate', tone: 'cyan', pct: 71 },
    ],
    insight: { finding: 'Palapye Solar PV (BWP 128M) and Mahalapye Hospital Phase II (BWP 142M) hold <b>55%</b> of pipeline value but are still at feasibility/design; neither will reach tender before Q4.', recommendation: 'Fast-track the Mahalapye design review and move smaller shovel-ready projects forward in the FY 2027-28 ceiling.', severity: 'Medium', tone: 'amber' },
    grid: [
      [
        { span: 5, type: 'funnel', title: 'Pipeline by planning stage (projects reached)', height: 280, items: STAGES.map((s, i) => ({ name: s, value: PIPE.filter(p => p.stage >= i).length })) },
        { span: 7, type: 'bar', title: 'Pipeline value by ministry and stage (BWP M)', height: 280, categories: [...new Set(PIPE.map(p => p.ministry))],
          series: [['Concept / feasibility', [0, 1], 'slate'], ['Design', [2], 'violet'], ['Budget approval', [3], 'cyan'], ['Ready to tender', [4, 5], 'green']].map(([name, st, color]) => ({ name, stack: 's', color,
            data: [...new Set(PIPE.map(p => p.ministry))].map(mn => +sum(PIPE.filter(p => p.ministry === mn && st.includes(p.stage)), p => p.cost).toFixed(1)) })) },
      ],
      [
        { span: 8, type: 'table', title: 'Project pipeline register', height: 280,
          columns: [{ key: 'n', label: 'Project' }, { key: 'm', label: 'Ministry' }, { key: 'c', label: 'Est. cost (M)', align: 'right' }, { key: 's', label: 'Stage' }, { key: 'd', label: 'Days in stage', align: 'right' }, { key: 'r', label: 'Readiness' }],
          rows: by(PIPE, p => p.cost).map(p => ({ n: { strong: p.name }, m: p.ministry, c: fmt.n(p.cost, 1), s: { pill: STAGES[p.stage], tone: p.stage >= 4 ? 'green' : p.stage >= 2 ? 'blue' : 'slate' }, d: { trend: p.days > 180 ? 'up' : 'flat', text: String(p.days), tone: p.days > 180 ? 'red' : 'slate' }, r: { bar: p.ready, tone: p.ready > 75 ? 'green' : p.ready > 50 ? 'amber' : 'red' } })) },
        { span: 4, type: 'donut', title: 'Planned sourcing method (BWP M)', height: 280, valueFmt: v => `BWP ${fmt.n(v, 1)}M`,
          items: ['Open tender', 'International tender', 'Selective tender', 'PPP', 'Direct appointment'].map(mt => ({ name: mt, value: +sum(PIPE.filter(p => p.method === mt), p => p.cost).toFixed(1) })) },
      ],
    ],
  }));

  // ── 2 Contract Award & Mobilisation ──
  const AWARD = P.map((p, i) => { const r = rng('award' + i); const yr = 2024 + (p.start > 4 ? 1 : 0); const a = { p, yr, tender: r.int(45, 120), sign: r.int(10, 45), mob: r.int(14, 70), bond: r() > 0.2, adv: r() > 0.35 ? p.approved * 0.1 : 0, date: `${String(r.int(1, 28)).padStart(2, '0')} ${r.pick(['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'])} ${yr}` };
    if (p.name === 'Ghanzi Senior School Labs') Object.assign(a, { mob: 71, bond: false, adv: 1.43 * M });
    return a; });
  const mobOnTime = AWARD.filter(a => a.mob <= 28).length;
  register(K(2), () => ({
    crumbs,
    kpis: [
      { label: 'Contracts awarded', value: String(P.length), sub: `${new Set(P.map(p => p.contractor)).size} contractors`, tone: 'blue' },
      { label: 'Contract sum', value: fmt.bwp(TOT.committed), sub: 'awarded value', tone: 'violet' },
      { label: 'Tender close → award', value: `${Math.round(sum(AWARD, a => a.tender) / AWARD.length)} days`, delta: '▲ 12 vs target 60', deltaTone: 'red', sub: 'average', tone: 'amber' },
      { label: 'Mobilised within 28 days', value: `${mobOnTime} of ${P.length}`, delta: fmt.pct((mobOnTime / P.length) * 100), deltaTone: 'amber', sub: 'site possession', tone: 'cyan', pct: (mobOnTime / P.length) * 100 },
      { label: 'Missing performance bond', value: String(AWARD.filter(a => !a.bond).length), delta: 'contract breach', deltaTone: 'red', sub: '10% security', tone: 'red' },
    ],
    insight: { finding: `Only <b>${mobOnTime} of ${P.length}</b> contractors took site possession within 28 days of signing. Ghanzi Senior School Labs mobilised late and has since slipped to 27% physical progress.`, recommendation: 'Make advance payment conditional on site establishment and enforce the 28-day mobilisation clause.', severity: 'Medium', tone: 'amber' },
    grid: [
      [
        { span: 12, type: 'steps', title: 'Award to mobilisation workflow | Ghanzi Senior School Labs (PRJ-106)',
          steps: [{ name: 'Evaluation report', state: 'done', meta: '12 Feb' }, { name: 'Adjudication (MTC)', state: 'done', meta: '06 Mar' }, { name: 'Award letter', state: 'done', meta: '14 Mar' }, { name: 'Contract signed', state: 'done', meta: '22 Apr' }, { name: 'Performance bond', state: 'late', meta: 'outstanding 150 d' }, { name: 'Advance payment', state: 'done', meta: 'BWP 1.4M' }, { name: 'Site handover', state: 'done', meta: '30 Jun' }, { name: 'Contractor mobilised', state: 'current', meta: '71 days after signing' }] },
      ],
      [
        { span: 7, type: 'bar', title: 'Award cycle by project (days)', height: 300, horizontal: true, labelMax: 22, categories: AWARD.map(a => sn(a.p)),
          series: [{ name: 'Tender close → award', data: AWARD.map(a => a.tender), stack: 'd', color: 'violet' }, { name: 'Award → signing', data: AWARD.map(a => a.sign), stack: 'd', color: 'blue' }, { name: 'Signing → mobilised', data: AWARD.map(a => ({ value: a.mob, itemStyle: { color: a.mob > 28 ? C.orange : C.cyan } })), stack: 'd', color: 'cyan' }] },
        { span: 5, type: 'gauge', title: 'Award compliance', height: 300, gauges: [{ name: 'Mobilised ≤ 28 d', value: Math.round((mobOnTime / P.length) * 100) }, { name: 'Bonds in place', value: Math.round((AWARD.filter(a => a.bond).length / P.length) * 100) }] },
      ],
      [
        { span: 12, type: 'table', title: 'Contract register', height: 260,
          columns: [{ key: 'id', label: 'Contract' }, { key: 'n', label: 'Project' }, { key: 'c', label: 'Contractor' }, { key: 'd', label: 'Awarded' }, { key: 'v', label: 'Contract sum', align: 'right' }, { key: 'a', label: 'Advance paid', align: 'right' }, { key: 'b', label: 'Perf. bond' }, { key: 'm', label: 'Mobilisation' }],
          rows: AWARD.map(a => ({ id: `CT/${a.p.ministry.slice(0, 3).toUpperCase()}/${a.p.id.slice(4)}/${String(a.yr).slice(2)}`, n: { strong: a.p.name }, c: a.p.contractor, d: a.date, v: fmt.n(a.p.committed), a: a.adv ? fmt.n(a.adv) : '—', b: a.bond ? { pill: 'Valid', tone: 'green' } : { pill: 'Missing', tone: 'red' }, m: a.mob <= 28 ? { pill: `${a.mob} days`, tone: 'green' } : { pill: `${a.mob} days`, tone: a.mob > 50 ? 'red' : 'amber' } })) },
      ],
    ],
  }));

  // ── 3 Implementation & Milestones ──
  // Timeline: month 0 = Apr 2024, today = Sep 2026 (29). Bars are placed so elapsed time matches planned %.
  const T0 = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  const mLabel = i => `${T0[i % 12]} ${String(24 + Math.floor((i + 3) / 12))}`;
  const TODAY = 29;
  const SCHED = P.map(p => { const dur = Math.min(30, p.end - p.start + 8); const s = clamp(Math.round(TODAY - dur * (p.planned / 100)), 0, 40); const e = s + dur; const fc = Math.round(s + dur * (p.planned / Math.max(p.physical, 1))); return { p, s, e, fc: Math.max(e, fc) }; });
  const MS = P.map((p, i) => { const r = rng('ms' + i); const total = r.int(6, 12); const due = Math.round(total * p.planned / 100); const done = Math.min(due, Math.round(total * p.physical / 100)); return { p, total, due, done, overdue: due - done }; });
  const msTot = sum(MS, m => m.total), msDue = sum(MS, m => m.due), msDone = sum(MS, m => m.done);
  register(K(3), () => {
    const r = rng('msmonth');
    const plan = MONTHS.map(() => r.int(7, 13));
    const act = plan.map((v, i) => (i < MONTH_NOW ? Math.max(3, v - r.int(0, 4)) : null));
    return {
      crumbs,
      kpis: [
        { label: 'Milestones in plan', value: String(msTot), sub: `${P.length} projects`, tone: 'blue' },
        { label: 'Due to date', value: String(msDue), sub: 'per baseline programme', tone: 'cyan', pct: (msDue / msTot) * 100 },
        { label: 'Achieved', value: String(msDone), delta: fmt.pct((msDone / msDue) * 100), deltaTone: 'amber', sub: 'of due', tone: 'green', pct: (msDone / msDue) * 100 },
        { label: 'Overdue milestones', value: String(msDue - msDone), delta: '▲ 4 vs Aug', deltaTone: 'red', sub: 'not certified', tone: 'red' },
        { label: 'Forecast late completions', value: String(SCHED.filter(s => s.fc > s.e + 1).length), sub: 'beyond contract date', tone: 'orange' },
      ],
      insight: { finding: `Milestone achievement is <b>${fmt.pct((msDone / msDue) * 100)}</b> of what the baseline programmes require by September. A1 Palapye–Mahalapye Rehab and Maun Hospital Wing account for a third of overdue milestones.`, recommendation: 'Require recovery programmes from both contractors within 14 days.', severity: 'Medium', tone: 'amber' },
      grid: [
        [
          { span: 12, type: 'gantt', title: 'Implementation programme | baseline with physical progress', height: 430, start: 0, end: 60, today: TODAY, labelWidth: 190,
            ticks: [0, 12, 24, 36, 48, 60].map(mLabel),
            tasks: by(SCHED, s => s.s, 1).map(s => ({ name: s.p.name, start: s.s, end: s.e, progress: s.p.physical, tone: ST[s.p.status], label: `${s.p.physical}% · ends ${mLabel(s.fc)}` })) },
        ],
        [
          { span: 4, type: 'bar', title: 'Milestones planned vs achieved | FY 2026-27', height: 260, categories: MONTHS,
            series: [{ name: 'Planned', data: plan, color: '#1E3A5F' }, { name: 'Achieved', data: act, color: 'green' }] },
          { span: 8, type: 'kanban', title: 'Milestone board | current quarter', height: 260,
            columns: [
              { name: 'Not started', tone: 'slate', items: [{ title: 'Phikwe Pipeline · pump station civils', pill: 'Due Oct', tone: 'slate', meta: 'Motswedi' }, { title: 'Ghanzi Labs · roof structure', pill: 'Overdue', tone: 'red', meta: 'Kgalagadi' }] },
              { name: 'In progress', tone: 'blue', items: [{ title: 'Molepolole Clinic · M&E first fix', pill: '58%', tone: 'blue', meta: 'Clement' }, { title: 'A1 Rehab · km 42–60 base course', pill: 'Overdue', tone: 'red', meta: 'Mmila' }, { title: 'Maun Wing · theatre block slab', pill: 'Overdue', tone: 'red', meta: 'Kgalagadi' }] },
              { name: 'Awaiting certification', tone: 'amber', items: [{ title: 'Data Centre · raised floor', pill: 'Engineer', tone: 'amber', meta: 'Chobe ICT' }, { title: 'Hukuntsi Solar · PV array 2', pill: 'Engineer', tone: 'amber', meta: 'Kalahari' }] },
              { name: 'Certified', tone: 'green', items: [{ title: 'Jwaneng Housing · block C handover', pill: 'Done', tone: 'green', meta: 'Tlotlo' }, { title: 'Kazungula Road · drainage', pill: 'Done', tone: 'green', meta: 'Mmila' }] },
            ] },
        ],
      ],
    };
  });

  // ── 4 Physical vs Financial Progress (signature visual) ──
  const flagged = by(P.filter(p => Math.abs(p.gap) > 8), p => Math.abs(p.gap));
  const overpaid = sum(P.filter(p => p.gap > 0), p => p.spent - (p.physical / 100) * p.approved);
  const bigBar = (lbl, v, c) => `<div style="margin-top:14px"><div style="display:flex;justify-content:space-between;font-size:12px;color:${C.body}"><span>${lbl}</span><b style="font-size:22px;color:${c};font-variant-numeric:tabular-nums">${v}%</b></div><div style="height:12px;border-radius:6px;background:${C.border};margin-top:6px;overflow:hidden"><div style="height:100%;width:${v}%;background:${c}"></div></div></div>`;
  register(K(4), () => ({
    crumbs,
    kpis: [
      { label: 'Physical progress', value: fmt.pct(wPhys), sub: 'value-weighted, site measured', tone: 'green', pct: wPhys },
      { label: 'Financial progress', value: fmt.pct(wFin), sub: 'spent ÷ approved', tone: 'violet', pct: wFin },
      { label: 'Portfolio gap', value: `${(wFin - wPhys).toFixed(1)} pts`, delta: 'paid ahead of work', deltaTone: 'red', sub: '', tone: 'amber' },
      { label: 'Projects gap > 10 pts', value: String(P.filter(p => p.gap > 10).length), delta: P.filter(p => p.gap > 10).map(p => p.town).join(', '), deltaTone: 'red', sub: '', tone: 'red' },
      { label: 'Paid ahead of work', value: fmt.bwp(overpaid), delta: 'exposure', deltaTone: 'orange', sub: 'if contractor defaults', tone: 'orange' },
    ],
    insight: { finding: `Maun District Hospital Wing is <b>45% physically complete</b> but <b>78% paid</b>, a 33-point gap worth ${fmt.bwp(maun.spent - 0.45 * maun.approved)} of payments ahead of work. Tsabong Water Treatment and Shakawe Demo Farm show 20-point gaps.`, recommendation: 'Commission an independent quantity surveyor to re-measure Maun, and suspend interim certificates on any project with a gap above 15 points.', severity: 'Critical', tone: 'red', actions: ['Explain finding', 'Order site audit', 'Suspend certificates'] },
    grid: [
      [
        { span: 8, type: 'scatter', title: 'Physical vs financial progress (%)', height: 330, xName: 'Physical progress %', yName: 'Financial %', xMin: 0, xMax: 100, yMin: 0, yMax: 100, diagonal: true, labels: false,
          legend: [['Gap > 20 pts', 'red'], ['10–20 pts', 'orange'], ['Balanced', 'green'], ['Unpaid work', 'cyan']], note: 'Bubble size = approved value. Hover a bubble for the project; dashed line = physical equals financial.',
          points: P.map(p => ({ name: sn(p), x: p.physical, y: p.financial, tone: gapTone(p.gap), size: 8 + Math.sqrt(p.approved / M) * 2.2 })) },
        { span: 4, type: 'html', title: 'Key visual | Maun District Hospital Wing', badge: ['Flag: +33 pts', 'red'],
          html: `<div style="padding:4px 4px 0">
            <div style="font-size:11.5px;color:${C.dim}">PRJ-102 · ${maun.contractor} · approved ${fmt.bwp(maun.approved)}</div>
            ${bigBar('Physical progress', maun.physical, C.green)}
            ${bigBar('Financial spend', maun.financial, C.red)}
            <div style="margin-top:16px;padding:10px 12px;border-radius:8px;background:#2a1215;border:1px solid #7f1d1d;color:#FCA5A5;font-size:12px;line-height:1.5">
              <b>Difference 33 pts.</b> ${fmt.bwp(maun.spent)} paid for work valued at ${fmt.bwp(0.45 * maun.approved)}. Last site measurement 64 days ago.</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px">
              <div style="padding:8px 10px;border-radius:8px;background:#0b1830;border:1px solid #11244a"><div style="font-size:9.5px;color:${C.dim};letter-spacing:.08em">CPI</div><div style="font-size:16px;font-weight:700;color:${C.red}">${cpi(maun).toFixed(2)}</div></div>
              <div style="padding:8px 10px;border-radius:8px;background:#0b1830;border:1px solid #11244a"><div style="font-size:9.5px;color:${C.dim};letter-spacing:.08em">DELAY</div><div style="font-size:16px;font-weight:700;color:${C.amber}">${maun.delayDays} days</div></div>
            </div></div>` },
      ],
      [
        { span: 7, type: 'bar', title: 'Physical vs financial by project (%)', height: 270, rotate: 35, labelMax: 16, categories: P.map(sn),
          series: [{ name: 'Physical', data: P.map(p => p.physical), color: 'green' }, { name: 'Financial', data: P.map(p => p.financial), color: 'violet' }, { name: 'Gap (pts)', type: 'line', data: P.map(p => p.gap), color: 'red', smooth: false }] },
        { span: 5, type: 'table', title: 'Flagged differences (|gap| > 8 pts)', height: 270,
          columns: [{ key: 'n', label: 'Project' }, { key: 'ph', label: 'Phys.', align: 'right' }, { key: 'fi', label: 'Fin.', align: 'right' }, { key: 'g', label: 'Gap', align: 'right' }, { key: 'f', label: 'Flag' }],
          rows: flagged.map(p => ({ n: { strong: sn(p) }, ph: p.physical + '%', fi: p.financial + '%', g: { trend: p.gap > 0 ? 'up' : 'down', text: `${Math.abs(p.gap)} pts`, tone: p.gap > 0 ? 'red' : 'cyan' }, f: p.gap > 0 ? { pill: p.gap > 20 ? 'Overpaid' : 'Paid ahead', tone: p.gap > 20 ? 'red' : 'orange' } : { pill: 'Unpaid work', tone: 'cyan' } })) },
      ],
    ],
  }));

  // ── 5 Schedule Variance ──
  const CAUSES = [['Contractor capacity', 31, 'red'], ['Late IPC payment', 18, 'orange'], ['Design changes', 16, 'violet'], ['Material supply', 14, 'amber'], ['Wayleave / land', 11, 'cyan'], ['Weather', 10, 'blue']];
  const behind = P.filter(p => sv(p) < -5);
  register(K(5), () => {
    const r = rng('scurve');
    const planC = MONTHS.map((_, i) => +(wPlan - (MONTH_NOW - 1 - i) * 3.1 + (i >= MONTH_NOW ? 0 : 0)).toFixed(1));
    const actC = MONTHS.map((_, i) => (i < MONTH_NOW ? +(wPhys - (MONTH_NOW - 1 - i) * r.num(2.2, 2.6)).toFixed(1) : null));
    const spi = sum(P, p => p.physical * p.approved) / sum(P, p => p.planned * p.approved);
    return {
      crumbs,
      kpis: [
        { label: 'Schedule performance (SPI)', value: spi.toFixed(2), delta: '▼ 0.03 vs Aug', deltaTone: 'red', sub: 'earned ÷ planned', tone: spi < 0.9 ? 'red' : 'amber', pct: spi * 100 },
        { label: 'Behind programme', value: `${behind.length} of ${P.length}`, sub: 'more than 5 pts late', tone: 'red', pct: (behind.length / P.length) * 100 },
        { label: 'Average slippage', value: `${(sum(P, p => sv(p)) / P.length).toFixed(1)} pts`, sub: 'physical − planned', tone: 'amber' },
        { label: 'Delay days (total)', value: fmt.n(sum(P, p => p.delayDays)), sub: 'across portfolio', tone: 'orange' },
        { label: 'Extension of time claims', value: '7', delta: '312 days sought', deltaTone: 'amber', sub: '3 granted', tone: 'violet' },
      ],
      insight: { finding: `The portfolio is <b>${(wPlan - wPhys).toFixed(1)} points</b> behind its baseline programme (SPI ${spi.toFixed(2)}). Maun Hospital Wing (−22 pts) and A1 Palapye–Mahalapye (−19 pts) drive most of the slippage; contractor capacity is the leading cause.`, recommendation: 'Invoke the slow-progress clause on Maun and require weekly progress reporting on A1.', severity: 'High', tone: 'orange' },
      grid: [
        [
          { span: 7, type: 'bar', title: 'Schedule variance by project (physical − planned, pts)', height: 300, horizontal: true, labelMax: 22, categories: by(P, sv, 1).map(sn),
            series: [{ name: 'Schedule variance', label: true, data: by(P, sv, 1).map(p => ({ value: sv(p), itemStyle: { color: sv(p) < -15 ? C.red : sv(p) < -5 ? C.amber : C.green } })) }] },
          { span: 5, type: 'line', title: 'Portfolio S-curve | planned vs actual (%)', height: 300, categories: MONTHS,
            series: [{ name: 'Planned', data: planC.map(v => Math.min(100, v)), color: 'cyan', dashed: true }, { name: 'Actual', data: actC, color: 'green', area: true }] },
        ],
        [
          { span: 4, type: 'donut', title: 'Root cause of delay (% of delay days)', height: 260, items: CAUSES.map(([name, value, color]) => ({ name, value, color })) },
          { span: 8, type: 'table', title: 'Delayed projects', height: 260,
            columns: [{ key: 'n', label: 'Project' }, { key: 'pl', label: 'Planned', align: 'right' }, { key: 'ac', label: 'Actual', align: 'right' }, { key: 'sv', label: 'Variance', align: 'right' }, { key: 'dd', label: 'Delay', align: 'right' }, { key: 'c', label: 'Main cause' }, { key: 's', label: 'Schedule rating' }],
            rows: by(behind, sv, 1).map((p, i) => ({ n: { strong: p.name }, pl: p.planned + '%', ac: p.physical + '%', sv: { trend: 'down', text: `${sv(p)} pts`, tone: sv(p) < -15 ? 'red' : 'amber' }, dd: `${p.delayDays} d`, c: CAUSES[i % CAUSES.length][0], s: sv(p) < -15 ? { pill: 'Severe delay', tone: 'red' } : sv(p) < -10 ? { pill: 'Delayed', tone: 'orange' } : { pill: 'Slipping', tone: 'amber' } })) },
        ],
      ],
    };
  });

  // ── 6 Cost Variance & Variation Orders ──
  const VO_REASONS = [['Design change', 'violet'], ['Unforeseen ground conditions', 'orange'], ['Scope addition', 'blue'], ['Price escalation', 'amber'], ['Quantity remeasurement', 'cyan']];
  const VOS = P.flatMap((p, i) => Array.from({ length: p.variations }, (_, j) => { const r = rng('vo' + i + j); return { p, no: `VO-${p.id.slice(4)}-${String(j + 1).padStart(2, '0')}`, reason: VO_REASONS[r.int(0, 4)][0], value: (p.variationValue / p.variations) * [1.35, 0.65, 1.1, 0.9][j % 4] * (p.variations === 1 ? 1 / 1.35 : p.variations === 3 ? 3 / 3.1 : 1), st: r() > 0.55 ? 'Approved' : r() > 0.4 ? 'Pending MTC' : 'Under review' }; }));
  const voTot = sum(P, p => p.variationValue);
  const overVO = P.filter(p => voPct(p) > 10);
  register(K(6), () => ({
    crumbs,
    kpis: [
      { label: 'Variation orders', value: String(VOS.length), sub: `${P.filter(p => p.variations).length} projects`, tone: 'blue' },
      { label: 'VO value', value: fmt.bwp(voTot), delta: fmt.pct((voTot / TOT.approved) * 100, 1), deltaTone: 'amber', sub: 'of approved', tone: 'violet', pct: (voTot / TOT.approved) * 100 },
      { label: 'Above 10% threshold', value: `${overVO.length} of ${P.length}`, delta: `${P.filter(p => voPct(p) > 15).length} above 15%`, deltaTone: 'red', sub: 'need re-adjudication', tone: 'red' },
      { label: 'Forecast at completion', value: fmt.bwp(TOT.approved + voTot), delta: `▲ ${fmt.bwp(voTot)}`, deltaTone: 'red', sub: 'vs approved', tone: 'orange' },
      { label: 'Pending approval', value: String(VOS.filter(v => v.st !== 'Approved').length), sub: 'awaiting tender committee', tone: 'amber' },
    ],
    insight: { finding: `Variation orders now add <b>${fmt.bwp(voTot)}</b> (${fmt.pct((voTot / TOT.approved) * 100, 1)}) to the approved portfolio. A1 Palapye–Mahalapye Rehab carries ${fmt.bwp(P[6].variationValue)} in VOs, and <b>${overVO.length} projects</b> have cumulative VOs above the 10% threshold that requires fresh adjudication; Kazungula Link Road is highest at ${fmt.pct(voPct(P[7]), 1)}.`, recommendation: 'Route all cumulative VOs above 10% to the Ministerial Tender Committee before further certification.', severity: 'High', tone: 'orange' },
    grid: [
      [
        { span: 7, type: 'waterfall', title: 'Approved to forecast final cost (BWP M)', height: 290, min: 400,
          steps: [{ name: 'Approved', value: m1(TOT.approved), total: true }, ...VO_REASONS.map(([n]) => ({ name: { 'Design change': 'Design', 'Unforeseen ground conditions': 'Ground', 'Scope addition': 'Scope', 'Price escalation': 'Escalation', 'Quantity remeasurement': 'Remeasure' }[n], value: +(sum(VOS.filter(v => v.reason === n), v => v.value) / M).toFixed(1) })), { name: 'Savings', value: -3.8 }, { name: 'Forecast', value: +(m1(TOT.approved + voTot) - 3.8).toFixed(1), total: true }] },
        { span: 5, type: 'donut', title: 'VO value by reason', height: 290, valueFmt: fmt.bwp, items: VO_REASONS.map(([n, c]) => ({ name: n, value: Math.round(sum(VOS.filter(v => v.reason === n), v => v.value)), color: c })) },
      ],
      [
        { span: 5, type: 'bar', title: 'Cumulative VOs as % of contract | limit 10%', height: 270, horizontal: true, labelMax: 20, categories: by(P, voPct).map(sn),
          series: [{ name: 'VO %', data: by(P, voPct).map(p => ({ value: +voPct(p).toFixed(1), itemStyle: { color: voPct(p) > 15 ? C.red : voPct(p) > 10 ? C.orange : C.blue } })), label: true }] },
        { span: 7, type: 'table', title: 'Variation order register', height: 270,
          columns: [{ key: 'no', label: 'VO' }, { key: 'n', label: 'Project' }, { key: 'r', label: 'Reason' }, { key: 'v', label: 'Value', align: 'right' }, { key: 's', label: 'Status' }],
          rows: by(VOS, v => v.value).map(v => ({ no: v.no, n: sn(v.p), r: v.reason, v: fmt.n(Math.round(v.value)), s: { pill: v.st, tone: v.st === 'Approved' ? 'green' : v.st === 'Pending MTC' ? 'amber' : 'blue' } })) },
      ],
    ],
  }));

  // ── 7 Contractor Performance ──
  const CONTR = [...new Set(P.map(p => p.contractor))].map((name, i) => {
    const ps = P.filter(p => p.contractor === name); const r = rng('ctr' + i);
    const time = clamp(Math.round(85 + sum(ps, sv) / ps.length * 2.2));
    const cost = clamp(Math.round(92 - Math.max(0, sum(ps, p => p.gap) / ps.length) * 2 - sum(ps, voPct) / ps.length));
    const quality = r.int(58, 92), hs = r.int(62, 95), comp = r.int(55, 96);
    const score = Math.round(time * 0.3 + cost * 0.25 + quality * 0.25 + hs * 0.1 + comp * 0.1);
    return { name, ps, value: sum(ps, p => p.committed), spent: sum(ps, p => p.spent), time, cost, quality, hs, comp, score, lds: time < 60 ? r.int(1, 4) * 120000 : 0 };
  });
  const cBest = by(CONTR, c => c.score)[0], cWorst = by(CONTR, c => c.score, 1)[0];
  register(K(7), () => ({
    crumbs,
    kpis: [
      { label: 'Active contractors', value: String(CONTR.length), sub: `${P.length} contracts`, tone: 'blue' },
      { label: 'Average score', value: `${Math.round(sum(CONTR, c => c.score) / CONTR.length)} / 100`, delta: '▲ 2 vs FY25', sub: '', tone: 'cyan', pct: sum(CONTR, c => c.score) / CONTR.length },
      { label: 'On watchlist (< 65)', value: String(CONTR.filter(c => c.score < 65).length), delta: 'probation', deltaTone: 'red', sub: '', tone: 'red' },
      { label: 'Liquidated damages', value: fmt.bwp(sum(CONTR, c => c.lds)), sub: 'applied YTD', tone: 'orange' },
      { label: 'Concentration', value: 'Tlotlo 3 sites', delta: fmt.bwp(sum(P.filter(p => p.contractor === 'Tlotlo Civil Works'), p => p.committed)), deltaTone: 'amber', sub: 'capacity risk', tone: 'amber' },
    ],
    insight: { finding: `<b>${cWorst.name}</b> scores ${cWorst.score}/100, the lowest in the portfolio, driven by time performance on ${cWorst.ps.map(sn).join(' and ')}. ${cBest.name} leads at ${cBest.score}.`, recommendation: `Place ${cWorst.name} on probation and weight past performance at 20% in the next evaluations.`, severity: 'Medium', tone: 'amber' },
    grid: [
      [
        { span: 7, type: 'table', title: 'Contractor league table', height: 300,
          columns: [{ key: 'r', label: '#' }, { key: 'n', label: 'Contractor' }, { key: 'k', label: 'Contracts', align: 'right' }, { key: 'v', label: 'Value (M)', align: 'right' }, { key: 't', label: 'Time' }, { key: 's', label: 'Score', align: 'right' }, { key: 'g', label: 'Rating' }],
          rows: by(CONTR, c => c.score).map((c, i) => ({ r: i + 1, n: { strong: c.name }, k: c.ps.length, v: fmt.m(c.value), t: { bar: c.time, tone: c.time < 60 ? 'red' : 'green' }, s: String(c.score), g: c.score >= 75 ? { pill: 'Good', tone: 'green' } : c.score >= 65 ? { pill: 'Fair', tone: 'amber' } : { pill: 'Watchlist', tone: 'red' } })) },
        { span: 5, type: 'radar', title: 'Best vs weakest contractor', height: 300, indicators: ['Time', 'Cost', 'Quality', 'Health & safety', 'Compliance'].map(n => ({ name: n, max: 100 })),
          series: [cBest, cWorst].map((c, i) => ({ name: c.name, values: [c.time, c.cost, c.quality, c.hs, c.comp], color: i ? 'red' : 'green' })) },
      ],
      [
        { span: 6, type: 'bar', title: 'Contract value by contractor | paid vs outstanding (BWP M)', height: 250, rotate: 25, labelMax: 16, categories: by(CONTR, c => c.value).map(c => c.name),
          series: [{ name: 'Paid', data: by(CONTR, c => c.value).map(c => m1(c.spent)), stack: 'v', color: 'blue' }, { name: 'Outstanding', data: by(CONTR, c => c.value).map(c => m1(c.value - c.spent)), stack: 'v', color: '#1E3A5F' }] },
        { span: 6, type: 'list', title: 'Performance notices issued', height: 250,
          items: [
            { title: 'Kgalagadi Builders · slow progress notice', meta: 'Maun Hospital Wing · 45% vs 67% planned', pill: 'Notice 2', tone: 'red' },
            { title: 'Mmila Road Contractors · recovery programme', meta: 'A1 Palapye–Mahalapye · 19 pts behind', pill: 'Notice 1', tone: 'orange' },
            { title: 'Kalahari Energy Systems · key staff replaced', meta: 'Letlhakane Substation · site agent absent', pill: 'Warning', tone: 'amber' },
            { title: 'Tlotlo Civil Works · H&S incident report', meta: 'Tsabong Water · scaffold fall, no injury', pill: 'H&S', tone: 'amber' },
            { title: 'Clement Pty Ltd · commendation', meta: 'Molepolole Clinic · zero defects at M&E inspection', pill: 'Positive', tone: 'green' },
          ] },
      ],
    ],
  }));

  // ── 8 Payments & Claims ──
  const FY_CERT = 86.4 * M;
  register(K(8), () => {
    const r = rng('ipc');
    const w = MONTHS.slice(0, MONTH_NOW).map(() => r.num(0.7, 1.35)); const ws = w.reduce((a, b) => a + b, 0);
    const cert = w.map(v => (FY_CERT * v) / ws);
    const paid = cert.map((v, i) => v * (i < MONTH_NOW - 1 ? r.num(0.86, 1.02) : 0.58));
    let cc = 0, cp = 0;
    const IPC = P.filter(p => p.status !== 'Near completion').slice(0, 9).map((p, i) => { const q = rng('ipcrow' + i); const age = q.int(6, 74); return { p, no: `IPC-${q.int(8, 22)}`, amt: q.num(0.6, 3.8) * M, age }; });
    const pendingAmt = sum(IPC, x => x.amt);
    return {
      crumbs,
      kpis: [
        { label: 'Certified FY to date', value: fmt.bwp(FY_CERT), sub: 'interim payment certificates', tone: 'blue' },
        { label: 'Paid FY to date', value: fmt.bwp(sum(paid, v => v)), delta: fmt.pct((sum(paid, v => v) / FY_CERT) * 100), sub: 'of certified', tone: 'violet', pct: (sum(paid, v => v) / FY_CERT) * 100 },
        { label: 'Certificates pending', value: String(IPC.length), delta: fmt.bwp(pendingAmt), deltaTone: 'amber', sub: 'awaiting payment', tone: 'amber' },
        { label: 'Avg days to pay IPC', value: '38', delta: '▲ 10 over 28-day term', deltaTone: 'red', sub: '', tone: 'red' },
        { label: 'Retention held', value: fmt.bwp(TOT.spent * 0.05), sub: '5% of certified value', tone: 'cyan' },
      ],
      insight: { finding: `<b>${IPC.filter(x => x.age > 28).length} certificates</b> are past the 28-day contractual payment term, exposing government to interest claims. Contractors have already lodged BWP 2.9M in interest-on-late-payment claims this year.`, recommendation: 'Prioritise overdue IPCs in the next payment run and escalate Treasury cash release for capital votes.', severity: 'High', tone: 'orange', actions: ['Explain finding', 'Open IPC list', 'Notify Accountant General'] },
      grid: [
        [
          { span: 8, type: 'bar', title: 'Certified vs paid by month with cumulative (BWP M)', height: 280, categories: MONTHS.slice(0, MONTH_NOW), y2: ' ',
            series: [{ name: 'Certified', data: cert.map(m1), color: '#1E3A5F' }, { name: 'Paid', data: paid.map(m1), color: 'blue' }, { name: 'Cum. certified', type: 'line', axis: 1, data: cert.map(v => m1((cc += v))), color: 'cyan', dashed: true }, { name: 'Cum. paid', type: 'line', axis: 1, data: paid.map(v => m1((cp += v))), color: 'amber' }] },
          { span: 4, type: 'funnel', title: 'Contractor claims pipeline (count)', height: 280, items: [{ name: 'Lodged', value: 34 }, { name: 'Assessed', value: 27 }, { name: 'Agreed', value: 15 }, { name: 'Approved', value: 11 }, { name: 'Paid', value: 8 }] },
        ],
        [
          { span: 7, type: 'table', title: 'Interim payment certificates awaiting payment', height: 260,
            columns: [{ key: 'no', label: 'Certificate' }, { key: 'n', label: 'Project' }, { key: 'c', label: 'Contractor' }, { key: 'a', label: 'Amount', align: 'right' }, { key: 'd', label: 'Age', align: 'right' }, { key: 's', label: 'Status' }],
            rows: by(IPC, x => x.age).map(x => ({ no: x.no, n: sn(x.p), c: x.p.contractor, a: fmt.n(Math.round(x.amt)), d: `${x.age} d`, s: x.age > 45 ? { pill: 'Interest risk', tone: 'red' } : x.age > 28 ? { pill: 'Overdue', tone: 'orange' } : { pill: 'Within term', tone: 'green' } })) },
          { span: 5, type: 'donut', title: 'Claims by type (BWP M)', height: 260, valueFmt: v => `BWP ${v}M`, items: [{ name: 'Extension of time', value: 6.8 }, { name: 'Additional works', value: 4.9 }, { name: 'Late-payment interest', value: 2.9, color: 'red' }, { name: 'Disruption', value: 2.1 }, { name: 'Price adjustment', value: 1.6 }] },
        ],
      ],
    };
  });

  // ── 9 GIS Project Map ──
  const PIN_OFF = { 'Kazungula Link Road': [0.75, -0.15] }; // two projects in Kasane
  const towns = [...new Set(P.map(p => p.town))];
  register(K(9), () => ({
    crumbs: [...crumbs, 'GIS'],
    kpis: [
      { label: 'Projects geo-tagged', value: `${P.length} of ${P.length}`, sub: 'site coordinates verified', tone: 'green', pct: 100 },
      { label: 'Districts covered', value: String(towns.length), sub: 'towns and villages', tone: 'blue' },
      { label: 'Largest site value', value: 'Palapye', delta: fmt.bwp(P[6].approved), deltaTone: 'blue', sub: 'A1 road', tone: 'violet' },
      { label: 'Critical / at-risk sites', value: String(atRisk.length), delta: fmt.bwp(sum(atRisk, p => p.approved)), deltaTone: 'red', sub: 'approved value', tone: 'red' },
      { label: 'Remote sites (> 500 km)', value: '6', sub: 'from Gaborone HQ', tone: 'amber' },
    ],
    insight: { finding: 'Four of the five at-risk projects are in remote districts (Maun, Ghanzi, Tsabong, Shakawe) more than 500 km from Gaborone, where the last engineer site visit averages <b>71 days</b> ago.', recommendation: 'Station a regional clerk of works in Maun covering the north-west cluster.', severity: 'Medium', tone: 'amber' },
    grid: [
      [
        { span: 8, type: 'map', title: 'Project sites | status and value', height: 440, legend: [['On track', 'green'], ['Near completion', 'cyan'], ['At risk', 'amber'], ['Critical', 'red']],
          pins: P.map(p => { const o = PIN_OFF[p.name] || [0, 0]; return { name: `${p.name === 'Kazungula Link Road' ? 'Kazungula' : p.town} | ${p.name}`, lon: p.lon + o[0], lat: p.lat + o[1], tone: ST[p.status], size: 8 + Math.sqrt(p.approved / M) * 1.6, meta: `${p.town} · ${p.ministry}<br>Approved ${fmt.bwp(p.approved)} · spent ${fmt.bwp(p.spent)}<br>Physical ${p.physical}% · ${p.status}` }; }) },
        { span: 4, type: 'list', title: 'Sites by status', height: 440,
          items: [...P].sort((a, b) => ['Critical', 'At risk', 'Near completion', 'On track'].indexOf(a.status) - ['Critical', 'At risk', 'Near completion', 'On track'].indexOf(b.status)).map(p => ({ title: p.name, meta: `${p.town} · ${p.physical}% built · ${fmt.bwp(p.approved)}`, pill: p.status, tone: ST[p.status] })) },
      ],
      [
        { span: 12, type: 'bar', title: 'Investment by location (BWP M)', height: 220, categories: by(towns, t => sum(P.filter(p => p.town === t), p => p.approved)),
          series: [{ name: 'Spent', stack: 't', color: 'blue', data: by(towns, t => sum(P.filter(p => p.town === t), p => p.approved)).map(t => m1(sum(P.filter(p => p.town === t), p => p.spent))) }, { name: 'Remaining', stack: 't', color: '#1E3A5F', data: by(towns, t => sum(P.filter(p => p.town === t), p => p.approved)).map(t => m1(sum(P.filter(p => p.town === t), p => p.approved - p.spent))) }] },
      ],
    ],
  }));

  // ── 10 Handover, Defects & Disposal ──
  const DLP = [
    ['Kasane Health Post Upgrade', 'Practical completion due', 'Motswedi Construction', 14, 3, 'Oct 2026'],
    ['Tlokweng Clinic Extension', 'Defects liability', 'Clement Pty Ltd', 9, 7, 'Mar 2027'],
    ['Mogoditshane Police Station', 'Defects liability', 'Tlotlo Civil Works', 22, 11, 'Dec 2026'],
    ['Nata Junior School Hostel', 'Final account', 'Letsatsi Engineering', 4, 4, 'Closed'],
    ['Tonota Water Tower', 'Defects liability', 'Motswedi Construction', 17, 6, 'Jan 2027'],
    ['Sowa Solar Street Lights', 'Retention release', 'Kalahari Energy Systems', 2, 2, 'Sep 2026'],
    ['Old Gaborone Records Centre', 'Disposal (demolition)', 'Board of Survey', 0, 0, 'Pending'],
  ];
  register(K(10), () => ({
    crumbs,
    kpis: [
      { label: 'In defects liability', value: '4', sub: '12-month DLP', tone: 'blue' },
      { label: 'Open defects', value: String(sum(DLP, d => d[3] - d[4])), delta: `${sum(DLP, d => d[3])} logged`, sub: '', tone: 'amber' },
      { label: 'Retention to release', value: 'BWP 3.1M', sub: 'on DLP expiry', tone: 'cyan' },
      { label: 'Assets capitalised', value: 'BWP 64.2M', delta: '▲ Kasane pending', deltaTone: 'blue', sub: 'transferred to asset register', tone: 'green' },
      { label: 'Final accounts overdue', value: '2', delta: '> 6 months', deltaTone: 'red', sub: '', tone: 'red' },
    ],
    insight: { finding: 'Mogoditshane Police Station has <b>11 of 22</b> defects still open with 3 months of the liability period left; the contractor has not attended site since June.', recommendation: 'Issue a notice to rectify and prepare to use retention (BWP 0.9M) to engage a third party.', severity: 'Medium', tone: 'amber' },
    grid: [
      [
        { span: 12, type: 'steps', title: 'Close-out lifecycle | Kasane Health Post Upgrade (PRJ-104)',
          steps: [{ name: 'Practical completion', state: 'current', meta: '88% · due Oct' }, { name: 'Snag list', state: 'pending', meta: '14 items' }, { name: 'Handover to Health', state: 'pending', meta: '' }, { name: 'Defects liability', state: 'pending', meta: '12 months' }, { name: 'Final account', state: 'pending', meta: '' }, { name: 'Retention release', state: 'pending', meta: 'BWP 0.3M' }, { name: 'Capitalise asset', state: 'pending', meta: 'to Asset Register' }, { name: 'Closure & audit', state: 'pending', meta: '' }] },
      ],
      [
        { span: 7, type: 'bar', title: 'Defects by trade | open vs closed', height: 260, categories: ['Structural', 'Roofing', 'Electrical', 'Plumbing', 'Mechanical / HVAC', 'Finishes', 'External works'],
          series: [{ name: 'Closed', stack: 'd', color: 'green', data: [3, 5, 9, 7, 2, 12, 4] }, { name: 'Open', stack: 'd', color: 'red', data: [2, 3, 6, 5, 4, 7, 2] }] },
        { span: 5, type: 'gauge', title: 'Close-out performance', height: 260, gauges: [{ name: 'Defects fixed ≤ 14 d', value: 58 }, { name: 'Handover docs complete', value: 83 }] },
      ],
      [
        { span: 12, type: 'table', title: 'Completed and closing projects', height: 240,
          columns: [{ key: 'n', label: 'Project' }, { key: 'st', label: 'Stage' }, { key: 'c', label: 'Contractor' }, { key: 'l', label: 'Defects logged', align: 'right' }, { key: 'x', label: 'Closed' }, { key: 'e', label: 'DLP ends' }],
          rows: DLP.map(([n, st, c, l, x, e]) => ({ n: { strong: n }, st: { pill: st, tone: st.startsWith('Disposal') ? 'slate' : st === 'Defects liability' ? 'amber' : st === 'Practical completion due' ? 'blue' : 'green' }, c, l, x: l ? { bar: (x / l) * 100, tone: x / l < 0.5 ? 'red' : 'green', text: `${x}/${l}` } : '—', e })) },
      ],
    ],
  }));

  // ── 11 Risks & Anomalies ──
  const LIK = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost certain'], IMP = ['Minor', 'Moderate', 'Major', 'Severe', 'Critical'];
  const RISKMAP = [[4, 1, 0, 0, 0], [3, 5, 3, 1, 0], [1, 4, 6, 3, 1], [0, 2, 4, 3, 2], [0, 0, 1, 2, 1]];
  const ANOM = [
    ['Payment ahead of physical progress', 'Maun Hospital Wing · 78% paid vs 45% built', fmt.bwp(maun.spent - 0.45 * maun.approved), 'Critical', 'red'],
    ['Cumulative VOs above 10%', 'A1 Palapye–Mahalapye · 10.6% of contract', fmt.bwp(P[6].variationValue), 'High', 'orange'],
    ['Certificate paid without engineer sign-off', 'IPC-14 · Tsabong Water Treatment', 'BWP 1,180,000', 'High', 'orange'],
    ['Contractor on 3 concurrent sites', 'Tlotlo Civil Works · Francistown, Tsabong, Jwaneng', fmt.bwp(sum(P.filter(p => p.contractor === 'Tlotlo Civil Works'), p => p.committed)), 'Medium', 'amber'],
    ['Advance paid, no site activity > 60 days', 'Ghanzi Senior School Labs', 'BWP 1,430,000', 'High', 'orange'],
    ['Paid ahead of progress', 'Shakawe Demo Farm · 60% paid vs 40% built', 'BWP 1,920,000', 'Medium', 'amber'],
    ['Expired performance bond', 'Letlhakane Substation', 'BWP 2,100,000', 'Medium', 'amber'],
  ];
  register(K(11), () => ({
    crumbs,
    kpis: [
      { label: 'Open risks', value: String(sum(RISKMAP.flat(), v => v)), sub: 'project risk registers', tone: 'blue' },
      { label: 'High / extreme', value: String(RISKMAP.reduce((s, row, y) => s + row.reduce((a, v, x) => a + (x + y >= 6 ? v : 0), 0), 0)), delta: '▲ 3 vs Aug', deltaTone: 'red', sub: '', tone: 'red' },
      { label: 'Anomalies flagged', value: String(ANOM.length), sub: 'AI rules this month', tone: 'orange' },
      { label: 'Value at risk', value: fmt.bwp(overpaid + 3.5 * M), sub: 'overpayment + bonds', tone: 'amber' },
      { label: 'Mitigations overdue', value: '9', sub: 'past action date', tone: 'violet' },
    ],
    insight: { finding: 'The strongest anomaly is on Maun District Hospital Wing: payments are <b>33 points ahead</b> of physical progress while the contractor is under a slow-progress notice, a pattern associated with front-loaded certificates.', recommendation: 'Refer Maun certificates IPC-9 to IPC-14 to the Chief Internal Auditor.', severity: 'Critical', tone: 'red', actions: ['Explain finding', 'Refer to audit', 'Assign officer'] },
    grid: [
      [
        { span: 5, type: 'heatmap', title: 'Risk heat map | likelihood × impact (count)', height: 300, x: IMP, y: LIK, min: 0, max: 6, colors: ['#0f2a4d', '#1D4ED8', '#F59E0B', '#EF4444'],
          values: RISKMAP.flatMap((row, y) => row.map((v, x) => [x, y, v])) },
        { span: 7, type: 'bar', title: 'Open risks by category and rating', height: 300, horizontal: true, labelMax: 22, categories: ['Contractor performance', 'Cost overrun', 'Schedule', 'Payment / cash flow', 'Design', 'Land & wayleave', 'Health & safety', 'Fraud & integrity'],
          series: [{ name: 'Low', stack: 'r', color: 'green', data: [2, 3, 2, 1, 3, 2, 3, 0] }, { name: 'Medium', stack: 'r', color: 'amber', data: [4, 3, 4, 3, 2, 2, 1, 1] }, { name: 'High', stack: 'r', color: 'red', data: [4, 3, 3, 2, 1, 1, 0, 2] }] },
      ],
      [
        { span: 12, type: 'table', title: 'Anomaly queue', height: 270,
          columns: [{ key: 'rule', label: 'Rule triggered' }, { key: 'ctx', label: 'Project / evidence' }, { key: 'amt', label: 'Exposure', align: 'right' }, { key: 'sev', label: 'Severity' }, { key: 'own', label: 'Assigned to' }],
          rows: ANOM.map(([rule, ctx, amt, sev, t], i) => ({ rule: { strong: rule }, ctx, amt, sev: { pill: sev, tone: t }, own: OFFICERS[[4, 3, 8, 2, 4, 5, 3][i]] })) },
      ],
    ],
  }));
})();
