# ARCHITECTURE

## Overview
Browser-only, framework-free module. ES5-compatible JavaScript loaded via `<script>` tags, plain CSS, `localStorage` persistence. As of v2.0.0 the code is modular: one concern per file.

## File map

### CSS (`css/`)
| File | Responsibility |
|------|----------------|
| `theme.css` | Design tokens (`:root`), resets, buttons, badges, toast, utilities. |
| `layout.css` | App shell, top nav, page headers, tabs, tables, modals, drawers, forms, contract cards. |
| `dashboard.css` | Activity widgets. |
| `jobs.css` | Worker rows, legacy calculator UI. |
| `reports.css` | Reports (reuses shared styles). |
| `settings.css` | Settings (reuses shared styles). |

### JS (`js/`) — load order
1. `storage.js` — `loadData`/`save*`, seed data, formatters (`fmtAED`, `uid`, `today`), global state (`_jobs`, `_contracts`, `_calc`).
2. `jobs.js` — All Jobs register (`getAllJobRecords`, `renderAllJobs`), jobs CRUD + table, contracts CRUD + table, incoming subsidiary views, job/contract forms and drawers, calculator (legacy, inert).
3. `dashboard.js` — `renderDashboard`.
4. `reports.js` — `renderReports`.
5. `settings.js` — export (`exportJobsCSV`, `exportAllJSON`).
6. `app.js` — navigation router (`showView`), UI helpers (modal/drawer/toast), and boot (`DOMContentLoaded` → `loadData` + default view).

All functions are global (no module system) so cross-file calls resolve at call time; boot is deferred to `DOMContentLoaded`, so load order only needs `app.js` last is not required — but it is loaded last for clarity.

## Data model (unchanged from v1.x)
- `rje_jobs` — array of job records (`type`: Projects | Tickets | Maintenance | Sales | Subsidiary Work).
- `rje_contracts` — array of contracts (`contractType`: incoming | outgoing | wage).
- `rje_calculator` — legacy calculator state (retained, not surfaced).

## All Jobs aggregation
`getAllJobRecords()` normalises `_jobs` (all types) plus surfaced `_contracts` (wage, incoming) into a common row shape. Outgoing contracts are excluded (parked). No new storage is written. Dashboard and Reports read the same underlying arrays.

## Integration notes
No global names that would clash with a host platform are assumed safe long-term; for RAKHSA ONE integration these globals should later be namespaced (e.g. `JobEngine.*`) — tracked in ROADMAP.
