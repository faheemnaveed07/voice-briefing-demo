/* Menu 11: Workforce & Payroll (menu index 10, all 12 tabs).
 * Anchors: home tile HR 12,480 headcount; payroll vs budget 98%; Ministry of Health Salaries and Wages
 * approved BWP 14.2M / actual 8.1M; nurse overtime ▲38% vs last year linked to 42 vacant nursing posts. */
(function () {
  const { register, fmt, rng, C } = DASH;
  const { MONTHS, MONTH_NOW, TOWNS, SUPPLIERS, OFFICERS } = DASH.data;
  const K = n => `10-${n}`;
  const crumbs = ['All Ministries'];
  const moh = ['All Ministries', 'Ministry of Health'];
  const sum = arr => arr.reduce((a, b) => a + b, 0);
  const cum = arr => arr.reduce((acc, v, i) => (acc.push(+((acc[i - 1] || 0) + v).toFixed(2)), acc), []);
  const H = MONTHS.slice(0, MONTH_NOW);

  // ── ministries: [name, headcount, temporary share, avg annual cost BWP K, female %, avg age, annual turnover %] ──
  const MIN = [
    ['Health', 4120, 0.17, 168, 71, 39, 8.1], ['Education', 3260, 0.12, 162, 64, 42, 5.6], ['Defence', 1240, 0.05, 176, 22, 36, 4.9], ['Transport', 1080, 0.19, 181, 31, 44, 7.2],
    ['Agriculture', 1020, 0.16, 158, 43, 46, 6.4], ['Water', 690, 0.14, 184, 34, 43, 6.9], ['ICT', 550, 0.21, 226, 41, 35, 11.8], ['Energy', 520, 0.13, 205, 29, 41, 7.5],
  ].map(([name, hc, temp, cost, fem, age, turn]) => ({ name, full: `Ministry of ${name}`, hc, temp, cost, fem, age, turn, annual: (hc * cost) / 1000 }));
  const HC = sum(MIN.map(m => m.hc)); // 12,480
  const ANNUAL = sum(MIN.map(m => m.annual)); // BWP M
  const AVG_COST = (ANNUAL / HC) * 1000; // BWP K

  // Monthly payroll (BWP M) and components
  const PAY = [176.2, 178.4, 180.1, 183.3, 181.0, 185.6];
  const YTD = sum(PAY);
  const BUDGET_ANNUAL = 2212; // personal emoluments, BWP M
  const PHASED = (BUDGET_ANNUAL / 12) * MONTH_NOW;
  const COMP = [['Basic salary', 0.70, 'blue'], ['Allowances', 0.16, 'cyan'], ['Overtime', 0.06, 'amber'], ['Pension & medical', 0.08, 'violet']];

  // Headcount movement
  const HCM = [12266, 12301, 12358, 12392, 12441, 12480];
  const JOIN = [96, 118, 142, 121, 139, 128], LEAVE = [81, 83, 85, 87, 90, 89];

  // Ministry of Health, Salaries and Wages (BWP M): [line, approved, actual]
  const SW = [['Permanent staff salaries', 8.1, 4.4], ['Nursing overtime', 2.4, 1.9], ['Gratuity & pension', 1.9, 0.8], ['Temporary & casual staff', 1.0, 0.6], ['Acting allowances', 0.8, 0.4]];
  const SW_M = [1.26, 1.31, 1.33, 1.38, 1.40, 1.42]; // = 8.1

  // Hospitals carrying the 42 vacant nursing posts
  const HOSP = [
    ['Princess Marina Hospital', 'Gaborone', 9, 5120], ['Nyangabgwe Referral Hospital', 'Francistown', 8, 4610], ['Letsholathebe II Hospital', 'Maun', 6, 3380], ['Sekgoma Memorial Hospital', 'Serowe', 5, 2740],
    ['Mahalapye District Hospital', 'Mahalapye', 4, 2150], ['Kasane Primary Hospital', 'Kasane', 3, 1720], ['Ghanzi Primary Hospital', 'Ghanzi', 3, 1590], ['Scottish Livingstone Hospital', 'Molepolole', 2, 1180],
    ['Athlone Hospital', 'Lobatse', 1, 760], ['Selebi-Phikwe Govt Hospital', 'Selebi-Phikwe', 1, 690],
  ].map(([name, town, vac, ot]) => ({ name, town, vac, ot, lon: TOWNS[town][0], lat: TOWNS[town][1] }));

  // ── 0 Headcount ──
  register(K(0), () => ({
    crumbs,
    kpis: [
      { label: 'Headcount', value: fmt.n(HC), delta: `▲ ${HC - 12251} since Apr`, sub: '8 ministries', tone: 'blue', pct: 100 },
      { label: 'Permanent & pensionable', value: fmt.n(Math.round(sum(MIN.map(m => m.hc * (1 - m.temp))))), delta: '86%', deltaTone: 'slate', sub: 'of headcount', tone: 'violet', pct: 86 },
      { label: 'Temporary & contract', value: fmt.n(Math.round(sum(MIN.map(m => m.hc * m.temp)))), delta: '▲ 3.1% YoY', deltaTone: 'amber', sub: 'ICT highest 21%', tone: 'amber', pct: 14 },
      { label: 'Staff turnover', value: '6.8%', delta: '▲ 0.9 pts', deltaTone: 'red', sub: 'annualised', tone: 'orange', pct: 68 },
      { label: 'Female share', value: '58%', sub: '41% of management', tone: 'cyan', pct: 58 },
    ],
    insight: { finding: 'Headcount rose by <b>229</b> since April, but more than half of new joiners were temporary staff. Health employs 33% of the workforce and ICT has the highest turnover at <b>11.8%</b>, mainly systems engineers leaving for the private sector.', recommendation: 'Convert long-serving temporary nurses to permanent posts and review the ICT scarce-skills allowance.', severity: 'Medium', tone: 'amber' },
    grid: [
      [
        { span: 7, type: 'bar', title: 'Headcount by ministry | permanent vs temporary', height: 280, categories: MIN.map(m => m.name),
          series: [{ name: 'Permanent', data: MIN.map(m => Math.round(m.hc * (1 - m.temp))), stack: 'h', color: 'blue' }, { name: 'Temporary & contract', data: MIN.map(m => Math.round(m.hc * m.temp)), stack: 'h', color: 'cyan' }] },
        { span: 5, type: 'donut', title: 'Headcount by grade band', height: 280, center: fmt.n(HC), items: [['A | support', 2140], ['B | technical', 3960], ['C | professional', 4020], ['D | management', 1860], ['E–F | senior', 420], ['Specialists', 80]].map(([name, value]) => ({ name, value })) },
      ],
      [
        { span: 6, type: 'bar', title: 'Joiners and leavers by month | closing headcount', height: 250, categories: H, y2: ' ',
          series: [{ name: 'Joiners', data: JOIN, color: 'green' }, { name: 'Leavers', data: LEAVE, color: 'red' }, { name: 'Headcount', type: 'line', axis: 1, data: HCM, color: 'amber' }] },
        { span: 6, type: 'table', title: 'Workforce profile by ministry', height: 250,
          columns: [{ key: 'n', label: 'Ministry' }, { key: 'h', label: 'Headcount', align: 'right' }, { key: 'f', label: 'Female', align: 'right' }, { key: 'a', label: 'Avg age', align: 'right' }, { key: 't', label: 'Turnover' }],
          rows: MIN.map(m => ({ n: m.name, h: fmt.n(m.hc), f: m.fem + '%', a: m.age, t: { bar: m.turn * 6, text: m.turn.toFixed(1) + '%', tone: m.turn > 8 ? 'red' : m.turn > 7 ? 'amber' : 'green' } })) },
      ],
    ],
  }));

  // ── 1 Payroll Expenditure ──
  register(K(1), () => ({
    crumbs,
    kpis: [
      { label: 'Payroll YTD', value: fmt.bwp(YTD * 1e6), delta: 'Apr–Sep', deltaTone: 'slate', sub: 'gross, all ministries', tone: 'blue' },
      { label: 'September payroll', value: fmt.bwp(PAY[5] * 1e6), delta: '▲ 2.5% vs Aug', deltaTone: 'amber', sub: 'incl. arrears', tone: 'violet' },
      { label: 'Basic salary share', value: '70%', sub: 'of gross pay', tone: 'cyan', pct: 70 },
      { label: 'Allowances + overtime', value: '22%', delta: '▲ 2 pts YoY', deltaTone: 'red', sub: 'variable pay', tone: 'amber', pct: 22 },
      { label: 'Payees on hold', value: '28', delta: 'BWP 0.4M', sub: 'pending verification', tone: 'red' },
    ],
    insight: { finding: `Payroll reached <b>${fmt.bwp(YTD * 1e6)}</b> for the half-year. Variable pay (allowances and overtime) grew to 22% of gross, up two points year on year, while basic salaries grew only 3.1%.`, recommendation: 'Put overtime and acting allowances under monthly Accounting Officer sign-off.', severity: 'Medium', tone: 'amber' },
    grid: [
      [
        { span: 7, type: 'bar', title: 'Monthly payroll by component (BWP M)', height: 280, categories: H,
          series: COMP.map(([name, share, color]) => ({ name, color, stack: 'p', data: PAY.map((v, i) => +(v * share * (name === 'Overtime' ? 0.9 + i * 0.04 : 1)).toFixed(1)) })) },
        { span: 5, type: 'donut', title: 'Payroll YTD by component', height: 280, center: fmt.bwp(YTD * 1e6), valueFmt: v => `BWP ${v}M`, items: COMP.map(([name, share, color]) => ({ name, value: +(YTD * share).toFixed(1), color })) },
      ],
      [
        { span: 5, type: 'treemap', title: 'Payroll YTD by ministry (BWP M)', height: 260, valueFmt: v => `BWP ${v}M`, items: MIN.map(m => ({ name: m.name, value: +((m.annual / ANNUAL) * YTD).toFixed(1) })) },
        { span: 7, type: 'table', title: 'Payroll register summary | FY 2026-27 to date', height: 260,
          columns: [{ key: 'n', label: 'Ministry' }, { key: 'h', label: 'Payees', align: 'right' }, { key: 'g', label: 'Gross YTD (BWP M)', align: 'right' }, { key: 'p', label: 'Per head / month', align: 'right' }, { key: 'y', label: 'vs last year', align: 'right' }],
          rows: MIN.map((m, i) => { const g = (m.annual / ANNUAL) * YTD; const y = [7.9, 4.2, 5.1, 3.8, 2.9, 4.4, 9.6, 3.3][i]; return { n: m.full, h: fmt.n(m.hc), g: g.toFixed(1), p: fmt.n((g * 1e6) / m.hc / MONTH_NOW), y: { trend: 'up', text: y.toFixed(1) + '%', tone: y > 6 ? 'red' : 'slate' } }; }) },
      ],
    ],
  }));

  // ── 2 Payroll vs Budget ──
  register(K(2), () => {
    const util = [101.6, 97.4, 103.2, 96.1, 95.8, 97.0, 93.4, 96.6];
    return {
      crumbs,
      kpis: [
        { label: 'Payroll vs budget', value: '98%', delta: 'YTD vs phased', deltaTone: 'slate', sub: 'within ±3% band', tone: 'green', pct: 98 },
        { label: 'Personal emoluments budget', value: fmt.bwp(BUDGET_ANNUAL * 1e6), sub: 'FY 2026-27 approved', tone: 'blue', pct: 100 },
        { label: 'Actual YTD', value: fmt.bwp(YTD * 1e6), delta: `${((YTD / BUDGET_ANNUAL) * 100).toFixed(0)}%`, sub: 'of annual', tone: 'violet', pct: (YTD / BUDGET_ANNUAL) * 100 },
        { label: 'MoH Salaries and Wages', value: 'BWP 8.1M', delta: '57%', deltaTone: 'red', sub: 'of BWP 14.2M, phasing 50%', tone: 'orange', pct: 57 },
        { label: 'Ministries over phasing', value: '2 of 8', delta: 'Health, Defence', deltaTone: 'red', sub: 'overtime-driven', tone: 'red' },
      ],
      insight: { finding: 'National payroll is on budget at <b>98%</b> of phasing, but Ministry of Health Salaries and Wages has used <b>57%</b> (BWP 8.1M of 14.2M) at month six. Nursing overtime alone has used 79% of its annual line.', recommendation: 'Vire BWP 0.9M from the gratuity line to overtime for Q3 and fill the 42 vacant nursing posts to stop the overrun.', severity: 'High', tone: 'orange' },
      grid: [
        [
          { span: 8, type: 'bar', title: 'Payroll YTD vs phased budget by ministry (BWP M)', height: 280, categories: MIN.map(m => m.name), y2: ' ',
            series: [{ name: 'Phased budget', data: MIN.map((m, i) => +(((m.annual / ANNUAL) * YTD) / (util[i] / 100)).toFixed(1)), color: '#1E3A5F' }, { name: 'Actual', data: MIN.map(m => +((m.annual / ANNUAL) * YTD).toFixed(1)), color: 'blue' }, { name: '% of phasing', type: 'line', axis: 1, smooth: false, data: util, color: 'amber' }] },
          { span: 4, type: 'gauge', title: 'Payroll vs budget', height: 280, gauges: [{ name: 'National YTD', value: 98, good: 101, warn: 95, tone: 'green' }, { name: 'MoH S&W annual', value: 57, tone: 'orange' }] },
        ],
        [
          { span: 6, type: 'line', title: 'Ministry of Health | Salaries and Wages cumulative (BWP M)', height: 250, categories: MONTHS,
            series: [{ name: 'Budget (flat phasing)', data: cum(MONTHS.map(() => 14.2 / 12)), color: '#475569', dashed: true, symbol: 'none' }, { name: 'Actual', data: cum(SW_M), color: 'orange', area: true }] },
          { span: 6, type: 'table', title: 'Ministry of Health | Salaries and Wages lines', height: 250,
            columns: [{ key: 'l', label: 'Line' }, { key: 'a', label: 'Approved (M)', align: 'right' }, { key: 's', label: 'Actual (M)', align: 'right' }, { key: 'u', label: 'Used vs 50% phasing' }],
            rows: [...SW, ['Total Salaries and Wages', 14.2, 8.1]].map(([l, a, s], i) => { const u = (s / a) * 100; return { l: i === SW.length ? { strong: l } : l, a: a.toFixed(1), s: s.toFixed(1), u: { bar: u, tone: u > 60 ? 'red' : u < 45 ? 'amber' : 'blue' } }; }) },
        ],
      ],
    };
  });

  // ── 3 Overtime ──
  register(K(3), () => {
    const ly = [218, 224, 231, 236, 229, 241];
    const ty = ly.map((v, i) => Math.round(v * (1.24 + i * 0.028)));
    const r = rng('ot');
    return {
      crumbs: moh,
      kpis: [
        { label: 'Overtime YTD (national)', value: fmt.bwp(YTD * 0.06 * 1e6), delta: '▲ 21% vs LY', deltaTone: 'red', sub: '6% of payroll', tone: 'amber' },
        { label: 'Nurse overtime', value: 'BWP 1.9M', delta: '▲ 38% vs LY', deltaTone: 'red', sub: 'Ministry of Health', tone: 'red' },
        { label: 'Vacant nursing posts', value: '42', delta: '10 hospitals', deltaTone: 'amber', sub: 'funded, unfilled', tone: 'orange' },
        { label: 'Nurses above 20h cap', value: '612', delta: '▲ 140 vs Q1', deltaTone: 'red', sub: 'hours per month', tone: 'violet' },
        { label: 'Overtime as % of basic', value: '8.6%', sub: 'policy ceiling 5%', tone: 'amber', pct: 86 },
      ],
      insight: { finding: 'Nurse overtime has grown <b>38%</b> year on year and is now the second-largest cost driver in the Ministry of Health. The rise tracks the <b>42 vacant nursing posts</b>: hospitals with more vacancies pay far more overtime per nurse.', recommendation: 'Accelerate recruitment for the 42 posts; cap overtime at 20 hours per nurse per month.', severity: 'Medium', tone: 'amber', actions: ['Explain finding', 'Open vacancies', 'Create task'] },
      grid: [
        [
          { span: 7, type: 'line', title: 'Nurse overtime by month | this year vs last year (BWP K)', height: 270, categories: H,
            series: [{ name: 'FY 2025-26', data: ly, color: '#64748B', dashed: true }, { name: 'FY 2026-27', data: ty, color: 'red', area: true }] },
          { span: 5, type: 'bar', title: 'Overtime YTD by cadre (BWP M, national)', height: 270, horizontal: true, labelMax: 22, gridOpt: { right: 30 }, categories: ['Nurses & midwives', 'Police & defence', 'Doctors', 'Drivers', 'Security officers', 'Lab technologists', 'Teachers (exam duty)'],
            series: [{ name: 'Overtime', label: true, data: [21.4, 14.8, 9.6, 7.1, 5.2, 3.9, 3.1].map((v, i) => ({ value: v, itemStyle: { color: i === 0 ? C.red : C.amber } })) }] },
        ],
        [
          { span: 6, type: 'scatter', title: 'Hospitals | vacant nursing posts vs overtime hours per nurse', height: 260, xName: 'Vacant nursing posts', yName: 'OT h / nurse', xMin: 0, xMax: 11, yMin: 0, yMax: 40, labels: true,
            points: HOSP.map((h, i) => { const y = [36, 33, 27, 22, 16, 20, 13, 12, 9, 5][i]; return { name: h.town, x: h.vac, y, size: 10 + h.ot / 400, tone: y > 30 ? 'red' : y > 20 ? 'amber' : 'green' }; }) },
          { span: 6, type: 'table', title: 'Overtime by hospital | September', height: 260,
            columns: [{ key: 'n', label: 'Hospital' }, { key: 'v', label: 'Vacancies', align: 'right' }, { key: 'h', label: 'OT hours', align: 'right' }, { key: 'c', label: 'Cost (BWP)', align: 'right' }, { key: 's', label: 'Status' }],
            rows: HOSP.map(h => ({ n: h.name, v: h.vac, h: fmt.n(h.ot), c: fmt.n(h.ot * 62), s: h.vac >= 5 ? { pill: 'Above cap', tone: 'red' } : h.vac >= 3 ? { pill: 'Watch', tone: 'amber' } : { pill: 'Normal', tone: 'green' } })) },
        ],
      ],
    };
  });

  // ── 4 Allowances ──
  const ALW = [['Housing', 58.8], ['Commuted travel', 24.1], ['Scarce skills', 21.6], ['Remote area / hardship', 17.3], ['Acting', 12.4], ['On-call', 9.7], ['Uniform', 8.2], ['Night duty', 7.9], ['Entertainment', 6.1], ['Other (5 types)', 6.9]];
  register(K(4), () => {
    const r = rng('alw');
    return {
      crumbs,
      kpis: [
        { label: 'Allowances YTD', value: `BWP ${fmt.n(sum(ALW.map(a => a[1])), 1)}M`, delta: '▲ 9.4% vs LY', deltaTone: 'red', sub: '16% of payroll', tone: 'cyan' },
        { label: 'Allowance types', value: '14', sub: 'per DPSM circulars', tone: 'blue' },
        { label: 'Housing share', value: '34%', sub: 'largest allowance', tone: 'violet', pct: 34 },
        { label: 'Acting > 6 months', value: '37 officers', delta: 'BWP 1.1M', deltaTone: 'red', sub: 'breach of 6-month rule', tone: 'orange' },
        { label: 'Paid without entitlement', value: '22', delta: 'BWP 0.9M', deltaTone: 'red', sub: 'no valid approval on file', tone: 'red' },
      ],
      insight: { finding: '<b>37 officers</b> have received acting allowance for more than six months, and 22 allowances are being paid with no valid approval on file. Remote-area allowance is still paid to 14 officers who transferred to Gaborone.', recommendation: 'Stop the 14 remote-area payments this payroll run and have DPSM confirm or end each acting appointment.', severity: 'High', tone: 'orange' },
      grid: [
        [
          { span: 6, type: 'bar', title: 'Allowances YTD by type (BWP M)', height: 290, horizontal: true, labelMax: 24, gridOpt: { right: 30 }, categories: ALW.map(a => a[0]),
            series: [{ name: 'YTD', label: true, data: ALW.map(a => ({ value: a[1], itemStyle: { color: ['Acting', 'Remote area / hardship'].includes(a[0]) ? C.orange : a[0] === 'Housing' ? C.blue : C.cyan } })) }] },
          { span: 6, type: 'bar', title: 'Allowances by ministry and type (BWP M)', height: 290, categories: MIN.map(m => m.name),
            series: [['Housing', 0.34, 'blue'], ['Scarce skills', 0.125, 'violet'], ['Travel & remote area', 0.24, 'cyan'], ['Acting & other', 0.295, 'amber']].map(([name, s, color]) => ({ name, color, stack: 'a', data: MIN.map(m => +((m.annual / ANNUAL) * 173 * s * (name === 'Scarce skills' && ['Health', 'ICT'].includes(m.name) ? 1.8 : 1) * r.num(0.85, 1.15)).toFixed(1)) })) },
        ],
        [
          { span: 5, type: 'line', title: 'Monthly allowances vs budget (BWP M)', height: 250, categories: H,
            series: [{ name: 'Budget', data: H.map(() => 27.4), color: '#475569', dashed: true, symbol: 'none' }, { name: 'Actual', data: [27.1, 28.0, 28.6, 29.2, 29.6, 30.5], color: 'cyan', area: true }] },
          { span: 7, type: 'table', title: 'Allowance exceptions', height: 250,
            columns: [{ key: 'e', label: 'Employee' }, { key: 'm', label: 'Ministry' }, { key: 'a', label: 'Allowance' }, { key: 'x', label: 'Exception' }, { key: 'v', label: 'Monthly', align: 'right' }],
            rows: [['Health', 'Acting', 'Acting 14 months', 'red'], ['Health', 'Remote area', 'Transferred to Gaborone', 'red'], ['Education', 'Housing', 'Also in govt house', 'red'], ['Transport', 'Acting', 'Acting 9 months', 'orange'], ['Agriculture', 'Remote area', 'Transferred to Gaborone', 'red'], ['ICT', 'Scarce skills', 'Post not on scarce list', 'orange'], ['Defence', 'Uniform', 'Paid twice in September', 'amber'], ['Water', 'Acting', 'Acting 7 months', 'amber']]
              .map(([m, a, x, t]) => ({ e: `EMP-${r.int(10000, 99999)}`, m, a, x: { pill: x, tone: t }, v: fmt.n(r.int(8, 46) * 100) })) },
        ],
      ],
    };
  });

  // ── 5 Attendance & Absenteeism ──
  register(K(5), () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const r = rng('abs');
    const values = [];
    days.forEach((d, x) => MIN.forEach((m, y) => values.push([x, y, +(r.num(2.6, 4.8) + (x === 0 ? 2.1 : x === 4 ? 2.6 : 0) + (m.name === 'Health' ? 0.9 : 0)).toFixed(1)])));
    return {
      crumbs,
      kpis: [
        { label: 'Absenteeism rate', value: '4.6%', delta: '▲ 0.5 pts', deltaTone: 'red', sub: 'target 3%', tone: 'red', pct: 46 },
        { label: 'Working days lost YTD', value: '71,400', sub: '≈ 5.7 days per employee', tone: 'orange' },
        { label: 'Unplanned absence', value: '58%', sub: 'sick + unauthorised', tone: 'amber', pct: 58 },
        { label: 'Monday / Friday share', value: '47%', delta: 'expected 40%', deltaTone: 'amber', sub: 'of sick days', tone: 'violet', pct: 47 },
        { label: 'Clock-in compliance', value: '88%', delta: '▲ 4 pts', sub: 'biometric sites', tone: 'green', pct: 88 },
      ],
      insight: { finding: 'Sick absence spikes on <b>Mondays and Fridays</b> (47% of sick days against an expected 40%), most strongly in Health and Education. 186 employees have more than ten uncertified sick days this year.', recommendation: 'Require a medical certificate for any Monday or Friday sick day and start return-to-work interviews for the 186 cases.', severity: 'Medium', tone: 'amber' },
      grid: [
        [
          { span: 7, type: 'heatmap', title: 'Absence rate % | ministry × weekday', height: 290, x: days, y: MIN.map(m => m.name), values, min: 2, max: 9, cellFmt: v => v + '%', valueFmt: v => v + '%' },
          { span: 5, type: 'line', title: 'Absenteeism rate by month (%)', height: 290, categories: H, gridOpt: { right: 40 },
            series: [{ name: 'All ministries', data: [4.1, 4.0, 4.4, 4.9, 4.7, 4.6], color: 'red', area: true, markLine: { value: 3, label: '3%', tone: 'green' } }, { name: 'Health', data: [4.9, 4.8, 5.3, 6.1, 5.6, 5.5], color: 'amber' }, { name: 'Education', data: [4.2, 4.0, 3.6, 5.2, 4.8, 4.7], color: 'cyan' }] },
        ],
        [
          { span: 5, type: 'bar', title: 'Days lost YTD by reason', height: 250, horizontal: true, labelMax: 24, gridOpt: { right: 40 }, categories: ['Sick, certified', 'Sick, uncertified', 'Unauthorised absence', 'Family responsibility', 'Late arrival (days equiv.)', 'Industrial action'],
            series: [{ name: 'Days', label: true, labelFmt: p => fmt.n(p.value), data: [24100, 17300, 12200, 9400, 6100, 2300].map((v, i) => ({ value: v, itemStyle: { color: [C.blue, C.amber, C.red, C.cyan, C.violet, C.dim][i] } })) }] },
          { span: 7, type: 'table', title: 'Repeat absence cases | highest days lost', height: 250,
            columns: [{ key: 'e', label: 'Employee' }, { key: 'm', label: 'Ministry' }, { key: 'd', label: 'Days lost', align: 'right' }, { key: 'u', label: 'Uncertified', align: 'right' }, { key: 'p', label: 'Pattern' }, { key: 's', label: 'Action' }],
            rows: Array.from({ length: 8 }, (_, i) => { const d = 34 - i * 2 - r.int(0, 1); return { e: `EMP-${r.int(10000, 99999)}`, m: r.pick(['Health', 'Health', 'Education', 'Transport', 'Agriculture']), d, u: r.int(8, 16), p: r.pick(['Mon / Fri', 'After payday', 'Mon / Fri', 'Long weekends']), s: i < 3 ? { pill: 'Disciplinary', tone: 'red' } : { pill: 'RTW interview', tone: 'amber' } }; }) },
        ],
      ],
    };
  });

  // ── 6 Leave ──
  register(K(6), () => ({
    crumbs,
    kpis: [
      { label: 'Leave liability', value: 'BWP 96.4M', delta: '▲ 6.2M since Apr', deltaTone: 'red', sub: 'accrued, untaken', tone: 'red' },
      { label: 'Average balance', value: '38 days', sub: 'per employee', tone: 'blue' },
      { label: 'Balances over 60 days', value: '1,140', delta: '9% of staff', deltaTone: 'amber', sub: 'above forfeiture cap', tone: 'orange', pct: 9 },
      { label: 'Leave days taken YTD', value: '118,600', sub: 'all types', tone: 'cyan' },
      { label: 'Requests pending > 5 days', value: '214', delta: 'Health 131', deltaTone: 'amber', sub: 'awaiting approval', tone: 'amber' },
    ],
    insight: { finding: 'Accrued leave liability has risen to <b>BWP 96.4M</b>; 1,140 staff hold more than 60 days, most of them nurses and police officers who cannot be released because of vacancies. The liability becomes a cash cost when they retire or resign.', recommendation: 'Agree a leave-reduction plan for the 1,140 staff and budget BWP 4M for leave encashment in the 2027-28 estimates.', severity: 'Medium', tone: 'amber' },
    grid: [
      [
        { span: 4, type: 'donut', title: 'Leave taken YTD by type (days)', height: 270, items: [['Annual', 71200], ['Sick', 24100], ['Maternity', 11800], ['Study', 5200], ['Compassionate', 3900], ['Other', 2400]].map(([name, value]) => ({ name, value })) },
        { span: 4, type: 'bar', title: 'Staff by leave balance (days)', height: 270, categories: ['0–10', '11–20', '21–40', '41–60', '61–90', '90+'],
          series: [{ name: 'Employees', label: true, labelFmt: p => fmt.n(p.value), data: [2310, 3120, 3940, 1970, 860, 280].map((v, i) => ({ value: v, itemStyle: { color: i < 3 ? C.blue : i === 3 ? C.amber : C.red } })) }] },
        { span: 4, type: 'bar', title: 'Leave liability by ministry (BWP M)', height: 270, horizontal: true, gridOpt: { right: 30 }, categories: MIN.map(m => m.name),
          series: [{ name: 'Liability', label: true, data: MIN.map((m, i) => +((96.4 * m.annual) / ANNUAL * [1.18, 0.96, 1.12, 0.9, 0.84, 0.9, 0.7, 0.86][i]).toFixed(1)), color: 'violet' }] },
      ],
      [
        { span: 5, type: 'area', title: 'Annual leave days taken vs plan', height: 240, categories: H,
          series: [{ name: 'Leave plan', data: [11800, 11200, 12600, 14100, 12400, 11900], color: '#475569' }, { name: 'Taken', data: [10200, 9400, 11800, 15300, 12900, 11600], color: 'cyan' }] },
        { span: 7, type: 'table', title: 'Largest untaken balances by cadre', height: 240,
          columns: [{ key: 'c', label: 'Cadre' }, { key: 'm', label: 'Ministry' }, { key: 'n', label: 'Staff > 60 days', align: 'right' }, { key: 'd', label: 'Avg balance', align: 'right' }, { key: 'l', label: 'Liability (BWP M)', align: 'right' }, { key: 's', label: 'Cause' }],
          rows: [['Registered nurses', 'Health', 312, 84, 14.2, 'Vacancies'], ['Police officers', 'Defence', 204, 79, 9.1, 'Operations'], ['Medical officers', 'Health', 96, 91, 7.8, 'Vacancies'], ['Senior teachers', 'Education', 158, 66, 6.4, 'Calendar'], ['Engineers', 'Transport', 71, 72, 4.1, 'Projects'], ['Systems engineers', 'ICT', 48, 68, 3.3, 'Vacancies']]
            .map(([c, m, n, d, l, s]) => ({ c, m, n, d: d + ' d', l: l.toFixed(1), s: { pill: s, tone: s === 'Vacancies' ? 'red' : 'amber' } })) },
      ],
    ],
  }));

  // ── 7 Vacancies & Recruitment ──
  register(K(7), () => ({
    crumbs,
    kpis: [
      { label: 'Funded vacancies', value: '684', delta: '▲ 38 since Apr', deltaTone: 'red', sub: 'approved establishment', tone: 'orange' },
      { label: 'Vacancy rate', value: fmt.pct((684 / (HC + 684)) * 100, 1), sub: 'of 13,164 posts', tone: 'amber', pct: (684 / (HC + 684)) * 100 * 5 },
      { label: 'Vacant nursing posts', value: '42', delta: '10 hospitals', deltaTone: 'red', sub: 'Ministry of Health', tone: 'red' },
      { label: 'Time to hire', value: '96 days', delta: 'target 60', deltaTone: 'red', sub: 'advert to assumption', tone: 'violet' },
      { label: 'Offer acceptance', value: '81%', sub: 'last 90 days', tone: 'green', pct: 81 },
    ],
    insight: { finding: 'Hiring takes <b>96 days</b> on average against a 60-day target, and 41 days of that is waiting for DPSM approval to advertise. The 42 nursing vacancies have been open for an average of 128 days.', recommendation: 'Give the Ministry of Health delegated authority to advertise nursing posts and run one national nursing intake in November.', severity: 'High', tone: 'orange' },
    grid: [
      [
        { span: 4, type: 'funnel', title: 'Recruitment pipeline | YTD', height: 270, items: [['Applications', 18640], ['Shortlisted', 2410], ['Interviewed', 1180], ['Offers', 522], ['Assumed duty', 423]].map(([name, value]) => ({ name, value })) },
        { span: 8, type: 'bar', title: 'Funded vacancies by ministry and cadre', height: 270, categories: MIN.map(m => m.name),
          series: [['Professional', [96, 58, 12, 34, 22, 18, 26, 14], 'blue'], ['Technical', [61, 30, 38, 29, 27, 16, 21, 12], 'cyan'], ['Nursing & allied', [74, 0, 6, 0, 0, 0, 0, 0], 'red'], ['Support', [29, 18, 16, 9, 11, 3, 2, 2], '#475569']].map(([name, data, color]) => ({ name, data, color, stack: 'v' })) },
      ],
      [
        { span: 7, type: 'gantt', title: 'Recruitment campaigns | FY 2026-27', height: 250, start: 0, end: 12, today: 5.75, labelWidth: 210, ticks: MONTHS,
          tasks: [['Registered nurses (42 posts)', 3, 8, 30, 'red'], ['Medical officers (18)', 2, 7, 55, 'amber'], ['Secondary teachers (58)', 1, 5, 100, 'green'], ['Systems engineers (26)', 4, 9, 20, 'amber'], ['Road engineers (19)', 5, 10, 10, 'blue'], ['Veterinary officers (12)', 6, 10, 0, 'blue'], ['Water technicians (16)', 3, 7, 60, 'green']]
            .map(([name, start, end, progress, tone]) => ({ name, start, end, progress, tone, label: `${progress}%` })) },
        { span: 5, type: 'map', title: 'Vacant nursing posts by hospital', height: 250,
          pins: HOSP.map(h => ({ name: h.town, lon: h.lon, lat: h.lat, size: 6 + h.vac * 2, tone: h.vac >= 5 ? 'red' : h.vac >= 3 ? 'amber' : 'cyan', meta: `${h.name} · ${h.vac} vacant nursing posts` })).filter(p => !['Lobatse', 'Molepolole', 'Selebi-Phikwe'].includes(p.name)) },
      ],
      [
        { span: 12, type: 'table', title: 'Critical vacancies | open longest', height: 240,
          columns: [{ key: 'p', label: 'Post' }, { key: 'm', label: 'Ministry' }, { key: 'l', label: 'Location' }, { key: 'n', label: 'Posts', align: 'right' }, { key: 'd', label: 'Days open', align: 'right' }, { key: 'st', label: 'Stage' }, { key: 'i', label: 'Impact' }],
          rows: [['Registered nurse', 'Health', 'Princess Marina, Gaborone', 9, 164, 'Awaiting DPSM approval', 'Overtime ▲ 38%'], ['Registered nurse', 'Health', 'Nyangabgwe, Francistown', 8, 151, 'Shortlisting', 'Overtime ▲ 38%'], ['Specialist anaesthetist', 'Health', 'Nyangabgwe, Francistown', 2, 212, 'Re-advertised', 'Theatre lists cut'], ['Registered nurse', 'Health', 'Letsholathebe II, Maun', 6, 128, 'Interviews', 'Overtime ▲ 38%'], ['Systems engineer', 'ICT', 'Gaborone', 7, 119, 'Offers issued', 'Data centre delay'], ['Road engineer', 'Transport', 'Palapye', 4, 102, 'Advertised', 'A1 supervision gap']]
            .map(([p, m, l, n, d, st, i]) => ({ p: { strong: p }, m, l, n, d, st: { pill: st, tone: d > 150 ? 'red' : 'amber' }, i })) },
      ],
    ],
  }));

  // ── 8 Performance & Productivity ──
  register(K(8), () => {
    const perf = [['Health', 91, 58], ['Education', 86, 71], ['Defence', 97, 82], ['Transport', 84, 63], ['Agriculture', 79, 55], ['Water', 88, 66], ['ICT', 93, 49], ['Energy', 90, 74]];
    return {
      crumbs,
      kpis: [
        { label: 'Performance agreements', value: '94%', sub: 'signed for FY 2026-27', tone: 'blue', pct: 94 },
        { label: 'Mid-year reviews done', value: '88%', delta: '▼ 4 pts vs LY', sub: 'due 30 Sep', tone: 'cyan', pct: 88 },
        { label: 'Average rating', value: '3.4 / 5', sub: 'mid-year', tone: 'violet', pct: 68 },
        { label: 'Rated 4 or 5', value: '44%', delta: 'outputs met: 64%', deltaTone: 'amber', sub: 'rating inflation', tone: 'amber', pct: 44 },
        { label: 'On improvement plans', value: '312', sub: '2.5% of staff', tone: 'red' },
      ],
      insight: { finding: '<b>44%</b> of staff are rated 4 or 5, yet only 64% of departmental output targets are being met. ICT is the widest gap: 93% of appraisals are complete but only 49% of outputs have been delivered.', recommendation: 'Link individual ratings to departmental output scores before the performance bonus is calculated.', severity: 'Medium', tone: 'amber' },
      grid: [
        [
          { span: 4, type: 'bar', title: 'Rating distribution | 1 poor to 5 outstanding (% staff)', height: 270, categories: ['1', '2', '3', '4', '5'],
            series: [{ name: 'Staff %', label: true, data: [2, 6, 48, 33, 11].map((v, i) => ({ value: v, itemStyle: { color: [C.red, C.orange, C.blue, C.cyan, C.green][i] } })) }] },
          { span: 8, type: 'scatter', title: 'Ministries | appraisals completed vs output targets met (%)', height: 270, xName: 'Appraisals completed %', yName: 'Outputs met %', xMin: 70, xMax: 100, yMin: 40, yMax: 90, labels: true,
            points: perf.map(([name, x, y]) => ({ name, x, y, size: 10 + MIN.find(m => m.name === name).hc / 300, tone: y < 60 ? 'red' : y < 70 ? 'amber' : 'green' })) },
        ],
        [
          { span: 7, type: 'table', title: 'Department productivity | Ministry of Health', height: 250,
            columns: [{ key: 'd', label: 'Department' }, { key: 's', label: 'Staff', align: 'right' }, { key: 'o', label: 'Key output', align: 'right' }, { key: 'p', label: 'Output per FTE', align: 'right' }, { key: 't', label: 'Targets met' }],
            rows: [['Clinical Services', 1480, '612,000 visits', '414'], ['Hospital Services', 1210, '48,200 admissions', '40'], ['Public Health', 690, '221,000 screenings', '320'], ['Health Infrastructure', 310, '14 facilities', '0.05'], ['Corporate Services', 430, '9,800 transactions', '23']]
              .map(([d, s, o, p], i) => { const t = [62, 58, 71, 38, 66][i]; return { d, s: fmt.n(s), o, p, t: { bar: t, tone: t < 50 ? 'red' : t < 65 ? 'amber' : 'green' } }; }) },
          { span: 5, type: 'radar', title: 'Competency profile | Health vs public service', height: 250, indicators: ['Service delivery', 'Teamwork', 'Integrity', 'Innovation', 'Customer focus', 'Leadership'].map(name => ({ name, max: 5 })),
            series: [{ name: 'Ministry of Health', values: [3.9, 4.2, 4.0, 2.4, 3.6, 2.7], color: 'blue' }, { name: 'Public service', values: [3.3, 3.5, 4.3, 3.2, 3.1, 3.5], color: 'amber' }] },
        ],
      ],
    };
  });

  // ── 9 Cost per Employee & Output ──
  register(K(9), () => ({
    crumbs,
    kpis: [
      { label: 'Cost per employee', value: `BWP ${fmt.n(AVG_COST)}K`, delta: '▲ 5.1% vs LY', deltaTone: 'amber', sub: 'fully loaded, annual', tone: 'blue' },
      { label: 'Cost per outpatient visit', value: 'BWP 212', delta: '▲ 9%', deltaTone: 'red', sub: 'Ministry of Health', tone: 'red' },
      { label: 'Cost per learner', value: 'BWP 9,840', delta: '▲ 3%', deltaTone: 'amber', sub: 'Ministry of Education', tone: 'violet' },
      { label: 'Cost per km maintained', value: 'BWP 41.2K', delta: '▼ 4%', deltaTone: 'green', sub: 'Ministry of Transport', tone: 'green' },
      { label: 'Payroll share of recurrent', value: '46%', sub: 'ceiling 50%', tone: 'amber', pct: 92 },
    ],
    insight: { finding: `The average employee costs <b>BWP ${fmt.n(AVG_COST)}K</b> a year fully loaded. Cost per outpatient visit rose 9% because overtime at premium rates is replacing permanent nursing hours, while cost per km of road maintained fell 4%.`, recommendation: 'Track cost per output monthly in the Board pack and set 2027-28 unit-cost ceilings per programme.', severity: 'Low', tone: 'blue' },
    grid: [
      [
        { span: 6, type: 'bar', title: 'Cost per employee by ministry (BWP K / year)', height: 270, gridOpt: { right: 36 }, categories: MIN.map(m => m.name),
          series: [{ name: 'Cost per employee', label: true, data: MIN.map(m => ({ value: m.cost, itemStyle: { color: m.cost > 200 ? C.violet : m.cost > AVG_COST ? C.blue : C.cyan } })), markLine: { value: Math.round(AVG_COST), label: 'Avg', tone: 'amber' } }] },
        { span: 6, type: 'waterfall', title: 'Cost per employee build-up (BWP K / year)', height: 270, upTone: 'blue', min: 0,
          steps: [{ name: 'Basic salary', value: +(AVG_COST * 0.70).toFixed(1) }, { name: 'Allowances', value: +(AVG_COST * 0.16).toFixed(1) }, { name: 'Overtime', value: +(AVG_COST * 0.06).toFixed(1) }, { name: 'Pension & medical', value: +(AVG_COST * 0.08).toFixed(1) }, { name: 'Total', value: +AVG_COST.toFixed(1), total: true }] },
      ],
      [
        { span: 7, type: 'table', title: 'Unit cost of outputs | payroll per output', height: 250,
          columns: [{ key: 'm', label: 'Ministry' }, { key: 'o', label: 'Output measure' }, { key: 'v', label: 'Volume YTD', align: 'right' }, { key: 'u', label: 'Payroll per unit', align: 'right' }, { key: 't', label: 'vs LY', align: 'right' }],
          rows: [['Health', 'Outpatient visit', '1.84M', 'BWP 212', 9], ['Education', 'Learner enrolled', '61,400', 'BWP 9,840', 3], ['Transport', 'Km of road maintained', '4,720', 'BWP 41.2K', -4], ['Agriculture', 'Farmer served', '38,900', 'BWP 4,150', 2], ['Water', 'Connection maintained', '112,000', 'BWP 1,130', -1], ['ICT', 'Service request resolved', '96,300', 'BWP 1,290', 12]]
            .map(([m, o, v, u, t]) => ({ m, o, v, u, t: { trend: t > 0 ? 'up' : 'down', text: Math.abs(t) + '%', tone: t > 5 ? 'red' : t > 0 ? 'amber' : 'green' } })) },
        { span: 5, type: 'line', title: 'Cost per employee vs inflation (index, FY22 = 100)', height: 250, categories: ['FY22', 'FY23', 'FY24', 'FY25', 'FY26', 'FY27F'],
          series: [{ name: 'Cost per employee', data: [100, 104.2, 109.8, 114.1, 119.9, 126.0], color: 'blue', area: true }, { name: 'Consumer prices', data: [100, 112.1, 117.6, 121.0, 124.8, 128.3], color: 'amber', dashed: true }] },
      ],
    ],
  }));

  // ── 10 Payroll Anomalies ──
  const RULES = [['Ghost worker', 23, 'red'], ['Shared bank account', 18, 'orange'], ['Employee-vendor', 7, 'violet'], ['Paid after exit', 11, '#B91C1C'], ['Duplicate payment', 9, 'amber'], ['Above grade max', 14, 'blue'], ['Overtime > 100 h', 31, 'cyan'], ['No entitlement', 22, 'teal'], ['Same name + DOB', 11, 'pink']];
  register(K(10), () => {
    const r = rng('pay-anom');
    return {
      crumbs,
      kpis: [
        { label: 'Records flagged', value: String(sum(RULES.map(x => x[1]))), delta: '▲ 19 this run', deltaTone: 'red', sub: 'September payroll', tone: 'red' },
        { label: 'Ghost worker suspects', value: '23', delta: 'BWP 3.9M / yr', deltaTone: 'red', sub: 'no attendance, no leave', tone: 'red' },
        { label: 'Duplicate bank accounts', value: '18', sub: 'shared by 41 payees', tone: 'orange' },
        { label: 'Employee-vendor matches', value: '7', delta: 'BWP 2.3M paid', deltaTone: 'red', sub: 'to linked suppliers', tone: 'violet' },
        { label: 'Value at risk', value: 'BWP 4.7M', sub: 'annualised', tone: 'amber' },
      ],
      insight: { finding: '<b>23 payees</b> have had no biometric clock-in, leave or appraisal record for more than 90 days, and 11 of them are paid into accounts shared with other employees. Seven employees share a bank account, address or phone number with a supplier that received BWP 2.3M this year.', recommendation: 'Suspend the 23 payments pending a physical head-count and refer the seven employee-vendor matches to the Directorate on Corruption and Economic Crime.', severity: 'Critical', tone: 'red', actions: ['Explain finding', 'Suspend payments', 'Refer to DCEC'] },
      grid: [
        [
          { span: 5, type: 'donut', title: 'Flags by rule', height: 280, center: String(sum(RULES.map(x => x[1]))), items: RULES.map(([name, value, color]) => ({ name, value, color })) },
          { span: 7, type: 'bar', title: 'Flagged vs cleared by payroll run | confirmed irregular value (BWP K)', height: 280, categories: H, y2: ' ',
            series: [{ name: 'New flags', data: [94, 101, 118, 109, 127, 146], color: 'red' }, { name: 'Cleared as valid', data: [71, 80, 88, 79, 92, 97], color: 'green' }, { name: 'Confirmed irregular (BWP K)', type: 'line', axis: 1, smooth: false, data: [188, 214, 262, 240, 305, 392], color: 'amber' }] },
        ],
        [
          { span: 12, type: 'table', title: 'Flagged payroll records | highest risk', height: 260,
            columns: [{ key: 'e', label: 'Employee' }, { key: 'm', label: 'Ministry' }, { key: 'rule', label: 'Rule' }, { key: 'ev', label: 'Evidence' }, { key: 'v', label: 'Monthly pay', align: 'right' }, { key: 'sev', label: 'Risk' }, { key: 'o', label: 'Assigned to' }],
            rows: [['Health', 'Ghost worker indicators', 'No clock-in since 02 Apr; no leave; posted to closed clinic'], ['Health', 'Duplicate bank accounts', 'Account ****4471 shared with 3 payees'], ['Agriculture', 'Ghost worker indicators', 'ID number not on Omang register'], ['Transport', 'Employee-vendor matches', 'Same address as Mokgosi Logistics director'], ['Education', 'Paid after termination', 'Resigned 31 May; paid Jun–Sep'], ['Defence', 'Duplicate payment in period', 'Two September salary lines'], ['Health', 'Same name and date of birth', 'Two employee numbers, one Omang'], ['Water', 'Salary above grade maximum', 'D2 notch 14 (max 11)']]
              .map(([m, rule, ev], i) => ({ e: `EMP-${r.int(10000, 99999)}`, m, rule: { strong: rule }, ev, v: fmt.n(r.int(90, 260) * 100), sev: i < 5 ? { pill: 'High', tone: 'red' } : { pill: 'Medium', tone: 'amber' }, o: OFFICERS[(i + 4) % OFFICERS.length] })) },
        ],
        [
          { span: 6, type: 'list', title: 'Employee-vendor relationship indicators', height: 250,
            items: [['Serowe Hardware', 'Stores officer shares bank account with supplier', 'BWP 612K', 'red'], ['Mokgosi Logistics', 'Transport officer and director share a residential address', 'BWP 488K', 'red'], ['Boitumelo Catering', 'Admin officer is listed as a supplier shareholder', 'BWP 356K', 'red'], ['Pula Office Solutions', 'Same mobile number as procurement assistant', 'BWP 301K', 'orange'], ['Tswelelo Supplies', 'Supplier director is spouse of HR officer', 'BWP 244K', 'orange'], ['Thari Consulting', 'Former employee (left 3 months ago) is sole director', 'BWP 198K', 'amber'], ['Lesedi Security Services', 'Shared next-of-kin details with payroll clerk', 'BWP 96K', 'amber']]
              .map(([title, meta, value, tone]) => ({ title, meta, value, tone })) },
          { span: 6, type: 'table', title: 'Bank accounts shared by several payees', height: 250,
            columns: [{ key: 'a', label: 'Account' }, { key: 'n', label: 'Payees', align: 'right' }, { key: 'm', label: 'Ministries' }, { key: 'v', label: 'Monthly (BWP)', align: 'right' }, { key: 's', label: 'Status' }],
            rows: [['****4471', 'First National', 4, 'Health'], ['****0932', 'Stanbic', 3, 'Health, Agriculture'], ['****7715', 'Absa', 3, 'Transport'], ['****2208', 'BBS', 2, 'Education'], ['****6619', 'FNB', 2, 'Defence'], ['****1184', 'Standard Chartered', 2, 'Water']]
              .map(([a, b, n, m], i) => ({ a, b, n, m, v: fmt.n(n * r.int(90, 180) * 100), s: i < 3 ? { pill: 'Suspend', tone: 'red' } : { pill: 'Verify', tone: 'amber' } })) },
        ],
      ],
    };
  });

  // ── 11 Training & Workforce Planning ──
  register(K(11), () => ({
    crumbs,
    kpis: [
      { label: 'MoH training budget used', value: '33%', delta: 'BWP 0.7M of 2.1M', deltaTone: 'amber', sub: 'phasing 50%', tone: 'amber', pct: 33 },
      { label: 'Staff trained YTD', value: '3,420', sub: '27% of workforce', tone: 'blue', pct: 27 },
      { label: 'Training hours per FTE', value: '11.2 h', delta: 'target 20 h / yr', sub: 'half-year', tone: 'cyan', pct: 56 },
      { label: 'Retirements in 5 years', value: '1,830', delta: '14.7%', deltaTone: 'red', sub: 'of headcount', tone: 'red', pct: 14.7 },
      { label: 'Critical skills gap', value: '318 posts', sub: 'demand not covered by pipeline', tone: 'violet' },
    ],
    insight: { finding: '<b>1,830 staff</b> (14.7%) reach retirement age in the next five years, including 38% of senior nurses and 31% of engineers, while only 33% of the Ministry of Health training budget has been used at the half-year point.', recommendation: 'Redirect unused training funds to nurse-specialist and engineering succession programmes before the Q3 virement deadline.', severity: 'Medium', tone: 'amber' },
    grid: [
      [
        { span: 7, type: 'bar', title: 'Projected retirements by year and cadre', height: 280, categories: ['FY27', 'FY28', 'FY29', 'FY30', 'FY31'],
          series: [['Teachers', [118, 131, 142, 150, 161], 'blue'], ['Nurses & midwives', [64, 72, 81, 88, 97], 'red'], ['Engineers & technical', [31, 36, 42, 45, 51], 'amber'], ['Administration', [52, 55, 58, 61, 63], 'cyan'], ['Other', [38, 42, 46, 51, 55], '#475569']].map(([name, data, color]) => ({ name, data, color, stack: 'r' })) },
        { span: 5, type: 'bar', title: 'Skills demand vs pipeline | 2027-2031', height: 280, horizontal: true, labelMax: 20, categories: ['Registered nurses', 'Medical specialists', 'Civil engineers', 'Systems engineers', 'Pharmacists', 'Quantity surveyors'],
          series: [{ name: 'Demand', data: [410, 96, 88, 74, 52, 31], color: '#475569' }, { name: 'Pipeline', data: [286, 21, 49, 28, 36, 13], color: 'green' }] },
      ],
      [
        { span: 7, type: 'gantt', title: 'Training and succession programmes', height: 250, start: 0, end: 12, today: 5.75, labelWidth: 220, ticks: MONTHS,
          tasks: [['Nurse specialist diploma (60)', 0, 11, 45, 'blue'], ['Leadership for directors (24)', 2, 5, 100, 'green'], ['IFMIS & payroll controls (180)', 3, 7, 70, 'cyan'], ['Procurement certification (96)', 4, 9, 25, 'violet'], ['Engineering graduate scheme (40)', 6, 12, 0, 'amber'], ['Anti-corruption & ethics (1,200)', 1, 10, 52, 'teal']]
            .map(([name, start, end, progress, tone]) => ({ name, start, end, progress, tone, label: `${progress}%` })) },
        { span: 5, type: 'table', title: 'Training delivery by ministry', height: 250,
          columns: [{ key: 'm', label: 'Ministry' }, { key: 't', label: 'Trained', align: 'right' }, { key: 'h', label: 'Hours / FTE', align: 'right' }, { key: 'b', label: 'Budget used' }],
          rows: MIN.map((m, i) => { const b = [33, 52, 61, 44, 29, 48, 71, 39][i]; return { m: m.name, t: fmt.n(Math.round(m.hc * [0.24, 0.31, 0.22, 0.26, 0.19, 0.29, 0.41, 0.27][i])), h: [9.8, 13.1, 10.2, 11.4, 7.9, 12.0, 18.6, 10.9][i].toFixed(1), b: { bar: b, tone: b < 40 ? 'amber' : 'green' } }; }) },
      ],
    ],
  }));
})();
