# CHANGELOG

All notable changes to Job Engine are recorded here. Format follows semantic versioning.

## [2.0.0] — 2026-06-04

**Summary:** Architecture migration from a single HTML file to a modular repository. No functional changes to business logic; full data compatibility retained.

### Added
- Modular repository structure (`css/`, `js/`, `docs/`, `data/`, `assets/`).
- Separated stylesheets: `theme.css`, `layout.css`, `dashboard.css`, `jobs.css`, `reports.css`, `settings.css`.
- Separated scripts: `storage.js`, `jobs.js`, `dashboard.js`, `reports.js`, `settings.js`, `app.js`.
- Documentation system: README, VERSION, CHANGELOG, VERSION_HISTORY, PROMPT_HISTORY, VALIDATION_CHECKLIST, PROJECT_RULES, ARCHITECTURE, ROADMAP.
- Deferred boot via `DOMContentLoaded` in `app.js`.

### Changed
- `index.html` now references external CSS/JS instead of inline blocks.
- Brand/version label updated to v2.0.0.

### Fixed
- None (behaviour preserved 1:1).

### Removed
- Inline `<style>` and `<script>` blocks from `index.html` (relocated, not deleted).

## [1.1.1] — prior

### Added
- **All Jobs** master register tab (unified view; search, 6 filters, 5 sorts, export, refresh).

### Changed
- Navigation expanded to 10 tabs (All Jobs at position 2).

## [1.1.0] — prior

### Added
- Horizontal top-navigation architecture; Incoming Subsidiary Contracts secondary nav; Outgoing Coming Soon.

### Changed
- Sidebar removed; RAKHSA ONE theme (Sovereign Green / Inter) applied.

### Removed
- Calculator module UI (storage retained).

## [1.0.0] — prior

### Added
- Initial browser-only Job Engine: jobs, contracts, calculator, reports, dashboard, settings; `localStorage` persistence.
