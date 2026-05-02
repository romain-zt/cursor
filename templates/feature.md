# [FEATURE] {Title}

> One file per Feature. Lives in `features/`.
> A Feature is a big capability (booking flow, checkout, search). Decomposes into Stories.

## Meta
- **Status:** Proposed | Active | Shipped | Killed
- **Classification:** {1. Reusable Primitive | 2. Project Primitive | 3. Client Config | 4. Manual V1 | 5. Future Option | 6. Out of Scope}
- **Vision link:** `docs/vision.md` — section "{which part}"
- **Owner:** {human name}
- **Created:** YYYY-MM-DD

## Problem

What problem does this Feature solve? For whom? With what evidence?

## Outcome

What changes for the user when this Feature ships? Be concrete.

## Smallest Valuable Slice

If we could only ship ONE Story from this Feature, which one delivers the most value? Justify.

## Stories

User-facing shippable slices. Each becomes a `stories/{name}.md` file.

| # | Story | Priority | Status |
|---|-------|----------|--------|
| 1 | {As a user, I can X} | P0 | Draft |
| 2 | {As a user, I can Y} | P1 | Idea |
| 3 | {As a user, I can Z} | P2 | Idea |

## Out of Scope

What this Feature explicitly does NOT include.

- {Tempting addition #1}
- {Tempting addition #2}

## Dependencies

- {Other features, services, or decisions this depends on}

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| {what could go wrong} | H/M/L | H/M/L | {how we'd handle it} |

## Kill Criteria

What would make us kill this Feature mid-flight?

- {Signal that says "stop building"}
