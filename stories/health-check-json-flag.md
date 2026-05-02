# [STORY] Health Check — JSON Output Flag

## Meta
- **Status:** Ready
- **Feature link:** `features/health-check-json-output.md`
- **Priority:** P0
- **Created:** 2026-05-02

## User Statement

> As a CI script, I can run `bash .cursor/hooks/health-check.sh --json` and receive structured JSON output, so that I can programmatically decide to pass or fail the build based on OS health.

## Acceptance Criteria

- [ ] Running with `--json` produces output where the LAST line is valid JSON
- [ ] JSON contains: `errors_total` (int), `warnings_total` (int), `exit_code` (int), `checks` (array of objects)
- [ ] Each check object has: `name` (string), `status` ("pass" | "warn" | "fail"), `messages` (array of strings)
- [ ] Running WITHOUT `--json` produces the existing human-readable output unchanged
- [ ] Exit code semantics unchanged: 0 = pass/warn, 1 = fail
- [ ] If `jq` is missing AND `--json` is requested → script fails clearly with exit code 2 and error message

## Specs

- [ ] `specs/health-check-json-flag.md` — implementation contract for the flag

## Out of Scope (for this Story)

- `--only=<check>` filtering (Story 2)
- Historical/trend data (Story 3)
- Color removal in JSON mode (the human format has no colors anyway)

## Definition of Shipped

- [ ] Spec implemented and merged
- [ ] Tests pass (integration test using `bats` or bash assertions)
- [ ] `/health` command's instructions updated if the script invocation changes
- [ ] `examples/real-world/` references this Story as a complete trace
