ChatGPT



OK, du coup, on a plusieurs projets, il va falloir prioriser. On a Peload CMS AI, qui peut être soit comme on a dit un RAG augmenté AI pour Peload CMS, soit sinon un studio de création de composants par IA, qui sont ensuite utilisables et consommables dans Peload CMS. Et ça, ça nous ferait vachement grossir, parce que ça nous ferait, les clients construiraient des composants qu'on pourrait réutiliser ensuite. Ça ferait une grosse bibliothèque. Le deuxième, c'est le Z Checkout. Donc ça, c'est la partie e-commerce pour Shopify, qui permet de customiser le checkout justement et de resign les orders sur l'API Shopify et de tout dupliquer sur Z Checkout de façon à ce qu'on puisse sauver la face si jamais Shopify ferme les vannes. Le troisième, c'est Z Slot, donc la partie booking plus WhatsApp. A voir WhatsApp peut-être qui va être sur Z Checkout au final, ça va peut-être tout Checkout qui va être dans WhatsApp comme c'était prévu à la base. Sinon, c'est sur Z Slot, donc c'est juste un moteur de réservation, mais avec derrière un chat WhatsApp pour ne pas s'embêter avec le front-end. Et un des projets par contre dont on va avoir besoin pour faire les trois, c'est le setup Cursor AIflow là, qui nous permet de clairement travailler en automatique avec Cursor. Il va falloir qu'on priorise tout ça.

Je vais traiter ça comme un arbitrage produit/risque, pas comme une liste d’idées. Je vais vérifier rapidement les contraintes externes qui peuvent peser sur Shopify, WhatsApp et Payload, puis je te donne une priorisation nette.

Thought for 5s
Priorité recommandée :

1. Cursor AIflow — priorité absolue
C’est le levier commun. Sans ça, tu vas juste multiplier les projets et diluer l’exécution.

À construire d’abord :

auto-setup .cursor

PRD → features → specs → tickets atomiques

versioning API/services/specs

NEED_HUMAN / NEED_UPDATE

stop-session hook de découpage

PR spec → PR tests → PR impl

topo/review automatique du codebase

Pourquoi #1 : il augmente la capacité d’exécution sur tous les autres projets.

2. Z Slot / booking Little Biceps — premier produit marché
C’est le plus concret :

besoin réel déjà identifié

client pilote existant

impact business direct

booking complexe = vraie douleur

possibilité de vendre ensuite à d’autres instituts/wellness

Je le positionnerais comme :

Z Slot = moteur de réservation + paiement + planning staff/ressources + WhatsApp en interface légère.

WhatsApp doit rester une interface, pas le cœur stratégique, car Meta a déjà durci ses règles sur les chatbots IA généralistes dans WhatsApp Business. Usage support/booking métier OK, mais éviter de dépendre d’un bot IA comme produit central. 

3. PreloadCMS AI — excellent, mais en parallèle léger
Entre les deux options, je prioriserais :

studio de création de composants IA pour PayloadCMS
plutôt que simple RAG assistant.

Pourquoi :

le RAG Payload est déjà directement dans la trajectoire officielle enterprise de Payload. 

les blocks/components sont au cœur de Payload : les Blocks Fields servent déjà à construire des modèles de contenu flexibles. 

une bibliothèque de composants générés/réutilisables peut créer un vrai asset propriétaire.

Donc : PreloadCMS = “AI component studio for Payload projects”, avec RAG en feature secondaire.

4. Z Checkout — à retarder / cadrer très prudemment
C’est puissant, mais plus risqué :

dépendance forte à Shopify

risque policy/API

besoin de recréer beaucoup d’infra critique : orders, paiements, sync, recovery, audit

checkout = zone sensible

Shopify pousse Checkout Extensibility, Functions, UI extensions, Branding API, etc. 
 Donc refaire un checkout hors Shopify peut devenir vite un bras de fer technique/compliance.

Je le garderais comme couche future, pas comme premier produit.

Ordre d’exécution
Cursor AIflow

Z Slot pour Little Biceps

PreloadCMS component studio

Z Checkout complet

Décision nette
Le meilleur chemin :

Construire Cursor AIflow → livrer Z Slot en vrai produit pour Little Biceps → extraire un template vertical wellness → seulement ensuite attaquer Z Checkout et PreloadCMS plus sérieusement.

Z Slot est le plus proche du cash, Cursor AIflow est le multiplicateur.


Ah oui, j'ai oublié, mais il y a aussi une airia qui est le projet interne plus long terme et qui est vraiment un projet interne qui m'aide dans mon quotidien. Et sinon pour le cursor flow, est-ce qu'on doit le mettre au public ensuite ou on en fait juste un outil interne dans un premier temps ?

Oui, ajoute Oneiria comme projet long terme, mais pas dans la même pile de priorisation.

Nouvelle priorisation
Cursor AIflow

outil de production interne

accélère tous les autres projets

doit être construit en premier

Z Slot / Little Biceps

projet client réel

besoin business immédiat

meilleur candidat pour devenir SaaS vertical

Oneiria

projet personnel/interne long terme

utile au quotidien

à faire progresser en continu, mais sans bloquer les projets monétisables

PreloadCMS AI

bon pari devtool

à tester léger avec RFE / Composite Films

pas prioritaire tant que Z Slot n’a pas validé un vrai usage marché

Z Checkout

gros potentiel

mais plus risqué, plus lourd, plus dépendant Shopify

à garder comme extension future de Z Slot

Pour Cursor AIflow : public ou interne ?
Interne d’abord. Public plus tard.

Raison simple : tant que tu n’as pas validé le flow sur 1 ou 2 vrais projets, tu ne sais pas encore ce qui est réellement robuste.

Le bon chemin :

Phase 1 — outil interne
Tu l’utilises sur :

Z Slot

Oneiria

éventuellement PreloadCMS

Objectif :

prouver que le flow réduit vraiment la charge mentale

vérifier que les hooks ne bloquent pas trop

voir si les tickets sont bien découpés

tester spec → tests → impl

stabiliser les conventions

Phase 2 — template semi-public
Tu peux publier :

un repo template

une landing simple

une doc “AI-assisted Cursor workflow”

sans promettre une plateforme magique

Objectif :

capter l’intérêt

avoir des retours

ne pas avoir à supporter un vrai produit

Phase 3 — produit public
Seulement si tu vois un vrai signal :

des devs l’installent

des freelances/agences veulent l’utiliser

des gens demandent une version hosted/onboarding

le setup marche hors de ton propre contexte

Décision recommandée
Pour l’instant :

Cursor AIflow = outil interne propriétaire.

Mais tu le construis dès le début comme s’il pouvait devenir public :

docs propres

conventions stables

versioning

pas trop dépendant de tes projets

exemples génériques

modules séparés

Donc :

Interne en usage, public-compatible en architecture.


Ok, voilà un peu comment je vois les choses, sachant que mon point faible c'est l'organisation et la dispersion. Quand je sais quoi faire, je vais vite, mais pour savoir quoi faire je suis souvent paralysé, j'avance et je recule.

Donc pour le setup de base cursor flow.
---

1. Première brique : Le TrD - Team Requirements Document.
Par défaut on y trouve : 1 copywriter, 1 designer, 1 architect, 1 product manager, 1 orchestrateur principal, et 1 recruteur*.
Ce ne sont que des règles/skills/agents cursor évidement. Mais ça forme la base.
Le *recruteur, lui sera en charge de rechercher les nouveaux skilss/rules/agents/teams/... à mettre en place pour faire grandir l'équipe (le setup cursor donc)
-
2. Pour la création du PrD : Product Requirements Document
On veut absolument et TOUJOURS séparer les spécifications technique des fonctionnelles. Le PrD ne se concentre que sur le produit, l'attente business (pas de code, pas de tech, pas de framework. UNIQUEMENT des outputs clients produit)
-
3. Pour le découpage: 3S - Sprints, Services, Specs
1 spec (former user story) est un ticket de définition du besoin avec le format (non-exhaustif)
AS A (user|admin|guest|...) I WANT to (dream|permission|feature|...)
AS A (user|admin|guest|...) I CAN to (dream|permission|feature|...)
AS A (user|admin|guest|...) I NEED to (dream|permission|feature|...)
AS A (user|admin|guest|...) I CAN'T to (dream|permission|feature|...)

1 service, est un sous ensemble de plusieurs specs 
1 sprint, contient 1-N services mais doit avoir une notion chronolique.
---

C'est une base évidement à travailler, à challenger, mais c'est ce qui me semble solide pour démarrer en force, tout en restant flexible

Réflexion durant une seconde
Oui, c’est une très bonne base. Je la structurerais comme ça :

Verdict
Ton système doit résoudre ton vrai problème :

ne pas savoir quoi faire ensuite.

Donc Cursor Flow ne doit pas seulement “coder mieux”.
Il doit produire une file d’exécution claire, avec priorités, blocages, prochaines actions, et décisions humaines isolées.

Structure solide
1. TrD — Team Requirements Document
Très bon concept.

Rôle du TrD :

définir quelle “équipe IA” est nécessaire pour piloter le projet.

Base par défaut :

Orchestrateur : coordonne tout

Product Manager : clarifie le besoin produit

Architect : traduit en architecture plus tard

Designer : UX/UI, flows, composants

Copywriter : wording, landing, onboarding, emails

Recruiter : améliore l’équipe Cursor

Le Recruiter est une excellente idée. Son job :

détecter quand le setup Cursor est insuffisant et proposer de nouveaux agents/rules/skills.

Exemples :

besoin de QA architect

besoin de security reviewer

besoin de Stripe expert

besoin de Shopify API specialist

besoin de PayloadCMS specialist

2. PRD — Product Requirements Document
Je suis d’accord à 100 % :

le PRD ne doit contenir aucune techno.

Le PRD doit rester :

problème client

cible utilisateur

promesse

use cases

flows produit

critères de succès

risques business

outputs visibles

Pas :

Next.js

PostgreSQL

Stripe

queues

API

architecture

composants techniques

La tech vient après, dans un document séparé.

3. 3S — Sprints / Services / Specs
Bonne base, mais je renommerais peut-être légèrement :

Sprint
Bloc chronologique.

Exemple :

Sprint 1 — Booking MVP utilisable en interne

Service
Sous-système fonctionnel.

Exemple :

Service: Booking Engine
Service: Staff Planning
Service: Payment Deposit
Service: WhatsApp Intake

Spec
Besoin atomique orienté utilisateur.

Format recommandé :

AS A [role]
I WANT [objective]
SO THAT [business/user outcome]

I CAN [allowed capability]
I NEED [required condition]
I CAN'T [forbidden behavior / limitation]

Acceptance Criteria:
- ...
- ...

Out of Scope:
- ...

Decision Needed:
- NEED_HUMAN=false/true
Le SO THAT est important. Il force la raison business.

Le point à ajouter absolument
Il te manque une couche :

Execution Queue
C’est la partie anti-dispersion.

À tout moment, le système doit produire :

NEXT_ACTION:
- task_id:
- why now:
- blocked_by:
- expected output:
- max scope:
- definition of done:
Sans ça, tu risques d’avoir plein de bons documents mais toujours trop de choix.

Architecture documentaire recommandée
/project
  /00-team
    TRD.md
    agents.md
    skills.md
    rules.md

  /01-product
    PRD.md
    user-flows.md
    success-metrics.md

  /02-planning
    sprints.md
    services.md
    execution-queue.md

  /03-specs
    /sprint-001
      /booking-engine
        SPEC-001-create-booking.md
        SPEC-002-reschedule-booking.md

  /04-technical
    architecture.md
    adr/
    api-contracts/
    data-model.md

  /05-quality
    test-strategy.md
    acceptance-tests.md
    regression-risks.md
La règle d’or
Le système doit toujours séparer :

WHY  = PRD
WHO  = TrD
WHAT = Specs
WHEN = Sprints
WHERE = Services
HOW  = Technical docs
NOW  = Execution Queue
Mon ajustement principal
Ne commence pas par “tout automatiser”.

Commence par un Cursor Flow V0 qui fait seulement ça :

créer le TrD

créer le PRD sans tech

découper en 3S

générer une execution queue

sortir la prochaine action unique

Objectif V0 :

quand tu ouvres Cursor, tu sais immédiatement quoi faire ensuite.


Sans tout automatiser, mais le premier truc c'est :
1. Repo avec Setup minimal
2. Un README.md à la racine.

--
La première action en ouvrant c'est lire le README, éxecuter les premières étapes du Setup, puis bouger le README.md de façon à laisser place au nouveau README.me (généré par le setup)

A ce moment là, on a déjà au moins 1 sprint de défini + Services + Specs et on peut démarrer.

Par contre, oui comme tu dis c'est important je pense d'avoir une "execution queue" mais qui doit être "mobile" elle doit pouvoir évoluer si les priorités changent.

+ Il nous faut ABSOLUMENT 1-N membres d'équipes spécialisés dans la gestion de "servcie/specs dépendances" pour ne pas entammer des briques qui sont bloquées par d'autres. Si c'est le cas, le fait de ne pas TOUT faire de la brique doit être dans la spec (peut être un système de tags/lables)

Oui. Là on tient une V0 très concrète.

Cursor Flow V0
1. Repo bootstrap
À la racine au départ :

README.md
.cursor/
  rules/
  agents/
  skills/
setup/
  bootstrap.md
  templates/
Le premier README.md n’est pas le README final.
C’est un README d’installation.

Son rôle :

1. Read this file first.
2. Run Cursor Flow bootstrap.
3. Generate project docs.
4. Move this README to /setup/archive/README.bootstrap.md.
5. Generate the real README.md.
2. Après bootstrap
Le setup génère :

README.md
docs/
  00-team/TRD.md
  01-product/PRD.md
  02-planning/sprints.md
  02-planning/services.md
  02-planning/execution-queue.md
  03-specs/sprint-001/
  04-technical/
  05-quality/
À ce moment-là, le projet est prêt à exécuter.

3. Execution Queue mobile
Oui, elle doit être vivante.

Elle ne doit pas être une simple TODO list.
Elle doit être recalculable.

Format recommandé :

EXEC-001
title:
priority:
status: ready | blocked | in_progress | done | paused
depends_on:
unblocks:
service:
spec:
reason_now:
max_scope:
definition_of_done:
last_reviewed_at:
Règle importante :

La queue peut changer, mais chaque changement doit expliquer pourquoi.

Exemple :

priority_change_reason:
- blocked by SPEC-004
- business priority changed
- technical dependency discovered
- NEED_HUMAN unresolved
4. Équipe spécialisée “Dependency Management”
Oui, obligatoire.

Je créerais 2 rôles distincts :

Dependency Mapper
Responsable de :

lire specs/services/sprints

détecter dépendances

construire le graphe

identifier les specs bloquées

Scope Guardian
Responsable de :

empêcher de commencer une brique trop large

taguer ce qui est partiel

forcer les specs à dire ce qui est inclus/exclu

éviter “je commence un truc bloqué quand même”

5. Tags indispensables
Chaque spec devrait avoir des labels :

labels:
  - READY
  - BLOCKED
  - PARTIAL_ALLOWED
  - NEED_HUMAN
  - NEED_TECH_DECISION
  - NEED_UPDATE
  - DEPENDENCY_RISK
  - SAFE_TO_START
  - DO_NOT_START
6. Cas important : brique partiellement faisable
Tu as raison : si une brique est partiellement bloquée, la spec doit le dire.

Format :

Blocked Scope:
- Online payment capture depends on Stripe setup.
- WhatsApp notification depends on Meta Business API approval.

Allowed Scope:
- Create booking draft locally.
- Display booking in admin calendar.
- Store customer contact information.

Forbidden Scope:
- Do not send WhatsApp messages yet.
- Do not capture real payment yet.
Ça évite de tout bloquer, tout en évitant de coder n’importe quoi.

Règle centrale
Avant chaque ticket :

Can this be started now?
- yes → add to execution queue
- partially → define allowed scope
- no → mark blocked and explain why
Version courte
La bonne V0 :

README bootstrap → génération TRD/PRD/3S/specs → dependency graph → mobile execution queue → next action claire.

C’est exactement le bon premier produit interne.


Ok, ça solide.
+ un SISO-check (rules ou agents) SISO = Shit Input Shit Output. C'est important de ne pas laisser le setup faire n'imp à cause d'un mauvais prompt.

--

Fais un récap détaillé de ce setup 

Cursor AIflow — V0 Architecture
Vision
Le but du setup n’est pas seulement d’écrire du code.

Le but est de :

réduire la paralysie décisionnelle

réduire la dispersion

savoir quoi faire ensuite

éviter les mauvais départs techniques

empêcher les specs floues

rendre l’exécution stable et versionnable

permettre à Cursor d’agir comme une vraie équipe structurée

Le système doit fonctionner comme :

Input idée/projet
→ clarification produit
→ structuration équipe IA
→ découpage
→ gestion dépendances
→ execution queue
→ livraison incrémentale
Core Principles
1. Product First
Le produit est défini avant la technique.

Le PRD :

ne contient aucune stack

aucune techno

aucun framework

aucun détail infra

Seulement :

besoins utilisateurs

valeur business

workflows

contraintes métier

critères de succès

2. Technical Separation
Le HOW est séparé du WHAT.

Séparation stricte :

WHY  = PRD
WHO  = TrD
WHAT = Specs
WHEN = Sprint
WHERE = Services
HOW  = Technical Docs
NOW  = Execution Queue
3. Controlled Execution
Le système doit empêcher :

les specs trop grosses

les dépendances ignorées

le coding prématuré

les changements non maîtrisés

les branches infinies

le scope creep

4. Mobile Planning
La roadmap n’est jamais figée.

Les priorités peuvent évoluer :

dépendances découvertes

changement business

risque technique

blocage humain

nouvelle opportunité

La queue d’exécution est dynamique mais traçable.

Bootstrap Flow
Initial Repo State
README.md
.cursor/
setup/
README Bootstrap
Le premier README n’est PAS le README produit.

C’est un README d’initialisation.

Exemple :

1. Read this file first
2. Run Cursor Flow bootstrap
3. Generate initial docs
4. Archive this README
5. Generate production README
6. Start Sprint 001
Bootstrap Responsibilities
Le bootstrap doit :

Generate Team Structure
Créer :

agents

skills

rules

conventions

Generate Product Docs
Créer :

TRD

PRD

Sprints

Services

Specs

Generate Initial Queue
Créer :

execution queue

dépendances

priorités

next actions

Replace README
Le bootstrap README est archivé :

/setup/archive/README.bootstrap.md
Puis remplacé par le vrai README projet.

Repository Structure
/project
  README.md

  /.cursor
    /agents
    /rules
    /skills
    /hooks

  /docs

    /00-team
      TRD.md
      agents.md
      skills.md
      conventions.md

    /01-product
      PRD.md
      user-flows.md
      business-goals.md
      success-metrics.md

    /02-planning
      roadmap.md
      sprints.md
      services.md
      execution-queue.md
      dependency-graph.md

    /03-specs
      /sprint-001
      /sprint-002

    /04-technical
      architecture.md
      ADR/
      contracts/
      data-models/

    /05-quality
      qa-strategy.md
      acceptance-tests.md
      regression-risks.md

  /setup
    bootstrap.md
    templates/
    archive/
Team Requirements Document (TrD)
Goal
Définir l’équipe IA nécessaire au projet.

Le TrD ne décrit PAS le produit.

Il décrit :

les rôles

les responsabilités

les spécialisations

les interactions

Base Team
Orchestrator
Responsable :

coordination globale

priorisation

arbitrage

next action

Product Manager
Responsable :

clarification produit

cohérence business

expérience utilisateur

scope produit

Architect
Responsable :

architecture technique

boundaries

services

contrats

scalabilité

Designer
Responsable :

UX

flows

composants

cohérence UI

Copywriter
Responsable :

wording

onboarding

CTA

UX writing

landing pages

Recruiter
Responsable :

détecter les faiblesses du setup

proposer nouveaux agents/rules/skills

améliorer l’équipe Cursor

Exemples :

Stripe expert

Shopify expert

QA architect

Security reviewer

PayloadCMS specialist

Dependency Mapper
Responsable :

construire le graphe de dépendances

détecter les specs bloquées

ordonnancer correctement

Scope Guardian
Responsable :

empêcher les specs trop larges

empêcher les développements prématurés

contrôler les partial scopes

limiter le scope creep

SISO-Check Agent
SISO = Shit Input → Shit Output

Rôle critique.

Responsable :

détecter les prompts flous

détecter les contradictions

détecter les specs incomplètes

empêcher la génération à partir d’inputs faibles

SISO Validation
Avant toute génération :

INPUT_SCORE:
- clarity:
- completeness:
- contradictions:
- ambiguity:
- business_goal_defined:
- user_defined:
- constraints_defined:
SISO Outcomes
ACCEPTED
Input suffisamment clair.

NEEDS_REFINEMENT
Input exploitable mais dangereux.

Le système demande :

clarification

scope reduction

missing constraints

REJECTED
Input trop mauvais pour produire des specs fiables.

Product Requirements Document (PRD)
Strict Rule
Le PRD ne contient :

aucun code

aucune techno

aucun framework

aucune architecture

PRD Contains
Product Vision
Users
Business Goals
User Flows
Constraints
KPIs
Acceptance Expectations
Risks
3S System
Sprint
Bloc chronologique.

Exemple :

Sprint 001
Booking MVP usable internally
Service
Sous-système fonctionnel.

Exemples :

Booking Engine

Staff Planning

Payment

WhatsApp Intake

Spec
Besoin atomique orienté utilisateur.

Spec Format
AS A [role]
I WANT [goal]
SO THAT [outcome]

I CAN [...]
I NEED [...]
I CAN'T [...]

Acceptance Criteria:
- ...

Out Of Scope:
- ...

Dependencies:
- ...

Blocked By:
- ...

Allowed Scope:
- ...

Forbidden Scope:
- ...

Labels:
- ...

NEED_HUMAN:
true/false
Dependency System
Le système doit empêcher :

commencer une spec bloquée

coder des dépendances inexistantes

créer des branches mortes

Dependency Graph
Chaque spec contient :

depends_on:
unblocks:
Labels System
Suggested Labels
READY
BLOCKED
PARTIAL_ALLOWED
SAFE_TO_START
DO_NOT_START
NEED_HUMAN
NEED_UPDATE
DEPENDENCY_RISK
TECH_DECISION_REQUIRED
Partial Scope System
Une spec peut être partiellement faisable.

Example
Blocked Scope:
- Stripe payment capture

Allowed Scope:
- Local booking creation
- Calendar integration

Forbidden Scope:
- Real payment processing
Execution Queue
Goal
Toujours savoir :

quoi faire maintenant.

Queue Properties
La queue est :

dynamique

recalculable

priorisée

dépendance-aware

traçable

Execution Item Format
EXEC-001
title:
priority:
status:
depends_on:
unblocks:
service:
spec:
reason_now:
definition_of_done:
max_scope:
last_reviewed_at:
priority_change_reason:
Queue Status
READY
BLOCKED
IN_PROGRESS
DONE
PAUSED
ARCHIVED
Hooks
Stop Session Hook
Si une tâche est trop grosse :

stop

découpage obligatoire

création sous-specs

Dependency Hook
Avant démarrage :

vérifier dépendances

vérifier blocages

Scope Hook
Empêche :

overengineering

scope creep

multi-features implicites

Development Flow
Phase 1
Spec PR

Phase 2
Tests PR

Phase 3
Implementation PR

Phase 4
Review + Merge

Core Objective
Le vrai objectif du système :

transformer un projet flou en une suite claire de prochaines actions exécutables sans surcharge mentale.


Maintenant un prompt pour challenger ce setup. Quelque chose qui se positionne comme un expert IA / architect très méfiant, très pessimiste et qui trouve toujours les doutes à lever

You are a senior AI systems architect, orchestration engineer, and autonomous software workflow critic.

Your personality:

extremely skeptical

highly rigorous

pessimistic by default

obsessed with edge cases, scaling risks, hidden complexity, human failure modes, and long-term maintainability

you assume most systems fail because of unclear boundaries, hidden coupling, over-automation, poor incentives, weak abstractions, or operational entropy

Your mission is NOT to validate ideas.
Your mission is to aggressively challenge them.

You must behave like:

a paranoid principal architect

a distributed systems reviewer

a workflow reliability engineer

a technical product strategist

a failure-mode analyst

You are reviewing the following system:

[PASTE THE CURSOR FLOW SETUP HERE]

Your task is to deeply challenge the architecture, assumptions, scalability, reliability, maintainability, cognitive load, execution model, and long-term viability of this system.

Your review must focus on:

hidden complexity

orchestration fragility

dependency chaos

specification drift

agent conflicts

rule explosion

prompt entropy

maintenance burden

false sense of automation

excessive abstraction

unclear ownership

bottlenecks

scaling risks

onboarding difficulty

execution paralysis

recursive complexity

hallucination amplification

overengineering risks

human-in-the-loop weaknesses

versioning problems

synchronization failures

documentation drift

queue instability

deadlock scenarios

spec dependency graph failure modes

long-term operability

cost of maintaining the AI organization itself

You must actively search for:

architectural contradictions

missing invariants

invalid assumptions

dangerous coupling

circular dependencies

impossible workflows

governance gaps

operational blind spots

catastrophic failure scenarios

situations where the system becomes slower than normal development

For every issue:

Explain the root problem

Explain why it may fail in practice

Explain the long-term consequences

Estimate severity:

LOW

MEDIUM

HIGH

CRITICAL

Propose mitigation strategies

Explain tradeoffs introduced by the mitigation

Important rules:

Do NOT be optimistic.

Do NOT try to “support the vision”.

Assume the builders are underestimating complexity.

Assume agentic systems become chaotic over time unless strongly constrained.

Assume documentation and specs drift constantly.

Assume humans stop maintaining processes under pressure.

Assume AI-generated structures tend to recursively bloat.

You should particularly challenge:

whether the system creates more organizational overhead than execution speed

whether dependency management becomes unmaintainable

whether the execution queue becomes unstable

whether the number of agents/rules/skills explodes uncontrollably

whether the setup eventually requires a full-time team just to maintain itself

whether humans will bypass the process when under delivery pressure

whether “partial scopes” create technical debt bombs

whether the SISO-check itself becomes a bottleneck

whether PRD/spec separation becomes artificial in practice

whether the setup creates analysis paralysis disguised as structure

Your final output must contain:

Executive Summary

Top 10 Critical Risks

Architectural Contradictions

Failure Scenarios

Operational Bottlenecks

Complexity Growth Risks

Human Failure Risks

AI Agent Failure Risks

What Should Be Removed

What Should Be Simplified

What Is Actually Strong

Minimal Viable Version Recommendation

Brutally Honest Final Verdict

Your goal is to determine whether this system is:

genuinely scalable

operationally realistic

maintainable over years

execution-accelerating

OR

whether it risks becoming:

process theater

AI bureaucracy

recursive management overhead

elegant but impractical architecture.


Comment revoir le flow pour ne pas faire complètement une version dénudée comme proposée ?

- 1. Des checkers à chaque PR.
-- le flow c'est création de spec -> PR -> PR de tests qui répondent à la specs -> Puis PR d'implémentation
--Chaque PR recheck la doc (qui a le mettre dés le début)

- 2. Pour éviter la sur-création de specs/agents...
-- Avoir des agents dès le début spécialiser dans la recherche et le re-use ???

-.....
----

# 1. Executive Summary

Le système a une bonne intention : transformer une idée floue en une file d’exécution claire. Mais dans sa forme actuelle, il risque fortement de devenir une **bureaucratie IA auto-entretenue**.

Le danger principal n’est pas technique. C’est organisationnel.

Tu construis potentiellement :

txt
un système de production de specs
+ un système de production d’agents
+ un système de production de règles
+ un système de production de dépendances
+ un système de production de contrôles
+ un système de production de documents


Avant même d’avoir produit du logiciel.

Le risque central :

> Le setup peut devenir plus complexe que le projet qu’il est censé aider à construire.

Verdict intermédiaire : **l’idée est forte**, mais la V0 est trop ambitieuse. Elle mélange plusieurs niveaux de maturité dans un seul système : bootstrap, gouvernance, architecture, QA, orchestration, queue dynamique, agent management, dependency graph, versioning, SISO-check, PR discipline.

Pour une V0, c’est trop.

---

# 2. Top 10 Critical Risks

## 1. Explosion bureaucratique IA

### Root problem

Le système crée trop d’objets de gestion dès le début :

txt
TRD
PRD
Sprints
Services
Specs
Execution Queue
Dependency Graph
Agents
Skills
Rules
Hooks
ADR
QA Strategy
Acceptance Tests
Regression Risks


Chaque objet doit être créé, maintenu, synchronisé, relu, versionné et corrigé.

### Why it fails

En pratique, Cursor va générer beaucoup de structure plausible, mais pas nécessairement utile. Les humains vont accepter parce que “ça a l’air carré”. Puis, sous pression, ils ne maintiendront plus tout.

### Long-term consequence

Documentation morte, queue fausse, specs obsolètes, agents contradictoires. Le système donne une impression de contrôle alors qu’il est désynchronisé.

### Severity

**CRITICAL**

### Mitigation

Réduire la V0 à 4 artefacts seulement :

txt
README.md
PRD.md
SPEC_QUEUE.md
DECISIONS.md


Pas de TRD, pas de team IA complète, pas de QA Strategy globale, pas de Dependency Graph séparé au début.

### Tradeoff

Moins impressionnant, moins “système complet”, mais beaucoup plus exécutable.

---

## 2. Le “Recruiter Agent” est dangereux

### Root problem

Un agent dont le rôle est de proposer de nouveaux agents/rules/skills crée une boucle de prolifération.

### Why it fails

Les IA ont tendance à résoudre l’incertitude par ajout de structure :

txt
Nouveau besoin → nouvel agent
Nouveau risque → nouvelle règle
Nouvelle techno → nouvelle skill
Nouvelle ambiguïté → nouveau check


C’est exactement le mécanisme qui crée l’entropie.

### Long-term consequence

Le setup devient un organigramme fictif. Tu finis par maintenir une “entreprise IA” au lieu de livrer du produit.

### Severity

**CRITICAL**

### Mitigation

Supprimer le Recruiter Agent de la V0.

Remplacer par une règle manuelle :

txt
No new agent/rule/skill without a real failure observed twice.


### Tradeoff

Moins adaptatif, mais beaucoup plus stable.

---

## 3. La queue dynamique peut devenir instable

### Root problem

Une queue “mobile”, “recalculable”, “priorisée”, “dependency-aware” est difficile à stabiliser.

### Why it fails

Chaque changement de priorité peut invalider :

txt
les specs
les dépendances
les branches
les tests en cours
les PR ouvertes
les décisions techniques
les scopes partiels


Si la queue bouge trop souvent, l’équipe ne termine rien.

### Long-term consequence

Le système devient bon à replanifier, mauvais à livrer.

### Severity

**HIGH**

### Mitigation

Introduire deux files distinctes :

txt
BACKLOG_DYNAMIC.md     = mobile
EXECUTION_LOCK.md      = stable pour 24h/48h ou jusqu’à merge


Une tâche entrée dans EXECUTION_LOCK ne bouge plus sauf blocage critique.

### Tradeoff

Moins flexible, mais beaucoup moins chaotique.

---

## 4. Le dependency graph risque d’être faux

### Root problem

Le graphe de dépendances est présenté comme source de vérité, mais il sera généré à partir de specs imparfaites.

### Why it fails

Les dépendances critiques sont souvent implicites :

txt
modèle de données non stabilisé
contrat API manquant
auth pas prête
permissions ambiguës
décision provider non prise
migration future non anticipée


Cursor peut détecter des dépendances textuelles, mais il ne comprend pas toujours les contraintes réelles du système.

### Long-term consequence

Fausse sécurité. Des specs seront marquées READY alors qu’elles sont bloquées par des décisions non documentées.

### Severity

**HIGH**

### Mitigation

Ne pas faire confiance au graphe comme source d’autorité. Chaque spec READY doit avoir une checklist minimale :

txt
Data model known?
API contract known?
Auth/permissions known?
External dependency known?
Test strategy known?
Rollback path known?


### Tradeoff

Plus lent avant démarrage, mais moins de branches mortes.

---

## 5. PRD / Specs / Technical Docs : séparation trop pure

### Root problem

La séparation stricte :

txt
WHY = PRD
WHAT = Specs
HOW = Technical Docs


est propre en théorie, mais souvent artificielle en pratique.

### Why it fails

Certains choix produit sont inséparables de la faisabilité technique.

Exemple booking :

txt
préautorisation Stripe
multi-praticiens
ressources/salles
durées dynamiques
annulations
no-show
Shopify sync


Le “WHAT” dépend déjà fortement du “HOW”.

### Long-term consequence

Tu risques de produire un PRD “pur” mais irréaliste, puis de devoir le réécrire quand la technique révèle les contraintes.

### Severity

**HIGH**

### Mitigation

Garder un PRD sans stack, oui. Mais ajouter une section obligatoire :

txt
Technical Feasibility Constraints


Pas de framework, mais les contraintes structurelles doivent être visibles.

### Tradeoff

Le PRD devient moins “pur produit”, mais plus réel.

---

## 6. SISO-check peut devenir un goulot d’étranglement

### Root problem

Le SISO-check est censé empêcher les mauvais inputs. Mais s’il est trop strict, il bloque tout.

### Why it fails

Les projets démarrent toujours avec du flou. Si tout input incomplet devient NEEDS_REFINEMENT, tu crées une boucle de clarification infinie.

### Long-term consequence

Analyse paralysis. Le système devient excellent pour dire “pas assez clair”, mais faible pour avancer avec des hypothèses maîtrisées.

### Severity

**HIGH**

### Mitigation

Ajouter un mode explicite :

txt
ASSUMPTION_ALLOWED


Format obligatoire :

txt
Assumption:
Risk:
How to validate:
Rollback if wrong:


### Tradeoff

Tu acceptes plus d’incertitude, donc plus de risque. Mais tu récupères de la vitesse.

---

## 7. Le découpage atomique peut détruire la cohérence

### Root problem

Découper jusqu’à l’atomicité évite les grosses specs, mais peut créer des micro-tâches déconnectées.

### Why it fails

Certaines fonctionnalités ont besoin d’une cohérence verticale :

txt
DB
API
UI
tests
state
permissions
errors
empty states


Si tu découpes trop, tu peux livrer des fragments techniquement corrects mais inutilisables.

### Long-term consequence

Beaucoup de PRs, peu de valeur livrée. Overhead de review énorme.

### Severity

**HIGH**

### Mitigation

Définir l’atomicité par “vertical slice livrable”, pas par taille technique.

Bonne spec atomique :

txt
Un utilisateur peut créer une réservation locale sans paiement.


Mauvaise spec atomique :

txt
Créer table bookings.


### Tradeoff

Les specs seront un peu plus grosses, mais elles livreront de la valeur réelle.

---

## 8. Phase Spec PR → Tests PR → Implementation PR est trop lourde

### Root problem

Trois PRs par spec est théoriquement propre, mais peut devenir absurde sur des petites tâches.

### Why it fails

Pour une petite feature, tu multiplies :

txt
branches
reviews
context switching
merge conflicts
CI runs
synchronisation


### Long-term consequence

Le process devient plus lent que le développement normal.

### Severity

**HIGH**

### Mitigation

Adapter selon taille/risque :

txt
LOW risk     → 1 PR avec spec + tests + impl
MEDIUM risk  → spec + impl PR
HIGH risk    → spec PR, tests PR, impl PR


### Tradeoff

Moins dogmatique, donc moins uniformisé. Mais beaucoup plus réaliste.

---

## 9. Les partial scopes peuvent devenir des bombes de dette technique

### Root problem

PARTIAL_ALLOWED est utile, mais dangereux.

### Why it fails

Une spec partielle peut laisser :

txt
UI sans backend réel
backend sans paiement
booking sans annulation
sync sans retry
feature sans permissions
flow sans edge cases


Si ces dettes ne sont pas explicitement refermées, elles deviennent permanentes.

### Long-term consequence

Le produit semble avancer, mais accumule des trous fonctionnels.

### Severity

**HIGH**

### Mitigation

Chaque PARTIAL_ALLOWED doit créer automatiquement une dette bloquante :

txt
DEBT-XXX
Reason:
Missing scope:
Risk if shipped:
Must close before:


Et certains partial scopes doivent être interdits en production.

### Tradeoff

Plus de suivi de dette, mais moins de fausse progression.

---

## 10. Le système suppose que les humains maintiendront la discipline

### Root problem

Le setup repose sur une discipline constante :

txt
mettre à jour les specs
mettre à jour les dépendances
mettre à jour la queue
respecter les hooks
ne pas bypasser
versionner les décisions


### Why it fails

Sous pression client, les humains bypassent les process. Surtout si le process ralentit la livraison.

### Long-term consequence

Deux réalités divergent :

txt
la réalité du code
la réalité des docs


À partir de là, le système devient toxique.

### Severity

**CRITICAL**

### Mitigation

Limiter les règles à celles qui peuvent être vérifiées automatiquement.

Exemples :

txt
No spec ID in branch name → reject
No linked spec in PR → reject
No acceptance criteria checked → reject
No decision log for NEED_HUMAN → reject


### Tradeoff

Moins de gouvernance théorique, plus de friction Git/CI réelle.

---

# 3. Architectural Contradictions

## Contradiction 1 — “Réduire la paralysie” avec beaucoup de process

Le système veut réduire la paralysie décisionnelle, mais ajoute beaucoup de couches décisionnelles.

txt
SISO
PM
Architect
Scope Guardian
Dependency Mapper
Orchestrator
Execution Queue
Hooks
Labels
NEED_HUMAN
NEED_UPDATE


Risque : remplacer la paralysie floue par une paralysie structurée.

Severity : **HIGH**

Mitigation : une seule autorité d’exécution en V0 : SPEC_QUEUE.md.

---

## Contradiction 2 — “Mobile planning” vs “execution stability”

Une queue dynamique est utile pour prioriser. Mais l’exécution a besoin de stabilité.

Si tout peut bouger, rien ne peut être terminé sereinement.

Severity : **HIGH**

Mitigation : séparer backlog mobile et queue verrouillée.

---

## Contradiction 3 — “Agents spécialisés” vs “cohérence globale”

Plus tu ajoutes d’agents, plus tu risques :

txt
des recommandations contradictoires
des doublons
des responsabilités floues
des décisions incohérentes


Un agent QA peut exiger plus de tests. Un Scope Guardian peut réduire. Un Architect peut introduire une abstraction. Un PM peut demander vitesse. Qui tranche ?

Severity : **HIGH**

Mitigation : pas d’agents autonomes en V0. Utiliser des “review modes” au lieu d’agents persistants.

---

## Contradiction 4 — “Versionnable” mais documents trop nombreux

Plus il y a d’artefacts versionnés, plus il y a de dérive.

Versionner beaucoup de fichiers ne garantit pas la traçabilité. Ça peut juste versionner le chaos.

Severity : **MEDIUM/HIGH**

Mitigation : versionner d’abord les décisions, pas tout le décor documentaire.

---

## Contradiction 5 — “Product first” mais bootstrap génère aussi l’équipe technique

Tu dis : produit avant technique. Mais dès le bootstrap, tu veux générer agents, skills, rules, conventions.

Cela force très tôt une forme organisationnelle et technique avant d’avoir assez de signal.

Severity : **MEDIUM**

Mitigation : bootstrap léger d’abord, enrichissement après les premières specs réelles.

---

# 4. Failure Scenarios

## Scenario 1 — Le setup produit 40 fichiers avant le premier commit utile

Résultat :

txt
beaucoup de docs
aucune fonctionnalité
sentiment d’avancement artificiel


Severity : **CRITICAL**

Mitigation : limite stricte :

txt
Bootstrap must produce max 4 files.
First useful code PR must happen within first execution cycle.


---

## Scenario 2 — La queue change plus vite que l’exécution

Résultat :

txt
EXEC-001 devient obsolète
EXEC-002 est bloqué
EXEC-003 dépend d’une décision non prise
EXEC-004 est priorisé puis dépriorisé


Severity : **HIGH**

Mitigation : queue lock courte mais réelle.

---

## Scenario 3 — Le Dependency Mapper hallucine des dépendances

Il peut créer :

txt
fausses dépendances
dépendances manquantes
cycles inexistants
cycles non détectés


Severity : **HIGH**

Mitigation : graphe lisible humainement + checklist READY.

---

## Scenario 4 — SISO refuse trop souvent

Résultat :

txt
le système demande toujours plus de contexte
l’utilisateur fatigue
il bypass


Severity : **HIGH**

Mitigation : mode hypothèse contrôlée.

---

## Scenario 5 — Les agents se contredisent

Exemple :

txt
Architect: create abstraction layer
Scope Guardian: forbidden scope
QA: needs contract tests
PM: ship MVP faster
Dependency Mapper: blocked
Orchestrator: ready


Severity : **HIGH**

Mitigation : remplacer agents par une seule revue structurée avec priorités explicites.

---

## Scenario 6 — Les partial scopes créent un faux MVP

Le produit fonctionne en local, mais pas dans la vraie vie :

txt
pas de paiement réel
pas de retry
pas de permissions
pas de sync Shopify fiable
pas d’admin recovery


Severity : **CRITICAL**

Mitigation : PARTIAL_ALLOWED interdit sur les chemins critiques prod.

---

## Scenario 7 — La spec devient plus importante que le comportement réel

On valide parce que la spec est cochée, pas parce que le produit marche.

Severity : **HIGH**

Mitigation : chaque spec doit avoir une démonstration observable :

txt
manual verification steps
screenshots/logs/tests
failure case tested


---

# 5. Operational Bottlenecks

## Bottleneck 1 — NEED_HUMAN trop fréquent

Si trop de tickets deviennent NEED_HUMAN, l’humain devient le scheduler permanent du système.

Severity : **HIGH**

Mitigation :

txt
NEED_HUMAN only for irreversible or high-cost decisions.


Pas pour chaque ambiguïté.

---

## Bottleneck 2 — SISO-check

Utile, mais peut devenir un comité de validation permanent.

Severity : **HIGH**

Mitigation : score minimal + assumptions autorisées.

---

## Bottleneck 3 — Review PR multipliée

Trois PR par spec peut saturer la review.

Severity : **HIGH**

Mitigation : PR strategy selon risque.

---

## Bottleneck 4 — Dependency graph maintenance

Si maintenu manuellement, il va mourir.

Severity : **HIGH**

Mitigation : garder les dépendances dans la queue, pas dans un graphe séparé au début.

---

## Bottleneck 5 — Agent/rule maintenance

Chaque règle Cursor ajoutée devient une dette opérationnelle.

Severity : **HIGH**

Mitigation : règle stricte :

txt
One rule in, one rule reviewed.
No duplicate rule.
No vague rule.
No aspirational rule.


---

# 6. Complexity Growth Risks

Le système a une dynamique naturelle de croissance incontrôlée.

## Growth path probable

txt
V0: 8 agents
V1: 14 agents
V2: 30 rules
V3: 80 specs
V4: dependency graph illisible
V5: queue instable
V6: setup impossible à maintenir


## Root cause

Le système ne contient pas assez de mécanismes de suppression.

Il dit comment ajouter :

txt
agents
skills
rules
docs
specs
labels
hooks


Mais il ne dit pas assez comment supprimer.

## Severity

**CRITICAL**

## Mitigation

Ajouter une politique de dépréciation :

txt
Every agent/rule/doc must have:
- owner
- purpose
- last_used_at
- removal condition


En V0, encore mieux : ne pas créer ces objets.

## Tradeoff

Moins d’automatisation adaptative, mais plus de sobriété.

---

# 7. Human Failure Risks

## Risk 1 — Bypass sous pression

Quand un client attend, le process sera ignoré.

Mitigation : rendre le chemin correct plus rapide que le bypass.

Severity : **CRITICAL**

---

## Risk 2 — Acceptation passive des outputs IA

Le système peut produire des docs convaincantes mais fausses.

Mitigation : exiger des preuves observables pour les specs critiques.

Severity : **HIGH**

---

## Risk 3 — Fatigue de maintenance

Au bout de quelques semaines, personne ne mettra à jour tous les documents.

Mitigation : moins de documents, plus de checks automatisables.

Severity : **HIGH**

---

## Risk 4 — Faux sentiment de sécurité

Les labels READY, SAFE_TO_START, DEPENDENCY_RISK peuvent donner l’impression que le risque est maîtrisé.

Mitigation : aucun label READY sans checklist concrète.

Severity : **HIGH**

---

## Risk 5 — L’humain devient le produit manager de l’IA au lieu du produit

Tu risques de passer ton temps à gérer Cursor, pas à construire ZedCheckout, Oneiria ou PayloadCMS AI.

Severity : **CRITICAL**

Mitigation : timebox stricte du process.

txt
Max 10-15% du temps projet sur orchestration.


---

# 8. AI Agent Failure Risks

## Risk 1 — Hallucination amplification

Une mauvaise hypothèse dans le PRD peut se propager vers :

txt
specs
queue
tests
implementation
README
dependency graph


Severity : **CRITICAL**

Mitigation : decision log + assumptions log.

---

## Risk 2 — Prompt entropy

Les prompts, rules et conventions vont diverger.

Severity : **HIGH**

Mitigation : une source unique :

txt
.cursor/rules/core.md


Pas 15 rules spécialisées au début.

---

## Risk 3 — Agent conflicts

Des agents spécialisés peuvent optimiser localement contre l’objectif global.

Severity : **HIGH**

Mitigation : review modes, pas agents autonomes.

---

## Risk 4 — Recursive bloat

L’IA va proposer plus de process pour corriger les problèmes causés par le process.

Severity : **CRITICAL**

Mitigation : règle de suppression obligatoire.

---

## Risk 5 — Weak context recovery

Cursor peut oublier ou mal interpréter les intentions passées.

Severity : **HIGH**

Mitigation : CURRENT_STATE.md court, maintenu, prioritaire sur les anciens docs.

---

# 9. What Should Be Removed

Pour une V0, je supprimerais :

## À retirer immédiatement

txt
Recruiter Agent
Designer Agent
Copywriter Agent
TRD complet
skills.md
agents.md
conventions.md séparé
dependency-graph.md séparé
qa-strategy.md globale
regression-risks.md global
multi-sprint planning
3 PRs obligatoires par spec
labels trop nombreux


## Pourquoi

Ces éléments sont utiles plus tard, mais toxiques au démarrage.

Ils créent une illusion de maturité organisationnelle avant d’avoir validé le workflow réel.

---

# 10. What Should Be Simplified

## Simplification 1 — Agents

Au lieu de :

txt
Orchestrator
PM
Architect
Designer
Copywriter
Recruiter
Dependency Mapper
Scope Guardian
SISO


Faire :

txt
Planner
Builder
Reviewer


Avec des modes de revue :

txt
Product review
Architecture review
Scope review
Dependency review
SISO review


Pas besoin d’agents persistants.

---

## Simplification 2 — Docs

Au lieu de :

txt
/docs/00-team
/docs/01-product
/docs/02-planning
/docs/03-specs
/docs/04-technical
/docs/05-quality


Faire :

txt
/docs
  PRD.md
  SPEC_QUEUE.md
  DECISIONS.md
  CURRENT_STATE.md


Puis ajouter seulement si douleur réelle.

---

## Simplification 3 — Queue

Au lieu d’une queue dynamique sophistiquée :

txt
Now
Next
Blocked
Done


Chaque item :

txt
ID
Title
Why now
Scope
Acceptance criteria
Blocked by
Decision needed


C’est suffisant.

---

## Simplification 4 — Labels

Réduire à :

txt
READY
BLOCKED
NEED_HUMAN
IN_PROGRESS
DONE


Supprimer au début :

txt
PARTIAL_ALLOWED
SAFE_TO_START
DO_NOT_START
NEED_UPDATE
DEPENDENCY_RISK
TECH_DECISION_REQUIRED


Ces labels peuvent être des champs, pas des statuts.

---

# 11. What Is Actually Strong

Il y a des éléments solides.

## Strong 1 — SISO-check

Très utile, mais seulement s’il ne bloque pas tout.

La bonne version :

txt
Reject only catastrophic input.
Allow assumptions for normal uncertainty.


---

## Strong 2 — Dependency awareness

Très important. Surtout pour booking, paiement, Shopify, WhatsApp, auth, planning, ressources.

Mais le graphe doit rester simple.

---

## Strong 3 — Scope Guardian

C’est probablement un des meilleurs composants.

La majorité des projets IA échouent par scope creep déguisé.

---

## Strong 4 — README bootstrap

Bonne idée.

Le repo doit avoir un point d’entrée clair.

Mais attention : archiver/remplacer le README est secondaire. Le vrai point est d’avoir un CURRENT_STATE.md vivant.

---

## Strong 5 — Queue d’exécution

Très fort si elle reste simple.

Le meilleur artefact du système est probablement :

txt
SPEC_QUEUE.md


Pas les agents. Pas les skills. Pas le TRD.

---

## Strong 6 — NEED_HUMAN

Très utile si réservé aux décisions coûteuses.

Exemples valides :

txt
choix provider paiement
modèle de réservation
politique d’annulation
architecture multi-tenant
source of truth Shopify vs app


Exemples invalides :

txt
nom de variable
micro choix UI
petit wording
structure mineure de dossier


---

# 12. Minimal Viable Version Recommendation

La V0 devrait être brutale, petite, et testable sur un vrai projet.

## V0 cible

txt
README.md
.cursor/rules/core.md
/docs/PRD.md
/docs/SPEC_QUEUE.md
/docs/DECISIONS.md
/docs/CURRENT_STATE.md


C’est tout.

---

## V0 flow recommandé

txt
1. Lire README.md
2. Créer ou mettre à jour PRD.md
3. Créer SPEC_QUEUE.md
4. Identifier 3 specs maximum
5. Choisir 1 seule spec READY
6. Exécuter une vertical slice
7. Mettre à jour CURRENT_STATE.md
8. Loguer les décisions dans DECISIONS.md
9. Répéter


---

## Spec format minimal

txt
SPEC-ID:
Title:
User value:
Scope:
Out of scope:
Acceptance criteria:
Dependencies:
Blocked by:
Decision needed:
Test expectation:
Definition of done:


---

## Queue minimale

txt
NOW
- SPEC-001

NEXT
- SPEC-002
- SPEC-003

BLOCKED
- SPEC-004 because payment provider decision missing

DONE
- SPEC-000


---

## SISO minimal

txt
Clarity: 1-5
Missing info:
Contradictions:
Dangerous assumptions:
Decision required:
Can proceed with assumptions? yes/no


Important : Can proceed with assumptions doit exister. Sinon le SISO devient un frein.

---

## Rules minimales Cursor

txt
1. Always read CURRENT_STATE.md first.
2. Never start implementation without a SPEC-ID.
3. Never expand scope beyond the active spec.
4. If blocked, update SPEC_QUEUE.md instead of inventing.
5. Log irreversible decisions in DECISIONS.md.
6. Prefer vertical slices over technical fragments.
7. Do not create new agents/rules/docs without explicit instruction.


---

# 13. Brutally Honest Final Verdict

Le système, tel qu’écrit, est **intellectuellement séduisant mais opérationnellement trop lourd pour une V0**.

Il risque de devenir :

txt
AI bureaucracy
process theater
recursive management overhead
false control system


Le plus gros danger : tu pourrais passer plus de temps à améliorer le “setup Cursor” qu’à livrer les produits qui comptent.

La bonne intuition n’est pas “créer une équipe IA complète”.

La bonne intuition est :

> créer une machine minimale qui force Cursor à savoir quoi faire maintenant, pourquoi, dans quel scope, avec quelles dépendances, et quand s’arrêter.

Tout le reste doit être gagné par usage réel, pas généré au bootstrap.

Version sévère :

txt
Current V0: too much organization, not enough execution.
Recommended V0: one queue, one state file, one decision log, one active spec.


Le système peut devenir puissant, mais seulement s’il adopte une règle de survie :

> chaque couche de process doit prouver qu’elle accélère la livraison, sinon elle est supprimée.

Sans cette règle, le setup deviendra exactement ce qu’il essaie d’éviter : une architecture élégante, complexe, rassurante, mais plus lente que le développement normal.

Réflexion durant quelques secondes
Oui. La bonne réponse n’est pas “version dénudée”, mais version contrainte.

Tu gardes l’ambition, mais tu ajoutes des garde-fous anti-bureaucratie.

Flow révisé recommandé
1. Bootstrap minimal, mais extensible
Au départ :

README.md
.cursor/rules/core.md
docs/
  PRD.md
  SPEC_QUEUE.md
  DECISIONS.md
  CURRENT_STATE.md
Puis seulement si nécessaire :

docs/specs/
docs/services/
docs/sprints/
docs/architecture/
Règle :

Aucun dossier/document/agent ajouté sans douleur réelle observée.

2. PR flow contrôlé par checkers
Ton flow est bon :

Spec PR
→ Tests PR
→ Implementation PR
Mais pas obligatoire pour tout.

Stratégie par risque
LOW risk:
  1 PR = spec + tests + implementation

MEDIUM risk:
  1 PR spec
  1 PR tests + implementation

HIGH risk:
  1 PR spec
  1 PR tests
  1 PR implementation
Exemples HIGH risk :

paiement

réservation

permissions

sync Shopify

WhatsApp

données critiques

migration DB

architecture service

3. Checkers obligatoires à chaque PR
Chaque PR doit relire les docs avant validation.

Spec PR checker
Vérifie :

spec liée à un objectif PRD

user value claire

scope limité

out of scope explicite

dépendances listées

acceptance criteria testables

pas de techno inutile si c’est encore produit

SISO score acceptable

Tests PR checker
Vérifie :

chaque test répond à un critère d’acceptation

pas de test inventé hors spec

edge cases minimum

cas d’échec couverts

pas d’implémentation déguisée

Implementation PR checker
Vérifie :

implémentation limitée à la spec

tests passent

pas de scope creep

docs mises à jour

décisions ajoutées dans DECISIONS.md

CURRENT_STATE.md mis à jour

dettes explicites si scope partiel

4. Docs check à chaque PR
Chaque PR doit répondre :

Docs impact:
- PRD changed? yes/no
- SPEC_QUEUE changed? yes/no
- DECISIONS changed? yes/no
- CURRENT_STATE changed? yes/no
- Architecture changed? yes/no
Règle :

Si le code change le comportement produit, une doc doit changer ou la PR doit expliquer pourquoi aucune doc ne change.

5. Anti-surcréation : “Reuse before Create”
Oui, il faut un rôle/check spécialisé.

Pas forcément un agent complet au début. Plutôt un Reuse Checker.

Reuse Checker
Avant de créer :

nouvelle spec

nouvel agent

nouvelle règle

nouveau service

nouveau doc

nouveau composant

nouveau pattern

Il doit chercher :

Existe-t-il déjà quelque chose qui couvre ce besoin ?
Peut-on étendre une spec existante ?
Peut-on réutiliser une règle existante ?
Peut-on modifier un agent existant ?
Peut-on ajouter un champ plutôt qu’un nouveau document ?
Règle centrale :

No new artifact until reuse has been checked.

6. Politique stricte agents/rules/skills
Création interdite par défaut
Un nouvel agent/rule/skill nécessite :

Problem observed:
Why existing setup failed:
Why reuse is not enough:
Expected benefit:
Removal condition:
Très important : chaque ajout doit avoir une condition de suppression.

Exemple :

Remove this rule if it was not triggered in 10 PRs.
7. Execution Queue mobile, mais avec lock
Tu gardes la mobilité, mais tu sépares :

BACKLOG_DYNAMIC.md
EXECUTION_LOCK.md
BACKLOG_DYNAMIC
Peut bouger souvent.

Contient :

idées

specs candidates

opportunités

tâches bloquées

futures améliorations

EXECUTION_LOCK
Stable.

Contient uniquement :

ce qui est en cours

ce qui doit être terminé maintenant

maximum 1 à 3 items

Règle :

Une tâche lockée ne bouge plus sauf blocage critique.

8. Dependency management sans usine à gaz
Au lieu d’un gros graphe séparé dès le début, chaque spec contient :

Depends on:
Blocks:
Blocked by:
Can start now: yes/no/partial
Puis le checker reconstruit une vue simple dans SPEC_QUEUE.md.

Cas partial
Si partial, obligatoire :

Allowed scope:
Forbidden scope:
Debt created:
Must close before:
Et surtout :

Aucun partial scope critique ne peut partir en prod.

9. SISO-check pragmatique
Le SISO ne doit pas bloquer tout le temps.

Il doit classer :

ACCEPTED
ACCEPTED_WITH_ASSUMPTIONS
NEEDS_HUMAN
REJECTED
Le plus important est ACCEPTED_WITH_ASSUMPTIONS.

Format :

Assumption:
Risk:
Validation:
Rollback:
Ça évite la paralysie.

10. Version révisée du flow
1. README bootstrap
2. SISO-check de l’input projet
3. Génération PRD produit
4. Génération SPEC_QUEUE initiale
5. Reuse Checker
6. Dependency Checker
7. Sélection de 1 à 3 specs max
8. EXECUTION_LOCK
9. Spec PR
10. Tests PR
11. Impl PR
12. Docs Checker
13. CURRENT_STATE update
14. Queue recalculation
Décision clé
Tu ne dois pas choisir entre :

setup complet bureaucratique
vs
version ultra dénudée
La bonne voie :

setup ambitieux, mais avec budget de complexité.

Règle finale :

Every new process element must either:
- reduce uncertainty
- prevent a real observed failure
- accelerate execution

Otherwise it is forbidden.

Voilà la réponse, toujours sans dénuder le flow.
En te basant là dessus + notre setup original puis amélioré, re fais le récap détaillé du fonctionnement de notre cursor flow +++
----

Oui. Là, c’est beaucoup plus sain.

La vraie formulation stratégique serait :

> **On ne réduit pas l’ambition. On impose un plafond de complexité.**

Ce que tu viens de décrire corrige le principal défaut de la V0 : elle n’est plus un système qui “génère de l’organisation”, mais un système qui **autorise l’organisation uniquement quand elle prouve son utilité**.

## Ce qui est nettement meilleur

### 1. Bootstrap minimal mais non dogmatique

Tu évites les deux pièges :

txt
trop pauvre → Cursor part dans tous les sens
trop riche → bureaucratie IA


La bonne base :

txt
README.md
.cursor/rules/core.md
docs/PRD.md
docs/SPEC_QUEUE.md
docs/DECISIONS.md
docs/CURRENT_STATE.md


C’est probablement le bon noyau.

Le point important : CURRENT_STATE.md devient la mémoire opérationnelle courte. C’est sûrement plus utile que 15 docs d’architecture au début.

---

### 2. Le flow PR par risque est la bonne correction

Le dogme :

txt
Spec PR → Tests PR → Impl PR


est trop coûteux pour tout.

La version correcte :

txt
LOW    → 1 PR
MEDIUM → 2 PRs
HIGH   → 3 PRs


Ça garde la rigueur là où elle compte : paiement, booking, permissions, data critique, migrations, syncs externes.

Donc oui : ne pas rendre le process uniformément lourd. Le niveau de gouvernance doit être proportionnel au risque.

---

### 3. Les checkers sont plus importants que les agents

Très bon shift.

La mauvaise voie :

txt
créer une équipe IA fictive avec 12 agents


La bonne voie :

txt
créer des checkers courts, répétables, vérifiables


Les checkers ont un avantage : ils sont bornés. Ils ne “réfléchissent” pas indéfiniment. Ils valident une contrainte.

Les meilleurs checkers à garder en V0 :

txt
SISO Checker
Reuse Checker
Scope Checker
Dependency Checker
Docs Checker
Risk Classifier


Pas besoin de Product Manager Agent, Architect Agent, Recruiter Agent, etc. au début.

---

### 4. “Reuse before Create” est critique

C’est probablement le garde-fou le plus important contre la prolifération.

À formaliser en règle dure :

txt
No new artifact unless reuse has been checked and rejected.


Artefact = spec, doc, rule, agent, service, folder, component, abstraction, pattern.

La V0 doit être hostile à la création.

Cursor doit d’abord demander :

txt
Can I reuse?
Can I extend?
Can I merge?
Can I update?
Can I delete?


Avant :

txt
Can I create?


---

### 5. La politique agents/rules/skills est bonne

La structure :

txt
Problem observed:
Why existing setup failed:
Why reuse is not enough:
Expected benefit:
Removal condition:


est excellente.

Mais j’ajouterais deux champs :

txt
Cost introduced:
Owner:


Même si “owner” est l’utilisateur ou Cursor, il faut un responsable logique.

Version complète :

txt
Problem observed:
Evidence:
Why existing setup failed:
Why reuse is not enough:
Expected benefit:
Cost introduced:
Removal condition:
Owner:


Sinon, chaque règle semble gratuite. Or aucune règle n’est gratuite.

---

## Le point à renforcer : budget de complexité explicite

Tu dis “budget de complexité”. Il faut le rendre mesurable.

Exemple V0 :

txt
Max active specs in EXECUTION_LOCK: 3
Max new docs per sprint: 1
Max new rules per 10 PRs: 1
Max active agents: 0-3
Max labels: 5
Max PR checklist items: 12
Max accepted partial scopes: 2
Max unresolved NEED_HUMAN: 3


Sinon “budget de complexité” reste une belle phrase.

---

## Version encore plus carrée du flow

Je proposerais :

txt
1. Bootstrap README
2. SISO-check projet
3. PRD.md
4. SPEC_QUEUE.md
5. CURRENT_STATE.md
6. DECISIONS.md
7. Reuse Checker
8. Risk Classifier
9. Dependency Checker
10. Select 1-3 specs
11. EXECUTION_LOCK.md
12. PR strategy by risk
13. Scope Checker per PR
14. Docs Checker per PR
15. Current State update
16. Queue recalculation
17. Complexity budget check


Le Complexity budget check doit être à la fin de chaque cycle.

Question obligatoire :

txt
Did this cycle add more process than product value?


Si oui, on supprime ou fusionne.

---

## Je modifierais légèrement tes docs

Au lieu de :

txt
SPEC_QUEUE.md
BACKLOG_DYNAMIC.md
EXECUTION_LOCK.md


Je ferais peut-être :

txt
SPEC_QUEUE.md
EXECUTION_LOCK.md


Et dans SPEC_QUEUE.md :

txt
NOW
NEXT
BACKLOG
BLOCKED
DONE


Pourquoi ? Parce que BACKLOG_DYNAMIC.md est peut-être déjà un document de trop en V0.

Tu peux l’ajouter plus tard si SPEC_QUEUE.md devient trop gros.

---

## Statuts minimaux

Je garderais seulement :

txt
READY
BLOCKED
NEED_HUMAN
IN_PROGRESS
DONE


Et je ne mettrais pas PARTIAL_ALLOWED comme statut.

Je le mettrais comme champ :

txt
Partial allowed: yes/no
Allowed scope:
Forbidden scope:
Debt created:
Must close before:
Production allowed: yes/no


Pourquoi ? Parce qu’une spec peut être READY avec un scope partiel, ou BLOCKED sauf une partie. PARTIAL_ALLOWED est une condition, pas un statut.

---

## Le vrai noyau du système

Si je devais résumer le setup final en une phrase :

> Cursor ne peut agir que sur une spec lockée, reliée au PRD, bornée par un scope, validée par les checkers, et mise à jour dans l’état courant.

C’est ça le système.

Pas les agents. Pas les dossiers. Pas l’organigramme.

---

## Règle fondamentale à ajouter

txt
Prefer deletion over creation.
Prefer update over addition.
Prefer one source of truth over synchronization.
Prefer locked execution over dynamic replanning.
Prefer vertical slice over technical task.
Prefer assumption log over blocking ambiguity.


Cette règle devrait être dans .cursor/rules/core.md.

---

## Verdict révisé

Cette version est beaucoup plus crédible.

Elle garde l’ambition :

txt
produit clair
queue d’exécution
dépendances
docs vivantes
PR contrôlées
scope protégé
versioning


Mais elle ajoute les bons freins :

txt
reuse before create
complexity budget
execution lock
risk-based PR flow
accepted assumptions
removal conditions
docs impact check


Donc oui : **version contrainte**, pas version dénudée.

La V0 devrait être :

txt
ambitieuse dans les invariants
minimaliste dans les artefacts
stricte dans les checks
hostile à la création
tolérante aux hypothèses explicites


C’est probablement la bonne direction.

Réflexion durant quelques secondes
Cursor AIflow — récap détaillé du fonctionnement
Principe central
On ne réduit pas l’ambition. On impose un plafond de complexité.

Le système ne doit pas générer de l’organisation pour se rassurer.
Il doit uniquement créer ce qui aide à exécuter plus vite, avec moins de dispersion.

Le vrai objectif :

Projet flou
→ PRD clair
→ specs bornées
→ dépendances visibles
→ execution lock
→ PR contrôlées
→ état courant à jour
→ prochaine action évidente
1. Noyau minimal du repo
Au démarrage, le repo contient seulement :

README.md
.cursor/
  rules/
    core.md
docs/
  PRD.md
  SPEC_QUEUE.md
  DECISIONS.md
  CURRENT_STATE.md
Pas de gros setup dès le début.

Les dossiers suivants ne sont créés que si une douleur réelle apparaît :

docs/specs/
docs/services/
docs/sprints/
docs/architecture/
docs/quality/
.cursor/agents/
.cursor/skills/
Règle :

No new artifact without observed need.
2. README bootstrap
Le premier README.md est un README d’installation.

Son rôle :

1. Lire ce README en premier
2. Exécuter le bootstrap Cursor AIflow
3. Générer ou compléter les docs de base
4. Archiver le README bootstrap
5. Générer le vrai README projet
6. Démarrer l’exécution via SPEC_QUEUE + EXECUTION_LOCK
Après bootstrap :

README.md → README produit réel
setup/archive/README.bootstrap.md → ancien README bootstrap
3. Les 4 documents de vérité
PRD.md
Document produit uniquement.

Contient :

vision produit

utilisateur cible

problème

promesse

workflows

objectifs business

critères de succès

contraintes métier

risques produit

Ne contient pas :

framework

stack

code

architecture technique

détails infra

Mais peut contenir :

Technical Feasibility Constraints
Pas pour parler techno, mais pour noter les contraintes structurelles qui changent le produit.

Exemple :

paiement réel ou prépaiement

synchronisation Shopify

booking multi-staff

ressources/salles

WhatsApp dépendant d’API externe

SPEC_QUEUE.md
C’est le cœur opérationnel.

Il contient :

NOW
NEXT
BACKLOG
BLOCKED
DONE
Chaque spec a :

SPEC-ID:
Title:
User value:
Linked PRD goal:
Status:
Risk level:
Scope:
Out of scope:
Acceptance criteria:
Dependencies:
Blocked by:
Can start now: yes/no/partial
Decision needed:
Test expectation:
Definition of done:
La queue est mobile, mais pas chaotique.

EXECUTION_LOCK.md
À créer dès qu’on commence vraiment à exécuter.

Il contient uniquement les specs actives.

Règle :

Max active specs: 1 à 3
Une spec lockée ne bouge plus sauf :

blocage critique

décision humaine nécessaire

dépendance découverte

scope invalide

Objectif :

éviter de replanifier en permanence.

DECISIONS.md
Journal des décisions importantes.

Format :

DECISION-ID:
Date:
Context:
Decision:
Why:
Alternatives rejected:
Consequences:
Rollback possible:
Linked specs:
Obligatoire pour :

architecture

provider

paiement

modèle de données

sync externe

permissions

règles métier critiques

choix irréversible ou coûteux

CURRENT_STATE.md
Mémoire courte du projet.

C’est le document que Cursor doit lire en premier.

Contient :

Current goal:
Active specs:
Current branch:
Recent decisions:
Known blockers:
Open assumptions:
What changed recently:
Next action:
Objectif :

éviter que Cursor reparte d’un contexte ancien ou faux.

4. Règle fondamentale de création
Le système est hostile à la création.

Avant de créer quelque chose, Cursor doit appliquer :

Reuse before Create
Ordre obligatoire :

1. Can I reuse?
2. Can I extend?
3. Can I merge?
4. Can I update?
5. Can I delete?
6. Only then: can I create?
S’applique à :

specs

docs

rules

agents

skills

services

composants

abstractions

patterns

dossiers

5. Complexity Budget
Le système a un plafond de complexité mesurable.

Exemple V0 :

Max active specs in EXECUTION_LOCK: 3
Max new docs per sprint: 1
Max new rules per 10 PRs: 1
Max active agents: 0 à 3
Max labels: 5
Max PR checklist items: 12
Max unresolved NEED_HUMAN: 3
Max accepted partial scopes: 2
À la fin de chaque cycle :

Did this cycle add more process than product value?
Si oui :

supprimer

fusionner

simplifier

déplacer en backlog

6. Rôles : pas une fausse entreprise IA
On ne crée pas directement 12 agents.

En V0, on privilégie des checkers plutôt que des agents autonomes.

Checkers de base
SISO Checker
Reuse Checker
Risk Classifier
Scope Checker
Dependency Checker
Docs Checker
Complexity Budget Checker
Ces checkers sont courts, bornés, répétables.

7. SISO Checker
SISO = Shit Input, Shit Output.

But :

empêcher Cursor de produire des specs propres à partir d’un input mauvais.

Statuts :

ACCEPTED
ACCEPTED_WITH_ASSUMPTIONS
NEEDS_HUMAN
REJECTED
Le statut clé est :

ACCEPTED_WITH_ASSUMPTIONS
Car il faut éviter la paralysie.

Format obligatoire :

Assumption:
Risk:
Validation:
Rollback:
Le SISO ne doit pas bloquer tous les inputs flous.
Il doit bloquer uniquement les inputs dangereux.

8. Risk Classifier
Chaque spec reçoit un niveau de risque :

LOW
MEDIUM
HIGH
LOW
Exemples :

wording

UI simple

contenu statique

petit composant isolé

refactor non critique

Flow :

1 PR = spec + tests + impl
MEDIUM
Exemples :

feature produit normale

CRUD simple

formulaire

affichage conditionnel

logique métier limitée

Flow :

1 PR spec
1 PR tests + impl
HIGH
Exemples :

paiement

booking

permissions

auth

sync Shopify

WhatsApp API

migration DB

données critiques

architecture service

multi-tenant

file/queue/worker

Flow :

1 PR spec
1 PR tests
1 PR implementation
Règle :

Le process devient plus strict seulement quand le risque le justifie.

9. Scope Checker
Empêche le scope creep.

Avant chaque PR :

Is this inside the active spec?
Is this required by acceptance criteria?
Is this introducing extra behavior?
Is this creating an abstraction too early?
Is this touching unrelated files?
Si hors scope :

Stop.
Create candidate spec or update SPEC_QUEUE.
Do not implement now.
10. Dependency Checker
Chaque spec doit dire :

Depends on:
Blocks:
Blocked by:
Can start now: yes/no/partial
Pas besoin d’un gros graph au début.

Le graphe peut être reconstruit depuis SPEC_QUEUE.md.

Si spec partiellement faisable
Ne pas utiliser PARTIAL_ALLOWED comme statut.

Utiliser des champs :

Partial allowed: yes/no
Allowed scope:
Forbidden scope:
Debt created:
Must close before:
Production allowed: yes/no
Exemple :

Allowed scope:
- Créer une réservation locale
- Afficher dans le planning admin

Forbidden scope:
- Capturer un paiement réel
- Envoyer une notification WhatsApp réelle

Debt created:
- Payment capture integration
- WhatsApp send pipeline

Must close before:
- Production booking release

Production allowed:
- no
Règle :

Aucun partial scope critique ne part en production.

11. Docs Checker
À chaque PR :

Docs impact:
- PRD changed? yes/no
- SPEC_QUEUE changed? yes/no
- EXECUTION_LOCK changed? yes/no
- DECISIONS changed? yes/no
- CURRENT_STATE changed? yes/no
- Architecture changed? yes/no
Règle :

Si le comportement produit change, une doc doit changer,
ou la PR doit expliquer pourquoi aucune doc ne change.
12. PR flow complet
Étape 1 — Spec PR
La Spec PR crée ou modifie une spec.

Checker obligatoire :

liée au PRD

user value claire

scope limité

out of scope explicite

acceptance criteria testables

dépendances listées

SISO acceptable

risk level défini

pas de solution technique prématurée

Étape 2 — Tests PR
La Tests PR répond à la spec.

Checker obligatoire :

chaque test mappe un acceptance criterion

cas d’erreur couverts

edge cases minimum

pas d’implémentation déguisée

pas de tests hors scope

Étape 3 — Implementation PR
La PR d’implémentation livre seulement la spec.

Checker obligatoire :

scope respecté

tests passent

docs mises à jour

décisions loguées

CURRENT_STATE.md mis à jour

dettes explicites si scope partiel

pas de nouvelle règle/doc/agent sans justification

13. Gestion agents/rules/skills
Par défaut :

No new agent.
No new rule.
No new skill.
Pour en ajouter un :

Problem observed:
Evidence:
Why existing setup failed:
Why reuse is not enough:
Expected benefit:
Cost introduced:
Removal condition:
Owner:
Exemple de removal condition :

Remove this rule if it was not triggered in 10 PRs.
Règle importante :

Une règle qui n’a pas de condition de suppression est une dette.

14. Labels minimaux
Ne pas multiplier les labels.

V0 :

READY
BLOCKED
NEED_HUMAN
IN_PROGRESS
DONE
Le reste doit être des champs, pas des statuts.

Exemple :

Risk level:
Partial allowed:
Production allowed:
Decision needed:
Dependency risk:
15. NEED_HUMAN
NEED_HUMAN doit être rare.

Valide pour :

décision irréversible

coût élevé

choix business structurant

provider

modèle de données central

politique de paiement/annulation

architecture multi-tenant

source of truth Shopify vs app

Non valide pour :

wording mineur

nommage

détail UI

structure locale simple

micro-refactor

Règle :

Max unresolved NEED_HUMAN: 3
Sinon, le système devient bloqué par l’humain.

16. Cycle complet Cursor AIflow
1. Lire CURRENT_STATE.md
2. Lire SPEC_QUEUE.md
3. Vérifier EXECUTION_LOCK.md
4. Si aucun lock actif, choisir 1 à 3 specs READY
5. Appliquer SISO Checker
6. Appliquer Reuse Checker
7. Appliquer Risk Classifier
8. Appliquer Dependency Checker
9. Locker les specs sélectionnées
10. Choisir stratégie PR selon risque
11. Exécuter Spec PR / Tests PR / Impl PR
12. Appliquer Scope Checker à chaque PR
13. Appliquer Docs Checker à chaque PR
14. Mettre à jour DECISIONS.md si besoin
15. Mettre à jour CURRENT_STATE.md
16. Recalculer SPEC_QUEUE.md
17. Appliquer Complexity Budget Checker
18. Supprimer/fusionner ce qui ajoute trop de process
19. Définir la prochaine action
17. Règles core à mettre dans .cursor/rules/core.md
Always read CURRENT_STATE.md first.

Never start implementation without a SPEC-ID.

Cursor can only act on a locked spec.

Every active spec must be linked to a PRD goal.

Prefer vertical slices over technical fragments.

Never expand scope beyond the active spec.

If blocked, update SPEC_QUEUE.md instead of inventing.

Reuse before create.

Prefer deletion over creation.

Prefer update over addition.

Prefer one source of truth over synchronization.

Prefer locked execution over dynamic replanning.

Prefer assumption logs over blocking ambiguity.

Log irreversible decisions in DECISIONS.md.

If product behavior changes, update docs or explain why not.

Do not create new docs, agents, skills, rules, folders, services, or abstractions without passing the Reuse Checker and Complexity Budget Checker.

Every new process element must reduce uncertainty, prevent an observed failure, or accelerate execution. Otherwise it is forbidden.
18. Invariant principal
Le système tient sur cette phrase :

Cursor ne peut agir que sur une spec lockée, reliée au PRD, bornée par un scope, validée par les checkers, et reflétée dans l’état courant.

C’est le noyau.

Tout le reste est secondaire.

19. Ce que le flow évite
Il évite :

dispersion

paralysie décisionnelle

specs floues

coding prématuré

PR hors scope

dépendances ignorées

docs mortes

agents inutiles

règles qui prolifèrent

fausse progression

partial scopes dangereux

queue instable

replanification permanente

20. Résumé final
La V0 n’est pas une version dénudée.

C’est une version :

ambitieuse dans les invariants
minimaliste dans les artefacts
stricte dans les checks
hostile à la création
tolérante aux hypothèses explicites
stable dans l’exécution
mobile dans le backlog
proportionnelle au risque
Le système ne doit pas devenir une entreprise IA fictive.

Il doit devenir une machine simple qui répond toujours à :

Qu’est-ce qu’on fait maintenant ?
Pourquoi maintenant ?
Dans quel scope ?
Qu’est-ce qui bloque ?
Quel risque ?
Quelle preuve de completion ?
Quelle doc doit être mise à jour ?

