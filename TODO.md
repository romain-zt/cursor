# TODO — Semaine du 2026-05-25

État au lundi 17h15. Tu as tranché H-1, H-3, H-4 et H-5 (sauf B-002 qui attend ton input sur 4 sub-questions).

**Statut net** :
- 8/9 items IA exécutables : ✅
- Item 9 (code account-session) : pending optionnel
- **Zedos confirmé** comme produit cible (Q1=a)
- **PD-007 approved** (Redis + `pg-boss` + Vercel Cron)
- **PD-008 créé** — Gate strict Spec → code
- **PD-009 créé** — Heuristique riche sizing Slices
- **PD-001 amendé §10** — doctrine Tasks (T-USE / T-SKIP)
- **PD-010 créé** — Credit ledger (Snapshot + Journal, no-expire, full-refund) → débloque B-003
- **PD-003/004/005/006** ratifiés explicitement
- **B-002** seul blocker ouvert — research frame produit, 4 sub-questions à trancher pour PD-011

---

## 🔴 EN ATTENTE HUMAINE — 1 zone restante (B-002)

### H-1 ✅ RÉSOLU — Zedos validé
Q1 = (a) : Zedos = interprétation valide de la demande initiale. On continue.

### H-2 ✅ RÉSOLU — PD-007 approved 2026-05-25
Redis + `pg-boss` + Vercel Cron.

### H-3 ✅ RÉSOLU — PD-003/004/005/006 ratifiés
Notes `## User approval` ajoutées à chacun avec date + Q-référence.

### H-4 ✅ RÉSOLU — Décisions process tranchées
- **Q6 = (a)** Chain 6 niveaux gardée strict.
- **Q7 = (c)** → PD-008 créé. Gate strict Spec → code (G-1..G-4, dont G-4 = approval humaine écrite et datée dans le Changelog du Spec).
- **Q8 = (c)** → PD-009 créé. Heuristique riche sizing Slices (5 dimensions D1..D5 avec bandes green/yellow/red).
- **Q9 = (c)** → PD-001 §10 amendé. Doctrine Tasks (T-USE-1..4 / T-SKIP-1..4, forbidden patterns).
- **Q10 = (a)** Naming `Feature Area` / `Scope Slice` gardé.

### H-5 — Blockers produit restants (1 sur 2)

#### B-002 — AI provider pour `FA:guided-clarification` (OPEN)
**Q11 = (e)** "Comparer plus en détail" → research frame produit à `docs/prd/notes/2026-05-25-ai-provider-research-frame.md`. **4 sub-questions à trancher** pour rédiger PD-011 :

1. **Cible RGPD-strict v0 ?** Oui (→ Mistral pousse) / Non (→ Anthropic ou OpenAI restent éligibles).
2. **Marge brute viable ?** 80% (hypothèse) ou autre ?
3. **Tolérance lock-in ?** Single-provider direct API OK, ou pluggable d'entrée de jeu ?
4. **Éval qualitative pré-PD ?** Oui (~2h de ton temps + ~5-15€ d'API) / Non (décision sur la doc).

Reco IA si tu veux gagner du temps : **Anthropic Claude Sonnet 4.5 + Haiku, direct API, module d'abstraction maison.** À pivoter vers Mistral si RGPD-strict.

#### B-003 ✅ RÉSOLU — PD-010 créé 2026-05-25
**Q12 = (b)** + sub-(a)/(a) :
- Storage : Snapshot + Journal (`CreditBalance` + `CreditLedgerEntry` append-only).
- Expiration : jamais.
- Refunds : full refund via entry négative.

→ `FA:credit-system` peut scaffolder ses Slices. `FA:payments` cascade-unblocks DR-04.

---

## 🟡 ITEM IA OPTIONNEL — pending

### Item 9 — Code de la verticale `account-session`

- 6 Specs `account-session` sont `ready-for-implementation` avec `NEED_HUMAN=false`.
- Point d'entrée : `SP:account-session/signup-to-signed-in-dashboard/001`.
- **Nouvelle contrainte** : PD-008 impose un gate strict Spec → code. Avant le premier commit, il faut :
  - G-1 readiness checker → green
  - G-2 Spec Critic → SAFE TO PROCEED
  - G-3 sibling-consistency review (manuel)
  - G-4 approval humaine écrite (toi, dans le Changelog du Spec)

Décidé en session : **on s'arrête là** (option B). Item gardé pour session dédiée code-first.

---

## ✅ DONE — Items IA 1 à 8 + suites

| # | Item | Livrable |
|---|---|---|
| 1 | Audit async des 16 Specs | `docs/prd/notes/2026-05-25-async-architecture-audit.md` |
| 2 | Template Spec + SP-15 | `.cursor/templates/product/spec.template.md`, checker SP-15 |
| 3 | Spec Critic §4 challenge async | `.cursor/agents/spec/spec-critic.md` |
| 4 | PD-007 Async/Event baseline | `docs/product-decisions/PD-007-async-event-baseline.md` |
| 5 | Re-promote des 16 Specs | `docs/prd/notes/2026-05-25-async-repromote-pass.md` |
| 6 | `WORK_QUEUE.md` exploitable | `docs/WORK_QUEUE.md` + 4 compagnons |
| 7 | Audit intra-Slice account-session | `docs/prd/notes/2026-05-25-intra-slice-parallelization-audit.md` |
| 8 | Note critique IA (matériel rapport) | `docs/prd/notes/2026-05-25-ai-critique-raw-material.md` |
| H-3 | Ratification PD-003/004/005/006 | Notes `## User approval` ajoutées à chaque PD |
| H-4-Q7 | PD-008 Gate Spec → code | `docs/product-decisions/PD-008-spec-to-code-strict-gate.md` |
| H-4-Q8 | PD-009 Slice sizing heuristic | `docs/product-decisions/PD-009-scope-slice-sizing-heuristic.md` |
| H-4-Q9 | PD-001 §10 Task doctrine | Amendement direct dans `docs/product-decisions/PD-001-post-slice-workflow.md` |
| H-5-Q12 | PD-010 Credit ledger | `docs/product-decisions/PD-010-credit-ledger-schema.md` |
| H-5-Q11 | Research frame AI provider | `docs/prd/notes/2026-05-25-ai-provider-research-frame.md` (cadre, ne ferme PAS B-002) |

---

## 📦 État des artefacts produits

- **PRD v1** stable.
- **10 Feature Areas** :
  - 6 `delivery-ready` (P0..P3) — peuvent commencer le vertical.
  - 1 `validated`-bloquée DR-04 (`question-history` ← B-002).
  - 2 `exploratory` unblocked (`credit-system`, `payments`) — peuvent scaffolder Slices/US.
  - 1 `exploratory`-bloquée (`guided-clarification` ← B-002).
- **14 Scope Slices** `ready-for-user-stories`.
- **16 User Stories** `ready-for-spec`.
- **16 Specs** `ready-for-implementation`. **15 NEED_HUMAN=false** ; 1 reste flaggé (`question-history/consult/001` ← B-002).
- **10 PDs** : PD-001..PD-010 (PD-008/009/010 nouveaux ; PD-001 amendé §10).
- **5 fichiers gouvernance** : `WORK_QUEUE.md` + `BLOCKERS.md` (B-001/B-003 résolus, B-002 ouvert) + `EXECUTION_LOG.md` + `EXECUTION_LOCK.md` + `POINTS_OF_ATTENTION.md`.
- **0 ligne de code production**.

---

## 🎯 Action immédiate quand tu rouvres demain

1. **Trancher les 4 sub-questions B-002** (cf. H-5 ci-dessus). Sortie : PD-011 que je rédige et qui ferme le dernier blocker produit.
2. **Optionnel** : scaffolder en parallèle les Scope Slices de `FA:credit-system` (nouveau unblock) — peut se faire indépendamment de B-002.
3. **Optionnel** : scaffolder les User Stories de `FA:payments` (cascade-unblock) — peut se faire indépendamment de B-002.
4. Quand tu veux attaquer du code : Item 9 (`SP:account-session/signup-to-signed-in-dashboard/001`) avec respect du gate PD-008.

---

## 📋 Suivi des décisions de la session 2026-05-25

| Décision | Trace |
|---|---|
| Zedos validé comme produit cible | TODO.md H-1 |
| PD-002 stack baseline | User approval explicite dans PD-002 |
| PD-007 async/event baseline | Approved dans PD-007 (3 arbitrages décidés) |
| PD-003 burn tiers | User approval ajoutée |
| PD-004 grace ceiling | User approval ajoutée |
| PD-005 auto-reload SCA | User approval ajoutée |
| PD-006 delivery-ready gate | User approval ajoutée |
| PD-008 Gate Spec → code | Créé approved |
| PD-009 Slice sizing | Créé approved |
| PD-001 §10 Task doctrine | Amendé in-place |
| PD-010 Credit ledger | Créé approved → ferme B-003 |
| Research frame provider AI | Note produite → cadre B-002 |
