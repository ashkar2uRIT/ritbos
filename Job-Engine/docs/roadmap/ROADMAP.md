# ROADMAP

## Near term
- **2.1.0** — Activate Outgoing Subsidiary Contracts (form, table, drawer).
- **2.1.x** — Fixes and refinements.

## Mid term
- **2.2.0** — Reporting expansion (date-ranged P&L, per-subsidiary breakdowns, export to XLSX).
- Namespace globals under `JobEngine.*` to prevent collisions inside a host shell.
- Optional `DB.*` storage abstraction to align with RAKHSA ONE storage governance.

## Long term
- **3.0.0** — Integrate as the **Jobs Module** within RAKHSA ONE Business Records:
  - Shared auth / shell / navigation.
  - Cross-module data references (clients, subsidiaries).
  - Centralised audit trail and migration runner.

## Constraints carried forward
- Backward compatibility with existing `localStorage` data.
- RAKHSA ONE design language and current workflows preserved.
- Per-file, scoped updates only.
