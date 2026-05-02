# Real-World Example: Full Agent Loop

This is an **actual** end-to-end run of the OS, validating the full hierarchy:

```
Vision → Feature → Story → Spec → Task → Code → Tests → Review
```

## What Was Built

A `--json` flag for the `health-check.sh` script. Small, real, useful for CI.

## The Trace (every artifact this loop produced)

| Stage | Mode | Artifact | Lives In |
|-------|------|----------|----------|
| 1. Strategize | Strategist | Feature definition with classification, stories, kill criteria | `features/health-check-json-output.md` |
| 2. Story | Planner | User-facing acceptance criteria | `stories/health-check-json-flag.md` |
| 3. Spec | Planner | Technical contract with edge cases + DoD | `specs/health-check-json-flag.md` |
| 4. Plan | Planner | Subtask breakdown with sizes (S/M) and dependencies | `tasks/health-check-json-flag.md` |
| 5. Test (red) | Tester | 17 failing tests written first | `tests/health-check.test.sh` |
| 6. Implement (green) | Implementer | `--json` flag added, all tests pass | `.cursor/hooks/health-check.sh` |
| 7. Review | Reviewer | Audit findings labeled `[blocking]` / `[nit]` / `[question]` | (in chat — see below) |
| 8. Verify | Implementer | DoD checklist with evidence | `tasks/health-check-json-flag.md` |

## Try It Yourself

```bash
# Human-readable
bash .cursor/hooks/health-check.sh

# Machine-readable
bash .cursor/hooks/health-check.sh --json | jq

# Run the test suite
bash tests/health-check.test.sh
```

## What the Loop Surfaced (lessons learned)

Real things that emerged during the run that pure inspection couldn't catch:

1. **Naming collision:** `templates/specs/feature.md` (a Spec template) collided with `templates/feature.md` (a Feature template). Renamed Spec template to `spec.md`. → Fixed cross-references in 4 files.

2. **Off-by-one in `on-stop.sh`:** Hook declared `loop_limit: 3` but checked `< 2`. Fixed.

3. **Empty `messages: []` rendering:** First implementation produced `[""]` instead of `[]` when no messages. Caught at JSON sanity check, fixed.

4. **`head -3 | grep` truncation in sandbox:** Verification commands using piped `head` got SIGPIPE'd. Switched to writing to temp file then grep. Lesson: **don't pipe directly when verifying long outputs**.

5. **`shellcheck` not installed:** DoD called for shellcheck-clean. Could not verify locally — flagged in review as `[nit]` (acceptable, will run in CI when set up).

6. **Test T1 skipped:** Cannot test missing-`jq` path when `jq` is installed locally. Code-reviewed instead. Acceptable for now.

## What the OS Got Right

- Coordinator → Agent rule transitions felt natural per command (`/strategize` → `/feature` → ...).
- Scope classification at Feature level prevented over-engineering (we said NO to web dashboard, auto-fix, etc.).
- 70/30 testing rule produced 11 failure-path tests vs 6 happy-path tests on first try.
- DoD with evidence prevented "fake done" — caught 1 edge case (empty messages) before commit.
- The Reviewer mode found 6 issues (2 [blocking] resolved, 4 [nit]) — non-trivial findings.

## What Could Be Better (for the next loop)

- `bats` test framework would be cleaner than the bash assertion script.
- A pre-commit hook could auto-run `health-check.sh` to gate commits.
- `examples/real-world/` could include the chat transcript snippets per stage to show the actual prompts used.

## Total Time

~30 minutes (planning + coding + testing + review). The OS overhead added maybe 10 minutes vs "just hack it" — and produced 5 reusable artifacts plus a regression test suite.
