# Playbook: Start a Feature

From idea to first PR. Follow this sequence every time.

## 1. Strategize (Strategist mode)

```
"I want to build [feature]. Challenge me on whether we should."
```

The agent will ask about the problem, audience, and alternatives. Output: a Feature definition with scope classification, or a "don't build" recommendation.

**You decide:** build, defer, or kill.

## 2. Plan (Planner mode)

```
"Break [feature] into stories and write the first spec."
```

The agent decomposes the Feature into shippable Stories, then writes a Spec for the first one using `templates/specs/feature.md`. Output lands in `specs/`.

**You review:** fill any Open Questions, confirm scope classification.

## 3. Validate

Move the spec from `Draft` → `In Review` → `Validated`:

- All Open Questions answered
- DoD is specific and verifiable
- Scope classification confirmed
- Edge cases covered

## 4. Implement (Implementer mode)

```
"Implement specs/[name].md"
```

The agent reads the spec, writes tests first (failure paths), then implements. It creates a task file in `tasks/` and checks off items as it goes.

**Watch for:** scope creep, skipped tests, fake-done claims.

## 5. Review (Reviewer mode)

```
"Review the implementation against specs/[name].md"
```

The agent audits code against spec. Flags `[blocking]` / `[nit]` / `[question]` items.

**You decide:** approve, request changes, or split PR.

## 6. Ship

- Open PR with spec link in description
- Human approves and merges

## 7. Learn

If something was hard or surprising:
- Update a rule (if the same mistake would recur)
- Create a skill (if the same procedure would be repeated 3+ times)
- Add to `docs/playbooks/` (if a new collaborator would need this)

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Jumping straight to code | Go back to step 1 or 2 |
| Spec has no Out of Scope section | Planner writes it before validation |
| Tests only cover happy path | Tester mode focuses on failure paths (70%) |
| PR is >400 lines | Split into smaller specs/stories |
| "Almost done" without evidence | Run tests, paste output, then claim done |
