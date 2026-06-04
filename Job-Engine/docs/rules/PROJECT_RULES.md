# PROJECT RULES

Permanent rules for RAKHSA ONE — Job Engine. These persist across all releases.

1. **Never break existing functionality.** No regressions to forms, tables, reports, filters, navigation, search or storage.
2. **Follow the RAKHSA ONE design system.** Theme file is the styling authority (Sovereign Green accent, Inter typography, tonal surfaces).
3. **Follow semantic versioning** (MAJOR.MINOR.PATCH).
4. **Update documentation for every release** (README + VERSION at minimum).
5. **Update the changelog for every release.**
6. **Update version history for every release.**
7. **Record the prompts used for generation** in PROMPT_HISTORY.
8. **Maintain backward compatibility** with existing `localStorage` data wherever possible. Storage keys (`rje_jobs`, `rje_contracts`, `rje_calculator`) must not change without a documented migration.
9. **From v2.0.0: never place all code in a single HTML file.** Separate concerns (CSS per area, JS per module).
10. **Scope future edits to affected files only** — minimise blast radius and AI token consumption.
11. **Preserve RAKHSA ONE integration readiness.** No dependencies that block future integration into RAKHSA ONE Business Records / Jobs Module.
12. **Maintain current UI language, navigation behaviour and user workflows.**
