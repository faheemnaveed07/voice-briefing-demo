/* Menu 5: Procurement Analytics (menu index 4). Lifecycle from the brief:
 * Plan > Requisition > Tender > Evaluation > Award > Contract > PO > Delivery > Invoice > Payment > Supplier Performance.
 * Anchors shared with other screens: plan compliance 93% | emergency procurement 7.2% (target < 5%) |
 * tender MCP/DES/2283/26-27-01 (furniture framework) awarded to Clement Pty Ltd, score 0.88 | home tile 91%.
 */
(function () {
  const { register, fmt, rng, C } = DASH;
  const { MONTHS, MONTH_NOW, DEPTS, SUPPLIERS, TOWNS } = DASH.data;
  const K = n => `4-${n}`;
  const crumbs = ['All Ministries', 'Procurement'];
  const H = MONTHS.slice(0, MONTH_NOW);
  const cum = arr => arr.reduce((acc, v, i) => (acc.push((acc[i - 1] || 0) + (v ?? 0)), acc), []);
  const money = v => 'BWP ' + Math.round(v).toLocaleString('en-GB');

  // ── module data (BWP M, FY 2026-27 to month 6) ──
  // Procurement spend per ministry; total 812M.
  const PSPEND = { Health: 212, Education: 138, Transport: 151, Agriculture: 79, Defence: 88, Water: 69, Energy: 52, ICT: 23 };
  const TOTAL = 812;
  const MON = [118, 124, 139, 131, 142, 158];
  const EMERG_PCT = [5.8, 6.4, 7.0, 7.3, 7.6, 8.4]; // weighted average 7.2%
  const METHODS = [['Open tender', 44.0, 'blue'], ['Quotations', 21.0, 'cyan'], ['Selective tender', 11.8, 'violet'], ['Framework call-off', 7.0, 'teal'], ['Direct procurement', 9.0, 'amber'], ['Emergency', 7.2, 'red']];
  const PLAN = { Health: 94, Education: 96, Transport: 89, Agriculture: 91, Defence: 97, Water: 92, Energy: 95, ICT: 88 }; // plan compliance %
  const EMERG_MIN = { Health: 9.8, Education: 4.1, Transport: 8.9, Agriculture: 6.2, Defence: 3.4, Water: 10.6, Energy: 5.1, ICT: 2.9 };
  const DIRECT_MIN = { Health: 10.2, Education: 7.4, Transport: 11.1, Agriculture: 8.0, Defence: 12.6, Water: 7.9, Energy: 6.5, ICT: 5.8 };

  // Supplier spend YTD (BWP M), descending; top 10 = 44% of 812.
  const SUP = (() => {
    const base = [68.4, 52.1, 41.7, 36.2, 33.8, 31.0, 28.6, 24.9, 22.3, 18.3];
    const order = ['Mmila Road Contractors', 'Kgalagadi Builders', 'Tlotlo Civil Works', 'Clement Pty Ltd', 'Motswedi Construction', 'Chobe ICT Solutions', 'Okavango Medical Supplies', 'Kalahari Energy Systems', 'Naledi Pharmaceuticals', 'Letsatsi Engineering'];
    const rest = SUPPLIERS.filter(s => !order.includes(s));
    const r = rng('psup');
    const tail = rest.map((name, i) => ({ name, spend: +(16 - i * 1.05 + r.num(-0.4, 0.4)).toFixed(1) }));
    // [on time %, quality, compliance, responsiveness, price competitiveness]
    const STATS = {
      'Mmila Road Contractors': [78, 86, 90, 72, 70], 'Kgalagadi Builders': [75, 80, 86, 70, 78], 'Tlotlo Civil Works': [69, 83, 88, 76, 74], 'Clement Pty Ltd': [93, 91, 97, 88, 95],
      'Motswedi Construction': [66, 76, 81, 66, 80], 'Chobe ICT Solutions': [88, 95, 91, 85, 62], 'Okavango Medical Supplies': [63, 70, 68, 74, 90], 'Kalahari Energy Systems': [81, 89, 84, 79, 76],
      'Naledi Pharmaceuticals': [79, 93, 92, 81, 67], 'Letsatsi Engineering': [89, 83, 89, 83, 82], 'Seasons Pty Ltd': [84, 80, 90, 78, 72], 'Matrix Pty Ltd': [80, 76, 85, 74, 66],
      'Tswelelo Supplies': [72, 72, 78, 71, 84], 'Mokgosi Logistics': [65, 66, 62, 68, 79], 'Boitumelo Catering': [83, 78, 88, 86, 81], 'Makgadikgadi Fleet Services': [75, 73, 80, 72, 77],
      'Serowe Hardware': [70, 71, 58, 69, 85], 'Pula Office Solutions': [88, 83, 91, 84, 80], 'Thari Consulting': [82, 80, 76, 79, 64], 'Lesedi Security Services': [72, 70, 61, 75, 71],
    };
    return [...order.map((name, i) => ({ name, spend: base[i] })), ...tail].map((s, i) => {
      const [onTime, quality, compliance, responsive, price] = STATS[s.name];
      return { ...s, rank: i + 1, contracts: rng('sq' + s.name).int(3, 28), onTime, quality, compliance, responsive, price };
    });
  })();
  const TOP10 = SUP.slice(0, 10);

  // ── 0 Overview ──
  register(K(0), () => ({
    crumbs,
    kpis: [
      { label: 'Procurement spend YTD', value: `BWP ${TOTAL}M`, delta: '▲ 6% vs LY', deltaTone: 'amber', sub: '8 ministries', tone: 'blue', pct: 48 },
      { label: 'Plan compliance', value: '93%', delta: 'target 95%', deltaTone: 'amber', sub: '1,161 of 1,248 items', tone: 'green', pct: 93 },
      { label: 'Competitive share', value: '83.8%', delta: '▼ 1.9 pts', sub: 'by value', tone: 'cyan', pct: 84 },
      { label: 'Emergency procurement', value: '7.2%', delta: 'target < 5%', deltaTone: 'red', sub: 'BWP 58.5M', tone: 'red', pct: 72 },
      { label: 'Tender turnaround', value: '68 days', delta: '▲ 9 days', deltaTone: 'red', sub: 'target 60', tone: 'amber', pct: 68 },
    ],
    insight: { finding: 'Emergency procurement has risen every month and reached <b>8.4%</b> of spend in September, taking the year-to-date share to <b>7.2%</b> against a 5% ceiling. Water and Health account for 58% of emergency value.', recommendation: 'Require Accounting Officer sign-off for any emergency award above BWP 250K and bring Q3 medical and borehole needs into the procurement plan.', severity: 'High', tone: 'orange' },
    grid: [
      [
        { span: 8, type: 'bar', title: 'Monthly procurement spend by method (BWP M)', height: 290, categories: H, y2: 'Emergency %', gridOpt: { top: 56, right: 44 },
          series: [
            ...METHODS.map(([name, share, tone], j) => ({ name, stack: 'm', color: tone, data: MON.map((t, i) => { const e = EMERG_PCT[i]; return +(j === 5 ? t * e / 100 : (t * (100 - e) / 100) * share / (100 - 7.2)).toFixed(1); }) })),
            { name: 'Emergency share %', type: 'line', axis: 1, color: 'pink', data: EMERG_PCT, markLine: { value: 5, label: '5%', tone: 'red' } },
          ] },
        { span: 4, type: 'donut', title: 'Spend by procurement method', height: 290, center: `BWP ${TOTAL}M`, valueFmt: v => `BWP ${v}M`, items: METHODS.map(([name, share, tone]) => ({ name, value: +(TOTAL * share / 100).toFixed(1), color: tone })) },
      ],
      [
        { span: 5, type: 'bar', title: 'Procurement spend by ministry (BWP M)', height: 250, horizontal: true, categories: Object.keys(PSPEND),
          series: [{ name: 'Competitive', stack: 's', color: 'blue', data: Object.entries(PSPEND).map(([k, v]) => +(v * (100 - EMERG_MIN[k] - DIRECT_MIN[k]) / 100).toFixed(1)) }, { name: 'Direct', stack: 's', color: 'amber', data: Object.entries(PSPEND).map(([k, v]) => +(v * DIRECT_MIN[k] / 100).toFixed(1)) }, { name: 'Emergency', stack: 's', color: 'red', data: Object.entries(PSPEND).map(([k, v]) => +(v * EMERG_MIN[k] / 100).toFixed(1)) }] },
        { span: 4, type: 'gauge', title: 'Procurement health index', height: 250, gauges: [{ name: 'Health index', value: 91 }, { name: 'Plan compliance', value: 93, good: 95, warn: 85 }] },
        { span: 3, type: 'list', title: 'Watch items', height: 250, items: [
          { title: 'Emergency share 7.2%', meta: 'Ceiling 5% | Water 10.6%', tone: 'red', pill: 'High' },
          { title: 'Split purchase', meta: 'Serowe Hardware | 4 POs, BWP 396K', tone: 'orange', pill: 'High' },
          { title: '17 tenders past validity', meta: 'Evaluation not concluded', tone: 'amber', pill: 'Medium' },
          { title: 'Top 10 hold 44%', meta: 'Supplier concentration ▲ 3 pts', tone: 'amber', pill: 'Watch' },
        ] },
      ],
      [
        { span: 12, type: 'steps', title: 'Procurement lifecycle | FY 2026-27 volumes to date', steps: [
          { name: 'Plan', meta: '1,248 items', state: 'done' }, { name: 'Requisition', meta: '3,412 raised', state: 'done' }, { name: 'Tender', meta: '184 issued', state: 'done' },
          { name: 'Evaluation', meta: '41 open | 17 late', state: 'late' }, { name: 'Award', meta: '412 awards', state: 'done' }, { name: 'Contract', meta: '398 signed', state: 'done' },
          { name: 'Purchase order', meta: '6,842 POs', state: 'done' }, { name: 'Delivery', meta: '81% on time', state: 'current' }, { name: 'Invoice', meta: '5,906 received', state: 'current' },
          { name: 'Payment', meta: '34 days avg', state: 'late' }, { name: 'Supplier rating', meta: '78 / 100', state: 'pending' },
        ] },
      ],
    ],
  }));

  // ── 1 Procurement Plan Compliance ──
  register(K(1), () => {
    const r = rng('plan');
    const planCum = cum(MONTHS.map(() => 1248 / 12));
    const actCum = cum(H.map((_, i) => [88, 102, 118, 104, 112, 126][i]));
    const unplanned = [
      ['REQ-26-30418', 'Health', 'Oxygen concentrators (ward 4)', 4.8, 'Outbreak response'],
      ['REQ-26-30922', 'Water', 'Borehole pump replacements, Tsabong', 3.9, 'Breakdown'],
      ['REQ-26-31077', 'Transport', 'Bridge deck repair, Mahalapye', 6.2, 'Flood damage'],
      ['REQ-26-31210', 'ICT', 'Firewall licence renewal', 1.6, 'Omitted from plan'],
      ['REQ-26-31455', 'Agriculture', 'FMD vaccine top-up', 2.7, 'Disease outbreak'],
      ['REQ-26-31702', 'Health', 'Generator hire, Maun hospital', 1.1, 'Breakdown'],
      ['REQ-26-31869', 'Education', 'Exam printing overflow', 0.9, 'Late request'],
      ['REQ-26-32004', 'Water', 'Pipe fittings emergency stock', 2.3, 'Breakdown'],
    ];
    return {
      crumbs,
      kpis: [
        { label: 'Plan compliance', value: '93%', delta: 'target 95%', deltaTone: 'amber', sub: 'by count', tone: 'green', pct: 93 },
        { label: 'Items in annual plan', value: '1,248', sub: 'BWP 1.69bn planned', tone: 'blue' },
        { label: 'Procured per plan', value: '1,161', delta: '▲ 42 vs Aug', sub: 'method + timing', tone: 'cyan', pct: 93 },
        { label: 'Unplanned purchases', value: '87', delta: 'BWP 42.6M', deltaTone: 'red', sub: '5.2% of spend', tone: 'red', pct: 5 },
        { label: 'Plan executed (value)', value: '48%', delta: 'month 6 of 12', sub: 'expected 50%', tone: 'violet', pct: 48 },
      ],
      insight: { finding: 'Plan compliance is <b>93%</b>, two points below target. ICT (88%) and Transport (89%) drive most deviations: 87 purchases worth <b>BWP 42.6M</b> were not in any approved plan, and 61% of them were later processed as emergencies.', recommendation: 'Mandate a mid-year plan revision by 15 October so known needs are re-planned rather than bought as emergencies.', severity: 'Medium', tone: 'amber' },
      grid: [
        [
          { span: 7, type: 'bar', title: 'Plan compliance by ministry (%)', height: 270, categories: Object.keys(PLAN), max: 100, gridOpt: { right: 64 },
            series: [{ name: 'Compliance %', label: true, data: Object.values(PLAN).map(v => ({ value: v, itemStyle: { color: v >= 95 ? C.green : v >= 90 ? C.blue : C.amber } })), markLine: { value: 95, label: 'Target 95%', tone: 'cyan' } }] },
          { span: 5, type: 'line', title: 'Cumulative items procured vs plan', height: 270, categories: MONTHS,
            series: [{ name: 'Plan', data: planCum.map(v => Math.round(v)), color: '#475569', dashed: true, symbol: 'none' }, { name: 'Procured per plan', data: actCum.map(Math.round), color: 'blue', area: true }, { name: 'Unplanned', data: cum([9, 11, 14, 16, 17, 20]), color: 'red' }] },
        ],
        [
          { span: 5, type: 'donut', title: 'Deviation type', height: 250, items: [{ name: 'Not in plan', value: 87, color: 'red' }, { name: 'Method changed', value: 34, color: 'amber' }, { name: 'Timing slipped > 60 days', value: 112, color: 'violet' }, { name: 'Value > plan by 20%', value: 41, color: 'orange' }] },
          { span: 7, type: 'table', title: 'Largest unplanned purchases', height: 250,
            columns: [{ key: 'ref', label: 'Requisition' }, { key: 'min', label: 'Ministry' }, { key: 'item', label: 'Item' }, { key: 'amt', label: 'Value (M)', align: 'right' }, { key: 'why', label: 'Reason' }],
            rows: unplanned.map(([ref, min, item, amt, why]) => ({ ref, min, item, amt: amt.toFixed(1), why: { pill: why, tone: /Omitted|Late/.test(why) ? 'red' : 'amber' } })) },
        ],
      ],
    };
  });

  // ── 2 Requisitions ──
  register(K(2), () => {
    const r = rng('req');
    const raised = [512, 548, 590, 566, 581, 615];
    const approved = raised.map((v, i) => Math.round(v * [0.86, 0.88, 0.87, 0.89, 0.88, 0.8][i]));
    const heat = [];
    DEPTS.forEach((d, y) => H.forEach((m, x) => heat.push([x, y, +(r.num(2.2, 6.4) + (y === 4 ? 2.4 : 0) + (x === 5 ? 1.1 : 0)).toFixed(1)])));
    return {
      crumbs: [...crumbs, 'Requisitions'],
      kpis: [
        { label: 'Requisitions raised', value: '3,412', delta: '▲ 8% vs LY', sub: 'Apr–Sep', tone: 'blue' },
        { label: 'Approved', value: '2,986', delta: '87.5%', sub: 'of raised', tone: 'green', pct: 88 },
        { label: 'Pending approval', value: '214', delta: '63 over 10 days', deltaTone: 'red', sub: 'BWP 36.8M', tone: 'amber', pct: 6 },
        { label: 'Avg approval time', value: '4.8 days', delta: '▲ 0.9 days', deltaTone: 'red', sub: 'target 3', tone: 'orange' },
        { label: 'Rejected / returned', value: '6.1%', sub: 'budget or spec issues', tone: 'violet', pct: 6 },
      ],
      insight: { finding: 'Dept E (Health Infrastructure) takes <b>8.1 days</b> on average to approve requisitions, nearly three times the 3-day standard. 63 requisitions worth BWP 14.2M have waited more than 10 days.', recommendation: 'Delegate approval of requisitions under BWP 50K to deputy directors and escalate the 63 aged items to the Chief Procurement Officer.', severity: 'Medium', tone: 'amber', actions: ['Explain finding', 'Open ageing list', 'Escalate'] },
      grid: [
        [
          { span: 4, type: 'funnel', title: 'Requisition to tender / PO', height: 270, items: [{ name: 'Raised', value: 3412 }, { name: 'Budget checked', value: 3268 }, { name: 'Approved', value: 2986 }, { name: 'Sourcing', value: 2811 }, { name: 'PO / tender', value: 2644 }] },
          { span: 8, type: 'bar', title: 'Requisitions raised vs approved, with approval time', height: 270, categories: H, y2: 'Days', gridOpt: { top: 50, right: 70 },
            series: [{ name: 'Raised', data: raised, color: '#1E3A5F' }, { name: 'Approved', data: approved, color: 'blue' }, { name: 'Avg approval days', type: 'line', axis: 1, data: [4.1, 4.4, 4.6, 4.9, 5.0, 5.7], color: 'amber', markLine: { value: 3, label: '3-day std', tone: 'red' } }] },
        ],
        [
          { span: 5, type: 'heatmap', title: 'Average approval days | department × month', height: 260, x: H, y: DEPTS.map(d => d.label), values: heat, min: 2, max: 10, cellFmt: v => v, valueFmt: v => v + ' days' },
          { span: 7, type: 'table', title: 'Oldest pending requisitions', height: 260,
            columns: [{ key: 'ref', label: 'Requisition' }, { key: 'dept', label: 'Department' }, { key: 'item', label: 'Description' }, { key: 'amt', label: 'Value', align: 'right' }, { key: 'age', label: 'Waiting', align: 'right' }, { key: 'st', label: 'With' }],
            rows: ['Theatre lights', 'Clinic furniture', 'Lab reagents Q3', 'Ambulance tyres', 'Staff housing repairs', 'Server rack UPS', 'Cleaning renewal', 'Linen supply'].map((item, i) => ({ ref: `REQ-26-${29100 + i * 137}`, dept: DEPTS[(i + 4) % 5].code, item, amt: fmt.n(r.int(40, 900) * 1000), age: `${27 - i * 2} d`, st: { pill: i < 3 ? 'Director' : i < 6 ? 'Budget office' : 'Head of Dept', tone: i < 3 ? 'red' : 'amber' } })) },
        ],
      ],
    };
  });

  // ── 3 Tender Pipeline ──
  const TENDERS = [
    ['MCP/DES/2283/26-27-01', 'Two-year furniture supply framework', 'Awarded', 4.0, 4, 15],
    ['MOH/TEN/0412/26-27', 'Medical consumables framework', 'Evaluation', 38.5, 6, 27],
    ['MOT/TEN/0118/26-27', 'A1 resealing, Palapye–Serule', 'Adjudication', 64.0, 8, 27],
    ['MOD/TEN/0092/26-27', 'Police housing, Jwaneng block C', 'Adjudication', 29.4, 12, 28],
    ['MICT/TEN/0056/26-27', 'Government WAN upgrade', 'Evaluation', 21.0, 9, 30],
    ['MWS/TEN/0207/26-27', 'Tsabong water treatment phase 2', 'Evaluation', 27.5, 10, 32],
    ['MOE/TEN/0331/26-27', 'School science lab equipment', 'Advertised', 14.3, 18, 31],
    ['MOA/TEN/0144/26-27', 'Lobatse abattoir cold chain', 'Advertised', 16.8, 20, 33],
    ['MOH/TEN/0439/26-27', 'Hospital cleaning services', 'Planned', 12.0, 27, 36],
    ['MME/TEN/0071/26-27', 'Letlhakane substation works', 'Planned', 21.0, 29, 36],
  ];
  const TODAY_WK = 25;
  register(K(3), () => {
    const stages = ['Planned', 'Advertised', 'Evaluation', 'Adjudication', 'Awarded'];
    const stTone = { Planned: 'slate', Advertised: 'cyan', Evaluation: 'amber', Adjudication: 'violet', Awarded: 'green' };
    return {
      crumbs: [...crumbs, 'Tenders'],
      kpis: [
        { label: 'Tenders in pipeline', value: '96', sub: 'BWP 684M estimated', tone: 'blue' },
        { label: 'In evaluation', value: '41', delta: '17 past validity', deltaTone: 'red', sub: '', tone: 'amber', pct: 43 },
        { label: 'Avg turnaround', value: '68 days', delta: '▲ 9 days', deltaTone: 'red', sub: 'advert to award | target 60', tone: 'orange' },
        { label: 'Avg evaluation time', value: '27 days', delta: 'target 21', deltaTone: 'amber', sub: '', tone: 'violet' },
        { label: 'Cancelled tenders', value: '23', delta: '11% of issued', deltaTone: 'red', sub: '9 non-responsive', tone: 'red', pct: 11 },
      ],
      insight: { finding: 'Evaluation is the bottleneck: tenders spend <b>27 days</b> in evaluation against a 21-day standard, and 17 are now past bid validity. MOH/TEN/0412 (medical consumables, BWP 38.5M) expires in 6 days.', recommendation: 'Convene the MOH evaluation committee this week and request a 30-day validity extension from bidders.', severity: 'High', tone: 'orange', actions: ['Explain finding', 'Open tender', 'Notify committee'] },
      grid: [
        [
          { span: 4, type: 'funnel', title: 'Tender pipeline | FY to date', height: 270, items: [{ name: 'Planned', value: 248, color: 'slate' }, { name: 'Advertised', value: 184, color: 'cyan' }, { name: 'Bids opened', value: 161, color: 'blue' }, { name: 'Evaluated', value: 120, color: 'amber' }, { name: 'Adjudicated', value: 104, color: 'violet' }, { name: 'Awarded', value: 96, color: 'green' }] },
          { span: 8, type: 'bar', title: 'Days per stage | actual vs standard', height: 270, categories: ['Preparation', 'Advertising', 'Bid opening', 'Evaluation', 'Adjudication', 'Award & notify'],
            series: [{ name: 'Standard', data: [10, 21, 1, 21, 7, 5], color: '#1E3A5F' }, { name: 'Actual (median)', color: 'blue', label: true, data: [12, 22, 1, 27, 11, 6].map((v, i) => ({ value: v, itemStyle: { color: v > [10, 21, 1, 21, 7, 5][i] * 1.2 ? C.red : C.blue } })) }] },
        ],
        [
          { span: 12, type: 'kanban', title: 'Tender board | major tenders', height: 300, columns: stages.map(s => ({ name: s, tone: stTone[s], items: TENDERS.filter(t => t[2] === s).map(t => ({ title: `${t[0]} | ${t[1]}`, pill: `BWP ${t[3]}M`, tone: stTone[s], meta: s === 'Awarded' ? 'Clement Pty Ltd' : t[0] === 'MOH/TEN/0412/26-27' ? 'validity ends in 6 d' : `${t[5] - TODAY_WK} wks to award` })) })) },
        ],
        [
          { span: 12, type: 'gantt', title: 'Tender timelines | advert to planned award (weeks from 1 Apr)', start: 0, end: 36, today: TODAY_WK, labelWidth: 250, ticks: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], height: 320,
            tasks: TENDERS.map(t => ({ name: `${t[0]} | ${t[1]}`, start: t[4], end: t[5], progress: Math.max(0, Math.min(100, Math.round(((TODAY_WK - t[4]) / (t[5] - t[4])) * 100))), tone: t[0] === 'MOH/TEN/0412/26-27' ? 'red' : t[2] === 'Planned' ? 'blue' : stTone[t[2]], label: t[2] === 'Awarded' ? 'Awarded 12 Jul' : t[2] })) },
        ],
      ],
    };
  });

  // ── 4 Awards & Contracts ──
  register(K(4), () => {
    const awards = [
      ['MCP/DES/2283/26-27-01', 'Two-year furniture supply framework', 'Clement Pty Ltd', 4.0, 3, 'Open tender'],
      ['MOT/TEN/0097/26-27', 'Kazungula link road drainage', 'Mmila Road Contractors', 38.0, 5, 'Open tender'],
      ['MOH/TEN/0388/26-27', 'Maun hospital wing fit-out', 'Kgalagadi Builders', 22.6, 4, 'Open tender'],
      ['MICT/TEN/0049/26-27', 'Data centre cooling', 'Chobe ICT Solutions', 9.8, 1, 'Selective tender'],
      ['MWS/TEN/0189/26-27', 'Selebi-Phikwe pipeline lot 2', 'Motswedi Construction', 14.1, 6, 'Open tender'],
      ['MOH/QUO/1172/26-27', 'Pharmacy shelving', 'Pula Office Solutions', 0.9, 3, 'Quotations'],
      ['MOA/TEN/0131/26-27', 'Abattoir chillers', 'Letsatsi Engineering', 7.4, 2, 'Selective tender'],
      ['MOH/DIR/0027/26-27', 'Security guarding, 6 clinics', 'Lesedi Security Services', 5.2, 1, 'Direct procurement'],
    ];
    return {
      crumbs: [...crumbs, 'Awards'],
      kpis: [
        { label: 'Contracts awarded', value: '412', delta: '▲ 37 vs LY', sub: 'Apr–Sep', tone: 'blue' },
        { label: 'Award value', value: 'BWP 486M', sub: '60% of procurement spend', tone: 'violet', pct: 60 },
        { label: 'Avg bidders per tender', value: '4.3', delta: '▼ 0.4', sub: 'target ≥ 5', tone: 'cyan', pct: 62 },
        { label: 'Repeat awards', value: '18%', delta: 'same supplier, same entity', deltaTone: 'amber', sub: '', tone: 'amber', pct: 18 },
        { label: 'Contracts signed < 14 days', value: '86%', sub: 'award to signature', tone: 'green', pct: 86 },
      ],
      insight: { finding: 'Tender <b>MCP/DES/2283/26-27-01</b> (two-year furniture framework) was awarded to <b>Clement Pty Ltd</b> with a combined score of 0.88, the lowest price (BWP 4,000 per unit set) and full compliance. Repeat awards are rising: 18% of contracts went to a supplier that already held a contract with the same entity.', recommendation: 'Publish award notices within 5 days and require a rotation justification for repeat awards above BWP 1M.', severity: 'Low', tone: 'blue', actions: ['Explain finding', 'Open evaluation', 'Create task'] },
      grid: [
        [
          { span: 8, type: 'bar', title: 'Awards per month | value and count', height: 270, categories: H, y2: 'Count', gridOpt: { top: 50 },
            series: [{ name: 'Open tender', stack: 'v', color: 'blue', data: [38, 44, 52, 47, 49, 58] }, { name: 'Selective', stack: 'v', color: 'violet', data: [9, 11, 12, 10, 13, 14] }, { name: 'Quotations', stack: 'v', color: 'cyan', data: [14, 15, 16, 15, 17, 18] }, { name: 'Direct / emergency', stack: 'v', color: 'amber', data: [6, 7, 8, 9, 9, 12] }, { name: 'Awards (count)', type: 'line', axis: 1, color: 'green', data: [58, 63, 71, 68, 72, 80] }], unit: 'BWP M' },
          { span: 4, type: 'bar', title: 'MCP/DES/2283 | evaluation result', height: 270, categories: ['Clement Pty Ltd', 'Seasons Pty Ltd', 'Matrix Pty Ltd'], max: 1, labelMax: 18,
            series: [{ name: 'Score', label: true, data: [{ value: 0.88, itemStyle: { color: C.green } }, { value: 0.7, itemStyle: { color: C.blue } }, { value: 0.6, itemStyle: { color: '#1E3A5F' } }] }] },
        ],
        [
          { span: 8, type: 'table', title: 'Recent awards and contract status', height: 270,
            columns: [{ key: 'ref', label: 'Tender' }, { key: 'desc', label: 'Description', nowrap: false }, { key: 'sup', label: 'Awarded to' }, { key: 'amt', label: 'Value (M)', align: 'right' }, { key: 'bids', label: 'Bids', align: 'right' }, { key: 'm', label: 'Method' }],
            rows: awards.map(([ref, desc, sup, amt, bids, m]) => ({ ref, desc, sup: { strong: sup }, amt: amt.toFixed(1), bids, m: { pill: m.split(' ')[0], tone: m === 'Open tender' ? 'blue' : m === 'Direct procurement' ? 'amber' : m === 'Quotations' ? 'cyan' : 'violet' } })) },
          { span: 4, type: 'donut', title: 'Awards by category', height: 270, valueFmt: v => `BWP ${v}M`, items: [{ name: 'Works', value: 248 }, { name: 'Goods', value: 131 }, { name: 'Services', value: 71 }, { name: 'Consultancy', value: 36 }] },
        ],
      ],
    };
  });

  // ── 5 Purchase Orders ──
  register(K(5), () => {
    const r = rng('po');
    const cats = [['Medical supplies', 64.2], ['Construction materials', 58.9], ['Fuel & fleet', 31.4], ['ICT equipment', 27.8], ['Office furniture', 14.6], ['Pharmaceuticals', 42.1], ['Security services', 18.3], ['Cleaning & catering', 16.7], ['Stationery', 6.2], ['Maintenance parts', 21.9], ['Training services', 9.4], ['Utilities', 6.5]];
    return {
      crumbs: [...crumbs, 'Purchase orders'],
      kpis: [
        { label: 'POs issued', value: '6,842', delta: '▲ 5% vs LY', sub: 'Apr–Sep', tone: 'blue' },
        { label: 'PO value', value: 'BWP 318M', sub: 'avg BWP 46K per PO', tone: 'violet', pct: 39 },
        { label: 'Open POs', value: '1,104', delta: 'BWP 92.4M', sub: 'awaiting delivery', tone: 'amber', pct: 29 },
        { label: 'PO without requisition', value: '2.1%', delta: '144 POs', deltaTone: 'red', sub: 'control breach', tone: 'red', pct: 2 },
        { label: 'PO cycle time', value: '3.2 days', delta: '▼ 0.4', sub: 'approval to issue', tone: 'green' },
      ],
      insight: { finding: '<b>144 POs</b> (BWP 6.8M) were raised without an approved requisition, 61 of them by the same two user accounts in Dept D. A further 212 POs have been open for more than 90 days with no delivery.', recommendation: 'Block PO creation without a requisition link in IFMS and cancel or confirm the 212 stale POs to release BWP 11.3M of commitments.', severity: 'High', tone: 'orange' },
      grid: [
        [
          { span: 8, type: 'area', title: 'PO value issued per month by ministry (BWP M)', height: 270, categories: H,
            series: Object.keys(PSPEND).slice(0, 6).map((k, i) => ({ name: k, stack: 'p', data: rng('pom' + k).walk(MONTH_NOW, PSPEND[k] * 0.39 / 6, 0.3, 0.02).map(v => +v.toFixed(1)) })) },
          { span: 4, type: 'donut', title: 'PO status', height: 270, center: '6,842', items: [{ name: 'Fully received', value: 4812, color: 'green' }, { name: 'Partially received', value: 614, color: 'cyan' }, { name: 'Open, not due', value: 490, color: 'blue' }, { name: 'Open > 90 days', value: 212, color: 'red' }, { name: 'Cancelled', value: 714, color: 'slate' }] },
        ],
        [
          { span: 6, type: 'treemap', title: 'PO value by commodity', height: 270, valueFmt: v => `BWP ${v}M`, items: cats.map(([name, value]) => ({ name, value })) },
          { span: 6, type: 'table', title: 'Stale open POs (> 90 days, no delivery)', height: 270,
            columns: [{ key: 'po', label: 'PO' }, { key: 'sup', label: 'Supplier' }, { key: 'amt', label: 'Value', align: 'right' }, { key: 'age', label: 'Age', align: 'right' }, { key: 'rq', label: 'Requisition' }],
            rows: Array.from({ length: 9 }, (_, i) => ({ po: `PO-26-${r.int(40000, 59999)}`, sup: r.pick(SUPPLIERS), amt: fmt.n(r.int(60, 1500) * 1000), age: `${168 - i * 8} d`, rq: i % 3 === 1 ? { pill: 'Missing', tone: 'red' } : { pill: 'Linked', tone: 'green' } })) },
        ],
      ],
    };
  });

  // ── 6 Deliveries & GRN ──
  register(K(6), () => {
    const r = rng('grn');
    const hubs = ['Gaborone', 'Francistown', 'Maun', 'Serowe', 'Kasane', 'Ghanzi', 'Tsabong', 'Hukuntsi', 'Tutume', 'Selebi-Phikwe', 'Letlhakane', 'Shakawe'];
    const hubRate = hubs.map(h => ({ h, rate: { Gaborone: 85, Ghanzi: 58, Tsabong: 61, Shakawe: 64, Hukuntsi: 71 }[h] || r.int(74, 90) }));
    const sup = TOP10.map(s => ({ name: s.name, v: s.onTime }));
    return {
      crumbs: [...crumbs, 'Deliveries'],
      kpis: [
        { label: 'Deliveries due', value: '1,420', sub: 'Apr–Sep', tone: 'blue' },
        { label: 'On time in full', value: '81%', delta: 'target 90%', deltaTone: 'amber', sub: '', tone: 'green', pct: 81 },
        { label: 'Late deliveries', value: '212', delta: 'avg 11 days late', deltaTone: 'red', sub: '', tone: 'red', pct: 15 },
        { label: 'Partial / rejected', value: '64', sub: 'quality or quantity', tone: 'orange', pct: 5 },
        { label: 'GRN within 48h', value: '88%', delta: '▲ 3 pts', sub: 'of receipts', tone: 'cyan', pct: 88 },
      ],
      insight: { finding: 'Remote delivery points lag badly: Ghanzi (<b>58%</b>), Tsabong (61%) and Shakawe (64%) on-time rates compare with 85% in Gaborone. Three suppliers account for 44% of late deliveries.', recommendation: 'Add delivery-point-specific lead times and liquidated damages clauses to the next medical and construction frameworks.', severity: 'Medium', tone: 'amber' },
      grid: [
        [
          { span: 5, type: 'map', title: 'On-time delivery by delivery point', height: 300, pins: hubRate.map(({ h, rate }) => ({ name: `${h} | ${rate}%`, lon: TOWNS[h][0], lat: TOWNS[h][1], size: rate < 70 ? 16 : 10, tone: rate < 70 ? 'red' : rate < 80 ? 'amber' : 'green', meta: `On time in full: ${rate}%` })) },
          { span: 7, type: 'bar', title: 'On-time delivery by supplier | top 10 by spend (%)', height: 300, horizontal: true, categories: sup.map(s => s.name), labelMax: 24, max: 100,
            series: [{ name: 'On time %', label: true, data: sup.map(s => ({ value: s.v, itemStyle: { color: s.v < 75 ? C.red : s.v < 85 ? C.amber : C.green } })) }], gridOpt: { right: 30 } },
        ],
        [
          { span: 5, type: 'line', title: 'On-time rate and GRN lag by month', height: 250, categories: H, y2: 'Days', gridOpt: { top: 50 },
            series: [{ name: 'On time %', data: [84, 83, 82, 80, 79, 78], color: 'green', area: true }, { name: 'Avg GRN lag (days)', axis: 1, data: [1.6, 1.8, 1.5, 1.9, 2.2, 2.4], color: 'amber' }] },
          { span: 7, type: 'table', title: 'Late and disputed deliveries', height: 250,
            columns: [{ key: 'po', label: 'PO' }, { key: 'sup', label: 'Supplier' }, { key: 'to', label: 'Delivery point' }, { key: 'late', label: 'Days late', align: 'right' }, { key: 'st', label: 'Issue' }],
            rows: Array.from({ length: 9 }, (_, i) => { const iss = ['Late', 'Short delivery', 'Quality reject', 'Late', 'No GRN'][i % 5]; return { po: `PO-26-${r.int(40000, 59999)}`, sup: TOP10[(i * 3) % 10].name, to: hubs[(i * 5 + 5) % 12], late: 34 - i * 3, st: { pill: iss, tone: iss === 'Late' ? 'amber' : iss === 'No GRN' ? 'red' : 'orange' } }; }) },
        ],
      ],
    };
  });

  // ── 7 Invoices & Payments ──
  register(K(7), () => ({
    crumbs: [...crumbs, 'Invoices & payments'],
    kpis: [
      { label: 'Invoices received', value: '5,906', sub: 'BWP 402M', tone: 'blue' },
      { label: 'Paid', value: '5,112', delta: 'BWP 351M', sub: '87% of received', tone: 'green', pct: 87 },
      { label: 'Payment turnaround', value: '34 days', delta: '▲ 6 days', deltaTone: 'red', sub: 'target 30', tone: 'orange' },
      { label: 'Paid within 30 days', value: '72%', delta: 'Resolution 4: 90%', deltaTone: 'red', sub: '', tone: 'amber', pct: 72 },
      { label: '3-way match exceptions', value: '94', delta: 'BWP 3.1M', deltaTone: 'red', sub: 'PO / GRN / invoice', tone: 'red' },
    ],
    insight: { finding: 'Only <b>72%</b> of supplier invoices are paid within 30 days. 94 invoices failed three-way matching, including duplicate <b>INV-7781</b> (Mokgosi Logistics, BWP 58,300) and an Okavango Medical Supplies invoice (BWP 146,900) captured before goods were received.', recommendation: 'Hold both exceptions, clear the 46 invoices over 30 days in this week\'s batch, and enforce the GRN-before-payment rule in IFMS.', severity: 'High', tone: 'red', actions: ['Explain finding', 'Open exceptions', 'Notify Director Finance'] },
    grid: [
      [
        { span: 12, type: 'steps', title: 'Cross-system trace | MCP/DES/2283/26-27-01 furniture framework, Clement Pty Ltd', steps: [
          { name: 'Tender', meta: 'Awarded 12 Jul', state: 'done' }, { name: 'Contract', meta: 'CT-26-0197', state: 'done' }, { name: 'Purchase order', meta: 'PO-26-51233', state: 'done' },
          { name: 'Delivery / GRN', meta: 'GRN-26-8841 · 02 Sep', state: 'done' }, { name: 'Invoice', meta: 'INV-CL-0931 · 04 Sep', state: 'done' }, { name: 'Payment', meta: 'PV-26-45120 · pending', state: 'current' }, { name: 'Tax record', meta: 'VAT & WHT', state: 'pending' },
        ] },
      ],
      [
        { span: 7, type: 'sankey', title: 'Invoice flow | ministry → status (BWP M)', height: 280,
          nodes: ['Health', 'Transport', 'Education', 'Other ministries', 'Matched', 'Exception', 'Paid ≤ 30 days', 'Paid > 30 days', 'Awaiting payment', 'On hold'],
          links: [
            { source: 'Health', target: 'Matched', value: 104 }, { source: 'Health', target: 'Exception', value: 1.4 }, { source: 'Transport', target: 'Matched', value: 91 }, { source: 'Transport', target: 'Exception', value: 0.8 },
            { source: 'Education', target: 'Matched', value: 72 }, { source: 'Education', target: 'Exception', value: 0.4 }, { source: 'Other ministries', target: 'Matched', value: 132 }, { source: 'Other ministries', target: 'Exception', value: 0.5 },
            { source: 'Matched', target: 'Paid ≤ 30 days', value: 253 }, { source: 'Matched', target: 'Paid > 30 days', value: 98 }, { source: 'Matched', target: 'Awaiting payment', value: 48 }, { source: 'Exception', target: 'On hold', value: 3.1 },
          ] },
        { span: 5, type: 'bar', title: 'Days from invoice to payment (count)', height: 280, categories: ['0–15', '16–30', '31–45', '46–60', '61–90', '90+'],
          series: [{ name: 'Invoices', label: true, data: [[1788, C.green], [1893, C.blue], [804, C.amber], [372, C.orange], [178, C.red], [77, C.red]].map(([value, color]) => ({ value, itemStyle: { color } })) }] },
      ],
      [
        { span: 12, type: 'table', title: 'Three-way match exceptions', height: 250,
          columns: [{ key: 'inv', label: 'Invoice' }, { key: 'sup', label: 'Supplier' }, { key: 'po', label: 'PO' }, { key: 'amt', label: 'Amount', align: 'right' }, { key: 'ex', label: 'Exception' }, { key: 'st', label: 'Action' }],
          rows: [
            ['INV-7781', 'Mokgosi Logistics', 'PO-26-47719', 58300, 'Duplicate invoice number', 'red', 'Hold'],
            ['INV-OMS-2204', 'Okavango Medical Supplies', 'PO-26-50312', 146900, 'Invoice before GRN', 'red', 'Hold'],
            ['INV-26-88104', 'Naledi Pharmaceuticals', 'PO-26-49870', 212450, 'Price > PO by 8%', 'orange', 'Query supplier'],
            ['INV-26-88312', 'Makgadikgadi Fleet Services', 'PO-26-51007', 37800, 'Quantity > GRN', 'orange', 'Query stores'],
            ['INV-26-88590', 'Boitumelo Catering', 'PO-26-50455', 18600, 'No PO reference', 'amber', 'Return'],
            ['INV-26-88733', 'Pula Office Solutions', 'PO-26-51233', 96400, 'VAT amount mismatch', 'amber', 'Query supplier'],
          ].map(([inv, sup, po, amt, ex, t, st]) => ({ inv, sup, po, amt: money(amt), ex: { pill: ex, tone: t }, st })) },
      ],
    ],
  }));

  // ── 8 Supplier Concentration ──
  register(K(8), () => {
    const top20 = SUP.slice(0, 20);
    const cumPct = cum(top20.map(s => s.spend)).map(v => +((v / TOTAL) * 100).toFixed(1));
    const cats = ['Works', 'Medical', 'ICT', 'Fleet', 'Security', 'Furniture'];
    const supX = ['Mmila Road', 'Kgalagadi', 'Tlotlo Civil', 'Clement', 'Okavango Med.', 'Chobe ICT', 'Lesedi Security', 'Others'];
    const share = [[31, 24, 19, 0, 0, 0, 0, 26], [0, 0, 0, 0, 38, 0, 0, 62], [0, 0, 0, 0, 0, 57, 0, 43], [0, 0, 0, 0, 0, 0, 0, 100], [0, 0, 0, 0, 0, 0, 64, 36], [0, 0, 0, 71, 0, 0, 0, 29]];
    const values = [];
    share.forEach((row, y) => row.forEach((v, x) => values.push([x, y, v])));
    return {
      crumbs: [...crumbs, 'Suppliers'],
      kpis: [
        { label: 'Active suppliers', value: '1,386', delta: '▼ 4% vs LY', deltaTone: 'amber', sub: 'paid this FY', tone: 'blue' },
        { label: 'Top 10 share', value: '44%', delta: '▲ 3 pts', deltaTone: 'red', sub: 'of procurement spend', tone: 'amber', pct: 44 },
        { label: 'HHI index', value: '0.082', delta: 'moderate', deltaTone: 'amber', sub: 'works > 0.15', tone: 'violet', pct: 8 },
        { label: 'Single-source categories', value: '6', sub: '> 50% one supplier', tone: 'red' },
        { label: 'Citizen-owned share', value: '61%', delta: 'target 70%', deltaTone: 'amber', sub: 'reservation policy', tone: 'green', pct: 61 },
      ],
      insight: { finding: 'The top 10 suppliers now hold <b>44%</b> of procurement spend, up 3 points. Clement Pty Ltd holds <b>71%</b> of furniture spend after the MCP/DES/2283 framework award, and Lesedi Security Services holds 64% of guarding contracts.', recommendation: 'Split the next security guarding tender into regional lots and cap any single supplier at 40% per category.', severity: 'Medium', tone: 'amber' },
      grid: [
        [
          { span: 8, type: 'bar', title: 'Supplier Pareto | top 20 by spend (BWP M) and cumulative share', height: 290, categories: top20.map(s => s.name), rotate: 35, labelMax: 16, y2: 'Cum. %', gridOpt: { top: 50, left: 60 },
            series: [{ name: 'Spend', data: top20.map((s, i) => ({ value: s.spend, itemStyle: { color: i < 10 ? C.blue : '#1E3A5F' } })) }, { name: 'Cumulative share %', type: 'line', axis: 1, data: cumPct, color: 'amber' }] },
          { span: 4, type: 'donut', title: 'Spend by supplier tier', height: 290, center: '1,386', valueFmt: v => `BWP ${v}M`, items: [{ name: 'Top 10', value: 357.3, color: 'red' }, { name: 'Next 40', value: 186.8, color: 'amber' }, { name: 'Next 200', value: 162.4, color: 'blue' }, { name: 'Remaining 1,136', value: 105.5, color: 'slate' }] },
        ],
        [
          { span: 7, type: 'heatmap', title: 'Category share by supplier (%)', height: 270, x: supX, y: cats, values, max: 80, colors: ['#0b1830', '#1D4ED8', '#F59E0B', '#EF4444'], cellFmt: v => (v ? v : ''), valueFmt: v => v + '%' },
          { span: 5, type: 'table', title: 'Repeat awards | same supplier, same entity', height: 270,
            columns: [{ key: 's', label: 'Supplier' }, { key: 'e', label: 'Entity' }, { key: 'n', label: 'Awards', align: 'right' }, { key: 'v', label: 'Value (M)', align: 'right' }],
            rows: [['Mmila Road Contractors', 'Transport', 6, 102.4], ['Lesedi Security Services', 'Health', 5, 8.9], ['Clement Pty Ltd', 'Corporate Affairs', 4, 6.2], ['Tlotlo Civil Works', 'Water', 4, 41.3], ['Serowe Hardware', 'Agriculture', 7, 1.9], ['Chobe ICT Solutions', 'ICT', 3, 18.7], ['Mokgosi Logistics', 'Health', 5, 2.4]].map(([s, e, n, v]) => ({ s: { strong: s }, e, n: { pill: String(n), tone: n >= 5 ? 'red' : 'amber' }, v: v.toFixed(1) })) },
        ],
      ],
    };
  });

  // ── 9 Supplier Performance ──
  register(K(9), () => {
    const r = rng('spf');
    const scored = SUP.slice(0, 14).map(s => ({ ...s, score: Math.round(s.onTime * 0.3 + s.quality * 0.3 + s.compliance * 0.2 + s.responsive * 0.1 + s.price * 0.1) }));
    const axes = ['On time', 'Quality', 'Compliance', 'Responsiveness', 'Price'];
    const pick = ['Clement Pty Ltd', 'Mmila Road Contractors', 'Okavango Medical Supplies'].map(n => scored.find(s => s.name === n));
    return {
      crumbs: [...crumbs, 'Suppliers', 'Performance'],
      kpis: [
        { label: 'Avg supplier score', value: '78 / 100', delta: '▲ 2 vs FY25', sub: '312 rated suppliers', tone: 'blue', pct: 78 },
        { label: 'On time in full', value: '81%', delta: 'target 90%', deltaTone: 'amber', sub: '', tone: 'green', pct: 81 },
        { label: 'Quality rejects', value: '3.4%', delta: '▲ 0.6 pts', deltaTone: 'red', sub: 'of deliveries', tone: 'orange', pct: 3 },
        { label: 'Watchlist', value: '9', sub: 'score < 60 for 2 quarters', tone: 'red' },
        { label: 'Debarred / suspended', value: '2', sub: 'PPADB register', tone: 'slate' },
      ],
      insight: { finding: 'Okavango Medical Supplies scores well on price but has the weakest delivery record among medical suppliers and an invoice raised before goods were received. Nine suppliers have scored below 60 for two consecutive quarters.', recommendation: 'Issue formal performance notices to the nine watchlist suppliers and weight past performance at 10% in the next evaluations.', severity: 'Medium', tone: 'amber' },
      grid: [
        [
          { span: 4, type: 'radar', title: 'Scorecard | three key suppliers', height: 290, indicators: axes.map(name => ({ name, max: 100 })), series: pick.map((s, i) => ({ name: s.name, values: [s.onTime, s.quality, s.compliance, s.responsive, s.price], color: ['green', 'blue', 'amber'][i] })) },
          { span: 8, type: 'scatter', title: 'On-time delivery vs quality score | bubble = spend', height: 290, xName: 'On time %', yName: 'Quality score', xMin: 55, xMax: 100, yMin: 60, yMax: 100, labels: true,
            points: scored.map(s => ({ name: s.name, x: s.onTime, y: s.quality, size: 8 + Math.sqrt(s.spend) * 3, tone: s.score < 72 ? 'red' : s.score < 80 ? 'amber' : 'green' })) },
        ],
        [
          { span: 12, type: 'table', title: 'Supplier scorecard | top 14 by spend', height: 280,
            columns: [{ key: 'n', label: 'Supplier' }, { key: 'sp', label: 'Spend (M)', align: 'right' }, { key: 'c', label: 'Contracts', align: 'right' }, { key: 'ot', label: 'On time' }, { key: 'q', label: 'Quality' }, { key: 'co', label: 'Compliance' }, { key: 's', label: 'Score', align: 'right' }, { key: 'r', label: 'Rating' }],
            rows: [...scored].sort((a, b) => b.score - a.score).map(s => ({ n: s.name, sp: s.spend.toFixed(1), c: s.contracts, ot: { bar: s.onTime, tone: s.onTime < 75 ? 'red' : 'green' }, q: { bar: s.quality, tone: 'cyan' }, co: { bar: s.compliance, tone: 'violet' }, s: s.score, r: s.score >= 88 ? { pill: 'Preferred', tone: 'green' } : s.score >= 80 ? { pill: 'Satisfactory', tone: 'blue' } : s.score >= 72 ? { pill: 'Monitor', tone: 'amber' } : { pill: 'Watchlist', tone: 'red' } })) },
        ],
      ],
    };
  });

  // ── 10 Emergency & Direct Procurement ──
  register(K(10), () => {
    const mins = Object.keys(PSPEND);
    const cases = [
      ['EMG-26-0311', 'Water', 'Borehole rehabilitation, Tsabong', 'Tlotlo Civil Works', 6.8, 'Drought', 'Post-facto'],
      ['EMG-26-0287', 'Health', 'Oxygen plant repairs, Maun', 'Okavango Medical Supplies', 4.2, 'Equipment failure', 'Approved'],
      ['EMG-26-0342', 'Transport', 'Bridge repair, Mahalapye', 'Mmila Road Contractors', 6.2, 'Flood damage', 'Approved'],
      ['DIR-26-0027', 'Health', 'Security guarding, 6 clinics', 'Lesedi Security Services', 5.2, 'Sole provider claim', 'Queried'],
      ['EMG-26-0356', 'Health', 'Cholera response consumables', 'Naledi Pharmaceuticals', 3.1, 'Outbreak', 'Approved'],
      ['EMG-26-0369', 'Water', 'Pipeline burst, Selebi-Phikwe', 'Motswedi Construction', 2.9, 'Infrastructure failure', 'Post-facto'],
      ['DIR-26-0031', 'ICT', 'Licence renewal (proprietary)', 'Chobe ICT Solutions', 1.6, 'Proprietary', 'Approved'],
    ];
    return {
      crumbs: [...crumbs, 'Emergency & direct'],
      kpis: [
        { label: 'Emergency share', value: '7.2%', delta: 'target < 5%', deltaTone: 'red', sub: 'of procurement spend', tone: 'red', pct: 72 },
        { label: 'Emergency value', value: 'BWP 58.5M', delta: '▲ 2.1M vs Aug', deltaTone: 'red', sub: '146 transactions', tone: 'orange' },
        { label: 'Direct procurement', value: '9.0%', delta: 'BWP 73.1M', sub: 'single source', tone: 'amber', pct: 90 },
        { label: 'Post-facto approvals', value: '31', delta: '21% of emergencies', deltaTone: 'red', sub: 'approved after purchase', tone: 'violet', pct: 21 },
        { label: 'Adequately justified', value: '68%', sub: 'audit sample of 60', tone: 'cyan', pct: 68 },
      ],
      insight: { finding: 'Emergency procurement is <b>7.2%</b> of spend against a 5% ceiling and has risen for six consecutive months. Water (10.6%) and Health (9.8%) are the main contributors, and 31 emergency purchases were approved only after the goods were bought.', recommendation: 'Require PPADB notification within 48 hours of any emergency award and review all post-facto approvals above BWP 1M with Internal Audit.', severity: 'High', tone: 'red', actions: ['Explain finding', 'Refer to audit', 'Create task'] },
      grid: [
        [
          { span: 8, type: 'line', title: 'Emergency and direct procurement share by month (%)', height: 270, categories: H, gridOpt: { right: 60 },
            series: [{ name: 'Emergency %', data: EMERG_PCT, color: 'red', area: true, markLine: { value: 5, label: 'Ceiling 5%', tone: 'amber' } }, { name: 'Direct %', data: [8.4, 8.7, 9.1, 8.9, 9.2, 9.6], color: 'amber' }] },
          { span: 4, type: 'donut', title: 'Emergency justification cited', height: 270, center: '146', items: [{ name: 'Equipment failure', value: 41 }, { name: 'Outbreak / health', value: 29 }, { name: 'Flood / drought', value: 26 }, { name: 'Late planning', value: 33, color: 'red' }, { name: 'Other', value: 17, color: 'slate' }] },
        ],
        [
          { span: 5, type: 'bar', title: 'Method mix by ministry (% of spend)', height: 270, horizontal: true, categories: mins,
            series: [{ name: 'Emergency', stack: 'e', color: 'red', data: mins.map(m => EMERG_MIN[m]) }, { name: 'Direct', stack: 'e', color: 'amber', data: mins.map(m => DIRECT_MIN[m]) }, { name: 'Competitive', stack: 'e', color: '#1E3A5F', data: mins.map(m => +(100 - EMERG_MIN[m] - DIRECT_MIN[m]).toFixed(1)) }], max: 100 },
          { span: 7, type: 'table', title: 'Largest emergency and direct awards', height: 270,
            columns: [{ key: 'ref', label: 'Ref' }, { key: 'desc', label: 'Purpose', nowrap: false }, { key: 'sup', label: 'Supplier' }, { key: 'amt', label: 'BWP M', align: 'right' }, { key: 'st', label: 'Approval' }],
            rows: cases.map(([ref, min, desc, sup, amt, why, st]) => ({ ref, desc: `${min} | ${desc}`, sup, amt: amt.toFixed(1), st: { pill: st, tone: st === 'Approved' ? 'green' : st === 'Queried' ? 'amber' : 'red' } })) },
        ],
      ],
    };
  });

  // ── 11 Savings & Anomalies ──
  register(K(11), () => {
    const items = ['A4 paper (box)', 'Toner cartridge', 'Office chair', 'Laptop (std)', 'Diesel (litre)', 'Surgical gloves (box)', 'Cement (50kg)', 'Paracetamol 500mg (1000)', 'Desk (framework)', 'Tyres 195/65'];
    const xy = [[-8, 2], [4, 14], [-2, -6], [11, 41], [16, 8], [7, 27], [-11, -11], [14, 36], [1, -2], [9, 19]];
    const pts = items.map((name, i) => { const [x, y] = xy[i]; return { name, x, y, tone: y > 25 ? 'red' : y > 10 ? 'amber' : 'green', size: 10 + (i % 4) * 3 }; });
    return {
      crumbs: [...crumbs, 'Savings'],
      kpis: [
        { label: 'Savings achieved', value: 'BWP 38.4M', delta: '▲ 12% vs LY', sub: 'vs pre-tender estimates', tone: 'green' },
        { label: 'Savings rate', value: '7.9%', sub: 'of award value', tone: 'cyan', pct: 79 },
        { label: 'Price anomalies', value: '57', delta: '> 25% over benchmark', deltaTone: 'red', sub: '', tone: 'red' },
        { label: 'Value at risk', value: 'BWP 6.2M', sub: 'overpricing + duplicates', tone: 'orange', pct: 16 },
        { label: 'Framework coverage', value: '31%', delta: 'target 45%', deltaTone: 'amber', sub: 'common-use items', tone: 'violet', pct: 31 },
      ],
      insight: { finding: 'Competitive tendering saved <b>BWP 38.4M</b> against estimates, led by the furniture framework (Clement Pty Ltd bid BWP 4,000 against 7,000 and 9,000). But 57 purchases paid more than 25% above benchmark; laptops bought through quotations cost <b>41%</b> more than the ICT framework price.', recommendation: 'Make the ICT and furniture frameworks mandatory for all ministries and block off-framework purchase orders above benchmark.', severity: 'Medium', tone: 'amber' },
      grid: [
        [
          { span: 7, type: 'waterfall', title: 'Estimate to award bridge (BWP M)', height: 280, min: 420, upTone: 'red', downTone: 'green',
            steps: [{ name: 'Estimate', value: 524.4, total: true }, { name: 'Open tender', value: -21.6 }, { name: 'Selective', value: -6.1 }, { name: 'Quotations', value: -8.3 }, { name: 'Frameworks', value: -5.9 }, { name: 'Direct', value: 2.3 }, { name: 'Emergency', value: 1.2 }, { name: 'Awarded', value: 486.0, total: true }] },
          { span: 5, type: 'scatter', title: 'Unit price vs benchmark | items (% above)', height: 280, xName: 'Price change vs LY %', yName: '% above benchmark', xMin: -15, xMax: 30, yMin: -15, yMax: 45, labels: true, points: pts },
        ],
        [
          { span: 5, type: 'bar', title: 'Savings rate by method (%)', height: 250, categories: ['Open tender', 'Frameworks', 'Quotations', 'Selective', 'Direct', 'Emergency'],
            series: [{ name: 'Savings %', label: true, data: [9.8, 12.4, 6.1, 5.9, -2.8, -1.9].map(v => ({ value: v, itemStyle: { color: v < 0 ? C.red : v > 9 ? C.green : C.blue } })) }] },
          { span: 7, type: 'list', title: 'Anomalies detected', height: 250, items: [
            { title: 'Laptops 41% above ICT framework price', meta: '38 units · Education · Chobe ICT Solutions', value: 'BWP 412K', tone: 'red' },
            { title: 'Split purchase below threshold', meta: '4 POs to Serowe Hardware in 6 days', value: 'BWP 396K', tone: 'red' },
            { title: 'Paracetamol 36% above central medical stores', meta: 'Naledi Pharmaceuticals · 3 clinics', value: 'BWP 188K', tone: 'orange' },
            { title: 'Duplicate invoice INV-7781', meta: 'Mokgosi Logistics · caught before payment', value: 'BWP 58K', tone: 'orange' },
            { title: 'Round-sum consultancy award', meta: 'Thari Consulting · no BOQ', value: 'BWP 500K', tone: 'amber' },
            { title: 'Surgical gloves 27% above benchmark', meta: 'Okavango Medical Supplies', value: 'BWP 94K', tone: 'amber' },
          ] },
        ],
      ],
    };
  });
})();
