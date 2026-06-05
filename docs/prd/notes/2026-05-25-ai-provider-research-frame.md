# AI provider research frame — for B-002 (FA:guided-clarification)

> **Statut** : matériel de cadrage. **Ne résout PAS B-002.** Cadre la prochaine décision avec les axes à arbitrer, des estimations grossières, et les hypothèses à valider.
> **Date** : 2026-05-25
> **Trigger** : Q11 = (e) "Autre / je veux comparer plus en détail (latence, prix, EU compliance, etc.)" de la review batch H-3 / H-4.
> **Sortie attendue** : un PD-011 ratifié qui ferme B-002 + débloque `FA:guided-clarification` + Z1 (LLM streaming Spec).

---

## Pourquoi B-002 est plus dur que ça en a l'air

La question "quel provider LLM pour Zedos v0 ?" superpose 4 décisions distinctes :

1. **Vendeur** : OpenAI / Anthropic / Mistral / Google / Cohere / autre.
2. **Modèle** : gros (Sonnet, GPT-4o, Mistral Large) vs petit (Haiku, GPT-4o-mini, Mistral Small).
3. **Mode de provisioning** : direct API du vendeur / aggregator (OpenRouter, Vercel AI Gateway) / proxy maison.
4. **Architecture multi-provider** : single-vendor lock-in vs router type pluggable.

Beaucoup de notes online conflatent ces 4 décisions en une. Le pré-requis : les séparer pour pouvoir trancher.

PRD constraint actuelle : *« managed AI inference, no BYOK »*. Ça exclut le self-hosted (Ollama, vLLM), pas le multi-provider via aggregator.

---

## Les 6 axes à arbitrer

### Axe 1 — Qualité sur les tâches Zedos

Les tâches LLM v0 (déduites des Specs + PRD) :

| Tâche | Volume estimé v0 | Difficulté | Latence sensible ? |
|---|---|---|---|
| Question de clarification courte (1 question) | Élevé | Basse | Oui — streaming UX |
| Génération de PRD complet | Modéré | Haute | Oui — long stream attendu |
| Convergence / challenge d'un PRD existant | Modéré | Haute | Modérée |
| Dynamic mini-form decision step | Élevé | Moyenne | Oui — UX rapide |
| Résumé / extraction de structure | Faible | Basse | Non |

Implication : un modèle qui rate la "génération PRD complète" est rédhibitoire. Les tâches courtes sont moins discriminantes.

**Évaluation à faire** : 5 prompts représentatifs de chaque tâche × 3-4 candidats modèles, scorés manuellement (qualité d'extraction, cohérence, complétude). 2 heures de boulot.

### Axe 2 — Prix par opération (mappé sur PD-003 burn tiers)

PD-003 dit "1 crédit = 1 op standard, 10 crédits = génération PRD complète, 15 crédits = challenge". Si on cible un prix de revient à ~20% du prix de vente d'un pack 100 crédits = 20€ (hypothèse), on a :

- Pack 100 = 20€ payés
- Coût-vérité accepté = 4€ par 100 crédits = **~0.04€ par crédit moyen**.
- Donc "génération PRD complète" (10 crédits) peut coûter jusqu'à **0.40€**.

Estimations grossières par modèle pour une génération PRD ~5k input tokens / 3k output tokens :

| Modèle | Input $/1M | Output $/1M | Coût estimé / génération PRD | Verdict |
|---|---|---|---|---|
| Claude Sonnet 4.5 | ~3 | ~15 | ~$0.06 = ~0.055€ | OK |
| GPT-4o | ~2.5 | ~10 | ~$0.04 = ~0.037€ | OK |
| GPT-4o-mini | ~0.15 | ~0.6 | ~$0.003 = ~0.003€ | Trop bas-de-gamme pour PRD ? À tester. |
| Mistral Large 2 | ~2 | ~6 | ~$0.03 = ~0.028€ | OK |
| Mistral Small 3 | ~0.2 | ~0.6 | ~$0.003 | À tester pour clarif courte. |

**Tous les candidats sérieux** rentrent dans l'enveloppe budget v0. Le prix n'est PAS le critère bloquant ; la qualité l'est.

Hypothèse à valider : marge brute viable à 80% sur les packs. Si le user vise une marge différente, recalculer.

### Axe 3 — Latence + streaming

PD-007 §1 a tranché : SSE Next.js. Tous les providers retenus doivent supporter le streaming SSE.

| Provider | Streaming SSE natif ? | TTFT typique (Time-To-First-Token) | Throughput tokens/sec typique |
|---|---|---|---|
| OpenAI | Oui | ~300-600 ms | 50-100 |
| Anthropic | Oui | ~400-700 ms | 60-90 |
| Mistral | Oui | ~250-500 ms (EU si EU-hosted) | 40-80 |
| Google (Gemini) | Oui | ~300-500 ms | 50-100 |

**Pas de différence rédhibitoire**. Le ressenti UX dépendra surtout du heartbeat (PD-007 §1 = 15s) et du time-to-first-paint côté client, pas du provider.

### Axe 4 — Compliance EU / RGPD

C'est le critère qui peut casser des options entières.

| Provider | Données dans l'UE ? | DPA disponible ? | Sub-processors listés ? | Verdict |
|---|---|---|---|---|
| OpenAI (US direct API) | Non par défaut — data residency EU en option payante | Oui | Oui | Acceptable avec data residency activé |
| Anthropic (US direct API) | Non par défaut — pas d'option EU residency publique à date | Oui | Oui | Plus risqué pour ops EU strictes |
| Mistral (EU-hosted) | Oui par défaut | Oui | Oui | Best-in-class pour RGPD |
| Google Gemini | Mixte selon région | Oui | Oui | Acceptable avec config EU |
| OpenRouter (aggregator) | Dépend du modèle sous-jacent | Partial — chaîne complète à vérifier | Indirect | À éviter pour data sensible |

**Si la cible "France/EU + US" du PRD implique des clients EU sensibles à la résidence des données** → Mistral pousse au-dessus. Sinon, OpenAI avec data residency EU activé est défendable.

À clarifier auprès du user : la cible v0 a-t-elle des clients explicitement RGPD-strict (santé, juridique, secteur public) ?

### Axe 5 — Lock-in et architecture (single vs multi)

| Option | Avantages | Coûts |
|---|---|---|
| **Single-provider direct API** | Le moins de surface. Type-safety du SDK officiel. | Si le provider change ses prix / supprime un modèle / a une panne 4h, on est exposés. |
| **Aggregator (OpenRouter, Vercel AI Gateway)** | Switch entre modèles en 1 ligne de config. Fallback automatique en cas de panne. | Latence +50-100ms typique. RGPD plus risqué (Axe 4). Coût marginal +5-10%. |
| **Multi-direct + abstraction maison** | Performance native + flexibilité. Pas de tiers. | Effort initial : 1-2 jours. Maintenance ongoing : tester N providers après chaque upgrade modèle. |

**Reco v0** : single-provider direct API. La flexibilité d'un aggregator vaut le coût quand on a déjà 10+ Specs LLM en prod ; v0 n'a pas ce volume. Architecture maison = over-engineering pour v0.

Lock-in mitigation côté code : tous les appels passent par **un seul module** `lib/ai/generate.ts` qui prend `messages, model, stream` et retourne `ReadableStream`. Le module wrappe le SDK du vendeur. Switch provider plus tard = réécrire ce module.

### Axe 6 — Maturité et écosystème

| Provider | Stabilité API | Évolutions destructives passées | Confiance pour 12 mois |
|---|---|---|---|
| OpenAI | Bonne, beaucoup de breaking changes mineurs | GPT-3.5/4/4o transitions difficiles | Bonne |
| Anthropic | Très stable | Très peu de breaking changes | Très bonne |
| Mistral | Stable mais jeune (~2 ans) | Quelques évolutions API | Bonne |
| Google Gemini | Volatil — APIs renommées | Beaucoup | Modérée |

Anthropic a la meilleure stabilité d'API observée. Pertinent pour un projet solo où chaque heure passée à fixer du SDK breaking est coûteuse.

---

## Décision recommandée (à valider par le user)

Si je devais trancher avec les axes ci-dessus et les contraintes connues, je proposerais :

**PD-011 candidate** :
- **Provider** : Anthropic (Claude Sonnet 4.5 pour les tâches lourdes, Haiku pour les tâches courtes — économie ~3x sur clarif courte).
- **Mode** : direct API officiel + SDK TypeScript officiel.
- **Architecture** : single-provider, module d'abstraction `lib/ai/generate.ts` pour limiter le lock-in.
- **EU compliance** : à valider avec Anthropic via DPA + sub-processor list. Si cible RGPD-strict est confirmée → pivoter vers Mistral.

**Pourquoi pas OpenAI ?** Stabilité API moins bonne, qualité comparable, mais GPT-4o mini peut être un meilleur deal sur Haiku-comparable.

**Pourquoi pas Mistral en premier choix ?** Qualité un cran en-dessous sur les tâches complexes (génération PRD long form). Si la cible est strictement EU, le compromis qualité→compliance vaut. Sinon Anthropic gagne.

**Pourquoi pas multi-provider via aggregator ?** Over-engineering v0.

**Pourquoi pas Gemini ?** Volatilité API jugée trop élevée pour solo founder.

---

## Questions à trancher pour fermer B-002

1. **Cible RGPD-strict v0 ?** Oui / Non. (Si oui → Mistral pousse. Si non → Anthropic ou OpenAI restent éligibles.)
2. **Budget marge brute ?** 80% (hypothèse implicite ci-dessus) ou autre ? Confirme la viabilité des modèles "gros" (Sonnet, GPT-4o, Mistral Large) vs forcer du "petit" (Haiku, GPT-4o-mini, Mistral Small).
3. **Tolérance lock-in ?** OK pour single-provider direct API ou besoin de pluggable d'entrée de jeu ?
4. **Veux-tu une éval qualitative pré-PD ?** Si oui : on construit 15-20 prompts représentatifs et on score manuellement Sonnet vs GPT-4o vs Mistral Large sur 2-3 heures. Coût : ~5-15€ d'API + 2h de ton temps. Bénéfice : décision documentée par des données.

---

## Prochain pas

Quand tu as répondu à ces 4 sous-questions, je rédige PD-011 (provider AI v0) qui :

- Ferme B-002.
- Débloque `FA:guided-clarification` (peut scaffolder slices).
- Débloque Z1 (LLM streaming Spec via PD-007 §1 SSE).
- Lifte le dernier `NEED_HUMAN=true` sur `question-history/consult/001` (producer-side `DecisionEntry` peut être designé).

État actuel : **non bloquant pour la verticale `account-session`**. Code commence sans cette décision.
