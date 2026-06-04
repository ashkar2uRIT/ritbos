# VERSION HISTORY

Complete release history for RAKHSA ONE — Job Engine.

| Version | Date | Type | Summary |
|---------|------|------|---------|
| 1.0.0 | prior | MAJOR | Initial browser-only Job Engine (jobs, contracts, calculator, reports, dashboard, settings). |
| 1.1.0 | prior | MINOR | Horizontal nav architecture; sidebar removed; RAKHSA ONE theme applied; Calculator UI removed; Incoming/Outgoing subsidiary sections. |
| 1.1.1 | prior | PATCH/MINOR | All Jobs master register added (unified view, filters, sorting, export). |
| 2.0.0 | 2026-06-04 | MAJOR | Architecture migration to modular repository (separated CSS/JS + documentation system). |

## Detail

### v1.0.0
Single-file ERP prototype. `localStorage` persistence under keys `rje_jobs`, `rje_contracts`, `rje_calculator`.

### v1.1.0
Navigation converted from sidebar to horizontal top tabs. Theme aligned to RAKHSA ONE design authority (Sovereign Green accent, Inter type). Calculator removed from UI; its stored data preserved.

### v1.1.1
Added the **All Jobs** operational master register aggregating all job records with search, job-type/status/priority/date/client filters, five sort modes, CSV export and refresh. No new storage introduced.

### v2.0.0
No behavioural change. Single HTML file decomposed into modular CSS/JS and a documentation system to improve maintainability, scalability and future AI-assisted, token-efficient development. Full backward compatibility with existing saved data.

## Future (placeholders)

| Version | Status | Planned scope |
|---------|--------|---------------|
| 2.1.0 | planned | Activate Outgoing Subsidiary Contracts. |
| 2.1.1 | planned | Fixes / refinements. |
| 2.2.0 | planned | Reporting expansion. |
| 3.0.0 | planned | RAKHSA ONE platform integration (Jobs Module). |
