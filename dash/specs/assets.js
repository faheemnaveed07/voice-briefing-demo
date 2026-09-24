/* Menu 10: Asset Management (all 12 tabs, 9-0 … 9-11).
 * "What do we own, where is it, who is responsible, what condition, what is it costing, are we using it?"
 * Lifecycle: acquisition > registration > assignment > location > utilisation > maintenance >
 * depreciation > impairment > transfer > disposal. National net book value anchors at BWP 3.4bn.
 */
(function () {
  const { register, fmt, rng, C } = DASH;
  const { MONTHS, MONTH_NOW, MINISTRIES, TOWNS, SUPPLIERS, OFFICERS, PROJECTS, M } = DASH.data;
  const K = n => `9-${n}`;
  const crumbs = ['All Ministries', 'National asset register', 'FY 2026-27'];
  const sum = (a, f) => a.reduce((s, x) => s + f(x), 0);
  const by = (arr, f, dir = -1) => [...arr].sort((a, b) => dir * (f(a) - f(b)));
  const bn = v => `BWP ${(v / 1e9).toFixed(2)}bn`;

  // Asset classes: [name, code, count, NBV BWP M, gross cost BWP M, useful life yrs, tone]. NBV sums to 3,400M.
  const CLASSES = [
    ['Buildings & facilities', 'BLD', 1284, 1690, 2410, 40, 'blue'],
    ['Vehicles & fleet', 'VEH', 4812, 612, 1180, 7, 'cyan'],
    ['Plant & machinery', 'PLT', 1146, 384, 690, 12, 'violet'],
    ['Medical equipment', 'MED', 9870, 318, 604, 8, 'green'],
    ['ICT equipment', 'ICT', 38450, 196, 512, 4, 'amber'],
    ['Generators', 'GEN', 1042, 112, 188, 10, 'orange'],
    ['Furniture & fittings', 'FUR', 64300, 88, 231, 10, 'pink'],
  ].map(([name, code, count, nbv, cost, life, tone]) => ({ name, code, count, nbv: nbv * M, cost: cost * M, life, tone }));
  const CL = Object.fromEntries(CLASSES.map(c => [c.code, c]));
  const NBV = sum(CLASSES, c => c.nbv), COST = sum(CLASSES, c => c.cost), COUNT = sum(CLASSES, c => c.count);
  const MIN_SHARE = [0.21, 0.17, 0.19, 0.09, 0.14, 0.08, 0.06, 0.06]; // Health, Education, Transport, Agriculture, Defence, Water, Energy, ICT
  const BY_MIN = MINISTRIES.map((m, i) => ({ name: m.name, full: m.full, nbv: NBV * MIN_SHARE[i], count: Math.round(COUNT * [0.24, 0.26, 0.1, 0.07, 0.13, 0.07, 0.05, 0.08][i]) }));

  // Location hubs (district asset holdings) for GIS.
  const HUBS = [
    ['Gaborone', 1180, 38200, 97], ['Francistown', 412, 14100, 93], ['Maun', 238, 8300, 88], ['Serowe', 164, 6900, 91], ['Palapye', 196, 5200, 94],
    ['Selebi-Phikwe', 142, 4800, 86], ['Kasane', 118, 3900, 82], ['Molepolole', 156, 6100, 95], ['Lobatse', 131, 4700, 92],
    ['Mahalapye', 122, 4600, 89], ['Ghanzi', 96, 3100, 74], ['Tsabong', 78, 2400, 71], ['Jwaneng', 88, 2900, 93], ['Letlhakane', 63, 2100, 87], ['Shakawe', 34, 1300, 68],
  ].map(([town, nbvM, count, verified]) => ({ town, nbv: nbvM * M, count, verified, lon: TOWNS[town][0], lat: TOWNS[town][1] }));
  // HUB NBV is scaled so the map total equals the national NBV.
  const hubScale = NBV / sum(HUBS, h => h.nbv);
  HUBS.forEach(h => (h.nbv *= hubScale));

  // Sample register rows.
  const DESCR = {
    BLD: ['Clinic block', 'Staff housing unit', 'District office', 'Classroom block', 'Warehouse'],
    VEH: ['Toyota Land Cruiser 4x4', 'Toyota Hilux D/C', 'Ambulance (Mercedes Sprinter)', 'Nissan NP200', 'Isuzu 8-tonne truck'],
    PLT: ['Motor grader CAT 140', 'Water bowser 10kL', 'Tractor JD 5075', 'Backhoe loader', 'Borehole pump set'],
    MED: ['Digital X-ray unit', 'Ultrasound scanner', 'Anaesthesia machine', 'Patient monitor', 'Autoclave 150L'],
    ICT: ['Dell Latitude laptop', 'HP ProDesk desktop', 'Cisco core switch', 'Dell PowerEdge server', 'Epson projector'],
    GEN: ['Generator 250 kVA', 'Generator 100 kVA', 'Generator 60 kVA', 'Solar hybrid inverter', 'Generator 20 kVA'],
    FUR: ['Hospital bed (electric)', 'Office desk set', 'Boardroom table', 'Steel filing cabinet', 'Classroom desks (lot 40)'],
  };
  const UNIT = { BLD: [2.5, 28], VEH: [0.35, 1.4], PLT: [0.4, 3.8], MED: [0.15, 3.2], ICT: [0.012, 0.9], GEN: [0.08, 1.1], FUR: [0.004, 0.06] };
  const CONDS = [['Good', 'green'], ['Fair', 'blue'], ['Poor', 'amber'], ['Unserviceable', 'red']];
  const REG = Array.from({ length: 28 }, (_, i) => {
    const r = rng('asset' + i);
    const code = ['BLD', 'VEH', 'VEH', 'PLT', 'MED', 'MED', 'ICT', 'ICT', 'GEN', 'FUR'][i % 10];
    const cost = r.num(...UNIT[code]) * M; const age = r.int(1, CL[code].life + 3);
    const nbv = Math.max(cost * 0.05, cost * (1 - age / CL[code].life));
    const hub = r.pick(HUBS); const min = r.pick(MINISTRIES);
    const cond = age > CL[code].life ? r.pick([2, 3]) : age > CL[code].life * 0.6 ? r.pick([1, 2]) : r.pick([0, 0, 1]);
    return { tag: `MOF/${code}/${String(r.int(10000, 99999))}`, code, cls: CL[code].name, desc: r.pick(DESCR[code]), town: hub.town, min: min.name, custodian: r.pick(OFFICERS), cost, nbv, age, cond, util: r.int(12, 96), acq: 2026 - age };
  });
  const condPill = c => ({ pill: CONDS[c][0], tone: CONDS[c][1] });

  // ── 0 Asset Register ──
  register(K(0), () => ({
    crumbs,
    kpis: [
      { label: 'Net book value', value: 'BWP 3.4bn', delta: '▲ 2.1% vs FY25', sub: 'national, all ministries', tone: 'blue', pct: 100 },
      { label: 'Assets on register', value: fmt.n(COUNT), sub: `${CLASSES.length} asset classes`, tone: 'cyan' },
      { label: 'Gross cost', value: bn(COST), delta: fmt.pct((NBV / COST) * 100), sub: 'NBV ÷ cost', tone: 'violet', pct: (NBV / COST) * 100 },
      { label: 'Physically verified', value: '91%', delta: '▼ 3 pts', deltaTone: 'amber', sub: 'annual count FY25', tone: 'green', pct: 91 },
      { label: 'GIS-tagged', value: '78%', sub: 'immovable + fleet 100%', tone: 'teal', pct: 78 },
    ],
    insight: { finding: 'Buildings hold <b>50%</b> of national asset value but furniture and ICT make up <b>85%</b> of tagged items. ICT equipment has the lowest NBV-to-cost ratio (38%), so a large part of the laptop and server estate is near end of life.', recommendation: 'Budget a three-year ICT refresh (about BWP 110M) in the FY 2027-28 development estimates.', severity: 'Medium', tone: 'amber' },
    grid: [
      [
        { span: 7, type: 'treemap', title: 'Net book value by asset class', height: 290, valueFmt: fmt.bwp, items: CLASSES.map(c => ({ name: c.name, value: c.nbv, color: c.tone })) },
        { span: 5, type: 'bar', title: 'Net book value by ministry (BWP M)', height: 290, horizontal: true, categories: BY_MIN.map(m => m.name),
          series: [{ name: 'NBV', data: BY_MIN.map(m => Math.round(m.nbv / M)), color: 'blue', label: true }] },
      ],
      [
        { span: 12, type: 'table', title: 'Asset register | sample of latest records', height: 300,
          columns: [{ key: 'tag', label: 'Asset tag' }, { key: 'desc', label: 'Description' }, { key: 'cls', label: 'Class' }, { key: 'min', label: 'Ministry' }, { key: 'town', label: 'Location' }, { key: 'cust', label: 'Custodian' }, { key: 'cost', label: 'Cost', align: 'right' }, { key: 'nbv', label: 'NBV', align: 'right' }, { key: 'cond', label: 'Condition' }],
          rows: REG.map(a => ({ tag: a.tag, desc: { strong: a.desc }, cls: a.cls, min: a.min, town: a.town, cust: a.custodian, cost: fmt.n(Math.round(a.cost)), nbv: fmt.n(Math.round(a.nbv)), cond: condPill(a.cond) })) },
      ],
    ],
  }));

  // ── 1 Acquisition & Registration ──
  const clinic = PROJECTS.find(p => p.name === 'Construction of Clinic');
  register(K(1), () => {
    const r = rng('acq');
    const acq = MONTHS.slice(0, MONTH_NOW).map(() => r.num(14, 38));
    const days = MONTHS.slice(0, MONTH_NOW).map(() => r.int(12, 44));
    const BACK = [
      ['GRN-26-11842', 'Ultrasound scanners x6', 'Okavango Medical Supplies', 'Health', 2.9, 52], ['GRN-26-11790', 'Toyota Hilux D/C x12', 'Makgadikgadi Fleet Services', 'Agriculture', 6.1, 47],
      ['GRN-26-12031', 'Laptops x240', 'Chobe ICT Solutions', 'Education', 3.4, 41], ['GRN-26-12102', 'Generator 250 kVA x3', 'Kalahari Energy Systems', 'Water', 1.7, 38],
      ['GRN-26-12230', 'Hospital beds x80', 'Pula Office Solutions', 'Health', 2.2, 33], ['PC-KAS-104', 'Kasane Health Post (project capitalisation)', 'Motswedi Construction', 'Health', 6.4, 29],
      ['GRN-26-12291', 'Core network switches x14', 'Chobe ICT Solutions', 'ICT', 0.9, 21],
    ];
    return {
      crumbs,
      kpis: [
        { label: 'Acquired FY to date', value: fmt.bwp(sum(acq, v => v) * M), delta: '4,812 items', deltaTone: 'blue', sub: 'Apr–Sep', tone: 'blue' },
        { label: 'Registered ≤ 30 days', value: '72%', delta: '▼ target 95%', deltaTone: 'red', sub: 'of deliveries', tone: 'amber', pct: 72 },
        { label: 'Registration backlog', value: '1,346', delta: fmt.bwp(sum(BACK, b => b[4]) * M * 1.9), deltaTone: 'amber', sub: 'items not tagged', tone: 'orange' },
        { label: 'Avg days GRN → tag', value: `${Math.round(sum(days, v => v) / days.length)}`, sub: 'target 14 days', tone: 'violet' },
        { label: 'Capitalised from projects', value: 'BWP 64.2M', delta: `Clinic ${fmt.bwp(clinic.approved)} FY27`, deltaTone: 'blue', sub: '', tone: 'cyan' },
      ],
      insight: { finding: `<b>1,346 items</b> received since April are not yet on the register; the oldest (six ultrasound scanners, BWP 2.9M) has been waiting <b>52 days</b>. Untagged assets cannot be insured, assigned or verified.`, recommendation: 'Block supplier payment release until the asset tag number is captured on the GRN.', severity: 'High', tone: 'orange' },
      grid: [
        [
          { span: 8, type: 'bar', title: 'Monthly acquisitions (BWP M) and days to register', height: 280, categories: MONTHS.slice(0, MONTH_NOW), y2: ' ',
            series: [{ name: 'Acquired', data: acq.map(v => +v.toFixed(1)), color: 'blue' }, { name: 'Days GRN → tag', type: 'line', axis: 1, data: days, color: 'amber', markLine: { value: 14, label: '14 d', tone: 'green' } }] },
          { span: 4, type: 'funnel', title: 'Delivery to register (items, FY)', height: 280, items: [{ name: 'Delivered', value: 4812 }, { name: 'Tagged', value: 3988 }, { name: 'Registered', value: 3466 }, { name: 'Assigned', value: 3120 }, { name: 'Geo-tagged', value: 2704 }] },
        ],
        [
          { span: 4, type: 'donut', title: 'Acquisition method (value)', height: 270, center: fmt.bwp(sum(acq, v => v) * M), valueFmt: v => `BWP ${v}M`, legendOff: false,
            items: [{ name: 'Purchase (tender)', value: 71.2 }, { name: 'Project capitalisation', value: 64.2 }, { name: 'Donor-funded', value: 18.6 }, { name: 'Transfer in', value: 7.4 }, { name: 'Finance lease', value: 5.9 }] },
          { span: 8, type: 'table', title: 'Registration backlog | oldest first', height: 270,
            columns: [{ key: 'grn', label: 'GRN / ref' }, { key: 'd', label: 'Items' }, { key: 's', label: 'Supplier' }, { key: 'v', label: 'Value (M)', align: 'right' }, { key: 'a', label: 'Waiting', align: 'right' }, { key: 'st', label: 'Status' }],
            rows: BACK.map(([grn, d, s, m, v, a]) => ({ grn, d: { strong: d }, s, v: v.toFixed(1), a: `${a} d`, st: a > 45 ? { pill: 'Escalated', tone: 'red' } : a > 30 ? { pill: 'Overdue', tone: 'orange' } : { pill: 'In progress', tone: 'blue' } })) },
        ],
      ],
    };
  });

  // ── 2 Assignment & Custodians ──
  const CUST = [
    ['Director Health Infrastructure', 'Health', 3120, 214], ['Principal, Serowe SSS', 'Education', 1840, 31], ['Fleet Manager, CTO Gaborone', 'Transport', 1210, 402],
    ['Hospital Superintendent, Maun', 'Health', 2480, 96], ['Director ICT', 'ICT', 6130, 118], ['District Agric Coordinator, Ghanzi', 'Agriculture', 690, 44],
    ['Station Commander, Jwaneng', 'Defence', 540, 38], ['Water Utilities Area Manager, Tsabong', 'Water', 410, 57],
  ];
  register(K(2), () => ({
    crumbs,
    kpis: [
      { label: 'Assets assigned', value: '93.4%', sub: 'to a named custodian', tone: 'green', pct: 93.4 },
      { label: 'Unassigned assets', value: fmt.n(Math.round(COUNT * 0.066)), delta: 'BWP 96.2M', deltaTone: 'amber', sub: 'no accountable officer', tone: 'amber' },
      { label: 'Custodians', value: '2,318', sub: 'officers with assets', tone: 'blue' },
      { label: 'Acknowledgements signed', value: '81%', delta: '▼ 440 outstanding', deltaTone: 'red', sub: 'custody forms', tone: 'violet', pct: 81 },
      { label: 'Custodians who left service', value: '37', delta: 'assets not handed back', deltaTone: 'red', sub: '', tone: 'red' },
    ],
    insight: { finding: '<b>37 officers</b> who have resigned, retired or transferred still hold 612 assets worth BWP 8.9M on the register, including 41 laptops and 6 vehicles.', recommendation: 'Link HR exit clearance to the asset register so final salary is held until custody is transferred.', severity: 'High', tone: 'orange', actions: ['Explain finding', 'List assets', 'Notify Director HR'] },
    grid: [
      [
        { span: 7, type: 'sankey', title: 'Asset value flow | class → ministry (BWP M)', height: 300,
          nodes: [...CLASSES.slice(0, 5).map(c => c.name), ...BY_MIN.slice(0, 5).map(m => m.name)],
          links: CLASSES.slice(0, 5).flatMap((c, i) => BY_MIN.slice(0, 5).map((m, j) => ({ source: c.name, target: m.name, value: Math.round((c.nbv / M) * [[0.3, 0.3, 0.1, 0.1, 0.2], [0.2, 0.1, 0.35, 0.2, 0.15], [0.05, 0.05, 0.6, 0.2, 0.1], [0.9, 0.02, 0.02, 0.02, 0.04], [0.2, 0.45, 0.1, 0.1, 0.15]][i][j]) }))) },
        { span: 5, type: 'donut', title: 'Custody status (items)', height: 300, center: fmt.n(COUNT),
          items: [{ name: 'Assigned, acknowledged', value: Math.round(COUNT * 0.757), color: 'green' }, { name: 'Assigned, not signed', value: Math.round(COUNT * 0.177), color: 'amber' }, { name: 'Pool / unassigned', value: Math.round(COUNT * 0.061), color: 'slate' }, { name: 'Custodian exited', value: 612, color: 'red' }] },
      ],
      [
        { span: 5, type: 'bar', title: 'Unsigned custody forms by ministry', height: 260, categories: MINISTRIES.map(m => m.name), rotate: 30,
          series: [{ name: 'Forms outstanding', label: true, data: [96, 118, 61, 42, 33, 38, 22, 30].map(v => ({ value: v, itemStyle: { color: v > 90 ? C.red : v > 50 ? C.amber : C.blue } })) }] },
        { span: 7, type: 'table', title: 'Largest custodians', height: 260,
          columns: [{ key: 'n', label: 'Custodian' }, { key: 'm', label: 'Ministry' }, { key: 'c', label: 'Items', align: 'right' }, { key: 'v', label: 'Value (M)', align: 'right' }, { key: 's', label: 'Acknowledged' }],
          rows: by(CUST, c => c[3]).map(([n, m, c, v], i) => { const a = [96, 62, 88, 71, 54, 100, 92, 79][i]; return { n: { strong: n }, m, c: fmt.n(c), v: String(v), s: { bar: a, tone: a < 70 ? 'red' : a < 90 ? 'amber' : 'green' } }; }) },
      ],
    ],
  }));

  // ── 3 Asset Location Map (GIS) ──
  const verTone = v => (v >= 92 ? 'green' : v >= 85 ? 'cyan' : v >= 75 ? 'amber' : 'red');
  register(K(3), () => ({
    crumbs: [...crumbs, 'GIS'],
    kpis: [
      { label: 'Locations mapped', value: '1,742', sub: `${HUBS.length} districts`, tone: 'blue' },
      { label: 'Immovable assets geo-tagged', value: '100%', sub: '1,284 buildings', tone: 'green', pct: 100 },
      { label: 'Fleet with live GPS', value: '82%', delta: '866 without tracker', deltaTone: 'amber', sub: '', tone: 'cyan', pct: 82 },
      { label: 'Gaborone share of value', value: fmt.pct((HUBS[0].nbv / NBV) * 100), sub: fmt.bwp(HUBS[0].nbv), tone: 'violet', pct: (HUBS[0].nbv / NBV) * 100 },
      { label: 'Lowest verification', value: 'Shakawe 68%', delta: '▼ 11 pts', deltaTone: 'red', sub: '', tone: 'red', pct: 68 },
    ],
    insight: { finding: 'Remote districts have the weakest verification: <b>Shakawe (68%)</b>, <b>Tsabong (71%)</b> and <b>Ghanzi (74%)</b>, against a national 91%. These three also carry the highest share of missing items.', recommendation: 'Schedule a mobile verification team for the western districts in Q3, using GPS-stamped scans.', severity: 'Medium', tone: 'amber' },
    grid: [
      [
        { span: 8, type: 'map', title: 'Asset holdings by district | coloured by verification rate', height: 440, legend: [['≥ 92%', 'green'], ['85–91%', 'cyan'], ['75–84%', 'amber'], ['< 75%', 'red']],
          pins: HUBS.map(h => ({ name: `${h.town} | ${fmt.bwp(h.nbv)}`, lon: h.lon, lat: h.lat, tone: verTone(h.verified), size: 7 + Math.sqrt(h.nbv / M) * 0.45, meta: `${fmt.n(h.count)} assets · NBV ${fmt.bwp(h.nbv)}<br>Verified ${h.verified}%` })) },
        { span: 4, type: 'list', title: 'District holdings', height: 440,
          items: by(HUBS, h => h.nbv).map(h => ({ title: h.town, meta: `${fmt.n(h.count)} assets · verified ${h.verified}%`, value: fmt.bwp(h.nbv), tone: verTone(h.verified) })) },
      ],
      [
        { span: 7, type: 'bar', title: 'Assets by district and class (items, thousands)', height: 240, categories: by(HUBS, h => h.count).slice(0, 10).map(h => h.town), rotate: 0,
          series: [['Furniture', 0.53, 'pink'], ['ICT', 0.32, 'amber'], ['Medical', 0.08, 'green'], ['Other', 0.07, 'slate']].map(([name, sh, color]) => ({ name, stack: 'c', color, data: by(HUBS, h => h.count).slice(0, 10).map(h => +((h.count * sh) / 1000).toFixed(1)) })) },
        { span: 5, type: 'stats', title: 'GIS data quality', cols: 2, items: [
          { label: 'Buildings with polygons', value: '1,196', sub: '93% of buildings', tone: 'green' },
          { label: 'Coordinates > 1 km off', value: '48', sub: 'flagged for re-survey', tone: 'amber' },
          { label: 'Vehicles outside district', value: '27', sub: 'last 7 days', tone: 'orange' },
          { label: 'Sites with no coordinates', value: '14', sub: 'rural posts', tone: 'red' },
        ] },
      ],
    ],
  }));

  // ── 4 Condition ──
  const COND_MIX = { BLD: [48, 34, 14, 4], VEH: [38, 31, 19, 12], PLT: [33, 36, 20, 11], MED: [41, 33, 17, 9], ICT: [36, 29, 21, 14], GEN: [30, 34, 24, 12], FUR: [44, 35, 15, 6] };
  register(K(4), () => {
    const wCond = i => sum(CLASSES, c => c.nbv * COND_MIX[c.code][i]) / NBV;
    const regions = ['South-East', 'Central', 'North-East', 'North-West', 'Kgalagadi', 'Ghanzi'];
    const r = rng('condheat');
    const heat = [];
    CLASSES.forEach((c, y) => regions.forEach((g, x) => heat.push([x, y, Math.round(Math.min(95, Math.max(35, 82 - COND_MIX[c.code][3] * 1.4 - (x > 2 ? r.num(6, 18) : r.num(0, 6)))))])));
    return {
      crumbs,
      kpis: [
        { label: 'Good condition', value: fmt.pct(wCond(0)), sub: 'by value', tone: 'green', pct: wCond(0) },
        { label: 'Fair', value: fmt.pct(wCond(1)), sub: 'by value', tone: 'blue', pct: wCond(1) },
        { label: 'Poor', value: fmt.pct(wCond(2)), delta: '▲ 2 pts vs FY25', deltaTone: 'red', sub: '', tone: 'amber', pct: wCond(2) },
        { label: 'Unserviceable', value: fmt.pct(wCond(3)), delta: fmt.bwp((NBV * wCond(3)) / 100), deltaTone: 'red', sub: 'NBV', tone: 'red', pct: wCond(3) },
        { label: 'Assessed ≤ 12 months', value: '84%', sub: 'condition survey', tone: 'cyan', pct: 84 },
      ],
      insight: { finding: 'ICT equipment and vehicles have the highest unserviceable share (<b>14%</b> and <b>12%</b>). Generators in the north-west and Kgalagadi regions score lowest of any class (51–57), and they back up clinics with unreliable grid supply.', recommendation: 'Prioritise generator replacement at the 11 remote clinics rated Poor before the rainy season.', severity: 'Medium', tone: 'amber' },
      grid: [
        [
          { span: 6, type: 'bar', title: 'Condition mix by class (% of items)', height: 290, horizontal: true, categories: CLASSES.map(c => c.name), labelMax: 22,
            series: CONDS.map(([n, t], i) => ({ name: n, stack: 'c', color: t, data: CLASSES.map(c => COND_MIX[c.code][i]) })) },
          { span: 6, type: 'heatmap', title: 'Condition score | class × region (100 = as new)', height: 290, x: regions, y: CLASSES.map(c => c.name), values: heat, min: 48, max: 76, colors: ['#EF4444', '#F59E0B', '#10B981'] },
        ],
        [
          { span: 12, type: 'table', title: 'High-value assets in Poor or Unserviceable condition', height: 260,
            columns: [{ key: 'tag', label: 'Asset tag' }, { key: 'd', label: 'Description' }, { key: 'l', label: 'Location' }, { key: 'age', label: 'Age (yrs)', align: 'right' }, { key: 'life', label: 'Life used' }, { key: 'nbv', label: 'NBV', align: 'right' }, { key: 'c', label: 'Condition' }, { key: 'a', label: 'Recommended action' }],
            rows: by(REG.filter(a => a.cond >= 2), a => a.cost).map(a => ({ tag: a.tag, d: { strong: a.desc }, l: a.town, age: a.age, life: { bar: Math.min(100, (a.age / CL[a.code].life) * 100), tone: a.age > CL[a.code].life ? 'red' : 'amber' }, nbv: fmt.n(Math.round(a.nbv)), c: condPill(a.cond), a: a.cond === 3 ? 'Board of survey' : a.age >= CL[a.code].life ? 'Replace' : 'Repair' })) },
        ],
      ],
    };
  });

  // ── 5 Utilisation ──
  register(K(5), () => {
    const r = rng('util');
    const series = [['Vehicles', 64, 'cyan'], ['Medical equipment', 71, 'green'], ['Plant', 48, 'violet'], ['Generators', 22, 'orange']].map(([name, base, color]) => ({ name, color, data: MONTHS.slice(0, MONTH_NOW).map(() => Math.round(base + r.num(-6, 6))) }));
    const veh = Array.from({ length: 34 }, (_, i) => { const q = rng('veh' + i); const km = q.int(300, 3800); return { name: `B ${q.int(100, 999)} ${['BCA', 'BDF', 'AOK', 'BGH'][i % 4]}`, x: km, y: +(Math.max(1.6, 14 - km / 380 + q.num(-1.5, 3))).toFixed(1), tone: km < 800 ? 'red' : km < 1500 ? 'amber' : 'cyan' }; });
    const IDLE = REG.filter(a => a.util < 30 && a.code !== 'BLD').slice(0, 8);
    return {
      crumbs,
      kpis: [
        { label: 'Fleet utilisation', value: '64%', delta: 'target 75%', deltaTone: 'amber', sub: 'days in use', tone: 'cyan', pct: 64 },
        { label: 'Idle > 90 days', value: '1,912', delta: fmt.bwp(41.8 * M), deltaTone: 'red', sub: 'NBV not in use', tone: 'red' },
        { label: 'Avg km per vehicle', value: '1,870', sub: 'per month', tone: 'blue' },
        { label: 'Medical equipment uptime', value: '89%', sub: 'imaging + theatre', tone: 'green', pct: 89 },
        { label: 'Under-used office space', value: '14%', sub: 'of floor area', tone: 'amber', pct: 14 },
      ],
      insight: { finding: `<b>${veh.filter(v => v.x < 800).length} of ${veh.length}</b> sampled government vehicles drove less than 800 km a month and cost more than BWP 9 per km to run, against a fleet average of BWP 5.2. Most are allocated to head-office units in Gaborone.`, recommendation: 'Move under-used head-office vehicles into the district transport pool and suspend new vehicle purchases for those units.', severity: 'Medium', tone: 'amber' },
      grid: [
        [
          { span: 6, type: 'gauge', title: 'Utilisation by class (latest month)', height: 270, gauges: series.slice(0, 3).map(s => ({ name: s.name, value: s.data[MONTH_NOW - 1], good: 75, warn: 55 })) },
          { span: 6, type: 'line', title: 'Monthly utilisation trend (%)', height: 270, categories: MONTHS.slice(0, MONTH_NOW), series: series.map(s => ({ ...s, markLine: s.name === 'Vehicles' ? { value: 75, label: '75%', tone: 'green' } : undefined })) },
        ],
        [
          { span: 6, type: 'scatter', title: 'Vehicles | monthly km vs running cost per km', height: 280, xName: 'km per month', yName: 'BWP / km', xMin: 0, xMax: 4000, yMin: 0, yMax: 18, points: veh.map(v => ({ ...v, size: 11 })), legend: [['< 800 km', 'red'], ['800–1,500', 'amber'], ['> 1,500', 'cyan']] },
          { span: 6, type: 'table', title: 'Idle or under-used assets', height: 280,
            columns: [{ key: 'tag', label: 'Asset tag' }, { key: 'd', label: 'Description' }, { key: 'l', label: 'Location' }, { key: 'u', label: 'Utilisation' }, { key: 'n', label: 'NBV', align: 'right' }],
            rows: IDLE.map(a => ({ tag: a.tag, d: { strong: a.desc }, l: a.town, u: { bar: a.util, tone: 'red' }, n: fmt.n(Math.round(a.nbv)) })) },
        ],
      ],
    };
  });

  // ── 6 Maintenance & Downtime ──
  register(K(6), () => {
    const r = rng('maint');
    const prev = MONTHS.slice(0, MONTH_NOW).map(() => +r.num(9, 14).toFixed(1));
    const corr = MONTHS.slice(0, MONTH_NOW).map((_, i) => +r.num(15, 22 + i).toFixed(1));
    const down = [['Vehicles & fleet', 11.4], ['Plant & machinery', 16.8], ['Medical equipment', 7.2], ['Generators', 13.9], ['ICT equipment', 3.1], ['Buildings & facilities', 21.5]];
    return {
      crumbs,
      kpis: [
        { label: 'Maintenance cost YTD', value: fmt.bwp((sum(prev, v => v) + sum(corr, v => v)) * M), delta: '▲ 14% vs plan', deltaTone: 'red', sub: '', tone: 'violet' },
        { label: 'Preventive share', value: fmt.pct((sum(prev, v => v) / (sum(prev, v => v) + sum(corr, v => v))) * 100), delta: 'target 60%', deltaTone: 'amber', sub: '', tone: 'amber', pct: (sum(prev, v => v) / (sum(prev, v => v) + sum(corr, v => v))) * 100 },
        { label: 'Due in 30 days', value: '2,184', sub: 'service schedules', tone: 'blue' },
        { label: 'Overdue service', value: '638', delta: '▲ 91 vs Aug', deltaTone: 'red', sub: '', tone: 'red' },
        { label: 'Avg downtime', value: '9.6 days', sub: 'per breakdown', tone: 'orange' },
      ],
      insight: { finding: 'Corrective (breakdown) repairs are <b>63%</b> of maintenance spend and rising each month, while 638 assets are past their service date. Maun hospital lost 19 theatre days this year to anaesthesia-machine breakdowns.', recommendation: 'Put the 120 critical medical and generator assets on a service-level contract with 48-hour response.', severity: 'High', tone: 'orange' },
      grid: [
        [
          { span: 7, type: 'bar', title: 'Maintenance spend | preventive vs corrective (BWP M)', height: 270, categories: MONTHS.slice(0, MONTH_NOW),
            series: [{ name: 'Preventive', stack: 'm', data: prev, color: 'green' }, { name: 'Corrective', stack: 'm', data: corr, color: 'orange' }] },
          { span: 5, type: 'bar', title: 'Average downtime per breakdown (days)', height: 270, horizontal: true, labelMax: 22, categories: by(down, d => d[1]).map(d => d[0]),
            series: [{ name: 'Days', label: true, data: by(down, d => d[1]).map(d => ({ value: d[1], itemStyle: { color: d[1] > 14 ? C.red : d[1] > 9 ? C.amber : C.blue } })) }] },
        ],
        [
          { span: 8, type: 'kanban', title: 'Work orders | this week', height: 280, columns: [
            { name: 'Requested', tone: 'slate', items: [{ title: 'Generator 250 kVA · Tsabong clinic', pill: 'Critical', tone: 'red', meta: 'WO-8841' }, { title: 'Hilux B 482 BCA · brakes', pill: 'Normal', tone: 'blue', meta: 'WO-8846' }] },
            { name: 'Approved', tone: 'blue', items: [{ title: 'X-ray unit · Francistown', pill: 'High', tone: 'orange', meta: 'WO-8812' }, { title: 'Roof leak · Serowe SSS block C', pill: 'Normal', tone: 'blue', meta: 'WO-8799' }] },
            { name: 'In workshop', tone: 'violet', items: [{ title: 'Motor grader CAT 140 · Ghanzi', pill: '23 days', tone: 'red', meta: 'WO-8710' }, { title: 'Ambulance B 219 AOK · Maun', pill: '6 days', tone: 'amber', meta: 'WO-8790' }] },
            { name: 'Awaiting parts', tone: 'amber', items: [{ title: 'Anaesthesia machine · Maun', pill: 'Import', tone: 'red', meta: 'WO-8655' }, { title: 'Server room UPS · Data Centre', pill: 'Batteries', tone: 'amber', meta: 'WO-8801' }] },
          ] },
          { span: 4, type: 'list', title: 'Overdue service | critical assets', height: 280, items: [
            { title: 'Anaesthesia machine · Maun theatre 2', meta: 'Last service 14 months ago', value: '+182 d', tone: 'red' },
            { title: 'Generator 100 kVA · Ghanzi hospital', meta: '1,410 run hours since service', value: '+96 d', tone: 'red' },
            { title: 'Ambulance B 219 AOK', meta: '28,300 km since service', value: '+61 d', tone: 'orange' },
            { title: 'Water bowser · Hukuntsi', meta: 'Annual inspection', value: '+44 d', tone: 'amber' },
            { title: 'Borehole pump set · Shakawe farm', meta: 'Quarterly check', value: '+30 d', tone: 'amber' },
          ] },
        ],
      ],
    };
  });

  // ── 7 Depreciation & Impairment ──
  register(K(7), () => {
    const dep = CLASSES.map(c => (c.cost / c.life) / 2); // half-year charge
    const depTot = sum(dep, v => v);
    const IMP = [['Old Gaborone Records Centre', 'Buildings & facilities', 'Structural damage, vacated', 18.4, 11.2], ['Maun Hospital Wing (WIP)', 'Buildings & facilities', 'Delay, cost overrun', 37.4, 4.1], ['Motor grader fleet (6)', 'Plant & machinery', 'Obsolete, no parts', 7.8, 5.3], ['CT scanner · Francistown', 'Medical equipment', 'Flood damage', 6.2, 6.2], ['Legacy mainframe', 'ICT equipment', 'Technological obsolescence', 3.1, 2.9], ['Tsabong water plant pumps', 'Plant & machinery', 'Idle, pending project', 2.4, 0.9]];
    const impTot = sum(IMP, i => i[4]) * M;
    const opening = NBV + depTot + impTot + 22 * M - 176 * M;
    return {
      crumbs,
      kpis: [
        { label: 'Gross carrying amount', value: bn(COST), sub: 'at cost', tone: 'blue' },
        { label: 'Accumulated depreciation', value: bn(COST - NBV), delta: fmt.pct(((COST - NBV) / COST) * 100), deltaTone: 'amber', sub: 'of cost', tone: 'violet', pct: ((COST - NBV) / COST) * 100 },
        { label: 'Net book value', value: 'BWP 3.4bn', sub: '30 Sep 2026', tone: 'cyan' },
        { label: 'Depreciation YTD', value: fmt.bwp(depTot), sub: 'straight-line, Apr–Sep', tone: 'orange' },
        { label: 'Impairment losses', value: fmt.bwp(impTot), delta: `${IMP.length} assets / groups`, deltaTone: 'red', sub: '', tone: 'red' },
      ],
      insight: { finding: `Six impairment indicators were confirmed this half-year, totalling <b>${fmt.bwp(impTot)}</b>. The largest is the vacated Old Gaborone Records Centre (BWP 11.2M), still carried as an operating building.`, recommendation: 'Reclassify the Records Centre as held for disposal and refer it to the Board of Survey.', severity: 'Medium', tone: 'amber' },
      grid: [
        [
          { span: 7, type: 'waterfall', title: 'NBV movement | 1 Apr to 30 Sep 2026 (BWP M)', height: 290, min: 3000, upTone: 'green', downTone: 'red',
            steps: [{ name: 'Opening NBV', value: Math.round(opening / M), total: true }, { name: 'Additions', value: 176 }, { name: 'Depreciation', value: -Math.round(depTot / M) }, { name: 'Impairment', value: -Math.round(impTot / M) }, { name: 'Disposals', value: -22 }, { name: 'Closing NBV', value: 3400, total: true }] },
          { span: 5, type: 'bar', title: 'Cost vs accumulated depreciation by class (BWP M)', height: 290, rotate: 30, labelMax: 14, categories: CLASSES.map(c => c.name),
            series: [{ name: 'NBV', stack: 'x', data: CLASSES.map(c => Math.round(c.nbv / M)), color: 'blue' }, { name: 'Accumulated depreciation', stack: 'x', data: CLASSES.map(c => Math.round((c.cost - c.nbv) / M)), color: '#1E3A5F' }] },
        ],
        [
          { span: 7, type: 'table', title: 'Impairment register | FY 2026-27', height: 250,
            columns: [{ key: 'a', label: 'Asset' }, { key: 'i', label: 'Indicator' }, { key: 'v', label: 'Carrying (M)', align: 'right' }, { key: 'l', label: 'Loss (M)', align: 'right' }, { key: 's', label: 'Status' }],
            rows: IMP.map(([a, c, i, v, l], k) => ({ a: { strong: a }, i, v: v.toFixed(1), l: { trend: 'down', text: l.toFixed(1), tone: 'red' }, s: k < 3 ? { pill: 'Booked', tone: 'green' } : { pill: 'Awaiting AG', tone: 'amber' } })) },
          { span: 5, type: 'area', title: 'Depreciation charge by month (BWP M)', height: 250, categories: MONTHS,
            series: [{ name: 'Actual', data: MONTHS.map((_, i) => (i < MONTH_NOW ? +((depTot / MONTH_NOW / M) * (1 + i * 0.004)).toFixed(1) : null)), color: 'orange' }, { name: 'Forecast', data: MONTHS.map((_, i) => (i >= MONTH_NOW - 1 ? +((depTot / MONTH_NOW / M) * (1.02 + i * 0.004)).toFixed(1) : null)), color: 'violet', dashed: true }] },
        ],
      ],
    };
  });

  // ── 8 Transfers ──
  const TRF = [
    ['TRF-26-0412', '12 Toyota Hilux D/C', 'Agriculture', 'Water', 4.1, 'In transit', 19], ['TRF-26-0398', 'Borehole drilling rig', 'Water', 'Agriculture', 6.8, 'Received', 0],
    ['TRF-26-0421', '240 laptops', 'ICT', 'Education', 1.2, 'Pending approval', 11], ['TRF-26-0377', 'Mobile clinic trucks x3', 'Defence', 'Health', 3.6, 'Received', 0],
    ['TRF-26-0430', 'Office furniture (lot)', 'Education', 'Health', 0.4, 'In transit', 26], ['TRF-26-0433', 'Generator 250 kVA', 'Energy', 'Health', 0.7, 'Pending approval', 6],
    ['TRF-26-0405', 'Motor grader CAT 140', 'Transport', 'Agriculture', 1.9, 'Disputed', 34],
  ];
  register(K(8), () => ({
    crumbs,
    kpis: [
      { label: 'Transfers YTD', value: '412', sub: 'inter- and intra-ministry', tone: 'blue' },
      { label: 'Value transferred', value: 'BWP 38.6M', sub: 'at NBV', tone: 'violet' },
      { label: 'Pending approval', value: '27', sub: 'Accounting Officer sign-off', tone: 'amber' },
      { label: 'In transit > 14 days', value: '9', delta: 'BWP 5.2M', deltaTone: 'red', sub: 'not received', tone: 'red' },
      { label: 'Register mismatches', value: '14', sub: 'sender ≠ receiver', tone: 'orange' },
    ],
    insight: { finding: 'Nine transfers worth <b>BWP 5.2M</b> have been dispatched but not confirmed by the receiving ministry for more than 14 days, including 12 Hilux vehicles from Agriculture to Water (19 days).', recommendation: 'Require the receiving custodian to confirm on the mobile app within 7 days; after that, escalate automatically to both Accounting Officers.', severity: 'Medium', tone: 'amber' },
    grid: [
      [
        { span: 12, type: 'steps', title: 'Transfer workflow | TRF-26-0412 · 12 Toyota Hilux D/C (Agriculture → Water)',
          steps: [{ name: 'Request raised', state: 'done', meta: '18 Aug' }, { name: 'Sender AO approval', state: 'done', meta: '22 Aug' }, { name: 'Receiver AO approval', state: 'done', meta: '28 Aug' }, { name: 'Condition check', state: 'done', meta: '2 Sep' }, { name: 'Dispatched', state: 'done', meta: '4 Sep' }, { name: 'Receipt confirmed', state: 'late', meta: '19 days in transit' }, { name: 'Register updated', state: 'pending', meta: '' }] },
      ],
      [
        { span: 7, type: 'sankey', title: 'Inter-ministry transfer flow (BWP M, YTD)', height: 280,
          nodes: ['Defence', 'Agriculture', 'Transport', 'ICT', 'Energy', 'Health ', 'Water ', 'Education ', 'Agriculture '],
          links: [{ source: 'Defence', target: 'Health ', value: 7.9 }, { source: 'Agriculture', target: 'Water ', value: 6.3 }, { source: 'Transport', target: 'Agriculture ', value: 5.1 }, { source: 'ICT', target: 'Education ', value: 4.4 }, { source: 'Energy', target: 'Health ', value: 2.2 }, { source: 'Transport', target: 'Water ', value: 3.8 }, { source: 'Defence', target: 'Education ', value: 2.6 }, { source: 'ICT', target: 'Health ', value: 1.9 }] },
        { span: 5, type: 'bar', title: 'Transfers by month (count)', height: 280, categories: MONTHS.slice(0, MONTH_NOW),
          series: [{ name: 'Intra-ministry', stack: 't', data: [48, 52, 39, 61, 57, 44], color: 'blue' }, { name: 'Inter-ministry', stack: 't', data: [14, 18, 11, 22, 26, 20], color: 'violet' }] },
      ],
      [
        { span: 12, type: 'table', title: 'Open transfers', height: 240,
          columns: [{ key: 'id', label: 'Transfer' }, { key: 'a', label: 'Assets' }, { key: 'f', label: 'From' }, { key: 't', label: 'To' }, { key: 'v', label: 'NBV (M)', align: 'right' }, { key: 'd', label: 'Days open', align: 'right' }, { key: 's', label: 'Status' }],
          rows: TRF.map(([id, a, f, t, v, s, d]) => ({ id, a: { strong: a }, f: `Ministry of ${f}`, t: `Ministry of ${t}`, v: v.toFixed(1), d: d ? `${d}` : '—', s: { pill: s, tone: s === 'Received' ? 'green' : s === 'Disputed' ? 'red' : d > 14 ? 'orange' : 'amber' } })) },
      ],
    ],
  }));

  // ── 9 Disposal & Redundancy ──
  const LOTS = [
    ['BOS-26-031', '46 vehicles (beyond economic repair)', 'Vehicles & fleet', 'Public auction', 1.9, 3.4, 'Sold'], ['BOS-26-034', '1,120 desktops and laptops', 'ICT equipment', 'E-waste tender', 0.2, 0.31, 'Sold'],
    ['BOS-26-036', '6 motor graders', 'Plant & machinery', 'Public auction', 2.5, null, 'Advertised'], ['BOS-26-038', 'Old Gaborone Records Centre', 'Buildings & facilities', 'Transfer to Land Board', 7.2, null, 'Board of survey'],
    ['BOS-26-039', '380 hospital beds', 'Furniture & fittings', 'Donation to NGOs', 0.1, 0, 'Approved'], ['BOS-26-041', '14 generators', 'Generators', 'Tender', 0.6, null, 'Board of survey'],
    ['BOS-26-042', 'Obsolete X-ray units x4', 'Medical equipment', 'Scrap (radiation-safe)', 0.3, 0.02, 'Approved'],
  ];
  register(K(9), () => ({
    crumbs,
    kpis: [
      { label: 'Redundant assets identified', value: '6,284', sub: 'idle, obsolete or surplus', tone: 'amber' },
      { label: 'Due for disposal', value: fmt.bwp(18.6 * M), sub: 'NBV of approved lots', tone: 'orange' },
      { label: 'Proceeds YTD', value: 'BWP 3.73M', delta: '▲ 76% above NBV', deltaTone: 'green', sub: 'sold lots', tone: 'green' },
      { label: 'Awaiting Board of Survey', value: '11 lots', delta: '> 120 days: 4', deltaTone: 'red', sub: '', tone: 'red' },
      { label: 'Storage cost of redundant', value: 'BWP 0.9M', sub: 'per year', tone: 'violet' },
    ],
    insight: { finding: 'Vehicles sold at public auction fetched <b>1.8×</b> their NBV, but 4 disposal lots have waited more than 120 days for a Board of Survey while the assets continue to deteriorate and incur storage costs.', recommendation: 'Convene quarterly regional Boards of Survey and move vehicle disposals to an online auction platform.', severity: 'Medium', tone: 'amber' },
    grid: [
      [
        { span: 4, type: 'funnel', title: 'Disposal pipeline (items)', height: 280, items: [{ name: 'Identified', value: 6284 }, { name: 'Surveyed', value: 4410 }, { name: 'Approved', value: 3210 }, { name: 'Advertised', value: 2380 }, { name: 'Disposed', value: 1792 }, { name: 'Derecognised', value: 1640 }] },
        { span: 4, type: 'donut', title: 'Disposal method (items)', height: 280, items: [{ name: 'Public auction', value: 612 }, { name: 'Tender', value: 280 }, { name: 'E-waste recycling', value: 1120 }, { name: 'Transfer / donation', value: 410 }, { name: 'Scrap', value: 166 }] },
        { span: 4, type: 'bar', title: 'Proceeds vs NBV by class (BWP M)', height: 280, categories: ['Vehicles', 'ICT', 'Medical', 'Furniture'],
          series: [{ name: 'NBV', data: [1.9, 0.2, 0.3, 0.1], color: '#1E3A5F' }, { name: 'Proceeds', data: [3.4, 0.31, 0.02, 0], color: 'green' }] },
      ],
      [
        { span: 12, type: 'table', title: 'Disposal lots', height: 260,
          columns: [{ key: 'id', label: 'Lot' }, { key: 'd', label: 'Description' }, { key: 'c', label: 'Class' }, { key: 'm', label: 'Method' }, { key: 'n', label: 'NBV (M)', align: 'right' }, { key: 'p', label: 'Proceeds (M)', align: 'right' }, { key: 's', label: 'Status' }],
          rows: LOTS.map(([id, d, c, m, n, p, s]) => ({ id, d: { strong: d }, c, m, n: n.toFixed(2), p: p == null ? '—' : p.toFixed(2), s: { pill: s, tone: s === 'Sold' ? 'green' : s === 'Board of survey' ? 'amber' : 'blue' } })) },
      ],
    ],
  }));

  // ── 10 Missing, Shortages & Theft ──
  const MISS = { VEH: 6, MED: 38, ICT: 412, GEN: 9, FUR: 1310, PLT: 4 };
  const MISSV = { VEH: 2.9, MED: 1.8, ICT: 3.6, GEN: 0.7, FUR: 0.9, PLT: 0.8 };
  register(K(10), () => {
    const regs = ['South-East', 'Central', 'North-East', 'North-West', 'Kgalagadi', 'Ghanzi'];
    const cls = ['VEH', 'MED', 'ICT', 'GEN', 'FUR'];
    const heat = [];
    const r = rng('miss');
    cls.forEach((c, y) => regs.forEach((g, x) => heat.push([x, y, Math.round((MISS[c] / 6) * r.num(0.4, 1.2) * (x >= 3 ? 1.9 : 1))])));
    return {
      crumbs,
      kpis: [
        { label: 'Not located at count', value: fmt.n(sum(Object.values(MISS), v => v)), delta: '1.5% of items', deltaTone: 'amber', sub: 'FY25 verification', tone: 'amber' },
        { label: 'Value not located', value: fmt.bwp(sum(Object.values(MISSV), v => v) * M), sub: 'NBV', tone: 'orange' },
        { label: 'Confirmed theft cases', value: '64', delta: '▲ 12 vs FY25', deltaTone: 'red', sub: '', tone: 'red' },
        { label: 'Open police cases', value: '29', sub: 'BPS reference captured', tone: 'violet' },
        { label: 'Recovered', value: 'BWP 1.4M', delta: '13%', deltaTone: 'green', sub: 'of value lost', tone: 'green', pct: 13 },
      ],
      insight: { finding: '<b>412 ICT items</b> (BWP 3.6M) could not be located, 60% of them laptops assigned to officers who have since transferred. Six vehicles are missing, two last recorded by GPS near the Kazungula border crossing.', recommendation: 'Hand the two vehicle cases to the Directorate on Corruption and Economic Crime and enable remote wipe on all government laptops.', severity: 'Critical', tone: 'red', actions: ['Explain finding', 'Refer to DCEC', 'Assign officer'] },
      grid: [
        [
          { span: 5, type: 'bar', title: 'Missing items and value by class', height: 280, categories: Object.keys(MISS).map(k => CL[k].name), rotate: 20, labelMax: 14, y2: ' ',
            series: [{ name: 'Items', data: Object.values(MISS), color: 'amber' }, { name: 'Value (BWP M)', type: 'line', axis: 1, data: Object.values(MISSV), color: 'red', smooth: false }] },
          { span: 7, type: 'heatmap', title: 'Items not located | class × region', height: 280, x: regs, y: cls.map(k => CL[k].name), values: heat, min: 0, max: 400, colors: ['#0f2a4d', '#1D4ED8', '#F59E0B', '#EF4444'] },
        ],
        [
          { span: 8, type: 'table', title: 'Loss and theft cases', height: 260,
            columns: [{ key: 'id', label: 'Case' }, { key: 'a', label: 'Asset' }, { key: 'l', label: 'Location' }, { key: 'v', label: 'NBV', align: 'right' }, { key: 'p', label: 'Police ref' }, { key: 's', label: 'Status' }],
            rows: [
              ['LOS-26-118', 'Toyota Land Cruiser B 731 BDF', 'Kasane', 612000, 'CR 214/08/26', 'Under investigation', 'red'], ['LOS-26-121', 'Toyota Hilux B 482 AOK', 'Kasane', 388000, 'CR 219/08/26', 'Under investigation', 'red'],
              ['LOS-26-102', '18 laptops · Education HQ', 'Gaborone', 154000, 'CR 88/06/26', 'Surcharge raised', 'amber'], ['LOS-26-097', 'Ultrasound scanner', 'Ghanzi', 296000, 'CR 41/06/26', 'Recovered', 'green'],
              ['LOS-26-110', 'Solar panels x40 · Hukuntsi', 'Hukuntsi', 118000, 'CR 77/07/26', 'Under investigation', 'red'], ['LOS-26-089', 'Generator 60 kVA', 'Tsabong', 142000, 'CR 19/05/26', 'Written off', 'slate'],
            ].map(([id, a, l, v, p, s, t]) => ({ id, a: { strong: a }, l, v: fmt.n(v), p, s: { pill: s, tone: t } })) },
          { span: 4, type: 'line', title: 'Loss cases reported by month', height: 260, categories: MONTHS.slice(0, MONTH_NOW),
            series: [{ name: 'FY 2026-27', data: [8, 11, 9, 13, 12, 11], color: 'red', area: true }, { name: 'FY 2025-26', data: [7, 8, 9, 8, 10, 9], color: 'slate', dashed: true }] },
        ],
      ],
    };
  });

  // ── 11 Cost Control & Anomalies ──
  const AANOM = [
    ['Repair cost > 60% of asset value', 'Ambulance B 219 AOK · 5 repairs in 8 months', 'BWP 412,000', 'High', 'orange'],
    ['Fuel drawn above tank capacity', 'Hilux B 482 BCA · 142 L on a 80 L tank', 'BWP 2,130', 'Critical', 'red'],
    ['Duplicate asset tag', 'MOF/ICT/48812 on two laptops', '—', 'Medium', 'amber'],
    ['Maintenance on disposed asset', 'Generator 60 kVA (BOS-26-041) serviced 14 Aug', 'BWP 38,600', 'High', 'orange'],
    ['Weekend vehicle use, no trip authority', '4 vehicles · Sat/Sun · 1,860 km', 'BWP 9,700', 'Medium', 'amber'],
    ['Same supplier repairs above quote 3×', 'Makgadikgadi Fleet Services', 'BWP 226,400', 'High', 'orange'],
    ['Insurance premium on written-off vehicle', 'B 110 BGH written off Mar 2026', 'BWP 14,200', 'Low', 'blue'],
  ];
  register(K(11), () => {
    const pts = Array.from({ length: 40 }, (_, i) => { const r = rng('tco' + i); const nbv = r.int(60, 1400); const m = Math.round(nbv * r.num(0.05, 0.45) + (i % 9 === 0 ? nbv * 0.55 : 0)); return { name: `${['Ambulance', 'Hilux', 'Land Cruiser', 'Generator', 'Grader', 'Truck'][i % 6]} ${r.int(100, 999)}`, x: nbv, y: m, tone: m > nbv * 0.6 ? 'red' : m > nbv * 0.35 ? 'amber' : 'cyan', size: 10 }; });
    return {
      crumbs,
      kpis: [
        { label: 'Cost of ownership YTD', value: 'BWP 148.2M', sub: 'fuel, repairs, insurance, licences', tone: 'blue' },
        { label: 'Fuel spend', value: 'BWP 61.4M', delta: '▲ 9% vs plan', deltaTone: 'red', sub: '', tone: 'orange' },
        { label: 'Repair > 60% of NBV', value: String(pts.filter(p => p.tone === 'red').length), delta: 'replace, not repair', deltaTone: 'amber', sub: 'sampled assets', tone: 'red' },
        { label: 'Anomalies flagged', value: '31', delta: '▲ 7 this month', deltaTone: 'red', sub: '', tone: 'amber' },
        { label: 'Recoverable losses', value: 'BWP 0.71M', sub: 'surcharge / supplier refund', tone: 'green' },
      ],
      insight: { finding: 'Makgadikgadi Fleet Services has billed above its approved quotation on <b>3 consecutive repairs</b> of the same ambulance, and the vehicle has now cost 60% of its value in eight months.', recommendation: 'Freeze further repair orders to the supplier, recover BWP 226,400 in excess billing, and replace rather than repair ambulance B 219 AOK.', severity: 'High', tone: 'orange', actions: ['Explain finding', 'Refer to audit', 'Assign officer'] },
      grid: [
        [
          { span: 7, type: 'scatter', title: 'Repair-or-replace | NBV vs maintenance cost YTD (BWP K)', height: 290, xName: 'NBV (BWP K)', yName: 'BWP K', xMin: 0, xMax: 1500, yMin: 0, yMax: 900, points: pts, legend: [['> 60% of NBV', 'red'], ['35–60%', 'amber'], ['< 35%', 'cyan']] },
          { span: 5, type: 'donut', title: 'Anomalies by rule (count)', height: 290, items: [{ name: 'Fuel anomalies', value: 11, color: 'red' }, { name: 'Repair cost vs value', value: 7, color: 'orange' }, { name: 'Register integrity', value: 5, color: 'violet' }, { name: 'Unauthorised use', value: 5, color: 'amber' }, { name: 'Insurance / licences', value: 3, color: 'blue' }] },
        ],
        [
          { span: 12, type: 'table', title: 'Anomaly queue', height: 270,
            columns: [{ key: 'rule', label: 'Rule triggered' }, { key: 'ctx', label: 'Asset / evidence' }, { key: 'amt', label: 'Exposure', align: 'right' }, { key: 'sev', label: 'Severity' }, { key: 'own', label: 'Assigned to' }],
            rows: AANOM.map(([rule, ctx, amt, sev, t], i) => ({ rule: { strong: rule }, ctx, amt, sev: { pill: sev, tone: t }, own: OFFICERS[[5, 8, 9, 3, 7, 2, 5][i]] })) },
        ],
      ],
    };
  });
})();
