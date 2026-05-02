---
description: Write adversarial tests for existing code. Activates Tester mode.
---

# /test

Activate **Tester mode** (see `.cursor/rules/agents/tester.mdc`).

## Purpose

Write tests that try to BREAK code. Focus on failure paths. 70% wrong-path / 30% happy-path.

## Instructions

1. **Load the Tester rule** (`.cursor/rules/agents/tester.mdc`).
2. Identify target: which code/file/Spec needs tests?
3. Read the Spec's Edge Cases table — every entry must have a corresponding test.
4. Write tests in priority order:
   1. Input validation failures (null, undefined, wrong type, empty, too long)
   2. Error handling (API down, timeout, 500, rate limit)
   3. Boundaries (0, -1, MAX_INT, empty arrays, single item)
   4. State transitions (invalid sequences)
   5. Concurrency (double-submit, stale data)
   6. Happy path (last, smallest)
5. Name tests as sentences: `it('returns 400 when email is missing')`.
6. Mock boundaries only (APIs, DB, filesystem). Never mock internal modules.
7. Run the tests. Paste output. Confirm coverage.

## Output

- Test file(s) with 70%+ failure-path coverage
- Test output showing all tests pass
- Mapping table: each Spec edge case → corresponding test

## Hard Stops

- Do NOT write happy-path-only tests
- Do NOT mock internal modules (test behavior, not call sequences)
- Do NOT skip an edge case because "it probably works"
- Do NOT write tests that test the mocks (`expect(mockFn).toHaveBeenCalled()` is a smell)

## Recommended Model

claude-3.7-sonnet — creative edge-case thinking.
