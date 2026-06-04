# VALIDATION CHECKLIST

Run before tagging any release. Tick each item.

## UI Validation
- [ ] All 10 top-nav tabs render in correct order and switch correctly.
- [ ] Theme tokens (Sovereign Green / Inter) applied across all pages.
- [ ] Modals, drawers, toasts open and close correctly.
- [ ] No broken layout at mobile / tablet / desktop widths.

## Storage Validation
- [ ] `localStorage` keys unchanged: `rje_jobs`, `rje_contracts`, `rje_calculator`.
- [ ] Existing saved data loads without migration.
- [ ] Create / edit / delete persist across reload.
- [ ] Clear-all removes only the three known keys.

## Navigation Validation
- [ ] Dashboard, All Jobs, Projects, Service Tickets, Maintenance Tickets, Sales, Incoming, Outgoing, Reports, Settings all reachable.
- [ ] Incoming secondary nav (Wage Jobs / Subsidiary Projects / Subsidiary Service Tickets / Subsidiary Maintenance) works.
- [ ] Outgoing shows Coming Soon.

## Data Validation
- [ ] All Jobs aggregates every job + wage/incoming contract record.
- [ ] No duplicate records; no duplicate storage.
- [ ] Filters (search, type, status, priority, date range, client) return correct subsets.
- [ ] Sorts (newest, oldest, revenue, priority, status) order correctly.
- [ ] Revenue / profit / balance calculations correct.

## Regression Validation
- [ ] Job form (basic/financial/referral/notes) saves correctly.
- [ ] Contract form (basic/financial/details/workers) saves correctly.
- [ ] Job & contract drawers open the existing detail views.
- [ ] CSV (jobs, all jobs) and JSON export work.
- [ ] Dashboard + Reports show correct totals from the unified source.

## Documentation Validation
- [ ] README, VERSION, CHANGELOG updated.
- [ ] VERSION_HISTORY updated with the new version.
- [ ] PROMPT_HISTORY records the generating prompt.
- [ ] PROJECT_RULES respected.
