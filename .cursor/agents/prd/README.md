# PRD Committee

Two specialized agent viewpoints that govern product discovery alongside the PRD Builder skill.

This is **AI-assisted product governance**, not "AI generates PRDs". Discussion drives discovery; the PRD is updated only via reviewed deltas.

## Members

| Agent | File | Responsibility |
|-------|------|----------------|
| Challenger | [`prd-challenger.md`](./prd-challenger.md) | Attacks weak assumptions, scope inflation, and drift |
| Researcher | [`prd-researcher.md`](./prd-researcher.md) | Market, users, competition, evidence tagging |

## Operational core

The [`prd-builder`](../../skills/prd/prd-builder/SKILL.md) skill drives the convergence loop: feature group construction, ICE scoring, gated delta proposals, and approved PRD updates. The agents provide adversarial and evidence viewpoints — they do not drive the workflow.

## Operating principle

```txt
conversation → challenge → clarification → prioritization → PRD delta → validation → write
```

## How to invoke

Use the [`/prd`](../../commands/prd.md) command:

- `/prd discover` — open product discovery, freeform capture (PRD Builder skill leads)
- `/prd questions` — ask the next unresolved discovery question (PRD Question Loop)
- `/prd note` — capture one insight as a discovery note, update question queue
- `/prd converge` — synthesize notes into a proposed PRD delta (PRD Builder skill leads)
- `/prd challenge` — stress-test current direction (Challenger leads)
- `/prd prioritize` — re-rank scope using ICE
- `/prd update` — propose and write a PRD delta

## Hard rules

- No technical architecture, frameworks, or implementation in committee output.
- No bulk PRD rewrites — only proposed deltas, validated then written.
- Versioning and update triggers follow [`.cursor/rules/10-prd-discovery.mdc`](../../rules/10-prd-discovery.mdc).
- Persisted state lives under [`docs/prd/`](../../docs/prd/) and [`docs/product-decisions/`](../../docs/product-decisions/).
