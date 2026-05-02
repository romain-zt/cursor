---
description: Audit the Cursor OS for consistency, staleness, and broken wiring.
---

# /health

Run a deterministic health check on the Cursor OS repo.

## Instructions

1. Execute the health-check script:

```bash
bash .cursor/hooks/health-check.sh           # human-readable output
bash .cursor/hooks/health-check.sh --json    # machine-parseable JSON for CI
```

2. Display the script's output verbatim. Do NOT paraphrase or summarize the technical results.
3. After the output, give the user a 1-2 line plain-language summary of what to fix first.
4. If the script exits non-zero (errors), recommend the highest-priority fix.

## Flags

| Flag | Effect |
|------|--------|
| (none) | Human-readable output, exit 0/1 |
| `--json` | Single-line JSON to stdout, exit 0/1/2 (2 = `jq` missing) |

## What the Script Checks

| Check | Threshold |
|-------|-----------|
| Rule line counts | Max 60 per file |
| Cross-reference validity | Files referenced in rules must exist |
| `hooks.json` validity | Valid JSON, scripts exist and are executable |
| Spec hygiene | No specs stuck in `Draft` >14 days |
| Task freshness | No tasks untouched >7 days |
| Agent ↔ command wiring | Every agent has at least one command |

## Output

The raw script output (PASS/WARN/FAIL per section + summary), followed by 1-2 lines of recommendation.

## When the Script Is Wrong

The script uses heuristics. If it flags something incorrectly:
- Don't blindly trust the warning
- Verify manually before "fixing"
- If recurring false positives → improve the script, not the rules
