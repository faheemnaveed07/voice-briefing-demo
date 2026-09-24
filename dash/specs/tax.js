/* Menu 12: Tax Reconciliation (menu index 11).
 * Government contract awards vs invoices vs payments vs contractor tax declarations (BURS)
 * vs project activity. Reconciliation window: 12 months Oct 2025 – Sep 2026, matching the
 * monthly VAT returns filed with BURS. VAT 14%; withholding tax 3% on contract payments.
 */
(function () {
  const { register, fmt, rng } = DASH;
  const { MINISTRIES, TOWNS, M } = DASH.data;
  const K = n => `11-${n}`;
  const crumbs = ['All Ministries', 'All contractors', 'BURS reconciliation'];
  const M12 = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  const VAT = 0.14, WHT = 0.03, TODAY = 8.7; // months since Jan 2026 (23 Sep 2026)
  const r1 = v => +v.toFixed(1);
  const sum = (arr, f) => arr.reduce((s, x) => s + (f ? f(x) : x), 0);
  const top = (arr, key, n) => [...arr].sort((a, b) => b[key] - a[key]).slice(0, n);
  const MON_IDX = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthLabel = m => { const y = 26 + Math.floor(m / 12); return `${MON_IDX[((Math.floor(m) % 12) + 12) % 12]} ${y}`; };

  // ── Contractor register: 12-month govt payments vs turnover declared to BURS (BWP M) ──
  // [name, short, sector, town, TIN, awarded, invoiced, paid, declared, TCC expiry (months from Jan 26, null = none on file), VAT registered, activity flag points]
  const CON = [
    ['Clement Pty Ltd', 'Clement', 'Construction', 'Gaborone', 'C04127731', 31.2, 19.8, 18.4, 6.1, 14.2, true, 12],
    ['Seasons Pty Ltd', 'Seasons', 'Construction', 'Gaborone', 'C03318820', 8.4, 6.9, 6.2, 14.8, 13.5, true, 0],
    ['Matrix Pty Ltd', 'Matrix', 'Construction', 'Francistown', 'C05510294', 5.1, 4.4, 4.0, 9.7, 10.4, true, 0],
    ['Kgalagadi Builders', 'Kgalagadi', 'Construction', 'Ghanzi', 'C02290415', 62.3, 45.2, 41.6, 58.9, 16.0, true, 0],
    ['Motswedi Construction', 'Motswedi', 'Construction', 'Selebi-Phikwe', 'C06671203', 39.4, 16.1, 14.6, 12.2, 11.9, true, 4],
    ['Tswelelo Supplies', 'Tswelelo', 'General supplies', 'Gaborone', 'C07784410', 10.2, 9.6, 9.1, 3.9, 9.3, true, 0],
    ['Letsatsi Engineering', 'Letsatsi', 'Engineering', 'Serowe', 'C03905518', 38.8, 21.3, 19.7, 31.4, 15.1, true, 0],
    ['Okavango Medical Supplies', 'Okavango Med', 'Medical supplies', 'Maun', 'C04462087', 12.6, 11.9, 11.1, 24.5, 12.6, true, 0],
    ['Chobe ICT Solutions', 'Chobe ICT', 'ICT', 'Kasane', 'C05183376', 44.0, 32.4, 31.0, 47.2, 17.2, true, 0],
    ['Mokgosi Logistics', 'Mokgosi', 'Logistics', 'Mahalapye', 'C06027751', 4.9, 4.7, 4.5, 4.1, 9.5, true, 0],
    ['Boitumelo Catering', 'Boitumelo', 'Catering', 'Molepolole', 'C08812930', 2.2, 2.1, 1.6, 3.0, null, false, 0],
    ['Makgadikgadi Fleet Services', 'Makgadikgadi', 'Fleet hire', 'Francistown', 'C07365512', 6.3, 6.0, 4.6, 1.5, 7.4, true, 0],
    ['Serowe Hardware', 'Serowe HW', 'Hardware', 'Serowe', 'C02948836', 11.4, 7.1, 6.6, 9.8, 10.8, true, 3],
    ['Pula Office Solutions', 'Pula Office', 'Office supplies', 'Gaborone', 'C05573309', 3.1, 2.9, 2.8, 7.6, 14.4, true, 0],
    ['Thari Consulting', 'Thari', 'Consulting', 'Gaborone', 'C04416628', 5.4, 5.2, 4.9, 5.3, 9.1, true, 0],
    ['Lesedi Security Services', 'Lesedi', 'Security', 'Lobatse', 'C06650147', 6.8, 6.6, 6.4, 2.2, 6.5, true, 0],
    ['Naledi Pharmaceuticals', 'Naledi', 'Pharmaceuticals', 'Gaborone', 'C03172265', 14.2, 13.1, 12.4, 27.9, 15.8, true, 0],
    ['Tlotlo Civil Works', 'Tlotlo', 'Civil works', 'Palapye', 'C02731190', 76.4, 55.3, 51.6, 69.0, 12.2, true, 0],
    ['Kalahari Energy Systems', 'Kalahari Energy', 'Energy', 'Letlhakane', 'C05834472', 39.2, 29.8, 19.0, 17.4, 10.1, true, 0],
    ['Mmila Road Contractors', 'Mmila Roads', 'Roads', 'Palapye', 'C01988354', 134.0, 104.6, 100.0, 118.3, 16.6, true, 0],
  ].map(([name, short, sector, town, tin, awarded, invoiced, paid, declared, tcc, vatReg, act], i) => {
    const ratio = declared / paid;
    const tccState = tcc == null ? 'Not on file' : tcc < TODAY ? 'Expired' : tcc < TODAY + 1 ? 'Expiring' : 'Valid';
    const score = Math.min(98, Math.max(4, Math.round((1.3 - Math.min(ratio, 1.3)) * 70 + ({ Expired: 15, Expiring: 6, 'Not on file': 12 }[tccState] || 0) + (vatReg ? 0 : 10) + act + i % 3)));
    const tier = score >= 60 ? 'Critical' : score >= 30 ? 'High' : score >= 15 ? 'Medium' : 'Low';
    const vatGov = (paid * VAT) / (1 + VAT), vatDecl = declared * VAT;
    const r = rng('taxcon' + i);
    const w = M12.map(() => r.num(0.5, 1.5)); const ws = sum(w);
    return {
      name, short, sector, town, tin: `BW-${tin}`, awarded, invoiced, paid, declared, ratio, gap: paid - declared, tcc, tccState, vatReg, score, tier,
      vatGov, vatDecl, vatGap: Math.max(0, vatGov - vatDecl), wht: paid * WHT, monthly: w.map(x => (paid * x) / ws),
      decMonthly: w.map(x => (declared * x * r.num(0.8, 1.2)) / ws),
    };
  });
  const byName = Object.fromEntries(CON.map(c => [c.name, c]));
  const TIER_TONE = { Critical: 'red', High: 'orange', Medium: 'amber', Low: 'green' };
  const TCC_TONE = { Valid: 'green', Expiring: 'amber', Expired: 'red', 'Not on file': 'slate' };
  const tierPill = c => ({ pill: c.tier, tone: TIER_TONE[c.tier] });
  const tccPill = c => ({ pill: c.tccState, tone: TCC_TONE[c.tccState] });
  const ratioCell = c => ({ bar: Math.min(100, c.ratio * 50), text: c.ratio.toFixed(2) + '×', tone: c.ratio < 0.5 ? 'red' : c.ratio < 1 ? 'orange' : c.ratio < 1.2 ? 'amber' : 'green' });
  const flagged = CON.filter(c => c.tier === 'Critical' || c.tier === 'High').sort((a, b) => b.score - a.score);
  const TOT = { awarded: sum(CON, c => c.awarded), invoiced: sum(CON, c => c.invoiced), paid: sum(CON, c => c.paid), declared: sum(CON, c => c.declared), wht: sum(CON, c => c.wht), vatGap: sum(CON, c => c.vatGap) };
  const shortfall = sum(CON.filter(c => c.gap > 0), c => c.gap);
  const tierCount = t => CON.filter(c => c.tier === t).length;
  const tccCount = t => CON.filter(c => c.tccState === t).length;
  const payM = M12.map((_, m) => sum(CON, c => c.monthly[m]));
  const clem = byName['Clement Pty Ltd'];
  const bwpM = v => fmt.bwp(v * M);

  // Investigation cases (brief example flow: paid > P25M contract > tax records > variance > flag > officer)
  const CASES = [
    ['TXC-26-0141', 'Clement Pty Ltd', 'Paid BWP 18.4M, declared BWP 6.1M; P25M clinic contract', 'Referred to BURS', 'Director Revenue', 'Critical', 41],
    ['TXC-26-0138', 'Makgadikgadi Fleet Services', 'Declared turnover 33% of govt receipts; TCC expired', 'Referred to BURS', 'Chief Internal Auditor', 'Critical', 48],
    ['TXC-26-0144', 'Lesedi Security Services', 'Declared 34% of receipts; TCC expired 15 Jul', 'Contractor query issued', 'Director Revenue', 'Critical', 29],
    ['TXC-26-0147', 'Tswelelo Supplies', 'VAT output below VAT invoiced to government', 'Contractor query issued', 'Chief Accountant', 'Critical', 22],
    ['TXC-26-0150', 'Motswedi Construction', 'Pipeline activity high, returns nil for Jun–Aug', 'Under review', 'Director Projects', 'High', 14],
    ['TXC-26-0152', 'Mokgosi Logistics', 'Declared turnover below govt payments', 'Under review', 'Chief Accountant', 'High', 11],
    ['TXC-26-0155', 'Kalahari Energy Systems', 'Two VAT returns filed late; turnover dip', 'Flagged (triage)', 'Unassigned', 'Medium', 6],
    ['TXC-26-0156', 'Boitumelo Catering', 'Not VAT registered; BWP 1.6M receipts', 'Flagged (triage)', 'Unassigned', 'Medium', 4],
    ['TXC-26-0157', 'Thari Consulting', 'Govt receipts 92% of declared turnover', 'Flagged (triage)', 'Unassigned', 'Medium', 2],
    ['TXC-26-0121', 'Serowe Hardware', 'Split invoices; resolved with amended VAT return', 'Assessed / closed', 'Chief Accountant', 'Medium', 63],
    ['TXC-26-0117', 'Seasons Pty Ltd', 'Late WHT certificate; reconciled', 'Assessed / closed', 'Director Finance', 'Low', 71],
    ['TXC-26-0109', 'Pula Office Solutions', 'Duplicate TIN on vendor master; corrected', 'Assessed / closed', 'Director ICT', 'Low', 88],
  ].map(([id, con, issue, stage, officer, sev, age]) => ({ id, con, issue, stage, officer, sev, age }));
  const STAGES = [['Flagged (triage)', 'slate'], ['Under review', 'blue'], ['Contractor query issued', 'amber'], ['Referred to BURS', 'red'], ['Assessed / closed', 'green']];

  // ── 0 Overview ──
  register(K(0), () => ({
    crumbs,
    kpis: [
      { label: 'Contractors reconciled', value: `${CON.length}`, sub: 'govt payments > BWP 1M', tone: 'blue', pct: 100 },
      { label: 'Govt payments (12 mo)', value: bwpM(TOT.paid), delta: `${fmt.pct((TOT.paid / TOT.awarded) * 100)}`, sub: 'of awarded value', tone: 'violet', pct: (TOT.paid / TOT.awarded) * 100 },
      { label: 'Declared to BURS', value: bwpM(TOT.declared), sub: 'VAT-return turnover', tone: 'cyan' },
      { label: 'Unexplained shortfall', value: bwpM(shortfall), delta: `${CON.filter(c => c.gap > 0).length} contractors`, deltaTone: 'red', sub: 'paid > declared', tone: 'red' },
      { label: 'Open investigations', value: `${CASES.filter(c => c.stage !== 'Assessed / closed').length}`, delta: '▲ 3 this month', deltaTone: 'red', sub: '2 with BURS', tone: 'orange' },
    ],
    insight: { finding: `Government paid <b>Clement Pty Ltd BWP ${clem.paid}M</b> (P25M Construction of Clinic, Molepolole) but the contractor declared only <b>BWP ${clem.declared}M</b> turnover to BURS over the same 12 months, a variance of BWP ${r1(clem.gap)}M. Risk score ${clem.score}/100.`, recommendation: 'Case TXC-26-0141 is with BURS; hold the next clinic certificate pending a tax compliance confirmation.', severity: 'Critical', tone: 'red', actions: ['Explain finding', 'Open case', 'Notify BURS liaison'] },
    grid: [
      [{ span: 12, type: 'steps', title: 'Reconciliation chain | Clement Pty Ltd, Construction of Clinic', steps: [
        { name: 'Contract awarded', meta: 'BWP 25.0M', state: 'done' }, { name: 'Invoices certified', meta: `BWP ${clem.invoiced}M`, state: 'done' },
        { name: 'Payments made', meta: `BWP ${clem.paid}M`, state: 'done' }, { name: 'BURS records checked', meta: 'TIN BW-C04127731', state: 'done' },
        { name: 'Declared activity', meta: `BWP ${clem.declared}M`, state: 'done' }, { name: 'Variance detected', meta: `−BWP ${r1(clem.gap)}M`, state: 'late' },
        { name: 'Risk flag raised', meta: `score ${clem.score}`, state: 'late' }, { name: 'Officer investigates', meta: 'Director Revenue', state: 'current' },
      ] }],
      [
        { span: 8, type: 'bar', title: 'Awarded vs invoiced vs paid vs declared | top 8 contractors (BWP M)', height: 280, categories: top(CON, 'paid', 8).map(c => c.short),
          series: [{ name: 'Awarded', data: top(CON, 'paid', 8).map(c => c.awarded), color: '#1E3A5F' }, { name: 'Invoiced', data: top(CON, 'paid', 8).map(c => c.invoiced), color: 'cyan' }, { name: 'Paid', data: top(CON, 'paid', 8).map(c => c.paid), color: 'blue' }, { name: 'Declared to BURS', data: top(CON, 'paid', 8).map(c => c.declared), color: 'amber' }] },
        { span: 4, type: 'donut', title: 'Contractors by risk tier', height: 280, center: `${tierCount('Critical')} critical`, items: ['Critical', 'High', 'Medium', 'Low'].map(t => ({ name: t, value: tierCount(t), color: TIER_TONE[t] })) },
      ],
      [
        { span: 7, type: 'table', title: 'Flagged contractors | paid vs declared', height: 250,
          columns: [{ key: 'n', label: 'Contractor' }, { key: 'p', label: 'Paid (M)', align: 'right' }, { key: 'd', label: 'Declared (M)', align: 'right' }, { key: 'g', label: 'Variance', align: 'right' }, { key: 'r', label: 'Declared ÷ paid' }, { key: 't', label: 'Risk' }],
          rows: flagged.map(c => ({ n: c.name, p: c.paid.toFixed(1), d: c.declared.toFixed(1), g: { trend: 'down', text: r1(c.gap).toFixed(1) + 'M', tone: 'red' }, r: ratioCell(c), t: tierPill(c) })) },
        { span: 5, type: 'map', title: 'Flagged contractor sites', height: 250,
          pins: flagged.map((c, i) => ({ name: `${c.short} | ${c.town}`, meta: `Paid BWP ${c.paid}M · declared BWP ${c.declared}M`, lon: TOWNS[c.town][0] + (flagged.findIndex(f => f.town === c.town) === i ? 0 : -0.9), lat: TOWNS[c.town][1] + (flagged.findIndex(f => f.town === c.town) === i ? 0 : 0.7), tone: TIER_TONE[c.tier], size: 8 + c.paid / 2 })) },
      ],
    ],
  }));

  // ── 1 Contractor Register ──
  const sectors = [...new Set(CON.map(c => c.sector))];
  const GROUP = { Construction: 'Building & construction', Engineering: 'Building & construction', 'Civil works': 'Roads & civil works', Roads: 'Roads & civil works', ICT: 'ICT & energy', Energy: 'ICT & energy', 'Medical supplies': 'Medical & pharma', Pharmaceuticals: 'Medical & pharma', 'General supplies': 'Goods & supplies', Hardware: 'Goods & supplies', 'Office supplies': 'Goods & supplies' };
  const groupOf = c => GROUP[c.sector] || 'Services';
  const groups = [...new Set(CON.map(groupOf))];
  register(K(1), () => ({
    crumbs,
    kpis: [
      { label: 'Active contractors', value: `${CON.length}`, sub: 'PPADB registered', tone: 'blue', pct: 100 },
      { label: 'TIN matched at BURS', value: '20 of 20', sub: 'vendor master ↔ BURS', tone: 'green', pct: 100 },
      { label: 'VAT registered', value: `${CON.filter(c => c.vatReg).length} of 20`, delta: '1 above threshold', deltaTone: 'red', sub: 'Boitumelo Catering', tone: 'amber', pct: 95 },
      { label: 'Valid tax clearance', value: `${tccCount('Valid')} of 20`, sub: `${tccCount('Expired')} expired`, tone: 'cyan', pct: (tccCount('Valid') / 20) * 100 },
      { label: 'Sectors', value: `${sectors.length}`, sub: `${groups.length} sector groups`, tone: 'violet' },
    ],
    insight: { finding: `<b>Boitumelo Catering</b> received BWP ${byName['Boitumelo Catering'].paid}M in government payments, above the BWP 1M VAT registration threshold, but is not VAT registered with BURS. All 20 contractor TINs match BURS records.`, recommendation: 'Require VAT registration before the next catering order is released.', severity: 'Medium', tone: 'amber' },
    grid: [
      [
        { span: 8, type: 'treemap', title: 'Contract value awarded by contractor (BWP M)', height: 260, valueFmt: v => `BWP ${v}M`, items: top(CON, 'awarded', 20).map(c => ({ name: c.short, value: c.awarded, color: c.tier === 'Critical' ? 'red' : c.tier === 'High' ? 'orange' : undefined })) },
        { span: 4, type: 'donut', title: 'Contractors by sector group', height: 260, center: `${CON.length}`, items: groups.map(g => ({ name: g, value: CON.filter(c => groupOf(c) === g).length })) },
      ],
      [{ span: 12, type: 'table', title: 'Contractor register | procurement vendor master matched to BURS', height: 330,
        columns: [{ key: 'n', label: 'Contractor' }, { key: 'tin', label: 'BURS TIN' }, { key: 's', label: 'Sector' }, { key: 't', label: 'Head office' }, { key: 'v', label: 'VAT' }, { key: 'a', label: 'Awarded (M)', align: 'right' }, { key: 'p', label: 'Paid (M)', align: 'right' }, { key: 'c', label: 'Tax clearance' }, { key: 'r', label: 'Risk' }],
        rows: CON.map(c => ({ n: { strong: c.name }, tin: c.tin, s: c.sector, t: c.town, v: c.vatReg ? { dot: 'green', text: 'Registered' } : { dot: 'red', text: 'Not registered' }, a: c.awarded.toFixed(1), p: c.paid.toFixed(1), c: tccPill(c), r: tierPill(c) })) }],
    ],
  }));

  // ── 2 Contract Awards ──
  const awardsM = M12.map((_, i) => { const r = rng('aw' + i); return { n: r.int(3, 9), v: r.num(18, 62) }; });
  awardsM[6] = { n: 11, v: 96 }; // Apr: A1 road extension
  const AWARDS = [
    ['MOH/CON/2211/25', 'Construction of Clinic', 'Clement Pty Ltd', 'Health', 25.0, 'Open tender', 'Valid'],
    ['MTC/RDS/0917/25', 'A1 Palapye–Mahalapye Rehab', 'Mmila Road Contractors', 'Transport', 96.0, 'Open tender', 'Valid'],
    ['MTC/RDS/1044/26', 'Kazungula Link Road', 'Mmila Road Contractors', 'Transport', 38.0, 'Open tender', 'Valid'],
    ['MWS/WTR/0388/25', 'Tsabong Water Treatment', 'Tlotlo Civil Works', 'Water', 27.5, 'Open tender', 'Valid'],
    ['MWS/WTR/0412/26', 'Selebi-Phikwe Pipeline', 'Motswedi Construction', 'Water', 33.0, 'Selective', 'Valid'],
    ['MOD/HSG/0156/25', 'Jwaneng Police Housing', 'Tlotlo Civil Works', 'Defence', 29.4, 'Open tender', 'Valid'],
    ['MOH/FLT/0733/26', 'Ambulance fleet hire', 'Makgadikgadi Fleet Services', 'Health', 6.3, 'Direct', 'Expired'],
    ['MOH/SEC/0519/26', 'Hospital guarding services', 'Lesedi Security Services', 'Health', 6.8, 'Selective', 'Expired'],
    ['MOH/SUP/0802/26', 'Cleaning consumables', 'Tswelelo Supplies', 'Health', 7.8, 'Quotation', 'Expiring'],
    ['MOE/CAT/0144/26', 'School feeding catering', 'Boitumelo Catering', 'Education', 2.2, 'Quotation', 'Not on file'],
  ];
  register(K(2), () => ({
    crumbs,
    kpis: [
      { label: 'Contracts awarded', value: `${sum(awardsM, a => a.n)}`, sub: '12 months', tone: 'blue' },
      { label: 'Value awarded', value: bwpM(TOT.awarded), sub: 'to 20 contractors', tone: 'violet' },
      { label: 'Top 3 share', value: `${fmt.pct((sum(top(CON, 'awarded', 3), c => c.awarded) / TOT.awarded) * 100)}`, sub: 'Mmila, Tlotlo, Kgalagadi', tone: 'amber', pct: (sum(top(CON, 'awarded', 3), c => c.awarded) / TOT.awarded) * 100 },
      { label: 'Awarded without valid TCC', value: '4', delta: 'BWP 23.1M', deltaTone: 'red', sub: 'PPADB rule breach', tone: 'red' },
      { label: 'Direct / quotation', value: '14%', sub: 'of award value', tone: 'orange', pct: 14 },
    ],
    insight: { finding: 'Four contracts worth <b>BWP 23.1M</b> were awarded to contractors whose tax clearance certificate was expired, expiring or not on file at award date, including Makgadikgadi Fleet Services (direct award).', recommendation: 'Make a live BURS clearance check a hard stop in the award workflow.', severity: 'High', tone: 'orange' },
    grid: [
      [
        { span: 8, type: 'bar', title: 'Awards per month | count and value', height: 260, categories: M12, y2: ' ',
          series: [{ name: 'Contracts', data: awardsM.map(a => a.n), color: 'blue' }, { name: 'Value (BWP M, right)', type: 'line', axis: 1, data: awardsM.map(a => r1(a.v)), color: 'amber' }] },
        { span: 4, type: 'donut', title: 'Award value by method', height: 260, center: bwpM(TOT.awarded), valueFmt: v => `BWP ${v}M`, items: [{ name: 'Open tender', value: 412.7 }, { name: 'Selective tender', value: 63.1 }, { name: 'Quotation', value: 43.9 }, { name: 'Direct award', value: 33.8, color: 'red' }] },
      ],
      [
        { span: 4, type: 'bar', title: 'Awarded value | top 10 (BWP M)', height: 290, gridOpt: { right: 30 }, horizontal: true, labelMax: 22, categories: top(CON, 'awarded', 10).map(c => c.name),
          series: [{ name: 'Awarded', label: true, data: top(CON, 'awarded', 10).map(c => ({ value: c.awarded, itemStyle: { color: c.tier === 'Critical' ? '#EF4444' : c.tier === 'High' ? '#F97316' : '#3B82F6' } })) }] },
        { span: 8, type: 'table', title: 'Awards register | tax clearance at award date', height: 290,
          columns: [{ key: 'ref', label: 'Contract' }, { key: 'p', label: 'Project / service' }, { key: 'c', label: 'Contractor' }, { key: 'v', label: 'Value (M)', align: 'right' }, { key: 't', label: 'TCC at award' }],
          rows: AWARDS.map(([ref, p, c, , v, , t]) => ({ ref, p, c, v: v.toFixed(1), t: { pill: t, tone: TCC_TONE[t] } })) },
      ],
    ],
  }));

  // ── 3 Invoices ──
  const invM = M12.map((_, m) => sum(CON, c => c.monthly[m]) * 1.07);
  register(K(3), () => ({
    crumbs,
    kpis: [
      { label: 'Invoices received', value: '1,248', sub: '12 months', tone: 'blue' },
      { label: 'Invoiced value (incl VAT)', value: bwpM(TOT.invoiced), delta: `${fmt.pct((TOT.invoiced / TOT.awarded) * 100)}`, sub: 'of award', tone: 'violet', pct: (TOT.invoiced / TOT.awarded) * 100 },
      { label: 'VAT charged to govt', value: bwpM((TOT.invoiced * VAT) / (1 + VAT)), sub: '14% standard rate', tone: 'cyan' },
      { label: 'VAT no. not valid at BURS', value: '17', delta: 'BWP 1.9M', deltaTone: 'red', sub: 'input VAT at risk', tone: 'red' },
      { label: 'Invoice > certified work', value: '9', sub: 'held for QS review', tone: 'orange' },
    ],
    insight: { finding: '<b>17 invoices</b> quote a VAT number that BURS shows as deregistered or belonging to another taxpayer; 11 of these are from Tswelelo Supplies and Lesedi Security Services.', recommendation: 'Reject invoices that fail the BURS VAT-number check at capture, before payment.', severity: 'High', tone: 'orange' },
    grid: [
      [
        { span: 7, type: 'bar', title: 'Invoice value per month | net and VAT (BWP M)', height: 270, categories: M12,
          series: [{ name: 'Net of VAT', stack: 'i', data: invM.map(v => r1(v / (1 + VAT))), color: 'blue' }, { name: 'VAT 14%', stack: 'i', data: invM.map(v => r1((v * VAT) / (1 + VAT))), color: 'cyan' }] },
        { span: 5, type: 'funnel', title: 'Invoice validation pipeline (count)', height: 270, items: [{ name: 'Received', value: 1248 }, { name: 'PO + GRN match', value: 1197 }, { name: 'VAT no. valid', value: 1180 }, { name: 'Certified', value: 1142 }, { name: 'Paid', value: 1096 }] },
      ],
      [
        { span: 7, type: 'table', title: 'Invoice exceptions', height: 270,
          columns: [{ key: 'i', label: 'Invoice' }, { key: 'c', label: 'Contractor' }, { key: 'a', label: 'Amount', align: 'right' }, { key: 'v', label: 'VAT', align: 'right' }, { key: 'x', label: 'Exception' }],
          rows: (() => { const r = rng('invx'); const ex = [['Tswelelo Supplies', 'VAT no. deregistered', 'red'], ['Lesedi Security Services', 'VAT no. belongs to other TIN', 'red'], ['Clement Pty Ltd', 'Invoice > certified work', 'orange'], ['Motswedi Construction', 'Invoice > certified work', 'orange'], ['Mokgosi Logistics', 'Duplicate invoice number', 'orange'], ['Boitumelo Catering', 'VAT charged, not registered', 'red'], ['Makgadikgadi Fleet Services', 'VAT computed at 12%', 'amber'], ['Serowe Hardware', 'Split below threshold', 'amber'], ['Kalahari Energy Systems', 'Invoice date before GRN', 'amber']]; return ex.map(([c, x, t]) => { const a = r.int(60, 1900) * 1000; return { i: `INV-26-${r.int(10000, 99999)}`, c, a: fmt.n(a), v: fmt.n((a * VAT) / (1 + VAT)), x: { pill: x, tone: t } }; }); })() },
        { span: 5, type: 'bar', title: 'Invoiced as % of award | top 10 by value', height: 270, horizontal: true, labelMax: 18, categories: top(CON, 'awarded', 10).map(c => c.short),
          series: [{ name: 'Invoiced %', label: true, labelFmt: p => p.value + '%', data: top(CON, 'awarded', 10).map(c => { const v = Math.round((c.invoiced / c.awarded) * 100); return { value: v, itemStyle: { color: v > 90 ? '#F59E0B' : '#06B6D4' } }; }) }] },
      ],
    ],
  }));

  // ── 4 Payments ──
  register(K(4), () => ({
    crumbs,
    kpis: [
      { label: 'Payments (12 months)', value: bwpM(TOT.paid), sub: '1,096 vouchers', tone: 'blue' },
      { label: 'Paid vs invoiced', value: fmt.pct((TOT.paid / TOT.invoiced) * 100), sub: 'invoices settled', tone: 'violet', pct: (TOT.paid / TOT.invoiced) * 100 },
      { label: 'WHT deducted at source', value: bwpM(TOT.wht), sub: '3% of payments', tone: 'cyan' },
      { label: 'Paid while TCC expired', value: bwpM(2.9), delta: '14 vouchers', deltaTone: 'red', sub: 'Lesedi, Makgadikgadi', tone: 'red' },
      { label: 'Avg days invoice → pay', value: '31', delta: '▲ 3 days', deltaTone: 'amber', sub: 'target 30', tone: 'amber' },
    ],
    insight: { finding: `<b>BWP 2.9M</b> was paid across 14 vouchers to Lesedi Security Services and Makgadikgadi Fleet Services after their tax clearance certificates expired.`, recommendation: 'Block the vendor on IFMIS once a TCC lapses; Accountant General to confirm by 30 Sep.', severity: 'High', tone: 'orange', actions: ['Explain finding', 'Open vouchers', 'Block vendors'] },
    grid: [
      [
        { span: 8, type: 'area', title: 'Monthly payments by contractor group (BWP M)', height: 270, categories: M12,
          series: [
            { name: 'Roads & civil', stack: 'p', data: M12.map((_, m) => r1(sum(CON.filter(c => ['Roads', 'Civil works'].includes(c.sector)), c => c.monthly[m]))) },
            { name: 'Construction', stack: 'p', data: M12.map((_, m) => r1(sum(CON.filter(c => ['Construction', 'Engineering'].includes(c.sector)), c => c.monthly[m]))) },
            { name: 'ICT & energy', stack: 'p', data: M12.map((_, m) => r1(sum(CON.filter(c => ['ICT', 'Energy'].includes(c.sector)), c => c.monthly[m]))) },
            { name: 'Supplies & services', stack: 'p', data: M12.map((_, m) => r1(sum(CON.filter(c => !['Roads', 'Civil works', 'Construction', 'Engineering', 'ICT', 'Energy'].includes(c.sector)), c => c.monthly[m]))) },
          ] },
        { span: 4, type: 'waterfall', title: 'Award to payment bridge (BWP M)', height: 270, min: 0, rotate: 20, downTone: 'amber',
          steps: [{ name: 'Awarded', value: r1(TOT.awarded), total: true }, { name: 'Not invoiced', value: -r1(TOT.awarded - TOT.invoiced) }, { name: 'Unpaid', value: -r1(TOT.invoiced - TOT.paid) }, { name: 'Paid', value: r1(TOT.paid), total: true }] },
      ],
      [{ span: 12, type: 'table', title: 'Largest payments | last 12 months', height: 260,
        columns: [{ key: 'pv', label: 'Voucher' }, { key: 'd', label: 'Date' }, { key: 'c', label: 'Contractor' }, { key: 'p', label: 'Project' }, { key: 'g', label: 'Gross', align: 'right' }, { key: 'w', label: 'WHT 3%', align: 'right' }, { key: 'n', label: 'Net paid', align: 'right' }, { key: 't', label: 'TCC at payment' }],
        rows: (() => { const r = rng('pays'); const list = [['Mmila Road Contractors', 'A1 Palapye–Mahalapye Rehab'], ['Tlotlo Civil Works', 'Tsabong Water Treatment'], ['Kgalagadi Builders', 'Maun District Hospital Wing'], ['Chobe ICT Solutions', 'e-Government Data Centre'], ['Clement Pty Ltd', 'Construction of Clinic'], ['Mmila Road Contractors', 'Kazungula Link Road'], ['Letsatsi Engineering', 'Serowe Primary School Blocks'], ['Lesedi Security Services', 'Hospital guarding services'], ['Makgadikgadi Fleet Services', 'Ambulance fleet hire']]; return list.map(([c, p], i) => { const g = (i < 7 ? r.num(2.2, 6.8) : r.num(0.4, 0.7)) * M; const con = byName[c]; return { pv: `PV-26-${r.int(40000, 49999)}`, d: `${String(r.int(1, 28)).padStart(2, '0')} ${r.pick(M12)}`, c: { strong: c }, p, g: fmt.n(g), w: fmt.n(g * WHT), n: fmt.n(g * (1 - WHT)), t: i >= 7 ? { pill: 'Expired', tone: 'red' } : tccPill(con) }; }); })() }],
    ],
  }));

  // ── 5 Tax Declarations ──
  const HEAT_CON = CON.filter((_, i) => i < 12);
  const fileStatus = (c, m) => {
    if (c.name === 'Motswedi Construction' && m >= 8 && m <= 10) return 0;
    if (c.name === 'Lesedi Security Services' && m >= 9) return 0;
    if (c.name === 'Makgadikgadi Fleet Services' && m % 3 === 1) return 0;
    if (c.name === 'Tswelelo Supplies' && m % 2 === 0) return 1;
    if (c.name === 'Clement Pty Ltd' && m >= 6) return 1;
    return rng('fs' + c.name + m)() > 0.88 ? 1 : 2;
  };
  register(K(5), () => {
    const values = [];
    HEAT_CON.forEach((c, y) => M12.slice(6).forEach((_, x) => values.push([x, y, fileStatus(c, x + 6)])));
    const onTime = values.filter(v => v[2] === 2).length, late = values.filter(v => v[2] === 1).length, missing = values.filter(v => v[2] === 0).length;
    return {
      crumbs,
      kpis: [
        { label: 'VAT returns due', value: `${values.length}`, sub: '12 contractors × 6 months', tone: 'blue' },
        { label: 'Filed on time', value: fmt.pct((onTime / values.length) * 100), sub: `${onTime} returns`, tone: 'green', pct: (onTime / values.length) * 100 },
        { label: 'Filed late', value: `${late}`, sub: 'after the 25th', tone: 'amber' },
        { label: 'Not filed', value: `${missing}`, delta: 'nil activity implied', deltaTone: 'red', sub: '', tone: 'red' },
        { label: 'VAT gap vs govt invoices', value: bwpM(TOT.vatGap), sub: 'VAT billed > VAT declared', tone: 'orange' },
      ],
      insight: { finding: `<b>Motswedi Construction</b> filed no VAT returns for Jun–Aug while certifying pipeline works worth BWP 4.1M on Selebi-Phikwe. VAT billed to government exceeds VAT declared by <b>${bwpM(TOT.vatGap)}</b> across ${CON.filter(c => c.vatGap > 0).length} contractors.`, recommendation: 'Request BURS to issue estimated assessments for the unfiled periods.', severity: 'High', tone: 'orange' },
      grid: [
        [
          { span: 8, type: 'heatmap', title: 'VAT return filing | contractor × month (Apr–Sep 2026)', height: 320, x: M12.slice(6), y: HEAT_CON.map(c => c.name), values, min: 0, max: 2, colors: ['#EF4444', '#F59E0B', '#10B981'], cellFmt: v => ['Missing', 'Late', 'On time'][v], valueFmt: v => ['Not filed', 'Filed late', 'Filed on time'][v] },
          { span: 4, type: 'donut', title: 'Filing status', height: 320, center: `${values.length} returns`, items: [{ name: 'On time', value: onTime, color: 'green' }, { name: 'Late', value: late, color: 'amber' }, { name: 'Not filed', value: missing, color: 'red' }] },
        ],
        [{ span: 12, type: 'table', title: 'Declared activity | BURS returns vs government invoices (BWP M, 12 months)', height: 300,
          columns: [{ key: 'n', label: 'Contractor' }, { key: 'd', label: 'Declared turnover', align: 'right' }, { key: 'p', label: 'Govt payments', align: 'right' }, { key: 'vg', label: 'VAT billed to govt', align: 'right' }, { key: 'vd', label: 'VAT output declared', align: 'right' }, { key: 'gap', label: 'VAT gap', align: 'right' }, { key: 'it', label: 'Income tax return' }],
          rows: top(CON, 'vatGap', 20).map(c => ({ n: c.name, d: c.declared.toFixed(1), p: c.paid.toFixed(1), vg: c.vatGov.toFixed(2), vd: c.vatDecl.toFixed(2), gap: c.vatGap > 0 ? { trend: 'up', text: c.vatGap.toFixed(2), tone: 'red' } : { trend: 'flat', text: '0.00', tone: 'slate' }, it: c.tier === 'Critical' ? { pill: 'Under-declared', tone: 'red' } : c.name === 'Boitumelo Catering' ? { pill: 'Filed, no VAT', tone: 'amber' } : { pill: 'Filed', tone: 'green' } })) }],
      ],
    };
  });

  // ── 6 Payments vs Declared Turnover (signature) ──
  const pt = c => ({ name: c.short, x: c.paid, y: c.declared, tone: TIER_TONE[c.tier], size: 10 + Math.sqrt(c.awarded) * 2 });
    register(K(6), () => ({
    crumbs,
    kpis: [
      { label: 'Contractors plotted', value: `${CON.length}`, sub: 'paid > BWP 1M', tone: 'blue' },
      { label: 'Below the diagonal', value: `${CON.filter(c => c.ratio < 1).length}`, delta: 'declared < paid', deltaTone: 'red', sub: 'impossible if honest', tone: 'red' },
      { label: 'Aggregate declared ÷ paid', value: (TOT.declared / TOT.paid).toFixed(2) + '×', sub: 'expected > 1.0', tone: 'cyan' },
      { label: 'Largest shortfall', value: bwpM(clem.gap), sub: 'Clement Pty Ltd', tone: 'orange' },
      { label: 'Tax at risk (est.)', value: bwpM(shortfall * 0.22 + TOT.vatGap), sub: 'CIT 22% + VAT gap', tone: 'amber' },
    ],
    insight: { finding: `<b>${CON.filter(c => c.ratio < 1).length} contractors</b> sit below the diagonal: they received more from government alone than the total turnover they declared to BURS. Four (Clement, Makgadikgadi, Lesedi, Tswelelo) declared under half of what the state paid them.`, recommendation: 'Open BURS desk audits for the four sub-0.5× contractors and suspend new awards pending outcome.', severity: 'Critical', tone: 'red', actions: ['Explain finding', 'Open outliers', 'Refer to BURS'] },
    grid: [
      [
        { span: 4, type: 'scatter', title: 'Paid under BWP 10M', height: 330, xName: 'Govt payments (BWP M)', yName: 'Declared (BWP M)', xMin: 0, xMax: 16, yMin: 0, yMax: 16, diagonal: true, labels: true, points: CON.filter(c => c.paid < 10).map(pt), legend: [['Critical', 'red'], ['High', 'orange'], ['Medium', 'amber'], ['Low', 'green']] },
        { span: 4, type: 'scatter', title: 'Paid BWP 10M – 25M', height: 330, xName: 'Govt payments (BWP M)', yName: 'Declared (BWP M)', xMin: 0, xMax: 35, yMin: 0, yMax: 35, diagonal: true, labels: true, points: CON.filter(c => c.paid >= 10 && c.paid <= 25).map(pt) },
        { span: 4, type: 'scatter', title: 'Paid over BWP 25M', height: 330, xName: 'Govt payments (BWP M)', yName: 'Declared (BWP M)', xMin: 0, xMax: 130, yMin: 0, yMax: 130, diagonal: true, labels: true, points: CON.filter(c => c.paid > 25).map(pt), badge: ['Diagonal = declared equals paid', 'slate'] },
      ],
      [
        { span: 5, type: 'bar', title: 'Declared ÷ paid ratio | sorted (1.0× = parity)', height: 340, gridOpt: { right: 40 }, horizontal: true, labelMax: 16, categories: [...CON].sort((a, b) => a.ratio - b.ratio).map(c => c.short),
          series: [{ name: 'Declared ÷ paid', label: true, labelFmt: p => p.value + '×', data: [...CON].sort((a, b) => a.ratio - b.ratio).map(c => ({ value: +c.ratio.toFixed(2), itemStyle: { color: c.ratio < 0.5 ? '#EF4444' : c.ratio < 1 ? '#F97316' : c.ratio < 1.2 ? '#F59E0B' : '#10B981' } })) }] },
        { span: 7, type: 'table', title: 'Outliers below the diagonal', height: 340,
          columns: [{ key: 'n', label: 'Contractor' }, { key: 'p', label: 'Paid (M)', align: 'right' }, { key: 'd', label: 'Declared (M)', align: 'right' }, { key: 'g', label: 'Shortfall (M)', align: 'right' }, { key: 'r', label: 'Ratio' }, { key: 'a', label: 'Action' }],
          rows: CON.filter(c => c.ratio < 1).sort((a, b) => a.ratio - b.ratio).map(c => ({ n: { strong: c.name }, p: c.paid.toFixed(1), d: c.declared.toFixed(1), g: { trend: 'down', text: c.gap.toFixed(1), tone: 'red' }, r: { trend: 'down', text: c.ratio.toFixed(2) + '×', tone: c.ratio < 0.5 ? 'red' : 'orange' }, a: c.ratio < 0.5 ? { pill: 'BURS audit', tone: 'red' } : { pill: 'Contractor query', tone: 'amber' } })) },
      ],
    ],
  }));

  // ── 7 Withholding Tax ──
  const MIN_WHT = MINISTRIES.map((m, i) => { const r = rng('whtm' + i); const ded = (m.actual * 0.09 * WHT) * r.num(0.8, 1.2); const rem = ded * (i === 3 ? 0.71 : i === 6 ? 0.82 : r.num(0.93, 1)); return { name: m.full, ded, rem, late: i === 3 ? 38 : i === 6 ? 21 : r.int(0, 9) }; });
  const whtDedM = payM.map(v => v * WHT);
  const whtRemM = whtDedM.map((v, i) => v * (i === 10 ? 0.72 : i === 11 ? 0.64 : rng('wr' + i).num(0.94, 1)));
  register(K(7), () => {
    const ded = sum(MIN_WHT, m => m.ded), rem = sum(MIN_WHT, m => m.rem);
    return {
      crumbs,
      kpis: [
        { label: 'WHT deducted', value: bwpM(TOT.wht), sub: '3% on contract payments', tone: 'blue' },
        { label: 'Remitted to BURS', value: bwpM(sum(whtRemM)), delta: fmt.pct((sum(whtRemM) / sum(whtDedM)) * 100), sub: 'of deducted', tone: 'green', pct: (sum(whtRemM) / sum(whtDedM)) * 100 },
        { label: 'Held, not remitted', value: bwpM(sum(whtDedM) - sum(whtRemM)), delta: 'Aug–Sep', deltaTone: 'red', sub: 'due by 15th', tone: 'red' },
        { label: 'WHT certificates issued', value: '1,021', sub: 'of 1,096 payments', tone: 'cyan', pct: 93 },
        { label: 'Ministries paying late', value: '2', sub: 'Agriculture, Energy', tone: 'amber' },
      ],
      insight: { finding: `Withholding tax deducted in August and September has only been <b>${fmt.pct((sum(whtRemM.slice(10)) / sum(whtDedM.slice(10))) * 100)}</b> remitted; Ministry of Agriculture remits an average of 38 days after the 15th-of-month deadline.`, recommendation: 'Automate the WHT remittance from IFMIS on the 10th of each month.', severity: 'Medium', tone: 'amber' },
      grid: [
        [
          { span: 8, type: 'bar', title: 'WHT deducted vs remitted to BURS (BWP K)', height: 270, categories: M12, y2: ' ', gridOpt: { right: 44 },
            series: [{ name: 'Deducted', data: whtDedM.map(v => Math.round(v * 1000)), color: '#1E3A5F' }, { name: 'Remitted', data: whtRemM.map(v => Math.round(v * 1000)), color: 'green' }, { name: 'Remitted % (right)', type: 'line', axis: 1, data: whtRemM.map((v, i) => Math.round((v / whtDedM[i]) * 100)), color: 'amber', markLine: { value: 95, label: 'Target 95%', tone: 'cyan' } }] },
          { span: 4, type: 'gauge', title: 'Remittance rate | on-time rate', height: 270, gauges: [{ name: 'Remitted', value: Math.round((rem / ded) * 100), good: 95, warn: 85 }, { name: 'On time', value: 81, good: 90, warn: 75 }] },
        ],
        [
          { span: 7, type: 'table', title: 'WHT by ministry (paying entity)', height: 260,
            columns: [{ key: 'n', label: 'Ministry' }, { key: 'd', label: 'Deducted', align: 'right' }, { key: 'r', label: 'Remitted', align: 'right' }, { key: 'o', label: 'Outstanding', align: 'right' }, { key: 'l', label: 'Avg days late', align: 'right' }, { key: 's', label: 'Status' }],
            rows: MIN_WHT.map(m => ({ n: m.name, d: fmt.n(m.ded * M), r: fmt.n(m.rem * M), o: fmt.n((m.ded - m.rem) * M), l: m.late, s: m.late > 15 ? { pill: 'Late', tone: 'red' } : m.late > 5 ? { pill: 'Watch', tone: 'amber' } : { pill: 'Compliant', tone: 'green' } })) },
          { span: 5, type: 'bar', title: 'WHT withheld by contractor | top 8 (BWP K)', height: 260, gridOpt: { right: 36 }, horizontal: true, labelMax: 18, categories: top(CON, 'wht', 8).map(c => c.short),
            series: [{ name: 'WHT', label: true, data: top(CON, 'wht', 8).map(c => Math.round(c.wht * 1000)), color: 'violet' }] },
        ],
      ],
    };
  });

  // ── 8 Tax Clearance Status ──
  register(K(8), () => ({
    crumbs,
    kpis: [
      { label: 'Valid TCC', value: `${tccCount('Valid')}`, sub: 'of 20 contractors', tone: 'green', pct: tccCount('Valid') * 5 },
      { label: 'Expiring ≤ 30 days', value: `${tccCount('Expiring')}`, sub: 'renewal reminder sent', tone: 'amber' },
      { label: 'Expired', value: `${tccCount('Expired')}`, delta: 'still being paid', deltaTone: 'red', sub: '', tone: 'red' },
      { label: 'Not on file', value: `${tccCount('Not on file')}`, sub: 'Boitumelo Catering', tone: 'slate' },
      { label: 'TCC checks at payment', value: '97%', delta: '▲ 6 pts', sub: 'automated via BURS API', tone: 'blue', pct: 97 },
    ],
    insight: { finding: 'Lesedi Security Services (expired 15 Jul) and Makgadikgadi Fleet Services (expired 12 Aug) continue to receive payments. Three more certificates lapse before end October.', recommendation: 'Send renewal notices to Tswelelo, Mokgosi and Thari; suspend payments on expiry.', severity: 'High', tone: 'orange' },
    grid: [
      [
        { span: 8, type: 'gantt', title: 'Tax clearance certificate validity | 12-month certificates', height: 330, start: 0, end: 18, today: TODAY, labelWidth: 190, ticks: ['Jan 26', 'Apr 26', 'Jul 26', 'Oct 26', 'Jan 27', 'Apr 27', 'Jul 27'],
          tasks: [...CON].filter(c => c.tcc != null).sort((a, b) => a.tcc - b.tcc).map(c => ({ name: c.name, start: Math.max(0, c.tcc - 12), end: c.tcc, progress: Math.min(100, Math.round(((TODAY - (c.tcc - 12)) / 12) * 100)), tone: TCC_TONE[c.tccState], label: `exp ${monthLabel(c.tcc)}` })) },
        { span: 4, type: 'donut', title: 'TCC status', height: 330, center: `${tccCount('Valid')}/20 valid`, items: ['Valid', 'Expiring', 'Expired', 'Not on file'].map(s => ({ name: s, value: tccCount(s), color: TCC_TONE[s] === 'slate' ? '#475569' : TCC_TONE[s] })) },
      ],
      [
        { span: 6, type: 'list', title: 'Clearance actions', height: 250, items: [...CON].filter(c => c.tccState !== 'Valid').sort((a, b) => (a.tcc ?? -1) - (b.tcc ?? -1)).map(c => ({ title: c.name, meta: c.tccState === 'Expired' ? `Expired ${monthLabel(c.tcc)} · payments continuing` : c.tccState === 'Expiring' ? `Expires ${monthLabel(c.tcc)} · reminder sent` : 'No certificate on vendor file', pill: c.tccState, tone: TCC_TONE[c.tccState] })) },
        { span: 6, type: 'bar', title: 'Payments checked against BURS TCC before release (%)', height: 250, categories: M12, gridOpt: { right: 56 },
          series: [{ name: 'Checked %', label: true, data: [71, 74, 78, 80, 84, 86, 89, 91, 93, 95, 96, 97].map(v => ({ value: v, itemStyle: { color: v >= 95 ? '#10B981' : v >= 85 ? '#3B82F6' : '#F59E0B' } })), markLine: { value: 95, label: 'Target 95%', tone: 'green' } }] },
      ],
    ],
  }));

  // ── 9 Variances & Risk Flags ──
  const comp = c => ({ turnover: Math.round((1.3 - Math.min(c.ratio, 1.3)) * 70), tcc: { Expired: 15, Expiring: 6, 'Not on file': 12 }[c.tccState] || 0, vat: c.vatReg ? Math.min(12, Math.round(c.vatGap * 6)) : 10 });
  const FLAGS = [
    ['Declared turnover < govt payments', 'Clement Pty Ltd', 12.3, 'Critical', 'With BURS', 'Director Revenue'],
    ['Declared turnover < govt payments', 'Makgadikgadi Fleet Services', 3.1, 'Critical', 'With BURS', 'Chief Internal Auditor'],
    ['Payment while TCC expired', 'Lesedi Security Services', 1.6, 'Critical', 'Query issued', 'Director Revenue'],
    ['VAT billed > VAT declared', 'Tswelelo Supplies', 0.57, 'Critical', 'Query issued', 'Chief Accountant'],
    ['Project activity with nil returns', 'Motswedi Construction', 4.1, 'High', 'Under review', 'Director Projects'],
    ['Declared turnover < govt payments', 'Mokgosi Logistics', 0.4, 'High', 'Under review', 'Chief Accountant'],
    ['VAT charged, not VAT registered', 'Boitumelo Catering', 0.25, 'Medium', 'Triage', 'Unassigned'],
    ['Late VAT returns (2 of 6)', 'Kalahari Energy Systems', 1.6, 'Medium', 'Triage', 'Unassigned'],
    ['Govt share of turnover > 90%', 'Thari Consulting', 4.9, 'Medium', 'Triage', 'Unassigned'],
    ['Employee count vs contract size', 'Clement Pty Ltd', 25.0, 'High', 'With BURS', 'Director Revenue'],
  ];
  const riskTop = top(CON, 'score', 10);
  register(K(9), () => ({
    crumbs,
    kpis: [
      { label: 'Open risk flags', value: '38', delta: '▲ 7 this month', deltaTone: 'red', sub: '9 rules', tone: 'red' },
      { label: 'Critical contractors', value: `${tierCount('Critical')}`, sub: 'score ≥ 60', tone: 'red' },
      { label: 'Value under flag', value: bwpM(sum(flagged, c => c.paid)), sub: 'payments to flagged', tone: 'orange' },
      { label: 'Avg risk score', value: `${Math.round(sum(CON, c => c.score) / CON.length)}`, sub: 'all contractors', tone: 'amber', pct: sum(CON, c => c.score) / CON.length },
      { label: 'False positive rate', value: '9%', sub: 'last 2 quarters', tone: 'green', pct: 9 },
    ],
    insight: { finding: `Turnover under-declaration drives <b>${Math.round((sum(riskTop, c => comp(c).turnover) / sum(riskTop, c => c.score)) * 100)}%</b> of the risk score for the top 10 contractors. Clement Pty Ltd scores <b>${clem.score}</b>, with a site of 40+ workers against 6 employees declared for PAYE.`, recommendation: 'Add PAYE headcount from BURS to the activity check for all construction contractors.', severity: 'Critical', tone: 'red' },
    grid: [
      [
        { span: 7, type: 'bar', title: 'Risk score by contractor | score components (top 10)', height: 290, horizontal: true, labelMax: 22, categories: riskTop.map(c => c.name),
          series: [{ name: 'Turnover variance', stack: 'r', data: riskTop.map(c => comp(c).turnover), color: 'red' }, { name: 'Tax clearance', stack: 'r', data: riskTop.map(c => comp(c).tcc), color: 'amber' }, { name: 'VAT / registration', stack: 'r', data: riskTop.map(c => comp(c).vat), color: 'violet' }, { name: 'Activity & other', stack: 'r', data: riskTop.map(c => Math.max(0, c.score - comp(c).turnover - comp(c).tcc - comp(c).vat)), color: 'cyan' }] },
        { span: 5, type: 'radar', title: 'Risk profile | Clement vs construction peers', height: 290, indicators: ['Turnover gap', 'VAT gap', 'PAYE vs site', 'Late filing', 'Award concentration'].map(n => ({ name: n, max: 100 })),
          series: [{ name: 'Clement Pty Ltd', values: [92, 71, 84, 48, 66], color: 'red' }, { name: 'Construction peer avg', values: [22, 18, 25, 20, 30], color: 'cyan' }] },
      ],
      [{ span: 12, type: 'table', title: 'Risk flag register', height: 280,
        columns: [{ key: 'id', label: 'Flag' }, { key: 'rule', label: 'Rule triggered' }, { key: 'c', label: 'Contractor' }, { key: 'v', label: 'Value (BWP M)', align: 'right' }, { key: 'sev', label: 'Severity' }, { key: 'st', label: 'Status' }, { key: 'o', label: 'Owner' }],
        rows: FLAGS.map(([rule, c, v, sev, st, own], i) => ({ id: `RF-${2604 + i * 3}`, rule: { strong: rule }, c, v: v.toFixed(2), sev: { pill: sev, tone: TIER_TONE[sev] }, st: { dot: st === 'With BURS' ? 'red' : st === 'Query issued' ? 'amber' : st === 'Under review' ? 'blue' : 'slate', text: st }, o: own })) }],
    ],
  }));

  // ── 10 Cases for Investigation ──
  register(K(10), () => {
    const open = CASES.filter(c => c.stage !== 'Assessed / closed');
    const officers = [...new Set(open.map(c => c.officer))];
    return {
      crumbs,
      kpis: [
        { label: 'Open cases', value: `${open.length}`, delta: '▲ 3 this month', deltaTone: 'red', sub: '', tone: 'orange' },
        { label: 'Referred to BURS', value: `${CASES.filter(c => c.stage === 'Referred to BURS').length}`, sub: 'formal referral', tone: 'red' },
        { label: 'Value under investigation', value: bwpM(sum(open, c => byName[c.con].paid)), sub: 'govt payments', tone: 'violet' },
        { label: 'Tax assessed (FY)', value: 'BWP 1.84M', delta: '▲ 3 cases closed', sub: 'raised by BURS', tone: 'green' },
        { label: 'Avg case age', value: `${Math.round(sum(open, c => c.age) / open.length)} days`, sub: 'target 60', tone: 'blue' },
      ],
      insight: { finding: `Three cases have sat in triage without an assigned officer; the two BURS referrals (Clement, Makgadikgadi) have been open <b>41 and 48 days</b> with no BURS acknowledgement on file.`, recommendation: 'Assign the triage cases today and escalate the BURS referrals through the Commissioner General liaison.', severity: 'Medium', tone: 'amber', actions: ['Explain finding', 'Assign officer', 'Escalate to BURS'] },
      grid: [
        [{ span: 12, type: 'kanban', title: 'Investigation board', height: 330,
          columns: STAGES.map(([name, t]) => ({ name, tone: t, items: CASES.filter(c => c.stage === name).map(c => ({ title: `${c.id} · ${c.con}`, pill: c.sev, tone: TIER_TONE[c.sev], meta: `${c.age}d · ${c.officer}` })) })) }],
        [
          { span: 7, type: 'table', title: 'Case register', height: 270,
            columns: [{ key: 'id', label: 'Case' }, { key: 'c', label: 'Contractor' }, { key: 'i', label: 'Issue', nowrap: false }, { key: 's', label: 'Stage' }, { key: 'a', label: 'Age', align: 'right' }],
            rows: CASES.map(c => ({ id: c.id, c: { strong: c.con }, i: c.issue, s: { pill: c.stage, tone: STAGES.find(s => s[0] === c.stage)[1] }, a: `${c.age} d` })) },
          { span: 5, type: 'bar', title: 'Open cases by officer', height: 270, horizontal: true, labelMax: 24, categories: officers,
            series: [{ name: 'Critical', stack: 'o', data: officers.map(o => open.filter(c => c.officer === o && c.sev === 'Critical').length), color: 'red' }, { name: 'High', stack: 'o', data: officers.map(o => open.filter(c => c.officer === o && c.sev === 'High').length), color: 'orange' }, { name: 'Medium', stack: 'o', data: officers.map(o => open.filter(c => c.officer === o && c.sev === 'Medium').length), color: 'amber' }] },
        ],
      ],
    };
  });

  // ── 11 Trends ──
  const Q = ['Q3 24-25', 'Q4 24-25', 'Q1 25-26', 'Q2 25-26', 'Q3 25-26', 'Q4 25-26', 'Q1 26-27', 'Q2 26-27'];
  const ratioQ = [1.46, 1.41, 1.38, 1.33, 1.29, 1.24, 1.21, 1.16];
  const tccQ = [68, 71, 70, 74, 79, 84, 89, 95];
  const filingQ = [83, 82, 85, 84, 81, 80, 78, 76];
  register(K(11), () => ({
    crumbs,
    kpis: [
      { label: 'Declared ÷ paid (sector)', value: '1.16×', delta: '▼ 0.30 in 2 yrs', deltaTone: 'red', sub: 'falling', tone: 'red' },
      { label: 'TCC check coverage', value: '95%', delta: '▲ 27 pts', deltaTone: 'green', sub: 'since Q3 24-25', tone: 'green', pct: 95 },
      { label: 'On-time VAT filing', value: '76%', delta: '▼ 7 pts', deltaTone: 'red', sub: 'govt contractors', tone: 'amber', pct: 76 },
      { label: 'Flags per quarter', value: '38', delta: '▲ 58% YoY', deltaTone: 'red', sub: 'better detection', tone: 'orange' },
      { label: 'Tax recovered (cum.)', value: 'BWP 6.2M', sub: 'since go-live', tone: 'blue' },
    ],
    insight: { finding: 'The ratio of declared turnover to government payments across contractors has fallen from <b>1.46×</b> to <b>1.16×</b> over eight quarters, while on-time VAT filing slipped to 76%. Construction explains two-thirds of the decline.', recommendation: 'Commission a joint Treasury–BURS compliance review of the construction sector before Q3 awards.', severity: 'High', tone: 'orange' },
    grid: [
      [
        { span: 8, type: 'line', title: 'Compliance indicators by quarter', height: 280, categories: Q, y2: ' ',
          series: [{ name: 'TCC check coverage %', data: tccQ, color: 'green' }, { name: 'On-time VAT filing %', data: filingQ, color: 'amber' }, { name: 'Declared ÷ paid (right)', axis: 1, data: ratioQ, color: 'red', dashed: true }] },
        { span: 4, type: 'stats', title: 'Year on year', cols: 2, items: [
          { label: 'Contractors paid', value: '20', sub: '17 last year' }, { label: 'Govt payments', value: bwpM(TOT.paid), sub: '▲ 12% YoY', tone: 'cyan' },
          { label: 'Declared turnover', value: bwpM(TOT.declared), sub: '▼ 4% YoY', tone: 'amber' }, { label: 'Cases opened', value: '23', sub: '11 last year', tone: 'orange' },
          { label: 'Cases referred to BURS', value: '6', sub: '2 last year', tone: 'red' }, { label: 'Tax assessed', value: 'BWP 1.84M', sub: 'BWP 0.7M last year', tone: 'green' },
        ] },
      ],
      [
        { span: 6, type: 'area', title: 'Risk flags raised by rule | per quarter', height: 250, categories: Q,
          series: [['Turnover < payments', [4, 5, 5, 6, 8, 9, 11, 13]], ['TCC expired at payment', [9, 8, 8, 7, 6, 5, 4, 4]], ['VAT gap', [2, 3, 3, 4, 5, 6, 7, 9]], ['Filing gaps', [3, 3, 4, 4, 5, 6, 7, 8]], ['Registration', [1, 1, 2, 2, 2, 3, 3, 4]]].map(([name, data]) => ({ name, data, stack: 'f' })) },
        { span: 6, type: 'bar', title: 'Declared ÷ paid by sector | last year vs this year', height: 250, gridOpt: { right: 34 }, categories: ['Construction', 'Roads & civil', 'Supplies', 'Services', 'ICT & energy'],
          series: [{ name: 'FY 2025-26', data: [1.31, 1.29, 1.62, 1.44, 1.38], color: '#1E3A5F' }, { name: 'FY 2026-27', data: [0.92, 1.21, 1.31, 1.02, 1.18], color: 'blue', markLine: { value: 1, label: '1.0×', tone: 'red' } }] },
      ],
    ],
  }));
})();
