# AI project brief

**Product:** Zedos — PRD-led scope workflow (Feature Areas → Scope Slices); execution loop tracks queue/blockers without touching implementation trees by default.

**Repo role:** Product documentation plus Cursor automation under `.cursor/`.

**Commands:** `/prd`, `/feature-area`, `/execute-prd` — routers in `.cursor/commands/`; long logic in `docs/playbooks/`.

**Key paths:**

- PRD: `docs/prd/PRD.md`, `docs/prd/state.md`, `docs/prd/questions/open-questions.md`
- Scope: `docs/product/feature-areas/`, `docs/product/scope-slices/`
- Ops: `docs/WORK_QUEUE.md`, `docs/BLOCKERS.md`, `docs/EXECUTION_LOG.md`, `docs/EXECUTION_LOCK.md`, `docs/POINTS_OF_ATTENTION.md`
- Index: `docs/INDEX.md`

**Non-default:** This automation is not CI, issue tracker, or runtime architecture unless you start that work explicitly.
