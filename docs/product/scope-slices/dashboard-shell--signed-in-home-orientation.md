<!--
  Scope Slice scaffolded under Phase 4 of plan "Zedos verticale + post-slice".
-->

# Scope Slice: Signed-in home orientation

## Parent Feature Area

[Dashboard shell](../feature-areas/dashboard-shell.md)

## Status

`ready-for-user-stories`

> **NEED_HUMAN:** false
> **NEED_UPDATE:** false

---

## User Value

A signed-in founder lands on a home surface that routes them toward project / PRD work without losing context about what ships in v0.

---

## Exact Boundary

### Included Behavior

- Post-sign-in landing surface that the `account-session` Specs redirect to (`/dashboard`).
- Primary call-to-action toward creating or opening a project (coordination with `project-workspace`).
- Header / branding identifying the signed-in founder as the **single owner** of the workspace.
- Empty state when no project exists yet — guidance instead of confusion.

### Excluded Behavior

- Concrete project / PRD UI beyond an entry point — owned by `project-workspace` and `prd-versioning` FAs.
- Non-PRD roadmap surfaces shown as fully built — those are deferred and routed through the sibling slice `under-construction-placeholders`.
- Multi-user navigation (workspace switcher, invitee list, role-based menus) — PRD Hard v0 exclusions.
- Anonymous viewer dashboard — share is a separate FA / surface.

---

## UX States

| State | When | What the user sees / experiences |
|-------|------|----------------------------------|
| Empty (no project) | Owner signed in but no project exists yet. | A welcome surface that names the owner, explains v0 scope in one line, and surfaces a single primary action to start a project. |
| Populated (≥1 project) | Owner has at least one existing project. | The same surface with a list / card representation of existing projects + the primary action to continue working on the most recent one. |
| Loading | Initial render while project list is being fetched. | A non-blocking placeholder skeleton matching the populated layout; no jarring flash. |
| Fetch error | Project list cannot be loaded. | A non-destructive inline message with a retry affordance; the layout shell is preserved so the founder is not signed out. |
| Limited-access edge | Owner reaches `/dashboard` without an active session (cookie cleared mid-session). | Redirect to `/signin` (handled by `account-session` Specs); this slice does not render content in that case. |

---

## Data Touched

| Object | Operation | Notes |
|--------|-----------|-------|
| User account | Read | Owner identity is read for greeting and attribution; no writes. |
| Project | Read (list, possibly recent-first) | Read-only at this slice; create / open are owned by `project-workspace`. |

---

## Credit / Payment Impact

None — the dashboard home surface does not consume credits or open purchase flows. Credit balance display is **not** in this slice (see `credit-system` FA for credit UX).

---

## Sharing / Privacy Impact

None — the home surface is private and signed-in-only; no share link, no anonymous-readable surface change.

---

## Feedback / Instrumentation Impact

None — landing on the home surface is not itself a PRD-aligned owner milestone for feedback prompts (milestones attach to PRD events; see `owner-milestone-feedback` FA).

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [Dashboard shell](../feature-areas/dashboard-shell.md) | Feature Area | ready | Parent FA `validated` as of 2026-05-25. |
| [Account & session](../feature-areas/account-session.md) | Sibling Feature Area | ready | Provides the signed-in owner context. |
| [Project workspace](../feature-areas/project-workspace.md) | Sibling Feature Area | ready | Owns the project creation / open primitives this slice routes to. |
| Sibling slice `under-construction-placeholders` | Scope Slice (intra-FA) | pending | Will inherit the placeholder framing for non-PRD surfaces. |

---

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

---

## Acceptance-Level Outcome

A signed-in founder arrives at `/dashboard` and sees a home surface that names them as the sole owner, surfaces a primary action toward project / PRD work, lists existing projects if any, and handles loading / fetch error / signed-out edge without breaking session attribution — without rendering non-PRD roadmap surfaces as if shipped, without exposing share / anonymous viewer affordances, and without engaging credit or purchase flows in this slice.

---

## Readiness for User Stories

- [x] User value stated without implementation language
- [x] Exact boundary defined (included + excluded)
- [x] UX states enumerated (including error and empty states)
- [x] Business objects named
- [x] Credit / payment impact assessed
- [x] Sharing / privacy surface assessed
- [x] Feedback / instrumentation impact assessed
- [x] All dependencies named and their status known
- [x] All blockers resolved or NEED_HUMAN=true explicitly set
- [x] Acceptance-level outcome is behavioral (not a test or code spec)

**Verdict:** READY FOR USER STORIES

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-05-25 | Scaffolded from approved Phase 4 slice proposal via `/feature-area scaffold-slices` | — |
| 2026-05-25 | Refined via `/feature-area refine-slice` | — |
| 2026-05-25 | Promoted to ready-for-user-stories after CLEAR readiness check (`/feature-area promote-slice`) | — |
