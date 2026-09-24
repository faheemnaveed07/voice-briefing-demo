# Management Intelligence mockup: full build plan

## Goal
The client wants every sidebar menu (13) and every top-ribbon tab (about 12 each) to show a real,
module-specific BI dashboard at FineReport / Power BI level, not a "Not in mockup scope" placeholder.
Today 6 of 156 tabs are built. This plan fills the other 150.

## Approach
Keep the approved shell and the 6 finished screens in `index.html` untouched. Add a small dashboard
engine next to it that renders any tab from a short spec.

```
index.html            design export: shell, sidebar, ribbon, filters, 6 hand-built screens
dash/dash.js          engine: registry, theme, KPI strip, chart card, table, insight, mount observer
dash/data.js          shared dataset: ministries, 27 budget categories, depts, suppliers, projects …
dash/specs/<module>.js one file per sidebar menu, one spec per tab
scripts/patch_bundle.py  edits the template inside index.html (decode → edit → re-encode)
```

How it plugs in:
- The component computes `dashKey = "<menu>-<tab>"`. If a spec exists (`window.__DASH.has(key)`)
  it renders an empty `<div data-dash-mount>`; the engine fills it with ECharts.
- Tabs without a spec still show the pulsing "Not in mockup scope" card, so nothing breaks while
  modules land one by one.
- Charts: ECharts 5 from jsdelivr, dark theme matched to the shell (#0E1D38 cards, #142B55 borders,
  blue / cyan / violet / green / amber / red series).

Spec shape (one per tab):
```js
DASH.register('1-1', () => ({
  kpis: [{ label, value, delta, tone, pct }],        // 4–6 tiles
  insight: 'AI finding sentence …',                    // DATA > FINDING > RECOMMENDATION strip
  grid: [                                              // rows of cards, each with a span (1–12)
    [{ span: 7, title, type: 'bar', data }, { span: 5, title, type: 'donut', data }],
    [{ span: 12, title, type: 'table', columns, rows }],
  ],
}));
```
Card types: bar, hbar, stacked, line, area, combo, donut, waterfall, heatmap, treemap, funnel, gauge,
radar, scatter, sankey, gantt, map pins, table (with trend arrows and RAG pills), timeline, kanban.

## Data
Source: `Mockup_Data_Pack/` (client material, git-ignored, never pushed).
- Real: 27 budget categories and 211 line items, income / expenditure plan, variance sheet, monthly
  phasing, cell breakdown, tender MCP/DES/2283 (compliance, technical, financial, ranking),
  minutes, 20 resolutions, attendees, action items.
- Derived: anything the pack does not cover (projects, suppliers, stock, assets, payroll, tax,
  complaints, tasks) is generated with a seeded RNG around the same ministries, departments and
  BWP scale, so numbers agree across screens (e.g. Ministry of Health, BWP 54.5M ministry budget).
- Only values that appear on screen go into `dash/data.js`. The raw pack stays local.

## Phases (build order = client value)
| # | Sidebar menu | Tabs to build | Main data |
|---|---|---|---|
| 1 | Budget Spending Analytics | 11 | budget pack (real) |
| 2 | Budgeting Cycle | 12 | budget plan, phasing, cell breakdown (real) |
| 3 | Tender Management & Evaluation | 10 | tender sheets (real) |
| 4 | Executive Briefing & Board Pack | 9 | minutes, resolutions (real) |
| 5 | Procurement Analytics | 12 | derived |
| 6 | Procurement Oversight & Audit | 12 | derived (audit checks from brief) |
| 7 | Projects Analytics | 12 | derived, GIS pins |
| 8 | Workforce & Payroll | 12 | derived |
| 9 | Inventory & Warehouse | 12 | derived |
| 10 | Asset Management | 12 | derived, GIS pins |
| 11 | Tax Reconciliation | 12 | derived |
| 12 | Procurement Complaints CRM | 12 | derived |
| 13 | Teams & Task Management | 12 | derived |

Each phase: write specs → check every tab at 1440×900 and 1280×760 → commit → push → Vercel preview.

## Definition of done per tab
- Title and content specific to the tab name (no generic sales data).
- 4–6 KPI tiles, 3–5 visuals, at least one table or exception list, one AI insight line.
- Numbers agree with the rest of the mockup.
- No page-level scroll; the content area scrolls inside the shell.

## Open items for the client
- GIS: optional per client; pins are drawn on a stylised Botswana outline (no map API key).
- Light theme like the FineReport samples? The shell is dark today; a theme toggle is possible later.
