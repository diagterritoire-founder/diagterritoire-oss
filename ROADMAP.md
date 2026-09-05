# Feuille de route DiagTerritoire

## v0.2.0 — Consolidation du parcours territorial

**Statut : cadrage**

La version `v0.2.0` vise à consolider les capacités déjà présentes dans
DiagTerritoire afin de disposer d'un parcours territorial cohérent,
testable et reproductible.

Cette version ne vise pas à augmenter le nombre de modules de la plateforme.

## Objectif principal

Transformer les briques déjà disponibles en un parcours territorial de
référence dont le comportement peut être vérifié automatiquement avant
publication.

Le parcours cible est :

**territoire → analyse → diagnostic → prospective → restitution**

## Périmètre

### 1. Parcours territorial de référence

Consolider le chemin fonctionnel permettant :

- de sélectionner un territoire ;
- d'afficher sa fiche territoriale ;
- de produire son analyse ;
- d'obtenir son diagnostic ;
- d'exposer ses projections et alertes ;
- de générer sa restitution ou son rapport.

Le parcours doit conserver les niveaux territoriaux actuellement pris en
charge sans élargissement géographique dans cette version.

### 2. Tests automatisés

Introduire un premier socle de tests reproductibles portant prioritairement
sur les éléments métier critiques.

Les premiers tests doivent couvrir notamment :

- le moteur de diagnostic ;
- l'orchestration de l'intelligence territoriale ;
- l'analyse d'un territoire connu ;
- le traitement d'un territoire inconnu ;
- les principaux cas limites identifiés pendant la consolidation.

Les outils déjà présents dans le projet doivent être privilégiés avant
l'introduction d'une nouvelle dépendance de test.

### 3. Cohérence du moteur métier

Identifier l'implémentation canonique du moteur de diagnostic.

Les implémentations anciennes ou dupliquées ne doivent être supprimées
qu'après vérification de leurs références et de leur comportement.

Les contrats utilisés par les pages, services et API doivent rester cohérents.

### 4. Contrats et erreurs

Stabiliser les comportements observables des services et API utilisés par le
parcours territorial de référence.

Les erreurs doivent être explicites et prévisibles, notamment pour :

- un territoire inexistant ;
- une donnée indisponible ;
- une requête non autorisée ;
- une impossibilité de produire l'analyse demandée.

### 5. Validation de publication

La version `v0.2.0` ne pourra être publiée qu'après validation adaptée du
commit destiné à être tagué.

Les contrôles comprennent selon leur applicabilité :

- installation reproductible ;
- tests automatisés ;
- contrôle du diff ;
- génération Prisma ;
- audit des dépendances ;
- Dependabot ;
- CodeQL.

Aucune variable d'environnement fictive ne doit être créée uniquement pour
faire réussir une validation.

## Hors périmètre de v0.2.0

Ne font pas partie de cette version :

- l'ajout d'un nouveau grand module métier ;
- l'extension du pilote à une nouvelle région ou un nouveau département ;
- une refonte générale de l'interface ;
- une réécriture globale de l'architecture ;
- le remplacement de la pile technique existante ;
- l'ajout d'une dépendance sans besoin démontré ;
- une refonte complète de l'authentification ;
- l'intégration massive de nouvelles sources de données.

Les fonctionnalités déjà présentes hors du parcours de référence doivent
rester compatibles, mais leur extension n'est pas un critère de sortie de
`v0.2.0`.

## Critères de sortie

La version pourra être considérée comme candidate à publication lorsque :

1. le parcours territorial de référence fonctionne de manière cohérente ;
2. les comportements métier critiques disposent de tests automatisés ;
3. le moteur de diagnostic ne présente plus d'implémentation ambiguë ;
4. les erreurs principales sont couvertes et documentées ;
5. aucune régression connue bloquante n'est introduite ;
6. les dépendances de sécurité sont dans un état acceptable et documenté ;
7. CodeQL est validé sur le commit candidat ;
8. le changelog décrit précisément les changements effectivement livrés.

Le tag `v0.2.0` ne doit être créé qu'après validation du commit final sur
`main`.
