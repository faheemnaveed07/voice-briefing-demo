/* Menu 6: Tender Management & Evaluation.
 * Tabs 6 (Weighted Results & Ranking) and 11 (GIS Tender Sites) are hand-built in index.html.
 *
 * Focus tender MCP/DES/2283/26-27-01, Two Year Supply Framework of Furniture (data pack):
 *   compliance 14 checks (5 standard, 9 optional) | technical 11 metrics, max 1.00
 *   financial: lowest offer = 1.00, others = lowest ÷ offer (4,000 / 7,000 / 9,000)
 *   weighted = 0.6 × technical + 0.4 × financial → Clement 0.88, Seasons 0.70, Matrix 0.60
 *   approvals: Initiated 18 Sep 14:20, Reviewed 19 Sep 10:05, Approved 20 Sep 16:48, PS awaiting
 */
(function () {
  const { register, fmt, rng } = DASH;
  const { MONTHS, MONTH_NOW, OFFICERS } = DASH.data;
  const K = n => `5-${n}`;
  const REF = 'MCP/DES/2283/26-27-01';
  const crumbs = ['Tenders', 'Ministry of Finance', 'Corporate Affairs', REF];
  const sum = arr => arr.reduce((a, b) => a + (b || 0), 0);
  const hex = (seed, n = 64) => { const r = rng(seed); return Array.from({ length: n }, () => '0123456789abcdef'[r.int(0, 15)]).join(''); };
  const short = h => `${h.slice(0, 6)}…${h.slice(-4)}`;

  // ── focus tender ──
  const METRICS = [
    ['Technical skills & competency', 'Skills', 0.2, [0.16, 0.18, 0.14]],
    ['Relevant technical experience', 'Experience', 0.1, [0.08, 0.09, 0.07]],
    ['Academic qualifications', 'Qualifications', 0.2, [0.2, 0.12, 0.14]],
    ['More than 3 years in industry', 'Experience', 0.05, [0.03, 0.05, 0.04]],
    ['Machinery & equipment', 'Capacity', 0.05, [0.05, 0.04, 0.04]],
    ['Scale of operations', 'Capacity', 0.05, [0.03, 0.04, 0.03]],
    ['> 10 completed past projects', 'Track record', 0.05, [0.03, 0.04, 0.04]],
    ['Reference letters, past projects', 'Track record', 0.1, [0.08, 0.07, 0.06]],
    ['> 3 large projects completed', 'Track record', 0.1, [0.08, 0.08, 0.07]],
    ['Directors competency online test', 'Online tests', 0.05, [0.03, 0.04, 0.04]],
    ['Technical team online test', 'Online tests', 0.05, [0.03, 0.04, 0.04]],
  ];
  const BIDDERS = [
    { name: 'Clement Pty Ltd', short: 'Clement', offer: 4000, tone: 'green' },
    { name: 'Seasons Pty Ltd', short: 'Seasons', offer: 7000, tone: 'blue' },
    { name: 'Matrix Pty Ltd', short: 'Matrix', offer: 9000, tone: 'violet' },
  ].map((b, i) => {
    const tech = +sum(METRICS.map(m => m[3][i])).toFixed(2);
    const fin = +(4000 / b.offer).toFixed(2);
    return { ...b, tech, fin, weighted: +(0.6 * tech + 0.4 * fin).toFixed(2), rank: i + 1 };
  });
  // Five bids were opened; two failed a mandatory (standard) compliance check.
  const SUBMITTED = [...BIDDERS.map(b => b.name), 'Tswelelo Supplies', 'Pula Office Solutions'];
  const CHECKS = [
    ['Company solvency', 'Standard', 'Audited financials'], ['Company liquidity', 'Optional', 'Audited financials'], ['Gearing ratio < 40% debt to assets', 'Optional', 'Audited financials'],
    ['Black-listed company', 'Standard', 'PPRA debarment list'], ['Tax clearance', 'Standard', 'BURS certificate'], ['Directors criminal records', 'Standard', 'Botswana Police Service'],
    ['Shareholders criminal records', 'Optional', 'Botswana Police Service'], ['Directors court cases (fraud, theft, tax)', 'Optional', 'Court registry search'], ['Company registration', 'Standard', 'CIPA registry'],
    ['Company court cases (fraud, theft, tax)', 'Optional', 'Court registry search'], ['BEE', 'Optional', 'Certificate'], ['NASA', 'Optional', 'Certificate'], ['Insurance', 'Optional', 'Broker letter'], ['Affirmative action', 'Optional', 'Policy document'],
  ];
  // 1 pass, 0 fail, 0.5 optional item not provided (not required for this tender)
  const CHECK_GRID = CHECKS.map((c, y) => SUBMITTED.map((b, x) => {
    if (x === 3 && y === 4) return 0;               // Tswelelo: tax clearance expired
    if (x === 4 && y === 0) return 0;               // Pula: solvency failed
    if (x === 1 && y === 10) return 0.5;            // Seasons: no BEE certificate
    if (x === 2 && y === 13) return 0.5;            // Matrix: no affirmative-action policy
    if (x === 4 && y === 12) return 0.5;            // Pula: insurance letter missing
    return 1;
  }));

  // ── register ──
  const TENDERS = [
    [REF, 'Two Year Supply Framework of Furniture', 'Corporate Affairs', 'Open national', 4.8, 5, 'Authorisation', 'amber', '26 Aug'],
    ['MCP/ICT/2291/26-27', 'Network refresh | Francistown regional office', 'Corporate Affairs', 'Open national', 6.2, 4, 'Technical evaluation', 'blue', '02 Sep'],
    ['MOH/WKS/0442/26-27', 'Maun district clinic construction', 'Health Infrastructure', 'Open international', 18.5, null, 'Bidding', 'cyan', '14 Oct'],
    ['MOH/SUP/0418/26-27', 'ARV & essential medicines framework', 'Central Medical Stores', 'Open international', 31.0, 7, 'Awarded', 'green', '30 May'],
    ['MOH/SRV/0431/26-27', 'Hospital cleaning services | Gaborone', 'Hospital Services', 'Open national', 2.4, 9, 'Financial evaluation', 'blue', '19 Aug'],
    ['MOH/WKS/0439/26-27', 'Kasane health post upgrade', 'Health Infrastructure', 'Restricted', 6.4, 3, 'Awarded', 'green', '11 Jun'],
    ['MCP/SRV/2276/26-27', 'Fleet maintenance framework', 'Corporate Affairs', 'Open national', 3.1, 6, 'Contract signed', 'green', '23 May'],
    ['MOH/WKS/0436/26-27', 'Francistown referral theatre fit-out', 'Health Infrastructure', 'Open national', 19.5, 5, 'Appeal lodged', 'red', '15 Jul'],
    ['MOH/SUP/0451/26-27', 'Laboratory reagents (GeneXpert)', 'Hospital Services', 'Direct (sole source)', 1.1, 1, 'Compliance check', 'blue', '12 Sep'],
    ['MOH/SRV/0425/26-27', 'Security guarding | 14 sites', 'Corporate Services', 'Open national', 1.6, 11, 'Cancelled', 'slate', '04 Jun'],
    ['MOH/SUP/0447/26-27', 'Medical oxygen supply', 'Hospital Services', 'Open national', 1.9, null, 'Planning', 'violet', '—'],
    ['MCP/ICT/2302/26-27', 'ERP licences renewal', 'Corporate Affairs', 'Restricted', 4.4, null, 'Planning', 'violet', '—'],
  ];

  // ── 0 Tender Register ──
  register(K(0), () => ({
    crumbs: ['Tenders', 'All tenders', 'FY 2026-27'],
    kpis: [
      { label: 'Tenders this FY', value: '38', delta: '12 active', sub: 'Apr–Sep 2026', tone: 'blue' },
      { label: 'Estimated value', value: 'BWP 214M', sub: 'all 38 tenders', tone: 'violet', pct: 100 },
      { label: 'In evaluation', value: '7', sub: 'compliance → financial', tone: 'cyan' },
      { label: 'Avg turnaround', value: '74 days', delta: '▲ 14 vs target', deltaTone: 'red', sub: 'advert to award, target 60', tone: 'amber' },
      { label: 'Cancelled / appealed', value: '3 / 2', delta: '8% cancelled', deltaTone: 'amber', sub: '', tone: 'red' },
    ],
    insight: { finding: 'Average turnaround is <b>74 days</b> against a 60-day target. Evaluation is the slowest step (31 days on average); tender <b>' + REF + '</b> has waited 6 days for Permanent Secretary authorisation after a 3-day evaluation.', recommendation: 'Set a 3-day SLA for authorisation and give the PS a weekly batch of award recommendations.', severity: 'Medium', tone: 'amber' },
    grid: [
      [
        { span: 4, type: 'funnel', title: 'Tender pipeline FY 2026-27 (count)', height: 280, items: [['Planned', 38], ['Advertised', 32], ['Closed', 27], ['Evaluated', 20], ['Awarded', 15], ['Contract signed', 12]].map(([name, value]) => ({ name, value })) },
        { span: 8, type: 'bar', title: 'Tenders advertised and awarded per month, with turnaround', height: 280, categories: MONTHS.slice(0, MONTH_NOW), y2: 'days', gridOpt: { top: 44 },
          series: [{ name: 'Advertised', data: [7, 5, 6, 4, 6, 4], color: 'blue' }, { name: 'Awarded', data: [1, 2, 3, 3, 3, 3], color: 'green' }, { name: 'Avg turnaround (days)', type: 'line', axis: 1, data: [66, 71, 69, 78, 81, 74], color: 'amber', markLine: { value: 60, label: 'Target 60', tone: 'red' } }] },
      ],
      [{ span: 12, type: 'table', title: 'Tender register', height: 330,
        columns: [{ key: 'ref', label: 'Tender no.' }, { key: 't', label: 'Title' }, { key: 'd', label: 'Department' }, { key: 'm', label: 'Method' }, { key: 'v', label: 'Est. value (BWP M)', align: 'right' }, { key: 'b', label: 'Bids', align: 'right' }, { key: 'c', label: 'Closing' }, { key: 's', label: 'Stage' }],
        rows: TENDERS.map(([ref, t, d, m, v, b, s, tone, c]) => ({ ref: ref === REF ? { strong: ref } : ref, t, d, m, v: v.toFixed(1), b: b == null ? '—' : b, c, s: { pill: s, tone } })) }],
    ],
  }));

  // ── 1 Tender Planning (Criteria & Weights) ──
  register(K(1), () => ({
    crumbs,
    kpis: [
      { label: 'Technical : financial', value: '60 : 40', sub: 'weighted result formula', tone: 'blue', pct: 60 },
      { label: 'Technical metrics', value: '11', sub: 'max score 1.00', tone: 'violet' },
      { label: 'Compliance checks', value: '14', sub: '5 standard, 9 optional', tone: 'cyan' },
      { label: 'Technical threshold', value: '0.70', sub: 'pass to financial stage', tone: 'amber', pct: 70 },
      { label: 'Criteria locked', value: '04 Jul', delta: '✓ unchanged', deltaTone: 'green', sub: 'before advert', tone: 'green' },
    ],
    insight: { finding: 'Criteria and weights were locked on <b>4 Jul</b>, three days before the advert, and have not changed since bid opening. For a furniture supply framework, academic qualifications and technical skills carry <b>40%</b> of the technical score while production capacity (machinery, scale) carries only 10%.', recommendation: 'For the next furniture framework, move 10 points from qualifications to production capacity and delivery lead time.', severity: 'Low', tone: 'blue' },
    grid: [
      [{ span: 12, type: 'steps', title: 'Tender planning timeline | ' + REF,
        steps: [{ name: 'Procurement plan entry', meta: '12 May', state: 'done' }, { name: 'Specifications approved', meta: '20 Jun', state: 'done' }, { name: 'Criteria & weights locked', meta: '04 Jul', state: 'done' }, { name: 'Advertised', meta: '07 Jul', state: 'done' }, { name: 'Clarification meeting', meta: '28 Jul', state: 'done' }, { name: 'Bid closing', meta: '26 Aug 12:00', state: 'done' }, { name: 'Evaluation', meta: '27 Aug – 18 Sep', state: 'done' }, { name: 'Award authorisation', meta: 'awaiting PS', state: 'late' }] }],
      [
        { span: 5, type: 'donut', title: 'Technical score weights (max 1.00)', height: 290, center: '60%', valueFmt: v => v.toFixed(2),
          items: ['Skills', 'Qualifications', 'Experience', 'Track record', 'Capacity', 'Online tests'].map(g => ({ name: g, value: +sum(METRICS.filter(m => m[1] === g).map(m => m[2])).toFixed(2) })) },
        { span: 7, type: 'table', title: 'Technical score card set-up', height: 290,
          columns: [{ key: 'no', label: '#' }, { key: 'm', label: 'Metric' }, { key: 'g', label: 'Group' }, { key: 'max', label: 'Max score', align: 'right' }, { key: 'w', label: 'Share of final' }],
          rows: METRICS.map(([m, g, max], i) => ({ no: i + 1, m, g, max: max.toFixed(2), w: { bar: max * 60 * 5, text: fmt.pct(max * 60), tone: 'violet' } })) },
      ],
      [
        { span: 5, type: 'stats', title: 'Evaluation rules', cols: 2, items: [
          { label: 'Compliance', value: 'PASS / DISQUALIFIED', sub: 'standard checks mandatory', tone: 'cyan' },
          { label: 'Technical pass mark', value: '≥ 0.70', sub: 'else financial not opened', tone: 'amber' },
          { label: 'Financial score', value: 'Lowest ÷ offer', sub: 'lowest bid = 1.00', tone: 'green' },
          { label: 'Weighted result', value: '0.6 T + 0.4 F', sub: 'highest wins', tone: 'blue' },
          { label: 'Score allocation', value: 'Admin discretion', sub: 'at planning stage only', tone: 'violet' },
          { label: 'Evaluation committee', value: '5 members', sub: 'conflicts declared', tone: 'slate' },
        ] },
        { span: 7, type: 'table', title: 'Compliance checklist set-up', height: 250,
          columns: [{ key: 'no', label: '#' }, { key: 'm', label: 'Metric' }, { key: 't', label: 'Type' }, { key: 'src', label: 'Evidence' }, { key: 'r', label: 'This tender' }],
          rows: CHECKS.map(([m, t, src], i) => ({ no: i + 1, m, t: { dot: t === 'Standard' ? 'blue' : 'slate', text: t }, src, r: t === 'Standard' ? { pill: 'Mandatory', tone: 'blue' } : [1, 2, 12].includes(i) ? { pill: 'Required', tone: 'cyan' } : { pill: 'Scored note', tone: 'slate' } })) },
      ],
    ],
  }));

  // ── 2 Bid Submissions ──
  register(K(2), () => {
    const r = rng('subs');
    const days = ['17 Aug', '18 Aug', '19 Aug', '20 Aug', '21 Aug', '22 Aug', '23 Aug', '24 Aug', '25 Aug', '26 Aug'];
    const perDay = [0, 0, 1, 0, 0, 1, 0, 0, 1, 3];
    const subs = [
      ['Seasons Pty Ltd', '19 Aug 15:42', 'On time', 'green'], ['Matrix Pty Ltd', '22 Aug 09:18', 'On time', 'green'], ['Pula Office Solutions', '25 Aug 16:05', 'On time', 'green'],
      ['Clement Pty Ltd', '26 Aug 08:51', 'On time', 'green'], ['Tswelelo Supplies', '26 Aug 11:37', 'On time', 'green'], ['Serowe Hardware', '26 Aug 12:14', 'Late | rejected', 'red'],
    ];
    return {
      crumbs,
      kpis: [
        { label: 'Bids received', value: '6', sub: 'closing 26 Aug 12:00', tone: 'blue' },
        { label: 'Opened', value: '5', delta: '1 late, unopened', deltaTone: 'red', sub: '', tone: 'green', pct: 83 },
        { label: 'e-Submissions', value: '100%', sub: 'bidders portal', tone: 'cyan', pct: 100 },
        { label: 'Bid security lodged', value: '5 of 5', sub: 'BWP 50,000 each', tone: 'violet', pct: 100 },
        { label: 'Avg bids per tender', value: '5.4', delta: '▲ 0.8 vs FY25', sub: 'FY 2026-27', tone: 'amber' },
      ],
      insight: { finding: 'Half of the bids arrived on the closing day, and one (Serowe Hardware) was <b>14 minutes late</b> and was rejected unopened by the portal. Every opened bid carried a sealed financial envelope and a valid bid security.', recommendation: 'Send a 48-hour closing reminder through the portal to reduce last-day congestion.', severity: 'Low', tone: 'green' },
      grid: [
        [
          { span: 7, type: 'bar', title: 'Bids received per day before closing | ' + REF, height: 260, categories: days, y2: 'total', gridOpt: { top: 44 },
            series: [{ name: 'Bids received', data: perDay.map((v, i) => ({ value: v, itemStyle: { color: i === 9 ? '#F59E0B' : '#3B82F6' } })), label: true }, { name: 'Cumulative', type: 'line', axis: 1, data: perDay.reduce((a, v, i) => (a.push((a[i - 1] || 0) + v), a), []), color: 'cyan', smooth: false }] },
          { span: 5, type: 'bar', title: 'Competition | bids per tender', height: 260, horizontal: true, labelMax: 20, categories: TENDERS.filter(t => t[5]).map(t => t[0].split('/').slice(0, 3).join('/')),
            series: [{ name: 'Bids', label: true, data: TENDERS.filter(t => t[5]).map(t => ({ value: t[5], itemStyle: { color: t[5] < 3 ? '#EF4444' : t[5] < 5 ? '#F59E0B' : '#10B981' } })) }] },
        ],
        [{ span: 12, type: 'table', title: 'Submission log | ' + REF, height: 260,
          columns: [{ key: 'rc', label: 'Receipt' }, { key: 'b', label: 'Bidder' }, { key: 't', label: 'Received' }, { key: 'ch', label: 'Channel' }, { key: 'env', label: 'Envelopes' }, { key: 'sec', label: 'Bid security' }, { key: 'h', label: 'Receipt hash' }, { key: 's', label: 'Status' }],
          rows: subs.map(([b, t, s, tone], i) => ({ rc: `RCPT-2283-${String(101 + i)}`, b: { strong: b }, t, ch: 'Bidders portal', env: s.startsWith('Late') ? '—' : 'Technical + financial (sealed)', sec: s.startsWith('Late') ? '—' : `BG ${['FNB', 'Stanbic', 'Absa', 'FNB', 'BBS'][i]} · 50,000`, h: short(hex('rc' + i)), s: { pill: s, tone } })) }],
      ],
    };
  });

  // ── 3 Compliance Checklist ──
  register(K(3), () => {
    const values = [];
    CHECK_GRID.forEach((row, y) => row.forEach((v, x) => values.push([x, y, v])));
    return {
      crumbs,
      kpis: [
        { label: 'Bidders checked', value: '5', sub: '14 checks each', tone: 'blue' },
        { label: 'Passed', value: '3', delta: '60%', sub: 'to technical stage', tone: 'green', pct: 60 },
        { label: 'Disqualified', value: '2', delta: 'standard check failed', deltaTone: 'red', sub: '', tone: 'red', pct: 40 },
        { label: 'Documents verified', value: '70', sub: 'BURS, CIPA, PPRA, BPS', tone: 'cyan' },
        { label: 'Optional gaps', value: '3', sub: 'noted, not disqualifying', tone: 'amber' },
      ],
      insight: { finding: 'Tswelelo Supplies’ <b>BURS tax clearance expired on 31 Jul</b>, before bid closing, and Pula Office Solutions failed the <b>solvency</b> test (liabilities exceed assets). Both are standard checks, so both bidders were disqualified and their financial envelopes returned unopened. Tswelelo has lodged a complaint (APL-26-006).', recommendation: 'Keep the disqualifications; answer the complaint with the BURS verification record before the 7-day deadline.', severity: 'Medium', tone: 'amber' },
      grid: [
        [
          { span: 8, type: 'heatmap', title: 'Compliance matrix | check × bidder', height: 400, x: SUBMITTED.map(s => s.replace(' Pty Ltd', '').replace(' Supplies', '').replace(' Office Solutions', '')), y: CHECKS.map(c => c[0]), values, min: 0, max: 1, labels: true,
            cellFmt: v => (v === 1 ? 'PASS' : v === 0 ? 'FAIL' : 'N/P'), valueFmt: v => (v === 1 ? 'Pass' : v === 0 ? 'Fail' : 'Not provided (optional)'), colors: ['#B91C1C', '#B45309', '#047857'] },
          { span: 4, type: 'list', title: 'Stage result', height: 400, items: [
            { title: 'Clement Pty Ltd', meta: '14 of 14 checks passed', pill: 'Passed', tone: 'green' },
            { title: 'Seasons Pty Ltd', meta: '13 of 14 · BEE certificate not provided (optional)', pill: 'Passed', tone: 'green' },
            { title: 'Matrix Pty Ltd', meta: '13 of 14 · affirmative-action policy not provided (optional)', pill: 'Passed', tone: 'green' },
            { title: 'Tswelelo Supplies', meta: 'Tax clearance expired 31 Jul (standard)', pill: 'Disqualified', tone: 'red' },
            { title: 'Pula Office Solutions', meta: 'Solvency failed (standard) · insurance letter missing', pill: 'Disqualified', tone: 'red' },
          ] },
        ],
        [{ span: 12, type: 'table', title: 'Checklist evidence | Clement Pty Ltd (overall result: PASSED)', height: 250,
          columns: [{ key: 'no', label: '#' }, { key: 't', label: 'Standard / optional' }, { key: 'm', label: 'Metric' }, { key: 'src', label: 'Verified against' }, { key: 'by', label: 'Verified by' }, { key: 'd', label: 'Date' }, { key: 'c', label: 'Check' }, { key: 'f', label: 'Source file' }],
          rows: CHECKS.map(([m, t, src], i) => ({ no: i + 1, t: { dot: t === 'Standard' ? 'blue' : 'slate', text: t }, m, src, by: ['Procurement Officer', 'Committee Secretary', 'Legal Officer'][i % 3], d: `${28 + (i % 4)} Aug`, c: { pill: '✓ Pass', tone: 'green' }, f: 'View' })) }],
      ],
    };
  });

  // ── 4 Technical Evaluation ──
  register(K(4), () => {
    const groups = ['Skills', 'Qualifications', 'Experience', 'Track record', 'Capacity', 'Online tests'];
    const evalScores = [[0.82, 0.79, 0.8, 0.78, 0.81], [0.8, 0.77, 0.81, 0.78, 0.79], [0.73, 0.69, 0.72, 0.7, 0.71]];
    return {
      crumbs,
      kpis: [
        ...BIDDERS.map(b => ({ label: `${b.short} technical`, value: b.tech.toFixed(2), delta: b.tech >= 0.7 ? '✓ pass' : '✗ below', deltaTone: b.tech >= 0.75 ? 'green' : 'amber', sub: 'threshold 0.70', tone: b.tone, pct: b.tech * 100 })),
        { label: 'Evaluator spread', value: '± 0.02', sub: '5 evaluators, max range 0.04', tone: 'cyan' },
        { label: 'Evaluated', value: '12 Sep', sub: 'committee of 5', tone: 'slate' },
      ],
      insight: { finding: 'Clement (0.80) and Seasons (0.79) are one point apart. Seasons scores higher on skills, experience and online tests, but Clement’s full marks on academic qualifications (0.20 vs 0.12) decide the technical ranking. Matrix passed the 0.70 threshold by <b>0.01</b>.', recommendation: 'Record the qualification evidence for Clement in the evaluation report, since it decides the technical ranking.', severity: 'Low', tone: 'blue' },
      grid: [
        [
          { span: 4, type: 'radar', title: 'Score profile | % of max per group', height: 300, indicators: groups.map(g => ({ name: g, max: 100 })),
            series: BIDDERS.map(b => ({ name: b.short, color: b.tone, values: groups.map(g => { const ms = METRICS.filter(m => m[1] === g); return Math.round((sum(ms.map(m => m[3][b.rank - 1])) / sum(ms.map(m => m[2]))) * 100); }) })) },
          { span: 8, type: 'bar', title: 'Score by metric vs maximum', height: 300, categories: METRICS.map(m => m[0]), rotate: 30, labelMax: 16,
            series: [{ name: 'Max', data: METRICS.map(m => m[2]), color: '#1E3A5F' }, ...BIDDERS.map((b, i) => ({ name: b.short, data: METRICS.map(m => m[3][i]), color: b.tone }))] },
        ],
        [
          { span: 7, type: 'table', title: 'Technical score card | all bidders', height: 290,
            columns: [{ key: 'no', label: '#' }, { key: 'm', label: 'Metric' }, { key: 'max', label: 'Max', align: 'right' }, ...BIDDERS.map(b => ({ key: b.short, label: b.short, align: 'right' }))],
            rows: [...METRICS.map(([m, , max, s], i) => ({ no: i + 1, m, max: max.toFixed(2), ...Object.fromEntries(BIDDERS.map((b, j) => [b.short, s[j] === max ? { strong: s[j].toFixed(2) } : s[j].toFixed(2)])) })),
              { no: '', m: { strong: 'TOTAL' }, max: '1.00', ...Object.fromEntries(BIDDERS.map(b => [b.short, { pill: b.tech.toFixed(2) + ' pass', tone: 'green' }])) }] },
          { span: 5, type: 'bar', title: 'Evaluator consistency | total score per evaluator', height: 290, categories: ['Chair', 'Member 2', 'Member 3', 'Member 4', 'Member 5'], max: 1,
            series: BIDDERS.map((b, i) => ({ name: b.short, data: evalScores[i], color: b.tone, markLine: i === 0 ? { value: 0.7, label: 'Pass 0.70', tone: 'red' } : undefined })) },
        ],
      ],
    };
  });

  // ── 5 Financial Evaluation (Bid Vault) ──
  register(K(5), () => {
    const mean = sum(BIDDERS.map(b => b.offer)) / 3;
    return {
      crumbs,
      kpis: [
        { label: 'Vault opened', value: '16 Sep 10:00', sub: 'sealed 21 days', tone: 'violet' },
        { label: 'Lowest offer', value: "BWP 4,000K", delta: 'Clement', deltaTone: 'green', sub: 'score 1.00', tone: 'green' },
        { label: 'vs estimate', value: '−17%', sub: "estimate BWP 4,800K", tone: 'cyan', pct: 83 },
        { label: 'Price spread', value: '2.25×', sub: 'highest ÷ lowest', tone: 'amber' },
        { label: 'Envelopes', value: '3 opened', delta: '2 returned sealed', deltaTone: 'slate', sub: 'disqualified bidders', tone: 'blue' },
      ],
      insight: { finding: `Clement’s offer is <b>${fmt.pct((1 - 4000 / mean) * 100)} below</b> the mean of the three offers (BWP ${fmt.n(mean)}K), which triggers the abnormally-low-bid check. A price breakdown was received on 17 Sep and its unit rates are within 6% of the 2024 furniture framework.`, recommendation: 'Accept the offer with a fixed-price schedule and a 10% performance security.', severity: 'Medium', tone: 'amber' },
      grid: [
        [{ span: 12, type: 'steps', title: 'Bid vault | chain of custody',
          steps: [{ name: 'Sealed on submission', meta: '19–26 Aug', state: 'done' }, { name: 'Technical results locked', meta: '12 Sep 17:10', state: 'done' }, { name: 'Two keys issued', meta: 'Chair + Procurement', state: 'done' }, { name: 'Vault opened', meta: '16 Sep 10:00', state: 'done' }, { name: 'Scores computed', meta: '16 Sep 10:01', state: 'done' }, { name: 'Published to portal', meta: '16 Sep 10:02', state: 'done' }] }],
        [
          { span: 6, type: 'bar', title: "Financial offers vs estimate (BWP '000)", height: 250, categories: BIDDERS.map(b => b.name),
            series: [{ name: 'Offer', label: true, labelFmt: p => fmt.n(p.value), data: BIDDERS.map(b => ({ value: b.offer, itemStyle: { color: b.offer === 4000 ? '#10B981' : '#3B82F6' } })), markLine: { value: 4800, label: 'Estimate 4,800', tone: 'amber' } }] },
          { span: 6, type: 'bar', title: 'Financial score (lowest ÷ offer)', height: 250, horizontal: true, categories: BIDDERS.map(b => b.name), max: 1,
            series: [{ name: 'Score', label: true, labelFmt: p => p.value.toFixed(2), data: BIDDERS.map(b => ({ value: b.fin, itemStyle: { color: b.fin === 1 ? '#10B981' : b.fin > 0.5 ? '#3B82F6' : '#8B5CF6' } })) }] },
        ],
        [
          { span: 7, type: 'table', title: 'Financial evaluation score', height: 220,
            columns: [{ key: 'no', label: 'No.' }, { key: 'b', label: 'Bidder' }, { key: 'o', label: "Offer (BWP '000)", align: 'right' }, { key: 's', label: 'Score', align: 'right' }, { key: 'f', label: 'Formula' }, { key: 'c', label: 'Comment' }, { key: 'src', label: 'Source' }],
            rows: BIDDERS.map((b, i) => ({ no: i + 1, b: { strong: b.name }, o: fmt.n(b.offer), s: b.fin.toFixed(2), f: i === 0 ? 'lowest = 1.00' : `4,000 ÷ ${fmt.n(b.offer)}`, c: i === 0 ? { pill: 'Lowest', tone: 'green' } : { pill: 'Others', tone: 'slate' }, src: 'View' })) },
          { span: 5, type: 'table', title: 'Vault access log', height: 220,
            columns: [{ key: 't', label: 'Time' }, { key: 'who', label: 'Officer' }, { key: 'a', label: 'Event' }],
            rows: [['16 Sep 09:58', 'Evaluation Committee Chair', 'Key 1 presented', 'blue'], ['16 Sep 09:59', 'Chief Procurement Officer', 'Key 2 presented', 'blue'], ['16 Sep 10:00', 'System', 'Vault opened (3 envelopes)', 'green'], ['16 Sep 10:00', 'System', '2 envelopes returned sealed', 'slate'], ['16 Sep 10:02', 'System', 'Scores published to portal', 'green'], ['17 Sep 11:20', 'Clement Pty Ltd', 'Price breakdown uploaded', 'amber']].map(([t, who, a, tone]) => ({ t, who, a: { dot: tone, text: a } })) },
        ],
      ],
    };
  });

  // ── 7 Approval Workflow ──
  register(K(7), () => ({
    crumbs,
    kpis: [
      { label: 'Current stage', value: 'Authorisation', sub: 'Permanent Secretary', tone: 'amber' },
      { label: 'Days waiting', value: '6', delta: '▲ 3 over SLA', deltaTone: 'red', sub: 'SLA 3 days', tone: 'red', pct: 100 },
      { label: 'Approvals completed', value: '3 of 6', sub: 'initiated → approved', tone: 'green', pct: 50 },
      { label: 'Tenders awaiting approval', value: '5', sub: 'ministry-wide', tone: 'blue' },
      { label: 'Avg approval cycle', value: '9.4 days', delta: '▼ 1.2 vs Q1', sub: 'initiation to award', tone: 'violet' },
    ],
    insight: { finding: 'The award recommendation for Clement Pty Ltd (weighted 0.88) cleared three levels in <b>50 hours</b> but has waited <b>6 days</b> at Permanent Secretary authorisation. Tender Board adjudication and the 14-day appeal window cannot start until it is authorised.', recommendation: 'Escalate to the PS with the evaluation pack; the furniture framework starts on 1 Nov.', severity: 'High', tone: 'orange', actions: ['Explain finding', 'Escalate to PS', 'Open evaluation pack'] },
    grid: [
      [{ span: 12, type: 'steps', title: 'Award approval chain | ' + REF,
        steps: [{ name: 'Initiated', meta: 'M Changu | HOD · 18 Sep 14:20', state: 'done' }, { name: 'Reviewed', meta: 'Evaluation Committee Chair · 19 Sep 10:05', state: 'done' }, { name: 'Approved', meta: 'Director Procurement · 20 Sep 16:48', state: 'done' }, { name: 'Authorised', meta: 'Permanent Secretary · awaiting 6 days', state: 'late' }, { name: 'Adjudicated', meta: 'Tender Board' }, { name: 'Appeal window', meta: 'Bidders · 14 days' }] }],
      [
        { span: 7, type: 'table', title: 'Approval queue | all tenders', height: 250,
          columns: [{ key: 'ref', label: 'Tender' }, { key: 't', label: 'Title' }, { key: 'st', label: 'Waiting at' }, { key: 'd', label: 'Days', align: 'right' }, { key: 'sla', label: 'SLA' }],
          rows: [[REF, 'Furniture framework', 'Permanent Secretary', 6, 3], ['MOH/SRV/0431/26-27', 'Hospital cleaning', 'Director Procurement', 2, 2], ['MOH/SUP/0451/26-27', 'Lab reagents (sole source)', 'Tender Board', 4, 5], ['MCP/ICT/2291/26-27', 'Network refresh', 'Committee Chair', 1, 2], ['MOH/WKS/0436/26-27', 'Theatre fit-out', 'On hold | appeal', 19, 14]]
            .map(([ref, t, st, d, sla]) => ({ ref: ref === REF ? { strong: ref } : ref, t, st, d, sla: d > sla ? { pill: `${d - sla} d over`, tone: 'red' } : d === sla ? { pill: 'Due today', tone: 'amber' } : { pill: 'Within SLA', tone: 'green' } })) },
        { span: 5, type: 'bar', title: 'Average days per approval level vs SLA', height: 250, horizontal: true, categories: ['HOD', 'Committee Chair', 'Director Procurement', 'Permanent Secretary', 'Tender Board'],
          series: [{ name: 'SLA', data: [1, 2, 2, 3, 5], color: '#1E3A5F' }, { name: 'Actual', label: true, data: [0.8, 1.4, 1.9, 5.6, 4.2].map((v, i) => ({ value: v, itemStyle: { color: v > [1, 2, 2, 3, 5][i] ? '#EF4444' : '#10B981' } })) }] },
      ],
      [{ span: 12, type: 'table', title: 'Audit trail | ' + REF, height: 230,
        columns: [{ key: 't', label: 'Date & time' }, { key: 'who', label: 'Officer' }, { key: 'a', label: 'Action' }, { key: 'c', label: 'Comment' }, { key: 'h', label: 'Block' }],
        rows: [
          ['18 Sep 14:20', 'M Changu | HOD', 'Submit', 'blue', 'Award recommended to Clement Pty Ltd, weighted 0.88', 8],
          ['19 Sep 10:05', 'Evaluation Committee Chair', 'Review', 'green', 'Scores reconcile to score cards; conflicts declared nil', 9],
          ['20 Sep 16:48', 'Director Procurement', 'Approve', 'green', 'Abnormally-low-bid check satisfied (price breakdown 17 Sep)', 10],
          ['22 Sep 08:30', 'System', 'Reminder', 'amber', 'Authorisation SLA (3 days) breached, PS notified', 11],
          ['24 Sep 08:30', 'System', 'Escalate', 'red', 'Escalated to Deputy Permanent Secretary', 12],
        ].map(([t, who, a, tone, c, b]) => ({ t, who, a: { pill: a, tone }, c, h: `#${b} · ${short(hex('blk' + b))}` })) }],
    ],
  }));

  // ── 8 Results Register (Tamper-proof) ──
  const CHAIN = [
    ['02 Jul 09:12', 'Tender created', 'M Changu | HOD'], ['04 Jul 15:30', 'Criteria & weights locked', 'Chief Procurement Officer'], ['26 Aug 12:00', 'Bid closing | 6 received, 5 sealed', 'System'],
    ['03 Sep 16:40', 'Compliance results | 3 pass, 2 disqualified', 'Evaluation Committee'], ['12 Sep 17:10', 'Technical results | 0.80, 0.79, 0.71', 'Evaluation Committee'], ['16 Sep 10:00', 'Financial vault opened | 1.00, 0.57, 0.44', 'System'],
    ['18 Sep 11:05', 'Weighted results | Clement 0.88 rank 1', 'System'], ['18 Sep 14:20', 'Award recommendation initiated', 'M Changu | HOD'], ['19 Sep 10:05', 'Reviewed', 'Evaluation Committee Chair'], ['20 Sep 16:48', 'Approved', 'Director Procurement'],
  ];
  register(K(8), () => {
    const hashes = CHAIN.map((_, i) => hex('blk' + (i + 1)));
    return {
      crumbs,
      kpis: [
        { label: 'Blocks in chain', value: String(CHAIN.length), sub: REF, tone: 'blue' },
        { label: 'Chain integrity', value: 'Verified', delta: '✓ 10 of 10', deltaTone: 'green', sub: 'SHA-256 links', tone: 'green', pct: 100 },
        { label: 'Last block', value: '#10', sub: '20 Sep 16:48', tone: 'violet' },
        { label: 'Edit attempts blocked', value: '1', delta: '19 Sep 18:02', deltaTone: 'red', sub: 'score field, logged', tone: 'red' },
        { label: 'Results published FY', value: '15', sub: 'all tenders, view only', tone: 'cyan' },
      ],
      insight: { finding: 'All <b>10 blocks</b> for ' + REF + ' re-hash to the stored values, so no result has changed since it was recorded. One attempt to edit a technical score on <b>19 Sep at 18:02</b> was refused and logged against the user account.', recommendation: 'Refer the blocked edit attempt to the Chief Internal Auditor for review.', severity: 'Medium', tone: 'amber', actions: ['Explain finding', 'Verify chain', 'Refer to audit'] },
      grid: [
        [
          { span: 5, type: 'doc', title: 'Tender assessment result sheet | all bidders', height: 330,
            html: `<div style="text-align:center;font-weight:700;letter-spacing:.04em">MINISTRY OF FINANCE<br>DEPARTMENT OF CORPORATE AFFAIRS<br><span style="font-weight:400">2026-2027 FINANCIAL YEAR</span></div>
              <div style="margin:12px 0 4px;text-align:center;font-weight:700">TENDER: ${REF}<br>TWO YEAR SUPPLY FRAMEWORK OF FURNITURE</div>
              <div style="text-align:center;font-size:11px;margin-bottom:10px">TENDER BID EVALUATION RESULTS | REGISTER</div>
              <table style="width:100%;border-collapse:collapse;font-size:11.5px"><tr style="background:#e5e7eb"><th style="border:1px solid #999;padding:4px">RANK</th><th style="border:1px solid #999;padding:4px">RESULT</th><th style="border:1px solid #999;padding:4px;text-align:left">BIDDER</th><th style="border:1px solid #999;padding:4px">TECH</th><th style="border:1px solid #999;padding:4px">FIN</th><th style="border:1px solid #999;padding:4px">SCORE</th></tr>
              ${BIDDERS.map(b => `<tr><td style="border:1px solid #999;padding:4px;text-align:center">${b.rank}</td><td style="border:1px solid #999;padding:4px;text-align:center;font-weight:700;color:${b.rank === 1 ? '#047857' : '#555'}">${b.rank === 1 ? 'WINNER' : 'UNSUCCESSFUL'}</td><td style="border:1px solid #999;padding:4px">${b.name.toUpperCase()}</td><td style="border:1px solid #999;padding:4px;text-align:center">${b.tech.toFixed(2)}</td><td style="border:1px solid #999;padding:4px;text-align:center">${b.fin.toFixed(2)}</td><td style="border:1px solid #999;padding:4px;text-align:center;font-weight:700">${b.weighted.toFixed(2)}</td></tr>`).join('')}</table>
              <p style="font-size:11px;margin-top:10px">Weighted score = 0.6 × technical + 0.4 × financial. Tswelelo Supplies and Pula Office Solutions disqualified at compliance stage.</p>
              <p style="font-size:10.5px;color:#555;margin-top:8px;border-top:1px solid #ccc;padding-top:6px">System generated | block #7 · ${short(hashes[6])} | no edit, no tamper, no changes</p>` },
          { span: 7, type: 'table', title: 'Results register | FY 2026-27 awards', height: 330,
            columns: [{ key: 'ref', label: 'Tender' }, { key: 'w', label: 'Winner' }, { key: 's', label: 'Score', align: 'right' }, { key: 'd', label: 'Recorded' }, { key: 'h', label: 'Result block' }, { key: 'i', label: 'Integrity' }],
            rows: [[REF, 'Clement Pty Ltd', 0.88, '18 Sep'], ['MOH/SUP/0418/26-27', 'Naledi Pharmaceuticals', 0.84, '19 Jun'], ['MOH/WKS/0439/26-27', 'Motswedi Construction', 0.79, '02 Jul'], ['MCP/SRV/2276/26-27', 'Makgadikgadi Fleet Services', 0.81, '12 Jun'], ['MOH/WKS/0436/26-27', 'Tlotlo Civil Works', 0.77, '21 Aug'], ['MOH/SUP/0409/26-27', 'Okavango Medical Supplies', 0.86, '28 May'], ['MCP/SUP/2268/26-27', 'Pula Office Solutions', 0.74, '14 May'], ['MOH/SRV/0412/26-27', 'Boitumelo Catering', 0.82, '06 May']]
              .map(([ref, w, s, d], i) => ({ ref: ref === REF ? { strong: ref } : ref, w, s: s.toFixed(2), d, h: short(hex('res' + i)), i: i === 4 ? { pill: 'Verified | under appeal', tone: 'amber' } : { pill: '✓ Verified', tone: 'green' } })) },
        ],
        [{ span: 12, type: 'table', title: 'Hash chain | ' + REF + ' (each block stores the hash of the previous block)', height: 300,
          columns: [{ key: 'n', label: 'Block' }, { key: 't', label: 'Timestamp' }, { key: 'e', label: 'Event' }, { key: 'by', label: 'Recorded by' }, { key: 'p', label: 'Previous hash' }, { key: 'h', label: 'Block hash' }, { key: 'v', label: 'Check' }],
          rows: CHAIN.map(([t, e, by], i) => ({ n: `#${i + 1}`, t, e: { strong: e }, by, p: i ? short(hashes[i - 1]) : '000000…0000', h: short(hashes[i]), v: { pill: '✓ Linked', tone: 'green' } })) }],
      ],
    };
  });

  // ── 9 Bidders Portal & Notifications ──
  register(K(9), () => {
    const r = rng('portal');
    const reg = [1102, 1131, 1164, 1197, 1238, 1284];
    return {
      crumbs: ['Tenders', 'Bidders portal'],
      kpis: [
        { label: 'Registered suppliers', value: '1,284', delta: '▲ 46 in Sep', sub: 'on the bidders portal', tone: 'blue' },
        { label: 'Notifications | ' + REF.slice(0, 12), value: '23', sub: 'email, SMS and portal', tone: 'violet' },
        { label: 'Delivery rate', value: '99.1%', sub: 'all channels, 30 days', tone: 'green', pct: 99.1 },
        { label: 'Read within 24 h', value: '87%', sub: 'portal + email opens', tone: 'cyan', pct: 87 },
        { label: 'Award notices held', value: '3', delta: 'until PS authorises', deltaTone: 'amber', sub: REF.slice(0, 12), tone: 'amber' },
      ],
      insight: { finding: 'Financial scores for ' + REF + ' reached all three bidders within <b>2 minutes</b> of the vault opening. Award and regret notices are drafted but <b>held</b> until the Permanent Secretary authorises the award; the 14-day appeal window starts when they are sent.', recommendation: 'Release notices automatically on authorisation so the appeal clock starts the same day.', severity: 'Low', tone: 'blue' },
      grid: [
        [
          { span: 7, type: 'bar', title: 'Notifications sent for ' + REF + ' by type and channel', height: 260, categories: ['Bid receipt', 'Clarification', 'Compliance result', 'Technical result', 'Financial opening', 'Award notice'],
            series: [{ name: 'Portal', stack: 'c', data: [6, 6, 5, 3, 3, 0], color: 'blue' }, { name: 'Email', stack: 'c', data: [6, 6, 5, 3, 3, 0], color: 'cyan' }, { name: 'SMS', stack: 'c', data: [0, 0, 5, 3, 3, 0], color: 'violet' }, { name: 'Held', stack: 'c', data: [0, 0, 0, 0, 0, 3], color: 'amber' }] },
          { span: 5, type: 'line', title: 'Supplier registrations and active bidders', height: 260, categories: MONTHS.slice(0, MONTH_NOW), y2: 'active',  gridOpt: { top: 44 },
            series: [{ name: 'Registered suppliers', data: reg, color: 'blue', area: true }, { name: 'Active bidders (month)', axis: 1, data: [212, 188, 241, 197, 256, 231], color: 'amber' }] },
        ],
        [
          { span: 7, type: 'table', title: 'Notification log | ' + REF, height: 290,
            columns: [{ key: 't', label: 'Sent' }, { key: 'b', label: 'Bidder' }, { key: 'ty', label: 'Notification' }, { key: 'ch', label: 'Channel' }, { key: 's', label: 'Status' }],
            rows: [
              ['16 Sep 10:02', 'Clement Pty Ltd', 'Financial score 1.00', 'Portal + email + SMS', 'Read', 'green'], ['16 Sep 10:02', 'Seasons Pty Ltd', 'Financial score 0.57', 'Portal + email + SMS', 'Read', 'green'], ['16 Sep 10:02', 'Matrix Pty Ltd', 'Financial score 0.44', 'Portal + email + SMS', 'Delivered', 'blue'],
              ['12 Sep 17:12', 'Matrix Pty Ltd', 'Technical 0.71 | passed', 'Portal + email + SMS', 'Read', 'green'], ['03 Sep 16:45', 'Tswelelo Supplies', 'Disqualified | tax clearance', 'Portal + email + SMS', 'Read', 'green'], ['03 Sep 16:45', 'Pula Office Solutions', 'Disqualified | solvency', 'Portal + email + SMS', 'Read', 'green'],
              ['—', 'Clement Pty Ltd', 'Notice of intention to award', 'Portal + email', 'Held | PS', 'amber'], ['—', 'Seasons Pty Ltd', 'Regret letter + result slip', 'Portal + email', 'Held | PS', 'amber'], ['—', 'Matrix Pty Ltd', 'Regret letter + result slip', 'Portal + email', 'Held | PS', 'amber'],
            ].map(([t, b, ty, ch, s, tone]) => ({ t, b: { strong: b }, ty, ch, s: { pill: s, tone } })) },
          { span: 5, type: 'doc', title: 'Bidder result slip preview | Seasons Pty Ltd (held)', height: 290,
            html: `<div style="font-weight:700;text-align:center">TENDER BID EVALUATION RESULTS SLIP</div><div style="text-align:center;font-size:11px;margin-bottom:10px">${REF} | Two Year Supply Framework of Furniture</div>
              <p><b>Bidder:</b> SEASONS PTY LTD</p>
              <table style="width:100%;border-collapse:collapse;font-size:11.5px;margin:6px 0">${[['Compliance', 'PASSED'], ['Technical score (60%)', '0.79 / 1.00'], ['Financial score (40%)', '0.57 / 1.00'], ['Weighted score', '0.70'], ['Rank', '2 of 3'], ['Result', 'UNSUCCESSFUL']].map(([a, b]) => `<tr><td style="border:1px solid #bbb;padding:4px">${a}</td><td style="border:1px solid #bbb;padding:4px;text-align:right;font-weight:600">${b}</td></tr>`).join('')}</table>
              <p style="font-size:11px">The successful bidder scored 0.88. You may request a debriefing or lodge a complaint within 14 days of this notice.</p>
              <p style="font-size:10.5px;color:#555;border-top:1px solid #ccc;padding-top:6px;margin-top:8px">System generated | results emailed to all bidders and posted on the bidders portal</p>` },
        ],
      ],
    };
  });

  // ── 10 Appeals & Adjudication ──
  const APPEALS = [
    ['APL-26-001', 'MOH/SRV/0425/26-27', 'Security guarding | 14 sites', 'Lesedi Security Services', 'Criteria changed after advert', 'Closed', 'Upheld | re-tender', 'green', 21],
    ['APL-26-002', 'MOH/SUP/0418/26-27', 'ARV & essential medicines', 'Okavango Medical Supplies', 'Price scoring error', 'Closed', 'Dismissed', 'slate', 18],
    ['APL-26-003', 'MCP/SRV/2276/26-27', 'Fleet maintenance framework', 'Mokgosi Logistics', 'Late bid rejected', 'Closed', 'Dismissed', 'slate', 9],
    ['APL-26-004', 'MOH/WKS/0436/26-27', 'Francistown theatre fit-out', 'Kgalagadi Builders', 'Conflict of interest alleged', 'Review Committee', 'Hearing 30 Sep', 'amber', 19],
    ['APL-26-005', 'MOH/WKS/0439/26-27', 'Kasane health post upgrade', 'Letsatsi Engineering', 'Technical scoring', 'High Court', 'Judgment reserved', 'red', 64],
    ['APL-26-006', REF, 'Furniture framework', 'Tswelelo Supplies', 'Disqualification (tax clearance)', 'Accounting Officer', 'Response due 26 Sep', 'amber', 5],
  ];
  register(K(10), () => {
    const item = a => ({ title: `${a[0]} · ${a[3]}`, meta: `${a[2]} · day ${a[8]}`, pill: a[6], tone: a[7] });
    const col = stage => APPEALS.filter(a => a[5] === stage).map(item);
    return {
      crumbs: ['Tenders', 'Appeals & adjudication'],
      kpis: [
        { label: 'Appeals lodged FY', value: '6', sub: '38 tenders (16%)', tone: 'blue' },
        { label: 'Open', value: '3', delta: '1 in High Court', deltaTone: 'red', sub: '', tone: 'amber' },
        { label: 'Upheld / dismissed', value: '1 / 2', sub: 'closed cases', tone: 'green' },
        { label: 'Avg time to decision', value: '16 days', sub: 'closed cases', tone: 'violet' },
        { label: REF.slice(0, 12) + ' window', value: 'Not open', delta: 'starts on award', deltaTone: 'amber', sub: '14 days', tone: 'cyan' },
      ],
      insight: { finding: 'Tswelelo Supplies has complained about its disqualification from ' + REF + '. The BURS record shows the tax clearance expired on <b>31 Jul</b>, before bid closing, so the complaint is unlikely to succeed. Separately, APL-26-005 (Kasane) has been in the High Court for <b>64 days</b> and holds a contract of BWP 6.4M.', recommendation: 'Answer Tswelelo with the BURS evidence by 26 Sep and ask the Attorney General for a date on APL-26-005.', severity: 'Medium', tone: 'amber' },
      grid: [
        [{ span: 12, type: 'steps', title: 'Complaint and appeal path',
          steps: [{ name: 'Complaint to Accounting Officer', meta: '7 days to respond', state: 'current' }, { name: 'Independent Review Committee', meta: 'PPRA · 14 days' }, { name: 'Magistrate court', meta: 'first instance' }, { name: 'High Court', meta: 'review' }, { name: 'Court of Appeal', meta: 'final decision' }] }],
        [{ span: 12, type: 'kanban', title: 'Appeals board', height: 260, columns: [
          { name: 'Accounting Officer', tone: 'amber', items: col('Accounting Officer') },
          { name: 'Review Committee', tone: 'blue', items: col('Review Committee') },
          { name: 'Magistrate court', tone: 'violet', items: [] },
          { name: 'High Court', tone: 'red', items: col('High Court') },
          { name: 'Closed', tone: 'green', items: col('Closed') },
        ] }],
        [
          { span: 4, type: 'donut', title: 'Grounds of appeal', height: 250, items: [{ name: 'Evaluation / scoring', value: 2 }, { name: 'Criteria changed', value: 1 }, { name: 'Conflict of interest', value: 1 }, { name: 'Disqualification', value: 1 }, { name: 'Late bid', value: 1 }] },
          { span: 8, type: 'table', title: 'Appeals register', height: 250,
            columns: [{ key: 'id', label: 'Appeal' }, { key: 'ref', label: 'Tender' }, { key: 'b', label: 'Appellant' }, { key: 'g', label: 'Ground' }, { key: 'st', label: 'Stage' }, { key: 'd', label: 'Days', align: 'right' }, { key: 'o', label: 'Outcome' }],
            rows: APPEALS.map(([id, ref, , b, g, st, o, tone, d]) => ({ id, ref: ref === REF ? { strong: ref } : ref, b, g, st, d, o: { pill: o, tone } })) },
        ],
      ],
    };
  });
})();
