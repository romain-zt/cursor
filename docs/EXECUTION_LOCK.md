# EXECUTION_LOCK

> What is being executed right now.
> This is the stable queue. It does not move unless a critical blocker appears.

---

## Lock rules

- Max 3 specs locked simultaneously
- A locked spec cannot change scope once locked
- A locked spec moves out only when: DONE, critically blocked, or human decision required
- Do not add to this file without passing all checkers first
- Do not replan from this file — that's what SPEC_QUEUE.md is for
- A locked spec must be reviewed at the start of every session. If stale, mark it blocked or update CURRENT_STATE.md before continuing.

## File conflict rule

If CURRENT_STATE.md, SPEC_QUEUE.md, and EXECUTION_LOCK.md disagree — stop.

Do not continue execution. Resolve the inconsistency first.

Common inconsistencies:
- Spec marked DONE in queue but still locked here → remove from lock
- Spec locked here but absent from queue → add to DONE or surface as NEED_HUMAN
- CURRENT_STATE says "next action X" but lock implies "Y" → update CURRENT_STATE first

---

## Unlock conditions

A spec leaves the lock only if:

```
- It is DONE (tests pass, docs updated, CURRENT_STATE updated)
- It is critically blocked (dependency discovered, human decision required)
- Its scope is invalid (PRD link broken, acceptance criteria untestable)
```

Any other reason to unlock must be logged in DECISIONS.md.

---

## Currently locked

_Empty. No specs locked. System is ready for first project onboarding._

---

## Lock entry format

```
SPEC-ID:
Title:
Locked at:
Locked by:        [who or what triggered this lock]
Risk level:
PR strategy:      1 PR / 2 PRs / 3 PRs
Current PR:       spec / tests / impl / done
Branch:
Acceptance criteria:
  -
Definition of done:
Unlock condition: done / blocked / scope-invalid
```
