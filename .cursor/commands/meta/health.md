---
description: Run a health check on the Cursor OS itself
---

# /health

Audit the Cursor OS repo for consistency, staleness, and issues.

## Instructions

Run these checks and report results:

### 1. Rule Consistency
- Are all rules under 60 lines?
- Do any rules have overlapping `globs`?
- Are cross-references valid (referenced files exist)?

### 2. Spec Hygiene
- Any specs stuck in `Draft` for > 2 weeks?
- Any specs marked `Validated` with unresolved Open Questions?
- Any specs without a corresponding task?

### 3. Task Freshness
- Any tasks older than 1 week without progress?
- Any tasks marked done but still in `tasks/`? (should be archived)

### 4. Scope Leaks
- Scan recent code changes: any unclassified work?
- Any client-specific hardcoding in "reusable" files?

### 5. Skills Audit
- Are installed skills (`.agents/skills/`) still referenced?
- Any skills that haven't been used in 30+ days?

## Output

A summary table:

| Area | Status | Issues |
|------|--------|--------|
| Rules | ✅/⚠️/❌ | ... |
| Specs | ✅/⚠️/❌ | ... |
| Tasks | ✅/⚠️/❌ | ... |
| Scope | ✅/⚠️/❌ | ... |
| Skills | ✅/⚠️/❌ | ... |

Plus recommended actions (if any).
