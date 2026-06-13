# Product constraints (this repo)

Single source for **v0 exclusions** and **execution queue priority bands**. Rules and checkers reference this file—do not duplicate these lists in `.cursor/rules/`.

## v0 exclusions (defer unless PRD explicitly moves in-scope)

Align Feature Areas and Scope Slices with `docs/prd/PRD.md` hard exclusions. Default defer list:

- Multi-user collaboration / invites / advanced roles
- PDF export as mandatory “done” criteria
- Subscription billing (when excluded in PRD)
- Advanced share controls (password, expiry)
- BYOK
- Anonymous share viewer feedback prompts
- Surfaces described as “under construction” in the PRD

## Feature Area → execution priority (P0–P4)

Used for `docs/WORK_QUEUE.md` **Priority** column. SS rows inherit parent FA band.

| Band | Feature Area kebab (examples) |
|------|------------------------------|
| P0 | `account-session`, `dashboard-shell` |
| P1 | `project-workspace`, `prd-versioning` |
| P2 | `guided-clarification`, `question-history` |
| P3 | `read-only-sharing`, `owner-milestone-feedback` |
| P4 | `credit-system`, `payments` |

Update this table when product priorities change.

## Flags

- **NEED_HUMAN:** decision cannot be inferred safely from PRD + open questions.
- **NEED_UPDATE:** governance gap (template/checker/rule inadequacy)—surface in `docs/POINTS_OF_ATTENTION.md`.
