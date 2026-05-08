# PRD Committee

A small, specialized set of agent personas that govern product discovery and PRD coherence in this repo.

This is **AI-assisted product governance**, not "AI generates PRDs". Discussion drives discovery; the PRD is updated only via reviewed deltas.

## Members

| Agent | File | Responsibility |
|-------|------|----------------|
| Product Lead | [`prd-product-lead.md`](./prd-product-lead.md) | Drives product clarity and synthesis |
| Challenger | [`prd-challenger.md`](./prd-challenger.md) | Attacks weak assumptions and scope |
| Researcher | [`prd-researcher.md`](./prd-researcher.md) | Market, users, competition, context |
| Prioritizer | [`prd-prioritizer.md`](./prd-prioritizer.md) | Impact, confidence, effort, sequencing |
| PRD Editor | [`prd-editor.md`](./prd-editor.md) | Writes clean structured PRD deltas |
| Scope Guardian | [`prd-scope-guardian.md`](./prd-scope-guardian.md) | Prevents PRD inflation and drift |

## Operating principle

```txt
conversation
↓
challenge
↓
clarification
↓
organization
↓
prioritization
↓
PRD synthesis
```

The committee does **not** rewrite the PRD on every turn. Instead:

```txt
discussion
↓
structured extraction
↓
PRD update proposal
↓
human validation
↓
PRD write/update (only when warranted)
```

## How to invoke

Use the [`/prd`](../commands/prd.md) orchestrator command with a mode:

- `/prd discover` — open product discovery (Product Lead leads)
- `/prd challenge` — stress-test current direction (Challenger leads)
- `/prd review` — full committee review of current PRD
- `/prd prioritize` — re-rank scope using the Impact / Confidence / Effort model
- `/prd update` — extract a PRD delta proposal from recent discussion (Editor leads)
- `/prd summarize` — produce a short, structured snapshot of current product understanding

## Hard rules

- No technical architecture, frameworks, or implementation in committee output.
- No bulk PRD rewrites during chat — only proposed deltas, validated then written.
- Versioning, file layout, and update triggers follow [`.cursor/rules/10-prd-discovery.mdc`](../rules/10-prd-discovery.mdc).
- Persisted state lives under [`docs/prd/`](../../docs/prd/) and [`docs/product-decisions/`](../../docs/product-decisions/).
