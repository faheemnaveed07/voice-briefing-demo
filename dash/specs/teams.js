/* Menu 13: Teams & Task Management (all 12 tabs). Viewer: Permanent Secretary.
 * Tasks tie back to the 20 Budget Review resolutions, the project portfolio (data.js PROJECTS),
 * tender MCP/DES/2283 and the approvals queue (23 waiting, 5 over five working days).
 */
(function () {
  const { register, fmt, rng, C } = DASH;
  const { PROJECTS } = DASH.data;
  const K = n => `12-${n}`;
  const crumbs = ['Ministry of Finance', 'All directorates'];
  const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], MN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  // Mockup "today" is Wed 23 Sep 2026; day(off) -> "Thu 24 Sep"
  const day = off => { const d = new Date(Date.UTC(2026, 8, 23 + off)); return `${WD[d.getUTCDay()]} ${String(d.getUTCDate()).padStart(2, '0')} ${MN[d.getUTCMonth()]}`; };
  const sum = (arr, f) => arr.reduce((s, x) => s + f(x), 0);
  const PRI = { Critical: 'red', High: 'orange', Medium: 'amber', Low: 'blue' };
  const ST = { 'To do': 'slate', 'In progress': 'blue', Review: 'violet', Blocked: 'red', Done: 'green' };

  // ── Directorates: [name, head, staff, to do, in progress, review, blocked, overdue (subset of open), done this week]
  const DIRS = [
    ['Budget', 'Director Budget', 7, 14, 18, 6, 2, 5, 9], ['Treasury', 'Treasury Operations Director', 6, 10, 15, 4, 1, 3, 7],
    ['Procurement', 'Chief Procurement Officer', 6, 16, 22, 8, 4, 9, 6], ['Projects', 'Director Projects', 6, 18, 24, 7, 3, 8, 5],
    ['Finance', 'Director Finance', 5, 12, 17, 5, 2, 6, 8], ['Internal Audit', 'Chief Internal Auditor', 4, 9, 11, 3, 1, 2, 4],
    ['HR', 'Director HR', 4, 8, 10, 3, 2, 3, 3], ['ICT', 'Director ICT', 4, 7, 9, 2, 1, 1, 4], ['Revenue', 'Director Revenue', 6, 6, 8, 3, 0, 0, 0],
  ].map(([name, head, staff, todo, prog, review, blocked, overdue, done]) => ({ name, head, staff, todo, prog, review, blocked, overdue, done, open: todo + prog + review + blocked }));
  DIRS[8].overdue = 2; DIRS[8].done = 3; // Revenue: Resolution 1 slippage
  const OPEN = sum(DIRS, d => d.open), OVERDUE = sum(DIRS, d => d.overdue), BLOCKED = sum(DIRS, d => d.blocked), DONEWK = sum(DIRS, d => d.done), STAFF_N = sum(DIRS, d => d.staff);

  // ── Staff (names are illustrative) with open-task load by status
  const STAFF = [
    ['K. Molefe', 'Chief Procurement Officer', 'Procurement'], ['T. Mogapi', 'Director Projects', 'Projects'], ['L. Seretse', 'Director Finance', 'Finance'],
    ['B. Kgosi', 'Chief Accountant', 'Finance'], ['N. Masire', 'Director Budget', 'Budget'], ['O. Tau', 'Procurement Officer', 'Procurement'],
    ['P. Ramotswa', 'Project Engineer', 'Projects'], ['M. Dintwe', 'Chief Internal Auditor', 'Internal Audit'], ['G. Sebego', 'Budget Analyst', 'Budget'],
    ['D. Motsumi', 'Treasury Operations Director', 'Treasury'], ['R. Kebonang', 'Director ICT', 'ICT'], ['S. Phiri', 'Director HR', 'HR'],
    ['A. Nkwe', 'Accountant', 'Finance'], ['J. Tshekiso', 'Director Revenue', 'Revenue'], ['E. Letsholo', 'Contracts Officer', 'Procurement'], ['F. Gaolathe', 'Budget Officer', 'Budget'],
  ].map(([name, role, dept], i) => {
    const r = rng('staff' + i);
    const base = [14, 13, 12, 11, 10, 9, 9, 8, 7, 7, 6, 6, 5, 4, 3, 2][i];
    const overdue = Math.max(0, Math.round(base * r.num(0.08, 0.3)));
    const prog = Math.round((base - overdue) * r.num(0.4, 0.6));
    return { name, role, dept, label: `${name} | ${role}`, open: base, overdue, prog, todo: base - overdue - prog, done: r.int(2, 9), hours: Math.round(base * r.num(3.2, 4.1)) };
  });

  // ── Task register: [id, title, owner, directorate, link, due offset (days from today), status, priority, progress %]
  const TASKS = [
    ['T-4102', 'Clear verified invoices older than 30 days', 'Director Finance', 'Finance', 'Resolution 4', -18, 'In progress', 'Critical', 62],
    ['T-4108', 'Submit recovery plan | Maun District Hospital Wing', 'Director Projects', 'Projects', 'PRJ-102 · Resolution 5', -3, 'In progress', 'Critical', 40],
    ['T-4111', 'Weekly revenue variance report to PS', 'Director Revenue', 'Revenue', 'Resolution 1', -23, 'Blocked', 'High', 35],
    ['T-4115', 'Complete September bank reconciliations', 'Chief Accountant', 'Finance', 'Resolution 8', -13, 'In progress', 'High', 70],
    ['T-4119', 'Authorise award memo MCP/DES/2283/26-27-01', 'Permanent Secretary', 'Procurement', 'Tender 2283 · APR-2611', 0, 'Review', 'High', 90],
    ['T-4120', 'Supporting documents for PV-26-44812 (BWP 1,240,000)', 'Director Finance', 'Finance', 'Audit alert', -4, 'Blocked', 'Critical', 10],
    ['T-4124', 'Variation file VO-07 for Thursday review', 'Director Projects', 'Projects', 'PRJ-102 · APR-2608', 1, 'In progress', 'High', 55],
    ['T-4126', 'Q3 procurement plans from all departments', 'Heads of Procurement', 'Procurement', 'Resolution 11', 7, 'In progress', 'High', 48],
    ['T-4129', 'Procurement progress report (Friday)', 'Chief Procurement Officer', 'Procurement', 'Resolution 3', 2, 'To do', 'Medium', 0],
    ['T-4131', 'Donor funding vs expenditure reconciliation', 'Director External Resources', 'Treasury', 'Resolution 6', 5, 'In progress', 'Medium', 60],
    ['T-4133', 'Audit recommendations progress | August', 'Chief Internal Auditor', 'Internal Audit', 'Resolution 7', -2, 'Review', 'Medium', 85],
    ['T-4136', 'Contract performance dashboard specification', 'Procurement Director', 'Procurement', 'Resolution 10', 12, 'In progress', 'Medium', 30],
    ['T-4138', 'Quarterly cash-flow forecast | Q3 releases', 'Treasury Operations Director', 'Treasury', 'Resolution 12', 3, 'Review', 'High', 80],
    ['T-4140', 'Departmental KPI submissions | September', 'Director Strategy & Performance', 'Budget', 'Resolution 13', 10, 'To do', 'Medium', 0],
    ['T-4142', 'Automated approval reminders go-live', 'Chief Finance Officer', 'ICT', 'Resolution 14', 8, 'In progress', 'Medium', 65],
    ['T-4145', 'PAC records | clinic construction hearing', 'Director Parliamentary Affairs', 'Budget', 'Resolution 15 · PRJ-101', 7, 'In progress', 'High', 45],
    ['T-4147', 'Asset register update | Q2 verification', 'Director Assets Management', 'Finance', 'Resolution 16', 14, 'To do', 'Low', 0],
    ['T-4149', 'Monthly savings report | operating costs', 'All Accounting Officers', 'Budget', 'Resolution 17', -1, 'In progress', 'Medium', 75],
    ['T-4150', 'Grant utilisation audit | Q2', 'Director Budget', 'Budget', 'Resolution 18', 21, 'To do', 'Low', 0],
    ['T-4152', 'Executive dashboard implementation roadmap', 'Director ICT', 'ICT', 'Resolution 20', 16, 'In progress', 'Medium', 70],
    ['T-4155', 'Recruitment costing | 42 nursing posts', 'Director HR', 'HR', 'APR-2602', -5, 'In progress', 'High', 50],
    ['T-4157', 'Site inspection | Tsabong Water Treatment', 'Project Engineer', 'Projects', 'PRJ-109', 2, 'To do', 'Medium', 0],
    ['T-4158', 'Extension of time assessment | Selebi-Phikwe Pipeline', 'Director Projects', 'Projects', 'PRJ-110 · APR-2613', 6, 'Review', 'Medium', 85],
    ['T-4160', 'Procurement re-launch | Ghanzi Senior School Labs', 'Chief Procurement Officer', 'Procurement', 'PRJ-106', -8, 'Blocked', 'High', 20],
    ['T-4162', 'Board pack | Inventory section (stock count)', 'Director Supplies', 'Procurement', 'Board pack 25 Sep', 1, 'Blocked', 'High', 30],
    ['T-4163', 'Board pack | Litigation and legal matters', 'Legal Counsel', 'Budget', 'Board pack 25 Sep', 1, 'To do', 'High', 0],
    ['T-4165', 'Virement paper | Agriculture to Transport BWP 20M', 'Director Budget', 'Budget', 'APR-2615', 0, 'Review', 'High', 95],
    ['T-4167', 'Payment batch release | 46 invoices', 'Director Finance', 'Finance', 'Resolution 4 · APR-2604', 0, 'Review', 'Critical', 90],
    ['T-4170', 'Hand-over certificate | Kasane Health Post Upgrade', 'Director Projects', 'Projects', 'PRJ-104', -1, 'Done', 'Low', 100],
    ['T-4172', 'Refresher training for finance officers', 'Director Financial Reporting', 'Finance', 'Resolution 9', 28, 'To do', 'Low', 0],
    ['T-4173', 'Budget implementation report | August (late)', 'Budget Office', 'Budget', 'Resolution 19', -9, 'In progress', 'Medium', 60],
    ['T-4175', 'Emergency procurement justification | oxygen concentrators', 'Heads of Procurement', 'Procurement', 'APR-2617', 1, 'Review', 'Medium', 80],
  ].map(([id, title, owner, dir, link, due, status, pri, progress]) => ({ id, title, owner, dir, link, due, status, pri, progress, overdue: due < 0 && status !== 'Done' }));
  const dueTxt = t => (t.due === 0 ? 'Today' : day(t.due));
  const taskRow = t => ({ id: t.id, t: { strong: t.title }, o: t.owner, l: t.link, d: t.overdue ? { pill: `${-t.due} d late`, tone: 'red' } : dueTxt(t), p: { bar: t.progress, tone: t.overdue ? 'red' : t.status === 'Done' ? 'green' : 'blue' }, s: { pill: t.status, tone: ST[t.status] }, pr: { pill: t.pri, tone: PRI[t.pri] } });
  const taskCols = (...keys) => keys.map(k => ({ id: { key: 'id', label: 'Task' }, t: { key: 't', label: 'Title' }, o: { key: 'o', label: 'Owner' }, l: { key: 'l', label: 'Linked to' }, d: { key: 'd', label: 'Due' }, p: { key: 'p', label: 'Progress' }, s: { key: 's', label: 'Status' }, pr: { key: 'pr', label: 'Priority' } }[k]));

  // ── 0 My Tasks (Permanent Secretary) ──
  const MY = [
    ['Authorise award MCP/DES/2283/26-27-01', 'To do', 'red', 'Today', 'Tender'], ['Sign briefing note BN/041', 'To do', 'amber', 'Today', 'Minister'],
    ['Approve payment batch | 46 invoices', 'To do', 'red', 'Today', 'Resolution 4'], ['Decide virement Agric → Transport', 'To do', 'amber', 'Fri 25 Sep', 'APR-2615'],
    ['Review Q3 cash-flow forecast', 'To do', 'blue', 'Fri 25 Sep', 'Resolution 12'], ['Reply to Minister | emergency procurement', 'To do', 'red', 'overdue 1 d', 'Mail'],
    ['Chair Budget Performance Review', 'In progress', 'blue', 'Thu 24 Sep', 'Meeting'], ['Board pack sign-off', 'In progress', 'amber', 'Thu 24 Sep', 'Board'],
    ['Maun wing variation decision', 'In progress', 'orange', 'Thu 24 Sep', 'PRJ-102'], ['PAC hearing preparation', 'In progress', 'blue', 'Tue 29 Sep', 'Resolution 15'],
    ['Auditor General management letter', 'In progress', 'amber', 'Wed 30 Sep', 'Resolution 7'],
    ['Recovery plan | Maun wing', 'Awaiting others', 'red', 'Dir Projects · 3 d late', 'Resolution 5'], ['PV-26-44812 documents', 'Awaiting others', 'red', 'Dir Finance · blocked', 'Audit'],
    ['Revenue variance report', 'Awaiting others', 'orange', 'Dir Revenue · 23 d late', 'Resolution 1'], ['Bank reconciliations', 'Awaiting others', 'amber', 'Chief Accountant', 'Resolution 8'],
    ['Q2 cash-flow forecast', 'Done', 'green', 'Mon', 'Resolution 12'], ['Kasane handover approval', 'Done', 'green', 'Tue', 'PRJ-104'], ['BN/038 payment arrears', 'Done', 'green', 'Fri', 'Minister'],
  ];
  register(K(0), () => {
    const by = s => MY.filter(m => m[1] === s);
    const open = MY.filter(m => m[1] !== 'Done');
    return {
      crumbs: ['Ministry of Finance', 'Permanent Secretary', 'My Tasks'],
      kpis: [
        { label: 'My open tasks', value: String(open.length), sub: `${by('To do').length} to do · ${by('In progress').length} in progress`, tone: 'blue' },
        { label: 'Due today', value: String(MY.filter(m => m[3] === 'Today').length), delta: 'all decisions', deltaTone: 'amber', sub: '', tone: 'amber' },
        { label: 'Overdue', value: String(MY.filter(m => /late|overdue/.test(m[3])).length), delta: 'incl. delegated', deltaTone: 'red', sub: '', tone: 'red' },
        { label: 'Delegated, awaiting others', value: String(by('Awaiting others').length), sub: '2 blocking decisions', tone: 'violet' },
        { label: 'On-time completion', value: '86%', delta: '▲ 4 pts vs Aug', sub: 'last 30 days', tone: 'green', pct: 86 },
      ],
      insight: { finding: 'Three decisions due today (<b>tender 2283 award</b>, the <b>Resolution 4 payment batch</b> and <b>BN/041</b>) unblock 11 downstream tasks across Procurement, Finance and Projects.', recommendation: 'Clear the three decisions before the 14:00 Minister briefing; the payment batch alone closes the oldest Resolution 4 action.', severity: 'High', tone: 'orange', actions: ['Start with oldest', 'Explain finding', 'Delegate'] },
      grid: [
        [{ span: 12, type: 'kanban', title: 'My board | Permanent Secretary', height: 360, columns: [['To do', 'slate'], ['In progress', 'blue'], ['Awaiting others', 'amber'], ['Done', 'green']].map(([n, tn]) => ({ name: n === 'Done' ? 'Done this week' : n, tone: tn, items: by(n).map(([title, , ptone, meta, link]) => ({ title, pill: link, tone: ptone, meta })) })) }],
        [
          { span: 5, type: 'list', title: 'Today\'s focus | Wed 23 Sep', height: 230, items: [
            { title: 'Authorise award MCP/DES/2283/26-27-01', meta: '11:00 meeting · waiting 6 days · BWP 3,480,000', pill: 'Decide', tone: 'red' },
            { title: 'Approve payment batch | 46 invoices, BWP 2.1M', meta: 'Resolution 4 · oldest invoice 118 days', pill: 'Decide', tone: 'red' },
            { title: 'Sign briefing note BN/041', meta: 'Before 14:00 Minister pre-Cabinet briefing', pill: 'Sign', tone: 'amber' },
            { title: 'Reply to Minister on emergency procurement', meta: 'AI draft ready · 48 h unanswered', pill: 'Reply', tone: 'orange' },
          ] },
          { span: 4, type: 'bar', title: 'My open tasks by source', height: 230, horizontal: true, categories: ['Resolutions', 'Approvals', 'Projects', 'Minister / Cabinet', 'Meetings', 'Audit & PAC'], labelMax: 18,
            series: [{ name: 'Open', data: [5, 3, 2, 2, 1, 2], color: 'blue', label: true }] },
          { span: 3, type: 'gauge', title: 'Completed on time', height: 230, gauges: [{ name: 'Last 30 days', value: 86, good: 85, warn: 70 }] },
        ],
      ],
    };
  });

  // ── 1 Team Tasks ──
  register(K(1), () => ({
    crumbs,
    kpis: [
      { label: 'Open team tasks', value: String(OPEN), sub: `${DIRS.length} directorates · ${STAFF_N} staff`, tone: 'blue' },
      { label: 'In progress', value: String(sum(DIRS, d => d.prog)), delta: fmt.pct(sum(DIRS, d => d.prog) / OPEN * 100), sub: 'of open', tone: 'cyan', pct: sum(DIRS, d => d.prog) / OPEN * 100 },
      { label: 'Awaiting review', value: String(sum(DIRS, d => d.review)), sub: 'director sign-off', tone: 'violet' },
      { label: 'Blocked', value: String(BLOCKED), delta: 'missing inputs', deltaTone: 'red', sub: '', tone: 'red' },
      { label: 'Completed this week', value: String(DONEWK), delta: '▲ 8 vs last week', sub: '', tone: 'green' },
    ],
    insight: { finding: `Procurement and Projects hold <b>${DIRS[2].open + DIRS[3].open}</b> of the ${OPEN} open tasks (${Math.round((DIRS[2].open + DIRS[3].open) / OPEN * 100)}%) and <b>${DIRS[2].blocked + DIRS[3].blocked}</b> of the ${BLOCKED} blocked items, most of them waiting on Ministry of Health documents for capital projects.`, recommendation: 'Assign a single MoH liaison officer to chase project documents for both directorates.', severity: 'Medium', tone: 'amber' },
    grid: [
      [
        { span: 7, type: 'bar', title: 'Open tasks by directorate and status', height: 280, horizontal: true, categories: DIRS.map(d => d.name), labelMax: 16,
          series: [['To do', 'todo', '#475569'], ['In progress', 'prog', 'blue'], ['Review', 'review', 'violet'], ['Blocked', 'blocked', 'red']].map(([n, k, c]) => ({ name: n, stack: 's', data: DIRS.map(d => d[k]), color: c })) },
        { span: 5, type: 'donut', title: 'Open tasks by status', height: 280, center: String(OPEN), items: [{ name: 'To do', value: sum(DIRS, d => d.todo), color: '#475569' }, { name: 'In progress', value: sum(DIRS, d => d.prog), color: 'blue' }, { name: 'Review', value: sum(DIRS, d => d.review), color: 'violet' }, { name: 'Blocked', value: BLOCKED, color: 'red' }] },
      ],
      [{ span: 12, type: 'table', title: 'Team task register | open items, soonest due first', height: 300, columns: taskCols('id', 't', 'o', 'l', 'd', 'p', 's'), rows: TASKS.filter(t => t.status !== 'Done').sort((a, b) => a.due - b.due).map(taskRow) }],
    ],
  }));

  // ── 2 Overdue Tasks ──
  register(K(2), () => {
    const od = TASKS.filter(t => t.overdue).sort((a, b) => a.due - b.due);
    const ages = ['1–7 days', '8–14 days', '15+ days'];
    const r = rng('odheat');
    const values = [];
    DIRS.forEach((d, y) => { let left = d.overdue; ages.forEach((a, x) => { const v = x === 2 ? left : Math.min(left, Math.max(0, Math.round(d.overdue * [0.5, 0.3][x] + r.num(-0.4, 0.4)))); values.push([x, y, v]); left -= v; }); });
    const buckets = ages.map((a, x) => sum(values.filter(v => v[0] === x), v => v[2]));
    return {
      crumbs,
      kpis: [
        { label: 'Overdue tasks', value: String(OVERDUE), delta: `${fmt.pct(OVERDUE / OPEN * 100)} of open`, deltaTone: 'red', sub: '', tone: 'red', pct: OVERDUE / OPEN * 100 },
        { label: '15+ days late', value: String(buckets[2]), delta: 'incl. Resolutions 1, 4', deltaTone: 'red', sub: '', tone: 'red' },
        { label: 'Linked to resolutions', value: String(od.filter(t => /Resolution/.test(t.link)).length), sub: 'in top overdue list', tone: 'violet' },
        { label: 'Avg days late', value: (sum(od, t => -t.due) / od.length).toFixed(1), delta: '▲ 1.9 vs Aug', deltaTone: 'red', sub: '', tone: 'orange' },
        { label: 'Recovered this week', value: '9', delta: '▲ 3', sub: 'closed after due date', tone: 'green' },
      ],
      insight: { finding: 'The three overdue Board resolutions (<b>1, 4 and 8</b>) account for the oldest overdue work: the revenue variance report is 23 days late and blocked on BURS data, and invoice clearance under Resolution 4 is 18 days late.', recommendation: 'Escalate Resolution 1 to the Commissioner General and set a hard date of 30 Sep for Resolution 4.', severity: 'High', tone: 'red', actions: ['Escalate', 'Explain finding', 'Reassign'] },
      grid: [
        [
          { span: 4, type: 'bar', title: 'Overdue tasks by days late', height: 250, categories: ages, series: [{ name: 'Tasks', label: true, data: buckets.map((v, i) => ({ value: v, itemStyle: { color: [C.amber, C.orange, C.red][i] } })) }] },
          { span: 8, type: 'heatmap', title: 'Overdue tasks | directorate × days late', height: 250, x: ages, y: DIRS.map(d => d.name), values, max: 5, cellFmt: v => (v ? v : ''), colors: ['#0f2a4d', '#F59E0B', '#F97316', '#EF4444'] },
        ],
        [{ span: 12, type: 'table', title: 'Overdue register | most late first', height: 300, columns: taskCols('id', 't', 'o', 'l', 'd', 'p', 'pr'), rows: od.map(taskRow) }],
      ],
    };
  });

  // ── 3 Projects Board ──
  const PT = { 'On track': 'green', 'At risk': 'amber', Critical: 'red', 'Near completion': 'cyan' };
  register(K(3), () => {
    const cnt = s => PROJECTS.filter(p => p.status === s).length;
    const openTasks = PROJECTS.map((p, i) => ({ p, n: rng('pt' + i).int(3, 9) + (p.status === 'Critical' ? 9 : p.status === 'At risk' ? 4 : 0) })).sort((a, b) => b.n - a.n);
    return {
      crumbs: [...crumbs, 'Project portfolio'],
      kpis: [
        { label: 'Projects', value: String(PROJECTS.length), sub: fmt.bwp(sum(PROJECTS, p => p.approved)) + ' approved', tone: 'blue' },
        { label: 'On track', value: String(cnt('On track') + cnt('Near completion')), delta: fmt.pct((cnt('On track') + cnt('Near completion')) / PROJECTS.length * 100), sub: 'incl. near completion', tone: 'green', pct: (cnt('On track') + cnt('Near completion')) / PROJECTS.length * 100 },
        { label: 'At risk', value: String(cnt('At risk')), sub: 'physical < 30% or gap > 10', tone: 'amber' },
        { label: 'Critical', value: String(cnt('Critical')), delta: 'Maun wing', deltaTone: 'red', sub: 'spend 33 pts ahead', tone: 'red' },
        { label: 'Project tasks open', value: String(sum(openTasks, x => x.n)), sub: 'across 16 projects', tone: 'violet' },
      ],
      insight: { finding: '<b>Maun District Hospital Wing</b> has spent 78% of its budget for 45% physical progress, the widest gap in the portfolio, and carries the most open tasks (recovery plan, VO-07, PAC records).', recommendation: 'Make the Maun recovery plan a standing item until the gap falls below 15 points.', severity: 'Critical', tone: 'red', actions: ['Open project', 'Explain finding', 'Create task'] },
      grid: [
        [{ span: 12, type: 'kanban', title: 'Portfolio board | by delivery status', height: 400, columns: ['Critical', 'At risk', 'On track', 'Near completion'].map(s => ({ name: s, tone: PT[s], items: PROJECTS.filter(p => p.status === s).map(p => ({ title: `${p.name}`, pill: `${p.physical}% phys · ${p.financial}% fin`, tone: p.gap > 10 ? 'red' : p.gap > 0 ? 'amber' : 'green', meta: `${p.ministry} · ${fmt.bwp(p.approved)}` })) })) }],
        [
          { span: 7, type: 'scatter', title: 'Physical vs financial progress (%)', height: 270, xName: 'Financial %', yName: 'Physical %', xMin: 0, xMax: 100, yMin: 0, yMax: 100, diagonal: true, labels: false,
            points: PROJECTS.map(p => ({ name: p.name, x: p.financial, y: p.physical, tone: PT[p.status], size: 8 + p.approved / 6e6 })) },
          { span: 5, type: 'bar', title: 'Open tasks per project | top 8', height: 270, horizontal: true, labelMax: 24, categories: openTasks.slice(0, 8).map(x => x.p.name),
            series: [{ name: 'Open tasks', label: true, data: openTasks.slice(0, 8).map(x => ({ value: x.n, itemStyle: { color: C[PT[x.p.status]] } })) }] },
        ],
      ],
    };
  });

  // ── 4 Gantt & Timeline (months from Apr 2024; today = Sep 2026 = 29.7) ──
  register(K(4), () => {
    const TODAY = 29.7;
    const tl = PROJECTS.map(p => { const dur = Math.round((p.end - p.start) * 1.25 + 6); const st = Math.max(0, +(TODAY - (p.planned / 100) * dur).toFixed(1)); return { p, st, en: st + dur }; }).sort((a, b) => a.st - b.st);
    return {
      crumbs: [...crumbs, 'Project portfolio'],
      kpis: [
        { label: 'Milestones this quarter', value: '23', sub: 'Oct – Dec 2026', tone: 'blue' },
        { label: 'Milestones slipped', value: '7', delta: '▲ 2 vs Q1', deltaTone: 'red', sub: 'Resolution 5', tone: 'red' },
        { label: 'Behind plan', value: String(PROJECTS.filter(p => p.planned - p.physical > 10).length) + ' projects', sub: 'planned − actual > 10 pts', tone: 'amber' },
        { label: 'Avg schedule delay', value: Math.round(sum(PROJECTS, p => p.delayDays) / PROJECTS.length) + ' days', sub: 'portfolio average', tone: 'orange' },
        { label: 'Recovery plans due', value: '5', delta: '2 received', deltaTone: 'amber', sub: 'by 07 Oct', tone: 'violet' },
      ],
      insight: { finding: `Seven projects are more than 10 points behind their planned progress; <b>A1 Palapye–Mahalapye Rehab</b> (64% vs 83% planned) and <b>Maun District Hospital Wing</b> (45% vs 67%) carry the longest delays at ${PROJECTS[6].delayDays} and ${PROJECTS[1].delayDays} days.`, recommendation: 'Request revised programmes from both contractors before the October site meetings.', severity: 'High', tone: 'orange' },
      grid: [
        [{ span: 12, type: 'gantt', title: 'Portfolio timeline | bar fill = physical progress', height: 440, start: 0, end: 60, today: TODAY, labelWidth: 230, ticks: ['Apr 2024', 'Apr 2025', 'Apr 2026', 'Apr 2027', 'Apr 2028', 'Apr 2029'],
          tasks: tl.map(({ p, st, en }) => ({ name: p.name, start: st, end: en, progress: p.physical, tone: PT[p.status], label: `${p.physical}% · ${p.status}` })) }],
        [
          { span: 7, type: 'steps', title: 'Construction of Clinic, Molepolole | milestones', steps: [{ name: 'Site handover', meta: 'May 2025', state: 'done' }, { name: 'Foundations', meta: 'Sep 2025', state: 'done' }, { name: 'Superstructure', meta: 'Feb 2026', state: 'done' }, { name: 'Roofing', meta: 'Jul 2026', state: 'done' }, { name: 'Services & finishes', meta: '58% · Nov 2026', state: 'current' }, { name: 'Equipment install', meta: 'Feb 2027' }, { name: 'Practical completion', meta: 'Apr 2027' }] },
          { span: 5, type: 'list', title: 'Milestones due in the next 30 days', height: 200, items: [
            { title: 'Kazungula Link Road | surfacing complete', meta: 'Mmila Road Contractors', value: day(9), tone: 'green' },
            { title: 'Tsabong Water Treatment | pump station commissioning', meta: 'Tlotlo Civil Works', value: day(14), tone: 'amber' },
            { title: 'Maun wing | revised programme', meta: 'Kgalagadi Builders', value: day(14), tone: 'red' },
            { title: 'Hukuntsi Solar | grid connection', meta: 'Kalahari Energy Systems', value: day(22), tone: 'green' },
          ] },
        ],
      ],
    };
  });

  // ── 5 Approvals Waiting (who is holding them) ──
  const APPR = [
    ['APR-2602', 'Recruitment of 42 nursing posts', 'Permanent Secretary', 12, 11800000], ['APR-2604', 'Payment batch | 46 invoices (Resolution 4)', 'Permanent Secretary', 9, 2100000],
    ['APR-2608', 'Variation order VO-07 | Maun wing', 'Permanent Secretary', 8, 2150000], ['APR-2609', 'Consultancy extension | e-Government Data Centre', 'Deputy PS Finance', 7, 640000],
    ['APR-2611', 'Award MCP/DES/2283/26-27-01 | Clement Pty Ltd', 'Permanent Secretary', 6, 3480000], ['APR-2613', 'Extension of time | Selebi-Phikwe Pipeline', 'Director Projects', 4, 0],
    ['APR-2614', 'Fleet hire renewal | Makgadikgadi Fleet Services', 'Chief Procurement Officer', 4, 460000], ['APR-2615', 'Virement | Agriculture to Transport', 'Permanent Secretary', 3, 20000000],
    ['APR-2616', 'Imprest retirement | Francistown district', 'Director Finance', 3, 38500], ['APR-2617', 'Emergency procurement | oxygen concentrators', 'Chief Procurement Officer', 2, 890000],
    ['APR-2618', 'Overtime authorisation | nurses, Maun', 'Director HR', 2, 214000], ['APR-2619', 'Write-off | obsolete pharmaceuticals', 'Director Finance', 1, 318000],
    ['APR-2620', 'Q3 development cash release', 'Accountant General', 1, 18400000],
  ];
  register(K(5), () => {
    const holders = ['Permanent Secretary', 'Deputy PS Finance', 'Chief Procurement Officer', 'Director Finance', 'Director Projects', 'Accountant General', 'Director HR'];
    // [≤3 d, 4–5 d, >5 d] per holder: 23 in total, 5 past five working days (3 with the PS)
    const hold = [[3, 2, 3], [2, 1, 0], [2, 1, 1], [1, 1, 0], [1, 1, 1], [1, 0, 0], [1, 1, 0]];
    return {
      crumbs: [...crumbs, 'Approval workflow'],
      kpis: [
        { label: 'Approvals waiting', value: '23', sub: 'ministry-wide', tone: 'amber' },
        { label: 'Over 5 working days', value: '5', delta: 'Resolution 14 breach', deltaTone: 'red', sub: '', tone: 'red', pct: 22 },
        { label: 'Held by PS office', value: String(hold[0].reduce((a, b) => a + b, 0)), delta: 'largest holder', deltaTone: 'amber', sub: '', tone: 'violet' },
        { label: 'Avg approval time', value: '4.2 days', delta: 'target 3', deltaTone: 'red', sub: 'Resolution 14', tone: 'orange' },
        { label: 'Auto-reminders sent', value: '38', sub: 'this month', tone: 'cyan' },
      ],
      insight: { finding: 'The PS office holds <b>8 of the 23</b> pending approvals and <b>3 of the 5</b> that have breached the five-day rule, including the nursing recruitment (12 days) and the Resolution 4 payment batch (9 days).', recommendation: 'Delegate approvals below BWP 500,000 to the Deputy PS Finance; this removes four items from the PS queue.', severity: 'High', tone: 'orange', actions: ['Delegate', 'Explain finding', 'Send reminders'] },
      grid: [
        [
          { span: 6, type: 'bar', title: 'Pending approvals by holder and age', height: 260, horizontal: true, categories: holders, labelMax: 26,
            series: [['≤ 3 days', 0, 'green'], ['4–5 days', 1, 'amber'], ['> 5 days', 2, 'red']].map(([n, i, c]) => ({ name: n, stack: 's', data: hold.map(h => h[i]), color: c })) },
          { span: 6, type: 'line', title: 'Average approval time vs target (working days)', height: 260, categories: ['W28', 'W29', 'W30', 'W31', 'W32', 'W33', 'W34', 'W35', 'W36', 'W37', 'W38', 'W39'], gridOpt: { right: 56 },
            series: [{ name: 'Average', data: [5.4, 5.1, 4.9, 4.6, 4.2, 3.8, 3.6, 3.5, 3.7, 3.9, 4.1, 4.2], color: 'amber', area: true, markLine: { value: 3, label: 'Target', tone: 'green' } }, { name: 'Longest item', data: [14, 12, 13, 11, 10, 9, 9, 8, 10, 11, 12, 12], color: 'red', dashed: true }] },
        ],
        [
          { span: 8, type: 'table', title: 'Approval queue | ministry-wide sample', height: 280,
            columns: [{ key: 'ref', label: 'Ref' }, { key: 'm', label: 'Matter' }, { key: 'h', label: 'Held by' }, { key: 'v', label: 'Value (BWP)', align: 'right' }, { key: 'w', label: 'Waiting' }],
            rows: APPR.map(([ref, m, h, w, v]) => ({ ref, m: { strong: m }, h, v: v ? fmt.n(v) : 'Nil', w: { pill: `${w} days`, tone: w > 5 ? 'red' : w > 3 ? 'amber' : 'green' } })) },
          { span: 4, type: 'funnel', title: 'Approval workflow | items this month', height: 280, items: [{ name: 'Submitted', value: 71 }, { name: 'Verified', value: 64 }, { name: 'Recommended', value: 58 }, { name: 'Decided', value: 45 }, { name: 'Approved', value: 41 }] },
        ],
      ],
    };
  });

  // ── 6 Documents Waiting ──
  const DOCS = [
    ['Supporting documents | PV-26-44812 (BWP 1,240,000)', 'Payment voucher', 'Director Finance', 'Missing', 4, 'red'],
    ['Engineer\'s instruction | Maun VO-07', 'Contract variation', 'Director Projects', 'Missing', 3, 'red'],
    ['Award memo | MCP/DES/2283/26-27-01', 'Tender', 'Permanent Secretary', 'For signature', 6, 'amber'],
    ['Briefing note BN/041', 'Briefing note', 'Permanent Secretary', 'For signature', 0, 'amber'],
    ['Management letter responses | FY25', 'Audit', 'Chief Internal Auditor', 'Drafting', 2, 'blue'],
    ['PAC records | Construction of Clinic', 'Parliament', 'Director Parliamentary Affairs', 'Collating', 5, 'blue'],
    ['Bank reconciliation statements | 4 departments', 'Reconciliation', 'Chief Accountant', 'Missing', 13, 'red'],
    ['Stock count certificate | Central Medical Stores', 'Inventory', 'Director Supplies', 'Missing', 2, 'red'],
    ['Q3 procurement plans | 6 of 11 departments', 'Procurement plan', 'Heads of Procurement', 'Partial', 3, 'amber'],
    ['Delivery notes | Okavango Medical Supplies', 'GRN', 'Director Supplies', 'Missing', 7, 'red'],
    ['Virement request APR-2615', 'Budget', 'Permanent Secretary', 'For signature', 3, 'amber'],
  ];
  register(K(6), () => ({
    crumbs: [...crumbs, 'Document management'],
    kpis: [
      { label: 'Documents awaiting action', value: '58', sub: 'ministry-wide', tone: 'blue' },
      { label: 'Awaiting your signature', value: '9', delta: '3 older than 3 days', deltaTone: 'amber', sub: '', tone: 'amber' },
      { label: 'Missing supporting docs', value: '14', delta: 'BWP 3.9M on hold', deltaTone: 'red', sub: '', tone: 'red' },
      { label: 'Avg wait', value: '3.8 days', delta: '▼ 0.6', deltaTone: 'green', sub: 'receipt to action', tone: 'cyan' },
      { label: 'Statutory responses due', value: '2', sub: 'PAC, Auditor General', tone: 'violet' },
    ],
    insight: { finding: 'Fourteen transactions worth <b>BWP 3.9M</b> are held because supporting documents are missing; the largest is PV-26-44812 (BWP 1,240,000), which has triggered the "payment without supporting documentation" indicator.', recommendation: 'Set a 48-hour deadline for the missing documents; unresolved items go to the Chief Internal Auditor (Resolution 7).', severity: 'High', tone: 'red', actions: ['Request documents', 'Explain finding', 'Refer to audit'] },
    grid: [
      [
        { span: 8, type: 'table', title: 'Documents waiting | oldest missing first', height: 300,
          columns: [{ key: 'd', label: 'Document' }, { key: 'o', label: 'With' }, { key: 'a', label: 'Days', align: 'right' }, { key: 's', label: 'State' }],
          rows: [...DOCS].sort((a, b) => (b[5] === 'red') - (a[5] === 'red') || b[4] - a[4]).map(([d, t, o, s, a, tn]) => ({ d: { strong: d }, o, a, s: { pill: s, tone: tn } })) },
        { span: 4, type: 'donut', title: 'Waiting documents by type', height: 300, center: '58', items: [{ name: 'Payment support', value: 14, color: 'red' }, { name: 'Signatures', value: 9, color: 'amber' }, { name: 'Contract documents', value: 11, color: 'violet' }, { name: 'Reports & returns', value: 13, color: 'blue' }, { name: 'Audit & PAC', value: 6, color: 'cyan' }, { name: 'Other', value: 5, color: '#475569' }] },
      ],
      [
        { span: 5, type: 'funnel', title: 'Document workflow | this month', height: 240, items: [{ name: 'Received', value: 412 }, { name: 'Registered', value: 398 }, { name: 'Reviewed', value: 361 }, { name: 'Signed / approved', value: 327 }, { name: 'Dispatched & filed', value: 315 }] },
        { span: 7, type: 'bar', title: 'Documents waiting by directorate and age', height: 240, categories: DIRS.map(d => d.name), rotate: 0, labelMax: 10,
          series: [{ name: '0–3 days', stack: 'a', data: [4, 3, 5, 4, 3, 2, 2, 1, 2], color: 'green' }, { name: '4–7 days', stack: 'a', data: [2, 1, 3, 3, 3, 1, 1, 1, 0], color: 'amber' }, { name: '8+ days', stack: 'a', data: [1, 0, 2, 2, 3, 1, 1, 0, 1], color: 'red' }] },
      ],
    ],
  }));

  // ── 7 Meetings & Commitments ──
  const MEET = [['Budget Review Meeting', 20, 9, 3, 'blue'], ['PS Management Committee', 14, 10, 1, 'cyan'], ['Board of Management', 11, 7, 1, 'violet'], ['MoH Capital Projects Recovery', 8, 3, 1, 'red'], ['Development Partners Forum', 6, 5, 0, 'green'], ['PAC preparation', 5, 5, 0, 'amber']];
  register(K(7), () => {
    const made = sum(MEET, m => m[1]), kept = sum(MEET, m => m[2]), late = sum(MEET, m => m[3]);
    return {
      crumbs: [...crumbs, 'Meetings'],
      kpis: [
        { label: 'Commitments made', value: String(made), sub: 'Q2, 6 meeting series', tone: 'blue' },
        { label: 'Fulfilled', value: String(kept), delta: fmt.pct(kept / made * 100), sub: 'fulfilment rate', tone: 'green', pct: kept / made * 100 },
        { label: 'Open, on time', value: String(made - kept - late), sub: 'in progress', tone: 'cyan' },
        { label: 'Overdue', value: String(late), delta: 'Resolutions 1, 4, 8', deltaTone: 'red', sub: '', tone: 'red' },
        { label: 'Meetings this week', value: '11', sub: '7 actions due from them', tone: 'violet' },
      ],
      insight: { finding: `The <b>Budget Review Meeting</b> has the lowest fulfilment rate (${Math.round(MEET[0][2] / MEET[0][1] * 100)}%) and all three overdue resolutions. Commitments made in chat groups and the PS Management Committee close fastest (median 4 days).`, recommendation: 'Open Thursday\'s Budget Performance Review with the three overdue resolutions and require revised dates from each owner.', severity: 'Medium', tone: 'amber' },
      grid: [
        [
          { span: 7, type: 'bar', title: 'Commitments by meeting series', height: 260, horizontal: true, categories: MEET.map(m => m[0]), labelMax: 28,
            series: [{ name: 'Fulfilled', stack: 'c', data: MEET.map(m => m[2]), color: 'green' }, { name: 'Open', stack: 'c', data: MEET.map(m => m[1] - m[2] - m[3]), color: 'blue' }, { name: 'Overdue', stack: 'c', data: MEET.map(m => m[3]), color: 'red' }] },
          { span: 5, type: 'line', title: 'Fulfilment rate by month (%)', height: 260, categories: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'], max: 100, gridOpt: { right: 56 },
            series: [{ name: 'Fulfilled on time', data: [58, 61, 64, 60, 66, Math.round(kept / made * 100)], color: 'green', area: true, markLine: { value: 80, label: 'Target', tone: 'cyan' } }] },
        ],
        [{ span: 12, type: 'table', title: 'Commitment register | open and overdue', height: 280,
          columns: [{ key: 'c', label: 'Commitment' }, { key: 'm', label: 'Made at' }, { key: 'o', label: 'Owner' }, { key: 'd', label: 'Due' }, { key: 's', label: 'Status' }],
          rows: [
            ['Monthly revenue collection at 95% of target', 'Budget Review 09 Jul', 'Commissioner General / Director Revenue', '31 Aug', 'Overdue'],
            ['Clear verified invoices older than 30 days', 'Budget Review 09 Jul', 'Director Finance', '05 Sep', 'Overdue'],
            ['Bank reconciliations before the 10th', 'Budget Review 09 Jul', 'Chief Accountant', '10 Sep', 'Overdue'],
            ['Recovery plan | Maun District Hospital Wing', 'MoH Recovery 22 Sep', 'Director Projects', day(1), 'Open'],
            ['Executive Dashboard concept paper', 'Budget Review 09 Jul', 'ICT Directorate', '06 Aug', 'Fulfilled'],
            ['Circulate 2283 award memo to committee', 'Team chat 21 Sep', 'Chief Procurement Officer', day(0), 'Open'],
            ['Donor reconciliation template', 'Partners Forum 22 Sep', 'Director External Resources', day(9), 'Open'],
            ['Board pack using month-6 actuals', 'Board of Management 28 Aug', 'Board Secretary', day(1), 'Open'],
            ['PAC focal persons appointed', 'PAC preparation 15 Sep', 'Director Parliamentary Affairs', '18 Sep', 'Fulfilled'],
          ].map(([c, m, o, d, s]) => ({ c: { strong: c }, m, o, d, s: { pill: s, tone: s === 'Overdue' ? 'red' : s === 'Open' ? 'blue' : 'green' } })) }],
      ],
    };
  });

  // ── 8 Resolution Actions (20 resolutions from the Budget Review Meeting) ──
  const RES = [
    [1, 'Revenue monitoring', 'Commissioner General / Director Revenue', 38, 'Overdue', 4, '31 Aug'], [2, 'Tighter expenditure controls', 'Accountant General', 72, 'On track', 3, '30 Sep'],
    [3, 'Fast-track procurement planning', 'Chief Procurement Officer', 55, 'On track', 4, 'Weekly'], [4, 'Supplier payment arrears', 'Director Finance', 62, 'Overdue', 5, '05 Sep'],
    [5, 'Project performance reviews', 'Director Projects', 48, 'At risk', 6, '07 Oct'], [6, 'Donor project monitoring', 'Director External Resources', 60, 'On track', 3, 'Monthly'],
    [7, 'Internal audit findings', 'Chief Internal Auditor', 85, 'On track', 3, 'Monthly'], [8, 'Bank reconciliations', 'Chief Accountant', 70, 'Overdue', 2, '10 Sep'],
    [9, 'Financial reporting quality', 'Director Financial Reporting', 30, 'On track', 2, '21 Oct'], [10, 'Contract performance monitoring', 'Procurement Director', 30, 'At risk', 3, '15 Oct'],
    [11, 'Emergency procurement', 'Heads of Procurement', 48, 'At risk', 4, '30 Sep'], [12, 'Cash-flow forecasting', 'Treasury Operations Director', 100, 'Completed', 2, 'Done'],
    [13, 'Departmental KPI monitoring', 'Director Strategy & Performance', 100, 'Completed', 3, 'Done'], [14, 'Pending payment approvals', 'Chief Finance Officer', 65, 'On track', 3, '30 Sep'],
    [15, 'PAC responses', 'Director Parliamentary Affairs', 100, 'Completed', 2, 'Done'], [16, 'Asset verification', 'Director Assets Management', 100, 'Completed', 3, 'Done'],
    [17, 'Operating cost savings', 'All Accounting Officers', 75, 'On track', 4, 'Monthly'], [18, 'Grants and transfers', 'Director Budget', 100, 'Completed', 2, 'Done'],
    [19, 'Timely budget reports', 'Budget Office', 60, 'At risk', 3, 'Weekly'], [20, 'Executive Financial Intelligence Dashboard', 'Permanent Secretary / Director ICT / Accountant General', 100, 'Completed', 4, 'Done'],
  ];
  const RT = { Overdue: 'red', 'At risk': 'amber', 'On track': 'blue', Completed: 'green' };
  register(K(8), () => {
    const c = s => RES.filter(r => r[4] === s).length;
    return {
      crumbs: [...crumbs, 'Budget Review Meeting 09 Jul 2026'],
      kpis: [
        { label: 'Resolutions tracked', value: '20', sub: 'Budget Review Meeting', tone: 'blue' },
        { label: 'Outstanding', value: String(20 - c('Completed')), sub: `${c('On track')} on track · ${c('At risk')} at risk`, tone: 'violet', pct: (20 - c('Completed')) / 20 * 100 },
        { label: 'Overdue', value: String(c('Overdue')), delta: 'Resolutions 1, 4, 8', deltaTone: 'red', sub: '', tone: 'red' },
        { label: 'Completed', value: String(c('Completed')), delta: fmt.pct(c('Completed') / 20 * 100), sub: 'closed with evidence', tone: 'green', pct: c('Completed') / 20 * 100 },
        { label: 'Action tasks', value: String(sum(RES, r => r[5])), sub: `${sum(RES.filter(r => r[4] !== 'Completed'), r => r[5])} still open`, tone: 'cyan' },
      ],
      insight: { finding: 'Fourteen resolutions remain outstanding. <b>Resolution 1</b> (revenue at 87% vs 95% target) is the furthest behind at 38% of its action plan; Resolutions 4 and 8 are close to completion but past their dates.', recommendation: 'Accept revised dates of 30 Sep for Resolutions 4 and 8; ask the Commissioner General for a recovery plan on Resolution 1.', severity: 'High', tone: 'orange', actions: ['Open resolution', 'Explain finding', 'Notify owners'] },
      grid: [
        [
          { span: 8, type: 'bar', title: 'Action-plan progress by resolution (%)', height: 270, categories: RES.map(r => `R${r[0]}`), rotate: 0, barWidth: 16,
            series: [{ name: 'Progress', data: RES.map(r => ({ value: r[3], itemStyle: { color: C[RT[r[4]]] } })), markLine: { value: 50, label: 'Half-way', tone: 'cyan' } }], gridOpt: { right: 60 } },
          { span: 4, type: 'donut', title: 'Resolutions by status', height: 270, center: '20', items: ['Completed', 'On track', 'At risk', 'Overdue'].map(s => ({ name: s, value: c(s), color: RT[s] })) },
        ],
        [{ span: 12, type: 'table', title: 'Resolution action register', height: 320,
          columns: [{ key: 'n', label: '#' }, { key: 'r', label: 'Resolution' }, { key: 'o', label: 'Responsible officer' }, { key: 't', label: 'Tasks', align: 'right' }, { key: 'd', label: 'Due' }, { key: 'p', label: 'Progress' }, { key: 's', label: 'Status' }],
          rows: RES.map(([n, r, o, p, s, t, d]) => ({ n, r: { strong: r }, o, t, d, p: { bar: p, tone: RT[s] }, s: { pill: s, tone: RT[s] } })) }],
      ],
    };
  });

  // ── 9 Escalations ──
  register(K(9), () => ({
    crumbs: [...crumbs, 'Escalations'],
    kpis: [
      { label: 'Open escalations', value: '16', delta: '▲ 4 this week', deltaTone: 'red', sub: '', tone: 'red' },
      { label: 'At PS level', value: '7', sub: 'need your decision', tone: 'orange' },
      { label: 'Auto-escalated', value: '9', sub: 'five-day rule (Res 14)', tone: 'violet' },
      { label: 'Resolved this month', value: '21', delta: '▲ 6 vs Aug', sub: '', tone: 'green' },
      { label: 'Avg time to resolve', value: '3.1 days', delta: '▼ 0.8', deltaTone: 'green', sub: 'after escalation', tone: 'cyan' },
    ],
    insight: { finding: 'Seven escalations have reached PS level; four concern the <b>Ministry of Health capital programme</b> and two concern overdue resolutions. Nine were raised automatically by the five-working-day rule introduced under Resolution 14.', recommendation: 'Resolve the four Health items together at Thursday\'s review; return the two resolution escalations to the owners with fixed dates.', severity: 'High', tone: 'orange', actions: ['Open escalations', 'Explain finding', 'Assign'] },
    grid: [
      [
        { span: 7, type: 'sankey', title: 'Escalation path this quarter | raised at → resolved at', height: 280,
          nodes: ['Officer', 'Director', 'Deputy PS', 'Permanent Secretary', 'Resolved at director', 'Resolved at DPS', 'Resolved at PS', 'Open'],
          links: [{ source: 'Officer', target: 'Director', value: 43 }, { source: 'Director', target: 'Resolved at director', value: 14 }, { source: 'Director', target: 'Open', value: 6 }, { source: 'Director', target: 'Deputy PS', value: 23 }, { source: 'Deputy PS', target: 'Resolved at DPS', value: 7 }, { source: 'Deputy PS', target: 'Permanent Secretary', value: 13 }, { source: 'Deputy PS', target: 'Open', value: 3 }, { source: 'Permanent Secretary', target: 'Resolved at PS', value: 6 }, { source: 'Permanent Secretary', target: 'Open', value: 7 }] },
        { span: 5, type: 'bar', title: 'Open escalations by reason', height: 280, horizontal: true, labelMax: 26, categories: ['Approval over 5 days', 'Missing documents', 'Budget overrun', 'Contractor delay', 'Resolution overdue', 'Audit finding'],
          series: [{ name: 'Open', label: true, data: [5, 3, 3, 2, 2, 1].map((v, i) => ({ value: v, itemStyle: { color: [C.amber, C.red, C.orange, C.violet, C.pink, C.cyan][i] } })) }] },
      ],
      [{ span: 12, type: 'table', title: 'Escalation register', height: 300,
        columns: [{ key: 'e', label: 'Ref' }, { key: 'm', label: 'Matter' }, { key: 'f', label: 'Raised by' }, { key: 'l', label: 'Now with' }, { key: 'a', label: 'Age', align: 'right' }, { key: 'r', label: 'Trigger' }, { key: 's', label: 'Level' }],
        rows: [
          ['ESC-311', 'Maun wing VO-07 | 7 variations, +50.8% contract value', 'Director Projects', 'Permanent Secretary', 4, 'Budget overrun', 'Critical'],
          ['ESC-309', 'PV-26-44812 | no supporting documents', 'Chief Internal Auditor', 'Permanent Secretary', 2, 'Missing documents', 'Critical'],
          ['ESC-306', 'Award MCP/DES/2283 | 6 days without authorisation', 'Workflow (auto)', 'Permanent Secretary', 1, 'Approval over 5 days', 'High'],
          ['ESC-305', 'Resolution 1 | revenue report 23 days late', 'Board Secretary', 'Permanent Secretary', 8, 'Resolution overdue', 'High'],
          ['ESC-304', 'Payment batch | 46 invoices over 30 days', 'Workflow (auto)', 'Permanent Secretary', 4, 'Approval over 5 days', 'High'],
          ['ESC-302', 'Ghanzi labs | procurement re-launch blocked', 'Director Projects', 'Deputy PS Finance', 6, 'Contractor delay', 'High'],
          ['ESC-301', 'Resolution 8 | 4 departments missed 10 Sep', 'Accountant General', 'Permanent Secretary', 13, 'Resolution overdue', 'Medium'],
          ['ESC-298', 'Nursing posts | 12 days awaiting approval', 'Workflow (auto)', 'Permanent Secretary', 7, 'Approval over 5 days', 'Medium'],
          ['ESC-296', 'Tsabong Water | commissioning delayed', 'Project Engineer', 'Director Projects', 5, 'Contractor delay', 'Medium'],
        ].map(([e, m, f, l, a, r, s]) => ({ e, m: { strong: m }, f, l, a: `${a} d`, r, s: { pill: s, tone: PRI[s] } })) }],
    ],
  }));

  // ── 10 Workload by Employee & Department ──
  register(K(10), () => {
    const cap = 10;
    const util = d => Math.round((d.open / (d.staff * 8.5)) * 100);
    return {
      crumbs: [...crumbs, 'Workload'],
      kpis: [
        { label: 'Staff with tasks', value: String(STAFF_N), sub: `${DIRS.length} directorates`, tone: 'blue' },
        { label: 'Avg open tasks', value: (OPEN / STAFF_N).toFixed(1), sub: 'per person', tone: 'cyan' },
        { label: 'Over capacity', value: String(STAFF.filter(s => s.open > cap).length), delta: `> ${cap} open tasks`, deltaTone: 'red', sub: 'key staff', tone: 'red' },
        { label: 'Light load', value: String(STAFF.filter(s => s.open < 5).length), delta: '< 5 open tasks', deltaTone: 'amber', sub: 'key staff', tone: 'amber' },
        { label: 'Capacity used', value: fmt.pct(OPEN / (STAFF_N * 8.5) * 100), sub: '8.5 open tasks per person = 100%', tone: 'violet', pct: OPEN / (STAFF_N * 8.5) * 100 },
      ],
      insight: { finding: `<b>${STAFF[0].name}</b> (Chief Procurement Officer) and <b>${STAFF[1].name}</b> (Director Projects) each carry more than 12 open tasks, with ${STAFF[0].overdue + STAFF[1].overdue} overdue between them. Revenue, ICT and Treasury are below 60% of capacity.`, recommendation: 'Move the contract-dashboard specification (Resolution 10) from Procurement to ICT and give the Tsabong inspection to a second project engineer.', severity: 'Medium', tone: 'amber', actions: ['Rebalance', 'Explain finding', 'Open team view'] },
      grid: [
        [
          { span: 7, type: 'bar', title: 'Open tasks per employee | key staff (capacity 10)', height: 340, horizontal: true, labelMax: 34, categories: STAFF.map(s => s.label),
            series: [{ name: 'Overdue', stack: 's', data: STAFF.map(s => s.overdue), color: 'red' }, { name: 'In progress', stack: 's', data: STAFF.map(s => s.prog), color: 'blue' }, { name: 'To do', stack: 's', data: STAFF.map(s => s.todo), color: '#475569' }] },
          { span: 5, type: 'treemap', title: 'Open tasks by directorate', height: 340, items: DIRS.map(d => ({ name: d.name, value: d.open })) },
        ],
        [{ span: 12, type: 'table', title: 'Directorate workload', height: 280,
          columns: [{ key: 'd', label: 'Directorate' }, { key: 'h', label: 'Head' }, { key: 's', label: 'Staff', align: 'right' }, { key: 'o', label: 'Open', align: 'right' }, { key: 'pp', label: 'Per person', align: 'right' }, { key: 'od', label: 'Overdue', align: 'right' }, { key: 'u', label: 'Capacity used' }, { key: 'f', label: 'Load' }],
          rows: DIRS.map(d => { const u = util(d); return { d: { strong: d.name }, h: d.head, s: d.staff, o: d.open, pp: (d.open / d.staff).toFixed(1), od: d.overdue, u: { bar: Math.min(u, 100), text: u + '%', tone: u > 100 ? 'red' : u > 85 ? 'amber' : 'green' }, f: u > 100 ? { pill: 'Overloaded', tone: 'red' } : u > 85 ? { pill: 'Stretched', tone: 'amber' } : u < 60 ? { pill: 'Spare capacity', tone: 'cyan' } : { pill: 'Balanced', tone: 'green' } }; }) }],
      ],
    };
  });

  // ── 11 Upcoming Deadlines ──
  register(K(11), () => {
    const r = rng('deadlines');
    const days14 = Array.from({ length: 14 }, (_, i) => i + 1);
    const lab = days14.map(i => day(i).slice(0, 6).replace(' ', '\n'));
    const wk = i => /Sat|Sun/.test(day(i));
    const mk = (lo, hi) => days14.map(i => (wk(i) ? 0 : r.int(lo, hi)));
    const tasks = mk(3, 6), approvals = mk(1, 2), reports = mk(0, 1), statutory = days14.map(i => ([6, 7].includes(i) ? 1 : 0));
    return {
      crumbs: [...crumbs, 'Deadlines'],
      kpis: [
        { label: 'Due in next 7 days', value: String(sum(days14.slice(0, 7), i => tasks[i - 1] + approvals[i - 1] + reports[i - 1] + statutory[i - 1])), delta: '9 at risk', deltaTone: 'amber', sub: '', tone: 'amber' },
        { label: 'Due in next 30 days', value: '88', sub: 'tasks, approvals, reports', tone: 'blue' },
        { label: 'Statutory deadlines', value: '3', sub: 'PAC, Auditor General, Q3 revision', tone: 'violet' },
        { label: 'At risk', value: '9', delta: 'progress < 50%', deltaTone: 'red', sub: '', tone: 'red' },
        { label: 'Board pack lock', value: 'Thu 17:00', sub: 'meeting Fri 25 Sep', tone: 'cyan' },
      ],
      insight: { finding: 'The next 10 days carry three hard deadlines: the <b>board pack lock</b> (Thu 24 Sep), <b>Auditor General responses</b> (Wed 30 Sep) and the <b>PAC hearing records</b> (Tue 29 Sep). Nine deliverables due this week are below 50% complete.', recommendation: 'Review the nine at-risk items at Thursday\'s review and agree which can move to after the board meeting.', severity: 'Medium', tone: 'amber' },
      grid: [
        [
          { span: 8, type: 'bar', title: 'Deadlines per day | next 14 days', height: 260, categories: lab, rotate: 0,
            series: [{ name: 'Tasks', stack: 'd', data: tasks, color: 'blue' }, { name: 'Approvals', stack: 'd', data: approvals, color: 'amber' }, { name: 'Reports', stack: 'd', data: reports, color: 'violet' }, { name: 'Statutory', stack: 'd', data: statutory, color: 'red' }] },
          { span: 4, type: 'list', title: 'Next 72 hours', height: 260, items: [
            { title: 'Authorise tender MCP/DES/2283 award', meta: 'Permanent Secretary · tender', value: 'Today', tone: 'red' },
            { title: 'Payment batch | Resolution 4', meta: 'Director Finance · BWP 2.1M', value: 'Today', tone: 'red' },
            { title: 'Maun wing variation file (VO-07)', meta: 'Director Projects', value: day(1), tone: 'orange' },
            { title: 'Board pack lock', meta: 'Board Secretary · 17:00', value: day(1), tone: 'amber' },
            { title: 'Procurement progress report', meta: 'Chief Procurement Officer · Resolution 3', value: day(2), tone: 'blue' },
            { title: 'Board of Management meeting', meta: 'Treasury Boardroom · 09:00', value: day(2), tone: 'violet' },
          ] },
        ],
        [{ span: 12, type: 'table', title: 'Deadline register | next 30 days', height: 300, columns: taskCols('id', 't', 'o', 'l', 'd', 'p', 'pr'),
          rows: TASKS.filter(t => t.due >= 0 && t.status !== 'Done').sort((a, b) => a.due - b.due).map(t => ({ ...taskRow(t), p: { bar: t.progress, tone: t.progress < 50 && t.due <= 7 ? 'red' : 'blue' } })) }],
      ],
    };
  });
})();
