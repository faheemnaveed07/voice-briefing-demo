/* Menu 1: Executive Briefing & Board Pack.
 * Tabs 0 (Voice Briefing), 1 (Organisation Health) and 9 (Minutes & Resolutions) are hand-built in index.html.
 * Figures reuse the hand-built anchors: approvals waiting 23, resolutions outstanding 14 (1, 4, 8 overdue),
 * high-risk issues 8, tender MCP/DES/2283 awaiting authorisation 6 days, PV BWP 1,240,000 without documents.
 */
(function () {
  const { register, fmt, rng, C } = DASH;
  const { MONTHS, MONTH_NOW } = DASH.data;
  const K = n => `0-${n}`;
  const crumbs = ['Ministry of Finance', 'Office of the Permanent Secretary'];
  // Mockup "today" is Wed 23 Sep 2026; day(off) -> "Thu 24 Sep"
  const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], MN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = off => { const d = new Date(Date.UTC(2026, 8, 23 + off)); return `${WD[d.getUTCDay()]} ${String(d.getUTCDate()).padStart(2, '0')} ${MN[d.getUTCMonth()]}`; };
  const SEV = { Critical: 'red', High: 'orange', Medium: 'amber', Normal: 'green' };
  const docHead = (sub, ref, cls = 'RESTRICTED') => `
    <div style="text-align:center;font-size:10.5px;letter-spacing:.14em;color:#555">${cls}</div>
    <div style="text-align:center;font-weight:700;font-size:13px;margin-top:6px;letter-spacing:.04em">REPUBLIC OF BOTSWANA</div>
    <div style="text-align:center;font-size:12px">Ministry of Finance | Office of the Permanent Secretary</div>
    <div style="text-align:center;font-weight:700;font-size:16px;margin-top:12px;text-decoration:underline">${sub}</div>
    <div style="text-align:center;font-family:'Courier New',monospace;font-size:11px;color:#444;margin-top:2px">${ref}</div>`;
  const H = t => `<div style="font-weight:700;font-size:12.5px;margin:14px 0 4px;letter-spacing:.04em">${t}</div>`;
  const TD = 'border:1px solid #bbb;padding:3px 6px';

  // ── 2 Briefing Notes ──
  const notes = [
    ['MOF/BN/2026/041', 'Cost overruns on Ministry of Health capital projects', 'Minister of Finance', 'Awaiting PS signature', 'amber', 0],
    ['MOF/BN/2026/040', 'Emergency procurement at 7.2% of total procurement value', 'Minister of Finance', 'With Director Procurement', 'blue', -1],
    ['MOF/BN/2026/039', 'Q2 revenue collections: 87% of target (Resolution 1)', 'Cabinet Sub-Committee', 'Returned for revision', 'red', -2],
    ['MOF/BN/2026/038', 'Supplier payment arrears older than 30 days (Resolution 4)', 'Minister of Finance', 'Signed', 'green', -5],
    ['MOF/BN/2026/037', 'Mid-year virement request: Agriculture to Transport BWP 20M', 'Minister of Finance', 'Signed', 'green', -7],
    ['MOF/BN/2026/036', 'Tender MCP/DES/2283 furniture award recommendation', 'Minister of Finance', 'Awaiting PS signature', 'amber', -8],
    ['MOF/BN/2026/035', 'Donor-funded project reconciliation gaps (Resolution 6)', 'Development Partners Forum', 'Signed', 'green', -12],
    ['MOF/BN/2026/034', 'Executive Financial Intelligence Dashboard roadmap (Resolution 20)', 'Minister of Finance', 'Signed', 'green', -14],
  ];
  const noteHtml = `${docHead('BRIEFING NOTE TO THE MINISTER OF FINANCE', 'Ref: MOF/BN/2026/041')}
    <table style="width:100%;border-collapse:collapse;margin-top:14px;font-size:12px">
      <tr><td style="width:92px;font-weight:700;padding:2px 0">To:</td><td>Honourable Minister of Finance</td></tr>
      <tr><td style="font-weight:700;padding:2px 0">From:</td><td>Permanent Secretary, Ministry of Finance</td></tr>
      <tr><td style="font-weight:700;padding:2px 0">Date:</td><td>Wednesday, 23 September 2026</td></tr>
      <tr><td style="font-weight:700;padding:2px 0">Subject:</td><td><b>Cost overruns on three Ministry of Health capital projects</b></td></tr>
    </table>
    <hr style="border:0;border-top:1px solid #999;margin:12px 0 4px">
    ${H('1. PURPOSE')}
    <p style="margin:0">To inform the Minister of cost overruns exceeding 25% on three Ministry of Health capital projects and to seek approval for the recommended recovery measures.</p>
    ${H('2. BACKGROUND')}
    <p style="margin:0">The Ministry of Health has an approved FY 2026-27 allocation of BWP 54,487,102, of which 54% has been spent by month 6 of 12 against a phased expectation of 50%. Capital Projects has used 75% of its allocation. Board Resolution 5 requires monthly performance reviews for all capital projects behind schedule.</p>
    ${H('3. ISSUES')}
    <table style="width:100%;border-collapse:collapse;font-size:11.5px;margin:4px 0 6px">
      <tr style="background:#eee;font-weight:700"><td style="${TD}">Project</td><td style="${TD};text-align:right">Approved (BWP M)</td><td style="${TD};text-align:right">Forecast (BWP M)</td><td style="${TD};text-align:right">Variance</td><td style="${TD};text-align:right">Physical</td></tr>
      <tr><td style="${TD}">Maun District Hospital Wing</td><td style="${TD};text-align:right">48.0</td><td style="${TD};text-align:right">61.9</td><td style="${TD};text-align:right">+29%</td><td style="${TD};text-align:right">45%</td></tr>
      <tr><td style="${TD}">Construction of Clinic, Molepolole</td><td style="${TD};text-align:right">25.0</td><td style="${TD};text-align:right">31.8</td><td style="${TD};text-align:right">+27%</td><td style="${TD};text-align:right">58%</td></tr>
      <tr><td style="${TD}">Francistown Referral Theatre</td><td style="${TD};text-align:right">19.5</td><td style="${TD};text-align:right">24.6</td><td style="${TD};text-align:right">+26%</td><td style="${TD};text-align:right">52%</td></tr>
    </table>
    <ul style="margin:4px 0 0 20px;padding:0">
      <li>Financial spend on the Maun wing (78%) is well ahead of physical progress (45%); seven contract variations have been raised.</li>
      <li>Total forecast overrun is BWP 25.8M, which cannot be absorbed within the current Ministry of Health vote.</li>
      <li>These transactions have triggered cost-variance indicators; they are flags for review, not findings of wrongdoing.</li>
    </ul>
    ${H('4. RECOMMENDATION')}
    <p style="margin:0">It is recommended that the Minister: (a) notes the overruns; (b) approves a freeze on new variations above BWP 500,000 pending review; and (c) directs the Director Projects to submit recovery plans by 07 October 2026.</p>
    <table style="width:100%;border-collapse:collapse;margin-top:18px;font-size:11.5px">
      <tr><td style="width:50%;padding-top:18px;border-top:1px solid #444">Permanent Secretary</td><td style="width:8%"></td><td style="padding-top:18px;border-top:1px solid #444">Minister's decision: &#9744; Approved &nbsp;&#9744; Not approved &nbsp;&#9744; Discuss</td></tr>
    </table>`;
  register(K(2), () => ({
    crumbs: [...crumbs, 'Briefing Notes'],
    kpis: [
      { label: 'Notes this FY', value: '41', delta: '▲ 6 vs Q1', sub: 'to Minister and Cabinet', tone: 'blue' },
      { label: 'Awaiting my signature', value: '2', delta: 'BN/041, BN/036', deltaTone: 'amber', sub: '', tone: 'amber' },
      { label: 'AI-drafted first versions', value: '61%', sub: '25 of 41 notes', tone: 'violet', pct: 61 },
      { label: 'Avg turnaround', value: '2.3 days', delta: '▼ 0.9 days', deltaTone: 'green', sub: 'request to signature', tone: 'cyan' },
      { label: 'Returned for revision', value: '3', delta: 'BN/039 open', deltaTone: 'red', sub: 'this quarter', tone: 'red' },
    ],
    insight: { finding: 'Briefing note <b>MOF/BN/2026/041</b> on Ministry of Health cost overruns is ready for signature; the three projects carry a combined forecast overrun of <b>BWP 25.8M</b>. BN/039 on revenue was returned because the Q2 figure lacked the BURS reconciliation.', recommendation: 'Sign BN/041 today so it reaches the Minister before Friday\'s board meeting.', severity: 'High', tone: 'orange', actions: ['Open for signature', 'Regenerate with AI', 'Assign reviewer'] },
    grid: [
      [
        { span: 7, type: 'doc', title: 'Preview | MOF/BN/2026/041', badge: ['Awaiting signature', 'amber'], height: 520, html: noteHtml },
        { span: 5, type: 'list', title: 'Recent briefing notes', height: 548, items: notes.map(([ref, t, to, st, tn, off]) => ({ title: t, meta: `${ref} · to ${to} · ${day(off)}`, pill: st, tone: tn })) },
      ],
      [
        { span: 7, type: 'steps', title: 'BN/041 workflow', steps: [{ name: 'Requested by Minister', meta: 'Fri 18 Sep', state: 'done' }, { name: 'AI first draft', meta: 'Fri 18 Sep', state: 'done' }, { name: 'Director Projects review', meta: 'Mon 21 Sep', state: 'done' }, { name: 'DPS Finance review', meta: 'Tue 22 Sep', state: 'done' }, { name: 'PS signature', meta: 'Today', state: 'current' }, { name: 'Minister decision', meta: 'Target Fri 25 Sep' }] },
        { span: 5, type: 'bar', title: 'Notes issued by month and status', height: 120, categories: MONTHS.slice(0, MONTH_NOW),
          series: [{ name: 'Signed', stack: 's', data: [5, 6, 7, 6, 8, 3], color: 'green' }, { name: 'In progress', stack: 's', data: [0, 0, 0, 0, 0, 3], color: 'amber' }, { name: 'Returned', stack: 's', data: [1, 0, 1, 0, 0, 1], color: 'red' }] },
      ],
    ],
  }));

  // ── 3 Matters to Attend ──
  const matters = [
    ['Ministry of Health: 3 capital projects over 25% cost variance', 'Projects Analytics', 'Critical', 'Director Projects', 2, 'Recovery plan'],
    ['Payment without supporting documents | BWP 1,240,000', 'Oversight & Audit', 'Critical', 'Chief Internal Auditor', 1, 'Refer to audit'],
    ['Tender MCP/DES/2283 awaiting authorisation for 6 days', 'Tender Management', 'High', 'Permanent Secretary', 6, 'Authorise'],
    ['Emergency procurement at 7.2% of total (target < 5%)', 'Procurement Analytics', 'High', 'Chief Procurement Officer', 9, 'Resolution 11'],
    ['Resolution 4 | invoice clearance due in 2 days', 'Minutes & Resolutions', 'Medium', 'Director Finance', 18, '46 invoices > 30 days'],
    ['Resolution 1 | revenue at 87% of target (95% required)', 'Minutes & Resolutions', 'High', 'Commissioner General', 23, 'Overdue since 31 Aug'],
    ['Resolution 8 | 4 departments missed 10 Sep reconciliation', 'Minutes & Resolutions', 'Medium', 'Chief Accountant', 13, 'Escalate to Treasury'],
    ['Maun District Hospital Wing: 7 variations, +50.8% contract value', 'Projects Analytics', 'Critical', 'Director Projects', 4, 'Variation review'],
    ['Inventory exceptions: 17 stock variances at Central Medical Stores', 'Inventory & Warehouse', 'Medium', 'Director Supplies', 5, 'Stock count'],
    ['Nurse overtime ▲ 38% year on year', 'Workforce & Payroll', 'Medium', 'Director HR', 11, 'Overtime cap'],
  ];
  register(K(3), () => ({
    crumbs: [...crumbs, 'Matters to Attend'],
    kpis: [
      { label: 'Critical issues', value: '8', delta: '▲ 2 new', deltaTone: 'red', sub: 'need PS attention', tone: 'red' },
      { label: 'High-risk issues', value: '17', sub: 'across 7 modules', tone: 'orange' },
      { label: 'Approaching deadline', value: '31', delta: 'next 7 days', deltaTone: 'amber', sub: '', tone: 'amber' },
      { label: 'Projects requiring attention', value: '12', sub: 'of 16 in portfolio', tone: 'violet', pct: 75 },
      { label: 'Closed this week', value: '11', delta: '▲ 3 vs last week', sub: '', tone: 'green' },
    ],
    insight: { finding: 'Three of the eight critical matters trace back to the <b>Ministry of Health capital programme</b>: the cost overruns, the Maun wing variations and the undocumented BWP 1,240,000 payment to a site security contractor.', recommendation: 'Hold a single Health capital review with Director Projects and Chief Internal Auditor this week instead of three separate follow-ups.', severity: 'Critical', tone: 'red', actions: ['Explain finding', 'Schedule review', 'Create task'] },
    grid: [
      [
        { span: 7, type: 'list', title: 'Attention queue | ranked by severity and age', height: 330, items: matters.slice(0, 8).map(([t, mod, sev, own, age]) => ({ title: t, meta: `${mod} · ${own} · open ${age} d`, pill: sev, tone: SEV[sev] })) },
        { span: 5, type: 'map', title: 'Where the critical matters are', height: 330, pins: [
          { name: 'Maun | Hospital Wing', lon: 23.42, lat: -19.98, tone: 'red', size: 16, meta: '+29% forecast cost, 7 variations' },
          { name: 'Molepolole | Clinic', lon: 25.5, lat: -24.41, tone: 'red', size: 14, meta: '+27% forecast cost' },
          { name: 'Francistown | Theatre', lon: 27.51, lat: -21.17, tone: 'red', size: 13, meta: '+26% forecast cost' },
          { name: 'Selebi-Phikwe | Pipeline', lon: 27.83, lat: -21.98, tone: 'amber', size: 10, meta: '22% physical, at risk' },
          { name: 'Ghanzi | School Labs', lon: 21.78, lat: -21.7, tone: 'amber', size: 10, meta: 'Procurement delay' },
        ] },
      ],
      [
        { span: 8, type: 'bar', title: 'Open matters by source module and severity', height: 250, categories: ['Projects', 'Procurement', 'Budget', 'Resolutions', 'Audit', 'Workforce', 'Inventory', 'Tax'], rotate: 0,
          series: [{ name: 'Critical', stack: 's', data: [3, 1, 1, 0, 2, 0, 0, 1], color: 'red' }, { name: 'High', stack: 's', data: [4, 4, 2, 3, 2, 1, 0, 1], color: 'orange' }, { name: 'Medium', stack: 's', data: [5, 6, 4, 8, 3, 4, 5, 2], color: 'amber' }, { name: 'Normal', stack: 's', data: [3, 4, 5, 3, 2, 3, 4, 2], color: 'green' }] },
        { span: 4, type: 'donut', title: 'Matters by attention level', height: 250, center: '89 open', items: [{ name: 'Critical', value: 8, color: 'red' }, { name: 'High', value: 17, color: 'orange' }, { name: 'Medium', value: 37, color: 'amber' }, { name: 'Normal', value: 27, color: 'green' }] },
      ],
      [
        { span: 12, type: 'table', title: 'Matters register | assigned owner and next action', height: 250,
          columns: [{ key: 'm', label: 'Matter' }, { key: 'mod', label: 'Source' }, { key: 'sev', label: 'Level' }, { key: 'own', label: 'Owner' }, { key: 'age', label: 'Open', align: 'right' }, { key: 'nx', label: 'Next action' }],
          rows: matters.map(([m, mod, sev, own, age, nx]) => ({ m: { strong: m }, mod, sev: { pill: sev, tone: SEV[sev] }, own, age: `${age} d`, nx })) },
      ],
    ],
  }));

  // ── 4 Matters for Approval ──
  const approvals = [
    ['APR-2611', 'Award of tender MCP/DES/2283/26-27-01 | Furniture to Clement Pty Ltd', 'Tender award', 3480000, 'Chief Procurement Officer', 6],
    ['APR-2608', 'Variation order VO-07 | Maun District Hospital Wing', 'Contract variation', 2150000, 'Director Projects', 8],
    ['APR-2615', 'Mid-year virement | Agriculture to Transport', 'Virement', 20000000, 'Director Budget', 3],
    ['APR-2604', 'Payment batch | 46 invoices older than 30 days (Resolution 4)', 'Payment release', 2100000, 'Director Finance', 9],
    ['APR-2617', 'Emergency procurement | Oxygen concentrators, Francistown', 'Emergency procurement', 890000, 'Heads of Procurement', 2],
    ['APR-2602', 'Recruitment of 42 nursing posts', 'Establishment', 11800000, 'Director HR', 12],
    ['APR-2619', 'Write-off of obsolete pharmaceuticals, Central Medical Stores', 'Write-off', 318000, 'Director Supplies', 1],
    ['APR-2613', 'Extension of time | Selebi-Phikwe Pipeline (90 days)', 'Contract variation', 0, 'Director Projects', 4],
    ['APR-2620', 'Quarterly cash-flow release | Q3 development budget', 'Cash release', 18400000, 'Treasury Operations Director', 1],
    ['APR-2609', 'Consultancy extension | e-Government Data Centre', 'Contract variation', 640000, 'Director ICT', 7],
  ];
  register(K(4), () => ({
    crumbs: [...crumbs, 'Matters for Approval'],
    kpis: [
      { label: 'Approvals waiting', value: '23', delta: '5 over 5 days', deltaTone: 'amber', sub: 'for your decision', tone: 'amber' },
      { label: 'Value awaiting approval', value: 'BWP 64.8M', sub: '23 items', tone: 'blue' },
      { label: 'Avg approval time', value: '4.2 days', delta: '▲ 1.2 vs target', deltaTone: 'red', sub: 'Resolution 14 target: 3', tone: 'red', pct: 71 },
      { label: 'Approved this month', value: '41', delta: 'BWP 58.3M', sub: '', tone: 'green' },
      { label: 'Returned / declined', value: '4', sub: 'missing documents', tone: 'slate' },
    ],
    insight: { finding: 'Five items have waited more than five working days, breaching the <b>Resolution 14</b> escalation rule. The largest bottleneck is tender <b>MCP/DES/2283</b>: evaluation is complete and Clement Pty Ltd ranked first (0.88), but the award has waited 6 days for authorisation.', recommendation: 'Authorise the 2283 award and the Resolution 4 payment batch today; together they clear BWP 5.6M of the backlog.', severity: 'High', tone: 'orange', actions: ['Approve selected', 'Explain finding', 'Delegate'] },
    grid: [
      [{ span: 12, type: 'steps', title: 'Tender MCP/DES/2283/26-27-01 | approval chain', steps: [{ name: 'Bids opened', meta: '14 Aug', state: 'done' }, { name: 'Compliance check', meta: '21 Aug', state: 'done' }, { name: 'Technical & financial evaluation', meta: '09 Sep', state: 'done' }, { name: 'Committee recommendation', meta: '15 Sep', state: 'done' }, { name: 'PS authorisation', meta: '6 days waiting', state: 'late' }, { name: 'Award notice', meta: 'pending' }, { name: 'Contract signed', meta: 'pending' }] }],
      [
        { span: 12, type: 'table', title: 'Approval queue | oldest first', height: 300,
          columns: [{ key: 'ref', label: 'Ref' }, { key: 'item', label: 'Matter' }, { key: 'type', label: 'Type' }, { key: 'val', label: 'Value (BWP)', align: 'right' }, { key: 'from', label: 'Submitted by' }, { key: 'age', label: 'Waiting' }],
          rows: [...approvals].sort((a, b) => b[5] - a[5]).map(([ref, item, type, val, from, age]) => ({ ref, item: { strong: item }, type, val: val ? fmt.n(val) : 'Nil', from, age: { pill: `${age} days`, tone: age > 5 ? 'red' : age > 3 ? 'amber' : 'green' } })) },
      ],
      [
        { span: 4, type: 'bar', title: 'Waiting time (working days)', height: 230, categories: ['0–1', '2–3', '4–5', '6–10', '10+'], gridOpt: { right: 86 },
          series: [{ name: 'Approvals', label: true, data: [{ value: 7, itemStyle: { color: C.green } }, { value: 6, itemStyle: { color: C.blue } }, { value: 5, itemStyle: { color: C.amber } }, { value: 4, itemStyle: { color: C.orange } }, { value: 1, itemStyle: { color: C.red } }], markLine: { value: 5, label: 'Resolution 14', tone: 'red' } }] },
        { span: 4, type: 'donut', title: 'Waiting value by type', height: 230, valueFmt: fmt.bwp, items: [{ name: 'Virement', value: 20000000 }, { name: 'Cash release', value: 18400000 }, { name: 'Establishment', value: 11800000 }, { name: 'Contract variation', value: 6250000 }, { name: 'Tender award', value: 3480000 }, { name: 'Payments & other', value: 4870000 }] },
        { span: 4, type: 'bar', title: 'Approval time trend vs target (days)', height: 230, categories: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'], gridOpt: { right: 56 },
          series: [{ name: 'Avg days', type: 'line', data: [5.1, 4.8, 4.6, 3.9, 3.7, 4.2], color: 'amber', area: true, markLine: { value: 3, label: 'Target', tone: 'green' } }] },
      ],
    ],
  }));

  // ── 5 Workload Pipeline ──
  const col = (name, tn, items) => ({ name, tone: tn, items: items.map(([title, pill, ptone, meta]) => ({ title, pill, tone: ptone, meta })) });
  register(K(5), () => ({
    crumbs: [...crumbs, 'Workload Pipeline'],
    kpis: [
      { label: 'Items in pipeline', value: '146', sub: 'PS office, all sources', tone: 'blue' },
      { label: 'Ready for decision', value: '23', delta: 'approvals waiting', deltaTone: 'amber', sub: '', tone: 'amber' },
      { label: 'Throughput', value: '38 / week', delta: '▲ 4 vs Aug', sub: 'items closed', tone: 'green' },
      { label: 'Blocked', value: '9', delta: 'awaiting documents', deltaTone: 'red', sub: '', tone: 'red' },
      { label: 'Avg cycle time', value: '6.8 days', delta: '▼ 0.7 days', deltaTone: 'green', sub: 'intake to close', tone: 'violet' },
    ],
    insight: { finding: 'Inflow has exceeded clearance for three consecutive weeks (<b>+11 items net</b>), driven by resolution follow-ups and month-6 variation orders. Nine items are blocked waiting on supporting documents from the Ministry of Health.', recommendation: 'Delegate routine write-offs and extensions of time below BWP 500,000 to the Deputy PS Finance.', severity: 'Medium', tone: 'amber' },
    grid: [
      [
        { span: 12, type: 'kanban', title: 'PS office pipeline | by stage', height: 330, columns: [
          col('Incoming', 'slate', [['Auditor General management letter FY25', 'Audit', 'violet', 'today'], ['PAC request | clinic overruns', 'Parliament', 'red', 'due 30 Sep'], ['Donor reconciliation Q2', 'Resolution 6', 'blue', 'today'], ['BURS revenue variance report', 'Resolution 1', 'amber', 'yesterday']]),
          col('Under review', 'blue', [['Maun wing VO-07 | BWP 2.15M', 'Variation', 'orange', 'Dir Projects'], ['Q3 procurement plan', 'Resolution 11', 'amber', 'CPO'], ['Asset verification report', 'Resolution 16', 'blue', 'Dir Assets'], ['Monthly KPI pack | Aug', 'Resolution 13', 'blue', 'Dir Strategy']]),
          col('Awaiting input', 'amber', [['PV-26-44812 supporting docs', 'Blocked', 'red', 'MoH, 4 d'], ['Bank recs | 4 departments', 'Resolution 8', 'red', 'Chief Accountant'], ['Nursing posts costing', 'HR', 'amber', 'Dir HR']]),
          col('Ready for decision', 'violet', [['Award MCP/DES/2283', 'Approval', 'red', '6 d waiting'], ['Payment batch | 46 invoices', 'Resolution 4', 'orange', 'BWP 2.1M'], ['Virement Agric → Transport', 'Approval', 'amber', 'BWP 20M'], ['BN/041 Health overruns', 'Signature', 'amber', 'today']]),
          col('Closed this week', 'green', [['Q2 cash-flow forecast', 'Resolution 12', 'green', 'Mon'], ['Kasane Health Post handover', 'Project', 'green', 'Tue'], ['BN/038 payment arrears', 'Signed', 'green', 'Fri']]),
        ] },
      ],
      [
        { span: 7, type: 'bar', title: 'Weekly inflow vs cleared | backlog on right axis', height: 230, categories: ['W27', 'W28', 'W29', 'W30', 'W31', 'W32', 'W33', 'W34', 'W35', 'W36', 'W37', 'W38', 'W39'], y2: ' ',
          series: [{ name: 'Inflow', data: [31, 35, 29, 33, 36, 30, 34, 37, 32, 38, 41, 43, 42], color: 'violet' }, { name: 'Cleared', data: [33, 34, 32, 31, 35, 33, 36, 35, 34, 37, 38, 39, 38], color: 'green' }, { name: 'Backlog', type: 'line', axis: 1, data: [138, 139, 136, 138, 139, 136, 134, 136, 134, 135, 138, 142, 146], color: 'amber' }] },
        { span: 5, type: 'bar', title: 'Pipeline by directorate and stage', height: 230, horizontal: true, labelMax: 20, categories: ['Budget', 'Procurement', 'Projects', 'Treasury', 'Audit', 'HR', 'ICT'],
          series: [{ name: 'Review', stack: 's', data: [9, 11, 12, 6, 5, 4, 3], color: 'blue' }, { name: 'Awaiting input', stack: 's', data: [5, 7, 9, 4, 3, 3, 2], color: 'amber' }, { name: 'Decision', stack: 's', data: [4, 6, 5, 3, 1, 2, 2], color: 'violet' }] },
      ],
    ],
  }));

  // ── 6 Mails & Notifications ──
  register(K(6), () => {
    const r = rng('mail');
    const days = Array.from({ length: 14 }, (_, i) => day(i - 13).slice(0, 6).replace(' ', '\n'));
    return {
      crumbs: [...crumbs, 'Mails & Notifications'],
      kpis: [
        { label: 'Unread mail', value: '47', delta: '12 need action', deltaTone: 'amber', sub: '', tone: 'blue' },
        { label: 'From Minister\'s office', value: '5', delta: '2 unanswered', deltaTone: 'red', sub: '', tone: 'red' },
        { label: 'System notifications', value: '63', sub: 'today, 9 high priority', tone: 'violet' },
        { label: 'AI triaged', value: '82%', sub: 'auto-filed or routed', tone: 'cyan', pct: 82 },
        { label: 'Avg response time', value: '9.4 h', delta: '▼ 2.1 h', deltaTone: 'green', sub: 'mail needing reply', tone: 'green' },
      ],
      insight: { finding: 'Two letters from the Minister\'s office are unanswered after <b>48 hours</b>, and the Office of the Auditor General has requested the FY25 management-letter responses by 30 Sep. The AI has drafted replies to both.', recommendation: 'Review the two drafted replies and route the Auditor General request to the Chief Internal Auditor (Resolution 7).', severity: 'Medium', tone: 'amber', actions: ['Open drafts', 'Route request', 'Mark all read'] },
      grid: [
        [
          { span: 7, type: 'list', title: 'Priority inbox', height: 320, items: [
            { title: 'Minister of Finance | Health capital overruns: request for briefing before Cabinet', meta: 'Minister\'s office · 21 Sep 16:40 · AI draft ready', pill: 'Reply due', tone: 'red' },
            { title: 'Minister of Finance | Status of emergency procurement controls', meta: 'Minister\'s office · 21 Sep 09:12 · AI draft ready', pill: 'Reply due', tone: 'red' },
            { title: 'Office of the Auditor General | FY25 management letter responses', meta: 'Auditor General · 22 Sep · due 30 Sep', pill: 'Action', tone: 'orange' },
            { title: 'Public Accounts Committee | Records for clinic construction hearing', meta: 'Parliament · 22 Sep · Resolution 15', pill: 'Action', tone: 'orange' },
            { title: 'Accountant General | Q3 cash release schedule', meta: 'Treasury · today 08:05', pill: 'For decision', tone: 'amber' },
            { title: 'Chief Procurement Officer | MCP/DES/2283 award memo attached', meta: 'Procurement · 17 Sep · 6 days', pill: 'For decision', tone: 'amber' },
            { title: 'Botswana Unified Revenue Service | August collections report', meta: 'BURS · today 07:30', pill: 'FYI', tone: 'blue' },
            { title: 'Director ICT | Executive dashboard roadmap v2 (Resolution 20)', meta: 'ICT · yesterday', pill: 'FYI', tone: 'blue' },
          ] },
          { span: 5, type: 'list', title: 'System notifications', height: 320, items: [
            { title: 'Risk indicator: payment without supporting documents, BWP 1,240,000', meta: 'Oversight & Audit · 2 h ago', tone: 'red', value: 'Critical' },
            { title: 'Approval APR-2604 passed 5 working days (Resolution 14)', meta: 'Workflow · 3 h ago', tone: 'orange', value: 'Escalated' },
            { title: 'Resolution 4 milestone due in 2 days', meta: 'Minutes & Resolutions · today', tone: 'amber', value: 'Reminder' },
            { title: 'Capital Projects utilisation passed 75%', meta: 'Budget Analytics · today', tone: 'amber', value: 'Threshold' },
            { title: 'Board pack: 14 of 20 sections ready', meta: 'Board Pack Generator · 1 h ago', tone: 'blue', value: 'Progress' },
            { title: 'Kasane Health Post Upgrade handed over', meta: 'Projects · yesterday', tone: 'green', value: 'Closed' },
          ] },
        ],
        [
          { span: 8, type: 'bar', title: 'Daily volume | last 14 days', height: 220, categories: days, rotate: 0, labelMax: 10, gridOpt: { bottom: 8 },
            series: [{ name: 'Mail received', stack: 'v', data: days.map((d, i) => (/Sat|Sun/.test(d) ? r.int(2, 6) : r.int(28, 44))), color: 'blue' }, { name: 'System notifications', stack: 'v', data: days.map(d => (/Sat|Sun/.test(d) ? r.int(8, 14) : r.int(40, 66))), color: 'violet' }, { name: 'Replied', type: 'line', data: days.map(d => (/Sat|Sun/.test(d) ? r.int(0, 3) : r.int(18, 30))), color: 'green' }] },
          { span: 4, type: 'donut', title: 'Unread by category', height: 220, center: '47', items: [{ name: 'Action required', value: 12, color: 'red' }, { name: 'For decision', value: 9, color: 'amber' }, { name: 'For information', value: 17, color: 'blue' }, { name: 'Circulars', value: 6, color: 'cyan' }, { name: 'Invitations', value: 3, color: 'violet' }] },
        ],
      ],
    };
  });

  // ── 7 Team Chat Groups ──
  const groups = [
    ['Budget Review Committee', 18, 14, '10 min ago', 'Resolutions 1–20', 'green'],
    ['MoH Capital Projects Recovery', 9, 23, '4 min ago', 'Resolution 5', 'red'],
    ['Tender MCP/DES/2283 Evaluation', 6, 3, '1 h ago', 'Tender award', 'amber'],
    ['Payments & Arrears Task Team', 7, 8, '25 min ago', 'Resolution 4', 'orange'],
    ['Board Pack 25 Sep', 11, 6, '12 min ago', 'Board meeting', 'blue'],
    ['Revenue Monitoring (BURS)', 8, 0, 'yesterday', 'Resolution 1', 'amber'],
    ['Executive Dashboard Roadmap', 10, 2, '3 h ago', 'Resolution 20', 'violet'],
    ['PS Management Committee', 14, 1, '2 h ago', 'Weekly', 'blue'],
  ];
  const bubble = (who, t, time, me) => `<div style="align-self:${me ? 'flex-end' : 'flex-start'};max-width:82%"><div style="font-size:10.5px;color:${C.dim};margin-bottom:3px;${me ? 'text-align:right' : ''}">${who} · ${time}</div><div style="padding:8px 11px;border-radius:10px;font-size:12px;line-height:1.45;color:${me ? '#fff' : C.body};background:${me ? C.blue : '#12264a'};border:1px solid ${me ? C.blue : C.border}">${t}</div></div>`;
  const chatHtml = `<div style="display:flex;flex-direction:column;gap:9px;max-height:300px;overflow:auto;padding:4px 2px">
    ${bubble('Director Projects', 'Maun VO-07 is in the approval queue. Contractor claims additional piling after the geotechnical survey.', '09:14')}
    ${bubble('Chief Internal Auditor', 'Seven variations on one contract crosses our monitoring threshold. We should see the engineer\'s instructions before approval.', '09:21')}
    ${bubble('Permanent Secretary', 'Agreed. Hold VO-07. Director Projects to bring the recovery plan and variation file to Thursday\'s review.', '09:26', true)}
    ${bubble('Director Finance', 'Noted. The clinic certificate for BWP 1.1M stays in the payment batch; it is within contract value.', '09:31')}
    <div style="align-self:center;display:flex;gap:6px;align-items:center;padding:5px 10px;border-radius:999px;background:#082232;border:1px solid #074b5f;font-size:10.5px;color:#67E8F9">AI captured: 1 decision · 1 task for Director Projects (due Thu 24 Sep)</div></div>`;
  register(K(7), () => {
    const r = rng('chat');
    const wd = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const values = [];
    groups.slice(0, 6).forEach((g, y) => wd.forEach((d, x) => values.push([x, y, Math.round(r.num(4, 30) * (y === 1 ? 1.8 : 1))])));
    return {
      crumbs: [...crumbs, 'Team Chat Groups'],
      kpis: [
        { label: 'Active groups', value: String(groups.length), sub: '83 members', tone: 'blue' },
        { label: 'Unread messages', value: String(groups.reduce((s, g) => s + g[2], 0)), delta: '9 mention you', deltaTone: 'amber', sub: '', tone: 'amber' },
        { label: 'Messages today', value: '286', delta: '▲ 22%', sub: 'vs weekly average', tone: 'violet' },
        { label: 'Decisions logged', value: '7', sub: 'this week, AI captured', tone: 'green' },
        { label: 'Tasks created from chat', value: '23', sub: 'linked to resolutions', tone: 'cyan' },
      ],
      insight: { finding: 'The <b>MoH Capital Projects Recovery</b> group is the busiest this week with 23 unread messages; a decision to hold variation VO-07 was taken in chat this morning and converted to a task.', recommendation: 'Confirm the decision in the Thursday review minutes so it is recorded against Resolution 5.', severity: 'Normal', tone: 'blue', actions: ['Open group', 'Log decision', 'Create task'] },
      grid: [
        [
          { span: 7, type: 'table', title: 'My chat groups', height: 330,
            columns: [{ key: 'g', label: 'Group' }, { key: 'm', label: 'Members', align: 'right' }, { key: 'u', label: 'Unread', align: 'right' }, { key: 'l', label: 'Last activity' }, { key: 'k', label: 'Linked to' }],
            rows: groups.map(([g, m, u, l, k, tn]) => ({ g: { dot: tn, text: g }, m, u: u ? String(u) : '—', l, k: { pill: k, tone: tn } })) },
          { span: 5, type: 'html', title: 'MoH Capital Projects Recovery | live thread', badge: ['23 unread', 'red'], html: chatHtml },
        ],
        [
          { span: 7, type: 'heatmap', title: 'Message volume | group × weekday', height: 240, x: wd, y: groups.slice(0, 6).map(g => g[0]), values, max: 55, colors: ['#0f2a4d', '#1D4ED8', '#06B6D4', '#F59E0B'] },
          { span: 5, type: 'list', title: 'Decisions and tasks captured by AI', height: 240, items: [
            { title: 'Hold Maun VO-07 pending variation file', meta: 'MoH Capital Projects Recovery · today', pill: 'Decision', tone: 'violet' },
            { title: 'Director Finance to release 46-invoice batch after PS approval', meta: 'Payments & Arrears · yesterday', pill: 'Task', tone: 'blue' },
            { title: 'Board pack: use month-6 actuals, not forecast', meta: 'Board Pack 25 Sep · yesterday', pill: 'Decision', tone: 'violet' },
            { title: 'CPO to circulate 2283 award memo to committee', meta: 'Tender 2283 · Mon', pill: 'Task', tone: 'blue' },
            { title: 'Weekly BURS variance report every Monday', meta: 'Revenue Monitoring · Fri', pill: 'Decision', tone: 'violet' },
          ] },
        ],
      ],
    };
  });

  // ── 8 My Meetings (week of Mon 21 Sep; gantt units = hours since Mon 08:00, 10 h per day) ──
  const meetings = [
    ['PS Management Committee', 0, 1, 3, 'blue'], ['Treasury cash-flow briefing', 0, 5, 6, 'cyan'],
    ['MoH Capital Projects Recovery', 1, 1, 2.5, 'red'], ['Donor partners forum', 1, 6, 8, 'violet'],
    ['BURS revenue review', 2, 0.5, 1.5, 'amber'], ['Tender 2283 authorisation', 2, 3, 3.5, 'orange'], ['Minister | pre-Cabinet briefing', 2, 6, 7, 'red'],
    ['Budget Performance Review', 3, 1, 4.5, 'blue'], ['PAC preparation', 3, 6, 7.5, 'violet'],
    ['Board of Management | Board pack', 4, 1, 4, 'green'], ['ICT dashboard steering (Res 20)', 4, 6, 7, 'cyan'],
  ];
  const dname = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const hh = h => `${String(8 + Math.floor(h)).padStart(2, '0')}:${h % 1 ? '30' : '00'}`;
  register(K(8), () => ({
    crumbs: [...crumbs, 'My Meetings'],
    kpis: [
      { label: 'Meetings this week', value: String(meetings.length), sub: 'Mon 21 – Fri 25 Sep', tone: 'blue' },
      { label: 'Hours in meetings', value: meetings.reduce((s, m) => s + m[3] - m[2], 0).toFixed(1), delta: '45% of week', deltaTone: 'amber', sub: '40 working hours', tone: 'violet', pct: 45 },
      { label: 'Prep packs ready', value: '8 of 11', sub: 'AI-generated', tone: 'green', pct: 73 },
      { label: 'Open meeting actions', value: '7', delta: '2 due this week', deltaTone: 'amber', sub: 'from last minutes', tone: 'amber' },
      { label: 'Next meeting', value: 'Wed 11:00', sub: 'Tender 2283 authorisation', tone: 'orange' },
    ],
    insight: { finding: 'Thursday\'s <b>Budget Performance Review</b> will consider 14 outstanding resolutions, three of them overdue (1, 4 and 8). The prep pack is ready, but the Resolution 8 reconciliation status from the Chief Accountant is missing.', recommendation: 'Ask the Chief Accountant for the reconciliation status by 17:00 today so the pack is complete.', severity: 'Medium', tone: 'amber', actions: ['Open prep pack', 'Request update', 'Reschedule'] },
    grid: [
      [
        { span: 8, type: 'gantt', title: 'My week | 21 – 25 Sep 2026', height: 330, start: 0, end: 50, today: 22.5, labelWidth: 210, ticks: [...dname.map((d, i) => `${d} ${21 + i}`), 'Sat 26'],
          tasks: meetings.map(([n, d, s, e, tn]) => ({ name: `${dname[d]} ${hh(s)} | ${n}`, start: d * 10 + s, end: d * 10 + e, tone: tn, progress: d * 10 + e <= 22.5 ? 100 : 0, label: d < 4 ? `${hh(s)}–${hh(e)}` : '' })) },
        { span: 4, type: 'list', title: 'Today | Wed 23 Sep', height: 330, items: [
          { title: 'BURS revenue review', meta: '08:30–09:30 · Treasury Boardroom · Resolution 1', value: 'Done', tone: 'green' },
          { title: 'Tender MCP/DES/2283 authorisation', meta: '11:00–11:30 · PS office · CPO, evaluation chair', value: 'Next', tone: 'orange' },
          { title: 'Minister | pre-Cabinet briefing', meta: '14:00–15:00 · Minister\'s office · BN/041', value: 'Prep ready', tone: 'red' },
          { title: 'Hold: sign briefing note BN/041', meta: '15:00–15:30 · blocked time', value: 'Focus', tone: 'blue' },
        ] },
      ],
      [
        { span: 8, type: 'table', title: 'Commitments from the last Budget Review Meeting', height: 280,
          columns: [{ key: 'a', label: 'Action' }, { key: 'o', label: 'Responsible' }, { key: 'd', label: 'Deadline' }, { key: 'p', label: 'Progress' }, { key: 's', label: 'Status' }],
          rows: [['Submit monthly budget reports', 'All Ministries', 'Monthly', 88, 'On track'], ['Improve procurement planning', 'Procurement Directors', 'Immediate', 40, 'Overdue'], ['Update project monitoring reports', 'Project Managers', 'Monthly', 75, 'On track'], ['Complete audit recommendations', 'Heads of Departments', '30 days', 55, 'At risk'], ['Improve cash forecasting', 'Accountant General', 'Weekly', 90, 'On track'], ['Review revenue mobilisation strategy', 'BURS', 'Next meeting', 30, 'At risk'], ['Prepare Executive Dashboard concept paper', 'ICT Directorate', 'Four weeks', 100, 'Done']]
            .map(([a, o, d, p, s]) => ({ a: { strong: a }, o, d, p: { bar: p, tone: s === 'Overdue' ? 'red' : s === 'At risk' ? 'amber' : 'green' }, s: { pill: s, tone: s === 'Overdue' ? 'red' : s === 'At risk' ? 'amber' : s === 'Done' ? 'blue' : 'green' } })) },
        { span: 4, type: 'donut', title: 'Meeting hours by purpose', height: 280, center: '18 h', valueFmt: v => v + ' h', items: [{ name: 'Oversight & review', value: 6 }, { name: 'Board & PAC', value: 4.5 }, { name: 'External partners', value: 3 }, { name: 'Management', value: 3 }, { name: 'Minister & Cabinet', value: 1 }, { name: 'Decision / approval', value: 0.5 }] },
      ],
    ],
  }));

  // ── 10 Board Pack Generator ──
  const SECTIONS = ['Executive summary', 'Financial performance', 'Budget performance', 'Procurement performance', 'Projects performance', 'HR/workforce performance', 'Revenue', 'Assets', 'Inventory', 'Risk', 'Compliance', 'Audit findings', 'Litigation/legal matters', 'Customer/citizen complaints', 'Outstanding resolutions', 'Strategic KPIs', 'Matters requiring attention', 'Matters requiring approval', 'Management recommendations', 'Supporting appendices'];
  const secState = ['Ready', 'Ready', 'Ready', 'Ready', 'Ready', 'Ready', 'In review', 'Ready', 'Missing data', 'Ready', 'Ready', 'In review', 'Missing data', 'Ready', 'Ready', 'Ready', 'Ready', 'Ready', 'In review', 'Generating'];
  const secPages = [3, 6, 7, 6, 8, 4, 4, 3, 3, 4, 3, 5, 2, 3, 4, 4, 3, 3, 3, 8];
  const secOwner = ['Permanent Secretary', 'Accountant General', 'Director Budget', 'Chief Procurement Officer', 'Director Projects', 'Director HR', 'Director Revenue', 'Director Assets Management', 'Director Supplies', 'Chief Risk Officer', 'Director Strategy & Performance', 'Chief Internal Auditor', 'Legal Counsel', 'Director PPADB Liaison', 'Board Secretary', 'Director Strategy & Performance', 'Permanent Secretary', 'Permanent Secretary', 'Deputy Permanent Secretary', 'Board Secretary'];
  const stTone = { Ready: 'green', 'In review': 'amber', 'Missing data': 'red', Generating: 'blue' };
  const packHtml = `${docHead('BOARD OF MANAGEMENT PACK', 'BP/MOF/2026-27/Q2 · Meeting of Friday, 25 September 2026', 'CONFIDENTIAL')}
    <div style="text-align:center;font-size:11px;color:#555;margin-top:8px">Reporting period: April – September 2026 (month 6 of 12) · Version 0.9 draft · Generated 23 Sep 2026 10:42</div>
    ${H('1. EXECUTIVE SUMMARY')}
    <p style="margin:0">Budget performance stands at 74% of the half-year target and 81% of projects are on track. Procurement compliance is 93%. Twenty-three approvals await decision and fourteen Board resolutions remain outstanding, three of them overdue (Resolutions 1, 4 and 8).</p>
    <table style="width:100%;border-collapse:collapse;font-size:11.5px;margin:8px 0">
      <tr style="background:#eee;font-weight:700"><td style="${TD}">Indicator</td><td style="${TD};text-align:right">Actual</td><td style="${TD};text-align:right">Target</td><td style="${TD}">Status</td></tr>
      <tr><td style="${TD}">Budget performance</td><td style="${TD};text-align:right">74%</td><td style="${TD};text-align:right">80%</td><td style="${TD}">Below target</td></tr>
      <tr><td style="${TD}">Projects on track</td><td style="${TD};text-align:right">81%</td><td style="${TD};text-align:right">90%</td><td style="${TD}">Below target</td></tr>
      <tr><td style="${TD}">Procurement compliance</td><td style="${TD};text-align:right">93%</td><td style="${TD};text-align:right">95%</td><td style="${TD}">Near target</td></tr>
      <tr><td style="${TD}">Revenue performance</td><td style="${TD};text-align:right">87%</td><td style="${TD};text-align:right">95%</td><td style="${TD}">Below target</td></tr>
      <tr><td style="${TD}">Emergency procurement share</td><td style="${TD};text-align:right">7.2%</td><td style="${TD};text-align:right">&lt; 5%</td><td style="${TD}">Breach</td></tr>
    </table>
    ${H('2. MATTERS REQUIRING ATTENTION')}
    <ul style="margin:0 0 0 20px;padding:0"><li>Ministry of Health: three capital projects with forecast cost variance above 25%.</li><li>Payment of BWP 1,240,000 released without supporting documents, referred for review.</li><li>Tender MCP/DES/2283 awaiting authorisation for six days.</li></ul>
    ${H('3. MATTERS REQUIRING APPROVAL')}
    <p style="margin:0">Award of tender MCP/DES/2283/26-27-01 to Clement Pty Ltd (weighted score 0.88); mid-year virement of BWP 20M from Agriculture to Transport.</p>
    <div style="margin-top:16px;border-top:1px solid #999;padding-top:6px;font-size:10.5px;color:#555;display:flex;justify-content:space-between"><span>Ministry of Finance · Confidential</span><span>Page 1 of 86</span></div>`;
  register(K(10), () => {
    const cnt = s => secState.filter(x => x === s).length;
    return {
      crumbs: [...crumbs, 'Board Pack Generator'],
      kpis: [
        { label: 'Sections', value: '20', sub: 'standard board pack', tone: 'blue' },
        { label: 'Ready', value: String(cnt('Ready')), delta: `${Math.round(cnt('Ready') / 20 * 100)}%`, sub: 'validated', tone: 'green', pct: cnt('Ready') / 20 * 100 },
        { label: 'In review', value: String(cnt('In review') + cnt('Generating')), sub: 'owners notified', tone: 'amber' },
        { label: 'Missing data', value: String(cnt('Missing data')), delta: 'Inventory, Legal', deltaTone: 'red', sub: '', tone: 'red' },
        { label: 'Pages', value: String(secPages.reduce((a, b) => a + b, 0)), sub: 'Board meets Fri 25 Sep', tone: 'violet' },
      ],
      insight: { finding: 'Fourteen of twenty sections are validated. <b>Inventory</b> is waiting for the Central Medical Stores stock count and <b>Litigation/legal matters</b> has no submission from Legal Counsel; both are needed before the pack locks at 17:00 Thursday.', recommendation: 'Send reminders to the two owners now; if not received by noon Thursday, publish those sections as "to follow".', severity: 'Medium', tone: 'amber', actions: ['Send reminders', 'Preview PDF', 'Export Word'] },
      grid: [
        [{ span: 12, type: 'steps', title: 'Generation progress | Board pack Q2 FY 2026-27', steps: [{ name: 'Collect source data', meta: '9 systems · done', state: 'done' }, { name: 'Validate figures', meta: '18 of 20 · done', state: 'done' }, { name: 'AI narrative drafting', meta: '19 of 20 sections', state: 'current' }, { name: 'Section owner review', meta: '3 in review' }, { name: 'PS sign-off', meta: 'Thu 24 Sep' }, { name: 'Lock & distribute', meta: 'Thu 17:00' }] }],
        [
          { span: 5, type: 'table', title: 'Pack contents', height: 470,
            columns: [{ key: 's', label: 'Section' }, { key: 'p', label: 'Pp', align: 'right' }, { key: 'st', label: 'Status' }],
            rows: SECTIONS.map((s, i) => ({ s: { strong: `${i + 1}. ${s}` }, p: secPages[i], st: { pill: secState[i], tone: stTone[secState[i]] } })) },
          { span: 7, type: 'doc', title: 'Preview | cover and executive summary', badge: ['Draft v0.9', 'blue'], height: 470, html: packHtml },
        ],
        [
          { span: 4, type: 'gauge', title: 'Pack readiness', height: 200, gauges: [{ name: 'Sections ready', value: 70, good: 90, warn: 60 }] },
          { span: 8, type: 'bar', title: 'Data freshness by source system (hours since last refresh)', height: 200, gridOpt: { right: 60 }, categories: ['GL / ERP', 'Budgeting', 'E-procurement', 'Projects', 'Payroll', 'Inventory', 'Assets', 'Audit', 'Resolutions'],
            series: [{ name: 'Hours', label: true, data: [2, 2, 4, 6, 20, 71, 26, 9, 1].map(v => ({ value: v, itemStyle: { color: v > 48 ? C.red : v > 24 ? C.amber : C.green } })), markLine: { value: 24, label: '24 h rule', tone: 'amber' } }] },
        ],
      ],
    };
  });

  // ── 11 AI Report Generator ──
  const field = (k, v) => `<div style="display:flex;justify-content:space-between;gap:10px;padding:6px 9px;border-radius:6px;background:#0b1830;border:1px solid #11244a;font-size:11.5px"><span style="color:${C.dim}">${k}</span><span style="color:${C.text};font-weight:600;text-align:right">${v}</span></div>`;
  const promptHtml = `<div style="display:flex;flex-direction:column;gap:10px">
    <div style="padding:10px 12px;border-radius:8px;background:#0b1830;border:1px solid #1a396b;font-size:12.5px;line-height:1.55;color:${C.body}"><span style="font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.1em;color:#67E8F9">PROMPT</span><br>Create a procurement performance report for Q2 showing expenditure, tender turnaround times, top suppliers, emergency procurement, contract variations, delayed procurements and major anomalies. Compare against Q1.</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">${[['Data source', 'Procurement'], ['Metric', 'Contract value'], ['Dimension', 'Supplier'], ['Period', 'Q2 FY 2026-27'], ['Filter', 'Ministry of Health'], ['Visual', 'Bar chart'], ['Comparison', 'Q1 vs Q2'], ['AI analysis', 'ON'], ['Anomaly detection', 'ON'], ['Classification', 'Restricted']].map(([k, v]) => field(k, v)).join('')}</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">${['PDF', 'Word', 'Excel', 'Board Pack', 'Email'].map((x, i) => `<span style="padding:5px 11px;border-radius:6px;font-size:11.5px;${i === 0 ? `background:${C.blue};color:#fff` : `border:1px solid ${C.border};color:${C.body}`}">${x}</span>`).join('')}</div>
    <div style="font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.1em;color:${C.dim};margin-top:4px">RECENT PROMPTS</div>
    ${['Show projects more than 90 days behind schedule', 'Show suppliers receiving more than P10 million this financial year', 'Generate my board briefing for Friday'].map(t => `<div style="font-size:12px;color:${C.body};padding:6px 9px;border-left:2px solid #1a396b">“${t}”</div>`).join('')}</div>`;
  const reportHtml = `${docHead('PROCUREMENT PERFORMANCE REPORT | Q2 FY 2026-27', 'RPT/PROC/2026/Q2-014 · Generated 23 Sep 2026 10:51 · AI-assisted')}
    ${H('SUMMARY')}
    <p style="margin:0">Q2 procurement expenditure for the Ministry of Health was BWP 18.6M, 14% above Q1 (BWP 16.3M). Average tender turnaround improved from 71 to 64 days. Emergency procurement rose to 7.2% of total value against a target below 5% (Resolution 11).</p>
    <table style="width:100%;border-collapse:collapse;font-size:11.5px;margin:8px 0">
      <tr style="background:#eee;font-weight:700"><td style="${TD}">Measure</td><td style="${TD};text-align:right">Q1</td><td style="${TD};text-align:right">Q2</td><td style="${TD};text-align:right">Change</td></tr>
      <tr><td style="${TD}">Procurement expenditure (BWP M)</td><td style="${TD};text-align:right">16.3</td><td style="${TD};text-align:right">18.6</td><td style="${TD};text-align:right">+14%</td></tr>
      <tr><td style="${TD}">Tender turnaround (days)</td><td style="${TD};text-align:right">71</td><td style="${TD};text-align:right">64</td><td style="${TD};text-align:right">−10%</td></tr>
      <tr><td style="${TD}">Emergency procurement share</td><td style="${TD};text-align:right">5.8%</td><td style="${TD};text-align:right">7.2%</td><td style="${TD};text-align:right">+1.4 pts</td></tr>
      <tr><td style="${TD}">Contract variations (count)</td><td style="${TD};text-align:right">9</td><td style="${TD};text-align:right">14</td><td style="${TD};text-align:right">+56%</td></tr>
      <tr><td style="${TD}">Delayed procurements</td><td style="${TD};text-align:right">6</td><td style="${TD};text-align:right">4</td><td style="${TD};text-align:right">−2</td></tr>
    </table>
    ${H('MAJOR ANOMALIES')}
    <p style="margin:0">Payment voucher PV-26-44812 (BWP 1,240,000) has triggered the "payment without supporting documentation" indicator. Four purchase orders to one supplier within six days have triggered the split-purchase indicator. These are flags for review, not findings.</p>
    ${H('TOP SUPPLIERS BY CONTRACT VALUE')}
    <p style="margin:0">Kgalagadi Builders, Clement Pty Ltd and Tlotlo Civil Works together hold 44% of Q2 contract value.</p>`;
  register(K(11), () => {
    const sup = ['Kgalagadi Builders', 'Clement Pty Ltd', 'Tlotlo Civil Works', 'Okavango Medical Supplies', 'Motswedi Construction', 'Naledi Pharmaceuticals', 'Chobe ICT Solutions', 'Lesedi Security Services'];
    const q2 = [3.1, 2.6, 2.4, 1.9, 1.6, 1.4, 1.1, 0.9], q1 = [2.4, 1.2, 2.6, 1.7, 1.9, 1.3, 0.8, 0.6];
    return {
      crumbs: [...crumbs, 'AI Report Generator'],
      kpis: [
        { label: 'Reports generated', value: '64', delta: '▲ 18 vs Aug', sub: 'this month', tone: 'blue' },
        { label: 'Scheduled reports', value: '18', sub: 'weekly and monthly', tone: 'violet' },
        { label: 'Avg generation time', value: '42 s', sub: 'data to formatted PDF', tone: 'cyan' },
        { label: 'Sent to Board / Minister', value: '9', sub: 'this quarter', tone: 'green' },
        { label: 'Figures traced to source', value: '100%', sub: 'explain-finding enabled', tone: 'green', pct: 100 },
      ],
      insight: { finding: 'The generated Q2 report shows procurement expenditure <b>up 14%</b> on Q1, with contract variations up 56% and emergency procurement at 7.2%. Clement Pty Ltd more than doubled its contract value following the furniture tender.', recommendation: 'Add this report to Friday\'s board pack under Procurement performance.', severity: 'Normal', tone: 'blue', actions: ['Add to board pack', 'Export PDF', 'Schedule monthly'] },
      grid: [
        [
          { span: 5, type: 'html', title: 'Report designer | natural-language prompt', html: promptHtml },
          { span: 7, type: 'doc', title: 'Generated report | preview', badge: ['Ready', 'green'], height: 400, html: reportHtml },
        ],
        [
          { span: 7, type: 'bar', title: 'Generated visual | contract value by supplier, Q1 vs Q2 (BWP M)', height: 260, horizontal: true, categories: sup, labelMax: 26,
            series: [{ name: 'Q1', data: q1, color: '#1E3A5F' }, { name: 'Q2', data: q2, color: 'blue' }] },
          { span: 5, type: 'table', title: 'Recent and scheduled reports', height: 260,
            columns: [{ key: 'r', label: 'Report' }, { key: 'f', label: 'Format' }, { key: 'w', label: 'When' }, { key: 's', label: 'Status' }],
            rows: [['Procurement performance Q2', 'PDF', 'today 10:51', 'Ready'], ['Weekly executive briefing', 'PDF', 'Mon 07:00', 'Scheduled'], ['Resolution tracker', 'Excel', 'Fri 16:00', 'Scheduled'], ['MoH capital projects variance', 'Word', 'yesterday', 'Ready'], ['Payments over 30 days', 'Excel', 'daily 06:00', 'Scheduled'], ['Revenue vs target (BURS)', 'PDF', 'Mon', 'Sent'], ['Board pack Q2 draft', 'PDF', 'today', 'Generating']]
              .map(([r, f, w, s]) => ({ r: { strong: r }, f, w, s: { pill: s, tone: s === 'Ready' ? 'green' : s === 'Sent' ? 'blue' : s === 'Generating' ? 'amber' : 'violet' } })) },
        ],
      ],
    };
  });
})();
