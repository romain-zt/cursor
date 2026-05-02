# [STORY] {Title}

> One file per Story. Lives in `stories/`.
> A Story is a user-facing shippable slice. Decomposes into one or more Specs.

## Meta
- **Status:** Idea | Draft | Ready | In Progress | Shipped
- **Feature link:** `features/{feature-name}.md`
- **Priority:** P0 | P1 | P2
- **Created:** YYYY-MM-DD

## User Statement

> As a {user type}, I can {do something} so that {benefit}.

## Acceptance Criteria

What must be true for this Story to be considered shipped? User-observable, not technical.

- [ ] {User can do X}
- [ ] {System responds in Y way}
- [ ] {Failure case Z is handled gracefully}

## Specs

Technical contracts that implement this Story. Each becomes a `specs/{name}.md` file.

- [ ] `specs/{spec-1}.md` — {what it covers}
- [ ] `specs/{spec-2}.md` — {what it covers}

## Out of Scope (for this Story)

What this Story does NOT cover, even if related.

- {Thing #1 deferred to a later Story}

## Definition of Shipped

Beyond acceptance criteria, what does "shipped" mean operationally?

- [ ] All Specs implemented and merged
- [ ] Tested at 320px mobile (if UI)
- [ ] Documented in user-facing docs (if user-visible)
- [ ] Telemetry/monitoring in place (if applicable)
