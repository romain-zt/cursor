# PRD Discovery — repo layout

This folder holds **versioned** product-requirement snapshots plus lightweight navigation so agents load the **current** PRD only.

| Path | Purpose |
|------|---------|
| [`current.md`](current.md) | Pointer to the single active PRD file (avoid stale loads). |
| [`state.md`](state.md) | `CURRENT_PRD_VERSION`, direction one-liner, `LAST_MAJOR_CHANGE`. |
| `PRD-v1.md`, `PRD-v2.md`, … | Immutable-ish history with frontmatter + “Why This Version Exists”. |
| [`changelog/`](changelog/) | Human-readable deltas between versions. |
| [`../product-decisions/`](../product-decisions/) | Discrete decisions (`PD-00n.md`) linked from PRDs when useful. |

**Principle:** conversation drives discovery → structured extraction → proposed PRD deltas → validation → version updates when triggers are met — not full regeneration every chat.
