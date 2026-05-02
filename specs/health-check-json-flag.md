# [SPEC] Health Check `--json` Flag

## Meta
- **Status:** Validated
- **Classification:** 1. Reusable Primitive
- **Target:** Global (Cursor OS)
- **Author:** romain
- **Date:** 2026-05-02
- **Story:** `stories/health-check-json-flag.md`

## Problem

`health-check.sh` outputs human prose only. CI cannot consume it without fragile regex parsing.

## Solution

Add a `--json` flag. When present:
- Suppress human output to stderr (or silence)
- Build a JSON document as checks run
- Print the JSON document to stdout as the final action

When absent: behavior is unchanged.

## Scope

### In Scope
- Single `--json` flag (boolean, no value)
- Structured JSON output to stdout
- Same exit code semantics as today
- Hard fail with exit 2 if `--json` requested but `jq` is missing
- Update `/health` command docs to mention the flag

### Out of Scope
- Other CLI flags
- Configuration file
- Streaming output (one JSON per check) — output is a single document
- Backwards-incompatible changes to human output

## Technical Design

### CLI Contract

```
bash .cursor/hooks/health-check.sh           # human output, exit 0/1
bash .cursor/hooks/health-check.sh --json    # JSON output, exit 0/1/2
```

### JSON Schema

```json
{
  "version": 1,
  "timestamp": "2026-05-02T19:30:00Z",
  "checks": [
    {
      "name": "rule-line-counts",
      "status": "pass",
      "messages": []
    },
    {
      "name": "cross-references",
      "status": "warn",
      "messages": [".cursor/rules/core/scope-control.mdc references missing → specs/backlog.md"]
    }
  ],
  "errors_total": 0,
  "warnings_total": 1,
  "exit_code": 0,
  "recommendation": "Fix 1 warning when convenient."
}
```

### Implementation Approach

- Parse `$@` for `--json`. Set `JSON_MODE=1` if present.
- Replace `pass/warn/fail` echo functions with versions that ALSO append to JSON arrays via temp files.
- At end: if `JSON_MODE=1`, suppress human summary, emit JSON via `jq -n` + temp files.
- If `JSON_MODE=1` and `command -v jq` fails → exit 2 with error to stderr.

### Dependencies

- `jq` (already required by other hooks — already installed where this matters)
- No new dependencies

## Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| `--json` flag with no other args | JSON output, all checks run |
| `--json` flag with `jq` missing | Exit 2, stderr message, no stdout JSON |
| Multiple `--json` flags | Treated as one (idempotent) |
| `--json --json` then unrecognized arg | Unrecognized arg ignored (forward-compat); JSON still produced |
| Check produces a multi-line message | Each line becomes a separate string in `messages[]` |
| Zero checks have warnings or errors | `messages: []` per check, `recommendation: "All checks pass."` |
| Script crashes mid-run | Exit code preserved; partial JSON NOT emitted (atomic) |

## Definition of Done

- [ ] `--json` flag detected and parsed
- [ ] Output is valid JSON parseable by `jq empty` when `--json` is set
- [ ] All 6 fields in schema present: `version`, `timestamp`, `checks`, `errors_total`, `warnings_total`, `exit_code`, `recommendation`
- [ ] Each check object has `name`, `status`, `messages`
- [ ] Default (no flag) behavior is byte-identical to today
- [ ] Missing `jq` with `--json` → exit 2, clear stderr message
- [ ] Tests cover all 7 edge cases above
- [ ] `lint` (shellcheck) passes with 0 errors on the modified script
- [ ] `/health` command doc updated to mention `--json`

## Open Questions

- [x] Where does human output go in JSON mode? → **Resolved: silenced entirely (stdout = JSON only, stderr = errors only)**
- [x] What about colors in the human output? → **Resolved: no colors used currently, no change needed**
