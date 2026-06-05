# Async Architecture Audit — 2026-05-25

Source : Item 1 du TODO « Per-FA Delivery Readiness Gate + suite ». Réponse au sujet bloquant #2 identifié à mi-semaine :

> « par défaut [l'IA] part souvent dans son petit monde sans challenger comme si tout l'internet reposait uniquement sur des api rest — mais bien souvent on est obligé d'avoir du stream / ws / event / webhook / crons... et des traitements asynchrones »

Statut : audit complet — pas encore corrigé. Les corrections sortent dans les items 2 (template), 3 (Spec Critic), 4 (PD-007), 5 (re-promote).

---

## TL;DR

- **16 Specs audités.** Tous reposent par défaut sur **server action Next.js (POST sync)** ou **GET sync**.
- **6 Specs OK en pur sync** (auth flows, navigation, listing).
- **2 Specs gèrent déjà de l'async « caché »** correctement (anti-enumeration via `Promise.race + sleep` — c'est mentionné mais sans le nommer comme contrainte async).
- **5 Specs ont des contrats implicites cross-Spec mal formalisés** (`OwnerMilestoneEvent`, `DecisionEntry`, milestone prompt polling) — ce sont déjà des patterns event-like mais traités comme des conventions de couplage, pas comme un vrai event bus.
- **5 zones critiques manquent complètement** (pas de Spec du tout, ou Spec délibérément hors scope) : streaming LLM, webhook Stripe, cron de nettoyage, queue d'email, event de fin d'opération IA pour le credit ledger.
- **Aucun Spec ne mentionne « webhook », « cron », « stream », « SSE », « job background », « queue ».** Le mot « event » apparaît uniquement comme tag d'observabilité, pas comme primitive d'architecture.

---

## Méthode

Pour chaque Spec : lecture de Summary + Contract + Implementation Notes. Classification sur 5 axes :

- **Mode actuel** : ce que le Spec décrit.
- **Mode correct (v0)** : ce qui devrait y figurer compte tenu du produit Zedos.
- **Gap** : différence (rien / mineur / majeur / Spec complet manquant).
- **Sévérité** : impact si on code tel quel.
- **Action** : item dans la roadmap.

---

## Audit Spec par Spec (16)

### Verticale `account-session` (6 Specs)

| Spec | Mode actuel | Mode correct (v0) | Gap | Sévérité | Action |
|---|---|---|---|---|---|
| `signup-to-signed-in-dashboard--US-001--account-created` | Server action sync (hash Argon2id + insert User + create Session + redirect) | Sync OK pour le critical path. **Manque : décision explicite sur welcome email = jamais / job background / inline** | Mineur | Faible | Ajouter ligne « Welcome email : out of scope v0 (pas de mailer encore) » dans Out of Scope. Ne PAS coder l'envoi inline. |
| `signup-to-signed-in-dashboard--US-002--signup-error-explained` | Server action sync **avec budget constant-time** (`Promise.race(work, sleep(targetMs))` documenté en Implementation Notes) | Idem. Le constant-time budget **est** un pattern async correct mais n'est pas tagué comme tel. | Aucun fonctionnel — **étiquetage manquant** | Faible | Référencer le pattern dans la nouvelle section « Async / Event / Webhook / Cron / Stream » (item 2). |
| `signup-to-signed-in-dashboard--US-003--no-duplicate-when-signed-in` | Routing sync GET/POST → redirect | Sync OK | Aucun | Aucun | RAS, expliciter « pas d'async » dans la nouvelle section. |
| `returning-owner-sign-in--US-001..003` | Mêmes patterns que signup (3 Specs miroirs) | Idem | Aucun fonctionnel | Faible | Idem signup (étiquetage). |

**Verdict verticale `account-session` : aucun bug archi. Le seul vrai gap est un étiquetage manquant (le constant-time budget est une primitive async qui n'est pas nommée comme telle).**

### Verticale `dashboard-shell` (2 Specs)

| Spec | Mode actuel | Mode correct (v0) | Gap | Sévérité | Action |
|---|---|---|---|---|---|
| `signed-in-home-orientation--US-001` | GET sync → render | Sync OK | Aucun | Aucun | Expliciter « pas d'async ». |
| `under-construction-placeholders--US-001` | Routes statiques | Sync OK | Aucun | Aucun | Idem. |

### Verticale `project-workspace` (2 Specs)

| Spec | Mode actuel | Mode correct (v0) | Gap | Sévérité | Action |
|---|---|---|---|---|---|
| `create-project--US-001` | Server action sync → redirect | Sync OK | Aucun | Aucun | Expliciter. |
| `list-and-open-project--US-001` | GET sync x2 | Sync OK | Aucun | Aucun | Expliciter. |

### Verticale `prd-versioning` (2 Specs) — ⚠️ **contrat implicite cassé**

| Spec | Mode actuel | Mode correct (v0) | Gap | Sévérité | Action |
|---|---|---|---|---|---|
| `create-or-capture-version--US-001` | Server action sync `captureVersion` → snapshot draft dans `PRDVersion.payload` → redirect | Sync OK pour le snapshot **MAIS** : doit aussi écrire un `OwnerMilestoneEvent` quand c'est la **première** capture de cet owner. Aujourd'hui c'est mentionné dans le Spec `owner-milestone-feedback` (« producer slices write to `OwnerMilestoneEvent` ») mais **PAS** dans ce Spec côté producteur. | **Majeur — contrat cross-Spec implicite** | **Haute** | Ajouter dans ce Spec une section « Side effects / Events produced » qui formalise le write de `OwnerMilestoneEvent` dans la même transaction que la création du `PRDVersion`. Vrai event-like — doit être contractuel, pas conventionnel. |
| `browse-and-open-version--US-001` | GET sync x2 | Sync OK. Pas d'analytics « page view ». | Mineur (décision implicite) | Faible | Expliciter « pas de view-tracking en v0 ». |

### Verticale `question-history` (1 Spec) — ⚠️ **contrat implicite cassé**

| Spec | Mode actuel | Mode correct (v0) | Gap | Sévérité | Action |
|---|---|---|---|---|---|
| `owner-consults-decision-history--US-001` | GET sync, append-only | Read sync OK. **Côté producteur** : `DecisionEntry` doit être appendé chaque fois que `guided-clarification` produit une décision. Ce Spec ne dit rien sur QUI produit, QUAND, et avec QUEL contrat. Couplage implicite avec un FA bloqué (`guided-clarification` exploratory). | **Majeur — contrat producteur manquant** | **Haute** | Acceptable en l'état tant que `guided-clarification` est bloqué, mais doit ajouter une section « Producer contract — out of scope until `guided-clarification` cleared » pour matérialiser la dette. |

### Verticale `owner-milestone-feedback` (1 Spec) — ⚠️ **pattern event-like mal nommé**

| Spec | Mode actuel | Mode correct (v0) | Gap | Sévérité | Action |
|---|---|---|---|---|---|
| `milestone-prompt-and-capture--US-001` | « Event » via row `OwnerMilestoneEvent` en DB, **polling-on-every-render** côté lecteur (`getNextMilestonePrompt` appelé à chaque rendu signed-in) | C'est de facto un **event bus pauvre** (DB-as-queue, pull-based, pas push). Acceptable en v0 mais : (a) charge SELECT par render évitable (denorm flag sur User), (b) latence d'affichage = temps entre event write et prochain page render (peut être plusieurs minutes), (c) zéro real-time. | Mineur fonctionnellement, **étiquetage manquant majeur** | Moyenne | Renommer la section pour qu'elle dise explicitement « DB-as-queue, pull-on-render, pas de push v0 ». Documenter le trade-off. Future option : SSE pour push real-time. |

### Verticale `read-only-sharing` (2 Specs)

| Spec | Mode actuel | Mode correct (v0) | Gap | Sévérité | Action |
|---|---|---|---|---|---|
| `owner-mints-and-revokes-link--US-001` | Server action sync mint / revoke | Sync OK | Aucun | Aucun | RAS. |
| `anonymous-viewer-reads-shared-version--US-001` | GET sync `/share/{token}` | Sync OK pour le read. **Manque** : visit-count event (utile produit ? sinon expliciter out-of-scope). Aussi : rate-limit anti-énumération de tokens. | Mineur | Faible | Expliciter « pas de visit counter v0 ». Le rate-limit relève d'une couche middleware, pas du Spec. |

---

## Zones critiques **non couvertes par les 16 Specs** (à formaliser)

Ce sont les vrais blind spots — pas un Spec sur les 16 ne nomme ces patterns, et aucun template ne les force.

### Z1. Streaming LLM (génération PRD, clarification dynamique)

- **Où ça pique** : la valeur de Zedos = clarification IA + génération PRD. Tout passe par un LLM. Une réponse LLM = **plusieurs secondes**, parfois 30s+.
- **Mode REST sync = inacceptable** : la UI reste figée, le user ne voit rien partir, timeout HTTP probable au-delà de 30s, pas de cancel.
- **Mode correct** : SSE (Server-Sent Events) compatible Next.js Edge, ou Web Streams API native (`ReadableStream` retournée par route handler). Cancel via `AbortController`.
- **Statut Spec actuel** : la FA `guided-clarification` est `exploratory` + `NEED_HUMAN=true`. **Aucun Spec n'a été écrit pour ce flow.** Quand il sera débloqué, il devra naître **directement** avec streaming, pas être upgradé après coup.
- **À documenter dans PD-007** : SSE par défaut pour tout flow LLM, cancel obligatoire.

### Z2. Webhook Stripe (auto-reload, post-purchase credit grant)

- **Où ça pique** : Stripe pousse des `payment_intent.succeeded`, `invoice.payment_failed`, `setup_intent.requires_action` en **webhook**. Le PRD + PD-005 (auto-reload SCA) le supposent.
- **Mode REST sync sortant côté Zedos = inacceptable** : on ne peut pas crediter le ledger en attendant que Stripe rappelle.
- **Mode correct** : route handler `POST /api/webhooks/stripe`, signature `stripe-signature`, idempotence (table `WebhookEvent`), replay support, traitement asynchrone du payload.
- **Statut Spec actuel** : FA `payments` est `validated` mais **bloquée DR-04** (deps `credit-system`). Spec webhook **non écrit**. Quand il sera écrit, doit suivre une vraie discipline webhook.
- **À documenter dans PD-007** : pattern webhook (signature, idempotence, table `WebhookEvent`, retry/replay).

### Z3. Event consumer pour crédit (burn post-AI-operation)

- **Où ça pique** : quand une opération IA se termine (LLM réponse reçue), il faut débiter le ledger crédits **après coup**, pas dans la même requête HTTP que la UI (sinon on bloque la réponse user pour faire un UPDATE crédit).
- **Mode REST sync = couplage fort** entre flow IA et débit crédit.
- **Mode correct** : un event `ai.operation.completed` émis à la fin du flow LLM, consommé par un handler qui débite. Compatible avec PD-003 (burn tiers) qui suppose un débit déterministe par tier.
- **Statut Spec actuel** : FA `credit-system` est `exploratory` + `NEED_HUMAN=true`. **Aucun Spec écrit.**
- **À documenter dans PD-007** : event bus interne minimum viable (probable : `LISTEN/NOTIFY` Postgres si pas de Redis, sinon Redis pub/sub).

### Z4. Queue de jobs background

- **Où ça pique** : email transactionnel (welcome, password reset si v0), retry de webhook, cleanup. Aucun Spec ne les mentionne.
- **Mode REST sync = blocage du request handler** pendant l'envoi SMTP / API mailer.
- **Mode correct** : queue (BullMQ + Redis, ou Trigger.dev, ou Inngest).
- **Statut Spec actuel** : aucune mention.
- **À documenter dans PD-007** : choix de queue (impacte PD-002 stack baseline — Redis devient une dépendance v0).

### Z5. Cron de nettoyage

- **Où ça pique** : `Session` expirées, `ShareLink REVOKED` anciennes, `WebhookEvent` traités, `OwnerMilestoneEvent` consommés. Sans cron, ça s'accumule.
- **Mode actuel** : aucun Spec n'en parle.
- **Mode correct** : Vercel Cron (compatible PD-002) ou worker dédié avec `node-cron`.
- **À documenter dans PD-007** : pattern cron + liste des cleanup jobs v0.

---

## Constat méta — pourquoi l'IA a glissé sur ça

Il y a 4 raisons identifiables, toutes corrigeables :

1. **Le template Spec ne contient pas de section « Async / Event / Webhook / Cron / Stream »**. Sans champ, pas de réflexe. L'IA remplit ce qu'on lui demande de remplir.
2. **Le Spec Critic ne challenge pas l'archi async**. Il vérifie gold-plating, missing tests, AC coverage — pas « est-ce que ça doit être un webhook ? ».
3. **Le checker Part 5 (SP-01..SP-14) ne contient aucun check sur l'asynchronicité**. SP-08 mentionne « concurrency model unaddressed for a Spec that touches async state » mais le critère est trop mou (suppose qu'on sait déjà que c'est async).
4. **PD-002 (stack baseline) ne nomme pas de queue / event bus / mailer / cron runner**. Donc chaque Spec aurait dû inventer la sienne — l'IA a choisi la voie de moindre résistance (« pas besoin, server action sync suffit »).

C'est exactement le pattern identifié comme blocking-subject #2. Les corrections sortent dans les items 2/3/4/5 du TODO.

---

## Tableau de synthèse final

| Catégorie | Compte | Action |
|---|---|---|
| Specs OK en pur sync, étiquetage à ajouter | 9 | Re-promote avec section async « None — sync REST OK car X » (item 5) |
| Specs avec async caché (anti-enum) à étiqueter | 2 | Re-promote avec section async qui nomme le pattern (item 5) |
| Specs avec contrat event-like implicite à formaliser | 3 (`prd-versioning--capture`, `question-history`, `owner-milestone-feedback`) | Refine + re-promote avec contrat producteur/consommateur explicite (item 5) |
| Specs OK avec décision explicite à ajouter | 2 | Out-of-scope clauses explicites (item 5) |
| Spec à venir avec contrainte async forte | ~5 (clarification streaming, Stripe webhook, credit event consumer, mailer queue, cleanup cron) | Doivent **naître** async, pilotés par PD-007 (item 4) |

**Conclusion** : le pipeline existant n'est pas catastrophique mais il est **incomplet et inerte face à l'async**. Aucun garde-fou ne force le réflexe. Items 2 + 3 + 4 + 5 du TODO posent les garde-fous ; les Specs à venir sur les zones bloquées (Z1..Z5) naîtront propres.
