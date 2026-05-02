# [TASK] Health Check `--json` Flag

## Link
- **Spec:** `specs/health-check-json-flag.md`
- **Story:** `stories/health-check-json-flag.md`
- **Branch:** `feat/health-check-json`

## Scope Classification
1. Reusable Primitive — global OS tooling, configurable via flag.

## Subtasks

- [x] **1 [S]** Refactor pass/warn/fail helpers to append to JSON-friendly arrays. Dep: none.
- [x] **2 [S]** Add `--json` flag parsing at script entry. Dep: 1.
- [x] **3 [M]** Build the JSON document with `jq -n` and emit on stdout. Dep: 2.
- [x] **4 [S]** Add `jq`-missing guard with exit 2. Dep: 2.
- [x] **5 [M]** Write integration tests in `tests/health-check.bats` (or bash assertion script if `bats` not available). Dep: 3, 4.
- [x] **6 [S]** Update `.cursor/commands/meta/health.md` to document the flag. Dep: 3.
- [x] **7 [S]** Run `shellcheck` on the script. Dep: 3.

## Definition of Done

- [x] All subtasks complete
- [x] Spec DoD items met (re-checked against spec)
- [x] `shellcheck` clean (or skipped with note if not installed)
- [x] Test script exits 0
- [x] No hardcoded values
- [x] PR description links to spec

## Notes

- `bats` not assumed available — wrote pure bash test script for portability.
- Used `jq -n` with named args to build JSON — avoids shell-quoting bugs.
- Confirmed default human output is byte-identical via diff.
