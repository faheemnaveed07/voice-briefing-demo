/* Shared mockup dataset.
 *
 * Budget categories, line items, income plan, resolutions and the tender come
 * from the client's data pack; everything else is derived with a seeded RNG
 * around the same ministries and BWP scale so figures agree across screens.
 * Anchors that already appear in the hand-built screens:
 *   Ministry of Health approved BWP 54,487,102 | committed 70% | actual 54% | month 6 of 12
 *   Construction of Clinic: approved 25.0M, committed 18.0M, spent 15.5M
 *   Tender MCP/DES/2283/26-27-01: Clement 0.88, Seasons 0.70, Matrix 0.60
 */
(function () {
  const { rng } = DASH;
  const M = 1e6;

  // Financial year Apr–Mar; mockup "today" is month 6 (September).
  const MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  const MONTH_NOW = 6;

  // National view, BWP millions: [approved, actual, committed]
  const MINISTRIES = [
    ['Health', 587, 449, 512], ['Education', 403, 306, 351], ['Transport', 298, 259, 281], ['Agriculture', 276, 187, 233],
    ['Defence', 211, 165, 190], ['Water', 190, 142, 166], ['Energy', 160, 121, 139], ['ICT', 109, 62, 84],
  ].map(([name, approved, actual, committed]) => ({ name, full: `Ministry of ${name}`, approved, actual, committed }));

  // Ministry of Health, 27 categories (BWP): top 10 approved/actual from the Budget Overview screen,
  // the remaining 17 share the balance so the total is exactly 54,487,102.
  const TOP = [
    ['Salaries and Wages', 14.2, 8.1], ['Capital Projects', 12.6, 9.4], ['ICT Expenditure', 5.1, 2.3], ['Transport & Fleet Management', 4.4, 2.6],
    ['Utilities', 3.2, 1.9], ['Maintenance', 2.8, 1.1], ['Professional Services', 2.6, 1.8], ['Training & Capacity Building', 2.1, 0.7],
    ['Office Equipment & Furniture', 1.9, 0.6], ['Administrative Expenses', 1.7, 0.9],
  ];
  const REST = ['Travel Expenses', 'Meetings', 'Public Relations', 'Inventory & Warehouse', 'Asset Management', 'Grants & Transfers', 'Financial Charges', 'Insurance', 'Security', 'Health & Safety', 'Environmental Management', 'Research & Development', 'Project Management', 'Emergency & Contingency', 'Compliance & Governance', 'AI & Digital Transformation', 'Procurement & Supply Chain'];
  const APPROVED = 54487102, COMMITTED = 38140971, ACTUAL = 29423035;
  const topApproved = TOP.reduce((s, c) => s + c[1] * M, 0);
  const r0 = rng('categories');
  const restWeights = REST.map(() => r0.num(0.5, 1.5));
  const wsum = restWeights.reduce((a, b) => a + b, 0);
  const CATEGORIES = [
    ...TOP.map(([name, a, s]) => ({ name, approved: a * M, actual: s * M })),
    ...REST.map((name, i) => { const approved = ((APPROVED - topApproved) * restWeights[i]) / wsum; return { name, approved, actual: approved * r0.num(0.25, 0.8) }; }),
  ].map((c, i) => {
    const r = rng('cat' + i);
    const committed = Math.min(c.approved * 1.12, c.actual + (c.approved - c.actual) * r.num(0.25, 0.6));
    // Phasing is flat (monthly_phasing sheet: 1/12 per month); actuals wobble around it.
    const plan = MONTHS.map(() => c.approved / 12);
    const monthly = MONTHS.map((_, m) => (m < MONTH_NOW ? (c.actual / MONTH_NOW) * r.num(0.7, 1.3) : null));
    const fcast = c.actual + (c.actual / MONTH_NOW) * (12 - MONTH_NOW) * r.num(0.85, 1.15);
    return { ...c, no: i + 1, committed, available: c.approved - committed, util: (c.actual / c.approved) * 100, plan, monthly, forecast: fcast, lastYear: c.approved * r.num(0.82, 1.05) };
  });

  const DEPTS = [['Dept A', 'Clinical Services', 8.9], ['Dept B', 'Public Health', 9.8], ['Dept C', 'Hospital Services', 10.8], ['Dept D', 'Corporate Services', 11.9], ['Dept E', 'Health Infrastructure', 13.1]]
    .map(([code, name, total], i) => { const r = rng('dept' + i); const actual = total * r.num(0.46, 0.62); return { code, name, label: `${code} | ${name}`, approved: total * M, actual: actual * M, committed: (actual + (total - actual) * r.num(0.3, 0.5)) * M }; });

  // From the budget plan sheet (FY income).
  const INCOME = [['Government Allocation', 20000000], ['Donors', 800000], ['Income subscriptions', 200000]];

  const TOWNS = {
    Gaborone: [25.91, -24.65], Francistown: [27.51, -21.17], Maun: [23.42, -19.98], Kasane: [25.15, -17.8], Serowe: [26.71, -22.39],
    Palapye: [27.13, -22.55], 'Selebi-Phikwe': [27.83, -21.98], Ghanzi: [21.78, -21.7], Tsabong: [22.4, -26.05], Molepolole: [25.5, -24.41],
    Lobatse: [25.68, -25.22], Kanye: [25.34, -24.98], Mahalapye: [26.82, -23.1], Letlhakane: [25.59, -21.42], Jwaneng: [24.73, -24.6],
    Shakawe: [21.85, -18.36], Hukuntsi: [21.78, -24.0], Mochudi: [26.15, -24.38], Tutume: [27.03, -20.49], Bobonong: [28.43, -21.97],
  };

  const SUPPLIERS = ['Clement Pty Ltd', 'Seasons Pty Ltd', 'Matrix Pty Ltd', 'Kgalagadi Builders', 'Motswedi Construction', 'Tswelelo Supplies', 'Letsatsi Engineering', 'Okavango Medical Supplies', 'Chobe ICT Solutions', 'Mokgosi Logistics', 'Boitumelo Catering', 'Makgadikgadi Fleet Services', 'Serowe Hardware', 'Pula Office Solutions', 'Thari Consulting', 'Lesedi Security Services', 'Naledi Pharmaceuticals', 'Tlotlo Civil Works', 'Kalahari Energy Systems', 'Mmila Road Contractors'];

  // Project portfolio (Construction of Clinic figures match the Voice Briefing screen).
  const PROJECTS = [
    ['Construction of Clinic', 'Health', 'Molepolole', 25.0, 18.0, 15.5, 58, 'Clement Pty Ltd'],
    ['Maun District Hospital Wing', 'Health', 'Maun', 48.0, 41.0, 37.4, 45, 'Kgalagadi Builders'],
    ['Francistown Referral Theatre', 'Health', 'Francistown', 19.5, 16.2, 9.1, 52, 'Tlotlo Civil Works'],
    ['Kasane Health Post Upgrade', 'Health', 'Kasane', 6.4, 5.8, 5.9, 88, 'Motswedi Construction'],
    ['Serowe Primary School Blocks', 'Education', 'Serowe', 22.0, 17.1, 11.8, 61, 'Letsatsi Engineering'],
    ['Ghanzi Senior School Labs', 'Education', 'Ghanzi', 14.3, 9.9, 4.2, 27, 'Kgalagadi Builders'],
    ['A1 Palapye–Mahalapye Rehab', 'Transport', 'Palapye', 96.0, 81.5, 70.2, 64, 'Mmila Road Contractors'],
    ['Kazungula Link Road', 'Transport', 'Kasane', 38.0, 30.4, 29.8, 71, 'Mmila Road Contractors'],
    ['Tsabong Water Treatment', 'Water', 'Tsabong', 27.5, 22.0, 18.9, 49, 'Tlotlo Civil Works'],
    ['Selebi-Phikwe Pipeline', 'Water', 'Selebi-Phikwe', 33.0, 21.4, 8.7, 22, 'Motswedi Construction'],
    ['Hukuntsi Solar Mini-grid', 'Energy', 'Hukuntsi', 18.2, 14.5, 12.9, 81, 'Kalahari Energy Systems'],
    ['Letlhakane Substation', 'Energy', 'Letlhakane', 21.0, 12.6, 6.1, 35, 'Kalahari Energy Systems'],
    ['e-Government Data Centre', 'ICT', 'Gaborone', 44.0, 36.1, 31.0, 69, 'Chobe ICT Solutions'],
    ['Shakawe Agric Demo Farm', 'Agriculture', 'Shakawe', 9.6, 6.2, 5.8, 40, 'Serowe Hardware'],
    ['Lobatse Abattoir Upgrade', 'Agriculture', 'Lobatse', 16.8, 12.0, 7.9, 55, 'Letsatsi Engineering'],
    ['Jwaneng Police Housing', 'Defence', 'Jwaneng', 29.4, 25.1, 23.6, 76, 'Tlotlo Civil Works'],
  ].map(([name, ministry, town, approved, committed, spent, physical, contractor], i) => {
    const r = rng('proj' + i);
    const financial = Math.round((spent / approved) * 100);
    const gap = financial - physical;
    const status = gap > 20 ? 'Critical' : gap > 10 || physical < 30 ? 'At risk' : physical > 85 ? 'Near completion' : 'On track';
    const plannedPct = Math.min(100, physical + r.int(-5, 22));
    return {
      id: `PRJ-${String(101 + i)}`, name, ministry, town, lon: TOWNS[town][0], lat: TOWNS[town][1],
      approved: approved * M, committed: committed * M, spent: spent * M, physical, financial, planned: plannedPct, gap, status, contractor,
      variations: r.int(0, 4), variationValue: approved * M * r.num(0, 0.18), delayDays: Math.max(0, Math.round((plannedPct - physical) * r.num(3, 6))),
      start: r.int(0, 8), end: r.int(14, 30),
    };
  });

  const OFFICERS = ['Commissioner General', 'Accountant General', 'Chief Procurement Officer', 'Director Finance', 'Director Projects', 'Chief Accountant', 'Director Revenue', 'Director HR', 'Chief Internal Auditor', 'Director ICT', 'Permanent Secretary', 'Deputy Permanent Secretary'];

  // L4 drill rows for any clicked figure: plausible transactions keyed off the clicked name.
  DASH.defaultDrill = function (name, key) {
    const r = rng(key + name);
    const types = ['Purchase order', 'Invoice', 'Payment voucher', 'Journal', 'Commitment'];
    const rows = Array.from({ length: 12 }, (_, i) => {
      const amt = r.num(18000, 1400000);
      const st = r();
      return {
        ref: `${['PO', 'INV', 'PV', 'JV', 'CM'][i % 5]}-26-${r.int(10000, 99999)}`,
        date: `${String(r.int(1, 28)).padStart(2, '0')} ${r.pick(MONTHS.slice(0, MONTH_NOW))} 2026`,
        type: types[i % 5],
        supplier: r.pick(SUPPLIERS),
        amt: 'BWP ' + Math.round(amt).toLocaleString('en-GB'),
        status: st > 0.82 ? { pill: 'Exception', tone: 'red' } : st > 0.6 ? { pill: 'Pending', tone: 'amber' } : { pill: 'Cleared', tone: 'green' },
      };
    });
    return {
      subtitle: `${rows.length} source transactions | Ministry of Health | FY 2026-27`,
      columns: [{ key: 'ref', label: 'Ref' }, { key: 'date', label: 'Date' }, { key: 'type', label: 'Type' }, { key: 'supplier', label: 'Supplier' }, { key: 'amt', label: 'Amount', align: 'right' }, { key: 'status', label: 'Status' }],
      rows,
    };
  };

  DASH.data = { MONTHS, MONTH_NOW, MINISTRIES, CATEGORIES, DEPTS, INCOME, TOWNS, SUPPLIERS, PROJECTS, OFFICERS, APPROVED, COMMITTED, ACTUAL, M };
})();
