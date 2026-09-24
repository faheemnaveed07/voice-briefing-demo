/* Menu 7: Procurement Oversight & Audit (menu index 6). Output: "Procurement Risk & Compliance Dashboard".
 * The 11 audit checks come from the brief (modules.procurement_audit). Anchors shared with other screens:
 *   procurement compliance 93% | split purchase: 4 POs to Serowe Hardware in 6 days, BWP 396,000 |
 *   duplicate invoice INV-7781, Mokgosi Logistics, BWP 58,300 | invoice before GRN, Okavango Medical Supplies, BWP 146,900 |
 *   payment without documents PV-26-44812, Lesedi Security Services, BWP 1,240,000.
 */
(function () {
  const { register, fmt, rng, C } = DASH;
  const { MONTHS, MONTH_NOW, MINISTRIES, PROJECTS, OFFICERS } = DASH.data;
  const K = n => `6-${n}`;
  const crumbs = ['All Ministries', 'Procurement oversight'];
  const H = MONTHS.slice(0, MONTH_NOW);
  const money = v => 'BWP ' + Math.round(v).toLocaleString('en-GB');
  const MIN = MINISTRIES.map(m => m.name);

  // ── the 11 audit checks: [short name, question from the brief, pass rate %, exceptions] ──
  const CHECKS = [
    ['Competition required', 'Was competition required?', 94.9, 31],
    ['Min quotations', 'Minimum quotation / tender requirements satisfied?', 86.5, 64],
    ['Approvals obtained', 'Approvals obtained?', 93.1, 38],
    ['Criteria unchanged', 'Evaluation criteria changed?', 98.1, 7],
    ['Scoring per criteria', 'Scoring followed approved criteria?', 92.1, 12],
    ['Conflicts declared', 'Conflicts declared?', 89.2, 14],
    ['Award = contract', 'Contract value differs materially from award value?', 91.8, 23],
    ['Variations in limit', 'Variations excessive?', 88.4, 11],
    ['No split purchases', 'Purchase split into smaller transactions?', 97.1, 21],
    ['Invoice after GRN', 'Invoice raised before delivery?', 94.2, 63],
    ['Payment documented', 'Payment without supporting documentation?', 99.6, 41],
  ];
  const TOTAL_EXC = CHECKS.reduce((s, c) => s + c[3], 0);
  const MIN_OFF = { Health: -3.1, Education: 1.4, Transport: -2.2, Agriculture: -0.8, Defence: 2.1, Water: -3.8, Energy: 1.0, ICT: 0.6 };

  // ── 0 Compliance Scorecard ──
  register(K(0), () => {
    const r = rng('ovs');
    const values = [];
    MIN.forEach((m, y) => CHECKS.forEach((c, x) => values.push([x, y, Math.min(100, Math.round(c[2] + MIN_OFF[m] + r.num(-2.5, 2.5)))])));
    return {
      crumbs,
      kpis: [
        { label: 'Procurement compliance', value: '93%', delta: '▲ 1 pt vs Q1', sub: 'average of 11 checks', tone: 'green', pct: 93 },
        { label: 'Transactions tested', value: '18,420', sub: 'tenders, POs, invoices, PVs', tone: 'blue' },
        { label: 'Exceptions raised', value: String(TOTAL_EXC), delta: '▲ 22 this month', deltaTone: 'red', sub: 'across 11 checks', tone: 'amber' },
        { label: 'High-risk exceptions', value: '37', delta: 'BWP 9.8M', deltaTone: 'red', sub: 'referred to audit', tone: 'red' },
        { label: 'Lowest check', value: 'Min quotations', delta: '86.5%', deltaTone: 'red', sub: '64 purchases < 3 quotes', tone: 'orange', pct: 86 },
      ],
      insight: { finding: 'Overall procurement compliance is <b>93%</b>. The weakest checks are minimum quotations (86.5%), excessive variations (88.4%) and conflict declarations (89.2%). Water and Health score lowest on 8 of 11 checks.', recommendation: 'Focus the Q3 internal audit plan on Water and Health quotation files and require declarations before any evaluation panel sits.', severity: 'Medium', tone: 'amber', actions: ['Explain finding', 'Open audit plan', 'Create task'] },
      grid: [
        [
          { span: 5, type: 'radar', title: 'Compliance scorecard | 11 audit checks (%)', height: 300, indicators: CHECKS.map(c => ({ name: c[0], min: 70, max: 100 })),
            series: [{ name: 'FY 2026-27', values: CHECKS.map(c => c[2]), color: 'blue' }, { name: 'FY 2025-26', values: CHECKS.map((c, i) => +(c[2] - [1.2, 2.4, -0.8, 0.5, 1.6, 3.1, 0.9, 1.8, -0.4, 2.2, 0.3][i]).toFixed(1)), color: 'amber' }] },
          { span: 7, type: 'bar', title: 'Pass rate by check (%) and exceptions raised', height: 300, horizontal: true, categories: CHECKS.map(c => c[0]), labelMax: 22, gridOpt: { right: 36 },
            series: [{ name: 'Pass rate %', label: true, data: CHECKS.map(c => ({ value: c[2], itemStyle: { color: c[2] >= 95 ? C.green : c[2] >= 90 ? C.blue : C.amber } })) }], max: 100 },
        ],
        [
          { span: 8, type: 'heatmap', title: 'Pass rate % | ministry × audit check', height: 320, x: CHECKS.map(c => c[0]), y: MIN, values, min: 80, max: 100, rotate: 25, colors: ['#EF4444', '#F59E0B', '#1D4ED8', '#10B981'], cellFmt: v => v, valueFmt: v => v + '%' },
          { span: 4, type: 'list', title: 'Top breaches this month', height: 320, items: [
            { title: 'Payment without documents', meta: 'PV-26-44812 · Lesedi Security Services', value: 'BWP 1.24M', tone: 'red' },
            { title: 'Split purchase', meta: '4 POs · Serowe Hardware · 6 days', value: 'BWP 396K', tone: 'red' },
            { title: 'Invoice before GRN', meta: 'Okavango Medical Supplies', value: 'BWP 147K', tone: 'orange' },
            { title: 'Duplicate invoice INV-7781', meta: 'Mokgosi Logistics', value: 'BWP 58K', tone: 'orange' },
            { title: 'Undeclared director link', meta: 'Evaluator on MWS/TEN/0207', value: 'BWP 27.5M', tone: 'orange' },
            { title: 'Variations above 15%', meta: 'Kazungula Link Road · Mmila Road', value: '+16.8%', tone: 'amber' },
          ] },
        ],
      ],
    };
  });

  // ── 1 Competition & Fairness ──
  register(K(1), () => ({
    crumbs: [...crumbs, 'Competition'],
    kpis: [
      { label: 'Competitive by value', value: '83.8%', delta: '▼ 1.9 pts', sub: 'open, selective, quotations', tone: 'blue', pct: 84 },
      { label: 'Avg bidders per tender', value: '4.3', delta: 'target ≥ 5', deltaTone: 'amber', sub: '184 tenders', tone: 'cyan', pct: 62 },
      { label: 'Single-bid tenders', value: '14%', delta: '26 tenders', deltaTone: 'red', sub: 'BWP 71.2M awarded', tone: 'red', pct: 14 },
      { label: 'Below min quotations', value: '64', delta: '< 3 quotes', deltaTone: 'red', sub: 'BWP 8.9M', tone: 'orange' },
      { label: 'Short advert periods', value: '19', sub: '< 21 days open tender', tone: 'amber' },
    ],
    insight: { finding: '<b>26 tenders (14%)</b> received a single bid, and 11 of them had advert periods shorter than the 21-day minimum. Single-bid awards cluster in ICT and security services, where the same supplier won 4 of 5 times.', recommendation: 'Re-advertise single-bid tenders above BWP 2M with a full 21-day window and publish all adverts on the e-procurement portal.', severity: 'High', tone: 'orange' },
    grid: [
      [
        { span: 5, type: 'bar', title: 'Tenders by number of bids received', height: 270, categories: ['1 bid', '2', '3', '4', '5', '6–8', '9+'],
          series: [{ name: 'Tenders', label: true, data: [[26, C.red], [22, C.orange], [31, C.amber], [34, C.blue], [29, C.blue], [30, C.green], [12, C.green]].map(([value, color]) => ({ value, itemStyle: { color } })) }] },
        { span: 7, type: 'line', title: 'Competition trend | single-bid rate and average bidders', height: 270, categories: H, y2: 'Bidders', gridOpt: { top: 50 },
          series: [{ name: 'Single-bid tenders %', data: [11, 12, 13, 14, 15, 17], color: 'red', area: true }, { name: 'Avg bidders', axis: 1, data: [4.8, 4.6, 4.4, 4.3, 4.1, 3.9], color: 'cyan' }] },
      ],
      [
        { span: 8, type: 'table', title: 'Tenders failing competition requirements', height: 270,
          columns: [{ key: 'ref', label: 'Tender / RFQ' }, { key: 'desc', label: 'Description', nowrap: false }, { key: 'b', label: 'Bids', align: 'right' }, { key: 'amt', label: 'Value (M)', align: 'right' }, { key: 'iss', label: 'Issue' }],
          rows: [
            ['MICT/TEN/0049/26-27', 'Data centre cooling', 1, 9.8, 'Single bid', 'red'],
            ['MOH/DIR/0027/26-27', 'Security guarding, 6 clinics', 1, 5.2, 'Direct, no justification', 'red'],
            ['MOA/QUO/0877/26-27', 'Farm fencing materials', 2, 0.38, '2 quotes only', 'orange'],
            ['MWS/TEN/0212/26-27', 'Pump station spares', 1, 3.1, 'Advert 14 days', 'orange'],
            ['MOH/QUO/1210/26-27', 'Lab reagents', 2, 0.29, '2 quotes only', 'orange'],
            ['MOE/TEN/0318/26-27', 'School transport hire', 2, 4.6, 'Restrictive spec', 'amber'],
            ['MOT/QUO/0654/26-27', 'Road signage', 1, 0.44, 'Single quote', 'red'],
          ].map(([ref, desc, b, amt, iss, t]) => ({ ref, desc, b, amt: amt.toFixed(2), iss: { pill: iss, tone: t } })) },
        { span: 4, type: 'gauge', title: 'Competition checks', height: 270, gauges: [{ name: 'Competition used', value: 94.9, good: 95, warn: 90 }, { name: 'Min quotations', value: 86.5, good: 95, warn: 85 }] },
      ],
    ],
  }));

  // ── 2 Approvals & Segregation of Duties ──
  register(K(2), () => {
    const steps = ['Raise requisition', 'Approve requisition', 'Create PO', 'Approve PO', 'Receive goods (GRN)', 'Approve payment'];
    const users = ['U-0412 · Dept D', 'U-0419 · Dept D', 'U-1188 · Water', 'U-2051 · Health', 'U-2207 · Health', 'U-3310 · Transport', 'U-4102 · ICT'];
    const m = [[42, 9, 38, 6, 0, 0], [0, 0, 41, 11, 7, 0], [18, 0, 22, 0, 14, 3], [0, 36, 0, 0, 0, 12], [27, 0, 27, 0, 8, 0], [0, 0, 15, 15, 0, 0], [12, 12, 0, 0, 0, 0]];
    const values = [];
    m.forEach((row, y) => row.forEach((v, x) => values.push([x, y, v])));
    return {
      crumbs: [...crumbs, 'Approvals & SoD'],
      kpis: [
        { label: 'Approvals obtained', value: '93.1%', delta: 'target 100%', deltaTone: 'red', sub: 'required approvals on file', tone: 'green', pct: 93 },
        { label: 'Missing approvals', value: '38', delta: 'BWP 6.1M', deltaTone: 'red', sub: '', tone: 'red' },
        { label: 'SoD conflicts', value: '17', delta: '7 users', deltaTone: 'red', sub: 'same user, conflicting steps', tone: 'orange' },
        { label: 'Retrospective approvals', value: '29', sub: 'approved after PO issue', tone: 'amber' },
        { label: 'Beyond delegation', value: '11', sub: 'approver limit exceeded', tone: 'violet' },
      ],
      insight: { finding: 'User <b>U-0412 (Dept D)</b> raised, approved and created purchase orders for the same 9 requisitions worth BWP 612K. Together with U-0419, these accounts created 61 of the 144 POs raised without a requisition.', recommendation: 'Suspend PO approval rights for U-0412 pending review, and enforce role conflicts in IFMS so one user cannot both raise and approve.', severity: 'Critical', tone: 'red', actions: ['Explain finding', 'Suspend access', 'Refer to audit'] },
      grid: [
        [
          { span: 6, type: 'heatmap', title: 'Transactions per user per step | conflicts highlighted', height: 290, x: steps, y: users, values, min: 0, max: 45, rotate: 20, colors: ['#0b1830', '#1D4ED8', '#F59E0B', '#EF4444'], cellFmt: v => (v ? v : ''), valueFmt: v => v + ' transactions' },
          { span: 6, type: 'sankey', title: 'Approval routes | value of POs approved (BWP M)', height: 290,
            nodes: ['Head of Dept', 'Director', 'Permanent Secretary', 'Tender committee', 'Within delegation', 'Retrospective', 'Beyond delegation', 'No approval on file'],
            links: [
              { source: 'Head of Dept', target: 'Within delegation', value: 41 }, { source: 'Head of Dept', target: 'Beyond delegation', value: 2.4 }, { source: 'Head of Dept', target: 'Retrospective', value: 1.9 },
              { source: 'Director', target: 'Within delegation', value: 86 }, { source: 'Director', target: 'Retrospective', value: 3.2 }, { source: 'Director', target: 'Beyond delegation', value: 1.8 },
              { source: 'Permanent Secretary', target: 'Within delegation', value: 64 }, { source: 'Tender committee', target: 'Within delegation', value: 112 }, { source: 'Head of Dept', target: 'No approval on file', value: 6.1 },
            ] },
        ],
        [
          { span: 12, type: 'table', title: 'Segregation of duties violations', height: 260,
            columns: [{ key: 'ref', label: 'Transaction' }, { key: 'u', label: 'User' }, { key: 'c', label: 'Conflict' }, { key: 'amt', label: 'Value', align: 'right' }, { key: 'o', label: 'Reviewer' }, { key: 'st', label: 'Status' }],
            rows: [
              ['PO-26-51872', 'U-0412 · Dept D', 'Raised and approved requisition, created PO', 118400, 'Open'],
              ['PO-26-51903', 'U-0412 · Dept D', 'Raised and approved requisition, created PO', 96200, 'Open'],
              ['PV-26-44519', 'U-1188 · Water', 'Received goods and approved payment', 212000, 'Under review'],
              ['PO-26-50288', 'U-0419 · Dept D', 'Created and approved PO', 74600, 'Under review'],
              ['PV-26-44602', 'U-2051 · Health', 'Approved requisition and payment', 138900, 'Open'],
              ['PO-26-49911', 'U-3310 · Transport', 'Created and approved PO', 188000, 'Closed, justified'],
              ['REQ-26-30211', 'U-4102 · ICT', 'Raised and approved own requisition', 42300, 'Closed, justified'],
            ].map(([ref, u, c, amt, st], i) => ({ ref, u: { strong: u }, c, amt: money(amt), o: OFFICERS[[8, 2, 5][i % 3]], st: { pill: st, tone: st === 'Open' ? 'red' : st === 'Under review' ? 'amber' : 'green' } })) },
        ],
      ],
    };
  });

  // ── 3 Evaluation Criteria Changes ──
  register(K(3), () => {
    const crit = ['Technical capacity', 'Experience', 'Methodology', 'Price', 'Local content & delivery'];
    return {
      crumbs: [...crumbs, 'Evaluation'],
      kpis: [
        { label: 'Tenders evaluated', value: '120', sub: 'Apr–Sep', tone: 'blue' },
        { label: 'Criteria changed', value: '7', delta: 'after bid opening', deltaTone: 'red', sub: 'BWP 94.1M', tone: 'red' },
        { label: 'Scoring deviations', value: '12', sub: 'scores not per approved criteria', tone: 'orange' },
        { label: 'Evaluator outliers', value: '9', sub: '> 2 SD from panel mean', tone: 'amber' },
        { label: 'Criteria unchanged', value: '98.1%', delta: 'check pass rate', sub: '', tone: 'green', pct: 98 },
      ],
      insight: { finding: 'On <b>MICT/TEN/0056</b> (Government WAN upgrade, BWP 21M) the price weighting was raised from 20% to 40% after bids were opened, which moved the ranking from bidder B to bidder A. Evaluator 4 also scored bidder A 31 points above the panel mean.', recommendation: 'Suspend the MICT/TEN/0056 award, order a re-evaluation against the originally approved criteria, and replace Evaluator 4 on the panel.', severity: 'Critical', tone: 'red', actions: ['Explain finding', 'Suspend award', 'Refer to PPADB'] },
      grid: [
        [
          { span: 5, type: 'radar', title: 'MICT/TEN/0056 | approved vs applied weights (%)', height: 310, indicators: crit.map(name => ({ name, max: 45 })),
            series: [{ name: 'Approved in bid document', values: [30, 20, 20, 20, 10], color: 'blue' }, { name: 'Applied at evaluation', values: [20, 15, 15, 40, 10], color: 'red' }] },
          { span: 7, type: 'bar', title: 'MICT/TEN/0056 | technical score by evaluator (out of 100)', height: 310, categories: ['Evaluator 1', 'Evaluator 2', 'Evaluator 3', 'Evaluator 4', 'Evaluator 5'],
            series: [{ name: 'Bidder A', data: [58, 61, 55, 92, 60], color: 'red' }, { name: 'Bidder B', data: [74, 71, 77, 63, 72], color: 'blue' }, { name: 'Bidder C', data: [66, 64, 69, 58, 67], color: 'cyan' }] },
        ],
        [
          { span: 12, type: 'table', title: 'Evaluation criteria change log', height: 270,
            columns: [{ key: 'ref', label: 'Tender' }, { key: 'c', label: 'Change', nowrap: false }, { key: 'when', label: 'When' }, { key: 'eff', label: 'Effect on ranking' }, { key: 'by', label: 'Approved by' }, { key: 'st', label: 'Status' }],
            rows: [
              ['MICT/TEN/0056/26-27', 'Price weight 20% → 40%', 'After opening', 'Rank 2 → 1', 'Not approved', 'red'],
              ['MWS/TEN/0207/26-27', 'Experience threshold 5 → 3 years', 'After opening', 'New bidder qualified', 'Tender committee', 'orange'],
              ['MOH/TEN/0388/26-27', 'Added site-visit criterion', 'After opening', 'No change', 'Tender committee', 'amber'],
              ['MOD/TEN/0092/26-27', 'Local content weight 5% → 10%', 'After opening', 'Rank 3 → 2', 'Not approved', 'red'],
              ['MOE/TEN/0318/26-27', 'Fleet age limit removed', 'Before opening (addendum)', 'n/a', 'Addendum 2', 'green'],
              ['MCP/DES/2283/26-27-01', 'No change | scored per approved criteria', 'n/a', 'Clement 0.88 confirmed', 'n/a', 'green'],
              ['MOA/TEN/0131/26-27', 'Methodology sub-criteria re-weighted', 'After opening', 'No change', 'Not approved', 'orange'],
            ].map(([ref, c, when, eff, by, t]) => ({ ref, c, when, eff, by, st: { pill: t === 'red' ? 'Re-evaluate' : t === 'orange' ? 'Under review' : t === 'amber' ? 'Noted' : 'Compliant', tone: t } })) },
        ],
      ],
    };
  });

  // ── 4 Conflicts of Interest ──
  register(K(4), () => ({
    crumbs: [...crumbs, 'Conflicts of interest'],
    kpis: [
      { label: 'Declarations due', value: '1,120', sub: 'panel members + approvers', tone: 'blue' },
      { label: 'Declarations filed', value: '89.2%', delta: '121 missing', deltaTone: 'red', sub: '', tone: 'amber', pct: 89 },
      { label: 'Undeclared matches', value: '14', delta: 'data-matched', deltaTone: 'red', sub: 'officer ↔ supplier', tone: 'red' },
      { label: 'Related-party awards', value: 'BWP 22.4M', sub: '9 contracts', tone: 'orange' },
      { label: 'Cases referred', value: '5', sub: 'DCEC / internal audit', tone: 'violet' },
    ],
    insight: { finding: 'Data matching of the companies register against the payroll found <b>14 undeclared links</b> between procurement officers and suppliers. An evaluator on <b>MWS/TEN/0207</b> (BWP 27.5M) shares a residential address with a director of Motswedi Construction, one of the bidders.', recommendation: 'Remove the evaluator from the MWS/TEN/0207 panel, re-run the technical evaluation and refer the matter to the DCEC.', severity: 'Critical', tone: 'red', actions: ['Explain finding', 'Refer to DCEC', 'Create task'] },
    grid: [
      [
        { span: 7, type: 'sankey', title: 'Officer → related company → award (BWP M)', height: 290,
          nodes: ['Officer 2207 · Water', 'Officer 0412 · Dept D', 'Officer 3310 · Transport', 'Officer 1188 · Water', 'Motswedi Construction', 'Serowe Hardware', 'Mmila Road Contractors', 'Tswelelo Supplies', 'S-Phikwe pipeline', 'Agric supplies POs', 'A1 resealing', 'Borehole spares'],
          links: [
            { source: 'Officer 2207 · Water', target: 'Motswedi Construction', value: 14.1 }, { source: 'Officer 0412 · Dept D', target: 'Serowe Hardware', value: 1.9 }, { source: 'Officer 3310 · Transport', target: 'Mmila Road Contractors', value: 4.8 }, { source: 'Officer 1188 · Water', target: 'Tswelelo Supplies', value: 1.6 },
            { source: 'Motswedi Construction', target: 'S-Phikwe pipeline', value: 14.1 }, { source: 'Serowe Hardware', target: 'Agric supplies POs', value: 1.9 }, { source: 'Mmila Road Contractors', target: 'A1 resealing', value: 4.8 }, { source: 'Tswelelo Supplies', target: 'Borehole spares', value: 1.6 },
          ] },
        { span: 5, type: 'donut', title: 'How undeclared links were found', height: 290, center: '14', items: [{ name: 'Shared director', value: 5 }, { name: 'Same address', value: 3 }, { name: 'Same bank account', value: 2, color: 'red' }, { name: 'Spouse / relative', value: 3, color: 'violet' }, { name: 'Same phone', value: 1, color: 'amber' }] },
      ],
      [
        { span: 8, type: 'table', title: 'Conflict of interest matches', height: 260,
          columns: [{ key: 'o', label: 'Officer' }, { key: 's', label: 'Supplier' }, { key: 'l', label: 'Link' }, { key: 'v', label: 'Awards (BWP)', align: 'right' }, { key: 'd', label: 'Declared?' }],
          rows: [
            ['Officer 2207 · Water (evaluator)', 'Motswedi Construction', 'Same residential address', 14100000, 'No'],
            ['Officer 3310 · Transport (approver)', 'Mmila Road Contractors', 'Spouse is shareholder', 4800000, 'No'],
            ['Officer 0412 · Dept D (buyer)', 'Serowe Hardware', 'Brother is director', 1900000, 'No'],
            ['Officer 1188 · Water (stores)', 'Tswelelo Supplies', 'Same bank account', 1600000, 'No'],
            ['Officer 4102 · ICT (evaluator)', 'Chobe ICT Solutions', 'Former employee (< 2 yrs)', 9800000, 'Yes, late'],
            ['Officer 2051 · Health (approver)', 'Boitumelo Catering', 'Shared director', 420000, 'Yes'],
          ].map(([o, s, l, v, d]) => ({ o, s: { strong: s }, l, v: fmt.n(v), d: { pill: d, tone: d === 'No' ? 'red' : d === 'Yes' ? 'green' : 'amber' } })) },
        { span: 4, type: 'gauge', title: 'Declaration completion', height: 260, gauges: [{ name: 'Evaluation panels', value: 94, good: 98, warn: 90 }, { name: 'Approvers', value: 84, good: 98, warn: 90 }] },
      ],
    ],
  }));

  // ── 5 Award vs Contract Value ──
  const AVC = [
    ['A1 resealing, Palapye–Serule', 64.0, 64.0], ['Maun hospital wing fit-out', 22.6, 24.1], ['Kazungula drainage', 38.0, 38.4], ['Data centre cooling', 9.8, 13.9],
    ['Selebi-Phikwe pipeline lot 2', 14.1, 16.8], ['Police housing block C', 29.4, 29.4], ['Abattoir chillers', 7.4, 7.9], ['Security guarding, 6 clinics', 5.2, 7.4],
    ['Furniture framework (MCP/DES/2283)', 4.0, 4.0], ['School lab equipment', 14.3, 14.1], ['Tsabong water phase 1', 27.5, 29.3], ['Hukuntsi mini-grid', 18.2, 18.2],
    ['Clinic, Molepolole', 25.0, 25.0], ['Road signage', 0.44, 0.61], ['Cleaning services', 12.0, 12.6], ['Letlhakane substation', 21.0, 21.0],
  ].map(([name, a, c]) => ({ name, a, c, d: ((c - a) / a) * 100 }));
  register(K(5), () => ({
    crumbs: [...crumbs, 'Award vs contract'],
    kpis: [
      { label: 'Contracts compared', value: '412', sub: 'award letter vs signed contract', tone: 'blue' },
      { label: 'Material differences', value: '23', delta: '> 10% of award', deltaTone: 'red', sub: '5.6% of contracts', tone: 'red', pct: 6 },
      { label: 'Value uplift', value: 'BWP 31.7M', delta: 'contract above award', deltaTone: 'red', sub: '', tone: 'orange' },
      { label: 'Average difference', value: '+3.1%', sub: 'all contracts', tone: 'amber' },
      { label: 'Largest uplift', value: '+42%', delta: 'Data centre cooling', deltaTone: 'red', sub: 'Chobe ICT Solutions', tone: 'violet' },
    ],
    insight: { finding: 'The data centre cooling contract was signed at <b>BWP 13.9M</b>, 42% above the BWP 9.8M award to Chobe ICT Solutions, without a fresh tender committee decision. Security guarding for 6 clinics (Lesedi Security Services) was signed 42% above award after 2 sites were added.', recommendation: 'Require tender committee re-approval for any contract signed more than 10% above the award value, and recover or regularise the BWP 31.7M uplift.', severity: 'High', tone: 'orange' },
    grid: [
      [
        { span: 7, type: 'scatter', title: 'Award value vs contract value (BWP M) | on the line = equal', height: 290, xName: 'Award value', yName: 'Contract value', xMin: 0, xMax: 70, yMin: 0, yMax: 70, diagonal: true, labels: false,
          points: AVC.map(p => ({ name: p.name, x: p.a, y: +p.c.toFixed(1), size: 10 + Math.min(14, Math.abs(p.d)), tone: p.d > 10 ? 'red' : p.d > 3 ? 'amber' : 'green' })) },
        { span: 5, type: 'bar', title: 'Contracts by difference band', height: 290, categories: ['< −5%', '−5–0%', '0%', '0–5%', '5–10%', '10–25%', '> 25%'],
          series: [{ name: 'Contracts', label: true, data: [[6, C.cyan], [18, C.blue], [291, C.green], [51, C.blue], [23, C.amber], [17, C.orange], [6, C.red]].map(([value, color]) => ({ value, itemStyle: { color } })) }] },
      ],
      [
        { span: 12, type: 'table', title: 'Award vs contract value | largest differences', height: 260,
          columns: [{ key: 'name', label: 'Contract' }, { key: 'a', label: 'Award (M)', align: 'right' }, { key: 'c', label: 'Signed (M)', align: 'right' }, { key: 'd', label: 'Difference' }, { key: 'st', label: 'Re-approval' }],
          rows: [...AVC].sort((x, y) => Math.abs(y.d) - Math.abs(x.d)).map(p => ({ name: p.name, a: p.a.toFixed(2), c: p.c.toFixed(2), d: { bar: Math.min(100, Math.abs(p.d) * 2), text: (p.d >= 0 ? '+' : '−') + Math.abs(p.d).toFixed(1) + '%', tone: p.d > 10 ? 'red' : p.d > 3 ? 'amber' : 'green' }, st: p.d > 10 ? { pill: 'Missing', tone: 'red' } : p.d > 3 ? { pill: 'Pending', tone: 'amber' } : { pill: 'Not required', tone: 'green' } })) },
      ],
    ],
  }));

  // ── 6 Variation Orders ──
  register(K(6), () => {
    const pv = PROJECTS.map(p => { const vp = (p.variationValue / p.approved) * 100; return { ...p, vp, vos: Math.max(p.variations, Math.ceil(vp / 5)) }; }).sort((a, b) => b.vp - a.vp);
    const count = pv.reduce((s, p) => s + p.vos, 0);
    const value = PROJECTS.reduce((s, p) => s + p.variationValue, 0);
    const over = pv.filter(p => p.vp > 15).length;
    const avg = (value / PROJECTS.reduce((s, p) => s + p.approved, 0)) * 100;
    return {
      crumbs: [...crumbs, 'Variations'],
      kpis: [
        { label: 'Variation orders', value: String(count), sub: `${PROJECTS.length} capital contracts`, tone: 'blue' },
        { label: 'Variation value', value: fmt.bwp(value), sub: 'cumulative', tone: 'violet' },
        { label: 'Average variation', value: fmt.pct(avg, 1), sub: 'of original contract', tone: 'amber', pct: avg * 4 },
        { label: 'Contracts > 15%', value: String(over), delta: 'PPADB limit', deltaTone: 'red', sub: 'need fresh approval', tone: 'red' },
        { label: 'Unapproved variations', value: '6', sub: 'works instructed first', tone: 'orange' },
      ],
      insight: { finding: `<b>${over} contracts</b> have cumulative variations above the 15% limit, led by <b>${pv[0].name}</b> at ${pv[0].vp.toFixed(1)}%. Six variations were instructed on site before approval, all on works contracts.`, recommendation: 'Freeze further variations on contracts above 15% until the tender committee approves, and require quantity surveyor sign-off before site instructions.', severity: 'High', tone: 'orange' },
      grid: [
        [
          { span: 7, type: 'bar', title: 'Cumulative variation % by contract', height: 290, categories: pv.map(p => p.name), rotate: 35, labelMax: 16, gridOpt: { right: 50 },
            series: [{ name: 'Variation %', data: pv.map(p => ({ value: +p.vp.toFixed(1), itemStyle: { color: p.vp > 15 ? C.red : p.vp > 10 ? C.amber : C.blue } })), markLine: { value: 15, label: 'Limit 15%', tone: 'red' } }] },
          { span: 5, type: 'donut', title: 'Variation reasons (by value)', height: 290, items: [{ name: 'Design changes', value: 34 }, { name: 'Unforeseen ground conditions', value: 22 }, { name: 'Scope additions', value: 19, color: 'violet' }, { name: 'Price escalation', value: 15, color: 'amber' }, { name: 'Omissions in BOQ', value: 10, color: 'red' }] },
        ],
        [
          { span: 5, type: 'bar', title: 'Variations approved per month', height: 250, categories: H, y2: 'Count', gridOpt: { top: 50 },
            series: [{ name: 'Value (BWP M)', data: [3.1, 4.4, 6.2, 5.8, 7.9, 9.4], color: 'violet' }, { name: 'Count', type: 'line', axis: 1, data: [5, 6, 9, 8, 11, 13], color: 'amber' }] },
          { span: 7, type: 'table', title: 'Contracts with highest variations', height: 250,
            columns: [{ key: 'n', label: 'Contract' }, { key: 'c', label: 'Contractor' }, { key: 'k', label: 'VOs', align: 'right' }, { key: 'v', label: 'Value', align: 'right' }, { key: 'p', label: '% of contract' }],
            rows: pv.slice(0, 8).map(p => ({ n: p.name, c: p.contractor, k: p.vos, v: fmt.bwp(p.variationValue), p: { bar: p.vp * 4, text: fmt.pct(p.vp, 1), tone: p.vp > 15 ? 'red' : p.vp > 10 ? 'amber' : 'blue' } })) },
        ],
      ],
    };
  });

  // ── 7 Split Purchases ──
  register(K(7), () => ({
    crumbs: [...crumbs, 'Split purchases'],
    kpis: [
      { label: 'Suspected splits', value: '21', sub: 'clusters of related POs', tone: 'red' },
      { label: 'Value in clusters', value: 'BWP 2.9M', sub: '86 purchase orders', tone: 'orange' },
      { label: 'Largest cluster', value: 'BWP 396K', delta: 'Serowe Hardware', deltaTone: 'red', sub: '4 POs in 6 days', tone: 'violet' },
      { label: 'POs just below limit', value: '3.4×', delta: 'expected share', deltaTone: 'red', sub: 'BWP 95–100K band', tone: 'amber' },
      { label: 'Check pass rate', value: '97.1%', sub: 'no split detected', tone: 'green', pct: 97 },
    ],
    insight: { finding: 'Ministry of Agriculture issued <b>4 purchase orders to Serowe Hardware within 6 days</b> for the same fencing materials, each just below the BWP 100,000 quotation limit, totalling <b>BWP 396,000</b>. Bought as one requirement, it would have needed a competitive tender.', recommendation: 'Treat the four POs as one procurement, refer the buyer (Officer 0412) to Internal Audit and add a 30-day same-supplier aggregation rule in IFMS.', severity: 'High', tone: 'red', actions: ['Explain finding', 'Refer to audit', 'Assign officer'] },
    grid: [
      [
        { span: 6, type: 'bar', title: 'Serowe Hardware cluster | POs by date (BWP)', height: 270, categories: ['08 Sep', '09 Sep', '10 Sep', '11 Sep', '12 Sep', '13 Sep'], gridOpt: { right: 70 },
          series: [{ name: 'PO value', label: true, labelFmt: p => (p.value ? fmt.n(p.value) : ''), data: [98500, 99200, 0, 99800, 0, 98500].map(value => ({ value, itemStyle: { color: C.orange } })), markLine: { value: 100000, label: 'Limit 100K', tone: 'red' } },
            { name: 'Running total', type: 'line', data: [98500, 197700, 197700, 297500, 297500, 396000], color: 'red' }] },
        { span: 6, type: 'bar', title: 'All POs by value band (BWP K) | bunching below limit', height: 270, categories: ['60–70', '70–80', '80–90', '90–95', '95–100', '100–110', '110–120', '120–130'],
          series: [{ name: 'POs', label: true, data: [212, 198, 176, 104, 356, 61, 88, 94].map((value, i) => ({ value, itemStyle: { color: i === 4 ? C.red : i === 3 ? C.amber : i >= 5 ? C.cyan : C.blue } })) }] },
      ],
      [
        { span: 8, type: 'table', title: 'Suspected split clusters', height: 260,
          columns: [{ key: 's', label: 'Supplier' }, { key: 'm', label: 'Ministry' }, { key: 'n', label: 'POs', align: 'right' }, { key: 'd', label: 'Days', align: 'right' }, { key: 'v', label: 'Total', align: 'right' }, { key: 'st', label: 'Status' }],
          rows: [
            ['Serowe Hardware', 'Agriculture', 4, 6, 396000, 'Referred', 'red'], ['Pula Office Solutions', 'Health', 5, 9, 412500, 'Under review', 'amber'], ['Makgadikgadi Fleet Services', 'Transport', 3, 4, 287400, 'Under review', 'amber'],
            ['Boitumelo Catering', 'Education', 6, 14, 318000, 'Open', 'red'], ['Tswelelo Supplies', 'Water', 3, 5, 294100, 'Open', 'red'], ['Mokgosi Logistics', 'Health', 4, 12, 226800, 'Justified', 'green'], ['Thari Consulting', 'ICT', 2, 3, 196000, 'Justified', 'green'],
          ].map(([s, m, n, d, v, st, t]) => ({ s: { strong: s }, m, n, d, v: money(v), st: { pill: st, tone: t } })) },
        { span: 4, type: 'list', title: 'Detection rules', height: 260, items: [
          { title: 'Same supplier, ≥ 2 POs in 30 days', meta: 'combined value above limit', tone: 'red', pill: 'Rule S1' },
          { title: 'Values within 5% below a limit', meta: 'quotation or tender threshold', tone: 'orange', pill: 'Rule S2' },
          { title: 'Same item code across POs', meta: 'from one requisitioner', tone: 'amber', pill: 'Rule S3' },
          { title: 'Sequential PO numbers', meta: 'same buyer, same supplier', tone: 'blue', pill: 'Rule S4' },
        ] },
      ],
    ],
  }));

  // ── 8 Invoice Before Delivery ──
  register(K(8), () => ({
    crumbs: [...crumbs, 'Invoice before delivery'],
    kpis: [
      { label: 'Invoices before GRN', value: '63', delta: '▲ 9 vs Aug', deltaTone: 'red', sub: 'Apr–Sep', tone: 'red' },
      { label: 'Value', value: 'BWP 4.8M', sub: '1.2% of invoices', tone: 'orange' },
      { label: 'Paid before GRN', value: '17', delta: 'BWP 1.3M', deltaTone: 'red', sub: 'at risk of non-delivery', tone: 'red' },
      { label: 'Avg lead', value: '9 days', sub: 'invoice ahead of GRN', tone: 'amber' },
      { label: 'Check pass rate', value: '94.2%', sub: 'invoice after delivery', tone: 'green', pct: 94 },
    ],
    insight: { finding: '<b>Okavango Medical Supplies</b> invoiced <b>BWP 146,900</b> for surgical consumables 12 days before any goods were received at Maun; payment was approved on the strength of the invoice alone. The supplier accounts for 11 of the 63 cases this year.', recommendation: 'Put the payment on hold until a GRN is posted, and block payment approval in IFMS where no GRN exists.', severity: 'High', tone: 'red', actions: ['Explain finding', 'Hold payment', 'Notify stores'] },
    grid: [
      [
        { span: 12, type: 'steps', title: 'Case trace | PO-26-50312 · Okavango Medical Supplies · BWP 146,900', steps: [
          { name: 'Purchase order', meta: 'PO-26-50312 · 18 Aug', state: 'done' }, { name: 'Invoice received', meta: 'INV-OMS-2204 · 02 Sep', state: 'done' }, { name: 'Payment approved', meta: 'PV-26-45077 · 05 Sep', state: 'late' },
          { name: 'Goods received (GRN)', meta: 'not posted · 14 Sep due', state: 'late' }, { name: '3-way match', meta: 'failed', state: 'late' }, { name: 'Payment released', meta: 'on hold', state: 'pending' },
        ] },
      ],
      [
        { span: 5, type: 'bar', title: 'Days invoice preceded GRN (cases)', height: 260, categories: ['1–3', '4–7', '8–14', '15–30', '> 30', 'No GRN yet'],
          series: [{ name: 'Invoices', label: true, data: [[14, C.blue], [17, C.amber], [13, C.orange], [8, C.red], [3, C.red], [8, C.pink]].map(([value, color]) => ({ value, itemStyle: { color } })) }] },
        { span: 7, type: 'bar', title: 'Invoice-before-GRN cases by supplier', height: 260, horizontal: true, labelMax: 26, gridOpt: { right: 30 },
          categories: ['Okavango Medical Supplies', 'Naledi Pharmaceuticals', 'Tswelelo Supplies', 'Pula Office Solutions', 'Chobe ICT Solutions', 'Makgadikgadi Fleet Services', 'Other 15 suppliers'],
          series: [{ name: 'Cases', label: true, data: [11, 8, 6, 5, 4, 4, 25].map((value, i) => ({ value, itemStyle: { color: i === 6 ? '#475569' : value >= 8 ? C.red : value >= 5 ? C.orange : C.amber } })) }] },
      ],
      [
        { span: 12, type: 'table', title: 'Invoices raised before delivery', height: 250,
          columns: [{ key: 'inv', label: 'Invoice' }, { key: 's', label: 'Supplier' }, { key: 'po', label: 'PO' }, { key: 'amt', label: 'Amount', align: 'right' }, { key: 'd', label: 'Days early', align: 'right' }, { key: 'st', label: 'Payment' }],
          rows: [
            ['INV-OMS-2204', 'Okavango Medical Supplies', 'PO-26-50312', 146900, '12 (no GRN)', 'Approved, now on hold', 'red'],
            ['INV-NP-7730', 'Naledi Pharmaceuticals', 'PO-26-49870', 212450, '9', 'Paid', 'red'],
            ['INV-OMS-2188', 'Okavango Medical Supplies', 'PO-26-49122', 88300, '6', 'Paid', 'red'],
            ['INV-TS-0419', 'Tswelelo Supplies', 'PO-26-50788', 64200, '15', 'On hold', 'amber'],
            ['INV-POS-3312', 'Pula Office Solutions', 'PO-26-51233', 96400, '3', 'Not paid', 'green'],
            ['INV-CICT-118', 'Chobe ICT Solutions', 'PO-26-50021', 318000, '21', 'Not paid', 'green'],
          ].map(([inv, s, po, amt, d, st, t]) => ({ inv, s, po, amt: money(amt), d, st: { pill: st, tone: t } })) },
      ],
    ],
  }));

  // ── 9 Payment Without Documents ──
  const PV = `<div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #111;padding-bottom:8px;margin-bottom:10px">
      <div><div style="font-size:10px;letter-spacing:.12em">REPUBLIC OF BOTSWANA · MINISTRY OF HEALTH</div><div style="font-size:17px;font-weight:700;margin-top:2px">Payment Voucher PV-26-44812</div></div>
      <div style="text-align:right;font-size:11px">Date: 13 Sep 2026<br>Vote: 1101 · Security</div></div>
    <table style="width:100%;border-collapse:collapse;font-size:12px">
      <tr><td style="padding:3px 0;width:38%">Payee</td><td><b>Lesedi Security Services</b></td></tr>
      <tr><td style="padding:3px 0">Description</td><td>Security guarding, 6 clinics, Jul–Sep</td></tr>
      <tr><td style="padding:3px 0">Amount</td><td><b>BWP 1,240,000.00</b></td></tr>
      <tr><td style="padding:3px 0">Approved by</td><td>Director Finance (13 Sep, Saturday)</td></tr></table>
    <div style="margin-top:12px;font-size:11px;font-weight:700;letter-spacing:.08em">SUPPORTING DOCUMENTS</div>
    <table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:4px">
      <tr><td style="padding:3px 0">Contract / LPO</td><td style="color:#b45309">DIR-26-0027 · direct award, justification missing</td></tr>
      <tr><td style="padding:3px 0">Tax invoice</td><td style="color:#b91c1c;font-weight:700">✗ Not attached</td></tr>
      <tr><td style="padding:3px 0">Service certificate</td><td style="color:#b91c1c;font-weight:700">✗ Not attached</td></tr>
      <tr><td style="padding:3px 0">Guard attendance registers</td><td style="color:#b91c1c;font-weight:700">✗ Not attached</td></tr>
      <tr><td style="padding:3px 0">Tax clearance certificate</td><td style="color:#15803d">✓ Valid to 31 Dec 2026</td></tr></table>
    <div style="margin-top:12px;padding:8px 10px;border:1.5px solid #b91c1c;color:#b91c1c;font-size:11.5px;font-weight:700;text-align:center">FLAGGED · PAYMENT RELEASED WITHOUT SUPPORTING DOCUMENTATION</div>`;
  register(K(9), () => ({
    crumbs: [...crumbs, 'Payment without documents'],
    kpis: [
      { label: 'Payments tested', value: '9,870', sub: 'all PVs above BWP 10K', tone: 'blue' },
      { label: 'Without full documents', value: '41', delta: '▲ 6 vs Aug', deltaTone: 'red', sub: '0.4% of payments', tone: 'red' },
      { label: 'Value', value: 'BWP 3.7M', sub: 'unsupported payments', tone: 'orange' },
      { label: 'Largest', value: 'BWP 1.24M', delta: 'PV-26-44812', deltaTone: 'red', sub: 'Lesedi Security', tone: 'violet' },
      { label: 'Regularised', value: '12', sub: 'documents supplied later', tone: 'green', pct: 29 },
    ],
    insight: { finding: 'Payment voucher <b>PV-26-44812</b> released <b>BWP 1,240,000</b> to Lesedi Security Services on a Saturday with no invoice, no service certificate and no attendance registers, against a direct award whose justification is also missing.', recommendation: 'Refer PV-26-44812 to Internal Audit, request the documents from the supplier within 5 days and recover the payment if not supported.', severity: 'Critical', tone: 'red', actions: ['Explain finding', 'Refer to audit', 'Request documents'] },
    grid: [
      [
        { span: 7, type: 'bar', title: 'Unsupported payments by ministry and missing document', height: 330, categories: MIN,
          series: [{ name: 'No invoice', stack: 'd', color: 'red', data: [6, 1, 3, 2, 0, 3, 1, 0] }, { name: 'No GRN / certificate', stack: 'd', color: 'orange', data: [5, 1, 2, 1, 1, 2, 0, 1] }, { name: 'No contract / LPO', stack: 'd', color: 'amber', data: [3, 0, 1, 1, 0, 1, 0, 0] }, { name: 'No approval', stack: 'd', color: 'violet', data: [2, 0, 1, 0, 0, 1, 0, 0] }] },
        { span: 5, type: 'doc', title: 'Source document | PV-26-44812', height: 300, html: PV },
      ],
      [
        { span: 12, type: 'table', title: 'Payments released without supporting documentation', height: 250,
          columns: [{ key: 'pv', label: 'Voucher' }, { key: 's', label: 'Payee' }, { key: 'amt', label: 'Amount', align: 'right' }, { key: 'm', label: 'Missing' }, { key: 'd', label: 'Released' }, { key: 'st', label: 'Status' }],
          rows: [
            ['PV-26-44812', 'Lesedi Security Services', 1240000, 'Invoice, certificate, registers', 'Sat 13 Sep', 'Referred to audit', 'red'],
            ['PV-26-44640', 'Thari Consulting', 500000, 'Deliverable sign-off', '09 Sep', 'Open', 'red'],
            ['PV-26-44519', 'Tswelelo Supplies', 212000, 'GRN', '04 Sep', 'Open', 'orange'],
            ['PV-26-44371', 'Makgadikgadi Fleet Services', 184600, 'Invoice', '29 Aug', 'Documents requested', 'amber'],
            ['PV-26-44208', 'Boitumelo Catering', 96300, 'Attendance list', '22 Aug', 'Regularised', 'green'],
            ['PV-26-44102', 'Mokgosi Logistics', 58300, 'Original invoice (INV-7781 duplicate)', '18 Aug', 'Stopped', 'green'],
          ].map(([pv, s, amt, m, d, st, t]) => ({ pv: { strong: pv }, s, amt: money(amt), m, d, st: { pill: st, tone: t } })) },
      ],
    ],
  }));

  // ── 10 Risk Indicators & Explain Finding ──
  register(K(10), () => {
    const lik = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost certain'];
    const imp = ['Minor', 'Moderate', 'Major', 'Severe', 'Critical'];
    const counts = [[9, 6, 3, 1, 0], [7, 8, 5, 2, 1], [4, 6, 7, 4, 2], [1, 3, 5, 3, 2], [0, 1, 2, 2, 1]]; // [likelihood][impact]
    const values = [];
    counts.forEach((row, y) => row.forEach((v, x) => values.push([x, y, v])));
    const EXPLAIN = `<div style="font-size:10px;letter-spacing:.12em;color:#555">AI EXPLANATION · FINDING F-26-0193</div>
      <div style="font-size:16px;font-weight:700;margin:4px 0 10px">Split purchase to avoid tender: Serowe Hardware</div>
      <p style="margin:0 0 8px"><b>What the data shows.</b> Four purchase orders (PO-26-51702, -51741, -51788, -51820) were raised by the same buyer for the same item code (fencing wire and poles) between 08 and 13 September, valued BWP 98,500, 99,200, 99,800 and 98,500.</p>
      <p style="margin:0 0 8px"><b>Why it is a finding.</b> Each PO sits within 2% of the BWP 100,000 quotation limit. Combined (<b>BWP 396,000</b>) the requirement needed a competitive tender under the PPAD Act. Rule S1 and S2 both triggered.</p>
      <p style="margin:0 0 8px"><b>Why it matters.</b> No competing quotes were obtained, the buyer has an undeclared family link to the supplier's director, and the unit price is 18% above the framework benchmark (est. loss BWP 60K).</p>
      <p style="margin:0"><b>Confidence.</b> High (0.92). Pattern matches 3 earlier confirmed split cases.</p>`;
    return {
      crumbs: [...crumbs, 'Risk & explain'],
      kpis: [
        { label: 'Risk indicators monitored', value: '24', sub: 'red flags across lifecycle', tone: 'blue' },
        { label: 'Open findings', value: '58', delta: '▲ 7 this month', deltaTone: 'red', sub: '', tone: 'amber' },
        { label: 'High / critical', value: '14', sub: 'score ≥ 15 of 25', tone: 'red' },
        { label: 'Value at risk', value: 'BWP 9.8M', sub: 'high-risk findings', tone: 'orange' },
        { label: 'AI precision', value: '88%', delta: '▲ 4 pts', sub: 'confirmed on review', tone: 'green', pct: 88 },
      ],
      insight: { finding: 'Finding <b>F-26-0193</b>: four POs to <b>Serowe Hardware</b> in 6 days, each just under the BWP 100,000 limit, totalling <b>BWP 396,000</b>. The buyer has an undeclared family link to the supplier.', recommendation: 'Refer to Internal Audit and the DCEC, suspend the buyer\'s PO rights and re-procure the balance of the requirement by tender.', severity: 'Critical', tone: 'red', actions: ['Explain finding', 'Refer to audit', 'Create task'] },
      grid: [
        [
          { span: 12, type: 'steps', title: 'Explain finding | F-26-0193 · data to action', steps: [
            { name: 'DATA', meta: '4 POs · 6 days · BWP 396K', state: 'done' }, { name: 'FINDING', meta: 'Split below BWP 100K limit', state: 'done' }, { name: 'RISK', meta: 'High · 20 / 25', state: 'late' },
            { name: 'EXPLANATION', meta: 'Tender avoided, related party', state: 'done' }, { name: 'RECOMMENDATION', meta: 'Refer, suspend, re-tender', state: 'current' }, { name: 'ACTION', meta: 'Assigned: Chief Internal Auditor', state: 'pending' },
          ] },
        ],
        [
          { span: 7, type: 'doc', title: 'Explanation | why this was flagged', height: 290, html: EXPLAIN },
          { span: 5, type: 'heatmap', title: 'Risk matrix | open findings (likelihood × impact)', height: 290, x: imp, y: lik, values, min: 0, max: 9, colors: ['#0f2a4d', '#1D4ED8', '#F59E0B', '#EF4444'], cellFmt: v => (v ? v : ''), valueFmt: v => v + ' findings' },
        ],
        [
          { span: 6, type: 'bar', title: 'Composite risk score by supplier (0–100)', height: 260, horizontal: true, labelMax: 26, max: 100,
            categories: ['Serowe Hardware', 'Lesedi Security Services', 'Okavango Medical Supplies', 'Mokgosi Logistics', 'Motswedi Construction', 'Chobe ICT Solutions', 'Tswelelo Supplies', 'Clement Pty Ltd'],
            series: [{ name: 'Risk score', label: true, data: [86, 82, 74, 68, 61, 54, 49, 18].map(value => ({ value, itemStyle: { color: value >= 75 ? C.red : value >= 55 ? C.orange : value >= 40 ? C.amber : C.green } })) }] },
          { span: 6, type: 'list', title: 'Recommended actions', height: 260, items: [
            { title: 'Refer F-26-0193 to Internal Audit and DCEC', meta: 'Chief Internal Auditor · due 26 Sep', tone: 'red', pill: 'Critical' },
            { title: 'Suspend PO rights for Officer 0412', meta: 'Director ICT · IFMS role change', tone: 'red', pill: 'Today' },
            { title: 'Recover or support PV-26-44812 (BWP 1.24M)', meta: 'Director Finance · due 30 Sep', tone: 'orange', pill: 'High' },
            { title: 'Hold Okavango invoice until GRN posted', meta: 'Chief Accountant', tone: 'orange', pill: 'High' },
            { title: 'Add 30-day aggregation rule to IFMS', meta: 'Chief Procurement Officer', tone: 'amber', pill: 'Medium' },
          ] },
        ],
      ],
    };
  });

  // ── 11 Audit Findings Tracker ──
  register(K(11), () => {
    const cols = [
      ['Open', 'red', [['F-26-0193 · Split purchase, Serowe Hardware', 'Critical', 'red', 'Agriculture'], ['F-26-0201 · PV-26-44812 without documents', 'Critical', 'red', 'Health'], ['F-26-0188 · Criteria changed, MICT/TEN/0056', 'High', 'orange', 'ICT']]],
      ['Management response', 'amber', [['F-26-0176 · Undeclared conflict, MWS/TEN/0207', 'High', 'orange', 'Water'], ['F-26-0170 · Invoice before GRN, Okavango', 'High', 'orange', 'Health'], ['F-26-0164 · SoD conflict, U-0412', 'Medium', 'amber', 'Health']]],
      ['In remediation', 'blue', [['F-26-0151 · Variations > 15%, Kazungula road', 'High', 'orange', 'Transport'], ['F-26-0147 · Contract 42% above award', 'Medium', 'amber', 'ICT'], ['F-26-0139 · Single-bid tenders re-advertised', 'Medium', 'amber', 'Transport']]],
      ['Verified closed', 'green', [['F-26-0122 · Duplicate INV-7781 stopped', 'Closed', 'green', 'Health'], ['F-26-0117 · Missing approvals regularised', 'Closed', 'green', 'Education']]],
    ];
    return {
      crumbs: [...crumbs, 'Findings tracker'],
      kpis: [
        { label: 'Open findings', value: '58', delta: '▲ 7 this month', deltaTone: 'red', sub: 'all ministries', tone: 'amber' },
        { label: 'High / critical', value: '14', sub: 'BWP 9.8M at risk', tone: 'red' },
        { label: 'Overdue actions', value: '11', delta: 'past agreed date', deltaTone: 'red', sub: '', tone: 'orange' },
        { label: 'Closed this FY', value: '96', delta: '62% closure rate', sub: '', tone: 'green', pct: 62 },
        { label: 'Avg days to close', value: '42', delta: '▼ 6 days', sub: 'target 30', tone: 'blue' },
      ],
      insight: { finding: 'Health holds <b>17 of 58</b> open findings and 5 of the 11 overdue actions. Two critical findings (F-26-0193 split purchase and F-26-0201 PV-26-44812) have no management response yet.', recommendation: 'Table the two critical findings at the next Audit Committee and require a written management response within 10 working days.', severity: 'High', tone: 'orange', actions: ['Explain finding', 'Add to board pack', 'Create task'] },
      grid: [
        [
          { span: 12, type: 'kanban', title: 'Findings board', height: 300, columns: cols.map(([name, tone, items]) => ({ name, tone, items: items.map(([title, sev, t, m]) => ({ title, pill: sev, tone: t, meta: m })) })) },
        ],
        [
          { span: 6, type: 'bar', title: 'Open findings by ministry and severity', height: 250, categories: MIN,
            series: [{ name: 'Critical', stack: 'f', color: 'red', data: [2, 0, 0, 1, 0, 0, 0, 0] }, { name: 'High', stack: 'f', color: 'orange', data: [4, 1, 2, 1, 0, 2, 0, 1] }, { name: 'Medium', stack: 'f', color: 'amber', data: [7, 3, 4, 2, 2, 3, 2, 1] }, { name: 'Low', stack: 'f', color: 'blue', data: [4, 2, 2, 1, 1, 1, 1, 0] }] },
          { span: 6, type: 'line', title: 'Findings raised vs closed per month', height: 250, categories: H,
            series: [{ name: 'Raised', data: [21, 18, 24, 19, 23, 27], color: 'red' }, { name: 'Closed', data: [14, 17, 16, 15, 16, 18], color: 'green', area: true }, { name: 'Open balance', data: [36, 37, 45, 49, 56, 58], color: 'amber', dashed: true }] },
        ],
        [
          { span: 12, type: 'table', title: 'Findings register | high priority', height: 260,
            columns: [{ key: 'id', label: 'Finding' }, { key: 't', label: 'Title', nowrap: false }, { key: 'o', label: 'Owner' }, { key: 'due', label: 'Due' }, { key: 'p', label: 'Progress' }, { key: 'st', label: 'Status' }],
            rows: [
              ['F-26-0193', 'Split purchase, Serowe Hardware, BWP 396K', 'Chief Internal Auditor', '26 Sep', 5, 'Open', 'red'],
              ['F-26-0201', 'PV-26-44812 paid without documents, BWP 1.24M', 'Director Finance', '30 Sep', 10, 'Open', 'red'],
              ['F-26-0188', 'Evaluation criteria changed, MICT/TEN/0056', 'Chief Procurement Officer', '03 Oct', 20, 'Open', 'red'],
              ['F-26-0176', 'Undeclared conflict, MWS/TEN/0207 evaluator', 'Permanent Secretary', '15 Sep', 35, 'Overdue', 'orange'],
              ['F-26-0170', 'Invoice before GRN, Okavango Medical Supplies', 'Chief Accountant', '20 Sep', 50, 'Overdue', 'orange'],
              ['F-26-0151', 'Kazungula Link Road variations above 15%', 'Director Projects', '31 Oct', 60, 'On track', 'blue'],
              ['F-26-0122', 'Duplicate invoice INV-7781, Mokgosi Logistics', 'Chief Accountant', '05 Sep', 100, 'Closed', 'green'],
            ].map(([id, t, o, due, p, st, tone]) => ({ id: { strong: id }, t, o, due, p: { bar: p, tone }, st: { pill: st, tone } })) },
        ],
      ],
    };
  });
})();
