# Note critique sur l'IA dans ce projet — matériel brut pour le rapport

> **Statut** : matériel brut, non assemblé. À usage du rapport final.
> **Date** : 2026-05-25
> **Périmètre** : ce qui s'est réellement passé pendant la semaine sur le projet Zedos (PRD → Feature Areas → Slices → User Stories → Specs → garde-fous async + parallélisation). 0 ligne de code produite à date.
> **Posture** : honnête et critique. Pas de complaisance. Les faits sont nommés avec leurs preuves (fichiers, dates, PDs).

---

## TL;DR (lisible en 30 secondes)

L'IA, sur ce projet, **produit vite et bien sur la forme** (artefacts cohérents, structure respectée, terminologie stable). Elle a **trois biais systémiques** qui se manifestent dès qu'on la laisse seule :

1. **Elle invente des décisions techniques qu'elle est pas habilitée à prendre** (stack, infra, archi) plutôt que de signaler le manque d'input.
2. **Elle traite tout comme du REST sync** par défaut — webhooks, streams, jobs, crons sont invisibles tant qu'on les nomme pas explicitement.
3. **Elle pousse à la sérialisation** (faire toute la macro avant d'attaquer un vertical) plutôt qu'à la parallélisation, même quand le workflow le permet.

Chacun de ces biais a été détecté **en cours de route** et **corrigé par un artefact** (Product Decision, checker, agent critic, rule). La méthodo est devenue exploitable parce qu'on l'a forcée à se challenger, pas parce qu'elle s'est challengée toute seule.

**Faisabilité des plans IA-générés** : oui sur la forme, à 70% sur le fond. Les 30% manquants ne se voient que sous stress-test (sujet bloquant levé en cours de semaine, audit a posteriori, etc.).

**Cohérence** : pas native. Acquise par couches de garde-fous. Sans Spec Critic + readiness checker + Product Decisions explicites, les 16 Specs auraient produit 5+ stacks différentes, 3 enveloppes d'erreur incompatibles, et 0 mention d'async.

---

## 1. Les 4 dérives concrètes observées (et la correction qui les a tenues)

Format : ce qui s'est passé → ce que ça aurait coûté si non détecté → comment ça a été corrigé.

### 1.1 Dérive « PD-002 manquante »

**Ce qui s'est passé.** En Phase 3 du plan `Zedos verticale + post-slice`, l'IA scaffoldait les Specs `account-session` et a buté sur les checks SP-03 / SP-04 / SP-08 qui demandent un schema concret + un contract concret + des stack constraints. Le PRD ne nomme pas de framework (correct — discipline PRD). Aucun PD upstream ne fixait Next.js, Auth.js, Prisma, Argon2id. **L'IA était sur le point de choisir seule** (Next.js par défaut parce que "c'est ce que tout le monde fait").

**Coût si non détecté.** Les 16 Specs auraient été grounded dans une stack non validée. Si le projet avait préféré Remix, ou SvelteKit, ou un bespoke auth, les 16 Specs étaient à refaire. Ou pire : le code aurait été écrit et il aurait fallu pivoter en cours de route.

**Comment ça a été corrigé.** PD-002 a été créé en `provisional`, explicitement étiqueté "pilot, awaiting user approval", puis approuvé par l'utilisateur via une AskQuestion. La SISO rule (`.cursor/rules/00-siso.mdc`) — qui était déjà en place — a forcé l'arrêt avant invention silencieuse. **L'arrêt a été déclenché par la rule, pas par l'IA elle-même.**

**Insight.** L'IA, par construction de son training, **veut faire avancer**. Elle est biaisée pour produire du contenu plutôt que pour buter. Sans rule qui dit "stop si décision technique non-tranchée", elle aurait choisi. La SISO rule est l'antidote.

### 1.2 Dérive « tout est REST sync »

**Ce qui s'est passé.** Les 16 Specs ont tous été écrits avec des `POST /server-action` ou `GET` sync. **Aucun ne mentionnait** `webhook`, `cron`, `stream`, `SSE`, `WebSocket`, `event bus`, `background job`, `queue`. Le mot "event" n'apparaissait que comme tag d'observabilité (`auth.signup.attempted`), pas comme primitive d'archi.

Le sujet a été explicitement nommé :

> « par défaut [l'IA] part souvent dans son petit monde sans challenger comme si tout l'internet reposait uniquement sur des api rest »

Audit a posteriori (`docs/prd/notes/2026-05-25-async-architecture-audit.md`) :
- 9 Specs OK en pur sync (auth flows, lectures, listings).
- 2 Specs gèrent de l'async caché correctement mais sans le nommer (`constant-time budget` via `Promise.race`).
- 3 Specs ont des contrats event-like implicites cross-Spec mal formalisés (`OwnerMilestoneEvent`, `DecisionEntry`, polling-on-render des milestones).
- **5 zones critiques manquaient complètement** : streaming LLM, webhook Stripe, event burn crédit, queue email, cron de nettoyage.

**Coût si non détecté.** Le code aurait été écrit avec un `POST /api/prd/generate` sync qui timeout au-delà de 30s. Le webhook Stripe n'aurait pas existé — auto-reload SCA (PD-005) cassait. Les Sessions expirées s'accumulaient indéfiniment. La UI gelait pendant chaque appel LLM. Le code aurait fonctionné **en démo** et **explosé en prod**.

**Comment ça a été corrigé.** Quatre artefacts mutuellement renforçants :
1. **Template Spec** (`.cursor/templates/product/spec.template.md`) : section `## Async / Event / Webhook / Cron / Stream` ajoutée comme obligatoire, avec 6 sous-questions + classification finale forcée. Sans cette section remplie, le Spec ne passe plus `ready-for-implementation`.
2. **Checker SP-15** : nouveau check mécanique dans `.cursor/checkers/scope-readiness-checker.md` qui vérifie que les 6 sous-réponses sont là et que la classification finale est l'une des 4 options canoniques.
3. **Spec Critic §4** : nouvelle section "Default-to-sync REST without challenge" qui force le critic à walker les 6 sous-questions sur tout Spec. Hard rule : async-default produit `REVISE BEFORE PROCEEDING`, jamais `SAFE TO PROCEED`.
4. **PD-007** : décision produit qui a figé les patterns async v0 (SSE, webhook discipline, `pg-boss`, Vercel Cron, Postgres `Event` table + `LISTEN/NOTIFY`, Redis admis pour cache/rate-limit/pub-sub léger). **Statut `approved` 2026-05-25** après ratification des 3 arbitrages.

**Insight.** Le réflexe "tout est REST sync" est **bas niveau** — il vient du fait que le training de l'IA est dominé par du code REST. Pour le casser, il faut un check qui force la question à chaque Spec. Une rule générique du genre "pense à l'async" n'aurait rien donné. Le checker mécanique a tout changé.

### 1.3 Dérive « sérialiser au lieu de paralléliser »

**Ce qui s'est passé.** Le plan initial de l'IA a été de **finir toute la macro** (10 FAs, 14 Slices) **avant** d'attaquer le premier vertical. Décision défensive en l'absence d'un gate. Coût observé : la verticale `account-session` aurait pu commencer plusieurs heures plus tôt.

**Coût si non détecté.** Time-to-first-delivery rallongé. Et pire : si la macro élargit ses contraintes en cours de route (cas réel, voir 1.1 PD-002), tous les choix verticaux deviennent suspects rétroactivement.

**Comment ça a été corrigé.** PD-006 (Per-FA Delivery Readiness Gate) a introduit un nouvel état `delivery-ready` entre `validated` et le travail downstream, avec 5 critères (DR-01..DR-05) auto-vérifiables. Une FA cleared peut démarrer son vertical en parallèle des autres FA encore en macro.

Et — point soulevé en 2e lecture — **paralléliser entre FA n'est qu'une moitié de la question**. L'autre moitié (parallélisation intra-Slice) a fait l'objet de l'Item 7 (`docs/prd/notes/2026-05-25-intra-slice-parallelization-audit.md`) qui a révélé que la parallélisation **naïve** intra-Slice produit des enveloppes incompatibles.

**Insight.** L'IA n'a **aucune intuition naturelle** de parallélisme. Elle traite les chains comme des séquences. Quand on lui dit "fais X puis Y puis Z", elle fait X puis Y puis Z, même si Y et Z sont indépendants. Pour la débloquer, il faut **nommer la concurrence explicitement** (PD-006, WORK_QUEUE buckets, audit intra-Slice).

### 1.4 Dérive « contrats cross-artefacts implicites »

**Ce qui s'est passé.** Trois contrats cross-Spec ont été pris pour acquis pendant la macro et **jamais formalisés** :

- `OwnerMilestoneEvent` : la Spec `owner-milestone-feedback` disait "producer slices write to OwnerMilestoneEvent". Aucune Spec productrice (`prd-versioning--create-or-capture-version`) ne le mentionnait côté émetteur.
- `DecisionEntry` : la Spec `question-history` lisait des `DecisionEntry`. Aucune Spec productrice (`guided-clarification`, bloqué) ne définissait la contrat producteur.
- Constant-time anti-enum : la Spec `signup-error-explained` et `auth-error-explained` utilisaient `Promise.race(work, sleep(targetMs))` sans le nommer comme un pattern partagé.

**Coût si non détecté.** L'écriture du code aurait probablement produit **trois shapes différentes** de `OwnerMilestoneEvent` (une par Spec qui en aurait besoin), conflit Prisma à la migration, plusieurs jours de reprise. Pour le constant-time : implémentations divergentes, fenêtres ouvertes pour timing-attack.

**Comment ça a été corrigé.** Le pass Item 5 (re-promote des 16 Specs) a forcé chaque Spec à répondre à la sous-question 4 ("Event produced or consumed") avec une réponse explicite. Les 3 contrats sont maintenant **nommés contractuellement** dans les Specs concernés, avec référence à PD-007 §5 pour le pattern event-bus.

**Insight.** L'IA est **bonne pour les contrats explicites** (data model, contract section, errors table). Elle est **mauvaise pour les contrats implicites** que les humains nomment par conversation. Tant qu'on n'a pas un champ pour les forcer ("Event produced or consumed"), elle ne les voit pas.

---

## 2. Les patterns de correction qui ont émergé

Ce qui marche, observé empiriquement cette semaine.

### Pattern A — « Garde-fou en couches »

Une seule règle ou un seul check ne suffit pas. Pour casser le biais REST-sync, il a fallu **4 artefacts qui se renforcent** :
1. Le template force la question.
2. Le checker mécanique vérifie qu'on a répondu.
3. L'agent critic stress-teste la réponse.
4. La PD donne les patterns canoniques.

Si un seul des quatre manque, le biais revient. L'audit Item 1 montre que **avant** la mise en place de tout ça, l'IA n'avait JAMAIS mentionné `webhook` ou `cron` dans aucun des 16 Specs.

### Pattern B — « Forward-only application »

Quand un nouveau check est introduit (SP-15, PD-006, etc.), il ne s'applique **que** aux artefacts futurs. Les artefacts existants ne sont pas invalidés automatiquement — sinon on bloque tout le travail acquis. Mais on les **audit** explicitement (Phase 3 de PD-006 = backfill DR-01..DR-05, Item 5 = re-promote des Specs).

Cette discipline a permis de poser PD-006 et PD-007 sans perdre les 16 User Stories et 16 Specs déjà écrits.

### Pattern C — « Question vraie, pas question rhétorique »

Quand un sujet bloquant est détecté (PD-002 stack, AI provider pour `guided-clarification`, ledger pour `credit-system`), l'IA peut **proposer** mais pas **trancher**. La décision passe par une AskQuestion explicite à l'utilisateur. SISO rule appliquée à la lettre.

Cette discipline a évité des inventions silencieuses sur :
- Le choix Next.js / Remix / SvelteKit (tranché par utilisateur via PD-002).
- Les 3 arbitrages PD-007 — Postgres+Redis stack / `pg-boss` / Vercel Cron (tranchés et ratifiés 2026-05-25).
- Le AI provider pour `guided-clarification` (en attente — B-002).
- Le ledger schema pour `credit-system` (en attente — B-003).

### Pattern D — « Tout artefact a un état lisible »

Chaque artefact (FA, Slice, US, Spec, PD) porte un Status field standardisé + un NEED_HUMAN flag. WORK_QUEUE.md agrège ces signaux en un tableau exploitable. **Un agent ou un humain qui ouvre n'importe quel fichier sait en 5 secondes ce qu'il peut faire avec.**

C'est le seul moyen qu'on a trouvé pour rendre la chain de 6 niveaux (PRD → FA → Slice → US → Spec → Task) **navigable**.

---

## 3. Ce qui n'a PAS été corrigé (limites résiduelles)

Honnêteté oblige. Ces points sont identifiés mais pas traités à date.

### 3.1 La chain à 6 niveaux peut être trop épaisse

Le naming a été flaggé `moins grave` mais le point sous-jacent existe : entre PRD et code, on passe par 5 artefacts intermédiaires. Pour un projet solo-founder, c'est peut-être trop. Le test : combien de fois pendant la semaine on a écrit "no schema change here" / "no new objects" / "inherits from sibling" dans les Specs ? Réponse : sur les 16 Specs, **environ la moitié** se contentent d'hériter. Ces moitiés pourraient être des Tasks directes plutôt que des Specs entiers.

**Pas corrigé** : PD-001 garde la chain à 6 niveaux. Un raffinement (fusionner US ↔ Spec quand c'est trivial) reste à faire si on le décide.

### 3.2 Pas d'observabilité agrégée sur l'async

PD-007 dit "no central async observability dashboard exists yet". Le Spec Critic §5 force des signaux par Spec, mais personne ne vérifie que les signaux atterrissent réellement quelque part en prod.

**Pas corrigé** : c'est volontaire (v0 corpus de Specs trop petit pour mériter un dashboard), mais ça va devenir un trou dès qu'on dépasse ~5 Specs codés.

### 3.3 Le couplage intra-Slice n'est pas surfacé

L'audit Item 7 (`docs/prd/notes/2026-05-25-intra-slice-parallelization-audit.md`) a révélé que les Specs d'une même Slice peuvent partager des contrats (envelope d'erreur, schema, fichier). Le WORK_QUEUE le mentionne en note mais ne le **calcule** pas. 3 follow-ups identifiés (`POA-006`), pas scopés cette semaine.

### 3.4 `/execute-prd scan` n'est pas câblé

Tout le système gouvernance attend qu'une commande génère automatiquement WORK_QUEUE.md / BLOCKERS.md / EXECUTION_LOG.md / etc. Aujourd'hui ces fichiers sont **maintenus à la main** (POA-003). Acceptable à 10 FA / 16 Specs, douloureux à 30+.

### 3.5 Deux FAs restent bloquées par décision produit

- `FA:guided-clarification` (B-002) : AI provider undecided.
- `FA:credit-system` (B-003) : ledger schema undecided.

Cascade : `payments` (DR-04 via credit-system) et 1 Spec `question-history/consult/001` qui garde `NEED_HUMAN=true` pour son producer-side contract. **Pas un manque de l'IA — un manque d'input produit.**

---

## 4. Insights sur la collaboration humain-IA dans ce projet spécifique

### 4.1 L'IA est meilleure en aval qu'en amont

Sur ce projet, l'IA a brillé pour :
- Générer du contenu structuré à partir d'inputs clairs (Specs depuis User Stories, slices depuis Feature Areas).
- Maintenir la cohérence terminologique sur 100+ artefacts.
- Détecter les inconsistances **à condition** qu'on lui ait donné le check.

L'IA a peiné pour :
- Détecter ses propres blind spots (REST-sync, contrats implicites, sérialisation).
- Trancher entre options techniques équivalentes (stack, queue, etc.).
- Voir la concurrence et le parallélisme dans les workflows.

**Conclusion opérationnelle** : laisser l'IA scaffolder et raffiner, **toujours** placer un check / un critic / un PD à chaque transition critique.

### 4.2 La friction est constructive

Chaque blocage cette semaine a produit un PD ou une rule. SISO (00-siso.mdc) m'a forcé à stopper sur PD-002 — bénéfice : PD-002 ratifié explicitement, applicable aux 16 Specs. La question parallel/serial soulevée à mi-semaine → PD-006 + Item 7 audit. Le sujet bloquant async → PD-007 + 4 artefacts mutuellement renforçants.

**Conclusion** : ne pas chercher à supprimer la friction. La nommer, la traiter, en sortir un artefact durable.

### 4.3 L'IA collaborative requiert un human-in-the-loop **discipliné**

Pendant la semaine, plusieurs fois j'ai poussé pour avancer "avec mon jugement". À chaque fois c'était la mauvaise idée :
- Tentation de choisir Next.js sans PD-002.
- Tentation de paralléliser intra-Slice sans audit.
- Tentation de classer les Specs `Pure sync` sans question.

L'utilisateur a joué le rôle de stop-sign à chaque fois. C'est exactement la friction décrite en 4.2.

**Conclusion** : sans un humain qui dit "non, formalise" / "non, attends mon input", l'IA dérive sur les axes 1.1, 1.2, 1.3, 1.4.

### 4.4 La documentation **est** le produit pendant la phase macro

0 ligne de code produite cette semaine. Mais 10 FA + 14 Slices + 16 US + 16 Specs + 7 PDs + 5 fichiers gouvernance + 5+ notes d'audit. **Cette documentation est le produit livré cette semaine.** Le code est l'objectif final, mais la documentation est le pré-requis non-négociable.

Sans cette base, le code aurait été écrit avec :
- Une stack non validée.
- Tout en REST sync.
- Sans contrats event explicites.
- En série dans un seul vertical au lieu de 6 en parallèle.

---

## 5. Matériel concret citable / paraphrasable

Ces points sont prêts à être réécrits dans le rapport. Chiffres + faits vérifiables.

| Affirmation | Source de vérité |
|---|---|
| 16 Specs produits, 0 ne mentionnait `webhook` / `cron` / `stream` / `SSE` / `WS` / `queue` avant l'audit. | `docs/prd/notes/2026-05-25-async-architecture-audit.md` |
| 5 zones critiques manquaient (LLM streaming, Stripe webhook, credit event consumer, mailer queue, cleanup cron). | Idem, §"Zones critiques non couvertes". |
| 3 contrats event cross-Spec étaient implicites, formalisés en re-promote pass. | `docs/prd/notes/2026-05-25-async-repromote-pass.md` |
| Sur la Slice pilote (3 US), parallélisation naïve = 3 enveloppes incompatibles ; réel = 2 US codables en parallèle après freeze de la 1re. | `docs/prd/notes/2026-05-25-intra-slice-parallelization-audit.md` |
| 6 FA `delivery-ready` sur 10 ; 2 bloquées DR-04 par cascade (`payments` ← `credit-system`, `question-history` ← `guided-clarification`) ; 2 `exploratory` bloquées `NEED_HUMAN`. | `docs/WORK_QUEUE.md` §1 |
| 7 PDs total : PD-001 (méthodo post-slice), PD-002 (stack), PD-003/004/005 (crédit), PD-006 (gate delivery-ready), PD-007 (async, `approved` 2026-05-25). | `docs/product-decisions/` |
| 4 garde-fous mutuellement renforçants contre le biais REST-sync : template + checker SP-15 + Spec Critic §4 + PD-007. | `.cursor/templates/product/spec.template.md`, `.cursor/checkers/scope-readiness-checker.md` SP-15, `.cursor/agents/spec/spec-critic.md` §4, `docs/product-decisions/PD-007-async-event-baseline.md` |
| 0 ligne de code produite. 100% de la semaine = méthodo + macro + garde-fous. | Repo entier (pas de fichier sous `src/`, `app/`, `lib/` hors `.cursor/` et `docs/`). |
| 15 Specs sur 16 sont `NEED_HUMAN=false` après ratification PD-007. Le dernier (`question-history/consult/001`) reste flaggé par B-002 (provider AI undecided), pas par PD-007. | `docs/WORK_QUEUE.md` §3 |

---

## 6. Ce qu'il faut ne PAS dire dans le rapport

Pour éviter le bois et la sur-promesse :

- **Ne pas dire** "l'IA a généré une PRD complète et exploitable en une semaine". → Dire : "l'IA a généré une PRD + chain de 6 niveaux d'artefacts en une semaine, avec X garde-fous explicites pour casser ses Y biais documentés. Le code reste à écrire."
- **Ne pas dire** "PD-007 est notre stack async définitive". → Dire : "PD-007 est `approved` 2026-05-25 (Postgres+Redis, `pg-boss`, Vercel Cron, SSE, `LISTEN/NOTIFY`). Reversibility matrix explicite avec triggers observables".
- **Ne pas dire** "le workflow parallélise tout". → Dire : "le workflow parallélise entre FA delivery-ready (6 FAs identifiées). Intra-Slice, l'audit révèle un couplage non automatisé qui force des séquences. 3 follow-ups identifiés."
- **Ne pas dire** "Zedos est prêt pour le dev". → Dire : "15 Specs sur 16 sont codables maintenant sans clarif. 1 reste flaggé NEED_HUMAN sur sa write side (`question-history`, dépend de B-002). 5 zones async (Z1..Z5) attendent leur FA owner d'être unblocked. La verticale `account-session` est le candidat naturel pour la première PR."

---

## 7. Tableau de synthèse final

| Sujet | Réponse honnête (à reformuler dans le rapport) |
|---|---|
| Faisabilité des plans IA-générés | Sur la forme, oui : artefacts cohérents, terminologie stable, chains respectées. Sur le fond, 4 dérives systémiques (stack inventée, REST sync par défaut, sérialisation, contrats implicites) ont demandé 4 corrections explicites. Faisabilité = oui **avec** les garde-fous, pas sans. |
| Cohérence | Pas nativement. La cohérence est venue de la couche de checks (SISO, checkers, Spec Critic, PDs forward-only). Sans cette couche, on aurait eu 5+ stacks, 3 enveloppes d'erreur, et 0 mention async. |
| Comment ça a été rendu cohérent | 7 PDs (dont PD-006 et PD-007 nés en cours de semaine), 1 nouveau check (SP-15), 1 extension Spec Critic (§4), 1 vue gouvernance (WORK_QUEUE.md + 4 compagnons), 2 audits documentés (async + intra-Slice). Le tout sans casser les artefacts existants (forward-only). |

---

**Fin du matériel brut.**
