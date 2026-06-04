# RAKHSA ONE — Job Engine

Operational job & subsidiary-contract register for Rakhsa Infra Tech. Module of the wider **RAKHSA ONE** business platform.

## Project Overview

Job Engine is a browser-only ERP module for recording, tracking and reporting on every job and subsidiary contract the business handles. It runs entirely in the browser using `localStorage` for persistence — no server, no build step, no framework. As of **v2.0.0** the module is organised as a modular repository (separated CSS/JS + documentation) rather than a single HTML file.

## Features

- **Dashboard** — live metrics and recent activity.
- **All Jobs** — unified master register aggregating every job record across the module (filters, sorting, export).
- **Projects / Service Tickets / Maintenance Tickets / Sales** — type-scoped views over the shared job table.
- **Incoming Subsidiary Contracts** — Wage Jobs, Subsidiary Projects, Subsidiary Service Tickets, Subsidiary Maintenance.
- **Outgoing Subsidiary Contracts** — reserved (Coming Soon).
- **Reports** — financial summaries and job-type analysis from the same data source.
- **Settings** — data export (CSV / JSON) and management.

## Installation

No build required.

```
# clone / copy the Job-Engine folder, then:
open index.html          # or serve the folder
python3 -m http.server   # optional local server, then visit :8000
```

All assets are local except the Google Fonts stylesheet (Inter + DM Mono).

## Folder Structure

```
Job-Engine/
├── index.html              # shell + markup, links css/ and js/
├── assets/                 # static assets (icons, images)
├── css/                    # theme.css, layout.css, dashboard.css, jobs.css, reports.css, settings.css
├── js/                     # storage.js, jobs.js, dashboard.js, reports.js, settings.js, app.js
├── data/                   # reserved (seed/import fixtures)
├── docs/                   # architecture, changelog, version-history, prompts, validation, rules, roadmap
├── README.md
└── VERSION.md
```

## Current Version

**v2.0.0** — architecture migration to a modular repository. See `VERSION.md` and `docs/changelog/CHANGELOG.md`.

## Future Direction

- Integrate as the **Jobs Module** inside RAKHSA ONE Business Records.
- Activate Outgoing Subsidiary Contracts.
- Per-file targeted updates only (minimise AI token use, keep changes scoped).
- Maintain backward compatibility with existing `localStorage` data.
