# [FEATURE] Health Check — JSON Output Mode

## Meta
- **Status:** Active
- **Classification:** 1. Reusable Primitive
- **Vision link:** N/A — internal OS tooling
- **Owner:** romain
- **Created:** 2026-05-02

## Problem

`/health` produces human-readable output. To use it in CI (pre-merge gate, scheduled audits), we need machine-parseable output that can drive automated decisions: pass/fail per check, error count, fix recommendations as structured data.

Today: human reads output and decides.
Future: CI reads JSON and exits non-zero on regressions.

## Outcome

The health-check script supports `--json` flag. When set:
- Stdout is valid JSON
- Each check is an object: `{name, status, errors, warnings, details[]}`
- Summary block: `{errors_total, warnings_total, exit_code, recommendation}`
- Default (no flag) keeps current human-readable format unchanged

## Smallest Valuable Slice

**Story 1** alone is the wedge: JSON output for the existing checks. CI can consume immediately. Stories 2-3 enhance later.

## Stories

| # | Story | Priority | Status |
|---|-------|----------|--------|
| 1 | As a CI script, I can run `health-check.sh --json` and parse exit code + check results | P0 | Draft |
| 2 | As a developer, I can filter to a single check: `--only=cross-references` | P2 | Idea |
| 3 | As a CI dashboard, I can read historical health-check JSON to plot trends | P2 | Idea |

## Out of Scope

- Web dashboard for results (P3 at most)
- Integration with external monitoring (Datadog, etc.) — defer until needed
- Auto-fix mode (`--fix`) — risky, separate Feature

## Dependencies

- Existing `health-check.sh` script
- `jq` already required by other hooks → safe to assume

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| JSON output breaks human readability if env var leaks | L | M | Strict flag detection, default unchanged |
| `jq` not installed in CI environment | M | M | Document dependency; script fails clearly |
| Test coverage on shell scripts is awkward | H | L | Use `bats` or write integration tests in bash |

## Kill Criteria

- If after 1 hour the JSON output is still ambiguous about pass/fail semantics, kill and rethink
- If maintaining the dual-format adds >50% code, kill and split into two scripts
