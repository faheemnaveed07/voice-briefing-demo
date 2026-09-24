/* Menu 8: Procurement Complaints CRM (menu index 7).
 * Lifecycle: Received > classification > assignment > investigation > response > resolution > appeal > closure.
 * FY 2026-27 year to date (Apr–Sep). 1,286 complaints received; AI clusters them into systemic themes.
 */
(function () {
  const { register, fmt, rng } = DASH;
  const { MONTHS, MONTH_NOW, SUPPLIERS, TOWNS } = DASH.data;
  const K = n => `7-${n}`;
  const crumbs = ['All procuring entities', 'Complaints CRM', 'FY 2026-27 YTD'];
  const YTD = MONTHS.slice(0, MONTH_NOW);
  const sum = (arr, f) => arr.reduce((s, x) => s + (f ? f(x) : x), 0);
  const pct = (a, b, d = 0) => fmt.pct((a / b) * 100, d);

  // ── Volumes ──
  const RECV = [186, 204, 231, 219, 247, 199];
  const CLOSED = [121, 158, 172, 169, 176, 141];
  const TOTAL = sum(RECV), CLOSED_YTD = sum(CLOSED);
  const SLA = 21; // working-day resolution standard
  const CHANNELS = [['Portal', 0.46, 'blue'], ['Email', 0.21, 'cyan'], ['PPADB referral', 0.14, 'violet'], ['Hotline', 0.10, 'amber'], ['Walk-in', 0.09, 'green']];
  const chanM = CHANNELS.map(([name, share], ci) => ({ name, data: RECV.map((v, m) => Math.round(v * share * rng('ch' + ci + m).num(0.85, 1.15))) }));

  // Classification categories (sum = 1,286)
  const CATS = [
    ['Late payment to suppliers', 312, 'red'], ['Bid specification bias', 187, 'orange'], ['Evaluation not disclosed', 164, 'amber'], ['Unfair disqualification', 149, 'violet'],
    ['Contract cancellation', 96, 'pink'], ['Delayed award notification', 88, 'blue'], ['Conflict of interest', 71, 'cyan'], ['Tender document fees', 63, 'teal'],
    ['Contract variation disputes', 58, 'sky'], ['Bid security / guarantee issues', 41, 'green'], ['Solicitation allegation', 34, 'red'], ['Other', 23, 'slate'],
  ].map(([name, n, tone], i) => { const r = rng('cat' + i); return { name, n, tone, resolved: Math.round(r.num(0.58, 0.86) * 100), days: +r.num(11, 29).toFixed(1), subst: Math.round(r.num(25, 64)) }; });
  CATS[0].resolved = 64; CATS[0].days = 24.6; CATS[0].subst = 71;

  // Procuring entities (sum = 1,286) with tenders issued YTD
  const ENTITIES = [
    ['Ministry of Health', 347, 520], ['Ministry of Transport', 198, 286], ['Ministry of Education', 164, 331], ['Ministry of Water', 98, 174], ['Ministry of Agriculture', 87, 203],
    ['Gaborone City Council', 83, 148], ['Ministry of ICT', 72, 96], ['Ministry of Energy', 61, 118], ['Central District Council', 52, 139], ['Ministry of Defence', 44, 121],
    ['Francistown City Council', 41, 87], ['Water Utilities Corporation', 39, 102],
  ].map(([name, n, tenders], i) => { const r = rng('ent' + i); const open = Math.round(n * r.num(0.2, 0.34)); return { name, n, tenders, open, closed: n - open, per100: (n / tenders) * 100, overdue: Math.round(open * r.num(0.15, 0.4)) }; });

  const STAGE_COUNTS = [['Received', 42, 'slate'], ['Classified', 38, 'cyan'], ['Assigned', 61, 'blue'], ['Investigation', 118, 'violet'], ['Response', 44, 'amber'], ['Resolved', 27, 'green'], ['Appeal', 19, 'orange']];
  const OPEN = sum(STAGE_COUNTS, s => s[1]);
  const OVERDUE = 96;

  const INVESTIGATORS = ['K. Molefe', 'T. Sebego', 'L. Kgosi', 'B. Mooketsi', 'N. Tau', 'O. Seretse', 'P. Dintwe', 'M. Ramotswa', 'G. Phiri', 'D. Modise', 'S. Masire', 'R. Khama'];

  // Complaint records for queues and registers
  const STAGES = ['Received', 'Classified', 'Assigned', 'Investigation', 'Response', 'Resolved', 'Appeal'];
  const pickW = (r, items, w) => { let x = r() * sum(w); for (let i = 0; i < items.length; i++) { x -= w[i]; if (x <= 0) return items[i]; } return items[items.length - 1]; };
  const REC = Array.from({ length: 60 }, (_, i) => {
    const r = rng('cmp' + i);
    const cat = pickW(r, CATS, CATS.map(c => c.n));
    const ent = pickW(r, ENTITIES, ENTITIES.map(e => e.n));
    const stage = pickW(r, STAGES, STAGE_COUNTS.map(s => s[1]));
    const si = STAGES.indexOf(stage);
    const age = Math.round(si * 6 + r.num(1, 14) + (r() > 0.78 ? r.num(15, 70) : 0));
    const prio = cat.name === 'Solicitation allegation' || cat.name === 'Conflict of interest' ? 'Critical' : age > SLA + 20 ? 'High' : r() > 0.6 ? 'Medium' : 'Low';
    const day = 23 - Math.min(22, Math.floor(age / 7));
    return {
      id: `CMP-26-${String(1400 - i * 7).padStart(5, '0')}`, cat: cat.name, entity: ent.name, supplier: r.pick(SUPPLIERS), channel: pickW(r, CHANNELS.map(c => c[0]), CHANNELS.map(c => c[1])),
      stage, age, prio, officer: si >= 2 ? r.pick(INVESTIGATORS) : 'Unassigned', tender: `${['MOH', 'MTC', 'MOE', 'MWS', 'MOA', 'GCC'][r.int(0, 5)]}/${['CON', 'SUP', 'SRV', 'ICT'][r.int(0, 3)]}/${r.int(100, 2999)}/26`,
      date: age < 22 ? `${String(Math.max(1, 23 - age)).padStart(2, '0')} Sep` : `${String(r.int(1, 28)).padStart(2, '0')} ${YTD[Math.max(0, 5 - Math.ceil(age / 30))]}`, conf: Math.round(r.num(58, 99)), day,
    };
  });
  const SHORT = { 'Late payment to suppliers': 'Late payment', 'Bid specification bias': 'Spec bias', 'Evaluation not disclosed': 'Evaluation secrecy', 'Unfair disqualification': 'Unfair DQ', 'Contract cancellation': 'Cancellation', 'Delayed award notification': 'Late award' };
  const PRIO_TONE = { Critical: 'red', High: 'orange', Medium: 'amber', Low: 'blue' };
  const STAGE_TONE = Object.fromEntries(STAGE_COUNTS.map(s => [s[0], s[2]]));
  const prioPill = c => ({ pill: c.prio, tone: PRIO_TONE[c.prio] });
  const agePill = a => ({ pill: `${a} d`, tone: a > 60 ? 'red' : a > SLA ? 'orange' : a > 14 ? 'amber' : 'green' });

  // ── 0 Overview ──
  register(K(0), () => ({
    crumbs,
    kpis: [
      { label: 'Complaints received', value: fmt.n(TOTAL), delta: '▲ 18% vs LY', deltaTone: 'amber', sub: 'FY to date', tone: 'blue' },
      { label: 'Open', value: `${OPEN}`, sub: 'across 7 stages', tone: 'violet', pct: (OPEN / TOTAL) * 100 },
      { label: 'Resolution rate', value: pct(CLOSED_YTD, TOTAL), delta: '▲ 4 pts', sub: `${fmt.n(CLOSED_YTD)} closed`, tone: 'green', pct: (CLOSED_YTD / TOTAL) * 100 },
      { label: 'Overdue (> 21 days)', value: `${OVERDUE}`, delta: '▲ 12 this week', deltaTone: 'red', sub: '28% of open', tone: 'red', pct: (OVERDUE / OPEN) * 100 },
      { label: 'Avg days to resolve', value: '17.4', delta: '▼ 2.1 days', deltaTone: 'green', sub: 'target 21', tone: 'cyan' },
    ],
    insight: { finding: 'AI clustering shows <b>late payment to suppliers</b> is the largest systemic theme: 312 complaints (24%), 58% of them against the Ministry of Health, most citing invoices older than 30 days.', recommendation: 'Treat this as a payment-process failure, not individual complaints: link to the Budget "Committed vs Paid" ageing list and brief the Accountant General.', severity: 'High', tone: 'orange', actions: ['Explain finding', 'Open theme', 'Create task'] },
    grid: [
      [{ span: 12, type: 'steps', title: 'Complaint lifecycle | open complaints by stage', steps: [
        ...STAGE_COUNTS.map(([name, n], i) => ({ name: ['Received', 'Classification', 'Assignment', 'Investigation', 'Response', 'Resolution', 'Appeal'][i], meta: `${n} open`, state: name === 'Investigation' ? 'current' : name === 'Appeal' ? 'late' : 'done' })),
        { name: 'Closure', meta: `${fmt.n(CLOSED_YTD)} closed`, state: 'done' },
      ] }],
      [
        { span: 8, type: 'bar', title: 'Received vs closed per month with open backlog', height: 270, categories: YTD, y2: ' ',
          series: [{ name: 'Received', data: RECV, color: 'blue' }, { name: 'Closed', data: CLOSED, color: 'green' }, { name: 'Open backlog (right)', type: 'line', axis: 1, data: RECV.map((_, i) => sum(RECV.slice(0, i + 1)) - sum(CLOSED.slice(0, i + 1))), color: 'amber' }] },
        { span: 4, type: 'donut', title: 'Complaints by category', height: 270, center: fmt.n(TOTAL), items: [...CATS.slice(0, 6).map(c => ({ name: c.name, value: c.n, color: c.tone })), { name: 'Other 6 categories', value: sum(CATS.slice(6), c => c.n), color: '#334155' }] },
      ],
      [
        { span: 6, type: 'table', title: 'Top procuring entities', height: 250,
          columns: [{ key: 'n', label: 'Entity' }, { key: 'c', label: 'Complaints', align: 'right' }, { key: 'o', label: 'Open', align: 'right' }, { key: 'od', label: 'Overdue', align: 'right' }, { key: 'r', label: 'Resolved' }],
          rows: ENTITIES.slice(0, 8).map(e => ({ n: e.name, c: e.n, o: e.open, od: e.overdue, r: { bar: (e.closed / e.n) * 100, tone: e.closed / e.n < 0.7 ? 'amber' : 'green' } })) },
        { span: 6, type: 'list', title: 'Critical open complaints', height: 250, items: REC.filter(c => c.prio === 'Critical' || c.age > 60).slice(0, 6).map(c => ({ title: `${c.id} · ${c.cat}`, meta: `${c.entity} · ${c.supplier} · ${c.stage}`, pill: `${c.age} d`, tone: PRIO_TONE[c.prio] })) },
      ],
    ],
  }));

  // ── 1 Complaints Received ──
  register(K(1), () => ({
    crumbs,
    kpis: [
      { label: 'Received YTD', value: fmt.n(TOTAL), sub: 'Apr–Sep', tone: 'blue' },
      { label: 'Received this month', value: `${RECV[5]}`, delta: '▼ 19% vs Aug', deltaTone: 'green', sub: 'to 23 Sep', tone: 'cyan' },
      { label: 'Via e-procurement portal', value: '46%', delta: '▲ 9 pts', sub: 'self-service', tone: 'violet', pct: 46 },
      { label: 'Anonymous', value: '11%', sub: 'hotline + walk-in', tone: 'amber', pct: 11 },
      { label: 'Duplicates merged', value: '74', sub: 'same tender, same issue', tone: 'slate' },
    ],
    insight: { finding: 'August peaked at <b>247 complaints</b>, driven by 61 complaints on the MTC road maintenance framework tender after the evaluation report was withheld. PPADB referrals doubled in the same month.', recommendation: 'Publish evaluation summaries with every award notice to pre-empt disclosure complaints.', severity: 'Medium', tone: 'amber' },
    grid: [
      [
        { span: 8, type: 'bar', title: 'Complaints received per month by channel', height: 270, categories: YTD, series: chanM.map((c, i) => ({ name: c.name, stack: 'c', data: c.data, color: CHANNELS[i][2] })) },
        { span: 4, type: 'donut', title: 'Channel mix YTD', height: 270, center: fmt.n(TOTAL), items: CHANNELS.map(([name, share, tone]) => ({ name, value: Math.round(TOTAL * share), color: tone })) },
      ],
      [
        { span: 8, type: 'table', title: 'Latest complaints received', height: 280,
          columns: [{ key: 'id', label: 'Complaint' }, { key: 'd', label: 'Received' }, { key: 'ch', label: 'Channel' }, { key: 's', label: 'Complainant' }, { key: 'e', label: 'Procuring entity' }, { key: 'st', label: 'Stage' }],
          rows: [...REC].sort((a, b) => a.age - b.age).slice(0, 10).map(c => ({ id: { strong: c.id }, d: c.date, ch: c.channel, s: c.supplier, e: c.entity, st: { pill: c.stage, tone: STAGE_TONE[c.stage] } })) },
        { span: 4, type: 'map', title: 'Complaints by district of complainant | top 10', height: 280,
          pins: [['Gaborone', 512], ['Francistown', 187], ['Maun', 74], ['Serowe', 88], ['Kasane', 38], ['Kanye', 52], ['Letlhakane', 31], ['Ghanzi', 29], ['Tsabong', 18], ['Mahalapye', 44]]
            .map(([t, n]) => ({ name: `${t} | ${n}`, meta: `${n} complaints YTD`, lon: TOWNS[t][0], lat: TOWNS[t][1], size: 6 + Math.sqrt(n) * 1.1, tone: n > 150 ? 'red' : n > 60 ? 'amber' : 'cyan' })) },
      ],
    ],
  }));

  // ── 2 Classification ──
  register(K(2), () => ({
    crumbs,
    kpis: [
      { label: 'Auto-classified by AI', value: '84%', sub: 'confidence ≥ 80%', tone: 'violet', pct: 84 },
      { label: 'Awaiting classification', value: '42', sub: 'manual review queue', tone: 'amber' },
      { label: 'Reclassified by officer', value: '6.2%', delta: '▼ 1.4 pts', deltaTone: 'green', sub: 'AI accuracy 93.8%', tone: 'green', pct: 6 },
      { label: 'Categories', value: `${CATS.length}`, sub: 'PPADB taxonomy v3', tone: 'blue' },
      { label: 'Avg time to classify', value: '0.6 days', sub: 'target 2 days', tone: 'cyan' },
    ],
    insight: { finding: 'The AI classifier routes <b>84%</b> of complaints without officer input; most manual overrides move complaints from "Unfair disqualification" to "Bid specification bias" where the disqualification followed a brand-specific specification.', recommendation: 'Add "brand-named specification" as a sub-category so these land correctly first time.', severity: 'Low', tone: 'blue' },
    grid: [
      [
        { span: 7, type: 'treemap', title: 'Complaints by category YTD', height: 290, valueFmt: v => `${fmt.n(v)} complaints`, items: CATS.map(c => ({ name: c.name, value: c.n, color: c.tone === 'slate' ? '#475569' : c.tone })) },
        { span: 5, type: 'bar', title: 'AI classification confidence (complaints)', height: 290, categories: ['< 50%', '50–64%', '65–79%', '80–89%', '90–100%'],
          series: [{ name: 'Complaints', label: true, data: [{ value: 38, itemStyle: { color: '#EF4444' } }, { value: 71, itemStyle: { color: '#F97316' } }, { value: 97, itemStyle: { color: '#F59E0B' } }, { value: 342, itemStyle: { color: '#3B82F6' } }, { value: 738, itemStyle: { color: '#10B981' } }] }] },
      ],
      [
        { span: 6, type: 'sankey', title: 'Channel → category flow (top 6 categories)', height: 300,
          nodes: [...CHANNELS.map(c => c[0]), ...CATS.slice(0, 6).map(c => SHORT[c.name])],
          links: CHANNELS.flatMap(([ch, share], ci) => CATS.slice(0, 6).map((c, k) => ({ source: ch, target: SHORT[c.name], value: Math.round(c.n * share * rng('sk' + ci + k).num(0.6, 1.4)) }))) },
        { span: 6, type: 'table', title: 'Manual classification queue', height: 300,
          columns: [{ key: 'id', label: 'Complaint' }, { key: 'ai', label: 'AI suggestion' }, { key: 'c', label: 'Confidence' }],
          rows: REC.slice(0, 12).map(c => { const v = Math.min(79, c.conf - 20); return { id: c.id, ai: c.cat, c: { bar: v, tone: v < 50 ? 'red' : v < 65 ? 'orange' : 'amber' } }; }) },
      ],
    ],
  }));

  // ── 3 Assignment ──
  const load = INVESTIGATORS.map((n, i) => { const r = rng('load' + i); return { n, crit: r.int(0, 3), high: r.int(2, 8), med: r.int(5, 14), low: r.int(2, 8) }; }).map(o => ({ ...o, total: o.crit + o.high + o.med + o.low }));
  load[3].high = 12; load[3].med = 16; load[3].total = load[3].crit + load[3].high + load[3].med + load[3].low;
  register(K(3), () => ({
    crumbs,
    kpis: [
      { label: 'Unassigned', value: '80', delta: '42 new + 38 classified', deltaTone: 'amber', sub: '', tone: 'amber' },
      { label: 'Assigned today', value: '17', sub: 'auto-routing on', tone: 'blue' },
      { label: 'Avg time to assign', value: '1.8 days', delta: '▼ 0.6 days', deltaTone: 'green', sub: 'target 2 days', tone: 'green' },
      { label: 'Investigators', value: `${INVESTIGATORS.length}`, sub: 'Complaints Unit', tone: 'violet' },
      { label: 'Avg caseload', value: `${Math.round(sum(load, o => o.total) / load.length)}`, delta: 'max ' + Math.max(...load.map(o => o.total)), deltaTone: 'red', sub: 'open per officer', tone: 'cyan' },
    ],
    insight: { finding: `<b>${load[3].n}</b> carries ${load[3].total} open complaints, ${Math.round((load[3].total / (sum(load, o => o.total) / load.length) - 1) * 100)}% above the unit average, including all Ministry of Health payment complaints. Three officers are below 20.`, recommendation: 'Rebalance 10 Health payment cases to G. Phiri and D. Modise; route new late-payment complaints round-robin.', severity: 'Medium', tone: 'amber', actions: ['Explain finding', 'Rebalance caseload', 'Create task'] },
    grid: [
      [
        { span: 8, type: 'bar', title: 'Open caseload by investigator and priority', height: 300, horizontal: true, labelMax: 14, categories: load.map(o => o.n),
          series: [['Critical', 'crit', 'red'], ['High', 'high', 'orange'], ['Medium', 'med', 'amber'], ['Low', 'low', 'blue']].map(([name, k, color]) => ({ name, stack: 'l', data: load.map(o => o[k]), color })) },
        { span: 4, type: 'gauge', title: 'Assigned within 2 days | SLA', height: 300, gauges: [{ name: 'Within SLA', value: 83, good: 90, warn: 75 }, { name: 'Auto-routed', value: 61, tone: 'violet' }] },
      ],
      [{ span: 12, type: 'table', title: 'Assignment queue | classified, awaiting an investigator', height: 260,
        columns: [{ key: 'id', label: 'Complaint' }, { key: 'cat', label: 'Category' }, { key: 'e', label: 'Entity' }, { key: 's', label: 'Complainant' }, { key: 'w', label: 'Waiting', align: 'right' }, { key: 'p', label: 'Priority' }, { key: 'sug', label: 'Suggested officer' }],
        rows: REC.filter(c => c.stage === 'Received' || c.stage === 'Classified').concat(REC.slice(0, 6)).slice(0, 10).map((c, i) => ({ id: { strong: c.id }, cat: c.cat, e: c.entity, s: c.supplier, w: `${(i % 4) + 1} d`, p: prioPill(c), sug: { dot: 'cyan', text: [...load].sort((a, b) => a.total - b.total)[i % 3].n } })) }],
    ],
  }));

  // ── 4 Investigation ──
  const INV_COLS = [['Evidence gathering', 'blue', 41], ['Entity response awaited', 'amber', 33], ['Supplier / bidder interview', 'violet', 19], ['Site / records inspection', 'cyan', 11], ['Findings drafting', 'green', 14]];
  register(K(4), () => {
    const inv = REC.filter(c => c.stage === 'Investigation' || c.stage === 'Response' || c.stage === 'Assigned');
    return {
      crumbs,
      kpis: [
        { label: 'Under investigation', value: '118', sub: '34% of open', tone: 'violet', pct: 34 },
        { label: 'Entity responses overdue', value: '21', delta: '> 10 days', deltaTone: 'red', sub: 'Health 9, Transport 5', tone: 'red' },
        { label: 'Avg investigation time', value: '12.8 days', delta: '▲ 1.9 days', deltaTone: 'amber', sub: 'target 10', tone: 'amber' },
        { label: 'Substantiated', value: '41%', sub: 'of concluded', tone: 'orange', pct: 41 },
        { label: 'Procurement suspended', value: '6 tenders', sub: 'pending findings', tone: 'blue' },
      ],
      insight: { finding: '<b>33 investigations</b> are waiting on a response from the procuring entity; Ministry of Health accounts for 9 of the 21 overdue beyond 10 days, mostly on evaluation-disclosure complaints.', recommendation: 'Issue a PS-level reminder to Ministry of Health with a 5-day deadline, copying PPADB.', severity: 'Medium', tone: 'amber' },
      grid: [
        [{ span: 12, type: 'kanban', title: 'Investigation board | most urgent 3 per step (step totals in headers)', height: 300,
          columns: INV_COLS.map(([name, t, n], ci) => ({ name: `${name} · ${n}`, tone: t, items: inv.filter((_, i) => i % INV_COLS.length === ci).slice(0, 3).map(c => ({ title: `${c.id} · ${c.cat}`, pill: c.prio, tone: PRIO_TONE[c.prio], meta: `${c.age}d · ${c.officer}` })) })) }],
        [
          { span: 7, type: 'bar', title: 'Investigation duration | concluded cases (count)', height: 240, categories: ['0–5 d', '6–10 d', '11–15 d', '16–20 d', '21–30 d', '31–45 d', '45+ d'],
            series: [{ name: 'Cases', label: true, data: [64, 188, 231, 142, 97, 44, 19].map((v, i) => ({ value: v, itemStyle: { color: i < 3 ? '#10B981' : i < 4 ? '#3B82F6' : i < 5 ? '#F59E0B' : '#EF4444' } })) }] },
          { span: 5, type: 'donut', title: 'Findings on concluded investigations', height: 240, center: '785', items: [{ name: 'Substantiated', value: 322, color: 'red' }, { name: 'Partly substantiated', value: 157, color: 'amber' }, { name: 'Not substantiated', value: 251, color: 'green' }, { name: 'Withdrawn', value: 55, color: '#475569' }] },
        ],
      ],
    };
  });

  // ── 5 Responses ──
  const respDays = [9.8, 9.1, 10.4, 11.2, 12.6, 11.9];
  register(K(5), () => ({
    crumbs,
    kpis: [
      { label: 'Responses issued YTD', value: '981', sub: 'to complainants', tone: 'blue' },
      { label: 'Within SLA', value: '78%', delta: '▼ 3 pts', deltaTone: 'red', sub: 'response in 14 days', tone: 'amber', pct: 78 },
      { label: 'Avg days to respond', value: `${respDays[5]}`, delta: '▲ 2.1 vs Apr', deltaTone: 'red', sub: 'target 14', tone: 'violet' },
      { label: 'Drafts awaiting approval', value: '44', sub: 'Director sign-off', tone: 'orange' },
      { label: 'Complainant satisfaction', value: '3.6 / 5', delta: '▲ 0.2', sub: 'post-response survey', tone: 'green', pct: 72 },
    ],
    insight: { finding: `Average response time has risen from <b>${respDays[0]}</b> to <b>${respDays[5]} days</b> since April; 44 drafts sit awaiting Director sign-off for a median of 4 days.`, recommendation: 'Delegate sign-off for "not substantiated" responses to Principal level.', severity: 'Medium', tone: 'amber' },
    grid: [
      [
        { span: 7, type: 'line', title: 'Average days to respond vs SLA', height: 260, categories: YTD,
          series: [{ name: 'Avg days', data: respDays, color: 'violet', area: true, markLine: { value: 14, label: 'SLA 14 days', tone: 'red' } }, { name: 'Median days', data: respDays.map(v => +(v * 0.82).toFixed(1)), color: 'cyan', dashed: true }], gridOpt: { right: 70 } },
        { span: 5, type: 'bar', title: 'Response type by month', height: 260, categories: YTD,
          series: [['Remedy offered', 'green'], ['Explanation provided', 'blue'], ['Referred to PPADB', 'violet'], ['Rejected', '#475569']].map(([name, color], k) => ({ name, color, stack: 'r', data: CLOSED.map((v, m) => Math.round(v * [0.32, 0.41, 0.09, 0.18][k] * rng('rt' + k + m).num(0.85, 1.15))) })) },
      ],
      [
        { span: 7, type: 'table', title: 'Responses awaiting approval', height: 300,
          columns: [{ key: 'id', label: 'Complaint' }, { key: 'cat', label: 'Category' }, { key: 'o', label: 'Drafted by' }, { key: 'out', label: 'Proposed outcome' }, { key: 'w', label: 'Waiting', align: 'right' }],
          rows: REC.filter((_, i) => i % 3 === 0).slice(0, 10).map((c, i) => ({ id: { strong: c.id }, cat: c.cat, o: c.officer === 'Unassigned' ? INVESTIGATORS[i] : c.officer, out: [{ pill: 'Remedy offered', tone: 'green' }, { pill: 'Not substantiated', tone: 'slate' }, { pill: 'Re-evaluation', tone: 'amber' }, { pill: 'Refer to PPADB', tone: 'violet' }][i % 4], w: `${(i * 3) % 9 + 1} d` })) },
        { span: 5, type: 'doc', title: 'Draft response | CMP-26-01400', height: 300, html: `<div style="font-size:11px;color:#555">Ministry of Finance · Procurement Complaints Unit<br>Private Bag 008, Gaborone</div><p style="margin-top:14px">23 September 2026</p><p>The Managing Director<br>${REC[0].supplier}</p><p><b>RE: Complaint CMP-26-01400, tender ${REC[0].tender}</b></p><p>We acknowledge your complaint regarding <i>${REC[0].cat.toLowerCase()}</i> lodged through the ${REC[0].channel.toLowerCase()}. The Unit has reviewed the evaluation records and the response of the ${REC[0].entity}.</p><p>Our finding is that the complaint is <b>partly substantiated</b>. The procuring entity has been directed to disclose the evaluation summary to all bidders within 7 working days.</p><p>If you are not satisfied with this outcome you may appeal to the PPADB Independent Complaints Review Committee within 14 days.</p><p style="margin-top:18px">Yours faithfully,<br><br>Director, Procurement Complaints Unit</p>` },
      ],
    ],
  }));

  // ── 6 Resolution & Closure ──
  register(K(6), () => ({
    crumbs,
    kpis: [
      { label: 'Closed YTD', value: fmt.n(CLOSED_YTD), sub: `${pct(CLOSED_YTD, TOTAL)} of received`, tone: 'green', pct: (CLOSED_YTD / TOTAL) * 100 },
      { label: 'Resolved within 21 days', value: '71%', delta: '▲ 5 pts', sub: 'SLA target 80%', tone: 'cyan', pct: 71 },
      { label: 'Remedy granted', value: '34%', sub: 're-evaluation, payment, disclosure', tone: 'violet', pct: 34 },
      { label: 'Re-opened', value: '3.1%', delta: '29 cases', deltaTone: 'amber', sub: 'after closure', tone: 'amber' },
      { label: 'Awaiting closure', value: '27', sub: 'resolved, not closed', tone: 'blue' },
    ],
    insight: { finding: `Late-payment complaints resolve at only <b>${CATS[0].resolved}%</b> against a unit average of ${pct(CLOSED_YTD, TOTAL)}, because resolution depends on the paying ministry releasing funds rather than on the Complaints Unit.`, recommendation: 'Close late-payment complaints on payment confirmation from IFMIS, with automatic notification to the supplier.', severity: 'Medium', tone: 'amber' },
    grid: [
      [
        { span: 7, type: 'waterfall', title: 'Open complaints bridge | 1 Apr to 23 Sep', height: 270, min: 0, upTone: 'blue', downTone: 'green',
          steps: [{ name: 'Open 1 Apr', value: 64, total: true }, { name: 'Received', value: TOTAL }, { name: 'Closed', value: -CLOSED_YTD }, { name: 'Merged / withdrawn', value: -64 }, { name: 'Open today', value: OPEN, total: true }] },
        { span: 5, type: 'donut', title: 'Resolution outcomes', height: 270, center: fmt.n(CLOSED_YTD), items: [{ name: 'Remedy granted', value: 319, color: 'green' }, { name: 'Explanation accepted', value: 342, color: 'blue' }, { name: 'Not substantiated', value: 176, color: '#475569' }, { name: 'Withdrawn', value: 57, color: 'cyan' }, { name: 'Referred to PPADB', value: 43, color: 'violet' }] },
      ],
      [
        { span: 7, type: 'bar', title: 'Resolution rate by category (%)', height: 280, horizontal: true, labelMax: 26, categories: CATS.slice(0, 10).map(c => c.name), gridOpt: { right: 34 },
          series: [{ name: 'Resolved %', label: true, data: CATS.slice(0, 10).map(c => ({ value: c.resolved, itemStyle: { color: c.resolved < 65 ? '#EF4444' : c.resolved < 75 ? '#F59E0B' : '#10B981' } })) }] },
        { span: 5, type: 'table', title: 'Recently closed', height: 280,
          columns: [{ key: 'id', label: 'Complaint' }, { key: 'o', label: 'Outcome' }, { key: 'd', label: 'Days', align: 'right' }],
          rows: REC.slice(20, 30).map((c, i) => ({ id: c.id, o: [{ pill: 'Remedy granted', tone: 'green' }, { pill: 'Explained', tone: 'blue' }, { pill: 'Not substantiated', tone: 'slate' }, { pill: 'Withdrawn', tone: 'cyan' }][i % 4], d: 6 + ((i * 7) % 24) })) },
      ],
    ],
  }));

  // ── 7 Appeals ──
  const APPEALS = [
    ['APL-26-061', 'Unfair disqualification', 'Ministry of Transport', 'Mmila Road Contractors', 'ICRC hearing', 'amber'],
    ['APL-26-058', 'Evaluation not disclosed', 'Ministry of Health', 'Seasons Pty Ltd', 'Upheld', 'green'],
    ['APL-26-055', 'Bid specification bias', 'Ministry of ICT', 'Chobe ICT Solutions', 'Under review', 'blue'],
    ['APL-26-052', 'Contract cancellation', 'Ministry of Water', 'Motswedi Construction', 'Dismissed', 'slate'],
    ['APL-26-049', 'Unfair disqualification', 'Ministry of Health', 'Matrix Pty Ltd', 'ICRC hearing', 'amber'],
    ['APL-26-047', 'Conflict of interest', 'Gaborone City Council', 'Tlotlo Civil Works', 'Upheld', 'green'],
    ['APL-26-044', 'Late payment to suppliers', 'Ministry of Education', 'Boitumelo Catering', 'Dismissed', 'slate'],
    ['APL-26-041', 'Evaluation not disclosed', 'Ministry of Energy', 'Kalahari Energy Systems', 'Under review', 'blue'],
    ['APL-26-038', 'Bid specification bias', 'Ministry of Health', 'Okavango Medical Supplies', 'Upheld', 'green'],
  ];
  register(K(7), () => ({
    crumbs,
    kpis: [
      { label: 'Appeals lodged', value: '64', sub: '6.8% of closed', tone: 'blue', pct: 7 },
      { label: 'To PPADB ICRC', value: '22', sub: 'Independent Complaints Review Committee', tone: 'violet' },
      { label: 'Pending', value: '19', sub: 'in appeal stage', tone: 'amber' },
      { label: 'Upheld (overturned)', value: '18%', delta: '8 of 45 decided', deltaTone: 'red', sub: '', tone: 'red', pct: 18 },
      { label: 'Avg days to decide', value: '26', sub: 'statutory 30', tone: 'cyan', pct: 87 },
    ],
    insight: { finding: '<b>Unfair disqualification</b> generates 31% of appeals but only 9% of complaints; 3 of the 8 upheld appeals concerned Ministry of Health evaluation committees.', recommendation: 'Require a second-reader check on all disqualification decisions at Ministry of Health before award notice.', severity: 'Medium', tone: 'amber' },
    grid: [
      [
        { span: 4, type: 'funnel', title: 'Closure to appeal outcome', height: 270, items: [{ name: 'Closed', value: CLOSED_YTD }, { name: 'Dissatisfied', value: 211 }, { name: 'Appealed', value: 64 }, { name: 'Decided', value: 45 }, { name: 'Upheld', value: 8 }] },
        { span: 8, type: 'bar', title: 'Appeals by category and outcome', height: 270, categories: ['Unfair disqualification', 'Evaluation not disclosed', 'Bid specification bias', 'Contract cancellation', 'Conflict of interest', 'Late payment', 'Other'], rotate: 0, labelMax: 16,
          series: [{ name: 'Upheld', stack: 'a', data: [3, 2, 2, 0, 1, 0, 0], color: 'green' }, { name: 'Dismissed', stack: 'a', data: [9, 7, 5, 4, 2, 3, 3], color: '#475569' }, { name: 'Pending', stack: 'a', data: [8, 4, 3, 2, 1, 0, 1], color: 'amber' }] },
      ],
      [{ span: 12, type: 'table', title: 'Appeals register', height: 280,
        columns: [{ key: 'id', label: 'Appeal' }, { key: 'c', label: 'Ground' }, { key: 'e', label: 'Procuring entity' }, { key: 's', label: 'Appellant' }, { key: 'l', label: 'Lodged' }, { key: 'st', label: 'Status' }],
        rows: APPEALS.map(([id, c, e, s, st, t], i) => ({ id: { strong: id }, c, e, s, l: `${String(28 - i * 3).padStart(2, '0')} ${YTD[5 - Math.floor(i / 3)]}`, st: { pill: st, tone: t } })) }],
    ],
  }));

  // ── 8 Ageing & Overdue ──
  const BUCKETS = ['0–7 d', '8–14 d', '15–21 d', '22–30 d', '31–60 d', '60+ d'];
  const bucketN = [84, 73, 96, 43, 30, 23];
  register(K(8), () => {
    const r = rng('ageheat');
    const oldest = [...REC].sort((a, b) => b.age - a.age)[0];
    const values = [];
    STAGE_COUNTS.forEach(([s, n], y) => { const w = BUCKETS.map((_, x) => r.num(0.3, 1.2) * (y >= 3 ? x + 1 : 6 - x)); const ws = sum(w); w.forEach((v, x) => values.push([x, y, Math.round((n * v) / ws)])); });
    return {
      crumbs,
      kpis: [
        { label: 'Overdue (> 21 days)', value: `${OVERDUE}`, sub: `${pct(OVERDUE, OPEN)} of open`, tone: 'red', pct: (OVERDUE / OPEN) * 100 },
        { label: 'Over 60 days', value: '23', delta: '▲ 4', deltaTone: 'red', sub: 'escalated to PS', tone: 'red' },
        { label: 'Oldest open', value: `${oldest.age} days`, sub: `${oldest.id} · ${oldest.entity.replace('Ministry of ', '')}`, tone: 'orange' },
        { label: 'Median age (open)', value: '16 days', sub: 'all stages', tone: 'amber' },
        { label: 'SLA compliance', value: '72%', delta: '▼ 3 pts', deltaTone: 'red', sub: 'target 80%', tone: 'violet', pct: 72 },
      ],
      insight: { finding: '<b>23 complaints</b> are older than 60 days; 14 are in investigation waiting on procuring-entity documents, and 9 are in appeal. Ministry of Health holds 11 of them.', recommendation: 'Escalate all 60+ day cases to the Permanent Secretary with a weekly status report.', severity: 'High', tone: 'red', actions: ['Explain finding', 'Escalate to PS', 'Export list'] },
      grid: [
        [
          { span: 5, type: 'bar', title: 'Open complaints by age', height: 280, categories: BUCKETS,
            series: [{ name: 'Open', label: true, data: bucketN.map((v, i) => ({ value: v, itemStyle: { color: ['#10B981', '#3B82F6', '#06B6D4', '#F59E0B', '#F97316', '#EF4444'][i] } })) }] },
          { span: 7, type: 'heatmap', title: 'Open complaints | stage × age', height: 280, x: BUCKETS, y: STAGE_COUNTS.map(s => s[0]), values, min: 0, max: 30, colors: ['#0f2a4d', '#1D4ED8', '#F59E0B', '#EF4444'] },
        ],
        [{ span: 12, type: 'table', title: 'Overdue complaints | oldest first', height: 280,
          columns: [{ key: 'id', label: 'Complaint' }, { key: 'cat', label: 'Category' }, { key: 'e', label: 'Entity' }, { key: 'st', label: 'Stage' }, { key: 'o', label: 'Officer' }, { key: 'a', label: 'Age' }, { key: 'esc', label: 'Escalation' }],
          rows: REC.filter(c => c.age > SLA).sort((a, b) => b.age - a.age).slice(0, 12).map(c => ({ id: { strong: c.id }, cat: c.cat, e: c.entity, st: { pill: c.stage, tone: STAGE_TONE[c.stage] }, o: c.officer, a: agePill(c.age), esc: c.age > 60 ? { dot: 'red', text: 'Permanent Secretary' } : c.age > 40 ? { dot: 'orange', text: 'Director' } : { dot: 'amber', text: 'Team leader' } })) }],
      ],
    };
  });

  // ── 9 By Entity & Supplier ──
  const SUP = SUPPLIERS.slice(0, 12).map((s, i) => { const r = rng('sup' + i); const n = r.int(4, 23); return { s, n, sub: Math.round(n * r.num(0.2, 0.6)), won: r.int(0, 6), top: r.pick(CATS.slice(0, 5)).name }; }).sort((a, b) => b.n - a.n);
  register(K(9), () => ({
    crumbs,
    kpis: [
      { label: 'Procuring entities', value: `${ENTITIES.length}`, sub: 'with complaints YTD', tone: 'blue' },
      { label: 'Ministry of Health share', value: pct(ENTITIES[0].n, TOTAL), sub: `${ENTITIES[0].n} complaints`, tone: 'red', pct: (ENTITIES[0].n / TOTAL) * 100 },
      { label: 'Suppliers complaining', value: '412', sub: 'distinct complainants', tone: 'violet' },
      { label: 'Repeat complainants', value: '38', sub: '≥ 5 complaints', tone: 'amber' },
      { label: 'Complaints per 100 tenders', value: (TOTAL / sum(ENTITIES, e => e.tenders) * 100).toFixed(1), sub: 'national average', tone: 'cyan' },
    ],
    insight: { finding: `Ministry of ICT draws <b>${ENTITIES[6].per100.toFixed(0)} complaints per 100 tenders</b>, the highest rate of any entity, against ${(TOTAL / sum(ENTITIES, e => e.tenders) * 100).toFixed(0)} nationally; most allege brand-specific specifications on the e-Government Data Centre packages.`, recommendation: 'Commission an independent specification review of open ICT tenders.', severity: 'High', tone: 'orange' },
    grid: [
      [
        { span: 6, type: 'bar', title: 'Complaints by procuring entity | open vs closed', height: 300, horizontal: true, labelMax: 24, categories: ENTITIES.map(e => e.name),
          series: [{ name: 'Closed', stack: 'e', data: ENTITIES.map(e => e.closed), color: 'blue' }, { name: 'Open', stack: 'e', data: ENTITIES.map(e => e.open), color: 'amber' }] },
        { span: 6, type: 'bar', title: 'Complaints per 100 tenders issued | by entity', height: 300, rotate: 35, labelMax: 14, categories: [...ENTITIES].sort((x, y) => y.per100 - x.per100).map(e => e.name.replace('Ministry of ', 'Min. ')), gridOpt: { right: 60 },
          series: [{ name: 'Per 100 tenders', label: true, labelFmt: p => Math.round(p.value), data: [...ENTITIES].sort((x, y) => y.per100 - x.per100).map(e => ({ value: +e.per100.toFixed(1), itemStyle: { color: e.per100 > 65 ? '#EF4444' : e.per100 > 50 ? '#F59E0B' : '#10B981' } })), markLine: { value: +((TOTAL / sum(ENTITIES, e => e.tenders)) * 100).toFixed(1), label: 'National', tone: 'cyan' } }] },
      ],
      [
        { span: 7, type: 'table', title: 'Suppliers involved | most frequent complainants', height: 280,
          columns: [{ key: 's', label: 'Supplier' }, { key: 'n', label: 'Complaints', align: 'right' }, { key: 'sub', label: 'Substantiated', align: 'right' }, { key: 'w', label: 'Tenders won YTD', align: 'right' }, { key: 't', label: 'Main issue' }, { key: 'f', label: 'Pattern' }],
          rows: SUP.map(x => ({ s: { strong: x.s }, n: x.n, sub: x.sub, w: x.won, t: x.top, f: x.n >= 15 && x.sub / x.n < 0.3 ? { pill: 'Vexatious risk', tone: 'amber' } : x.sub / x.n > 0.45 ? { pill: 'Credible', tone: 'green' } : { pill: 'Normal', tone: 'slate' } })) },
        { span: 5, type: 'donut', title: 'Who complains', height: 280, center: fmt.n(TOTAL), items: [{ name: 'Unsuccessful bidders', value: 604 }, { name: 'Contractors (post-award)', value: 398 }, { name: 'Prospective bidders', value: 157 }, { name: 'Public / civil society', value: 79 }, { name: 'Whistle-blower (staff)', value: 48 }] },
      ],
    ],
  }));

  // ── 10 AI Theme Clustering ──
  const THEMES = [
    ['Late payment to suppliers', 312, 26, 3.4, true, 'red', 'invoice 30 days, certificate unpaid, cash-flow', 'Late payment'],
    ['Bid specification bias', 187, 34, 3.95, true, 'orange', 'brand name, single source, tailored spec', 'Spec bias'],
    ['Evaluation not disclosed', 164, 12, 3.0, true, 'amber', 'no debrief, scores withheld, award notice', 'Eval. secrecy'],
    ['Unfair disqualification', 149, 14, 3.7, true, 'violet', 'minor omission, certified copy, tax cert', 'Unfair DQ'],
    ['Contract cancellation', 96, -6, 3.3, false, 'pink', 'termination, no notice, re-tender', 'Cancellation'],
    ['Delayed award notification', 88, 9, 2.5, false, 'blue', 'validity expired, no award, extension', 'Late award'],
    ['Conflict of interest', 71, 47, 4.4, true, 'cyan', 'evaluator relative, director link', 'Conflict'],
    ['Tender document fees', 63, -12, 2.0, false, 'teal', 'fee, portal access, closing date', 'Doc fees'],
    ['Variation disputes', 58, 1, 2.85, false, 'sky', 'variation order, rates, extension of time', 'Variations'],
    ['Bid security issues', 41, -4, 2.35, false, 'green', 'guarantee, forfeited, format', 'Bid security'],
    ['Solicitation allegation', 34, 62, 4.8, false, 'red', 'bribe, facilitation, request', 'Solicitation'],
  ];
  register(K(10), () => ({
    crumbs,
    kpis: [
      { label: 'Complaints clustered', value: fmt.n(TOTAL), sub: 'free-text + attachments', tone: 'blue', pct: 100 },
      { label: 'Themes detected', value: `${THEMES.length}`, sub: 'unsupervised clustering', tone: 'violet' },
      { label: 'Systemic problems', value: `${THEMES.filter(t => t[4]).length}`, delta: '≥ 3 entities', sub: 'recurring pattern', tone: 'red' },
      { label: 'Emerging themes', value: '2', delta: '▲ > 40% QoQ', deltaTone: 'red', sub: 'conflict, solicitation', tone: 'orange' },
      { label: 'Cluster coherence', value: '0.81', sub: 'silhouette score', tone: 'green', pct: 81 },
    ],
    insight: { finding: 'Five themes behave as <b>systemic problems</b> rather than isolated grievances: they recur across 3+ procuring entities and 40+ suppliers. <b>Conflict of interest</b> (+47%) and <b>solicitation allegations</b> (+62%) are growing fastest and carry the highest severity.', recommendation: 'Refer the conflict-of-interest cluster to the DCEC liaison and fix late payment at source through the Accountant General.', severity: 'High', tone: 'red', actions: ['Explain clusters', 'Open theme', 'Refer to DCEC'] },
    grid: [
      [
        { span: 7, type: 'treemap', title: 'Theme clusters | size = complaints', height: 310, valueFmt: v => `${v} complaints`, items: THEMES.map(t => ({ name: t[0], value: t[1], color: t[5] })) },
        { span: 5, type: 'scatter', title: 'Theme map | growth vs severity', height: 310, xName: 'Growth vs last quarter %', yName: 'Avg severity (1–5)', xMin: -20, xMax: 80, yMin: 1.5, yMax: 5, labels: true,
          points: THEMES.map(t => ({ name: t[7], x: t[2], y: t[3], tone: t[4] ? 'red' : t[2] > 40 ? 'orange' : 'blue', size: 8 + Math.sqrt(t[1]) * 1.4 })), legend: [['Systemic', 'red'], ['Emerging', 'orange'], ['Contained', 'blue']] },
      ],
      [{ span: 12, type: 'table', title: 'Themes | AI summary', height: 300,
        columns: [{ key: 't', label: 'Theme' }, { key: 'n', label: 'Complaints', align: 'right' }, { key: 'g', label: 'Growth QoQ', align: 'right' }, { key: 'e', label: 'Entities' }, { key: 'k', label: 'Key phrases' }, { key: 's', label: 'Classification' }],
        rows: THEMES.map((t, i) => ({ t: { strong: t[0] }, n: t[1], g: { trend: t[2] >= 0 ? 'up' : 'down', text: `${Math.abs(t[2])}%`, tone: t[2] > 20 ? 'red' : t[2] >= 0 ? 'amber' : 'green' }, e: `${[9, 7, 8, 8, 5, 6, 4, 3, 4, 3, 3][i]} entities`, k: t[6], s: t[4] ? { pill: 'Systemic', tone: 'red' } : t[2] > 40 ? { pill: 'Emerging', tone: 'orange' } : { pill: 'Contained', tone: 'blue' } })) }],
    ],
  }));

  // ── 11 Trends & Anomalies ──
  const M18 = ['Apr 25', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan 26', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  const LY = [148, 161, 177, 169, 192, 171, 183, 158, 121, 176, 188, 214];
  const vol = [...LY, ...RECV];
  const fc = [...Array(17).fill(null), RECV[5], 214, 206, 188];
  register(K(11), () => {
    const r = rng('trendheat');
    const values = [];
    CATS.slice(0, 8).forEach((c, y) => YTD.forEach((_, x) => values.push([x, y, Math.round((c.n / TOTAL) * RECV[x] * r.num(0.7, 1.3))])));
    values.find(v => v[0] === 4 && v[1] === 2)[2] = 49; // Aug evaluation-disclosure spike
    values.find(v => v[0] === 3 && v[1] === 6)[2] = 24; // Jul conflict-of-interest spike
    return {
      crumbs,
      kpis: [
        { label: '12-month volume', value: fmt.n(sum(vol.slice(-12))), delta: '▲ 18% YoY', deltaTone: 'amber', sub: 'Oct 25 – Sep 26', tone: 'blue' },
        { label: 'Anomalies detected', value: '3', delta: 'Jul, Aug, Mar', deltaTone: 'red', sub: '> 2σ above trend', tone: 'red' },
        { label: 'Seasonal peak', value: 'Q4 (Jan–Mar)', sub: 'year-end tendering', tone: 'violet' },
        { label: 'Forecast Oct', value: '214', delta: '± 22', sub: '80% interval', tone: 'cyan' },
        { label: 'Resolution rate trend', value: '▲ 6 pts', deltaTone: 'green', delta: 'vs FY 25-26', sub: '', tone: 'green' },
      ],
      insight: { finding: 'Volumes are up <b>18% year on year</b>. Two anomalies stand out this year: evaluation-disclosure complaints spiked to 49 in August (MTC framework tender) and conflict-of-interest complaints tripled in July at Gaborone City Council.', recommendation: 'Plan for about 214 complaints in October and add 2 temporary investigators for the Q4 tendering peak.', severity: 'Medium', tone: 'amber' },
      grid: [
        [
          { span: 8, type: 'line', title: 'Monthly complaints | 18 months with forecast', height: 280, categories: [...M18, 'Oct', 'Nov', 'Dec'],
            series: [{ name: 'Received', data: vol.map((v, i) => ({ value: v, symbolSize: [11, 15, 16].includes(i) ? 12 : 5, itemStyle: { color: [11, 15, 16].includes(i) ? '#EF4444' : '#3B82F6' } })), color: 'blue', area: true }, { name: 'Forecast', data: fc, color: 'cyan', dashed: true }, { name: '12-mo average', data: [...M18, 1, 2, 3].map((_, i) => (i < 11 ? null : Math.round(sum(vol.slice(Math.max(0, i - 11), i + 1)) / 12))), color: 'amber', symbol: 'none' }] },
          { span: 4, type: 'list', title: 'Anomalies detected', height: 280, items: [
            { title: 'Aug 26 · Evaluation not disclosed', meta: '49 complaints vs 16 expected · MTC road maintenance framework', value: '3.1σ', tone: 'red' },
            { title: 'Jul 26 · Conflict of interest', meta: '24 vs 8 expected · Gaborone City Council', value: '2.8σ', tone: 'red' },
            { title: 'Mar 26 · Late payment to suppliers', meta: 'Year-end certificate backlog · 5 ministries', value: '2.3σ', tone: 'orange' },
            { title: 'Sep 26 · Tender document fees', meta: '−60% after portal fee waiver', value: '−2.1σ', tone: 'green' },
          ] },
        ],
        [{ span: 12, type: 'heatmap', title: 'Complaints by category × month (FY 2026-27)', height: 300, x: YTD, y: CATS.slice(0, 8).map(c => c.name), values, min: 0, max: 60 }],
      ],
    };
  });
})();
