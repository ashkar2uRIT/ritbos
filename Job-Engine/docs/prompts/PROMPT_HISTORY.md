# PROMPT HISTORY

Record of AI prompts used to generate or modify releases. Updated manually each release.

---

## Template

```
### vX.Y.Z — YYYY-MM-DD
- AI Tool Used:
- Model Used:
- Prompt Used:
- Notes:
```

---

### v2.0.0 — 2026-06-04
- **AI Tool Used:** Claude (chat interface)
- **Model Used:** Claude Opus 4.8
- **Prompt Used:** "RAKHSA ONE - Job Engine v2.0.0 Architecture Migration" — migrate v1.1.1 single file into a modular repository with separated CSS/JS and a documentation/version/validation/rules system; preserve all functionality.
- **Notes:** Lossless split verified (0 CSS lines lost; only init relocated to DOMContentLoaded). No business logic changed.

### v1.1.1 — prior
- **AI Tool Used:** Claude (chat interface)
- **Model Used:** Claude Opus 4.8
- **Prompt Used:** "Job Engine v1.1.1 Refactor" — add All Jobs master register tab.
- **Notes:** Aggregator over existing `_jobs` + wage/incoming contracts; no new storage.

### v1.1.0 — prior
- **AI Tool Used:** Claude (chat interface)
- **Model Used:** Claude Opus 4.8
- **Prompt Used:** "Job Engine v1.1 Refactor" — remove sidebar + calculator, horizontal nav, apply RAKHSA ONE theme.
- **Notes:** —

### v1.0.0 — prior
- **AI Tool Used:** —
- **Model Used:** —
- **Prompt Used:** —
- **Notes:** Initial baseline.
