/* Menu 3: Budgeting Cycle (all 12 tabs render from specs).
 *
 * Two budget years are in play at month 6 (Sep 2026):
 *   FY 2026-27  approved and executing (54,487,102 for the Ministry of Health)
 *   FY 2027-28  being formulated: cell capture opened 1 Sep, submission to MoFDP 31 Oct
 * Real values from the data pack: department split per category (ministry_summary),
 * flat 1/12 phasing (monthly_phasing), income / cash-flow plan (budget_plan), variance sheet,
 * the Supplies / Services cell-capture rows (cell_breakdown) and 211 line items.
 */
(function () {
  const { register, fmt, rng } = DASH;
  const { MONTHS, MONTH_NOW, CATEGORIES, DEPTS, INCOME, OFFICERS, APPROVED, COMMITTED, ACTUAL, M } = DASH.data;
  const K = n => `2-${n}`;
  const crumbs = ['All Ministries', 'Ministry of Health'];
  const draftCrumbs = ['All Ministries', 'Ministry of Health', 'FY 2027-28 draft'];
  const m1 = v => +(v / M).toFixed(2);
  const top = (arr, key, n) => [...arr].sort((a, b) => b[key] - a[key]).slice(0, n);
  const cats10 = top(CATEGORIES, 'approved', 10);
  const cum = arr => arr.reduce((acc, v, i) => (acc.push((acc[i - 1] || 0) + (v ?? 0)), acc), []);
  const sum = arr => arr.reduce((a, b) => a + (b || 0), 0);

  // ministry_summary.csv: every category splits across Dept A–E in the same ratio.
  const DEPT_SPLIT = [330550, 363605, 399965.5, 439962.05, 483958.26].map(v => v / 2018040.81);
  const PERIOD = ['M1 Apr', 'M2 May', 'M3 Jun', 'M4 Jul', 'M5 Aug', 'M6 Sep', 'M7 Oct', 'M8 Nov', 'M9 Dec', 'M10 Jan', 'M11 Feb', 'M12 Mar'];

  // Budget by procurement type (FY 2026-27 approved, and FY 2027-28 draft request).
  const TYPES = [
    { name: 'Personnel', approved: 14200000, draft: 15050000, tone: 'violet' },
    { name: 'Works', approved: 15600000, draft: 17480000, tone: 'orange' },
    { name: 'Services', approved: 13300000, draft: 15110000, tone: 'cyan' },
    { name: 'Supplies', approved: APPROVED - 43100000, draft: 13550000, tone: 'blue' },
  ];
  const DRAFT = sum(TYPES.map(t => t.draft)); // 61.19M
  const CEILING = APPROVED * 1.05;           // MoFDP ceiling: +5%

  // Cell-capture columns shared by the Supplies / Services / Works tabs (cell_breakdown.csv layout).
  const captureCols = [
    { key: 'user', label: 'Cell (user)', nowrap: false }, { key: 'init', label: 'Project | initiative', nowrap: false }, { key: 'cat', label: 'Item category', nowrap: false }, { key: 'item', label: 'Item', nowrap: false },
    { key: 'range', label: 'Price low–high', align: 'right' }, { key: 'avg', label: 'Avg', align: 'right' }, { key: 'units', label: 'Units / yr', align: 'right' },
    { key: 'cost', label: 'Est. cost', align: 'right' }, { key: 'ly', label: 'vs last year', align: 'right' }, { key: 'just', label: 'Justification', nowrap: false },
  ];
  const captureRow = ([user, proj, init, cat, item, lo, hi, perMonth, lyCost, just]) => {
    const avg = (lo + hi) / 2, units = perMonth * 12, cost = avg * units;
    const ch = lyCost ? ((cost - lyCost) / lyCost) * 100 : null;
    return {
      user, init: `${proj} | ${init}`, cat, item, range: `${fmt.n(lo, lo < 100 ? 2 : 0)} – ${fmt.n(hi, hi < 100 ? 2 : 0)}`, avg: fmt.n(avg, avg < 100 ? 2 : 0), units: fmt.n(units), cost: fmt.n(cost),
      ly: ch == null ? { pill: 'New line', tone: 'blue' } : { trend: ch > 0 ? 'up' : 'down', text: fmt.pct(Math.abs(ch)), tone: ch > 15 ? 'red' : ch > 0 ? 'amber' : 'green' },
      just: just ? just : { pill: 'Missing', tone: 'red' },
    };
  };

  // ── 0 Strategic Plan Alignment ──
  // Vision 2036 pillar → MoH Strategic Plan goal, FY 2026-27 approved (BWP M, sums to 54.5).
  const GOALS = [
    ['Primary health care', 'Human & Social Development', 9.8, 25, 'PHC coverage 92%', 81, 88],
    ['Hospital quality', 'Human & Social Development', 12.4, 21, 'Bed occupancy < 85%', 74, 70],
    ['Disease control', 'Human & Social Development', 6.9, 14, 'ART coverage 95%', 93, 95],
    ['Health workforce', 'Human & Social Development', 8.6, 15, 'Nurse vacancy < 5%', 7.8, 5],
    ['Infrastructure', 'Sustainable Economic Development', 10.2, 16, '4 facilities commissioned', 1, 4],
    ['Green facilities', 'Sustainable Environment', 1.1, 3, '12 clinics on solar', 5, 12],
    ['Digital health', 'Governance, Peace & Security', 3.6, 6, 'EMR in 60% of hospitals', 38, 60],
  ];
  register(K(0), () => ({
    crumbs,
    kpis: [
      { label: 'Line items tagged to strategy', value: '196 of 211', delta: '93%', sub: 'NDP 12 outcome code', tone: 'blue', pct: 93 },
      { label: 'Strategic spend share', value: '96.5%', sub: 'BWP 52.6M of 54.5M', tone: 'green', pct: 96.5 },
      { label: 'Unaligned budget', value: 'BWP 1.9M', delta: '15 lines', deltaTone: 'amber', sub: 'no outcome link', tone: 'amber', pct: 3.5 },
      { label: 'NDP 12 outcomes funded', value: '11 of 14', delta: '3 unfunded', deltaTone: 'red', sub: 'health sector', tone: 'violet', pct: 79 },
      { label: 'PHC share vs target', value: '18% / 25%', delta: '▼ 7 pts', deltaTone: 'red', sub: 'Strategic Plan 2025-30', tone: 'red', pct: 72 },
    ],
    insight: { finding: 'Universal primary health care is the Strategic Plan’s top goal (target <b>25%</b> of budget) but receives <b>18%</b> (BWP 9.8M). Fifteen line items worth <b>BWP 1.9M</b>, mostly Public Relations and Meetings, carry no NDP 12 outcome code.', recommendation: 'Make the outcome code mandatory at cell capture for FY 2027-28 and move BWP 1.5M of unaligned lines to PHC outreach.', severity: 'Medium', tone: 'amber' },
    grid: [
      [
        { span: 7, type: 'sankey', title: 'Vision 2036 pillar → Strategic Plan goal (BWP M, FY 2026-27)', height: 310,
          nodes: [...new Set(GOALS.map(g => g[1])), 'No outcome code', ...GOALS.map(g => g[0]), 'Unaligned lines'],
          links: [...GOALS.map(g => ({ source: g[1], target: g[0], value: g[2] })), { source: 'No outcome code', target: 'Unaligned lines', value: 1.9 }] },
        { span: 5, type: 'bar', title: 'Budget share vs Strategic Plan target (%)', height: 310, horizontal: true, categories: GOALS.map(g => g[0]), labelMax: 20,
          series: [{ name: 'Target share', data: GOALS.map(g => g[3]), color: '#1E3A5F' }, { name: 'Budget share', data: GOALS.map(g => ({ value: +((g[2] / 54.5) * 100).toFixed(1), itemStyle: { color: (g[2] / 54.5) * 100 < g[3] - 2 ? '#F59E0B' : '#10B981' } })), label: true }] },
      ],
      [
        { span: 8, type: 'table', title: 'Strategic goals | funding and outcome indicators', height: 270,
          columns: [{ key: 'g', label: 'Goal' }, { key: 'b', label: 'Budget (BWP M)', align: 'right' }, { key: 'k', label: 'Outcome indicator' }, { key: 'prog', label: 'Progress to target' }, { key: 's', label: 'Alignment' }],
          rows: GOALS.map(([g, , b, t, k, now, tgt]) => { const lowerBetter = /vacancy/i.test(k); const prog = lowerBetter ? Math.min(100, (tgt / now) * 100) : Math.min(100, (now / tgt) * 100); const share = (b / 54.5) * 100; return { g: { strong: g }, b: b.toFixed(1), k, prog: { bar: prog, tone: prog > 85 ? 'green' : prog > 55 ? 'amber' : 'red' }, s: share < t - 2 ? { pill: 'Under-funded', tone: 'amber' } : { pill: 'Aligned', tone: 'green' } }; }) },
        { span: 4, type: 'donut', title: 'Alignment of 211 line items', height: 270, center: '93%', items: [{ name: 'Directly aligned', value: 142, color: 'green' }, { name: 'Indirectly aligned', value: 54, color: 'blue' }, { name: 'Unaligned', value: 15, color: 'amber' }] },
      ],
    ],
  }));

  // ── 1 Budget Formulation (Cell Capture) ──
  register(K(1), () => {
    const r = rng('form');
    const deptDraft = DEPTS.map((d, i) => ({ ...d, ceiling: d.approved * 1.05, draft: DRAFT * DEPT_SPLIT[i] * [0.96, 1.0, 0.98, 1.0, 1.05][i] / 1.0 }));
    const adj = DRAFT / sum(deptDraft.map(d => d.draft));
    deptDraft.forEach(d => (d.draft *= adj));
    const cells = [38, 36, 40, 34, 38];
    const submitted = [34, 29, 31, 22, 26];
    const draft = [3, 5, 6, 8, 7];
    const users = ['Princess Marina Hospital | Pharmacy', 'Molepolole Clinic | Nursing', 'Public Health | Immunisation', 'Corporate Services | Admin Office', 'Health Infrastructure | Projects Unit', 'Nyangabgwe Hospital | Theatre', 'Maun DHMT | Outreach', 'Corporate Services | ICT', 'Public Health | Environmental Health', 'Hospital Services | Laboratory'];
    return {
      crumbs: draftCrumbs,
      kpis: [
        { label: 'Cells submitted', value: '142 of 186', delta: '76%', sub: 'cost-centre cells', tone: 'blue', pct: 76 },
        { label: 'Draft request FY 27-28', value: fmt.bwp(DRAFT), delta: '▲ 12.3%', deltaTone: 'amber', sub: 'vs FY 26-27 approved', tone: 'violet' },
        { label: 'MoFDP ceiling', value: fmt.bwp(CEILING), delta: '▲ 5% cap', sub: 'budget call circular', tone: 'cyan', pct: Math.round((CEILING / DRAFT) * 100) },
        { label: 'Lines captured', value: '3,418', delta: '87 no justification', deltaTone: 'red', sub: '', tone: 'amber' },
        { label: 'Days to submission', value: '38', sub: 'deadline 31 Oct 2026', tone: 'green', pct: 58 },
      ],
      insight: { finding: `The FY 2027-28 draft stands at <b>${fmt.bwp(DRAFT)}</b>, <b>${fmt.bwp(DRAFT - CEILING)}</b> above the 5% ceiling with 44 cells still to submit. Dept E (Health Infrastructure) accounts for most of the excess through two new works projects.`, recommendation: 'Issue ceilings per department now and ask Dept E to rank its works lines before HOD review.', severity: 'High', tone: 'orange' },
      grid: [
        [{ span: 12, type: 'steps', title: 'FY 2027-28 formulation calendar',
          steps: [{ name: 'Budget call circular', meta: '18 Aug', state: 'done' }, { name: 'Ceilings & templates', meta: '25 Aug', state: 'done' }, { name: 'Cell capture', meta: '1 Sep – 10 Oct', state: 'current' }, { name: 'HOD review', meta: 'by 17 Oct' }, { name: 'Dept consolidation', meta: 'by 24 Oct' }, { name: 'Budget committee', meta: '28 Oct' }, { name: 'Submit to MoFDP', meta: '31 Oct' }, { name: 'Budget hearings', meta: 'Nov' }, { name: 'Parliament', meta: 'Feb 2027' }] }],
        [
          { span: 7, type: 'bar', title: 'Draft request vs ceiling by department (BWP M)', height: 270, categories: deptDraft.map(d => d.code), y2: '%', gridOpt: { top: 44 },
            series: [{ name: 'FY 26-27 approved', data: deptDraft.map(d => m1(d.approved)), color: '#1E3A5F' }, { name: 'Ceiling', data: deptDraft.map(d => m1(d.ceiling)), color: 'cyan' }, { name: 'Draft request', data: deptDraft.map(d => m1(d.draft)), color: 'violet' }, { name: 'Growth %', type: 'line', axis: 1, data: deptDraft.map(d => +(((d.draft - d.approved) / d.approved) * 100).toFixed(1)), color: 'amber', markLine: { value: 5, label: 'Cap 5%', tone: 'red' } }] },
          { span: 5, type: 'bar', title: 'Cell capture status by department (cells)', height: 270, horizontal: true, categories: DEPTS.map(d => d.label), labelMax: 24,
            series: [{ name: 'Submitted', data: submitted, stack: 's', color: 'green' }, { name: 'In draft', data: draft, stack: 's', color: 'amber' }, { name: 'Not started', data: cells.map((c, i) => c - submitted[i] - draft[i]), stack: 's', color: 'red' }] },
        ],
        [{ span: 12, type: 'table', title: 'Latest cell submissions', height: 250,
          columns: [{ key: 'cell', label: 'Cell' }, { key: 'dept', label: 'Department' }, { key: 'time', label: 'Submitted' }, { key: 'lines', label: 'Lines', align: 'right' }, { key: 'val', label: 'Request (BWP)', align: 'right' }, { key: 'ly', label: 'vs FY 26-27', align: 'right' }, { key: 'just', label: 'Justification' }, { key: 'st', label: 'Status' }],
          rows: users.map((u, i) => { const v = r.int(180, 2400) * 1000, g = r.num(-6, 28), miss = i === 4 || i === 7 ? r.int(6, 14) : 0; return { cell: { strong: u }, dept: DEPTS[[2, 0, 1, 3, 4, 2, 1, 3, 1, 2][i]].label, time: `${String(22 - Math.floor(i / 2)).padStart(2, '0')} Sep ${String(8 + i).padStart(2, '0')}:${String(r.int(0, 59)).padStart(2, '0')}`, lines: r.int(12, 64), val: fmt.n(v), ly: { trend: g > 0 ? 'up' : 'down', text: fmt.pct(Math.abs(g), 1), tone: g > 10 ? 'red' : g > 0 ? 'amber' : 'green' }, just: miss ? { pill: `${miss} missing`, tone: 'red' } : { pill: 'Complete', tone: 'green' }, st: miss ? { pill: 'Returned', tone: 'orange' } : i < 3 ? { pill: 'HOD review', tone: 'blue' } : { pill: 'Submitted', tone: 'green' } }; }) }],
      ],
    };
  });

  // ── 2 Supplies Budget ──
  // First two rows are the client's cell_breakdown sample (Admin Office, Pencils 2–5, 100/month = 4,200; soccer kits 3–6, 130/month = 7,020).
  const SUPPLY_LINES = [
    ['Admin Office', 'Sports', 'Youth empowerment', 'Stationery', 'Pencils', 2, 5, 100, 3900, 'For office use'],
    ['Admin Office', 'Sports', 'Youth empowerment', 'Supplies', 'Soccer kits', 3, 6, 130, null, 'Sports & recreation'],
    ['PMH Pharmacy', 'Essential medicines', 'ARV continuity', 'Pharmaceuticals', 'TLD ARV tablets (30s)', 92, 118, 2600, 2980000, 'Patient growth 6% p.a.'],
    ['Public Health', 'EPI programme', 'Child immunisation', 'Vaccines', 'Measles-rubella vaccine (10-dose)', 38, 51, 1800, 812000, 'Catch-up campaign Q2'],
    ['Molepolole Clinic', 'Primary care', 'Maternal health', 'Medical consumables', 'Delivery packs', 145, 190, 260, 488000, 'Deliveries up 11%'],
    ['Hospital Services', 'Laboratory', 'TB diagnostics', 'Lab reagents', 'GeneXpert cartridges', 118, 142, 700, 1020000, 'Case finding target'],
    ['Nyangabgwe Hospital', 'Theatre', 'Surgical backlog', 'Medical consumables', 'Suture kits', 22, 35, 1400, 402000, 'Backlog clearance'],
    ['Corporate Services', 'Head office', 'Office running', 'Stationery', 'A4 copy paper (box)', 210, 265, 95, 262000, ''],
    ['Maun DHMT', 'Outreach', 'Mobile clinics', 'Fuel & lubricants', 'Diesel (litres)', 16.4, 19.8, 5200, 1050000, 'Two new routes'],
    ['Health Infrastructure', 'Facility upkeep', 'Hygiene', 'Cleaning materials', 'Disinfectant (5L)', 88, 140, 420, 402000, ''],
  ].map(captureRow);
  register(K(2), () => {
    const cats = [['Pharmaceuticals', 5.21], ['Vaccines', 1.62], ['Medical consumables', 2.38], ['Lab reagents', 1.44], ['Fuel & lubricants', 1.19], ['Stationery', 0.62], ['Cleaning materials', 0.58], ['Uniforms & linen', 0.51]];
    const seas = [1, 1.08, 1.22, 1.18, 1.05, 0.96, 0.94, 0.92, 0.88, 0.9, 0.95, 0.92];
    return {
      crumbs: [...draftCrumbs, 'Supplies'],
      kpis: [
        { label: 'Supplies request FY 27-28', value: fmt.bwp(13550000), delta: '▲ 19%', deltaTone: 'red', sub: `vs ${fmt.bwp(TYPES[3].approved)} approved`, tone: 'blue' },
        { label: 'Supply lines captured', value: '1,204', sub: '64 catalogue items', tone: 'violet' },
        { label: 'Pharma + vaccines', value: '50%', sub: 'of supplies request', tone: 'cyan', pct: 50 },
        { label: 'Priced above catalogue high', value: '6 lines', delta: 'BWP 184K excess', deltaTone: 'red', sub: '', tone: 'red' },
        { label: 'Avg price spread', value: '1.4×', sub: 'high ÷ low estimate', tone: 'amber' },
      ],
      insight: { finding: 'Supplies are up <b>19%</b> on FY 2026-27, driven by ARV patient growth (+6%) and a measles-rubella catch-up campaign. Six lines are priced above the catalogue high estimate, including hospital disinfectant quoted at BWP 140 against a contract rate of BWP 96.', recommendation: 'Price the six lines at the national supply contract rate and move vaccines to the CMS framework.', severity: 'Medium', tone: 'amber' },
      grid: [
        [
          { span: 5, type: 'treemap', title: 'Supplies request by item category (BWP M)', height: 290, valueFmt: v => `BWP ${v}M`, items: cats.map(([name, value]) => ({ name, value })) },
          { span: 7, type: 'bar', title: 'Monthly supplies phasing by category (BWP M)', height: 290, categories: MONTHS,
            series: cats.slice(0, 5).map(([name, v]) => ({ name, stack: 's', data: seas.map((s, i) => +((v / 12) * (name === 'Vaccines' && i >= 1 && i <= 3 ? 1.6 : s) * (name === 'Vaccines' ? 0.84 : 1)).toFixed(2)) })) },
        ],
        [{ span: 12, type: 'table', title: 'Supplies cell capture | line detail (BWP)', note: 'Low / high / average price per unit, 12-month units. Click a line to view pictures, specifications and justification file.', height: 300, columns: captureCols, rows: SUPPLY_LINES }],
      ],
    };
  });

  // ── 3 Services Budget ──
  // First two rows from cell_breakdown Services (doctors consult 2–5 per hour, 100 h/month; coach training 3–6, 130 h/month).
  const SERVICE_LINES = [
    ['Admin Office', 'Sports', 'Youth empowerment', 'Medical services', 'Doctors consult (hours)', 2, 5, 100, 4050, 'Sports & recreation'],
    ['Admin Office', 'Sports', 'Youth empowerment', 'Coach consulting', 'Coach training (hours)', 3, 6, 130, 6480, 'Sports & recreation'],
    ['Hospital Services', 'Patient care', 'Specialist cover', 'Locum services', 'Locum anaesthetist (hours)', 820, 1150, 160, 1720000, 'Two vacant posts'],
    ['Corporate Services', 'Facilities', 'Clean hospitals', 'Cleaning services', 'PMH cleaning contract (months)', 182000, 214000, 1, 2210000, 'Contract renewal'],
    ['Corporate Services', 'Facilities', 'Safe facilities', 'Security services', 'Guarding, 14 sites (months)', 118000, 139000, 1, 1480000, ''],
    ['Corporate Services', 'ICT', 'Digital health', 'Software licences', 'EMR licences (users)', 1450, 1800, 90, 1510000, 'EMR rollout'],
    ['Health Infrastructure', 'Maintenance', 'Medical equipment', 'Maintenance contracts', 'CT / MRI service (months)', 64000, 81000, 1, 820000, 'OEM contract'],
    ['Public Health', 'Outreach', 'Community health', 'Catering', 'Campaign catering (days)', 4200, 6100, 6, 214000, ''],
    ['Hospital Services', 'Laboratory', 'Quality', 'Professional services', 'SANAS accreditation audit', 88000, 112000, 0.25, 92000, 'Annual audit'],
  ].map(captureRow);
  register(K(3), () => {
    const cats = ['Cleaning', 'Security', 'Locum & clinical', 'ICT licences', 'Equipment maintenance', 'Consultancy', 'Catering & events'];
    const base = [3.1, 2.2, 2.9, 2.4, 1.9, 1.5, 1.11];
    return {
      crumbs: [...draftCrumbs, 'Services'],
      kpis: [
        { label: 'Services request FY 27-28', value: fmt.bwp(15110000), delta: '▲ 13.6%', deltaTone: 'amber', sub: `vs ${fmt.bwp(13300000)} approved`, tone: 'cyan' },
        { label: 'Continuing contracts', value: '71%', sub: '48 contracts roll over', tone: 'blue', pct: 71 },
        { label: 'New services', value: fmt.bwp(4380000), sub: '29% of request', tone: 'violet', pct: 29 },
        { label: 'Hours-based lines', value: '312', sub: 'locum, consult, training', tone: 'green' },
        { label: 'Contracts expiring in FY', value: '11', delta: 'need re-tender', deltaTone: 'red', sub: '', tone: 'red' },
      ],
      insight: { finding: 'Locum anaesthetist hours are budgeted at <b>BWP 1.58M</b>, the equivalent of 3.4 full-time posts at the current salary scale, while two anaesthetist posts remain vacant.', recommendation: 'Fund the two posts in Personnel and cut locum hours by 60%, saving about BWP 0.6M.', severity: 'Medium', tone: 'amber' },
      grid: [
        [
          { span: 7, type: 'bar', title: 'Services request by category and department (BWP M)', height: 280, horizontal: true, categories: cats, labelMax: 22,
            series: DEPTS.map((d, i) => ({ name: d.code, stack: 's', data: base.map((b, j) => +(b * DEPT_SPLIT[(i + j) % 5]).toFixed(2)) })) },
          { span: 5, type: 'list', title: 'Reviewer flags', height: 280, items: [
            { title: 'Locum hours exceed vacancy cost', meta: 'Hospital Services · anaesthesia', pill: 'Review', tone: 'amber' },
            { title: 'Security line has no justification', meta: 'Corporate Services · 14 sites', pill: 'Missing', tone: 'red' },
            { title: 'Cleaning contract up 9% on renewal', meta: 'PMH · CPI is 3.1%', pill: 'Query', tone: 'amber' },
            { title: 'Catering above events policy rate', meta: 'Public Health · BWP 6,100 / day', pill: 'Query', tone: 'amber' },
            { title: 'EMR licences match rollout plan', meta: 'Corporate Services · ICT', pill: 'Cleared', tone: 'green' },
            { title: 'CT / MRI service on OEM rate card', meta: 'Health Infrastructure', pill: 'Cleared', tone: 'green' },
          ] },
        ],
        [{ span: 12, type: 'table', title: 'Services cell capture | line detail (BWP)', note: 'Hours-based lines carry the hourly rate range; monthly contracts carry the monthly fee range.', height: 300, columns: captureCols, rows: SERVICE_LINES }],
      ],
    };
  });

  // ── 4 Works Budget ──
  const WORKS = [
    ['Construction of Clinic | Molepolole', 'Continuing', 5.8, 58, 0, 14, 'Clement Pty Ltd'],
    ['Maun District Hospital Wing', 'Continuing', 4.6, 45, 0, 18, 'Kgalagadi Builders'],
    ['Francistown Referral Theatre', 'Continuing', 2.9, 52, 2, 16, 'Tlotlo Civil Works'],
    ['Kasane Health Post Upgrade', 'Continuing', 0.6, 88, 0, 5, 'Motswedi Construction'],
    ['Tsabong Primary Hospital Maternity', 'New', 2.1, 0, 6, 22, 'Tender planned'],
    ['Solar retrofit | 12 clinics', 'New', 1.48, 0, 4, 12, 'Tender planned'],
  ];
  register(K(4), () => ({
    crumbs: [...draftCrumbs, 'Works'],
    kpis: [
      { label: 'Works request FY 27-28', value: fmt.bwp(17480000), delta: '▲ 12%', deltaTone: 'amber', sub: `vs ${fmt.bwp(15600000)} approved`, tone: 'orange' },
      { label: 'Continuing projects', value: '4', sub: 'BWP 13.9M, contracted', tone: 'blue', pct: 80 },
      { label: 'New projects', value: '2', sub: 'BWP 3.58M, not designed', tone: 'violet', pct: 20 },
      { label: 'Contingency & retention', value: '10%', sub: 'BWP 1.4M held', tone: 'cyan' },
      { label: 'Projects without BoQ', value: '1', delta: 'Tsabong maternity', deltaTone: 'red', sub: '', tone: 'red' },
    ],
    insight: { finding: 'Continuing contracts already commit <b>BWP 13.9M</b> of the works request. The new Tsabong maternity wing (BWP 2.1M) has no approved design or bill of quantities, so less than 30% of its allocation is likely to be spent in FY 2027-28.', recommendation: 'Fund design only (BWP 0.4M) in FY 2027-28 and move construction to FY 2028-29.', severity: 'High', tone: 'orange' },
    grid: [
      [
        { span: 7, type: 'gantt', title: 'Works programme | FY 2027-28 (months)', start: 0, end: 24, today: 6, labelWidth: 220, height: 280, ticks: ['Apr 26', 'Oct 26', 'Apr 27', 'Oct 27', 'Mar 28'],
          tasks: WORKS.map(([name, kind, , prog, s, e]) => ({ name, start: s, end: e, progress: prog, tone: kind === 'New' ? 'violet' : prog > 80 ? 'green' : 'blue', label: kind === 'New' ? 'New' : `${prog}%` })) },
        { span: 5, type: 'bar', title: 'FY 2027-28 works request by project (BWP M)', height: 280, horizontal: true, categories: WORKS.map(w => w[0]), labelMax: 24,
          series: [{ name: 'Request', label: true, data: WORKS.map(w => ({ value: w[2], itemStyle: { color: w[1] === 'New' ? '#8B5CF6' : '#F97316' } })) }] },
      ],
      [
        { span: 8, type: 'table', title: 'Works cell capture | bill items (BWP)', height: 250,
          columns: [{ key: 'p', label: 'Project' }, { key: 'i', label: 'Item' }, { key: 'u', label: 'Unit basis' }, { key: 'q', label: 'Qty', align: 'right' }, { key: 'rate', label: 'Rate', align: 'right' }, { key: 'c', label: 'Cost', align: 'right' }, { key: 's', label: 'Source' }],
          rows: [
            ['Construction of Clinic', 'Superstructure & roofing', 'm²', 1840, 1450, 'BoQ'], ['Construction of Clinic', 'Mechanical & electrical', 'lump sum', 1, 1130000, 'BoQ'],
            ['Maun Hospital Wing', 'Ward block finishes', 'm²', 2600, 980, 'BoQ'], ['Maun Hospital Wing', 'Medical gases', 'lump sum', 1, 2052000, 'VO-3'],
            ['Francistown Theatre', 'Theatre fit-out', 'theatre', 2, 1450000, 'BoQ'], ['Kasane Health Post', 'External works', 'lump sum', 1, 600000, 'BoQ'],
            ['Tsabong Maternity', 'Design & site survey', 'lump sum', 1, 400000, 'Estimate'], ['Tsabong Maternity', 'Construction (provisional)', 'm²', 1100, 1545, 'No BoQ'],
            ['Solar retrofit', 'PV + battery per clinic', 'clinic', 12, 123000, 'Quote'],
          ].map(([p, i, u, q, rate, s]) => ({ p: { strong: p }, i, u, q: fmt.n(q), rate: fmt.n(rate), c: fmt.n(q * rate), s: s === 'No BoQ' ? { pill: s, tone: 'red' } : s === 'Estimate' || s === 'Quote' ? { pill: s, tone: 'amber' } : s === 'VO-3' ? { pill: s, tone: 'violet' } : { pill: s, tone: 'green' } })) },
        { span: 4, type: 'donut', title: 'Works request by stage', height: 250, center: 'BWP 17.5M', valueFmt: v => `BWP ${v}M`, items: [{ name: 'Under construction', value: 13.9, color: 'orange' }, { name: 'Design', value: 0.4, color: 'cyan' }, { name: 'Not designed', value: 1.7, color: 'red' }, { name: 'Quoted', value: 1.48, color: 'violet' }] },
      ],
    ],
  }));

  // ── 5 Consolidation (Cell to Ministry) ──
  const CELL_GROUPS = [['Clinics (22 cells)', 0, 0.6], ['Nursing (16)', 0, 0.4], ['Immunisation (14)', 1, 0.45], ['DHMT outreach (22)', 1, 0.55], ['Hospitals (26)', 2, 0.7], ['Laboratories (14)', 2, 0.3],
    ['Admin & HR (18)', 3, 0.55], ['ICT & Finance (16)', 3, 0.45], ['Projects unit (20)', 4, 0.65], ['Maintenance (18)', 4, 0.35]];
  register(K(5), () => {
    const deptTotals = DEPT_SPLIT.map(s => APPROVED * s);
    return {
      crumbs: [...crumbs, 'Consolidation'],
      kpis: [
        { label: 'Consolidated budget', value: fmt.n(APPROVED), sub: 'BWP | FY 2026-27', tone: 'blue', pct: 100 },
        { label: 'Roll-up path', value: '186 → 5 → 1', sub: 'cells → depts → ministry', tone: 'violet' },
        { label: 'Reconciliation difference', value: 'BWP 0', delta: '✓ balanced', deltaTone: 'green', sub: 'cells = ministry', tone: 'green', pct: 100 },
        { label: 'Largest department', value: 'Dept E 24%', sub: fmt.bwp(deptTotals[4]), tone: 'orange', pct: 24 },
        { label: 'Per-category total', value: 'BWP 2.02M', sub: 'average of 27', tone: 'cyan' },
      ],
      insight: { finding: 'All 186 cell budgets roll up to the ministry total of <b>BWP 54,487,102</b> with no unreconciled difference. Each category splits across departments in a fixed ratio (A 16% to E 24%), so Dept E carries <b>BWP 13.1M</b> even in categories it barely uses, such as Public Relations.', recommendation: 'Consolidate from actual cell demand for FY 2027-28 instead of the fixed ratio.', severity: 'Low', tone: 'blue', actions: ['Explain finding', 'Open cell roll-up', 'Export consolidation'] },
      grid: [
        [
          { span: 7, type: 'sankey', title: 'Cell groups → department → ministry (BWP M)', height: 300,
            nodes: [...CELL_GROUPS.map(g => g[0]), ...DEPTS.map(d => d.label), 'Ministry of Health'],
            links: [...CELL_GROUPS.map(([n, d, share]) => ({ source: n, target: DEPTS[d].label, value: m1(deptTotals[d] * share) })), ...DEPTS.map((d, i) => ({ source: d.label, target: 'Ministry of Health', value: m1(deptTotals[i]) }))] },
          { span: 5, type: 'bar', title: 'Department totals by budget type (BWP M)', height: 300, categories: DEPTS.map(d => d.code),
            series: TYPES.map(t => ({ name: t.name, stack: 't', color: t.tone, data: DEPT_SPLIT.map(s => m1(t.approved * s)) })) },
        ],
        [{ span: 12, type: 'table', title: 'Ministry summary | 27 categories × Dept A–E (BWP)', height: 300,
          columns: [{ key: 'no', label: '#' }, { key: 'n', label: 'Budget category' }, ...DEPTS.map(d => ({ key: d.code, label: d.code, align: 'right' })), { key: 't', label: 'Total ministry', align: 'right' }, { key: 'sh', label: 'Share' }],
          rows: [...CATEGORIES.map(c => ({ no: c.no, n: c.name, ...Object.fromEntries(DEPTS.map((d, i) => [d.code, fmt.n(c.approved * DEPT_SPLIT[i])])), t: fmt.n(c.approved), sh: { bar: (c.approved / APPROVED) * 100 * 4, text: fmt.pct((c.approved / APPROVED) * 100, 1), tone: 'blue' } })),
            { no: '', n: { strong: 'TOTAL' }, ...Object.fromEntries(DEPTS.map((d, i) => [d.code, { strong: fmt.n(deptTotals[i]) }])), t: { strong: fmt.n(APPROVED) }, sh: { pill: 'Balanced', tone: 'green' } }] }],
      ],
    };
  });

  // ── 6 Approval Workflow ──
  register(K(6), () => {
    const r = rng('bwf');
    const item = (title, meta, pill, tone) => ({ title, meta, pill, tone });
    return {
      crumbs: draftCrumbs,
      kpis: [
        { label: 'Submissions in workflow', value: '142', sub: 'FY 2027-28 cells', tone: 'blue' },
        { label: 'Cleared to PS', value: '38', delta: '27%', sub: 'of submitted', tone: 'green', pct: 27 },
        { label: 'Returned for correction', value: '17', delta: '12%', deltaTone: 'amber', sub: 'mostly justification', tone: 'amber', pct: 12 },
        { label: 'Avg cycle time', value: '6.8 days', delta: '▲ 1.9 vs SLA', deltaTone: 'red', sub: 'SLA 4.9 days', tone: 'violet' },
        { label: 'Overdue at HOD', value: '9', delta: '> 3 days', deltaTone: 'red', sub: 'Dept D, Dept E', tone: 'red' },
      ],
      insight: { finding: 'HOD review is the bottleneck: <b>9 submissions</b> have waited more than 3 days, seven of them in Dept D (Corporate Services). At the current pace the 24 Oct consolidation date slips by about <b>5 days</b>.', recommendation: 'Delegate HOD review for lines under BWP 250K to deputy directors and escalate the nine overdue items to the Deputy PS.', severity: 'High', tone: 'orange', actions: ['Explain finding', 'Escalate overdue', 'Send reminders'] },
      grid: [
        [{ span: 12, type: 'steps', title: 'Budget approval chain | submissions at each gate',
          steps: [{ name: 'Cell officer submits', meta: '142 submitted', state: 'done' }, { name: 'HOD review', meta: '41 waiting · 9 late', state: 'late' }, { name: 'Director Finance', meta: '28 waiting', state: 'current' }, { name: 'Budget committee', meta: '18 waiting' }, { name: 'Permanent Secretary', meta: '38 cleared' }, { name: 'MoFDP submission', meta: '31 Oct' }] }],
        [{ span: 12, type: 'kanban', title: 'Submission board', height: 300, columns: [
          { name: 'HOD review', tone: 'amber', items: [item('Corporate Services | ICT', 'BWP 1.84M · 6 d', 'Overdue', 'red'), item('Corporate Services | Admin Office', 'BWP 0.62M · 5 d', 'Overdue', 'red'), item('Health Infrastructure | Projects', 'BWP 4.10M · 4 d', 'Overdue', 'red'), item('Public Health | Nutrition', 'BWP 0.38M · 1 d', 'On time', 'green')] },
          { name: 'Director Finance', tone: 'blue', items: [item('PMH | Pharmacy', 'BWP 2.41M · 2 d', 'On time', 'green'), item('Maun DHMT | Outreach', 'BWP 0.77M · 3 d', 'Due today', 'amber'), item('Nyangabgwe | Theatre', 'BWP 1.12M · 1 d', 'On time', 'green')] },
          { name: 'Budget committee', tone: 'violet', items: [item('Public Health | Immunisation', 'BWP 1.93M', 'Scheduled 28 Oct', 'violet'), item('Hospital Services | Laboratory', 'BWP 1.21M', 'Scheduled 28 Oct', 'violet')] },
          { name: 'Cleared to PS', tone: 'green', items: [item('Clinical Services | Nursing', 'BWP 2.85M', 'Cleared', 'green'), item('Molepolole Clinic', 'BWP 0.54M', 'Cleared', 'green'), item('Public Health | Env. Health', 'BWP 0.41M', 'Cleared', 'green')] },
          { name: 'Returned', tone: 'red', items: [item('Health Infrastructure | Maintenance', 'Missing BoQ', 'Returned', 'orange'), item('Corporate Services | Security', 'No justification', 'Returned', 'orange')] },
        ] }],
        [
          { span: 6, type: 'bar', title: 'Average days at each gate vs SLA', height: 230, categories: ['Cell → HOD', 'HOD review', 'Director Finance', 'Budget committee', 'PS sign-off'],
            series: [{ name: 'SLA (days)', data: [0.5, 1.5, 1.2, 1.0, 0.7], color: '#1E3A5F' }, { name: 'Actual (days)', label: true, data: [0.4, 3.6, 1.4, 0.8, 0.6].map((v, i) => ({ value: v, itemStyle: { color: v > [0.5, 1.5, 1.2, 1.0, 0.7][i] * 1.5 ? '#EF4444' : v > [0.5, 1.5, 1.2, 1.0, 0.7][i] ? '#F59E0B' : '#10B981' } })) }] },
          { span: 6, type: 'table', title: 'Audit trail | last actions', height: 230,
            columns: [{ key: 't', label: 'Time' }, { key: 'who', label: 'Officer' }, { key: 'a', label: 'Action' }, { key: 'c', label: 'Cell' }],
            rows: [['Approve', 'green'], ['Return', 'orange'], ['Approve', 'green'], ['Escalate', 'red'], ['Approve', 'green'], ['Submit', 'blue'], ['Approve', 'green']].map(([a, t], i) => ({ t: `23 Sep ${String(15 - i).padStart(2, '0')}:${String(r.int(0, 59)).padStart(2, '0')}`, who: OFFICERS[[3, 5, 3, 11, 10, 4, 5][i]], a: { pill: a, tone: t }, c: ['PMH Pharmacy', 'Security', 'Nursing', 'Corporate ICT', 'Molepolole Clinic', 'Nutrition', 'Env. Health'][i] })) },
        ],
      ],
    };
  });

  // ── 7 Allocation & Monthly Phasing ──
  register(K(7), () => {
    const monthly = APPROVED / 12; // monthly_phasing.csv: 1/12 per month
    const warrants = [13.62, 0, 0, 13.62, 0, 4.36, null, null, null, null, null, null]; // Q1, Q2 and a partial Q2 top-up
    const released = 31.6;
    const actual = CATEGORIES.reduce((acc, c) => acc.map((v, i) => v + (c.monthly[i] || 0)), MONTHS.map(() => 0));
    const sc = ACTUAL / sum(actual.slice(0, MONTH_NOW));
    const act = actual.map((v, i) => (i < MONTH_NOW ? m1(v * sc) : null));
    const profiles = {
      'Salaries and Wages': MONTHS.map((_, i) => (i === 8 ? 12.5 : 7.95)),
      'Capital Projects': [3, 4, 6, 7, 8, 9, 10, 10, 9, 10, 12, 12],
      'ICT Expenditure': [4, 5, 6, 8, 10, 10, 9, 8, 7, 9, 11, 13],
      'Transport & Fleet Management': MONTHS.map(() => 8.33),
      Utilities: [7, 8, 10, 11, 10, 8, 7, 7, 8, 8, 8, 8],
      Maintenance: [6, 7, 9, 9, 8, 8, 8, 9, 7, 9, 10, 10],
      'Professional Services': [5, 6, 7, 8, 8, 9, 9, 9, 8, 9, 10, 12],
      'Training & Capacity Building': [4, 6, 10, 10, 8, 6, 12, 12, 2, 8, 12, 10],
    };
    const names = Object.keys(profiles);
    const values = [];
    names.forEach((n, y) => profiles[n].forEach((v, x) => values.push([x, y, +v.toFixed(1)])));
    return {
      crumbs,
      kpis: [
        { label: 'Approved allocation', value: fmt.n(APPROVED), sub: 'BWP | 27 categories', tone: 'blue', pct: 100 },
        { label: 'Monthly phase', value: fmt.bwp(monthly), sub: '1/12 flat profile', tone: 'cyan' },
        { label: 'Warrants released', value: 'BWP 31.6M', delta: '58%', sub: 'Q1, Q2 + top-up', tone: 'violet', pct: 58 },
        { label: 'Released, unspent', value: fmt.bwp(released * M - ACTUAL), sub: 'cash at ministry', tone: 'amber' },
        { label: 'Re-phasing requests', value: '5', delta: 'BWP 2.6M to Q4', deltaTone: 'amber', sub: 'for Q3 revision', tone: 'orange' },
      ],
      insight: { finding: `Every category is phased at a flat 1/12 (<b>${fmt.bwp(monthly)}</b> a month), yet capital certificates and ICT licences fall mainly in Q3–Q4. Actual spend is ${fmt.pct((ACTUAL / (monthly * MONTH_NOW)) * 100 - 100)} above the flat profile after six months, which triggered the Q2 warrant top-up.`, recommendation: 'Adopt the proposed seasonal profiles below from the Q3 warrant so releases follow certified work.', severity: 'Medium', tone: 'amber' },
      grid: [
        [
          { span: 8, type: 'bar', title: 'Phased allocation, warrants and actual spend (BWP M)', height: 290, categories: MONTHS, y2: 'M', gridOpt: { top: 44 },
            series: [{ name: 'Phased (1/12)', data: MONTHS.map(() => m1(monthly)), color: '#1E3A5F' }, { name: 'Actual', data: act, color: 'blue' }, { name: 'Warrant', data: warrants.map(v => (v ? v : null)), color: 'violet' }, { name: 'Cumulative phased', type: 'line', axis: 1, data: cum(MONTHS.map(() => monthly)).map(m1), color: 'cyan', dashed: true }, { name: 'Cumulative warrants', type: 'line', axis: 1, data: cum(warrants).slice(0, MONTH_NOW), color: 'green', smooth: false }] },
          { span: 4, type: 'gauge', title: 'Released vs phased vs spent (month 6)', height: 290, gauges: [{ name: 'Released', value: 58, tone: 'violet' }, { name: 'Phased', value: 50, tone: 'cyan' }, { name: 'Spent', value: 54, tone: 'blue' }] },
        ],
        [
          { span: 8, type: 'heatmap', title: 'Proposed phasing profile | % of annual allocation by month', height: 300, x: MONTHS, y: names, values, min: 0, max: 14, cellFmt: v => v.toFixed(0), valueFmt: v => v + '% of annual', colors: ['#0f2a4d', '#1D4ED8', '#06B6D4', '#F59E0B'] },
          { span: 4, type: 'table', title: 'Warrant register', height: 300,
            columns: [{ key: 'w', label: 'Warrant' }, { key: 'd', label: 'Date' }, { key: 'a', label: 'Amount (BWP)', align: 'right' }, { key: 's', label: 'Status' }],
            rows: [['GW-26-001', '01 Apr', 13620000, 'Released', 'green'], ['GW-26-014', '01 Jul', 13620000, 'Released', 'green'], ['SW-26-022', '12 Sep', 4360000, 'Released', 'green'], ['GW-26-031', '01 Oct', 13620000, 'Scheduled', 'blue'], ['SW-26-035', '15 Oct', 2600000, 'Requested', 'amber'], ['GW-26-042', '01 Jan', 7267102, 'Scheduled', 'blue']].map(([w, d, a, s, t]) => ({ w, d, a: fmt.n(a), s: { pill: s, tone: t } })) },
        ],
      ],
    };
  });

  // ── 8 Income & Cash Flow Plan (budget_plan.csv + variance.csv) ──
  const RECURRING = [['Rent', 40000], ['Admin costs', 65000], ['Marketing costs', 80000], ['Salaries and wages', 1200000], ['Travelling', 500000], ['Operating costs', 600000], ['Office costs', 400000], ['Training costs', 200000], ['Vehicle maintenance', 300000]];
  const CAPEX = [['Vehicles', 5400000], ['Buildings', 4200000], ['Development projects', 4500000]];
  register(K(8), () => {
    const inc = sum(INCOME.map(i => i[1])), rec = sum(RECURRING.map(i => i[1])), cap = sum(CAPEX.map(i => i[1])), exp = rec + cap, net = inc - exp;
    const opening = 28400;
    const bal = PERIOD.map((_, i) => opening + ((net / 12) * (i + 1)));
    return {
      crumbs: [...crumbs, 'Budget plan'],
      kpis: [
        { label: 'Total income plan', value: fmt.n(inc), sub: 'BWP | 3 sources', tone: 'green', pct: 100 },
        { label: 'Government allocation', value: fmt.bwp(INCOME[0][1]), delta: '95%', sub: 'of income', tone: 'blue', pct: 95 },
        { label: 'Total expenditure plan', value: fmt.n(exp), sub: `recurrent ${fmt.bwp(rec)} · capital ${fmt.bwp(cap)}`, tone: 'orange', pct: (exp / inc) * 100 },
        { label: 'Net cash flow', value: fmt.bwp(net), delta: '▲ surplus', sub: '16.7% of income', tone: 'cyan', pct: 16.7 },
        { label: 'Income actual vs plan', value: '+8%', delta: 'BWP 1.89M vs 1.75M', deltaTone: 'green', sub: 'month 1', tone: 'violet' },
      ],
      insight: { finding: `The plan runs a <b>${fmt.bwp(net)}</b> surplus and ends the year with a running balance of <b>${fmt.bwp(bal[11])}</b>. Income came in 8% above plan in month 1, but expenditure ran 8% over on every line, so the surplus is unchanged. Donor funding (BWP 0.8M) is the only income not yet backed by a signed agreement.`, recommendation: 'Place BWP 2.5M of the projected balance in a 91-day Treasury bill and confirm the donor agreement before Q3.', severity: 'Low', tone: 'green' },
      grid: [
        [
          { span: 8, type: 'bar', title: 'Monthly income vs expenditure with running balance (BWP K)', height: 280, categories: PERIOD, rotate: 0, y2: 'K', gridOpt: { top: 44 },
            series: [{ name: 'Income', data: PERIOD.map(() => Math.round(inc / 12 / 1000)), color: 'green' }, { name: 'Recurrent', data: PERIOD.map(() => Math.round(rec / 12 / 1000)), stack: 'e', color: 'amber' }, { name: 'Capital', data: PERIOD.map(() => Math.round(cap / 12 / 1000)), stack: 'e', color: 'orange' }, { name: 'Running balance', type: 'line', axis: 1, data: bal.map(v => Math.round(v / 1000)), color: 'cyan' }] },
          { span: 4, type: 'donut', title: 'Income sources', height: 280, center: 'BWP 21.0M', valueFmt: fmt.bwp, items: INCOME.map(([name, value], i) => ({ name, value, color: ['blue', 'violet', 'teal'][i] })) },
        ],
        [
          { span: 6, type: 'waterfall', title: 'Annual cash bridge (BWP M)', height: 280, upTone: 'green', downTone: 'red', min: 0,
            steps: [{ name: 'Opening', value: 0.03, total: true }, { name: 'Gov. alloc.', value: 20 }, { name: 'Donors', value: 0.8 }, { name: 'Subs', value: 0.2 }, { name: 'Recurrent', value: -rec / M }, { name: 'Vehicles', value: -5.4 }, { name: 'Buildings', value: -4.2 }, { name: 'Dev. proj.', value: -4.5 }, { name: 'Closing', value: +(bal[11] / M).toFixed(2), total: true }] },
          { span: 6, type: 'table', title: 'Variance sheet | month 1 budget vs actual (BWP)', height: 280,
            columns: [{ key: 'l', label: 'Line' }, { key: 'a', label: 'Annual', align: 'right' }, { key: 'b', label: 'Budgeted', align: 'right' }, { key: 'x', label: 'Actual', align: 'right' }, { key: 'v', label: 'Variance', align: 'right' }, { key: 'ly', label: 'Last year', align: 'right' }],
            rows: [...INCOME.map(i => [...i, 'in']), ...RECURRING.map(i => [...i, 'out']), ...CAPEX.map(i => [...i, 'out'])].map(([l, a, kind]) => { const b = a / 12, x = b * 1.08; return { l: kind === 'in' ? { strong: l } : l, a: fmt.n(a), b: fmt.n(b), x: fmt.n(x), v: { trend: 'up', text: '8%', tone: kind === 'in' ? 'green' : 'red' }, ly: fmt.n(x * 0.92) }; }) },
        ],
      ],
    };
  });

  // ── 9 Revisions & Virements ──
  const VIREMENTS = [
    ['VIR-26-001', '14 May', 'Salaries and Wages', 'Maintenance', 420000, 'Generator overhaul, Maun', 'Approved', 'green'],
    ['VIR-26-004', '02 Jun', 'Training & Capacity Building', 'Utilities', 310000, 'Winter electricity tariff', 'Approved', 'green'],
    ['VIR-26-007', '19 Jun', 'ICT Expenditure', 'Capital Projects', 650000, 'Clinic certificate 4', 'Approved', 'green'],
    ['VIR-26-009', '08 Jul', 'Salaries and Wages', 'Transport & Fleet Management', 380000, 'Ambulance fuel', 'Approved', 'green'],
    ['VIR-26-011', '30 Jul', 'Meetings', 'Health & Safety', 24000, 'PPE restock', 'Approved', 'green'],
    ['VIR-26-013', '21 Aug', 'ICT Expenditure', 'Professional Services', 240000, 'EMR data migration', 'Approved', 'green'],
    ['VIR-26-016', '09 Sep', 'Salaries and Wages', 'Capital Projects', 1400000, 'Re-phase to Q4 (Clinic)', 'MoFDP review', 'amber'],
    ['VIR-26-017', '15 Sep', 'Public Relations', 'Emergency & Contingency', 120000, 'Measles outbreak, Ghanzi', 'Pending PS', 'amber'],
    ['VIR-26-018', '18 Sep', 'Office Equipment & Furniture', 'Maintenance', 260000, 'Theatre AC units', 'Pending PS', 'amber'],
    ['VIR-26-019', '22 Sep', 'Research & Development', 'Travel Expenses', 85000, 'Workshop travel', 'Rejected', 'red'],
  ];
  const SHORT = n => n.replace(' & Capacity Building', '').replace(' & Fleet Management', '').replace(' Expenditure', '').replace(' and Wages', '');
  register(K(9), () => {
    const approved = VIREMENTS.filter(v => v[6] === 'Approved');
    const pending = VIREMENTS.filter(v => v[7] === 'amber');
    const supp = 1200000;
    const moved = sum(approved.map(v => v[4]));
    const flows = {};
    approved.forEach(v => { flows[v[2]] = (flows[v[2]] || 0) - v[4]; flows[v[3]] = (flows[v[3]] || 0) + v[4]; });
    return {
      crumbs,
      kpis: [
        { label: 'Original estimate', value: fmt.n(APPROVED), sub: 'BWP | Appropriation Act', tone: 'blue' },
        { label: 'Revised estimate', value: fmt.n(APPROVED + supp), delta: '▲ BWP 1.2M', deltaTone: 'amber', sub: 'supplementary', tone: 'violet' },
        { label: 'Virements approved', value: String(approved.length), delta: fmt.bwp(moved), sub: `${fmt.pct((moved / APPROVED) * 100, 1)} of budget`, tone: 'green', pct: (moved / APPROVED) * 100 * 10 },
        { label: 'Pending decision', value: String(pending.length), delta: fmt.bwp(sum(pending.map(v => v[4]))), deltaTone: 'amber', sub: 'Q3 deadline 15 Oct', tone: 'amber' },
        { label: 'Above BWP 1M delegation', value: '1', delta: 'needs MoFDP', deltaTone: 'red', sub: 'VIR-26-016', tone: 'red' },
      ],
      insight: { finding: 'Salaries and Wages has been the source of <b>three virements</b> (BWP 2.2M) because 42 nursing posts are vacant. VIR-26-016 (BWP 1.4M) exceeds the PS’s BWP 1M delegated limit and needs MoFDP approval before the <b>15 Oct</b> Q3 revision deadline.', recommendation: 'Submit VIR-26-016 with the Q3 revision pack this week, and fill the nursing posts so salary savings stop being the default funding source.', severity: 'Medium', tone: 'amber' },
      grid: [
        [
          { span: 7, type: 'waterfall', title: 'Original to revised estimate (BWP M)', height: 290, min: 50, upTone: 'green', downTone: 'red',
            steps: [{ name: 'Original', value: m1(APPROVED), total: true }, { name: 'Supplementary', value: 1.2 }, ...Object.entries(flows).filter(([, v]) => Math.abs(v) >= 100000).sort((a, b) => a[1] - b[1]).map(([n, v]) => ({ name: n.split(' ')[0].replace(/&$/, ''), value: m1(v) })), { name: 'Revised', value: m1(APPROVED + supp), total: true }], rotate: 30 },
          { span: 5, type: 'sankey', title: 'Approved virement flows | from → to (BWP K)', height: 290,
            nodes: [...new Set(approved.map(v => SHORT(v[2])))].concat([...new Set(approved.map(v => SHORT(v[3]) + ' '))]),
            links: approved.map(v => ({ source: SHORT(v[2]), target: SHORT(v[3]) + ' ', value: v[4] / 1000 })) },
        ],
        [{ span: 12, type: 'table', title: 'Virement register | FY 2026-27', height: 280,
          columns: [{ key: 'ref', label: 'Ref' }, { key: 'd', label: 'Date' }, { key: 'f', label: 'From' }, { key: 't', label: 'To' }, { key: 'a', label: 'Amount (BWP)', align: 'right' }, { key: 'p', label: '% of source' }, { key: 'why', label: 'Reason' }, { key: 's', label: 'Status' }],
          rows: VIREMENTS.map(([ref, d, f, t, a, why, s, tone]) => { const src = CATEGORIES.find(c => c.name === f); const p = (a / src.approved) * 100; return { ref, d, f, t, a: fmt.n(a), p: { bar: p * 5, text: fmt.pct(p, 1), tone: p > 10 ? 'red' : p > 5 ? 'amber' : 'green' }, why, s: { pill: s, tone } }; }) }],
      ],
    };
  });

  // ── 10 Performance Review (mid-year) ──
  register(K(10), () => {
    const exec = DEPTS.map(d => +((d.actual / d.approved) * 100).toFixed(0));
    const outputs = [44, 38, 50, 51, 27];
    const trend = { 'FY 2024-25': [5, 11, 18, 25, 32, 40, 48, 56, 64, 73, 83, 93], 'FY 2025-26': [6, 12, 19, 27, 35, 44, 52, 60, 68, 77, 86, 95] };
    const cy = cum(MONTHS.map((_, i) => (i < MONTH_NOW ? 54 / MONTH_NOW : null))).slice(0, MONTH_NOW).map(v => +v.toFixed(0));
    return {
      crumbs: [...crumbs, 'Mid-year review'],
      kpis: [
        { label: 'Budget executed', value: '54%', delta: '▲ 4 pts', deltaTone: 'amber', sub: 'vs 50% phasing', tone: 'blue', pct: 54 },
        { label: 'Outputs delivered', value: '41%', delta: '▼ 13 pts', deltaTone: 'red', sub: 'behind spend', tone: 'red', pct: 41 },
        { label: 'Departments on track', value: '2 of 5', sub: 'Dept C, Dept D', tone: 'amber', pct: 40 },
        { label: 'Projected absorption', value: '94%', sub: 'BWP 51.3M outturn', tone: 'cyan', pct: 94 },
        { label: 'Review actions open', value: '11', delta: '4 overdue', deltaTone: 'red', sub: 'from Q1 review', tone: 'violet' },
      ],
      insight: { finding: 'Dept E (Health Infrastructure) has spent <b>' + exec[4] + '%</b> of its budget but delivered only <b>27%</b> of planned outputs: the clinic and Maun hospital wing are behind their physical milestones while certificates are paid on schedule.', recommendation: 'Link Q3 capital warrants to certified physical progress and schedule a site review for the two projects.', severity: 'High', tone: 'orange' },
      grid: [
        [
          { span: 7, type: 'bar', title: 'Budget executed vs outputs delivered by department (%)', height: 280, categories: DEPTS.map(d => d.code), gridOpt: { right: 76 },
            series: [{ name: 'Budget executed %', data: exec, color: 'blue', label: true }, { name: 'Outputs delivered %', data: outputs.map(v => ({ value: v, itemStyle: { color: v < 35 ? '#EF4444' : v < 45 ? '#F59E0B' : '#10B981' } })), label: true, markLine: { value: 50, label: 'Mid-year 50%', tone: 'cyan' } }] },
          { span: 5, type: 'line', title: 'Cumulative execution % | three budget years', height: 280, categories: MONTHS,
            series: [{ name: 'FY 2024-25', data: trend['FY 2024-25'], color: '#475569', dashed: true, symbol: 'none' }, { name: 'FY 2025-26', data: trend['FY 2025-26'], color: 'violet', dashed: true, symbol: 'none' }, { name: 'FY 2026-27', data: cy, color: 'cyan', area: true }] },
        ],
        [
          { span: 8, type: 'table', title: 'Mid-year department scorecard', height: 250,
            columns: [{ key: 'd', label: 'Department' }, { key: 'b', label: 'Approved', align: 'right' }, { key: 'e', label: 'Executed' }, { key: 'o', label: 'Outputs' }, { key: 'k', label: 'Key output' }, { key: 'r', label: 'Rating' }],
            rows: DEPTS.map((d, i) => { const g = exec[i] - outputs[i]; return { d: { strong: d.label }, b: fmt.n(d.approved), e: { bar: exec[i], tone: 'blue' }, o: { bar: outputs[i], tone: 'cyan' }, k: ['OPD visits 612K of 1.3M', 'Immunisation 81% coverage', 'Surgeries 5,240 of 11,000', 'EMR in 38% of hospitals', '0 of 4 facilities complete'][i], r: g > 20 ? { pill: 'Red', tone: 'red' } : g > 10 ? { pill: 'Amber', tone: 'amber' } : { pill: 'Green', tone: 'green' } }; }) },
          { span: 4, type: 'list', title: 'Review decisions', height: 250, items: [
            { title: 'Tie Q3 capital warrants to certified progress', meta: 'Dept E · Director Projects', pill: 'Open', tone: 'amber' },
            { title: 'Recruit 42 nurses to cut overtime', meta: 'Dept A · Director HR', pill: 'Overdue', tone: 'red' },
            { title: 'Re-phase ICT licences to Q4', meta: 'Dept D · Director ICT', pill: 'Done', tone: 'green' },
            { title: 'Clear theatre backlog with 2 extra lists / week', meta: 'Dept C · Chief Medical Officer', pill: 'Open', tone: 'amber' },
            { title: 'Measles catch-up campaign in Ghanzi', meta: 'Dept B · Director Public Health', pill: 'Open', tone: 'amber' },
          ] },
        ],
      ],
    };
  });

  // ── 11 Controls & Anomalies ──
  const RULES = ['Commitment > available balance', 'Virement above delegation', 'Price above catalogue high', 'Duplicate line across cells', 'Line without justification', 'Spend before warrant', 'Front-loaded phasing'];
  register(K(11), () => {
    const r = rng('ctrl');
    const values = [];
    RULES.forEach((_, y) => DEPTS.forEach((d, x) => values.push([x, y, r.int(0, 5)])));
    values[0 * 5 + 4][2] = 11; values[4 * 5 + 3][2] = 9; values[2 * 5 + 1][2] = 7; values[3 * 5 + 2][2] = 6; values[5 * 5 + 4][2] = 8;
    const byRule = RULES.map((_, y) => sum(values.filter(v => v[1] === y).map(v => v[2])));
    const total = sum(byRule);
    return {
      crumbs,
      kpis: [
        { label: 'Automated controls', value: '18', sub: 'budget check rules', tone: 'blue' },
        { label: 'Open exceptions', value: String(total), delta: '▲ 9 this month', deltaTone: 'red', sub: '', tone: 'red' },
        { label: 'Transactions blocked', value: '46', delta: 'BWP 3.1M', deltaTone: 'amber', sub: 'failed budget check', tone: 'orange' },
        { label: 'Override requests', value: '7', delta: '2 approved', sub: 'PS sign-off needed', tone: 'violet' },
        { label: 'Control pass rate', value: '97.8%', delta: '▼ 0.6 pts', deltaTone: 'amber', sub: '2,084 checks', tone: 'green', pct: 97.8 },
      ],
      insight: { finding: 'Dept E has <b>11 commitments</b> raised above the available balance on Capital Projects and <b>8 payments</b> made before the Q2 warrant top-up was released. Both patterns point to contractor certificates being processed ahead of budget cover.', recommendation: 'Hard-block commitments above available balance for Capital Projects and refer the eight pre-warrant payments to Internal Audit.', severity: 'Critical', tone: 'red', actions: ['Explain finding', 'Refer to audit', 'Tighten control'] },
      grid: [
        [
          { span: 7, type: 'heatmap', title: 'Open exceptions | control rule × department', height: 300, x: DEPTS.map(d => d.code), y: RULES, values, min: 0, max: 12, valueFmt: v => `${v} exceptions`, colors: ['#0f2a4d', '#1D4ED8', '#F59E0B', '#EF4444'] },
          { span: 5, type: 'bar', title: 'Exceptions raised per month by severity', height: 300, categories: MONTHS.slice(0, MONTH_NOW),
            series: [{ name: 'Critical', stack: 's', data: [1, 1, 2, 2, 3, 5], color: 'red' }, { name: 'High', stack: 's', data: [3, 4, 3, 5, 6, 8], color: 'orange' }, { name: 'Medium', stack: 's', data: [6, 5, 7, 6, 8, 9], color: 'amber' }, { name: 'Low', stack: 's', data: [4, 6, 5, 4, 5, 6], color: 'slate' }] },
        ],
        [{ span: 12, type: 'table', title: 'Exception queue', height: 270,
          columns: [{ key: 'id', label: 'Exception' }, { key: 'rule', label: 'Control rule' }, { key: 'ctx', label: 'Transaction / line' }, { key: 'amt', label: 'Amount (BWP)', align: 'right' }, { key: 'd', label: 'Department' }, { key: 'sev', label: 'Severity' }, { key: 'own', label: 'Assigned to' }],
          rows: [
            [0, 'CM-26-88412 · Maun hospital wing certificate 7', 1840000, 4, 'Critical', 'red'], [5, 'PV-26-45120 · paid 10 Sep, warrant 12 Sep', 612000, 4, 'Critical', 'red'],
            [1, 'VIR-26-016 · above BWP 1M PS delegation', 1400000, 0, 'High', 'orange'], [3, 'Diesel (litres) captured by 2 cells', 102960, 1, 'High', 'orange'],
            [2, 'Disinfectant 5L at BWP 140 vs 96', 18480, 4, 'Medium', 'amber'], [4, 'Security guarding, 14 sites', 1542000, 3, 'Medium', 'amber'],
            [6, 'Training: 42% phased in Q1', 882000, 3, 'Low', 'blue'], [0, 'CM-26-88530 · ICT licences renewal', 386000, 3, 'High', 'orange'],
          ].map(([rule, ctx, amt, d, sev, t], i) => ({ id: `EXC-26-${String(311 + i * 7)}`, rule: { strong: RULES[rule] }, ctx, amt: fmt.n(amt), d: DEPTS[d].label, sev: { pill: sev, tone: t }, own: OFFICERS[[8, 1, 3, 5, 2, 4, 3, 9][i]] })) }],
      ],
    };
  });
})();
