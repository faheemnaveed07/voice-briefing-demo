/* Menu 9: Inventory & Warehouse (menu index 8, all 12 tabs).
 * National view: Central Medical Stores + district medical stores, BWP 420M on hand (home tile P420m).
 * Organisation Health anchor: 17 inventory exceptions open. */
(function () {
  const { register, fmt, rng, C } = DASH;
  const { MONTHS, MONTH_NOW, TOWNS, SUPPLIERS, OFFICERS } = DASH.data;
  const K = n => `8-${n}`;
  const crumbs = ['National', 'Central Medical Stores + 7 district stores'];
  const sum = arr => arr.reduce((a, b) => a + b, 0);
  const H = MONTHS.slice(0, MONTH_NOW);

  // ── warehouses: [name, short, town, value BWP M, pallet positions, utilisation %, count accuracy %, shrinkage %] ──
  const WH = [
    ['Central Medical Stores', 'CMS', 'Gaborone', 192, 21000, 88, 98.3, 0.34],
    ['Francistown Regional Stores', 'Francistown', 'Francistown', 66, 7800, 84, 95.9, 0.62],
    ['Maun District Stores', 'Maun', 'Maun', 40, 4200, 79, 95.1, 0.86],
    ['Serowe District Stores', 'Serowe', 'Serowe', 34, 3600, 73, 96.9, 0.78],
    ['Palapye District Stores', 'Palapye', 'Palapye', 28, 3100, 68, 97.3, 0.50],
    ['Kasane District Stores', 'Kasane', 'Kasane', 22, 2400, 94, 93.2, 1.46],
    ['Ghanzi District Stores', 'Ghanzi', 'Ghanzi', 21, 2600, 62, 94.4, 1.12],
    ['Tsabong District Stores', 'Tsabong', 'Tsabong', 17, 2200, 57, 96.3, 1.00],
  ].map(([name, short, town, value, pallets, util, acc, shrink]) => ({ name, short, town, lon: TOWNS[town][0], lat: TOWNS[town][1] + ({ Serowe: 0.15, Palapye: -0.3 }[town] || 0), value, pallets, util, acc, shrink }));
  const TOTAL = sum(WH.map(w => w.value)); // 420

  // ── item groups: [name, value BWP M, turnover ×, ageing >180d share] ──
  const GROUPS = [
    ['Pharmaceuticals', 168, 3.3, 0.09], ['Medical consumables', 92, 3.6, 0.08], ['Lab reagents', 54, 2.4, 0.14], ['PPE', 38, 4.8, 0.12],
    ['Spares & maintenance', 29, 0.9, 0.41], ['Stationery', 14, 5.2, 0.06], ['Uniforms & linen', 13, 1.4, 0.33], ['Cleaning & hygiene', 12, 6.1, 0.04],
  ].map(([name, value, turn, aged]) => ({ name, value, turn, aged }));
  const TURN = sum(GROUPS.map(g => g.value * g.turn)) / TOTAL;
  const DOH = Math.round(365 / TURN);

  // ── tracer items: [item, group, unit, unit cost BWP, avg monthly consumption, short label] ──
  const ITEMS = [
    ['Amoxicillin 500mg caps x100', 'Pharmaceuticals', 'pack', 38, 21000, 'Amoxicillin 500mg'],
    ['Paracetamol 500mg tabs x1000', 'Pharmaceuticals', 'tin', 96, 9800, 'Paracetamol 500mg'],
    ['TLD 300/300/50mg x30 (ARV)', 'Pharmaceuticals', 'bottle', 142, 31000, 'TLD (ARV)'],
    ['Artemether-Lumefantrine 20/120 x24', 'Pharmaceuticals', 'pack', 54, 3200, 'Artemether-Lum.'],
    ['Insulin isophane 100IU/ml 10ml', 'Pharmaceuticals', 'vial', 88, 6400, 'Insulin isophane'],
    ['Oxytocin 10IU/ml amp', 'Pharmaceuticals', 'amp', 9, 14500, 'Oxytocin 10IU'],
    ['Ceftriaxone 1g inj', 'Pharmaceuticals', 'vial', 18, 11200, 'Ceftriaxone 1g'],
    ['Ringer\'s lactate 1L', 'Medical consumables', 'bag', 21, 18600, 'Ringer\'s lactate'],
    ['Syringe 5ml luer x100', 'Medical consumables', 'box', 64, 7400, 'Syringe 5ml'],
    ['IV giving set adult', 'Medical consumables', 'each', 11, 22800, 'IV giving set'],
    ['HIV rapid test kit x100', 'Lab reagents', 'kit', 610, 1450, 'HIV rapid test'],
    ['GeneXpert MTB/RIF cartridge x10', 'Lab reagents', 'box', 1720, 380, 'GeneXpert cartridge'],
    ['Examination gloves nitrile (M) x100', 'PPE', 'box', 58, 26500, 'Nitrile gloves (M)'],
    ['N95 respirator x20', 'PPE', 'box', 145, 3900, 'N95 respirators'],
  ].map(([name, group, unit, cost, amc, sh]) => ({ name, group, unit, cost, amc, sh }));

  // Monthly flows (BWP M): value on hand closes at 420 in September.
  const REC = [108, 116, 121, 104, 125, 118.6];
  const ISS = [105, 109, 113, 107, 118, 114.6];
  const WO = [0.8, 1.1, 0.9, 1.0, 1.2, 0.8];
  const VAL = [402, 408, 415, 411, 417, 420];

  // ── 0 Overview ──
  register(K(0), () => ({
    crumbs,
    kpis: [
      { label: 'Inventory value', value: `BWP ${TOTAL}M`, delta: '▲ 4.5% since Apr', deltaTone: 'amber', sub: '14,260 SKUs', tone: 'blue', pct: 100 },
      { label: 'Stock turnover', value: `${TURN.toFixed(1)}×`, delta: 'target 4.0×', deltaTone: 'amber', sub: `${DOH} days on hand`, tone: 'violet', pct: (TURN / 4) * 100 },
      { label: 'Tracer availability', value: '91%', delta: '▼ 2 pts vs Aug', sub: '120 tracer items', tone: 'cyan', pct: 91 },
      { label: 'Items at stock-out', value: '23', delta: '▲ 5 vs Aug', deltaTone: 'red', sub: 'across all stores', tone: 'orange' },
      { label: 'Inventory exceptions', value: '17', delta: '4 critical', deltaTone: 'red', sub: 'open for review', tone: 'red' },
    ],
    insight: { finding: `Stock on hand has grown to <b>BWP ${TOTAL}M</b> while tracer availability fell to 91%: value is building in slow lines (spares, linen, lab reagents) rather than in the medicines that run out. Kasane is at <b>94%</b> storage utilisation.`, recommendation: 'Freeze replenishment of non-moving spares and redistribute 2,100 pallets of excess consumables from CMS to Kasane and Maun.', severity: 'Medium', tone: 'amber' },
    grid: [
      [
        { span: 7, type: 'bar', title: 'Inventory value by store (BWP M) | utilisation % vs 90% alert', height: 280, categories: WH.map(w => w.short), y2: ' ', gridOpt: { right: 36 },
          series: [{ name: 'Stock value', data: WH.map(w => w.value), color: 'blue', label: true }, { name: 'Utilisation %', type: 'line', axis: 1, smooth: false, data: WH.map(w => w.util), color: 'amber', markLine: { value: 90, label: ' ', tone: 'red' } }] },
        { span: 5, type: 'donut', title: 'Value by item group', height: 280, center: `BWP ${TOTAL}M`, valueFmt: v => `BWP ${v}M`, items: GROUPS.map(g => ({ name: g.name, value: g.value })) },
      ],
      [
        { span: 8, type: 'bar', title: 'Monthly receipts vs issues (BWP M) and closing value', height: 250, categories: H, y2: ' ',
          series: [{ name: 'Receipts', data: REC, color: 'cyan' }, { name: 'Issues', data: ISS, color: 'violet' }, { name: 'Closing value', type: 'line', axis: 1, data: VAL, color: 'amber' }] },
        { span: 4, type: 'gauge', title: 'Health of stock', height: 250, gauges: [{ name: 'Availability', value: 91, good: 95, warn: 85 }, { name: 'Count accuracy', value: 96, good: 98, warn: 94, tone: 'cyan' }] },
      ],
      [
        { span: 12, type: 'table', title: 'Store summary', height: 300,
          columns: [{ key: 'n', label: 'Store' }, { key: 't', label: 'Town' }, { key: 'v', label: 'Value (BWP M)', align: 'right' }, { key: 'sh', label: 'Share', align: 'right' }, { key: 'u', label: 'Utilisation' }, { key: 'a', label: 'Count accuracy', align: 'right' }, { key: 'so', label: 'Stock-outs', align: 'right' }, { key: 's', label: 'Status' }],
          rows: WH.map((w, i) => { const so = [3, 4, 5, 2, 1, 5, 2, 1][i]; return { n: w.name, t: w.town, v: fmt.n(w.value), sh: fmt.pct((w.value / TOTAL) * 100, 1), u: { bar: w.util, tone: w.util > 90 ? 'red' : w.util < 65 ? 'amber' : 'blue' }, a: fmt.pct(w.acc, 1), so, s: w.util > 90 || w.shrink > 1.1 ? { pill: 'Attention', tone: 'red' } : so >= 4 ? { pill: 'Watch', tone: 'amber' } : { pill: 'Normal', tone: 'green' } }; }) },
      ],
    ],
  }));

  // ── 1 Receiving & Inspection ──
  register(K(1), () => {
    const r = rng('grn');
    const passRate = [95.1, 94.6, 93.8, 95.4, 92.7, 94.2];
    return {
      crumbs: [...crumbs, 'Receiving'],
      kpis: [
        { label: 'GRNs this month', value: '1,284', delta: '▲ 6% vs Aug', sub: 'goods received notes', tone: 'blue' },
        { label: 'Value received', value: 'BWP 118.6M', sub: 'September', tone: 'cyan', pct: 62 },
        { label: 'Inspection pass rate', value: '94.2%', delta: '▲ 1.5 pts', sub: 'target 97%', tone: 'green', pct: 94 },
        { label: 'Rejected consignments', value: '38', delta: 'BWP 4.9M', deltaTone: 'red', sub: 'returned or quarantined', tone: 'red' },
        { label: 'Awaiting inspection > 5 days', value: '27', delta: 'cold chain: 4', deltaTone: 'orange', sub: 'held in receiving bay', tone: 'orange' },
      ],
      insight: { finding: '<b>11 of 38</b> rejections this month came from Okavango Medical Supplies (short shelf-life and damaged cartons). Four cold-chain consignments have waited more than five days for QA sign-off at CMS.', recommendation: 'Issue a supplier performance notice and put cold-chain GRNs on a same-day inspection rota.', severity: 'Medium', tone: 'amber' },
      grid: [
        [
          { span: 8, type: 'bar', title: 'Receipts by month (BWP M) | pass rate % vs 97% target', height: 270, categories: H, y2: ' ', gridOpt: { right: 40 },
            series: [{ name: 'Accepted', data: REC.map((v, i) => +(v * passRate[i] / 100).toFixed(1)), stack: 'r', color: 'cyan' }, { name: 'Rejected', data: REC.map((v, i) => +(v * (1 - passRate[i] / 100)).toFixed(1)), stack: 'r', color: 'red' }, { name: 'Pass rate %', type: 'line', axis: 1, data: passRate, color: 'amber', markLine: { value: 97, label: ' ', tone: 'green' } }] },
          { span: 4, type: 'funnel', title: 'Consignment flow | September', height: 270, items: [['Delivered', 1412], ['Counted', 1398], ['Inspected', 1371], ['Accepted', 1284], ['Put away', 1236]].map(([name, value]) => ({ name, value })) },
        ],
        [
          { span: 5, type: 'bar', title: 'Rejection reasons (consignments)', height: 260, horizontal: true, labelMax: 26, gridOpt: { right: 28 }, categories: ['Short expiry (< 12 months)', 'Damaged packaging', 'Quantity short vs PO', 'Cold chain breach', 'Wrong item / spec', 'Missing batch documents'],
            series: [{ name: 'Rejections', label: true, data: [12, 9, 7, 4, 4, 2].map((v, i) => ({ value: v, itemStyle: { color: [C.red, C.orange, C.amber, C.violet, C.blue, C.cyan][i] } })) }] },
          { span: 7, type: 'table', title: 'Latest goods received notes', height: 260,
            columns: [{ key: 'g', label: 'GRN' }, { key: 's', label: 'Supplier' }, { key: 'i', label: 'Item' }, { key: 'v', label: 'Value', align: 'right' }, { key: 'q', label: 'Inspection' }],
            rows: Array.from({ length: 10 }, (_, i) => { const it = ITEMS[r.int(0, ITEMS.length - 1)]; const st = r(); return { g: `GRN-26-${r.int(40000, 49999)}`, s: i === 1 || i === 4 ? 'Okavango Medical' : r.pick(['Naledi Pharmaceuticals', 'Tswelelo Supplies', 'Okavango Medical', 'Pula Office Solutions']), i: it.sh, v: fmt.n(r.int(40, 900) * 1000), q: i === 1 || i === 4 ? { pill: 'Rejected', tone: 'red' } : st > 0.75 ? { pill: 'Pending QA', tone: 'amber' } : { pill: 'Accepted', tone: 'green' } }; }) },
        ],
      ],
    };
  });

  // ── 2 Storage & Utilisation ──
  register(K(2), () => {
    const zones = ['Ambient racking', 'Cold room 2–8°C', 'Freezer', 'Controlled drugs', 'Flammables', 'Bulk floor'];
    const r = rng('zones');
    const values = [];
    WH.forEach((w, x) => zones.forEach((z, y) => values.push([x, y, Math.min(100, Math.round(w.util + r.num(-26, 4) + (y === 1 ? 6 : 0)))])));
    values[5 * 6 + 1][2] = 100; values[5 * 6 + 0][2] = 97; values[0 * 6 + 1][2] = 96; values[7 * 6 + 5][2] = 38;
    const cap = sum(WH.map(w => w.pallets));
    const used = sum(WH.map(w => (w.pallets * w.util) / 100));
    return {
      crumbs: [...crumbs, 'Storage'],
      kpis: [
        { label: 'Pallet positions', value: fmt.n(cap), sub: '8 stores', tone: 'blue' },
        { label: 'Occupied', value: fmt.pct((used / cap) * 100), delta: '▲ 3 pts since Apr', deltaTone: 'amber', sub: `${fmt.n(used)} positions`, tone: 'violet', pct: (used / cap) * 100 },
        { label: 'Cold-chain utilisation', value: '93%', delta: 'Kasane 100%', deltaTone: 'red', sub: '2–8°C rooms', tone: 'red', pct: 93 },
        { label: 'Excess stock (> 9 MOS)', value: 'BWP 31.4M', sub: '7.5% of value', tone: 'amber', pct: 7.5 },
        { label: 'Temperature excursions', value: '6', delta: '▲ 2 vs Aug', deltaTone: 'red', sub: 'this month', tone: 'orange' },
      ],
      insight: { finding: 'Kasane cold room is at <b>100%</b> and its ambient racking at 97%, while Tsabong and Ghanzi have more than 40% free space. CMS holds <b>BWP 31.4M</b> of stock above nine months of supply.', recommendation: 'Move excess consumables from CMS to Ghanzi, and approve the Kasane mobile cold-room hire before the malaria season.', severity: 'High', tone: 'orange' },
      grid: [
        [
          { span: 5, type: 'bar', title: 'Pallet positions | occupied vs free', height: 290, horizontal: true, gridOpt: { right: 24 }, categories: WH.map(w => w.short),
            series: [{ name: 'Occupied', data: WH.map(w => Math.round((w.pallets * w.util) / 100)), stack: 'p', color: 'blue' }, { name: 'Free', data: WH.map(w => Math.round((w.pallets * (100 - w.util)) / 100)), stack: 'p', color: '#1E3A5F' }] },
          { span: 7, type: 'heatmap', title: 'Utilisation % | storage zone × store', height: 290, x: WH.map(w => w.short), y: zones, values, min: 30, max: 100, cellFmt: v => v + '%', valueFmt: v => v + '%', colors: ['#0f2a4d', '#1D4ED8', '#F59E0B', '#EF4444'] },
        ],
        [
          { span: 5, type: 'gauge', title: 'Utilisation by storage class', height: 240, gauges: [{ name: 'Ambient racking', value: 81, tone: 'blue' }, { name: 'Cold chain 2–8°C', value: 93, tone: 'red' }] },
          { span: 7, type: 'table', title: 'Storage condition log | excursions and capacity alerts', height: 240,
            columns: [{ key: 'd', label: 'Date' }, { key: 'w', label: 'Store' }, { key: 'e', label: 'Event' }, { key: 'v', label: 'Exposed (BWP)', align: 'right' }, { key: 's', label: 'Status' }],
            rows: [
              ['19 Sep', 'Kasane', 'Cold room 11.4°C for 3h 20m', '412,000', 'QA review', 'red'],
              ['17 Sep', 'Maun', 'Cold room door open 42 min', '186,000', 'Cleared', 'green'],
              ['15 Sep', 'Kasane', 'Ambient racking above 95%', '—', 'Overflow', 'orange'],
              ['12 Sep', 'CMS', 'Freezer at −12°C (set −20°C)', '94,000', 'Cleared', 'green'],
              ['09 Sep', 'Francistown', 'Controlled-drug cage left unlocked', '—', 'Incident', 'amber'],
              ['04 Sep', 'Ghanzi', 'Roof leak over bay G-14', '38,000', 'Damaged', 'red'],
            ].map(([d, w, e, v, s, t]) => ({ d, w, e, v, s: { pill: s, tone: t } })) },
        ],
      ],
    };
  });

  // ── 3 Transfers ──
  register(K(3), () => {
    const flows = [['CMS Gaborone', 'Francistown', 9.6], ['CMS Gaborone', 'Serowe', 3.1], ['CMS Gaborone', 'Palapye', 2.4], ['CMS Gaborone', 'Ghanzi', 1.9], ['CMS Gaborone', 'Tsabong', 1.6], ['Francistown', 'Maun', 3.4], ['Francistown', 'Kasane', 2.2], ['Serowe', 'Palapye', 0.6]];
    const nodes = [...new Set(flows.flatMap(f => [f[0], f[1]]))];
    const r = rng('trf');
    return {
      crumbs: [...crumbs, 'Transfers'],
      kpis: [
        { label: 'Transfers this month', value: '312', delta: '▲ 18 vs Aug', sub: 'inter-store vouchers', tone: 'blue' },
        { label: 'Value transferred', value: 'BWP 24.8M', sub: '21% of receipts', tone: 'cyan', pct: 21 },
        { label: 'In transit', value: '46', delta: 'BWP 3.9M', sub: 'not yet receipted', tone: 'violet' },
        { label: 'Avg transit time', value: '3.8 days', delta: '▲ 0.6 days', deltaTone: 'red', sub: 'target 3 days', tone: 'amber' },
        { label: 'Receipt discrepancies', value: '9', delta: 'BWP 212K short', deltaTone: 'red', sub: 'dispatched ≠ received', tone: 'red' },
      ],
      insight: { finding: 'Transfers routed through Francistown to Maun and Kasane take <b>6.1 days</b> on average and account for 7 of the 9 short-receipt discrepancies. Two consignments have been in transit for more than 14 days.', recommendation: 'Ship Kasane and Maun direct from CMS and trace TV-26-8812 and TV-26-8840 with Mokgosi Logistics.', severity: 'High', tone: 'orange' },
      grid: [
        [
          { span: 6, type: 'sankey', title: 'Transfer flow | September (BWP M)', height: 300, nodes, links: flows.map(([source, target, value]) => ({ source, target, value })) },
          { span: 6, type: 'map', title: 'Stores and consignments in transit', height: 300,
            regions: [{ lon: TOWNS.Kasane[0], lat: TOWNS.Kasane[1], r: 34, tone: 'red' }],
            pins: WH.map((w, i) => ({ name: i === 0 ? 'CMS Gaborone' : w.short, lon: w.lon, lat: w.lat, size: 8 + w.value / 12, tone: i === 0 ? 'blue' : ['Maun', 'Kasane'].includes(w.short) ? 'red' : 'cyan', meta: `Stock BWP ${w.value}M · in transit ${[0, 14, 9, 6, 4, 8, 3, 2][i]}` })) },
        ],
        [
          { span: 5, type: 'bar', title: 'Transfers per month | on-time % vs 90% target', height: 250, categories: H, y2: ' ', gridOpt: { right: 40 },
            series: [{ name: 'Transfer vouchers', data: [264, 281, 297, 276, 294, 312], color: 'blue' }, { name: 'On time %', type: 'line', axis: 1, data: [88, 86, 84, 85, 81, 79], color: 'amber', markLine: { value: 90, label: ' ', tone: 'green' } }] },
          { span: 7, type: 'table', title: 'Consignments in transit | oldest first', height: 250,
            columns: [{ key: 't', label: 'Transfer' }, { key: 'rt', label: 'Route' }, { key: 'c', label: 'Carrier' }, { key: 'v', label: 'Value', align: 'right' }, { key: 'd', label: 'Days', align: 'right' }, { key: 's', label: 'Status' }],
            rows: [['TV-26-8812', 'Francistown → Kasane', 17], ['TV-26-8840', 'Francistown → Maun', 15], ['TV-26-8903', 'CMS → Tsabong', 9], ['TV-26-8921', 'CMS → Ghanzi', 7], ['TV-26-8977', 'Francistown → Maun', 5], ['TV-26-9004', 'CMS → Francistown', 4], ['TV-26-9019', 'CMS → Serowe', 2], ['TV-26-9031', 'CMS → Palapye', 1]]
              .map(([t, rt, d]) => ({ t, rt, c: d > 10 ? 'Mokgosi Logistics' : r.pick(['Mokgosi Logistics', 'CMS own fleet', 'Makgadikgadi Fleet Services']), v: fmt.n(r.int(60, 780) * 1000), d, s: d > 10 ? { pill: 'Trace', tone: 'red' } : d > 5 ? { pill: 'Late', tone: 'amber' } : { pill: 'On route', tone: 'green' } })) },
        ],
      ],
    };
  });

  // ── 4 Issues & Consumption ──
  register(K(4), () => {
    const share = [0.40, 0.22, 0.13, 0.09, 0.07, 0.04, 0.03, 0.02];
    const topItems = [...ITEMS].map(it => ({ ...it, val: (it.cost * it.amc) / 1e6 })).sort((a, b) => b.val - a.val).slice(0, 10);
    const r = rng('cons');
    return {
      crumbs: [...crumbs, 'Issues'],
      kpis: [
        { label: 'Issued this month', value: 'BWP 114.6M', delta: '▼ 2.9% vs Aug', sub: 'to 614 facilities', tone: 'violet', pct: 58 },
        { label: 'Issue vouchers', value: '4,920', sub: 'requisitions fulfilled', tone: 'blue' },
        { label: 'Order fill rate', value: '93%', delta: '▼ 1 pt', sub: 'lines issued in full', tone: 'cyan', pct: 93 },
        { label: 'Consumption vs forecast', value: '+7.4%', delta: 'above plan', deltaTone: 'amber', sub: 'pharmaceuticals +11%', tone: 'amber' },
        { label: 'Issues without requisition', value: '14', delta: 'BWP 0.6M', deltaTone: 'red', sub: 'manual overrides', tone: 'red' },
      ],
      insight: { finding: 'Pharmaceutical consumption is running <b>11% above forecast</b>, led by TLD and ceftriaxone at district hospitals. Fourteen issues were made without an approved requisition, nine of them at Kasane.', recommendation: 'Update the quantification for Q3 and require a second approver on manual issues at district stores.', severity: 'Medium', tone: 'amber' },
      grid: [
        [
          { span: 8, type: 'area', title: 'Monthly issues by item group (BWP M)', height: 270, categories: H,
            series: GROUPS.slice(0, 5).map((g, i) => ({ name: g.name, stack: 'a', data: ISS.map(v => +(v * share[i] * rng('iss' + i).num(0.92, 1.08)).toFixed(1)) })) },
          { span: 4, type: 'donut', title: 'Issues by facility level', height: 270, center: '4,920', valueFmt: v => `BWP ${v}M`, items: [{ name: 'Referral hospitals', value: 38.2 }, { name: 'District hospitals', value: 31.6 }, { name: 'Primary hospitals', value: 17.9 }, { name: 'Clinics', value: 19.4 }, { name: 'Health posts', value: 7.5 }] },
        ],
        [
          { span: 6, type: 'bar', title: 'Top 10 items by monthly consumption value (BWP M)', height: 270, horizontal: true, labelMax: 24, gridOpt: { right: 30 }, categories: topItems.map(i => i.sh),
            series: [{ name: 'Monthly value', data: topItems.map(i => +i.val.toFixed(2)), color: 'violet', label: true }] },
          { span: 6, type: 'table', title: 'Consumption vs forecast | tracer items', height: 270,
            columns: [{ key: 'n', label: 'Item' }, { key: 'f', label: 'Forecast', align: 'right' }, { key: 'a', label: 'Actual', align: 'right' }, { key: 'v', label: 'Variance', align: 'right' }, { key: 's', label: 'Signal' }],
            rows: ITEMS.slice(0, 10).map((it, i) => { const a = Math.round(it.amc * [1.21, 1.04, 1.16, 0.62, 1.02, 0.97, 1.19, 1.08, 0.94, 1.01][i]); const v = ((a - it.amc) / it.amc) * 100; return { n: it.sh, f: fmt.n(it.amc), a: fmt.n(a), v: { trend: v > 0 ? 'up' : 'down', text: fmt.pct(Math.abs(v)), tone: Math.abs(v) > 15 ? 'red' : 'slate' }, s: v > 15 ? { pill: 'Above plan', tone: 'red' } : v < -15 ? { pill: 'Seasonal low', tone: 'blue' } : { pill: 'Within band', tone: 'green' } }; }) },
        ],
      ],
    };
  });

  // ── 5 Returns ──
  register(K(5), () => {
    const disp = [['Restocked', 'green'], ['Returned to supplier', 'blue'], ['Quarantined', 'amber'], ['For destruction', 'red']];
    const r = rng('ret');
    const base = [0.92, 0.52, 0.38, 0.3, 0.24, 0.22, 0.18, 0.14];
    const byWh = disp.map((_, j) => WH.map((w, i) => +(base[i] * [0.46, 0.28, 0.16, 0.1][j] * r.num(0.7, 1.35)).toFixed(2)));
    return {
      crumbs: [...crumbs, 'Returns'],
      kpis: [
        { label: 'Return lines this month', value: '186', delta: '▲ 22 vs Aug', deltaTone: 'amber', sub: 'from facilities', tone: 'blue' },
        { label: 'Value returned', value: 'BWP 2.9M', sub: '2.5% of issues', tone: 'violet', pct: 25 },
        { label: 'Restocked', value: '46%', sub: 'fit for re-issue', tone: 'green', pct: 46 },
        { label: 'Supplier credits pending', value: 'BWP 1.2M', delta: '14 credit notes', deltaTone: 'amber', sub: 'older than 30 days: 6', tone: 'amber' },
        { label: 'Returns near expiry', value: '38%', delta: '▲ 9 pts', deltaTone: 'red', sub: '< 3 months shelf life', tone: 'red', pct: 38 },
      ],
      insight: { finding: '<b>38%</b> of returned lines have less than three months of shelf life left, which points to over-issuing to clinics rather than quality problems. Supplier credits of BWP 1.2M are outstanding, six of them for more than 30 days.', recommendation: 'Cap clinic top-up orders at two months of stock and chase the six overdue credit notes through Procurement.', severity: 'Medium', tone: 'amber' },
      grid: [
        [
          { span: 5, type: 'donut', title: 'Return reasons (lines)', height: 280, center: '186', items: [{ name: 'Near expiry', value: 71 }, { name: 'Transit damage', value: 34 }, { name: 'Wrong item', value: 28 }, { name: 'Recall', value: 22 }, { name: 'Quality', value: 19 }, { name: 'Facility closure', value: 12 }] },
          { span: 7, type: 'bar', title: 'Returns by store and disposition (BWP M)', height: 280, categories: WH.map(w => w.short),
            series: disp.map(([name, color], j) => ({ name, data: byWh[j], stack: 'd', color })) },
        ],
        [
          { span: 7, type: 'table', title: 'Returns log | latest', height: 250,
            columns: [{ key: 'ref', label: 'Return note' }, { key: 'f', label: 'From facility' }, { key: 'i', label: 'Item' }, { key: 'q', label: 'Qty', align: 'right' }, { key: 'd', label: 'Disposition' }],
            rows: [['Letsholathebe II, Maun', 'Near expiry'], ['Sekgoma Memorial, Serowe', 'Transit damage'], ['Kasane Primary Hospital', 'Recall'], ['Nyangabgwe, Francistown', 'Wrong item'], ['Ghanzi Primary Hospital', 'Near expiry'], ['Tsabong Primary Hospital', 'Quality'], ['Princess Marina, Gaborone', 'Near expiry'], ['Palapye Primary Hospital', 'Transit damage']]
              .map(([f, rs], i) => { const d = disp[[2, 3, 1, 0, 2, 1, 0, 3][i]]; return { ref: `RN-26-${r.int(3000, 3999)}`, f, i: ITEMS[r.int(0, ITEMS.length - 1)].sh, q: fmt.n(r.int(20, 1400)), rs, d: { pill: d[0], tone: d[1] } }; }) },
          { span: 5, type: 'list', title: 'Supplier credits outstanding', height: 250,
            items: [['Naledi Pharmaceuticals', 'Recall: ceftriaxone batch C-2231', 'BWP 412K', 48, 'red'], ['Okavango Medical Supplies', 'Damaged gloves x 640 boxes', 'BWP 188K', 41, 'red'], ['Tswelelo Supplies', 'Wrong spec syringes', 'BWP 164K', 36, 'orange'], ['Naledi Pharmaceuticals', 'Short-dated oxytocin', 'BWP 142K', 33, 'orange'], ['Okavango Medical Supplies', 'Leaking Ringer\'s lactate', 'BWP 96K', 21, 'amber'], ['Mokgosi Logistics', 'Transit damage claim', 'BWP 71K', 12, 'blue']]
              .map(([title, meta, value, d, tone]) => ({ title, meta: `${meta} · ${d} days`, value, tone })) },
        ],
      ],
    };
  });

  // ── 6 Stock Levels & Stock-outs ──
  register(K(6), () => {
    const r = rng('mos');
    const tr = ITEMS.slice(0, 10);
    const values = [];
    tr.forEach((it, y) => WH.forEach((w, x) => values.push([x, y, +Math.max(0, r.num(0.4, 7.5) * (x === 5 && y < 4 ? 0.2 : 1)).toFixed(1)])));
    values[3 * 8 + 2][2] = 0; values[0 * 8 + 5][2] = 0; values[6 * 8 + 6][2] = 0; values[4 * 8 + 0][2] = 11.2; values[8 * 8 + 0][2] = 10.4;
    return {
      crumbs: [...crumbs, 'Stock levels'],
      kpis: [
        { label: 'Tracer availability', value: '91%', delta: '▼ 2 pts', sub: 'target 95%', tone: 'cyan', pct: 91 },
        { label: 'Items at stock-out', value: '23', delta: '▲ 5 vs Aug', deltaTone: 'red', sub: '9 are tracer items', tone: 'red' },
        { label: 'Below reorder level', value: '64', delta: 'POs open for 41', sub: 'replenishment triggered', tone: 'amber' },
        { label: 'Avg months of stock', value: '3.4', sub: 'min 3 · max 6', tone: 'blue', pct: 57 },
        { label: 'Overstocked (> 9 MOS)', value: '41 items', delta: 'BWP 31.4M', deltaTone: 'amber', sub: 'excess value', tone: 'violet' },
      ],
      insight: { finding: 'Kasane holds <b>under one month</b> of four tracer items, including amoxicillin (0 MOS), while CMS holds more than ten months of insulin and HIV test kits. The shortage is distribution, not national supply.', recommendation: 'Raise emergency transfers from CMS to Kasane today and lower the CMS max level for insulin to six months.', severity: 'High', tone: 'red', actions: ['Explain finding', 'Raise transfers', 'Notify store managers'] },
      grid: [
        [
          { span: 8, type: 'heatmap', title: 'Months of stock | tracer item × store', height: 330, x: WH.map(w => w.short), y: tr.map(i => i.sh), values, min: 0, max: 9, cellFmt: v => v, valueFmt: v => v + ' months', colors: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6'] },
          { span: 4, type: 'donut', title: 'Stock status | 1,280 tracked lines', height: 330, center: '91%', items: [{ name: 'Within min–max', value: 1041, color: 'green' }, { name: 'Below reorder', value: 64, color: 'amber' }, { name: 'Stocked out', value: 23, color: 'red' }, { name: 'Overstocked', value: 152, color: 'blue' }] },
        ],
        [
          { span: 5, type: 'line', title: 'Tracer availability % (target 95%) and stock-out days', height: 250, categories: H, y2: ' ', gridOpt: { right: 36 },
            series: [{ name: 'Availability %', data: [94, 94, 93, 92, 93, 91], color: 'cyan', markLine: { value: 95, label: ' ', tone: 'green' } }, { name: 'Stock-out days', type: 'bar', axis: 1, data: [118, 124, 141, 162, 150, 188], color: 'red' }] },
          { span: 7, type: 'table', title: 'Items at stock-out | tracer lines', height: 250,
            columns: [{ key: 'i', label: 'Item' }, { key: 'w', label: 'Store' }, { key: 'd', label: 'Days out', align: 'right' }, { key: 'po', label: 'Open PO' }, { key: 'eta', label: 'ETA' }, { key: 's', label: 'Action' }],
            rows: [[0, 'Kasane', 12, 'Transfer'], [3, 'Maun', 9, 'PO-26-71402'], [6, 'Ghanzi', 7, 'PO-26-71388'], [12, 'Kasane', 6, 'Transfer'], [2, 'Tsabong', 5, 'Transfer'], [10, 'Serowe', 4, 'PO-26-71455'], [5, 'Kasane', 3, 'Transfer'], [7, 'Palapye', 2, 'PO-26-71460']]
              .map(([ix, w, d, po]) => ({ i: ITEMS[ix].sh, w, d, po, eta: po === 'Transfer' ? '2 days' : `${r.int(5, 21)} days`, s: d > 7 ? { pill: 'Escalate', tone: 'red' } : { pill: 'In hand', tone: 'amber' } })) },
        ],
      ],
    };
  });

  // ── 7 Ageing & Slow-moving ──
  register(K(7), () => {
    const buckets = ['0–90 days', '91–180 days', '181–365 days', '> 365 days'];
    const bc = ['green', 'blue', 'amber', 'red'];
    const split = g => { const old = g.aged; return [1 - old - 0.22, 0.22, old * 0.62, old * 0.38].map(s => +(g.value * s).toFixed(1)); };
    const aged = sum(GROUPS.map(g => g.value * g.aged));
    const r = rng('slow');
    return {
      crumbs: [...crumbs, 'Ageing'],
      kpis: [
        { label: 'Stock older than 180 days', value: `BWP ${aged.toFixed(1)}M`, delta: `${((aged / TOTAL) * 100).toFixed(1)}%`, deltaTone: 'amber', sub: 'of stock value', tone: 'amber', pct: (aged / TOTAL) * 100 },
        { label: 'Slow-moving lines', value: '312', delta: '▲ 27 since Jun', deltaTone: 'red', sub: 'no issue in 90 days', tone: 'orange' },
        { label: 'Non-moving > 12 months', value: '88 lines', delta: 'BWP 9.3M', deltaTone: 'red', sub: 'obsolescence risk', tone: 'red' },
        { label: 'Expiring in 90 days', value: 'BWP 7.4M', sub: '146 batches', tone: 'violet' },
        { label: 'Average stock age', value: '142 days', delta: '▲ 11 days', deltaTone: 'red', sub: 'weighted by value', tone: 'blue' },
      ],
      insight: { finding: `Spares & maintenance and uniforms hold <b>41%</b> and 33% of their value in stock older than 180 days. BWP 7.4M of medicines expires within 90 days, of which BWP 2.8M is at CMS with no open requisition.`, recommendation: 'Push short-dated stock to high-consuming hospitals under FEFO and refer the 88 non-moving lines to the Board of Survey.', severity: 'Medium', tone: 'amber' },
      grid: [
        [
          { span: 7, type: 'bar', title: 'Stock age profile by item group (BWP M)', height: 280, horizontal: true, labelMax: 22, categories: GROUPS.map(g => g.name),
            series: buckets.map((b, j) => ({ name: b, stack: 'age', color: bc[j], data: GROUPS.map(g => split(g)[j]) })) },
          { span: 5, type: 'treemap', title: 'Slow-moving value by group (BWP M)', height: 280, valueFmt: v => `BWP ${v}M`, items: [...GROUPS.slice(0, 5), GROUPS[6]].map(g => ({ name: g.name, value: +(g.value * g.aged).toFixed(1) })).sort((a, b) => b.value - a.value).concat([{ name: 'Stationery & cleaning', value: +(GROUPS[5].value * GROUPS[5].aged + GROUPS[7].value * GROUPS[7].aged).toFixed(1), color: '#334155' }]) },
        ],
        [
          { span: 5, type: 'bar', title: 'Expiry profile | next 12 months (BWP M)', height: 250, categories: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
            series: [{ name: 'Expiring value', data: [2.1, 2.6, 2.7, 1.8, 1.4, 2.2, 1.6, 1.1, 1.9, 1.3, 0.9, 1.2].map((v, i) => ({ value: v, itemStyle: { color: i < 3 ? C.red : i < 6 ? C.amber : C.blue } })) }] },
          { span: 7, type: 'table', title: 'Slow and non-moving lines | highest value', height: 250,
            columns: [{ key: 'i', label: 'Item' }, { key: 'w', label: 'Store' }, { key: 'v', label: 'Value', align: 'right' }, { key: 'l', label: 'Last issue', align: 'right' }, { key: 'e', label: 'Expiry' }, { key: 's', label: 'Class' }],
            rows: [['Generator overhaul kit 250kVA', 'CMS', 1840, 612], ['Autoclave spare heating element', 'Francistown', 920, 401], ['Nurse uniform (winter) size L', 'CMS', 780, 388], ['Chemistry analyser reagent pack', 'Maun', 710, 214], ['Hospital bed linen set', 'Serowe', 540, 190], ['Dental amalgam capsules', 'CMS', 480, 176], ['Malaria RDT x25', 'Ghanzi', 360, 132], ['Toner HP 26A', 'Palapye', 120, 118]]
              .map(([i, w, v, l]) => ({ i, w, v: fmt.n(v * 1000), l: `${l} d`, e: l > 300 ? 'n/a' : `${r.pick(['Nov', 'Dec', 'Jan', 'Feb'])} 2026`, s: l > 365 ? { pill: 'Non-moving', tone: 'red' } : l > 180 ? { pill: 'Slow', tone: 'orange' } : { pill: 'Watch', tone: 'amber' } })) },
        ],
      ],
    };
  });

  // ── 8 Obsolete & Write-offs ──
  register(K(8), () => ({
    crumbs: [...crumbs, 'Write-offs'],
    kpis: [
      { label: 'Written off FY to date', value: 'BWP 5.8M', delta: '1.4%', deltaTone: 'amber', sub: 'of average stock', tone: 'red', pct: 14 },
      { label: 'Obsolete identified', value: 'BWP 9.3M', sub: '88 lines awaiting survey', tone: 'orange' },
      { label: 'Board of Survey lots', value: '26', delta: '11 older than 90 days', deltaTone: 'red', sub: 'pending decision', tone: 'amber' },
      { label: 'Expired share of write-offs', value: '64%', sub: 'BWP 3.7M', tone: 'violet', pct: 64 },
      { label: 'Write-off provision used', value: '73%', delta: 'BWP 8.0M budget', sub: 'half-year point', tone: 'blue', pct: 73 },
    ],
    insight: { finding: 'Expired medicines make up <b>64%</b> of write-offs, and eleven Board of Survey lots have waited more than 90 days, tying up 1,300 pallet positions in quarantine. At this rate the write-off provision will be used up by January.', recommendation: 'Convene a special Board of Survey for the 11 old lots and ask the PS to approve bulk destruction with the incinerator contractor.', severity: 'High', tone: 'orange' },
    grid: [
      [
        { span: 6, type: 'waterfall', title: 'Write-offs by cause | FY to date (BWP M)', height: 270,
          steps: [{ name: 'Expired', value: 3.7 }, { name: 'Damaged', value: 1.1 }, { name: 'Obsolete spec', value: 0.6 }, { name: 'Theft / loss', value: 0.4 }, { name: 'Total', value: 5.8, total: true }] },
        { span: 6, type: 'bar', title: 'Monthly write-offs vs provision (BWP M)', height: 270, categories: H, y2: ' ',
          series: [{ name: 'Written off', data: WO, color: 'red' }, { name: 'Provision (monthly)', data: H.map(() => 0.67), color: '#1E3A5F' }, { name: 'Cumulative', type: 'line', axis: 1, data: WO.reduce((a, v, i) => (a.push(+((a[i - 1] || 0) + v).toFixed(1)), a), []), color: 'amber' }] },
      ],
      [
        { span: 12, type: 'steps', title: 'Disposal process | lot BoS-26-014 (Francistown expired pharmaceuticals, BWP 612K)',
          steps: [{ name: 'Identified in count', meta: '02 Jun', state: 'done' }, { name: 'Quarantined', meta: '05 Jun', state: 'done' }, { name: 'Board of Survey', meta: '14 Jul', state: 'done' }, { name: 'PS approval', meta: 'due 30 Aug · 24 d late', state: 'late' }, { name: 'Destruction witnessed', meta: 'pending', state: 'todo' }, { name: 'Written off in ledger', meta: 'pending', state: 'todo' }] },
      ],
      [
        { span: 12, type: 'table', title: 'Disposal lots awaiting decision', height: 240,
          columns: [{ key: 'l', label: 'Lot' }, { key: 'w', label: 'Store' }, { key: 'd', label: 'Description' }, { key: 'c', label: 'Cause' }, { key: 'v', label: 'Value (BWP)', align: 'right' }, { key: 'a', label: 'Days waiting', align: 'right' }, { key: 's', label: 'Stage' }],
          rows: [['BoS-26-009', 'CMS Gaborone', 'Expired ARVs and antibiotics', 'Expired', 1120000, 141], ['BoS-26-011', 'Maun', 'Water-damaged consumables', 'Damaged', 386000, 118], ['BoS-26-014', 'Francistown', 'Expired pharmaceuticals', 'Expired', 612000, 110], ['BoS-26-016', 'CMS Gaborone', 'Superseded lab analyser reagents', 'Obsolete spec', 544000, 96], ['BoS-26-019', 'Kasane', 'Cold-chain breach vaccines', 'Damaged', 212000, 64], ['BoS-26-021', 'Ghanzi', 'Expired PPE (surgical masks)', 'Expired', 148000, 41], ['BoS-26-024', 'Serowe', 'Missing stock after count', 'Theft / loss', 96000, 22]]
            .map(([l, w, d, c, v, a]) => ({ l, w, d, c, v: fmt.n(v), a, s: a > 90 ? { pill: 'Overdue', tone: 'red' } : a > 45 ? { pill: 'PS approval', tone: 'amber' } : { pill: 'Survey', tone: 'blue' } })) },
      ],
    ],
  }));

  // ── 9 Shrinkage & Variances ──
  register(K(9), () => {
    const net = WH.map(w => -+((w.value * w.shrink) / 100).toFixed(2));
    net[4] = 0.08;
    return {
      crumbs: [...crumbs, 'Stock counts'],
      kpis: [
        { label: 'Count accuracy', value: '96.4%', delta: '▼ 0.6 pts', sub: 'target 98%', tone: 'cyan', pct: 96.4 },
        { label: 'Net stock variance', value: `−BWP ${Math.abs(sum(net)).toFixed(1)}M`, sub: 'book vs physical', tone: 'red' },
        { label: 'Shrinkage rate', value: '0.74%', delta: '▲ 0.12 pts', deltaTone: 'red', sub: 'tolerance 0.5%', tone: 'orange', pct: 74 },
        { label: 'Cycle counts completed', value: '82%', sub: '1,046 of 1,280 lines', tone: 'blue', pct: 82 },
        { label: 'Unexplained variances', value: '19', delta: '6 over BWP 50K', deltaTone: 'red', sub: 'with Internal Audit', tone: 'amber' },
      ],
      insight: { finding: 'Kasane has the highest shrinkage at <b>1.46%</b> and the lowest count accuracy (93.2%); losses are concentrated in examination gloves and N95 respirators, which are small, high-value and easy to resell.', recommendation: 'Move PPE into the Kasane caged area, start weekly blind counts, and add both items to the rapid-depletion watch list.', severity: 'High', tone: 'red' },
      grid: [
        [
          { span: 6, type: 'bar', title: 'Net stock variance by store (BWP M)', height: 270, categories: WH.map(w => w.short),
            series: [{ name: 'Net variance', label: true, data: net.map(v => ({ value: v, itemStyle: { color: v < -0.25 ? C.red : v < 0 ? C.amber : C.green } })) }] },
          { span: 6, type: 'scatter', title: 'Count accuracy vs shrinkage by store', height: 270, xName: 'Count accuracy %', yName: 'Shrinkage %', xMin: 92, xMax: 99, yMin: 0, yMax: 1.8, labels: true,
            points: WH.map(w => ({ name: w.short, x: w.acc, y: w.shrink, size: 8 + w.value / 8, tone: w.shrink > 1 ? 'red' : w.shrink > 0.7 ? 'amber' : 'green' })) },
        ],
        [
          { span: 5, type: 'line', title: 'Shrinkage rate by month (%)', height: 250, categories: H, gridOpt: { right: 40 },
            series: [{ name: 'All stores', data: [0.58, 0.61, 0.66, 0.63, 0.69, 0.74], color: 'orange', area: true, markLine: { value: 0.5, label: '0.5%', tone: 'red' } }, { name: 'Kasane', data: [0.9, 1.1, 1.2, 1.18, 1.31, 1.46], color: 'red', dashed: true }] },
          { span: 7, type: 'table', title: 'Largest count variances | September', height: 250,
            columns: [{ key: 'i', label: 'Item' }, { key: 'w', label: 'Store' }, { key: 'b', label: 'Book', align: 'right' }, { key: 'p', label: 'Physical', align: 'right' }, { key: 'v', label: 'Variance (BWP)', align: 'right' }, { key: 's', label: 'Status' }],
            rows: [[12, 'Kasane', 4200, 3310], [13, 'Kasane', 860, 612], [2, 'Maun', 9400, 9120], [12, 'Francistown', 11200, 10840], [10, 'Ghanzi', 142, 131], [8, 'Tsabong', 1300, 1180], [9, 'Serowe', 6400, 6510]]
              .map(([ix, w, b, p]) => { const it = ITEMS[ix]; const v = (p - b) * it.cost; return { i: it.sh, w, b: fmt.n(b), p: fmt.n(p), v: { trend: v > 0 ? 'up' : 'down', text: fmt.n(Math.abs(v)), tone: v > 0 ? 'green' : 'red' }, s: Math.abs(v) > 20000 ? { pill: 'Investigate', tone: 'red' } : v > 0 ? { pill: 'Surplus', tone: 'blue' } : { pill: 'Recount', tone: 'amber' } }; }) },
        ],
      ],
    };
  });

  // ── 10 Stock Turnover ──
  register(K(10), () => {
    const whTurn = [3.6, 3.1, 2.8, 3.0, 3.4, 2.2, 1.9, 2.4];
    return {
      crumbs: [...crumbs, 'Turnover'],
      kpis: [
        { label: 'Stock turnover', value: `${TURN.toFixed(1)}×`, delta: '▼ 0.2 vs FY25', sub: 'annualised', tone: 'violet', pct: (TURN / 4) * 100 },
        { label: 'Days of inventory', value: `${DOH} days`, delta: 'target 91', deltaTone: 'amber', sub: 'cost of issues basis', tone: 'blue' },
        { label: 'Annualised issues', value: `BWP ${fmt.n(sum(ISS) * 2)}M`, sub: 'Apr–Sep × 2', tone: 'cyan' },
        { label: 'Fastest group', value: 'Cleaning 6.1×', sub: '60 days on hand', tone: 'green' },
        { label: 'Slowest group', value: 'Spares 0.9×', delta: '406 days', deltaTone: 'red', sub: 'on hand', tone: 'red' },
      ],
      insight: { finding: `National turnover is <b>${TURN.toFixed(1)}×</b> (${DOH} days of stock) against a 4.0× target. Spares & maintenance turn under once a year and Ghanzi turns 1.9×, holding almost twice the stock its clinics consume.`, recommendation: 'Move spares to supplier-managed call-off contracts and lower Ghanzi max levels to four months.', severity: 'Medium', tone: 'amber' },
      grid: [
        [
          { span: 7, type: 'bar', title: 'Turnover × by item group (target 4×) and days on hand', height: 280, categories: GROUPS.map(g => g.name), rotate: 25, labelMax: 20, y2: ' ', gridOpt: { right: 36 },
            series: [{ name: 'Turnover ×', data: GROUPS.map(g => ({ value: g.turn, itemStyle: { color: g.turn < 2 ? C.red : g.turn < 4 ? C.blue : C.green } })), markLine: { value: 4, label: ' ', tone: 'green' } }, { name: 'Days on hand', type: 'line', axis: 1, smooth: false, data: GROUPS.map(g => Math.round(365 / g.turn)), color: 'amber' }] },
          { span: 5, type: 'radar', title: 'Store performance index', height: 280, indicators: ['Turnover', 'Availability', 'Count accuracy', 'Utilisation', 'Freshness'].map(name => ({ name, max: 100 })),
            series: [{ name: 'CMS Gaborone', values: [90, 94, 95, 88, 84], color: 'blue' }, { name: 'Kasane', values: [55, 78, 62, 60, 70], color: 'red' }, { name: 'Ghanzi', values: [48, 86, 80, 92, 58], color: 'amber' }] },
        ],
        [
          { span: 5, type: 'line', title: 'Days of stock on hand by month | selected stores', height: 240, categories: H, gridOpt: { right: 36 },
            series: [[0, 'blue'], [5, 'red'], [6, 'amber'], [1, 'cyan']].map(([ix, color]) => ({ name: WH[ix].short, color, data: rng('doh' + ix).walk(MONTH_NOW, 365 / whTurn[ix] * 0.9, 0.08, 0.02).map(Math.round) })).map((s0, k) => (k === 0 ? { ...s0, markLine: { value: 91, label: '91 d', tone: 'green' } } : s0)) },
          { span: 7, type: 'table', title: 'Turnover by store', height: 240,
            columns: [{ key: 'n', label: 'Store' }, { key: 't', label: 'Turnover', align: 'right' }, { key: 'd', label: 'Days on hand', align: 'right' }, { key: 'b', label: 'vs target' }, { key: 's', label: 'Rating' }],
            rows: WH.map((w, i) => ({ n: w.name, t: whTurn[i].toFixed(1) + '×', d: Math.round(365 / whTurn[i]), b: { bar: (whTurn[i] / 4) * 100, tone: whTurn[i] < 2.5 ? 'red' : whTurn[i] < 3.2 ? 'amber' : 'green', text: fmt.pct((whTurn[i] / 4) * 100) }, s: whTurn[i] < 2.5 ? { pill: 'Overstocked', tone: 'red' } : whTurn[i] < 3.2 ? { pill: 'Below target', tone: 'amber' } : { pill: 'Healthy', tone: 'green' } })) },
        ],
      ],
    };
  });

  // ── 11 Alerts & Anomalies ──
  // Pattern from the brief: large quantity purchased > received > disappeared from available stock unusually quickly.
  const ANOM = [
    ['Rapid depletion after bulk receipt', 'Nitrile gloves (M) · Kasane · 12,000 boxes gone in 9 days', 'BWP 481,400', 'Critical', 'red'],
    ['Rapid depletion after bulk receipt', 'N95 respirators · Kasane · 2,400 boxes gone in 11 days', 'BWP 348,000', 'Critical', 'red'],
    ['Issue without requisition', '9 manual issues · Kasane · single officer', 'BWP 412,000', 'Critical', 'red'],
    ['Receipt larger than 6× AMC', 'Ceftriaxone 1g · Maun · PO-26-70991', 'BWP 820,000', 'High', 'orange'],
    ['Negative stock balance posted', 'Ringer\'s lactate · Ghanzi · −340 bags', 'BWP 7,100', 'High', 'orange'],
    ['Transfer dispatched, not received', 'TV-26-8812 · Francistown → Kasane · 17 days', 'BWP 486,000', 'Critical', 'red'],
    ['Stock adjustment after hours', 'Serowe · Sun 14 Sep 21:40 · 14 lines', 'BWP 58,000', 'Medium', 'amber'],
    ['Repeated count variance', 'Insulin isophane · Maun · 3 counts in a row', 'BWP 31,000', 'Medium', 'amber'],
  ];
  register(K(11), () => {
    const days = Array.from({ length: 30 }, (_, i) => String(i + 1));
    const use = i => (i > 3 && i <= 12 ? 1560 : i > 12 ? 420 : 440);
    let e = 3100, a = 3100; const normal = [], actual = [];
    days.forEach((_, i) => { if (i === 3) { e += 12000; a += 12000; } else { e -= 440; a -= use(i); } normal.push(Math.max(0, e)); actual.push(Math.max(0, a)); });
    return {
      crumbs: [...crumbs, 'Kasane District Stores'],
      kpis: [
        { label: 'Inventory exceptions', value: '17', delta: '▲ 4 this week', deltaTone: 'red', sub: 'open', tone: 'red' },
        { label: 'Critical', value: '4', sub: 'PS notified', tone: 'red' },
        { label: 'Value at risk', value: 'BWP 3.4M', sub: '0.8% of stock', tone: 'orange', pct: 8 },
        { label: 'Rapid-depletion patterns', value: '3', delta: 'Kasane 2, Maun 1', deltaTone: 'red', sub: 'receipt → vanish', tone: 'violet' },
        { label: 'Avg time to close', value: '5.2 days', delta: '▼ 0.8 days', sub: 'vs Q1', tone: 'blue' },
      ],
      insight: { finding: 'Kasane received <b>12,000 boxes</b> of nitrile gloves on 4 Sep (six months of normal use); the book balance fell to under 1,000 by 13 Sep, while only 2,860 boxes were issued against approved requisitions. About <b>8,300 boxes (BWP 481K)</b> cannot be traced.', recommendation: 'Freeze PPE issues at Kasane, run a witnessed count, and refer GRN-26-44120 and the linked issue vouchers to Internal Audit.', severity: 'Critical', tone: 'red', actions: ['Explain finding', 'Show all transactions', 'Refer to audit'] },
      grid: [
        [
          { span: 8, type: 'line', title: 'Nitrile gloves (M) at Kasane | September book balance vs expected (boxes)', height: 270, categories: days, gridOpt: { right: 50 },
            series: [{ name: 'Expected at normal use', data: normal, color: '#64748B', dashed: true, symbol: 'none' }, { name: 'Book balance', data: actual, color: 'red', area: true, markLine: { value: 1000, label: 'Reorder', tone: 'amber' } }] },
          { span: 4, type: 'donut', title: 'Open exceptions by rule', height: 270, center: '17', items: [{ name: 'Rapid depletion', value: 3, color: 'red' }, { name: 'Issue without requisition', value: 3, color: 'orange' }, { name: 'Oversized receipt', value: 2, color: 'amber' }, { name: 'Transfer not received', value: 3, color: 'violet' }, { name: 'Negative balance', value: 2, color: 'blue' }, { name: 'After-hours adjustment', value: 2, color: 'cyan' }, { name: 'Repeated variance', value: 2, color: 'teal' }] },
        ],
        [
          { span: 5, type: 'stats', title: 'Pattern chain | purchased → received → disappeared', cols: 2,
            items: [
              { label: '1 · PO raised (18 Aug)', value: '12,000 boxes', sub: '6.8 months of normal use', tone: 'blue' },
              { label: '2 · Received, GRN (04 Sep)', value: '12,000 boxes', sub: 'passed inspection', tone: 'cyan' },
              { label: '3 · Issued on requisition', value: '2,860 boxes', sub: '14 facilities, approved', tone: 'green' },
              { label: '4 · Manual issues + adjustment', value: '8,300 boxes', sub: 'one officer, no requisition', tone: 'red' },
              { label: 'Days to deplete', value: '9 days', sub: 'normal: 27 days', tone: 'amber' },
              { label: 'Untraced value', value: 'BWP 481K', sub: '8,300 × BWP 58', tone: 'red' },
            ] },
          { span: 7, type: 'table', title: 'Related transactions | click to open source', height: 220,
            columns: [{ key: 'ref', label: 'Ref' }, { key: 'd', label: 'Date' }, { key: 't', label: 'Type' }, { key: 'q', label: 'Qty', align: 'right' }, { key: 'o', label: 'Officer' }, { key: 's', label: 'Flag' }],
            rows: [['PO-26-70412', '18 Aug', 'Purchase order', '12,000', 'Procurement Officer'], ['GRN-26-44120', '04 Sep', 'Goods received', '12,000', 'Stores Officer A'], ['IV-26-90311', '05 Sep', 'Issue (requisition)', '−620', 'Stores Officer B'], ['IV-26-90355', '06 Sep', 'Issue (manual)', '−2,400', 'Stores Officer A'], ['IV-26-90371', '08 Sep', 'Issue (manual)', '−2,600', 'Stores Officer A'], ['ADJ-26-1142', '10 Sep', 'Stock adjustment', '−1,900', 'Stores Officer A'], ['IV-26-90420', '12 Sep', 'Issue (manual)', '−1,400', 'Stores Officer A']]
              .map(([ref, d, t, q, o]) => ({ ref, d, t, q, o, s: /manual|adjust/i.test(t) ? { pill: 'Suspicious', tone: 'red' } : { pill: 'Normal', tone: 'green' } })) },
        ],
        [
          { span: 12, type: 'table', title: 'Exception queue', height: 260,
            columns: [{ key: 'rule', label: 'Rule triggered' }, { key: 'ctx', label: 'Detail' }, { key: 'amt', label: 'Value', align: 'right' }, { key: 'sev', label: 'Severity' }, { key: 'own', label: 'Assigned to' }],
            rows: ANOM.map(([rule, ctx, amt, sev, t], i) => ({ rule: { strong: rule }, ctx, amt, sev: { pill: sev, tone: t }, own: OFFICERS[(i + 2) % OFFICERS.length] })) },
        ],
      ],
    };
  });
})();
